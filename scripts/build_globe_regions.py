"""Reduce Natural Earth's public-domain 1:50m map units for the visitor globe.

Usage: python3 scripts/build_globe_regions.py /path/to/ne_50m_admin_0_map_units.geojson
Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_map_units.geojson
"""
import json
import re
import sys
from pathlib import Path


def simplify_ring(ring, tolerance=0.035):
    # Unwrap the date line before simplifying; rasterization clips translated
    # copies, so Russia, Fiji and other islands cannot acquire a world-wide fill.
    points = []
    for lon, lat, *_ in ring:
        if points:
            lon += round((points[-1][0] - lon) / 360) * 360
        points.append((lon, lat))
    keep = {0, len(points) - 1}
    stack = [(0, len(points) - 1)]
    while stack:
        start, end = stack.pop()
        ax, ay = points[start]
        bx, by = points[end]
        dx, dy = bx - ax, by - ay
        length = dx * dx + dy * dy
        furthest, index = 0, None
        for i in range(start + 1, end):
            px, py = points[i]
            t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / length)) if length else 0
            distance = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if distance > furthest:
                furthest, index = distance, i
        if index is not None and furthest > tolerance * tolerance:
            keep.add(index)
            stack.extend([(start, index), (index, end)])
    result = [points[i] for i in sorted(keep)]
    if len(result) < 4:
        result = points
    return [[round(x, 3), round(y, 3)] for x, y in result]


def build(source):
    regions = []
    for feature in source["features"]:
        properties = feature["properties"]
        code = properties.get("ISO_A2_EH", "")
        # These map units share an ISO country code in the visitor API.
        code = {"Somaliland": "SO", "Northern Cyprus": "CY", "Jan Mayen": "SJ"}.get(properties.get("GEOUNIT"), code)
        if not re.fullmatch("[A-Z]{2}", code):
            code = "ZZ"  # Unassigned geometry is neutral land, never invented visits.
        geometry = feature["geometry"]
        polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
        regions.append({"code": code, "polygons": [[simplify_ring(ring) for ring in polygon] for polygon in polygons]})
    return regions


if __name__ == "__main__":
    regions = build(json.loads(Path(sys.argv[1]).read_text()))
    target = Path(__file__).resolve().parents[1] / "assets/data/globe-regions.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(regions, separators=(",", ":")) + "\n")
    print(f"Saved {len(regions)} map units, {target.stat().st_size:,} bytes")
