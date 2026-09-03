from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, User, Crop, Animal
from models.auth import get_current_user
from data.kenya_locations import KENYA_LOCATIONS
import json

router = APIRouter()

# Zone data by county — altitude, rainfall, temperature, soil, best crops
COUNTY_ZONES = {
    "Nairobi":       {"altitude":1700,"rainfall":860,"temp":"14-28°C","zone":"UM3","zone_name":"Upper Midland Moist","dry_months":["Jan","Feb","Jul","Aug"],"soil":["red clay loam","sandy loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kiambu":        {"altitude":1600,"rainfall":1050,"temp":"13-26°C","zone":"UM2","zone_name":"Upper Midland Humid","dry_months":["Jan","Feb","Jul","Aug"],"soil":["deep red loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Murang'a":      {"altitude":1500,"rainfall":1200,"temp":"13-26°C","zone":"LH3","zone_name":"Lower Highland Moist","dry_months":["Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Nyeri":         {"altitude":1800,"rainfall":1400,"temp":"12-22°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Jan","Feb","Mar","Apr","May","Jun"]},
    "Kirinyaga":     {"altitude":1200,"rainfall":1100,"temp":"15-28°C","zone":"UM2","zone_name":"Upper Midland Humid","dry_months":["Jan","Feb","Jul","Aug"],"soil":["alluvial","clay loam","volcanic loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Nyandarua":     {"altitude":2200,"rainfall":1200,"temp":"8-20°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jul","Aug"],"soil":["deep volcanic loam","black cotton"],"planting":["Mar","Apr","Sep","Oct"]},
    "Nakuru":        {"altitude":1850,"rainfall":1000,"temp":"12-26°C","zone":"UM2","zone_name":"Upper Midland Humid","dry_months":["Jan","Feb","Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Uasin Gishu":   {"altitude":2000,"rainfall":1050,"temp":"10-24°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jul","Aug"],"soil":["deep volcanic loam","red loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Trans Nzoia":   {"altitude":1900,"rainfall":1200,"temp":"12-24°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Kericho":       {"altitude":2000,"rainfall":1800,"temp":"12-24°C","zone":"LH1","zone_name":"Lower Highland Very Humid","dry_months":["Jul"],"soil":["deep volcanic loam","peaty clay"],"planting":["Mar","Apr","Sep","Oct"]},
    "Bomet":         {"altitude":2000,"rainfall":1600,"temp":"12-24°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Nandi":         {"altitude":1900,"rainfall":1500,"temp":"12-24°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "Kakamega":      {"altitude":1500,"rainfall":1800,"temp":"15-28°C","zone":"LM1","zone_name":"Lowland Humid","dry_months":["Jan","Feb"],"soil":["red clay loam","sandy loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Bungoma":       {"altitude":1400,"rainfall":1500,"temp":"16-28°C","zone":"LM2","zone_name":"Lowland Sub-humid","dry_months":["Jan","Feb","Jul","Aug"],"soil":["clay loam","loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Busia":         {"altitude":1200,"rainfall":1400,"temp":"20-30°C","zone":"LM2","zone_name":"Lowland Sub-humid","dry_months":["Jan","Feb"],"soil":["sandy loam","clay loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Siaya":         {"altitude":1200,"rainfall":1400,"temp":"20-30°C","zone":"LM2","zone_name":"Lowland Sub-humid","dry_months":["Jan","Jul"],"soil":["clay loam","sandy loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Kisumu":        {"altitude":1140,"rainfall":1200,"temp":"20-32°C","zone":"LM2","zone_name":"Lowland Sub-humid","dry_months":["Jan","Jul","Aug"],"soil":["clay","alluvial","sandy loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Homa Bay":      {"altitude":1200,"rainfall":1100,"temp":"20-30°C","zone":"LM3","zone_name":"Lowland Semi-humid","dry_months":["Jan","Jul","Aug"],"soil":["sandy loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Migori":        {"altitude":1400,"rainfall":1400,"temp":"18-28°C","zone":"LM2","zone_name":"Lowland Sub-humid","dry_months":["Jan","Jul"],"soil":["clay loam","loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Kisii":         {"altitude":1700,"rainfall":1800,"temp":"15-26°C","zone":"LH3","zone_name":"Lower Highland Moist","dry_months":["Jan","Jul","Aug"],"soil":["deep red loam","clay loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Nyamira":       {"altitude":1800,"rainfall":1800,"temp":"14-26°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jan","Jul","Aug"],"soil":["deep volcanic loam","clay loam"],"planting":["Mar","Apr","Aug","Sep"]},
    "Meru":          {"altitude":1500,"rainfall":1200,"temp":"14-26°C","zone":"LH3","zone_name":"Lower Highland Moist","dry_months":["Jan","Feb","Jul","Aug"],"soil":["deep volcanic loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Tharaka-Nithi": {"altitude":900,"rainfall":800,"temp":"18-28°C","zone":"LM4","zone_name":"Lowland Dry","dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Oct","Nov"]},
    "Embu":          {"altitude":1400,"rainfall":1100,"temp":"16-28°C","zone":"LM2","zone_name":"Lowland Sub-humid","dry_months":["Jan","Feb","Jul","Aug"],"soil":["volcanic loam","clay loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Machakos":      {"altitude":1600,"rainfall":700,"temp":"16-28°C","zone":"LM4","zone_name":"Lowland Dry","dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Makueni":       {"altitude":1000,"rainfall":650,"temp":"18-30°C","zone":"LM5","zone_name":"Lowland Very Dry","dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red sandy"],"planting":["Mar","Oct","Nov"]},
    "Kitui":         {"altitude":1000,"rainfall":600,"temp":"20-32°C","zone":"LM5","zone_name":"Lowland Very Dry","dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red sandy"],"planting":["Mar","Oct","Nov"]},
    "Kajiado":       {"altitude":1600,"rainfall":550,"temp":"16-28°C","zone":"LM5","zone_name":"Lowland Very Dry","dry_months":["Jan","Feb","Jun","Jul","Aug","Sep"],"soil":["sandy loam","black cotton"],"planting":["Mar","Oct","Nov"]},
    "Narok":         {"altitude":1800,"rainfall":900,"temp":"14-26°C","zone":"LM3","zone_name":"Lowland Semi-humid","dry_months":["Jan","Feb","Jul","Aug"],"soil":["clay loam","black cotton"],"planting":["Mar","Apr","Oct","Nov"]},
    "Laikipia":      {"altitude":1800,"rainfall":700,"temp":"12-26°C","zone":"LM4","zone_name":"Lowland Dry","dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Baringo":       {"altitude":1000,"rainfall":700,"temp":"20-32°C","zone":"LM4","zone_name":"Lowland Dry","dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["clay","sandy loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Elgeyo-Marakwet":{"altitude":2200,"rainfall":1200,"temp":"10-22°C","zone":"LH2","zone_name":"Lower Highland Humid","dry_months":["Jul","Aug"],"soil":["deep volcanic loam","red loam"],"planting":["Mar","Apr","Sep","Oct"]},
    "West Pokot":    {"altitude":2000,"rainfall":1000,"temp":"14-26°C","zone":"LM3","zone_name":"Lowland Semi-humid","dry_months":["Jan","Feb","Jul","Aug"],"soil":["clay loam","loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Samburu":       {"altitude":900,"rainfall":400,"temp":"20-34°C","zone":"LM6","zone_name":"Arid","dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","sandy loam"],"planting":["Apr","Nov"]},
    "Turkana":       {"altitude":500,"rainfall":200,"temp":"28-40°C","zone":"CL4","zone_name":"Very Arid","dry_months":["Jan","Feb","Mar","Apr","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","rocky"],"planting":["Apr","Nov"]},
    "Marsabit":      {"altitude":1500,"rainfall":400,"temp":"16-30°C","zone":"LM6","zone_name":"Arid","dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy loam","rocky"],"planting":["Apr","May","Nov"]},
    "Isiolo":        {"altitude":1000,"rainfall":350,"temp":"22-34°C","zone":"CL3","zone_name":"Semi-Arid","dry_months":["Jan","Feb","Mar","Jun","Jul","Aug","Sep"],"soil":["sandy loam","red sandy"],"planting":["Apr","Oct","Nov"]},
    "Garissa":       {"altitude":300,"rainfall":250,"temp":"28-40°C","zone":"CL4","zone_name":"Very Arid","dry_months":["Jan","Feb","Mar","May","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","alluvial"],"planting":["Apr","Nov"]},
    "Wajir":         {"altitude":300,"rainfall":200,"temp":"28-40°C","zone":"CL4","zone_name":"Very Arid","dry_months":["Jan","Feb","Mar","May","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","clay"],"planting":["Apr","Nov"]},
    "Mandera":       {"altitude":300,"rainfall":180,"temp":"30-42°C","zone":"CL4","zone_name":"Very Arid","dry_months":["Jan","Feb","Mar","May","Jun","Jul","Aug","Sep","Oct"],"soil":["sandy","rocky"],"planting":["Apr","Nov"]},
    "Mombasa":       {"altitude":50,"rainfall":1000,"temp":"24-32°C","zone":"CL1","zone_name":"Coastal Humid","dry_months":["Jul","Aug","Sep"],"soil":["sandy","sandy loam","coral"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kilifi":        {"altitude":100,"rainfall":900,"temp":"24-32°C","zone":"CL1","zone_name":"Coastal Humid","dry_months":["Jul","Aug","Sep"],"soil":["sandy loam","sandy","coral"],"planting":["Mar","Apr","Oct","Nov"]},
    "Kwale":         {"altitude":200,"rainfall":900,"temp":"24-32°C","zone":"CL1","zone_name":"Coastal Humid","dry_months":["Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Tana River":    {"altitude":100,"rainfall":600,"temp":"26-36°C","zone":"CL2","zone_name":"Coastal Dry","dry_months":["Jun","Jul","Aug","Sep"],"soil":["alluvial","clay","sandy"],"planting":["Mar","Apr","Oct","Nov"]},
    "Lamu":          {"altitude":10,"rainfall":800,"temp":"25-33°C","zone":"CL1","zone_name":"Coastal Humid","dry_months":["Jul","Aug","Sep"],"soil":["sandy","alluvial","coral"],"planting":["Mar","Apr","Oct","Nov"]},
    "Taita-Taveta":  {"altitude":900,"rainfall":700,"temp":"18-30°C","zone":"LM4","zone_name":"Lowland Dry","dry_months":["Jan","Feb","Jul","Aug","Sep"],"soil":["sandy loam","red loam"],"planting":["Mar","Apr","Oct","Nov"]},
    "Vihiga":        {"altitude":1600,"rainfall":2000,"temp":"15-26°C","zone":"LH3","zone_name":"Lower Highland Moist","dry_months":["Jan","Jul"],"soil":["clay loam","red loam"],"planting":["Mar","Apr","Aug","Sep"]},
}

# Zone-based challenges
ZONE_CHALLENGES = {
    "LH1": ["High risk of fungal diseases due to very high rainfall — spray regularly","Waterlogging possible in flat areas — ensure drainage","Cold temperatures limit some tropical crops","Mist and cloud cover can affect flowering"],
    "LH2": ["Fungal diseases common during wet season — blight, mildew, rust","Irish potato late blight is a major threat — spray with Ridomil","Soil erosion on slopes during heavy rains","Coffee Berry Disease requires regular copper sprays"],
    "LH3": ["Fall Armyworm attacks maize during growing season","Bacterial wilt of tomatoes and potatoes","Diamondback moth on cabbages and kale","Soil acidity can be a challenge — apply lime"],
    "UM2": ["Drought stress during dry months — irrigate if possible","Maize Lethal Necrosis virus spread by insects","Late blight of tomatoes and potatoes during rains","Root knot nematodes in vegetable gardens"],
    "UM3": ["Dry spells can reduce yields — water harvesting recommended","Stalk borer in maize","Aphids and whitefly on vegetables","Irregular rainfall makes timing difficult"],
    "LM1": ["Sugarcane smut disease","Maize streak virus spread by leafhoppers","Cassava mosaic virus — use certified clean cuttings","Flooding in low-lying areas during heavy rains"],
    "LM2": ["Soybean rust during wet season","Banana Xanthomonas Wilt — disinfect tools always","Sweet potato weevil","Root rot from waterlogging"],
    "LM3": ["Drought stress in dry months — mulching helps","Bean angular leaf spot","Mango anthracnose during flowering","Fruit fly attacks mangoes and tomatoes"],
    "LM4": ["Severe drought is the main challenge — water harvesting essential","Low and unreliable rainfall — use drought-tolerant varieties","Wind erosion of topsoil","Striga weed parasitizes sorghum and millet"],
    "LM5": ["Very low rainfall — only drought-tolerant crops survive","Complete crop failure possible in poor rains","Termites attack plant roots","Soil moisture conservation is critical"],
    "LM6": ["Extreme drought — pastoralism better than cropping","Locust invasions possible","Very high temperatures stress plants","Flash floods can destroy crops in valleys"],
    "CL1": ["Salinity near coast affects some crops","High humidity encourages fungal diseases","Cassava mosaic and brown streak viruses","Coconut lethal yellowing disease"],
    "CL2": ["Drought stress — most months are dry","Flood risk in river valleys","Cassava whitefly spreads viruses","Fruit fly attacks mangoes and papaya"],
    "CL3": ["Very low rainfall — irrigation usually required","Termites attack roots","Strong winds damage crops","Soil salinity in some areas"],
    "CL4": ["Extreme drought — cropping is very risky","Livestock diseases from poor nutrition","Flash floods destroy crops","Very high temperatures"],
}

# Recommended livestock by zone
ZONE_LIVESTOCK = {
    "LH1": ["Dairy Cattle","Sheep","Honey Bees","Layer Chickens","Dairy Goats"],
    "LH2": ["Dairy Cattle","Dairy Goats","Irish Potatoes","Sheep","Honey Bees","Rabbits","Layer Chickens"],
    "LH3": ["Dairy Cattle","Dairy Goats","Sheep","Broiler Chickens","Layer Chickens","Rabbits","Pigs"],
    "UM2": ["Dairy Cattle","Beef Cattle","Dairy Goats","Broiler Chickens","Layer Chickens","Pigs","Rabbits"],
    "UM3": ["Dairy Cattle","Beef Cattle","Goats","Sheep","Broiler Chickens","Layer Chickens"],
    "LM1": ["Dairy Cattle","Beef Cattle","Pigs","Broiler Chickens","Layer Chickens","Fish Farming","Ducks"],
    "LM2": ["Dairy Cattle","Beef Cattle","Goats","Pigs","Broiler Chickens","Layer Chickens","Fish Farming","Ducks"],
    "LM3": ["Beef Cattle","Meat Goats","Sheep","Broiler Chickens","Camels (north)","Honey Bees"],
    "LM4": ["Beef Cattle","Meat Goats","Sheep","Broiler Chickens","Camels","Honey Bees","Ostriches"],
    "LM5": ["Meat Goats","Sheep","Camels","Beef Cattle","Donkeys","Honey Bees"],
    "LM6": ["Camels","Meat Goats","Sheep","Donkeys"],
    "CL1": ["Broiler Chickens","Layer Chickens","Fish Farming","Meat Goats","Ducks","Honey Bees"],
    "CL2": ["Meat Goats","Beef Cattle","Broiler Chickens","Camels","Donkeys"],
    "CL3": ["Camels","Meat Goats","Donkeys","Sheep"],
    "CL4": ["Camels","Meat Goats","Donkeys","Sheep"],
}

# Best crops by zone
ZONE_CROPS = {
    "LH1": ["Tea","Pyrethrum","Irish Potatoes","Dairy Cattle","Wheat","Roses","Carnations"],
    "LH2": ["Tea","Coffee","Irish Potatoes","Wheat","Pyrethrum","Kale","Cabbage","Carrots","Roses","Strawberry","Plum","Peach"],
    "LH3": ["Coffee","Tea","Maize","Irish Potatoes","Kale","Cabbage","Beans","Tomatoes","Avocado","Passion Fruit","Macadamia","Roses"],
    "UM2": ["Maize","Beans","Tomatoes","Kale","Cabbage","Onions","Carrots","Peas","Avocado","Coffee","Passion Fruit","French Beans","Macadamia"],
    "UM3": ["Maize","Beans","Tomatoes","Kale","Onions","Sunflower","Avocado","Mango","Passion Fruit","Banana","Sugarcane"],
    "LM1": ["Sugarcane","Maize","Beans","Rice","Banana","Cassava","Sweet Potatoes","Groundnuts","Soybean"],
    "LM2": ["Maize","Beans","Soybean","Groundnuts","Banana","Sweet Potatoes","Cassava","Sugarcane","Rice","Cowpeas"],
    "LM3": ["Maize","Sorghum","Beans","Mango","Banana","Avocado","Tomatoes","Watermelon","Sunflower","Green Grams"],
    "LM4": ["Sorghum","Millet","Green Grams","Cowpeas","Pigeon Peas","Mango","Sunflower","Cassava","Sweet Potatoes"],
    "LM5": ["Sorghum","Pearl Millet","Green Grams","Cowpeas","Pigeon Peas","Cassava","Tamarind","Watermelon"],
    "LM6": ["Pearl Millet","Sorghum","Cassava","Watermelon","Tamarind","Drought-tolerant crops only"],
    "CL1": ["Coconut","Cashew","Cassava","Banana","Mango","Papaya","Pineapple","Lime","Cowpeas","Sweet Potatoes"],
    "CL2": ["Cassava","Mango","Cowpeas","Green Grams","Sweet Potatoes","Watermelon","Tamarind","Coconut"],
    "CL3": ["Pearl Millet","Sorghum","Cassava","Watermelon","Cowpeas","Green Grams"],
    "CL4": ["Pearl Millet","Camel Grazing","Sorghum","Drought-tolerant crops only"],
}


@router.get("/counties")
def get_counties(db: Session = Depends(get_db)):
    return sorted(COUNTY_ZONES.keys())


@router.get("/constituencies")
def get_constituencies(county: str, db: Session = Depends(get_db)):
    return KENYA_LOCATIONS.get(county, {}).get("constituencies", {})


@router.get("/wards")
def get_wards(county: str, constituency: str, db: Session = Depends(get_db)):
    return KENYA_LOCATIONS.get(county, {}).get("constituencies", {}).get(constituency, [])


@router.get("/analyze")
def analyze(county: str, constituency: str = "", db: Session = Depends(get_db)):
    zone_data = COUNTY_ZONES.get(county)
    if not zone_data:
        raise HTTPException(404, f"County '{county}' not found")

    zone = zone_data["zone"]

    # Get recommended crops from DB matching this county
    all_crops = db.query(Crop).all()
    recommended_crops = []
    for crop in all_crops:
        best_counties = json.loads(crop.best_counties or "[]")
        suitable_aez = json.loads(crop.suitable_aez or "[]")
        county_match = any(county.lower() in c.lower() or c.lower() in county.lower() for c in best_counties)
        zone_match = any(zone.lower() in z.lower() or z.lower() in zone.lower() for z in suitable_aez)
        # Also match by crop name in zone crops list
        zone_crop_names = ZONE_CROPS.get(zone, [])
        name_match = any(zc.lower() in crop.name.lower() or crop.name.lower() in zc.lower() for zc in zone_crop_names)
        if county_match or zone_match or name_match:
            recommended_crops.append({
                "id": crop.id,
                "name": crop.name,
                "category": crop.category,
                "water_requirement": crop.water_requirement,
                "maturity_days": crop.maturity_days,
                "expected_yield": crop.expected_yield,
                "market_price_ksh": crop.market_price_ksh,
            })

    # Get recommended livestock from DB
    all_animals = db.query(Animal).all()
    zone_animal_names = ZONE_LIVESTOCK.get(zone, [])
    recommended_livestock = []
    for animal in all_animals:
        name_match = any(zn.lower() in animal.name.lower() or animal.name.lower() in zn.lower() for zn in zone_animal_names)
        if name_match:
            recommended_livestock.append({
                "id": animal.id,
                "name": animal.name,
                "category": animal.category,
                "purpose": animal.purpose,
            })

    challenges = ZONE_CHALLENGES.get(zone, ["Monitor crops regularly for pests and diseases", "Practice good farm hygiene"])

    return {
        "county": county,
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
        "description": f"Best for {', '.join(ZONE_CROPS.get(zone, [])[:5])}.",
    }
