"""Point-in-polygon lookup: GPS coordinates -> county / constituency / ward.

Uses the simplified IEBC ward boundaries in data/kenya_wards.json.gz
(source: github.com/tigawanna/kenya_wards_geojson_data, MIT).
Pure Python on purpose: no shapely/GDAL, so it deploys anywhere.
"""
import gzip
import json
import math
import os
from functools import lru_cache
from typing import Optional

_DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "kenya_wards.json.gz")

# If a point falls in a tiny gap between simplified polygons (or just offshore /
# on a lake shore) we accept the nearest ward within this distance.
NEAREST_MAX_KM = 3.0
KM_PER_DEG = 111.32


@lru_cache(maxsize=1)
def _load():
    with gzip.open(_DATA, "rt", encoding="utf-8") as fh:
        raw = json.load(fh)
    wards = []
    for w in raw:
        minx = miny = 1e9
        maxx = maxy = -1e9
        for poly in w["p"]:
            for x, y in poly[0]:
                if x < minx: minx = x
                if x > maxx: maxx = x
                if y < miny: miny = y
                if y > maxy: maxy = y
        wards.append({"c": w["c"], "k": w["k"], "w": w["w"], "p": w["p"],
                      "bbox": (minx, miny, maxx, maxy)})
    return wards


def _in_ring(x: float, y: float, ring) -> bool:
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def _in_polygon(x: float, y: float, poly) -> bool:
    """poly = [exterior, hole1, hole2, ...]"""
    if not _in_ring(x, y, poly[0]):
        return False
    return not any(_in_ring(x, y, h) for h in poly[1:])


def _dist_km_to_ring(x: float, y: float, ring) -> float:
    kx = math.cos(math.radians(y)) * KM_PER_DEG
    ky = KM_PER_DEG
    best = 1e12
    for i in range(len(ring) - 1):
        ax, ay = (ring[i][0] - x) * kx, (ring[i][1] - y) * ky
        bx, by = (ring[i + 1][0] - x) * kx, (ring[i + 1][1] - y) * ky
        dx, dy = bx - ax, by - ay
        seg = dx * dx + dy * dy
        t = 0.0 if seg == 0 else max(0.0, min(1.0, -(ax * dx + ay * dy) / seg))
        px, py = ax + t * dx, ay + t * dy
        d = math.hypot(px, py)
        if d < best:
            best = d
    return best


def resolve(lat: float, lng: float) -> Optional[dict]:
    """Return {county, constituency, ward, approximate} or None if outside Kenya."""
    wards = _load()
    x, y = lng, lat

    for w in wards:
        minx, miny, maxx, maxy = w["bbox"]
        if x < minx or x > maxx or y < miny or y > maxy:
            continue
        for poly in w["p"]:
            if _in_polygon(x, y, poly):
                return {"county": w["c"], "constituency": w["k"], "ward": w["w"], "approximate": False}

    # Fallback: nearest ward boundary within NEAREST_MAX_KM
    pad = NEAREST_MAX_KM / KM_PER_DEG + 0.01
    best, best_d = None, 1e12
    for w in wards:
        minx, miny, maxx, maxy = w["bbox"]
        if x < minx - pad or x > maxx + pad or y < miny - pad or y > maxy + pad:
            continue
        for poly in w["p"]:
            d = _dist_km_to_ring(x, y, poly[0])
            if d < best_d:
                best, best_d = w, d
    if best is not None and best_d <= NEAREST_MAX_KM:
        return {"county": best["c"], "constituency": best["k"], "ward": best["w"], "approximate": True}
    return None
