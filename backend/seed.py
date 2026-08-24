import os, sys, json
from dotenv import load_dotenv
_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(_env, override=True)

from models.database import SessionLocal, Base, engine, User, Crop, Animal, Disease
from models.auth import hash_password

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        print("🌱 Seeding AgriDSS Kenya database...")

        # ── Users ──
        if not db.query(User).filter(User.email=="admin@agridss.co.ke").first():
            db.add(User(name="AgriDSS Admin",email="admin@agridss.co.ke",
                hashed_password=hash_password("Admin@1234"),role="admin",
                county="Nairobi",constituency="Westlands"))
            print("  ✅ Admin created")

        if not db.query(User).filter(User.email=="farmer@agridss.co.ke").first():
            db.add(User(name="Demo Farmer",email="farmer@agridss.co.ke",
                hashed_password=hash_password("Farmer@1234"),role="farmer",
                county="Murang'a",constituency="Murang'a South",ward="Township"))
            print("  ✅ Farmer created")
        db.commit()

        # ── FORCE clear and reseed crops ──
        print("  🔄 Clearing old crops...")
        db.query(Crop).delete()
        db.commit()

        from data.crops_db import get_all_crops
        from data.image_urls import get_crop_image
        crops = get_all_crops()
        for c in crops:
            db.add(Crop(
                name=c["name"], category=c["category"],
                subcategory=c.get("subcategory",""),
                varieties=json.dumps(c.get("varieties",[])),
                suitable_aez=json.dumps(c.get("suitable_aez",[])),
                rainfall_min_mm=c.get("rainfall_min_mm",400),
                rainfall_max_mm=c.get("rainfall_max_mm",1600),
                altitude_min_m=c.get("altitude_min_m",0),
                altitude_max_m=c.get("altitude_max_m",3000),
                water_requirement=c.get("water_requirement","moderate"),
                soil_types=json.dumps(c.get("soil_types",[])),
                planting_months=json.dumps(c.get("planting_months",[])),
                maturity_days=c.get("maturity_days",90),
                description=c.get("description",""),
                care_tips=c.get("care_tips",""),
                expected_yield=c.get("expected_yield",""),
                market_price_ksh=c.get("market_price_ksh",""),
                diseases=json.dumps(c.get("diseases",[])),
                best_counties=json.dumps(c.get("best_counties",[])),
                image_url=get_crop_image(c["name"])  # NEW: Add image URL
            ))
        db.commit()
        print(f"  ✅ {db.query(Crop).count()} crops seeded with images")

        # ── FORCE clear and reseed livestock ──
        print("  🔄 Clearing old livestock...")
        db.query(Animal).delete()
        db.commit()

        from data.livestock_db import get_all_livestock
        from data.image_urls import get_livestock_image
        animals = get_all_livestock()
        for a in animals:
            db.add(Animal(
                name=a["name"], category=a["category"],
                purpose=a.get("purpose",""),
                breeds=json.dumps(a.get("breeds",[])),
                suitable_aez=json.dumps(a.get("suitable_aez",[])),
                description=a.get("description",""),
                feeding_guide=a.get("feeding_guide",""),
                housing_requirements=a.get("housing_requirements",""),
                vaccination_schedule=json.dumps(a.get("vaccination_schedule",[])),
                common_diseases=json.dumps(a.get("common_diseases",[])),
                breeding_info=a.get("breeding_info",""),
                market_info=a.get("market_info",""),
                water_requirement=a.get("water_requirement",""),
                space_required=a.get("space_required",""),
                image_url=get_livestock_image(a["name"])  # NEW: Add image URL
            ))
        db.commit()
        print(f"  ✅ {db.query(Animal).count()} livestock seeded with images")

        # ── FORCE clear and reseed diseases ──
        print("  🔄 Clearing old diseases...")
        db.query(Disease).delete()
        db.commit()

        from data.diseases_db import get_all_diseases
        diseases = get_all_diseases()
        for d in diseases:
            db.add(Disease(
                name=d["name"], type=d["type"],
                affects=d.get("affects",""),
                symptoms=d.get("symptoms",""),
                causes=d.get("causes",""),
                treatment=d.get("treatment",""),
                prevention=d.get("prevention",""),
                severity=d.get("severity","medium")
            ))
        db.commit()
        print(f"  ✅ {db.query(Disease).count()} diseases seeded")

        print(f"\n🎉 Database seeded successfully!")
        print(f"   Crops: {db.query(Crop).count()}")
        print(f"   Livestock: {db.query(Animal).count()}")
        print(f"   Diseases: {db.query(Disease).count()}")
        print(f"   Users: {db.query(User).count()}")
        print(f"\n🔐 Admin: admin@agridss.co.ke / Admin@1234")
        print(f"👨‍🌾 Farmer: farmer@agridss.co.ke / Farmer@1234")

    except Exception as e:
        print(f"❌ Seed error: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
