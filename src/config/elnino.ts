import { URL_GRIDBASE } from "@/config/datasets";

// ---------------------------------------------------------------------------
// El Niño tab: options, layer URLs, legend labels, panel data
//
// Layers come from the Python export (elnino.assets.export), one bivariate
// raster per basis x hazard x strength, in the same 1-9 class layout as the
// Grid view's bivar_* layers:
//   value = (exposure class - 1) * 3 + hazard class
// ---------------------------------------------------------------------------

export type ElninoBasis = "expected" | "observed" | "both";
export type ElninoHazard = "dry" | "wet" | "hot" | "cold";
// Slider stop keys come from the export: "now", or "r" + value, e.g.
// "rm1p5" = -1.5, "r0p0" = 0.0, "r2p5" = +2.5 (see elnino.assets.export).
export type ElninoStrength = string;
export type ElninoStop = { key: ElninoStrength; value: number };
export type ElninoExposure = "agrgva" | "pop";

// Where the rasters are read from:
//   "arcgis" - published tiled imagery layers under URL_GRIDBASE, like the
//              Grid view; each layer named exactly as its exported file
//              (bivar_elnino_agrgva_dry_both_now, ...)
//   "static" - the exported COG files served from VITE_BASE/elnino
export const ELNINO_LAYER_SOURCE: "arcgis" | "static" = "arcgis";

// BASE_URL always ends in exactly one "/" (VITE_BASE can be empty, "/" or "/repo/")
export const ELNINO_STATIC_BASE = `${import.meta.env.BASE_URL}elnino`;

// Panel data. Default: a static file beside GADM_ADMIN1.json
// (public/elnino/elnino_panel.json). Set VITE_ELNINO_PANEL_URL to read it from
// elsewhere instead, e.g. an ArcGIS Online item:
//   https://www.arcgis.com/sharing/rest/content/items/<item id>/data
export const ELNINO_PANEL_URL: string =
  import.meta.env.VITE_ELNINO_PANEL_URL || `${ELNINO_STATIC_BASE}/elnino_panel.json`;

export const elninoBases: { key: ElninoBasis; label: string; description: string }[] = [
  {
    key: "expected",
    label: "Expected",
    description: "What El Niño typically brings at this strength",
  },
  {
    key: "observed",
    label: "Observed",
    description: "What the latest three months actually show",
  },
  {
    key: "both",
    label: "Both",
    description: "Where the expected signal is actually happening",
  },
];

export const elninoHazards: Record<
  ElninoHazard,
  { label: string; legend: string; variable: "tp" | "t2m"; unit: string }
> = {
  dry: { label: "Drier", legend: "Drier than normal", variable: "tp", unit: "mm/day" },
  wet: { label: "Wetter", legend: "Wetter than normal", variable: "tp", unit: "mm/day" },
  hot: { label: "Hotter", legend: "Hotter than normal", variable: "t2m", unit: "°C" },
  cold: { label: "Cooler", legend: "Cooler than normal", variable: "t2m", unit: "°C" },
};

// Keys match the export's EXPOSURES (and the layer names). The first entry is
// the default selection.
export const elninoExposures: Record<
  ElninoExposure,
  {
    label: string;
    legend: string;
    column: string;
    shareColumn: string;
    format: (value: number) => string;
  }
> = {
  agrgva: {
    label: "Agricultural GVA",
    legend: "Agricultural GVA",
    column: "AGRI GVA",
    shareColumn: "% OF AGRI",
    format: (v) => formatUsd(v),
  },
  pop: {
    label: "Population",
    legend: "Population",
    column: "PEOPLE",
    shareColumn: "% OF POP.",
    format: (v) => formatPeople(v),
  },
};

// RONI strength wording, using NOAA's usual bands (weak 0.5-0.9,
// moderate 1.0-1.4, strong 1.5-1.9, very strong 2.0+).
export function ensoCategory(value: number): string {
  const a = Math.abs(value);
  if (a < 0.5) return "neutral conditions";
  const size = a < 1 ? "weak" : a < 1.5 ? "moderate" : a < 2 ? "strong" : "very strong";
  return `a ${size} ${value > 0 ? "El Niño" : "La Niña"}`;
}

// "+1.69", "−1.5", "0.0" (true minus sign)
export function formatRoni(value: number, digits = 1): string {
  const v = value.toFixed(digits);
  return value > 0 ? `+${v}` : value < 0 ? `−${v.slice(1)}` : v;
}

export function buildElninoUrl(
  basis: ElninoBasis,
  hazard: ElninoHazard,
  strength: ElninoStrength,
  exposure: ElninoExposure,
): string {
  const name =
    basis === "observed"
      ? `bivar_elnino_${exposure}_${hazard}_observed`
      : `bivar_elnino_${exposure}_${hazard}_${basis}_${strength}`;
  return ELNINO_LAYER_SOURCE === "arcgis"
    ? `${URL_GRIDBASE}/${name}/ImageServer`
    : `${ELNINO_STATIC_BASE}/${name}.tif`;
}

// Key into ElninoPanel.layers; observed does not depend on strength.
export function elninoLayerKey(
  exposure: ElninoExposure,
  basis: ElninoBasis,
  hazard: ElninoHazard,
  strength: ElninoStrength,
): string {
  return `${exposure}|${hazard}|${basis}|${basis === "observed" ? "-" : strength}`;
}

// Hazard axis label for the legend, with the class edges for this basis,
// e.g. "Drier than normal (mm/day): ≥0.5, ≥1, ≥1.5".
export function elninoHazardLegend(
  panel: ElninoPanel | null,
  basis: ElninoBasis,
  hazard: ElninoHazard,
): string {
  const h = elninoHazards[hazard];
  if (!panel) return h.legend;
  const thr = panel.thresholds[basis === "expected" ? "expected" : "observed"][h.variable];
  const edges = panel.thresholds.class_steps.map((m) => `≥${+(m * thr).toFixed(2)}`);
  return `${h.legend} (${h.unit}: ${edges.join(", ")})`;
}

export const ELNINO_SOURCE = "Sources: ERA5; NOAA CPC RONI; gridded GVA 2022.";

// ---------------------------------------------------------------------------
// Panel data (elnino_panel.json)
// ---------------------------------------------------------------------------

export type ElninoCountry = {
  iso3: string;
  country: string;
  exposed: number;
  share: number | null;
};

export type ElninoLayerSummary = {
  layer: string;
  exposed: number;
  share: number | null;
  countries: ElninoCountry[];
};

export type ElninoPanel = {
  season: string;
  year: number;
  index: string;
  value: number;
  phase: string;
  run_length: number;
  min_run: number;
  threshold: number;
  recent: { season: string; year: number; value: number; phase: string }[];
  strengths: ElninoStop[]; // slider order, low to high
  exposures: Record<
    string,
    {
      variable: string;
      label: string;
      units: string;
      global_total: number;
      class_breaks: number[];
    }
  >;
  thresholds: {
    expected: { tp: number; t2m: number };
    observed: { tp: number; t2m: number };
    class_steps: number[];
  };
  layers: Record<string, ElninoLayerSummary>;
};

// "El Nino conditions" -> "El Niño conditions"
export const phaseLabel = (phase: string) =>
  phase.replace("Nino", "Niño").replace("Nina", "Niña");

export function formatUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(1)} tn`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)} bn`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(0)} M`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatPeople(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)} bn`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)} M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(0)} k`;
  return `${Math.round(value)}`;
}

export function formatShare(share: number | null): string {
  return share == null ? "N/A" : `${(share * 100).toFixed(share < 0.1 ? 1 : 0)} %`;
}
