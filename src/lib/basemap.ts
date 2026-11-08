import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";
// import TileLayer from "@arcgis/core/layers/TileLayer.js"; // hillshade disabled

// Shared basemap for the Events and Grid maps:
// unlabelled dark world map, faint country boundaries, and a filtered place-name layer on top.
const BASE_STYLE_URL =
  "https://cdn.arcgis.com/sharing/rest/content/items/d7397603e9274052808839b70812be50/resources/styles/root.json";
const BOUNDARIES_STYLE_URL =
  "https://cdn.arcgis.com/sharing/rest/content/items/e8ecee3086f34b06b85229d832a1c14a/resources/styles/root.json";

// Hillshade disabled for now (looked like a patina over the dark basemap).
// To re-enable: uncomment the TileLayer import, these settings and the `hillshade` layer below,
// then add `hillshade` back between `base` and `boundaries` in events.tsx and grid.tsx.
// const HILLSHADE_SERVICE: "World_Hillshade" | "World_Hillshade_Dark" =
//   "World_Hillshade";
// const HILLSHADE_BLEND: "soft-light" | "overlay" | "multiply" | "normal" =
//   "soft-light";
// const HILLSHADE_OPACITY = 0.5;

// Place-name labels: Esri "Dark Gray Canvas Reference" (World Edition), the standard global
// version. (The US Edition, 2c24dacdf40c4f5ebfd1ebc5bf2f4578, differs only in a few disputed names.)
const LABELS_ITEM_ID = "747cb7a5329c478cbe6981076cc879c5";

// Label groups to keep (matched against the style's layer ids); everything else in the
// style is hidden: disputed-area names, medium/small cities, towns, roads, POIs, water and region names.
const KEEP_LABELS = [
  /^Admin0 point\//, // country names (big countries first, smaller ones as you zoom in)
  /^City small scale\/.* admin0 capital$/, // national capitals, all sizes
  /^City small scale\/(x large|large) /, // large and x-large cities
];

// Progressive detail for cities: map zoom at which each group first appears (opening view = zoom 3).
// First matching rule wins, so specific rules come before general ones.
const LABEL_TIERS: [RegExp, number][] = [
  // country names keep Esri's own zoom levels (not listed here)
  [/^City small scale\/(x large|large) admin0 capital$/, 4], // biggest national capitals
  [/^City small scale\/.* admin0 capital$/, 5], // all other national capitals
  [/^City small scale\/x large (non capital|admin1 capital)$/, 5], // very large cities
  [/^City small scale\/(large non capital|large other capital|x large admin2 capital)$/, 6], // large cities
];

// Esri's city labels stop at zoom 10; keep them visible all the way in (maps zoom to 10–11).
const CITY_MAX_ZOOM = 24;

// Style zoom = map zoom − STYLE_ZOOM_OFFSET. Screenshots suggest 0; if every tier appears
// one zoom level too late, set this to 1.
const STYLE_ZOOM_OFFSET = 0;

function createLabelsLayer() {
  const labels = new VectorTileLayer({
    portalItem: { id: LABELS_ITEM_ID },
    title: "labels",
  });
  labels.when(() => {
    for (const { id } of labels.currentStyleInfo.style.layers as { id: string }[]) {
      if (!KEEP_LABELS.some((rule) => rule.test(id))) {
        labels.setStyleLayerVisibility(id, "none");
        continue;
      }
      const tier = LABEL_TIERS.find(([rule]) => rule.test(id));
      if (tier) {
        const styleLayer = labels.getStyleLayer(id);
        // Math.max: only ever delays a group, never shows it earlier than Esri intended
        const minzoom = Math.max(styleLayer.minzoom ?? 0, tier[1] - STYLE_ZOOM_OFFSET);
        labels.setStyleLayer({ ...styleLayer, minzoom, maxzoom: CITY_MAX_ZOOM });
      }
    }
  });
  return labels;
}

// Returns new layer instances on every call: an ArcGIS layer can only belong to one map,
// and Events applies blur effects to its base layer that must not leak into Grid.
// Kept as ordinary map layers (not an ArcGIS Basemap) so Events can slot its exposure
// layer in above the world map.
// Add to a map in this order: [base, boundaries, …data layers…, labels]
// (hillshade, if re-enabled, goes between base and boundaries).
export function createBasemapLayers() {
  return {
    labels: createLabelsLayer(),
    base: new VectorTileLayer({ url: BASE_STYLE_URL, title: "base" }),
    // hillshade: new TileLayer({
    //   url: `https://services.arcgisonline.com/arcgis/rest/services/Elevation/${HILLSHADE_SERVICE}/MapServer`,
    //   title: "hillshade",
    //   blendMode: HILLSHADE_BLEND,
    //   opacity: HILLSHADE_OPACITY,
    // }),
    boundaries: new VectorTileLayer({
      url: BOUNDARIES_STYLE_URL,
      title: "boundaries",
      opacity: 0.25,
    }),
  };
}
