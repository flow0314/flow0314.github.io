// Natural Earth map units are public domain; see assets/data/README-globe-regions.md.
export const NEUTRAL = [190, 202, 174];
export const LOW = [162, 195, 153];
export const HIGH = [25, 101, 62];

export function regionColor(visits, peak) {
  if (!visits) return `rgb(${NEUTRAL.join(',')})`;
  const intensity = Math.min(1, Math.log1p(visits) / Math.log1p(Math.max(1, peak)));
  return `rgb(${LOW.map((value, i) => Math.round(value + (HIGH[i] - value) * intensity)).join(',')})`;
}

// The same equirectangular projection is used by Cobe's sphere shader.
export function project([longitude, latitude], width, height) {
  return [(longitude + 180) / 360 * width, (90 - latitude) / 180 * height];
}

export async function createCountryMap() {
  const response = await fetch(new URL('../data/globe-regions.json', import.meta.url), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Country boundaries unavailable');
  const regions = await response.json();
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  const paths = regions.map(region => {
    const path = new Path2D();
    const points = region.polygons.flat(2);
    const longitudes = points.map(point => point[0]);
    const latitudes = points.map(point => point[1]);
    const span = Math.max(Math.max(...longitudes) - Math.min(...longitudes),
      Math.max(...latitudes) - Math.min(...latitudes)) * canvas.width / 360;
    for (const polygon of region.polygons) {
      const anchor = polygon[0].reduce((sum, point) => sum + point[0], 0) / polygon[0].length;
      for (const ring of polygon) {
        const center = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
        const shift = Math.round((anchor - center) / 360) * 360;
        for (const offset of [-360, 0, 360]) {
          ring.forEach(([lon, lat], i) => {
            const [x, y] = project([lon + shift + offset, lat], canvas.width, canvas.height);
            if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
          });
          path.closePath();
        }
      }
    }
    // A tiny visited region needs a visible footprint at the globe's scale.
    // Expand its own outline, rather than substituting a centroid marker.
    return { code: region.code, path, visibilityStroke: Math.max(0, 12 - span) };
  });
  let signature = null;
  return {
    paint(countries) {
      const next = countries.map(({ country, visits }) => `${country}:${visits}`).sort().join('|');
      if (next === signature) return canvas;
      signature = next;
      // Unknown locations must never tint unassigned geometry or set the scale.
      const counts = new Map(countries.filter(({ country }) => country !== 'ZZ').map(({ country, visits }) => [country, visits]));
      const peak = Math.max(1, ...counts.values());
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const { code, path } of paths) {
        context.fillStyle = regionColor(counts.get(code) || 0, peak);
        context.fill(path, 'evenodd');
      }
      // Subtle boundaries make adjacent countries with similar counts legible.
      context.strokeStyle = 'rgba(239,244,235,.6)';
      context.lineWidth = .55;
      for (const { path } of paths) context.stroke(path);
      // Draw after borders/neighboring land so islands such as Singapore are
      // not erased by a pale boundary or another region. Unvisited land stays
      // at its geographic size; only the footprint changes, never the count.
      context.save();
      context.lineJoin = 'round';
      context.lineCap = 'round';
      for (const { code, path, visibilityStroke } of paths) {
        if (!visibilityStroke || !counts.has(code)) continue;
        context.fillStyle = context.strokeStyle = regionColor(counts.get(code), peak);
        context.lineWidth = visibilityStroke;
        context.stroke(path);
        context.fill(path, 'evenodd');
      }
      context.restore();
      return canvas;
    }
  };
}
