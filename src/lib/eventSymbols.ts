// Map symbols for the focused event (geopulse_episodes): hatched areas, track, markers and date labels.

// same RGB as the event markers (eventColor)
export const TYPE_COLORS: Record<string, number[]> = {
  EQ: [101, 141, 27], TC: [218, 41, 28], DR: [128, 49, 167],
  FL: [0, 176, 185], VO: [242, 169, 0], WF: [255, 130, 0],
};
const typeColor = (t: string) => TYPE_COLORS[t] ?? [217, 217, 217];
const WHITE = [255, 255, 255, 255];

// ---- shapes for CIM marker frames (y up, rings clockwise, closed) ----
type Ring = number[][];
const circle = (r: number, n = 32): Ring =>
  Array.from({ length: n + 1 }, (_, i) => [r * Math.cos((-2 * Math.PI * i) / n), r * Math.sin((-2 * Math.PI * i) / n)]);
const bezier = (p0: number[], c: number[], p1: number[], n = 12): Ring =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
  });
const star = (outer: number, inner: number): Ring =>
  Array.from({ length: 11 }, (_, i) => {
    const r = i % 2 ? inner : outer, a = Math.PI / 2 - (i * Math.PI) / 5;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
// mountain with a notched crater
const VOLCANO: Ring = [[-10, -8], [-3, 7], [-1.5, 5.5], [1.5, 5.5], [3, 7], [10, -8], [-10, -8]];

// ---- CIM building blocks ----
const fill = (color: number[]) => ({ type: "CIMSolidFill", enable: true, color });
const stroke = (width: number, color: number[]) => ({ type: "CIMSolidStroke", enable: true, width, color });
const marker = (rings: Ring[], size: number, half: number, layers: any[]) => ({
  type: "CIMVectorMarker", enable: true, size, rotation: 0,
  frame: { xmin: -half, ymin: -half, xmax: half, ymax: half },
  markerGraphics: rings.map((ring) => ({
    type: "CIMMarkerGraphic", geometry: { rings: [ring] },
    symbol: { type: "CIMPolygonSymbol", symbolLayers: layers },
  })),
});
const cim = (symbol: any) => ({ type: "cim", data: { type: "CIMSymbolReference", symbol } });
const pointSymbol = (...layers: any[]) => cim({ type: "CIMPointSymbol", symbolLayers: layers }); // first layer on top
const glyph = (ring: Ring, size: number, color: number[]) =>
  pointSymbol(marker([ring], size, 10, [stroke(1.5, WHITE), fill([...color, 255])]));

// ---- tropical cyclone: dark two-arm spiral with a white halo around a dot in the event colour ----
// disk + top arm sweeping left→right + its 180° copy
const cycloneRings = (southern: boolean) => {
  const arm = [...bezier([-6, 1], [-6, 11], [9, 11]), ...bezier([9, 11], [2, 8], [5, 3]).slice(1), [-6, 1]];
  const rings = [circle(6), arm, arm.map(([x, y]) => [-x, -y])];
  return southern ? rings.map((r) => r.map(([x, y]) => [-x, y]).reverse()) : rings; // mirrored, still clockwise
};
export const cycloneSymbol = (color: number[], southern: boolean) => {
  const rings = cycloneRings(southern);
  return pointSymbol(
    marker([circle(5)], 7, 5, [stroke(0.75, WHITE), fill([...color, 255])]),
    marker(rings, 26, 12, [fill([30, 30, 30, 255])]),
    marker(rings, 26, 12, [stroke(2, [255, 255, 255, 230])]), // halo under the fill = outer edge only
  );
};
// 36 copies with the spiral (layers 1–2) rotated 10° apart; NH counter-clockwise, SH clockwise.
// (ArcGIS CIM rotation animations don't render on our GraphicsLayer, so the caller swaps these on a timer.)
export const spinFrames = (symbol: any, southern: boolean) => {
  const base = JSON.stringify(symbol.data);
  return Array.from({ length: 36 }, (_, i) => {
    const d = JSON.parse(base);
    d.symbol.symbolLayers.slice(1).forEach((l: any) => (l.rotation = (southern ? -10 : 10) * i));
    return { type: "cim", data: d };
  });
};

// ---- TC uncertainty cone and volcanic ash: light grey outline + thin grey diagonal stripes ----
export const HATCHED_ROLES = new Set(["cone", "ash"]);
// (earthquake weak-shaking contours use it with their red contour line as the outline)
export const hatchedArea = (outline = [210, 210, 210, 180], width = 0.75) =>
  cim({
    type: "CIMPolygonSymbol",
    symbolLayers: [
      stroke(width, outline),
      {
        type: "CIMHatchFill", enable: true, rotation: 45, separation: 5,
        lineSymbol: { type: "CIMLineSymbol", symbolLayers: [stroke(0.6, [200, 200, 200, 120])] },
      },
    ],
  });

// ---- symbol for a geopulse_episodes point (layer 1) or line (layer 2) ----
export const episodeSymbol = (a: any, geom?: any): any => {
  const color = typeColor(a.eventtype);
  switch (a.role) {
    case "track_line":
      return { type: "simple-line", color: [255, 255, 255, 0.8], width: 1.5 };
    case "track_point":
      return a.forecast == 1
        ? { type: "simple-marker", size: 6, color: [0, 0, 0, 0], outline: { color: [255, 255, 255, 0.9], width: 1.2 } } // forecast: hollow ring
        : { type: "simple-marker", size: 4, color: [255, 255, 255, 0.9], outline: null }; // past: small dot
    case "track_current":
      return cycloneSymbol(color, (geom?.latitude ?? 0) < 0);
    case "epicentre":
      return a.eventtype === "VO" ? glyph(VOLCANO, 18, color) : glyph(star(10, 4.2), 18, color);
    default:
      return { type: "simple-marker", size: 10, color, outline: { color: "white", width: 1.5 } };
  }
};

// ---- map key (legend) ----
// the same shapes as SVG paths (y down), so the key matches the map
const svgPath = (rings: Ring[]) =>
  rings.map((r) => "M" + r.map(([x, y]) => `${x.toFixed(2)},${(-y).toFixed(2)}`).join("L") + "Z").join("");
export const LEGEND_PATHS = {
  cyclone: svgPath(cycloneRings(false)),
  quake: svgPath([star(10, 4.2)]),
  volcano: svgPath([VOLCANO]),
};
// what the purple (exposure) area and the outer lines mean, per event type
export const HAZARD_LABELS: Record<string, { area: string; bands?: string }> = {
  TC: { area: "Category 1+ winds (≥ 120 km/h)", bands: "60 and 90 km/h wind swaths" },
  EQ: { area: "Shaking MMI ≥ 6.5 (moderate to catastrophic)", bands: "Weak shaking contours (MMI)" },
  VO: { area: "30 km radius" },
  WF: { area: "Burnt area" },
  FL: { area: "Flooded area" },
  DR: { area: "Drought-affected area" },
};
// which keys the selected event needs: only what it actually draws (all episodes, so the list
// doesn't change while the timeline plays)
export const eventKeys = (polygons: any[], extras: any[]) => {
  const p = polygons.map((f) => f.attributes), e = extras.map((f) => f.attributes);
  const plain = (a: any) => !HATCHED_ROLES.has(a.role);
  return {
    type: (p[0]?.eventtype ?? e[0]?.eventtype) as string,
    cyclone: e.some((a) => a.role === "track_current"),
    track: e.some((a) => a.role === "track_point" || a.role === "track_line"),
    cone: p.some((a) => a.role === "cone"),
    ash: p.some((a) => a.role === "ash"),
    epicentre: e.some((a) => a.role === "epicentre" && a.eventtype !== "VO"),
    volcano: e.some((a) => a.role === "epicentre" && a.eventtype === "VO"),
    hazard: p.some((a) => a.weight == 1 && plain(a)),
    bands: p.some((a) => a.weight == 0 && plain(a)),
  };
};

// ---- date labels ----
const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC",
});
// "Oct 28, 06:00"; main points (current position, epicentre) bold with " UTC"
export const dateLabelSymbol = (a: any, main: boolean, xoffset: number) => ({
  type: "text",
  text: fmt.format(new Date(a.polygondate)) + (main ? " UTC" : ""),
  color: [255, 255, 255, main ? 1 : 0.85], haloColor: [20, 20, 20, 0.85], haloSize: 1.5,
  horizontalAlignment: "left", xoffset, yoffset: -3,
  font: { size: main ? 11 : 9, weight: main ? "bold" : "normal" },
});
// main points always labelled; track points sampled (≤ 5 past, ≤ 4 forecast, never the
// immediate neighbour of the current position) so long tracks don't fill up with text
export const labelledPoints = (features: any[]) => {
  const time = (f: any) => new Date(f.attributes.polygondate).getTime();
  const pts = features
    .filter((f) => f.attributes.polygondate && f.geometry?.type === "point")
    .sort((a, b) => time(a) - time(b));
  const past = pts.filter((f) => f.attributes.role === "track_point" && f.attributes.forecast != 1);
  const fc = pts.filter((f) => f.attributes.role === "track_point" && f.attributes.forecast == 1);
  const step = (n: number, max: number) => Math.max(2, Math.ceil(n / max));
  const ps = step(past.length, 5), fs = step(fc.length, 4);
  return {
    minor: [...past.filter((_, i) => (past.length - i) % ps === 0), ...fc.filter((_, i) => (i + 1) % fs === 0)],
    main: pts.filter((f) => f.attributes.role !== "track_point"),
  };
};
