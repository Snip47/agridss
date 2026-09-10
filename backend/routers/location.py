from fastapi import APIRouter, HTTPException
from data.kenya_locations import KENYA_LOCATIONS

router = APIRouter()

@router.get("/counties")
def get_counties():
    return sorted(KENYA_LOCATIONS.keys())

@router.get("/constituencies")
def get_constituencies(county: str):
    # normalize to find match
    for k in KENYA_LOCATIONS:
        if k.lower().replace("'","").replace("'","").strip() == county.lower().replace("'","").replace("'","").strip():
            return sorted(KENYA_LOCATIONS[k].keys())
    raise HTTPException(404, f"County '{county}' not found")

@router.get("/wards")
def get_wards(county: str, constituency: str):
    for k in KENYA_LOCATIONS:
        if k.lower().replace("'","").replace("'","").strip() == county.lower().replace("'","").replace("'","").strip():
            county_data = KENYA_LOCATIONS[k]
            for c in county_data:
                if c.lower().strip() == constituency.lower().strip():
                    return sorted(county_data[c])
            raise HTTPException(404, f"Constituency '{constituency}' not found in {county}")
    raise HTTPException(404, f"County '{county}' not found")
