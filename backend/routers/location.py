from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from data.kenya_locations import KENYA_LOCATIONS
from services.geo import resolve

router = APIRouter()


def normalize(s: str) -> str:
    return s.lower().replace("'", "").replace("\u2019", "").replace("`", "").strip()


def find_county(county: str):
    for k in KENYA_LOCATIONS:
        if normalize(k) == normalize(county):
            return k
    return None


class ResolveReq(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


@router.post("/resolve")
def resolve_location(data: ResolveReq):
    """Turn GPS coordinates into county, constituency and ward.
    Public (needed at sign-up). Coordinates are NOT stored."""
    found = resolve(data.lat, data.lng)
    if not found:
        raise HTTPException(
            404,
            "We could not match your position to a Kenyan ward. "
            "Please make sure you are in Kenya and try again outdoors or with better signal.",
        )
    return found


# Kept for backwards compatibility (lookup lists)
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
