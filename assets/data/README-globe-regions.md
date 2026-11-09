# Visitor globe boundaries

`globe-regions.json` is generated from Natural Earth's public-domain 1:50m
Admin 0 map units. Dependencies and geographic units are kept separate so
the visitor API's two-letter region codes can color the appropriate geometry.

Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_map_units.geojson

Terms: https://www.naturalearthdata.com/about/terms-of-use/

Rebuild with `python3 scripts/build_globe_regions.py SOURCE.geojson`.
The script retains polygons and holes, unwraps the date line, simplifies at
0.035 degrees, rounds to three decimals, and drops unused properties.
`ISO_A2_EH` maps the geographic units to the same ISO-style codes as the
aggregate statistics endpoint; unassigned geometry remains neutral land.
