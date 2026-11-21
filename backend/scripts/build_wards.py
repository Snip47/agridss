"""One-off build script: turns the full IEBC ward GeoJSON into a compact
gzip file the API loads at startup (no shapely needed at runtime).

Source: github.com/tigawanna/kenya_wards_geojson_data (MIT)
Usage:  python scripts/build_wards.py path/to/wards.geojson
"""
import gzip, json, sys
from shapely.geometry import shape, mapping

SRC = sys.argv[1]
OUT = "data/kenya_wards.json.gz"
TOL = 0.0008      # ~90 m simplification
PREC = 4          # ~11 m coordinate precision

def title(s):
    out = []
    for w in s.strip().split(" "):
        parts = []
        for p in w.split("/"):
            sub = "-".join(x.capitalize() for x in p.split("-"))
            # keep apostrophes tidy: MURANG'A -> Murang'a
            parts.append(sub)
        out.append("/".join(parts))
    return " ".join(out)

data = json.load(open(SRC))

# A few wards (Lamu West) have no county in the source; fill from the constituency table.
import os
_cons = os.path.join(os.path.dirname(SRC), "..", "constituencies", "constituencies.json")
CONS_TO_COUNTY = {c["constituency_name"]: c["county_name"] for c in json.load(open(_cons))}
wards = []

# --- clean-up of source label errors -------------------------------------
import re, collections
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from data.kenya_locations import KENYA_LOCATIONS
_n = lambda x: re.sub(r"[^a-z0-9]", "", x.lower())
CANON = {_n(k): k for k in KENYA_LOCATIONS}
CANON.update({"elegeyomarakwet": "Elgeyo-Marakwet", "elgeyomarakwet": "Elgeyo-Marakwet",
              "konoin": "Bomet", "lamuwest": "Lamu"})
def canon_county(name):
    return CANON.get(_n(name), title(name))

for f in data["features"]:
    p = dict(f["properties"])
    if not p.get("county_name"):
        p["county_name"] = CONS_TO_COUNTY[p["constituency_name"]]
    g = shape(f["geometry"])
    if not g.is_valid:
        g = g.buffer(0)
    s = g.simplify(TOL, preserve_topology=True)
    if s.is_empty:
        s = g
    polys = [s] if s.geom_type == "Polygon" else list(s.geoms)
    rings = []
    for poly in polys:
        ext = [[round(x, PREC), round(y, PREC)] for x, y in poly.exterior.coords]
        holes = [[[round(x, PREC), round(y, PREC)] for x, y in h.coords] for h in poly.interiors]
        rings.append([ext] + holes)
    wards.append({
        "c": canon_county(p["county_name"]),
        "k": title(p["constituency_name"]),
        "w": title(p["ward_name"]),
        "p": rings,
    })

# A constituency lies wholly inside one county: take the majority label.
votes = collections.defaultdict(collections.Counter)
for w in wards:
    votes[w["k"]][w["c"]] += 1
for w in wards:
    w["c"] = votes[w["k"]].most_common(1)[0][0]

assert {w["c"] for w in wards} == set(KENYA_LOCATIONS), "county set mismatch"

with gzip.open(OUT, "wt", encoding="utf-8", compresslevel=9) as fh:
    json.dump(wards, fh, separators=(",", ":"))
print(len(wards), "wards written to", OUT)
