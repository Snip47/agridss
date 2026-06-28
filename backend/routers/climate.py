from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.database import get_db, Crop, Animal
from models.auth import get_current_user
from data.kenya_locations import KENYA_LOCATIONS, AEZ_DESCRIPTIONS
import json

router = APIRouter()

@router.get("/counties")
def get_counties():
    return sorted(list(KENYA_LOCATIONS.keys()))

@router.get("/constituencies")
def get_constituencies(county: str = Query(...)):
    if county not in KENYA_LOCATIONS:
        raise HTTPException(404, f"County '{county}' not found")
    return sorted(list(KENYA_LOCATIONS[county]["constituencies"].keys()))

@router.get("/wards")
def get_wards(county: str = Query(...), constituency: str = Query(...)):
    try:
        data = KENYA_LOCATIONS[county]["constituencies"][constituency]
        return sorted(data["wards"])
    except KeyError:
        raise HTTPException(404, "Location not found")

@router.get("/climate")
def get_climate(county: str = Query(...), constituency: str = Query(...), db: Session = Depends(get_db)):
    """Get climate profile + recommended crops & livestock for a location"""
    if county not in KENYA_LOCATIONS:
        raise HTTPException(404, f"County '{county}' not found")
    constituencies = KENYA_LOCATIONS[county]["constituencies"]
    if constituency not in constituencies:
        raise HTTPException(404, f"Constituency '{constituency}' not found in {county}")

    loc = constituencies[constituency]
    climate_code = loc["climate_zone"]
    aez_codes = [c.strip() for c in climate_code.split("-")]
    primary_aez = aez_codes[0]

    # Get AEZ description
    aez_info = AEZ_DESCRIPTIONS.get(primary_aez, {
        "name": climate_code, "rainfall": f"{loc['rainfall_mm']}mm",
        "altitude": f"{loc['altitude_m']}m",
        "description": loc.get("aez", "Agricultural zone")
    })

    # Match crops by AEZ
    all_crops = db.query(Crop).filter(Crop.is_active == True).all()
    matched_crops = []
    for c in all_crops:
        crop_aez = json.loads(c.suitable_aez or "[]")
        if any(a in crop_aez for a in aez_codes):
            if c.rainfall_min_mm <= loc["rainfall_mm"] <= c.rainfall_max_mm:
                if c.altitude_min_m <= loc["altitude_m"] <= c.altitude_max_m:
                    matched_crops.append({
                        "id": c.id, "name": c.name, "category": c.category,
                        "maturity_days": c.maturity_days,
                        "water_requirement": c.water_requirement,
                        "expected_yield": c.expected_yield,
                        "varieties": json.loads(c.varieties or "[]")[:3],
                    })

    # Match animals by AEZ
    all_animals = db.query(Animal).filter(Animal.is_active == True).all()
    matched_animals = []
    for a in all_animals:
        animal_aez = json.loads(a.suitable_aez or "[]")
        if any(az in animal_aez for az in aez_codes) or "All zones" in animal_aez:
            matched_animals.append({
                "id": a.id, "name": a.name, "category": a.category,
                "purpose": a.purpose,
                "breeds": json.loads(a.breeds or "[]")[:3],
            })

    # Planting calendar based on rainfall patterns
    dry_months = loc.get("dry_months", [])
    all_months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    wet_months = [m for m in all_months if m[:3] not in [d[:3] for d in dry_months]]

    return {
        "county": county,
        "constituency": constituency,
        "climate_zone": climate_code,
        "aez_name": aez_info.get("name", climate_code),
        "aez_description": aez_info.get("description", loc.get("aez", "")),
        "altitude_m": loc["altitude_m"],
        "rainfall_mm_annual": loc["rainfall_mm"],
        "temperature_range": loc["temp_range"],
        "soil_types": loc["soil_types"],
        "dry_months": loc.get("dry_months", []),
        "good_planting_months": wet_months[:6],
        "recommended_crops": matched_crops,
        "recommended_animals": matched_animals,
        "farming_advice": _get_farming_advice(climate_code, loc),
    }

def _get_farming_advice(aez_code: str, loc: dict) -> list:
    advice = []
    rain = loc["rainfall_mm"]
    alt = loc["altitude_m"]

    if rain < 600:
        advice.append("⚠️ Low rainfall area — prioritize drought-tolerant crops (sorghum, millet, green grams, cowpeas)")
        advice.append("💧 Invest in water harvesting — zai pits, half-moon catchments, or small dams")
        advice.append("🐄 Livestock-based farming may be more reliable than crop farming in this zone")
    elif rain < 900:
        advice.append("🌦️ Semi-arid zone — short-season crop varieties recommended")
        advice.append("✅ Maize (KATUMANI/WEMA varieties), beans, sunflower, and pigeon peas are good choices")
        advice.append("🐐 Goat and small livestock farming well suited for this climate")
    elif rain < 1400:
        advice.append("🌿 Good agricultural zone — wide crop diversity possible")
        advice.append("✅ Maize, beans, vegetables, coffee, avocado, and passion fruit are all viable")
        advice.append("🐄 Dairy farming highly suitable — zero-grazing recommended")
    else:
        advice.append("🌧️ High rainfall zone — excellent for tea, coffee, dairy, and horticultural crops")
        advice.append("⚠️ Watch for fungal diseases (blight, mildew) during wet seasons")
        advice.append("🫘 Ensure good drainage in fields to prevent waterlogging")

    if alt > 2000:
        advice.append("🏔️ High altitude zone — frost risk during cold months (July-August). Protect seedlings.")
        advice.append("🍓 Strawberries, pyrethrum, and cool-season vegetables do well here")
    elif alt > 1500:
        advice.append("🌄 Mid-to-high altitude — ideal for coffee, tea, and dairy cattle")
    else:
        advice.append("🌡️ Warm lowland zone — tropical fruits, cassava, and heat-tolerant crops thrive")

    return advice
