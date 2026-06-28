"""Seed AgriDSS v2 database with comprehensive Kenya agriculture data"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.database import Base, engine, SessionLocal, Crop, Animal, Disease, User
from models.auth import hash_password
from data.crops_db import CROPS_DATA
from data.livestock_db import LIVESTOCK_DATA

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("🌱 Seeding AgriDSS v2 database...")

# Admin user
if not db.query(User).filter(User.email == "admin@agridss.co.ke").first():
    db.add(User(name="AgriDSS Admin", email="admin@agridss.co.ke",
                hashed_password=hash_password("Admin@1234"), role="admin",
                county="Nairobi", constituency="Westlands"))
    db.commit()
    print("✅ Admin created: admin@agridss.co.ke / Admin@1234")

# Demo farmer
if not db.query(User).filter(User.email == "farmer@agridss.co.ke").first():
    db.add(User(name="Demo Farmer", email="farmer@agridss.co.ke",
                hashed_password=hash_password("Farmer@1234"), role="farmer",
                county="Murang'a", constituency="Murang'a South",
                ward="Township", village="Githunguri", farm_size_acres="2.5"))
    db.commit()
    print("✅ Demo farmer: farmer@agridss.co.ke / Farmer@1234")

# Crops
print(f"\n🌾 Seeding {len(CROPS_DATA)} crops...")
for cd in CROPS_DATA:
    if not db.query(Crop).filter(Crop.name == cd["name"]).first():
        crop = Crop(
            name=cd["name"], category=cd["category"],
            subcategory=cd.get("subcategory",""),
            varieties=json.dumps(cd.get("varieties",[])),
            suitable_aez=json.dumps(cd.get("suitable_aez",[])),
            rainfall_min_mm=cd.get("rainfall_min_mm",400),
            rainfall_max_mm=cd.get("rainfall_max_mm",1600),
            altitude_min_m=cd.get("altitude_min_m",0),
            altitude_max_m=cd.get("altitude_max_m",3000),
            water_requirement=cd.get("water_requirement","moderate"),
            soil_types=json.dumps(cd.get("soil_types",[])),
            planting_months=json.dumps(cd.get("planting_months",[])),
            maturity_days=cd.get("maturity_days",90),
            description=cd.get("description",""),
            care_tips=cd.get("care_tips",""),
            expected_yield=cd.get("expected_yield",""),
            market_price_ksh=cd.get("market_price_ksh",""),
            diseases=json.dumps(cd.get("diseases",[])),
            best_counties=json.dumps(cd.get("best_counties",[])),
        )
        db.add(crop)
        print(f"  + {cd['name']}")
db.commit()

# Livestock
print(f"\n🐄 Seeding {len(LIVESTOCK_DATA)} livestock types...")
for ad in LIVESTOCK_DATA:
    if not db.query(Animal).filter(Animal.name == ad["name"]).first():
        animal = Animal(
            name=ad["name"], category=ad["category"], purpose=ad["purpose"],
            breeds=json.dumps(ad.get("breeds",[])),
            suitable_aez=json.dumps(ad.get("suitable_aez",[])),
            description=ad.get("description",""),
            feeding_guide=ad.get("feeding_guide",""),
            housing_requirements=ad.get("housing_requirements",""),
            vaccination_schedule=json.dumps(ad.get("vaccination_schedule",[])),
            common_diseases=json.dumps(ad.get("common_diseases",[])),
            breeding_info=ad.get("breeding_info",""),
            market_info=ad.get("market_info",""),
            water_requirement=ad.get("water_requirement",""),
            space_required=ad.get("space_required",""),
        )
        db.add(animal)
        print(f"  + {ad['name']}")
db.commit()

# Diseases
diseases_data = [
    {"name":"Maize Lethal Necrosis (MLN)","type":"crop","affects":"Maize",
     "symptoms":"Yellowing from leaf margins, dead heart, stunted growth, premature tasseling, chaffy cobs",
     "causes":"MCMV + potyvirus combined infection. Spread by thrips, aphids, rootworms",
     "treatment":"No cure. Remove and burn infected plants. Plant MLN-resistant varieties (DH04, KARI MTAMA 1)",
     "prevention":"Certified MLN-resistant seeds, control vectors, crop rotation, avoid maize-maize planting",
     "severity":"critical"},
    {"name":"Coffee Berry Disease (CBD)","type":"crop","affects":"Coffee",
     "symptoms":"Dark sunken lesions on green berries, premature drop, mummified berries",
     "causes":"Colletotrichum kahawae fungus. Favored by wet conditions during fruiting",
     "treatment":"Copper-based fungicides (Copper Oxychloride 50g/20L) or Ortiva. Time with berry development",
     "prevention":"CBD-resistant varieties (Ruiru 11, Batian), regular copper spray program, strip-pick mummies",
     "severity":"high"},
    {"name":"Late Blight (Ugonjwa wa Viazi)","type":"crop","affects":"Potatoes, Tomatoes",
     "symptoms":"Water-soaked spots on leaves, brown-black lesions, white mold on underside, brown rot inside tubers",
     "causes":"Phytophthora infestans oomycete. Cool wet conditions (15-20°C). Rampant in highlands during rains",
     "treatment":"Ridomil Gold MZ (50g/20L), Milraz, or Curzate every 7-10 days from first signs",
     "prevention":"Certified seed, resistant varieties, no overhead irrigation, remove volunteer plants",
     "severity":"high"},
    {"name":"East Coast Fever (ECF)","type":"livestock","affects":"Cattle",
     "symptoms":"High fever 39-41°C, swollen lymph nodes (parotid gland), nasal discharge, labored breathing, weakness, death in 2-3 weeks",
     "causes":"Theileria parva parasite spread by brown ear tick (Rhipicephalus appendiculatus)",
     "treatment":"Buparvazone (Butalex) 2.5mg/kg IM within first 5 days of fever. Supportive: antipyretics, vitamins B and C",
     "prevention":"Regular acaricide dipping every 4-7 days. ITM immunization via DVS. Tick-resistant breeds (Sahiwal x Friesian)",
     "severity":"critical"},
    {"name":"Newcastle Disease (Mdondo wa Kuku)","type":"livestock","affects":"Poultry",
     "symptoms":"Neck twisting (torticollis), paralyzed legs/wings, green watery diarrhea, gasping, sudden death, egg production drop",
     "causes":"Paramyxovirus. Highly contagious via respiratory secretions, fomites, contaminated feed/water",
     "treatment":"No cure. Cull severely affected birds. Supportive care: electrolytes, vitamins in water",
     "prevention":"Strict vaccination (Lasota Day 7, 21, booster every 3 months). Biosecurity: footbath, visitor control",
     "severity":"critical"},
    {"name":"African Swine Fever (ASF)","type":"livestock","affects":"Pigs",
     "symptoms":"High fever, loss of appetite, bleeding from body openings, skin turning purple/red, sudden death. 100% mortality",
     "causes":"ASF virus. Spread by direct contact, ticks (Ornithodoros), contaminated feed, vehicles",
     "treatment":"NO treatment available. No vaccine. Immediate reporting to DVS is MANDATORY",
     "prevention":"Strict biosecurity, no feeding kitchen waste, control ticks, quarantine new animals, report outbreaks immediately",
     "severity":"critical"},
    {"name":"Mastitis (Ugonjwa wa Titi)","type":"livestock","affects":"Dairy Cattle, Dairy Goats",
     "symptoms":"Hot, swollen, painful udder quarter. Watery or clotted milk (flakes). Reduced production. Cow uncomfortable at milking",
     "causes":"Bacteria (Staph, Strep, E.coli) entering via teat canal. Poor milking hygiene, teat injury, tick bites",
     "treatment":"Intra-mammary antibiotics (Mamyzin, Nafpenzal). Systemic penicillin for severe cases. Strip milk every 2 hours",
     "prevention":"Pre-dip and post-dip teats at every milking. Use teat dip (0.5% iodine). Dry cow therapy. Cull chronic cows",
     "severity":"medium"},
    {"name":"Banana Xanthomonas Wilt (BXW)","type":"crop","affects":"Banana",
     "symptoms":"Yellowing and wilting of leaves, premature ripening of fingers, yellow bacterial ooze from cut stem, fruit rot",
     "causes":"Xanthomonas vasicola pv. musacearum. Spreads via infected tools, insects, suckers",
     "treatment":"Remove and destroy ALL infected plants (burn or bury). Disinfect tools with bleach after each cut",
     "prevention":"Use disease-free suckers/tissue culture, disinfect all cutting tools, remove male flower buds early, single stem management",
     "severity":"critical"},
    {"name":"Foot and Mouth Disease (FMD)","type":"livestock","affects":"Cattle, Sheep, Goats, Pigs",
     "symptoms":"Blisters on mouth, tongue, hooves, teats. Excessive salivation, lameness, drop in milk production, fever",
     "causes":"Aphthovirus. 7 serotypes. Highly contagious. Spread by air, contact, contaminated equipment",
     "treatment":"Symptomatic: clean and disinfect blisters, soft food, isolate immediately. Report to DVS",
     "prevention":"Vaccination every 6 months. Movement restrictions. Report outbreaks. Disinfect vehicles",
     "severity":"high"},
    {"name":"Fall Armyworm (Viwavi)","type":"crop","affects":"Maize, Sorghum, Wheat",
     "symptoms":"Ragged feeding on leaves, windows in leaves, frass (sawdust) in whorl, damaged tassels, defoliation",
     "causes":"Spodoptera frugiperda moth larvae. Introduced to Africa 2016. Major threat to cereal production",
     "treatment":"Emamectin benzoate (Escort) or Chlorpyrifos early morning/evening. Sand-ash in whorl for small farms",
     "prevention":"Early planting to avoid peak moth periods. Monitor fields from germination. Intercrop with legumes",
     "severity":"high"},
    {"name":"Rabbit Hemorrhagic Disease (RHD)","type":"livestock","affects":"Rabbits",
     "symptoms":"Sudden death (often no prior symptoms), bloody discharge from nose, convulsions, liver necrosis. 80-100% mortality",
     "causes":"Calicivirus. Highly contagious. Spread by direct contact, contaminated feed, clothing, insects",
     "treatment":"No effective treatment. Supportive care rarely helps. Cull affected colony",
     "prevention":"Annual RHD vaccination is MANDATORY for rabbit farmers. Quarantine new rabbits 2 weeks. Biosecurity",
     "severity":"critical"},
    {"name":"Timber Borer / Stalk Borer (Viwavi wa Mahindi)","type":"crop","affects":"Maize, Sugarcane, Sorghum",
     "symptoms":"Dead heart in young plants, pin-holes in leaves, feeding tunnels in stem, breakage at internodes",
     "causes":"Busseola fusca (African Stem Borer) and Chilo partellus (Spotted Stem Borer) moth larvae",
     "treatment":"Duduthrin (lambda-cyhalothrin) 20ml/20L water. Apply into whorl. Repeat at 2-week intervals",
     "prevention":"Early planting, push-pull technology (Desmodium + Napier), Bt biopesticides, clean field after harvest",
     "severity":"medium"},
    {"name":"PPR (Peste des Petits Ruminants)","type":"livestock","affects":"Goats, Sheep",
     "symptoms":"High fever, nasal/eye discharge, mouth ulcers, pneumonia, severe diarrhea. Death in 1-2 weeks. Up to 80% mortality",
     "causes":"Paramyxovirus (Morbillivirus). Highly contagious among small ruminants. Close contact spread",
     "treatment":"No cure. Supportive: antibiotics for secondary infections, vitamins. Isolate sick animals immediately",
     "prevention":"PPR vaccination every 3 years. Movement control. Report outbreaks to DVS",
     "severity":"critical"},
]

print(f"\n🦠 Seeding {len(diseases_data)} diseases...")
for dd in diseases_data:
    if not db.query(Disease).filter(Disease.name == dd["name"]).first():
        db.add(Disease(**dd))
        print(f"  + {dd['name']}")
db.commit()

db.close()
print(f"\n✅ Database seeded successfully!")
print(f"   Crops: {len(CROPS_DATA)}")
print(f"   Livestock: {len(LIVESTOCK_DATA)}")
print(f"   Diseases: {len(diseases_data)}")
print(f"\n🔐 Admin login: admin@agridss.co.ke / Admin@1234")
print(f"👨‍🌾 Farmer login: farmer@agridss.co.ke / Farmer@1234")
