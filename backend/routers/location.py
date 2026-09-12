from fastapi import APIRouter, HTTPException
from data.kenya_locations import KENYA_LOCATIONS

router = APIRouter()

def normalize(s: str) -> str:
    return s.lower().replace("'","").replace("\u2019","").replace("`","").strip()

def find_county(county: str):
    for k in KENYA_LOCATIONS:
        if normalize(k) == normalize(county):
            return k
    return None

@router.get("/counties")
def get_counties():
    return sorted(KENYA_LOCATIONS.keys())

@router.get("/constituencies")
def get_constituencies(county: str):
    key = find_county(county)
    if not key:
        raise HTTPException(404, f"County '{county}' not found")
    return sorted(KENYA_LOCATIONS[key].keys())

@router.get("/wards")
def get_wards(county: str, constituency: str):
    key = find_county(county)
    if not key:
        raise HTTPException(404, f"County '{county}' not found")
    for c in KENYA_LOCATIONS[key]:
        if c.lower().strip() == constituency.lower().strip():
            return sorted(KENYA_LOCATIONS[key][c])
    raise HTTPException(404, f"Constituency '{constituency}' not found")
