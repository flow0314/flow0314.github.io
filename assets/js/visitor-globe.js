// Custom homepage globe, inspired by Selenium39/umami-maps (MIT).
// Cobe 2.0.1 is vendored locally; no runtime CDN dependency.
import COUNTRY_COORDINATES from './globe-countries.js';

const root = document.querySelector('[data-visitor-globe]');

if (root) {
  const canvas = root.querySelector('canvas');
  const status = root.querySelector('.visitor-globe-status');
  const spinButton = root.querySelector('[data-globe-spin]');
  const places = root.querySelector('.visitor-globe-places');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const DEFAULT_VIEW = { phi: 0, theta: .2 };
  const TAU = Math.PI * 2;
  const sessionKey = 'flow-visitor-session-v1';
  let globe, countryMap, frame, lastFrame = 0, data = null, target = null;
  let { phi, theta } = DEFAULT_VIEW;
  let spinning = !reducedMotion.matches;
  let visible = false, dragging = null, starting = false;
  let refreshTimer, destroyed = false;

  function syncControls() {
    spinButton.setAttribute('aria-pressed', String(spinning));
    spinButton.textContent = spinning ? 'Pause rotation' : 'Resume rotation';
  }

  function geometry() {
    // Visits color complete country/region polygons; no centroid markers.
    return { markers: [], countryMap: countryMap?.paint(data?.countries || []) };
  }

  function draw(now = 0) {
    frame = null;
    if (!globe || destroyed || !visible || document.hidden) return;
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, .05) : 0;
    lastFrame = now;
    if (target) {
      const difference = ((target.phi - phi + Math.PI) % TAU + TAU) % TAU - Math.PI;
      phi += difference * .12;
      theta += (target.theta - theta) * .12;
      if (Math.abs(difference) + Math.abs(target.theta - theta) < .002) target = null;
    } else if (spinning && !dragging) phi += delta * .12;
    globe.update({ phi, theta });
    if (spinning || target || dragging) schedule();
  }

  function schedule() {
    if (!frame && globe && visible && !document.hidden && !destroyed) frame = requestAnimationFrame(draw);
  }

  async function startGlobe() {
    if (globe || starting || destroyed) return;
    starting = true;
    try {
      const contextOptions = { alpha: true, stencil: false, antialias: true, depth: false, preserveDrawingBuffer: false };
      if (!canvas.getContext('webgl2', contextOptions) && !canvas.getContext('webgl', contextOptions)) throw new Error('WebGL unavailable');
      const [{ default: createGlobe }, { createCountryMap }] = await Promise.all([
        import('./vendor/cobe/cobe.esm.js?v=2.0.1-regions1'),
        import('./globe-choropleth.js?v=small-regions2'),
      ]);
      countryMap = await createCountryMap();
      if (destroyed) return;
      const size = Math.max(1, canvas.clientWidth);
      const ratio = Math.min(devicePixelRatio || 1, 2);
      globe = createGlobe(canvas, {
        devicePixelRatio: ratio, width: size, height: size,
        phi, theta, dark: 0, diffuse: 1.25, mapSamples: 32000,
        mapBrightness: 5.5, baseColor: [.9, .92, .86],
        markerColor: [.2, .48, .36], glowColor: [.84, .86, .77],
        // Cobe's sphere occupies 80% of its canvas at scale 1; fill 99.2%.
        scale: 1.24, markerElevation: .015,
        ...geometry(),
      });
      schedule();
    } catch {
      root.querySelector('.visitor-globe-fallback').hidden = false;
      canvas.style.visibility = 'hidden';
    }
  }

  function focusView(next) {
    spinning = false;
    if (reducedMotion.matches) { phi = next.phi; theta = next.theta; target = null; }
    else target = next;
    syncControls();
    schedule();
  }

  function focusLocation(location) {
    focusView({ phi: Math.PI * 1.5 - location[1] * Math.PI / 180, theta: location[0] * Math.PI / 180 });
  }

  function applyStats(payload) {
    if (!payload || !Array.isArray(payload.countries) || payload.countries.length > 260) throw new Error('Invalid statistics');
    const seen = new Set();
    let totalVisits = 0;
    const markers = [];
    for (const row of payload.countries) {
      if (!row || !/^[A-Z]{2}$/.test(row.country) || !Number.isSafeInteger(row.visits) || row.visits < 1 || seen.has(row.country)) throw new Error('Invalid country counts');
      seen.add(row.country); totalVisits += row.visits;
      if (COUNTRY_COORDINATES[row.country]) markers.push({ ...row, location: COUNTRY_COORDINATES[row.country] });
    }
    if (!Number.isSafeInteger(totalVisits)) throw new Error('Invalid total');
    markers.sort((a, b) => b.visits - a.visits || a.country.localeCompare(b.country));
    data = { totalVisits, markers, countries: payload.countries };
    root.querySelector('[data-globe-visits]').textContent = totalVisits.toLocaleString();
    root.querySelector('[data-globe-countries]').textContent = markers.length.toLocaleString();
    const regions = new Intl.DisplayNames(['en'], { type: 'region' });
    places.replaceChildren();
    markers.forEach(marker => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${regions.of(marker.country)} · ${marker.visits.toLocaleString()}`;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        for (const place of places.querySelectorAll('button')) place.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-pressed', 'true');
        focusLocation(marker.location);
      });
      item.append(button); places.append(item);
    });
    status.textContent = totalVisits ? 'Country and region colors show where visits come from. Thanks for visiting!' : 'The observatory is ready for its first visit.';
    globe?.update(geometry());
    schedule();
  }

  const endpoint = root.dataset.endpoint.trim();
  const production = location.hostname === 'flow0314.github.io';
  function sessionId() {
    const now = Date.now();
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(sessionKey)); } catch { /* Storage may be unavailable. */ }
    if (!saved || !/^[\da-f-]{36}$/i.test(saved.id) || !Number.isFinite(saved.lastSeen) || now - saved.lastSeen >= 1800000 || saved.lastSeen > now) {
      saved = { id: crypto.randomUUID() };
    }
    saved.lastSeen = now;
    try { sessionStorage.setItem(sessionKey, JSON.stringify(saved)); } catch { /* The server still deduplicates retries. */ }
    return saved.id;
  }

  async function loadStats(record = false) {
    if (!endpoint || destroyed) return;
    try {
      const url = new URL(endpoint);
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('Invalid endpoint');
      let response;
      // Previewing localhost never sends visitor telemetry to production.
      if (record && production && navigator.doNotTrack !== '1' && !navigator.globalPrivacyControl) {
        const visitUrl = new URL('visit', url.href.replace(/visitor-globe\/?$/, ''));
        response = await fetch(visitUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId() }), credentials: 'omit',
          signal: AbortSignal.timeout(8000),
        });
      } else response = await fetch(url, { credentials: 'omit', signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Statistics unavailable');
      applyStats(await response.json());
    } catch {
      status.textContent = data ? 'Showing the latest available counts. Reconnecting…' : 'Visitor statistics are temporarily unavailable.';
    }
  }

  spinButton.addEventListener('click', () => { spinning = !spinning; target = null; syncControls(); schedule(); });
  root.querySelector('[data-globe-reset]').addEventListener('click', () => {
    for (const place of places.querySelectorAll('button')) place.setAttribute('aria-pressed', 'false');
    focusView(DEFAULT_VIEW);
  });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = { id: event.pointerId, x: event.clientX, phi };
    target = null;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
    schedule();
  });
  canvas.addEventListener('pointermove', event => {
    if (!dragging || dragging.id !== event.pointerId) return;
    phi = dragging.phi + (event.clientX - dragging.x) / 160;
    schedule();
  });
  function endDrag() { dragging = null; canvas.classList.remove('is-dragging'); schedule(); }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault(); target = null; spinning = false;
    if (event.key === 'ArrowLeft') phi -= .18;
    if (event.key === 'ArrowRight') phi += .18;
    if (event.key === 'ArrowUp') theta = Math.min(1.35, theta + .12);
    if (event.key === 'ArrowDown') theta = Math.max(-1.35, theta - .12);
    syncControls(); schedule();
  });
  new ResizeObserver(() => {
    if (!globe) return;
    globe.update({ width: canvas.clientWidth, height: canvas.clientWidth }); schedule();
  }).observe(canvas);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    lastFrame = 0;
    if (visible) { startGlobe(); schedule(); }
  }, { rootMargin: '120px' });
  observer.observe(root);
  document.addEventListener('visibilitychange', () => {
    lastFrame = 0; schedule();
    if (!document.hidden) loadStats(false);
  });
  reducedMotion.addEventListener('change', event => { if (event.matches) spinning = false; syncControls(); schedule(); });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    destroyed = true; cancelAnimationFrame(frame); clearInterval(refreshTimer); observer.disconnect(); globe?.destroy();
  });
  syncControls();
  if (endpoint) {
    loadStats(true);
    refreshTimer = setInterval(() => { if (!document.hidden) loadStats(false); }, 60000);
  } else status.textContent = 'The globe is ready. Visitor statistics are not connected yet.';
}
