# Visitor globe

The footer globe is a custom, locally served Cobe 2.0.1 visualization inspired
by https://github.com/Selenium39/umami-maps. Its country coordinate table is
served locally under the upstream MIT license, alongside the vendored Cobe
license. The separate `visitor-globe-service` backend validates country codes.
The vendored renderer redraws after the embedded land-map texture loads, so
a paused or reduced-motion globe still shows continents. A small shader
extension also accepts a country-color texture generated from locally served
Natural Earth map units; see `assets/data/README-globe-regions.md`.

The globe works before statistics are connected, showing the world map and
an explicit disconnected status. It does not invent visits. All region colors
come from aggregate visitor data; there is no owner location or personal
landmark. Controls support rotation, resetting the view, country focus,
dragging, arrow keys, and reduced motion. Rendering pauses outside the
viewport or while the tab is hidden. The renderer loads only when the widget
approaches view.

The public API returns only countries and visit counts. Totals and whole-region
colors are derived in the frontend. Darker green represents more visits, on a
logarithmic scale relative to the busiest country. The globe renders no centroid
markers. A visible light-to-dark legend explains the scale. Countries without
visits stay neutral; unknown locations (`ZZ`) never color unassigned geometry
or affect the color scale.

Visited regions smaller than 12 texture pixels receive a minimum visible
footprint (about 9px at the center of the desktop globe). This expands their
own polygon outline in the same aggregate color after borders are drawn, so
Singapore and similar small regions remain visible without centroid markers.
Unvisited regions retain their original footprint.

The desktop canvas is 500px wide. At scale 1.24, the sphere occupies 99.2% of
that height, reaching almost to the card's top and bottom edges. Only the
text column retains vertical padding. The sphere has 32,000 Fibonacci points;
device pixel ratio is applied once by Cobe. The layout stacks below 900px
and keeps the canvas inside the available width.

## Enable real statistics

1. Deploy the sibling `visitor-globe-service` using its saved Sites project.
2. Make that backend accessible to anonymous visitors, with the owner's
   explicit request to change its audience. GitHub Pages cannot access an
   owner-private Sites endpoint.
3. Set `visitor_globe.endpoint` in `_config.yml` to the published backend's
   full `/api/visitor-globe` URL, rebuild, and publish GitHub Pages.

The frontend POSTs to the sibling `/api/visit` route and refreshes aggregate
counts every minute. Tracking is enabled only on
`flow0314.github.io`; localhost previews only read data. DNT/GPC
opt-out signals disable recording but allow the globe to be viewed.

## Counting rules

“Visits” means browsing sessions, not pageviews or unique people. A random
session ID lives in sessionStorage. Reloads in the same tab reuse it for
30 minutes after the last recorded navigation. A new tab or a navigation
after 30 minutes creates another visit. The backend hashes the ID and uses
a unique database key, so concurrent retries cannot inflate a session.
Blocking browser storage can cause reloads to count separately.

Country/region is derived from Cloudflare's server-side GeoIP, never from
browser-submitted coordinates. Unknown locations count toward visits but
do not color the map. The map uses country/region boundaries rather than
individual locations. Approximate centroids are used only to rotate the camera
when a country button is selected. All-time counts begin at activation and cannot
recover traffic from before installation. Internal session dates use
Asia/Shanghai and are never included in the public API.

Known bots and opted-out browsers are skipped. Public counters are approximate:
ad blockers can hide visits, and Origin checks are not complete bot protection.
Only anonymous aggregate country counts are returned to browsers. No API
keys, IP addresses, location lookups, or Umami credentials are sent by the
homepage. Cloudflare and Sites still process requests to host the service.

For rendering checks, make `@napi-rs/canvas` available on `NODE_PATH` and run
`node scripts/test_globe_regions.cjs`. The checks exercise real polygon painting,
equal color across a country, progressively darker colors, unknown-location
handling, and date-line clipping without writing any live visitor data.
