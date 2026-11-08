import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";
// import TileLayer from "@arcgis/core/layers/TileLayer.js"; // hillshade disabled

// Shared basemap for the Events and Grid maps:
// unlabelled dark world map, then faint country boundaries on top.
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

// Returns new layer instances on every call: an ArcGIS layer can only belong to one map,
// and Events applies blur effects to its base layer that must not leak into Grid.
// Kept as ordinary map layers (not an ArcGIS Basemap) so Events can slot its exposure
// layer in above the world map.
// Add to a map in this order: [base, boundaries] (hillshade, if re-enabled, goes in between).
export function createBasemapLayers() {
  return {
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
