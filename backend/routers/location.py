from fastapi import APIRouter, HTTPException
from data.kenya_locations import KENYA_LOCATIONS

router = APIRouter()

def normalize(s: str) -> str:
    return s.lower().replace("'","").replace("'","").replace("`","").strip()

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
    data = KENYA_LOCATIONS[key]
    # Support both flat {constituency: [wards]} and nested {constituencies: {}}
    if isinstance(data, dict) and "constituencies" in data:
        return sorted(data["constituencies"].keys())
    return sorted(data.keys())

@router.get("/wards")
def get_wards(county: str, constituency: str):
    key = find_county(county)
    if not key:
        raise HTTPException(404, f"County '{county}' not found")
    data = KENYA_LOCATIONS[key]
    # Support both structures
    if isinstance(data, dict) and "constituencies" in data:
        constituencies = data["constituencies"]
        for c in constituencies:
            if c.lower().strip() == constituency.lower().strip():
                val = constituencies[c]
                if isinstance(val, dict) and "wards" in val:
                    return sorted(val["wards"])
                if isinstance(val, list):
                    return sorted(val)
    else:
        for c in data:
            if c.lower().strip() == constituency.lower().strip():
                return sorted(data[c])
    raise HTTPException(404, f"Constituency '{constituency}' not found")
