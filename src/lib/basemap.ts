import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";

// Shared basemap for the Events and Grid maps:
// unlabelled dark world map + faint country boundaries on top.
const BASE_STYLE_URL =
  "https://cdn.arcgis.com/sharing/rest/content/items/d7397603e9274052808839b70812be50/resources/styles/root.json";
const BOUNDARIES_STYLE_URL =
  "https://cdn.arcgis.com/sharing/rest/content/items/e8ecee3086f34b06b85229d832a1c14a/resources/styles/root.json";

// Returns new layer instances on every call: an ArcGIS layer can only belong to one map,
// and Events applies blur effects to its base layer that must not leak into Grid.
// Kept as ordinary map layers (not an ArcGIS Basemap) so Events can slot its exposure
// layer between the world map and the boundaries.
export function createBasemapLayers() {
  return {
    base: new VectorTileLayer({ url: BASE_STYLE_URL, title: "base" }),
    boundaries: new VectorTileLayer({
      url: BOUNDARIES_STYLE_URL,
      title: "boundaries",
      opacity: 0.25,
    }),
  };
}
