from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, User, Crop, Animal
from models.auth import get_current_user
from data.kenya_locations import KENYA_LOCATIONS
import json

router = APIRouter()

# Complete 47 counties
COUNTY_ZONES = {
    "Mombasa":         {"altitude":50,  "rainfall":1000,"temp":"24-32°C","zone":"CL1","zone_name":"Coastal Humid",          "dry_months":["Jul","Aug","Sep"],"soil":["sandy","coral"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kwale":           {"altitude":200, "rainfall":900, "temp":"24-32°C","zone":"CL1","zone_name":"Coastal Humid",          "dry_months":["Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kilifi":          {"altitude":100, "rainfall":900, "temp":"24-32°C","zone":"CL1","zone_name":"Coastal Humid",          "dry_months":["Jul","Aug","Sep"],"soil":["sandy loam","coral"],"planting":["Mar","Apr","Oct","Nov"]},
    "Tana River":      {"altitude":100, "rainfall":600, "temp":"26-36°C","zone":"CL2","zone_name":"Coastal Dry",            "dry_months":["Jun","Jul","Aug","Sep"],"soil":["alluvial","clay"],"planting":["Mar","Apr","Oct","Nov"]},
    "Lamu":            {"altitude":10,  "rainfall":800, "temp":"25-33°C","zone":"CL1","zone_name":"Coastal Humid",          "dry_months":["Jul","Aug","Sep"],"soil":["sandy","alluvial"],"planting":["Mar","Apr","Oct","Nov"]},
    "Taita-Taveta":    {"altitude":900, "rainfall":700, "temp":"18-30°C","zone":"LM4","zone_name":"Lowland Dry",            "dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Garissa":         {"altitude":300, "rainfall":250, "temp":"28-40°C","zone":"CL4","zone_name":"Very Arid",              "dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","alluvial"],"planting":["Apr","Nov"]},
    "Wajir":           {"altitude":300, "rainfall":200, "temp":"28-40°C","zone":"CL4","zone_name":"Very Arid",              "dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","clay"],"planting":["Apr","Nov"]},
    "Mandera":         {"altitude":300, "rainfall":180, "temp":"30-42°C","zone":"CL4","zone_name":"Very Arid",              "dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","rocky"],"planting":["Apr","Nov"]},
    "Marsabit":        {"altitude":1500,"rainfall":400, "temp":"16-30°C","zone":"LM6","zone_name":"Arid",                   "dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy loam","rocky"],"planting":["Apr","May","Nov"]},
    "Isiolo":          {"altitude":1000,"rainfall":350, "temp":"22-34°C","zone":"CL3","zone_name":"Semi-Arid",              "dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red sandy"],"planting":["Apr","Oct","Nov"]},
    "Meru":            {"altitude":1500,"rainfall":1200,"temp":"14-26°C","zone":"LH3","zone_name":"Lower Highland Moist",   "dry_months":["Jan","Feb","Jul","Aug"],"soil":["deep volcanic loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Tharaka-Nithi":   {"altitude":900, "rainfall":800, "temp":"18-28°C","zone":"LM4","zone_name":"Lowland Dry",            "dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Oct","Nov"]},
    "Embu":            {"altitude":1400,"rainfall":1100,"temp":"16-28°C","zone":"LM2","zone_name":"Lowland Sub-humid",      "dry_months":["Jan","Feb","Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kitui":           {"altitude":1000,"rainfall":600, "temp":"20-32°C","zone":"LM5","zone_name":"Lowland Very Dry",       "dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red sandy"],"planting":["Mar","Oct","Nov"]},
    "Machakos":        {"altitude":1600,"rainfall":700, "temp":"16-28°C","zone":"LM4","zone_name":"Lowland Dry",            "dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Makueni":         {"altitude":1000,"rainfall":650, "temp":"18-30°C","zone":"LM5","zone_name":"Lowland Very Dry",       "dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red sandy"],"planting":["Mar","Oct","Nov"]},
    "Nyandarua":       {"altitude":2200,"rainfall":1200,"temp":"8-20°C", "zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jul","Aug"],"soil":["deep volcanic loam","black cotton"],"planting":["Mar","Apr","Sep","Oct"]},
    "Nyeri":           {"altitude":1800,"rainfall":1400,"temp":"12-22°C","zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Jan","Feb","Mar","Apr","May","Jun"]},
    "Kirinyaga":       {"altitude":1200,"rainfall":1100,"temp":"15-28°C","zone":"UM2","zone_name":"Upper Midland Humid",    "dry_months":["Jan","Feb","Jul","Aug"],"soil":["alluvial","clay loam","volcanic loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Murang'a":        {"altitude":1500,"rainfall":1200,"temp":"13-26°C","zone":"LH3","zone_name":"Lower Highland Moist",   "dry_months":["Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kiambu":          {"altitude":1600,"rainfall":1050,"temp":"13-26°C","zone":"UM2","zone_name":"Upper Midland Humid",    "dry_months":["Jan","Feb","Jul","Aug"],"soil":["deep red loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Turkana":         {"altitude":500, "rainfall":200, "temp":"28-40°C","zone":"CL4","zone_name":"Very Arid",              "dry_months":["Jan","Feb","Mar","Apr","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","rocky"],"planting":["Apr","Nov"]},
    "West Pokot":      {"altitude":2000,"rainfall":1000,"temp":"14-26°C","zone":"LM3","zone_name":"Lowland Semi-humid",     "dry_months":["Jan","Feb","Jul","Aug"],"soil":["clay loam","loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Samburu":         {"altitude":900, "rainfall":400, "temp":"20-34°C","zone":"LM6","zone_name":"Arid",                   "dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","sandy loam"],"planting":["Apr","Nov"]},
    "Trans Nzoia":     {"altitude":1900,"rainfall":1200,"temp":"12-24°C","zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Uasin Gishu":     {"altitude":2000,"rainfall":1050,"temp":"10-24°C","zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jul","Aug"],"soil":["deep volcanic loam","red loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Elgeyo-Marakwet": {"altitude":2200,"rainfall":1200,"temp":"10-22°C","zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jul","Aug"],"soil":["deep volcanic loam","red loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Nandi":           {"altitude":1900,"rainfall":1500,"temp":"12-24°C","zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Baringo":         {"altitude":1000,"rainfall":700, "temp":"20-32°C","zone":"LM4","zone_name":"Lowland Dry",            "dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["clay","sandy loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Laikipia":        {"altitude":1800,"rainfall":700, "temp":"12-26°C","zone":"LM4","zone_name":"Lowland Dry",            "dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Nakuru":          {"altitude":1850,"rainfall":1000,"temp":"12-26°C","zone":"UM2","zone_name":"Upper Midland Humid",    "dry_months":["Jan","Feb","Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Narok":           {"altitude":1800,"rainfall":900, "temp":"14-26°C","zone":"LM3","zone_name":"Lowland Semi-humid",     "dry_months":["Jan","Feb","Jul","Aug"],"soil":["clay loam","black cotton"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kajiado":         {"altitude":1600,"rainfall":550, "temp":"16-28°C","zone":"LM5","zone_name":"Lowland Very Dry",       "dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","black cotton"],"planting":["Mar","Oct","Nov"]},
    "Kericho":         {"altitude":2000,"rainfall":1800,"temp":"12-24°C","zone":"LH1","zone_name":"Lower Highland Very Humid","dry_months":["Jul"],"soil":["deep volcanic loam","peaty clay"],"planting":["Mar","Apr","Sep","Oct"]},
    "Bomet":           {"altitude":2000,"rainfall":1600,"temp":"12-24°C","zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Kakamega":        {"altitude":1500,"rainfall":1800,"temp":"15-28°C","zone":"LM1","zone_name":"Lowland Humid",          "dry_months":["Jan","Feb"],"soil":["red clay loam","sandy loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Vihiga":          {"altitude":1600,"rainfall":2000,"temp":"15-26°C","zone":"LH3","zone_name":"Lower Highland Moist",   "dry_months":["Jan","Jul"],"soil":["clay loam","red loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Bungoma":         {"altitude":1400,"rainfall":1500,"temp":"16-28°C","zone":"LM2","zone_name":"Lowland Sub-humid",      "dry_months":["Jan","Feb","Jul","Aug"],"soil":["clay loam","loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Busia":           {"altitude":1200,"rainfall":1400,"temp":"20-30°C","zone":"LM2","zone_name":"Lowland Sub-humid",      "dry_months":["Jan","Feb"],"soil":["sandy loam","clay loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Siaya":           {"altitude":1200,"rainfall":1400,"temp":"20-30°C","zone":"LM2","zone_name":"Lowland Sub-humid",      "dry_months":["Jan","Jul"],"soil":["clay loam","sandy loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Kisumu":          {"altitude":1140,"rainfall":1200,"temp":"20-32°C","zone":"LM2","zone_name":"Lowland Sub-humid",      "dry_months":["Jan","Jul","Aug"],"soil":["clay","alluvial","sandy loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Homa Bay":        {"altitude":1200,"rainfall":1100,"temp":"20-30°C","zone":"LM3","zone_name":"Lowland Semi-humid",     "dry_months":["Jan","Jul","Aug"],"soil":["sandy loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Migori":          {"altitude":1400,"rainfall":1400,"temp":"18-28°C","zone":"LM2","zone_name":"Lowland Sub-humid",      "dry_months":["Jan","Jul"],"soil":["clay loam","loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Kisii":           {"altitude":1700,"rainfall":1800,"temp":"15-26°C","zone":"LH3","zone_name":"Lower Highland Moist",   "dry_months":["Jan","Jul","Aug"],"soil":["deep red loam","clay loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Nyamira":         {"altitude":1800,"rainfall":1800,"temp":"14-26°C","zone":"LH2","zone_name":"Lower Highland Humid",   "dry_months":["Jan","Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Nairobi":         {"altitude":1700,"rainfall":860, "temp":"14-28°C","zone":"UM3","zone_name":"Upper Midland Moist",    "dry_months":["Jan","Feb","Jul","Aug"],"soil":["red clay loam","sandy loam"],"planting":["Mar","Apr","Oct","Nov"]},
}

ZONE_CHALLENGES = {
    "LH1": ["Very high rainfall encourages fungal diseases — spray preventively every 2 weeks","Waterlogging common in flat areas — ensure drainage channels","Cold temperatures stress some tropical crops","Tea blister blight is a major concern — monitor young leaves regularly"],
    "LH2": ["Late blight of potato and tomato is a constant threat during wet season — spray Ridomil every 10 days","Coffee Berry Disease requires regular copper-based fungicide sprays","Soil erosion on steep slopes during heavy rains — use cover crops","Wheat rust spreads rapidly in cool humid conditions — monitor and spray Tilt early"],
    "LH3": ["Fall Armyworm attacks maize — scout fields twice weekly and spray Coragen when found","Coffee CBD and leaf rust — maintain regular fungicide spray program","Diamondback moth destroys cabbages and kale — spray Karate at first sign","Banana Xanthomonas Wilt spreads through tools — always disinfect with bleach"],
    "UM2": ["Maize Lethal Necrosis spread by thrips and aphids — use certified seed and control insects","Late blight during long rains — spray tomatoes and potatoes preventively","Drought stress during dry months — mulch to conserve moisture","Root knot nematodes in vegetable gardens — rotate crops every season"],
    "UM3": ["Dry spells reduce yields — water harvesting and drip irrigation recommended","Stalk borer in maize — apply Furadan granules into the whorl at knee height","Aphids and whitefly on vegetables spread viruses — spray Actara","Irregular rainfall makes planting timing critical — plant at onset of rains"],
    "LM1": ["Sugarcane smut and stalk borer are major threats — plant resistant varieties","Banana Xanthomonas Wilt — sterilize all cutting tools before each plant","Cassava mosaic virus spreads fast — use certified virus-free cuttings only","Flooding of low-lying fields during heavy rains — plant on raised beds"],
    "LM2": ["Soybean rust during wet season — spray Tilt or Amistar at flowering","Sweet potato weevil causes serious underground damage — practice crop rotation","Root rot from waterlogging — avoid planting in poorly drained areas","Banana weevil borer destroys pseudostems — use clean planting materials"],
    "LM3": ["Drought stress during long dry season — mulching and water harvesting essential","Mango anthracnose destroys flowers and fruits — spray Dithane at bud break","Fruit fly attacks ripe fruits — use protein bait traps around orchards","Bean angular leaf spot during wet spells — spray Dithane M45"],
    "LM4": ["Drought is the main challenge — plant only drought-tolerant varieties","Striga weed parasitizes sorghum and millet roots — use Imazapyr-treated seed","Termites attack roots and stems — treat soil with Dursban before planting","Very low yields in poor rainfall years — practice water harvesting and mulching"],
    "LM5": ["Severe drought — crop failure is possible in bad years — diversify into livestock","Only drought-tolerant crops can survive — sorghum, millet, green grams","Termites are destructive — treat planting holes with termiticide","Store food reserves from good seasons to survive dry years"],
    "LM6": ["Extreme drought makes cropping very risky — focus on livestock instead","Locust invasions can destroy any crop — report swarms to county agriculture office","Flash floods can destroy crops in valleys during rare heavy rains","Very high temperatures above 40°C damage crops — shade structures help"],
    "CL1": ["Cassava mosaic and brown streak viruses are widespread — use certified cuttings","High coastal humidity encourages fungal diseases on all crops — spray regularly","Coconut lethal yellowing disease has no cure — plant resistant varieties","Salt spray near ocean affects leafy vegetables — plant windbreaks"],
    "CL2": ["Most months are dry — irrigation is usually required for vegetables","Cassava whitefly spreads viruses rapidly — spray Actara and use resistant varieties","Fruit fly attacks mangoes and papaya — use bait traps and harvest early","Soil salinity in some coastal areas limits crop choice"],
    "CL3": ["Very low and unreliable rainfall — irrigation from boreholes or rivers is essential","Termites are very destructive — treat soil before planting","Strong hot winds damage young crops — plant windbreaks","Sandy soils hold little water and nutrients — add manure and mulch heavily"],
    "CL4": ["Extreme drought makes crop farming nearly impossible — pastoralism is better","Livestock diseases from poor nutrition in dry season — supplementary feeding essential","Flash floods during rare heavy rains destroy everything in their path","Very high temperatures cause heat stress in both crops and animals"],
}

ZONE_LIVESTOCK = {
    "LH1": ["Dairy Cattle","Sheep","Honey Bees","Layer Chickens","Dairy Goats","Rabbits"],
    "LH2": ["Dairy Cattle","Dairy Goats","Sheep","Honey Bees","Rabbits","Layer Chickens","Broiler Chickens"],
    "LH3": ["Dairy Cattle","Dairy Goats","Sheep","Broiler Chickens","Layer Chickens","Rabbits","Pigs"],
    "UM2": ["Dairy Cattle","Beef Cattle","Dairy Goats","Broiler Chickens","Layer Chickens","Pigs","Rabbits"],
    "UM3": ["Dairy Cattle","Beef Cattle","Meat Goats","Sheep","Broiler Chickens","Layer Chickens","Kienyeji Chickens"],
    "LM1": ["Dairy Cattle","Beef Cattle","Pigs","Broiler Chickens","Layer Chickens","Fish Farming","Ducks"],
    "LM2": ["Dairy Cattle","Beef Cattle","Meat Goats","Pigs","Broiler Chickens","Layer Chickens","Fish Farming","Ducks"],
    "LM3": ["Beef Cattle","Meat Goats","Sheep","Broiler Chickens","Kienyeji Chickens","Honey Bees"],
    "LM4": ["Beef Cattle","Meat Goats","Sheep","Broiler Chickens","Kienyeji Chickens","Honey Bees","Ostriches"],
    "LM5": ["Meat Goats","Sheep","Camels","Beef Cattle","Donkeys","Honey Bees"],
    "LM6": ["Camels","Meat Goats","Sheep","Donkeys"],
    "CL1": ["Broiler Chickens","Layer Chickens","Kienyeji Chickens","Fish Farming","Meat Goats","Ducks","Honey Bees"],
    "CL2": ["Meat Goats","Beef Cattle","Broiler Chickens","Kienyeji Chickens","Camels","Donkeys"],
    "CL3": ["Camels","Meat Goats","Donkeys","Sheep"],
    "CL4": ["Camels","Meat Goats","Donkeys","Sheep"],
}

ZONE_CROPS = {
    "LH1": ["Tea","Pyrethrum","Irish Potatoes","Wheat","Roses","Carnations","Strawberry","Kale","Cabbage"],
    "LH2": ["Tea","Coffee","Irish Potatoes","Wheat","Pyrethrum","Kale","Cabbage","Carrots","Roses","Strawberry","Plum","Peach","Macadamia"],
    "LH3": ["Coffee","Tea","Maize","Irish Potatoes","Kale","Cabbage","Beans","Tomatoes","Avocado","Passion Fruit","Macadamia","Roses","Blueberry"],
    "UM2": ["Maize","Beans","Tomatoes","Kale","Cabbage","Onions","Carrots","Peas","Avocado","Coffee","Passion Fruit","French Beans","Macadamia","Strawberry"],
    "UM3": ["Maize","Beans","Tomatoes","Kale","Onions","Sunflower","Avocado","Mango","Passion Fruit","Banana","Sugarcane","Sweet Potatoes"],
    "LM1": ["Sugarcane","Maize","Beans","Rice","Banana","Cassava","Sweet Potatoes","Groundnuts","Soybean","Pineapple"],
    "LM2": ["Maize","Beans","Soybean","Groundnuts","Banana","Sweet Potatoes","Cassava","Sugarcane","Rice","Cowpeas","Avocado"],
    "LM3": ["Maize","Sorghum","Beans","Mango","Banana","Avocado","Tomatoes","Watermelon","Sunflower","Green Grams","Papaya"],
    "LM4": ["Sorghum","Millet","Green Grams","Cowpeas","Pigeon Peas","Mango","Sunflower","Cassava","Sweet Potatoes","Watermelon"],
    "LM5": ["Sorghum","Pearl Millet","Green Grams","Cowpeas","Pigeon Peas","Cassava","Tamarind","Watermelon","Drought-tolerant varieties only"],
    "LM6": ["Pearl Millet","Sorghum","Cassava","Watermelon","Tamarind"],
    "CL1": ["Coconut","Cashew","Cassava","Banana","Mango","Papaya","Pineapple","Lime","Cowpeas","Sweet Potatoes","Jackfruit"],
    "CL2": ["Cassava","Mango","Cowpeas","Green Grams","Sweet Potatoes","Watermelon","Tamarind","Coconut","Papaya"],
    "CL3": ["Pearl Millet","Sorghum","Cassava","Watermelon","Cowpeas","Green Grams"],
    "CL4": ["Pearl Millet","Sorghum","Cassava"],
}


@router.get("/analyze")
def analyze(county: str, constituency: str = "", db: Session = Depends(get_db)):
    # Case-insensitive county lookup
    matched_county = None
    for k in COUNTY_ZONES:
        if k.lower().strip() == county.lower().strip():
            matched_county = k
            break

    if not matched_county:
        raise HTTPException(404, f"County '{county}' not found. Available: {', '.join(sorted(COUNTY_ZONES.keys()))}")

    zone_data = COUNTY_ZONES[matched_county]
    zone = zone_data["zone"]

    # Match crops from DB
    all_crops = db.query(Crop).all()
    recommended_crops = []
    zone_crop_names = ZONE_CROPS.get(zone, [])

    for crop in all_crops:
        try:
            best_counties = json.loads(crop.best_counties or "[]")
            suitable_aez  = json.loads(crop.suitable_aez or "[]")
        except Exception:
            best_counties = []; suitable_aez = []

        county_match = any(matched_county.lower() in c.lower() or c.lower() in matched_county.lower() for c in best_counties)
        zone_match   = any(zone.lower() in z.lower() for z in suitable_aez)
        name_match   = any(zc.lower() in crop.name.lower() or crop.name.lower() in zc.lower() for zc in zone_crop_names)

        if county_match or zone_match or name_match:
            recommended_crops.append({
                "id": crop.id, "name": crop.name, "category": crop.category,
                "water_requirement": crop.water_requirement,
                "maturity_days": crop.maturity_days,
                "expected_yield": crop.expected_yield,
                "market_price_ksh": crop.market_price_ksh,
            })

    # Match livestock from DB
    all_animals = db.query(Animal).all()
    zone_animal_names = ZONE_LIVESTOCK.get(zone, [])
    recommended_livestock = []

    for animal in all_animals:
        name_match = any(zn.lower() in animal.name.lower() or animal.name.lower() in zn.lower() for zn in zone_animal_names)
        if name_match:
            recommended_livestock.append({
                "id": animal.id, "name": animal.name,
                "category": animal.category, "purpose": animal.purpose,
            })

    challenges = ZONE_CHALLENGES.get(zone, [
        "Monitor crops regularly for pests and diseases",
        "Practice good farm hygiene and crop rotation",
        "Keep records of what works on your farm",
    ])

    return {
        "county": matched_county,
        "constituency": constituency,
        "zone": zone,
        "zone_name": zone_data["zone_name"],
        "altitude": zone_data["altitude"],
        "rainfall": zone_data["rainfall"],
        "temperature": zone_data["temp"],
        "dry_months": zone_data["dry_months"],
        "soil_types": zone_data["soil"],
        "planting_months": zone_data["planting"],
        "best_crops": ZONE_CROPS.get(zone, []),
        "best_livestock": ZONE_LIVESTOCK.get(zone, []),
        "challenges": challenges,
        "recommended_crops": recommended_crops[:12],
        "recommended_livestock": recommended_livestock[:8],
        "description": f"Best for: {', '.join(ZONE_CROPS.get(zone, [])[:5])}.",
    }
