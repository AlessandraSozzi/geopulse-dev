import { countryByIso3 } from "@/config/isoCountries";

export const URL_BASE =
  "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services";
export const URL_RTBASE =
  "https://tiledimageservices9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services";
export const URL_GRIDBASE = URL_RTBASE;

export const urlObject: Record<
  string,
  Record<
    string,
    {
      url: string;
      measure: string[];
      threshold?: { type: string; group: Record<string, string> };
      thresholdToMeasure?: Record<string, string>;
      scenarios: string[];
      source: string;
      value: string;
      gridUrl?: string;
      gridThreshold?: Record<string, string>;
      gridMeasure?: Record<string, string>;
      gridLegend?: { exposure: string; hazard: string; source: string };
    }
  >
> = {
  "Riverine Flooding": {
    Population: {
      url: `${URL_BASE}/riverine_population_table/FeatureServer/0/query`,
      measure: ["RF_PW_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_riverine_population_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "Population (count)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; WorldPop.",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "RF_PW_EXP",
        rp0500: "RF_PW_EXP",
        rp0100: "RF_PW_EXP",
        rp0050: "RF_PW_EXP",
        rp0025: "RF_PW_EXP",
        rp0010: "RF_PW_EXP",
        rp0005: "RF_PW_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; European Commission JRC, Global Human Settlement Layer (GHS-POP); and IMF staff calculations.",
    },
    Buildings: {
      url: `${URL_BASE}/riverine_buildings_table/FeatureServer/0/query`,
      measure: ["RF_BLD_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_riverine_buildings_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "Buildings (count)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; Global Building Atlas.",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "RF_BLD_EXP",
        rp0500: "RF_BLD_EXP",
        rp0100: "RF_BLD_EXP",
        rp0050: "RF_BLD_EXP",
        rp0025: "RF_BLD_EXP",
        rp0010: "RF_BLD_EXP",
        rp0005: "RF_BLD_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; Global Building Atlas (TU Munich); and IMF staff calculations.",
    },
    GDP: {
      url: `${URL_BASE}/riverine_gdp_table/FeatureServer/0/query`,
      measure: ["RF_GDP_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_riverine_gdp_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "GDP (USD)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; Murakami et al. (2021).",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "RF_GDP_EXP",
        rp0500: "RF_GDP_EXP",
        rp0100: "RF_GDP_EXP",
        rp0050: "RF_GDP_EXP",
        rp0025: "RF_GDP_EXP",
        rp0010: "RF_GDP_EXP",
        rp0005: "RF_GDP_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; gridded GDP (Murakami, Yoshida & Yamagata, 2021), downscaled with VIIRS nighttime lights (EOG); and IMF staff calculations.",
    },
    "Urban GDP": {
      url: `${URL_BASE}/riverine_ugdp_table/FeatureServer/0/query`,
      measure: ["RF_UGDP_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_riverine_urban_gdp_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "Urban GDP (USD)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; Murakami et al. (2021); GHSL.",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "RF_UGDP_EXP",
        rp0500: "RF_UGDP_EXP",
        rp0100: "RF_UGDP_EXP",
        rp0050: "RF_UGDP_EXP",
        rp0025: "RF_UGDP_EXP",
        rp0010: "RF_UGDP_EXP",
        rp0005: "RF_UGDP_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; gridded GDP (Murakami, Yoshida & Yamagata, 2021) masked to GHSL urban areas (EC JRC), downscaled with VIIRS nighttime lights (EOG); and IMF staff calculations.",
    },
  },
  "Coastal Flooding": {
    Population: {
      url: `${URL_BASE}/coastal_population_table/FeatureServer/0/query`,
      measure: ["CF_PW_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_coastal_population_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "Population (count)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; WorldPop.",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "CF_PW_EXP",
        rp0500: "CF_PW_EXP",
        rp0100: "CF_PW_EXP",
        rp0050: "CF_PW_EXP",
        rp0025: "CF_PW_EXP",
        rp0010: "CF_PW_EXP",
        rp0005: "CF_PW_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; European Commission JRC, Global Human Settlement Layer (GHS-POP); and IMF staff calculations.",
    },
    Buildings: {
      url: `${URL_BASE}/coastal_buildings_table/FeatureServer/0/query`,
      measure: ["CF_BLD_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_coastal_buildings_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "Buildings (count)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; Global Building Atlas.",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "CF_BLD_EXP",
        rp0500: "CF_BLD_EXP",
        rp0100: "CF_BLD_EXP",
        rp0050: "CF_BLD_EXP",
        rp0025: "CF_BLD_EXP",
        rp0010: "CF_BLD_EXP",
        rp0005: "CF_BLD_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; Global Building Atlas (TU Munich); and IMF staff calculations.",
    },
    GDP: {
      url: `${URL_BASE}/coastal_gdp_table/FeatureServer/0/query`,
      measure: ["CF_GDP_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_coastal_gdp_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "GDP (USD)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; Murakami et al. (2021).",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "CF_GDP_EXP",
        rp0500: "CF_GDP_EXP",
        rp0100: "CF_GDP_EXP",
        rp0050: "CF_GDP_EXP",
        rp0025: "CF_GDP_EXP",
        rp0010: "CF_GDP_EXP",
        rp0005: "CF_GDP_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; gridded GDP (Murakami, Yoshida & Yamagata, 2021), downscaled with VIIRS nighttime lights (EOG); and IMF staff calculations.",
    },
    "Urban GDP": {
      url: `${URL_BASE}/coastal_ugdp_table/FeatureServer/0/query`,
      measure: ["CF_UGDP_EXP"],
      scenarios: ["rcp4p5", "rcp8p5"],
      gridUrl: `${URL_GRIDBASE}/bivar_coastal_urban_gdp_{scenario}_{time}_{threshold}/ImageServer`,
      gridLegend: {
        exposure: "Urban GDP (USD)",
        hazard: "Flood Height (meters)",
        source: "Sources: Aqueduct; Murakami et al. (2021); GHSL.",
      },
      threshold: {
        type: "RETURN_PERIOD",
        group: {
          rp0005: "20%",
          rp0010: "10%",
          rp0025: "4%",
          rp0050: "2%",
          rp0100: "1%",
          rp0500: "0.2%",
          rp1000: "0.1%",
        },
      },
      thresholdToMeasure: {
        rp1000: "CF_UGDP_EXP",
        rp0500: "CF_UGDP_EXP",
        rp0100: "CF_UGDP_EXP",
        rp0050: "CF_UGDP_EXP",
        rp0025: "CF_UGDP_EXP",
        rp0010: "CF_UGDP_EXP",
        rp0005: "CF_UGDP_EXP",
      },
      value: "PERCENT_",
      source:
        "Sources: World Resources Institute, Aqueduct Floods Hazard Maps v2; gridded GDP (Murakami, Yoshida & Yamagata, 2021) masked to GHSL urban areas (EC JRC), downscaled with VIIRS nighttime lights (EOG); and IMF staff calculations.",
    },
  },
  Drought: {
    Cropland: {
      url: `${URL_BASE}/drought_cropland_table/FeatureServer/0/query`,
      measure: ["CDD_CROP_EXP", "SPEI_CROP_EXP"],
      scenarios: ["SSP126", "SSP245", "SSP370"],
      gridUrl: `${URL_GRIDBASE}/drought_cropland_{scenario}_{time}_{measure}/ImageServer`,
      gridMeasure: { CDD_CROP_EXP: "cdd", SPEI_CROP_EXP: "spei12" },
      value: "MEDIAN",
      source:
        "Sources: World Bank Climate Change Knowledge Portal (CMIP6 / WCRP modelling groups); Copernicus / ESA CCI Land Cover; Maes et al. (2025), OECD; and IMF staff calculations.",
    },
  },
  "Temperature Extremes": {
    Population: {
      url: `${URL_BASE}/temperature_population_table/FeatureServer/0/query`,
      measure: ["ID_PW_EXP", "TN_PW_EXP", "HD_PW_EXP"],
      scenarios: ["SSP126", "SSP245", "SSP370"],
      gridUrl: `${URL_GRIDBASE}/bivar_temps_population_{scenario}_{time}_{threshold}/ImageServer`,
      // threshold key -> original CCKP variable, used as the service-name suffix
      gridThreshold: {
        _Z: "id",
        H_20: "tr",
        H_26: "tr26",
        H_32: "tr32",
        H_30: "hd30",
        H_35: "hd35",
        H_40: "hd40",
      },
      gridLegend: {
        exposure: "Population (count)",
        hazard: "{measure} {threshold}°C",
        source: "Sources: World Bank CCKP; WorldPop.",
      },
      threshold: {
        type: "TEMP_THRESHOLD",
        group: {
          _Z: "< 0",
          H_20: "> 20",
          H_26: "> 26",
          H_32: "> 32",
          H_30: "> 30",
          H_35: "> 35",
          H_40: "> 40",
        },
      },
      thresholdToMeasure: {
        _Z: "ID_PW_EXP",
        H_20: "TN_PW_EXP",
        H_26: "TN_PW_EXP",
        H_32: "TN_PW_EXP",
        H_30: "HD_PW_EXP",
        H_35: "HD_PW_EXP",
        H_40: "HD_PW_EXP",
      },
      value: "MEDIAN",
      source:
        "Sources: World Bank Climate Change Knowledge Portal (CMIP6 / WCRP modelling groups); European Commission JRC, Global Human Settlement Layer (GHS-POP); Maes et al. (2025), OECD; and IMF staff calculations.",
    },
    Livestock: {
      url: `${URL_BASE}/temperature_livestock_table/FeatureServer/0/query`,
      measure: ["HD_LW_EXP"],
      scenarios: ["SSP126", "SSP245", "SSP370"],
      // single threshold, no switch
      gridUrl: `${URL_GRIDBASE}/bivar_temps_livestock_{scenario}_{time}_hd35/ImageServer`,
      gridLegend: {
        exposure: "Livestock (heads)",
        hazard: "Hot Days > 35°C",
        source: "Sources: World Bank CCKP; GLW3.",
      },
      threshold: {
        type: "TEMP_THRESHOLD",
        group: { H_35: "> 35" },
      },
      value: "MEDIAN",
      source:
        "Sources: World Bank Climate Change Knowledge Portal (CMIP6 / WCRP modelling groups); FAO, Gridded Livestock of the World v3 (GLW3); Maes et al. (2025), OECD; and IMF staff calculations.",
    },
  },
};

type GridState = {
  currentHazard: string;
  currentExposure: string;
  currentScenario: string;
  currentTime: number;
  currentThreshold: { threshold: string };
  currentMeasure: { id: string };
};

// Builds the grid-view layer URL for the current selection from urlObject[hazard][exposure].gridUrl.
// Returns undefined when there is no grid layer for the selection.
export function buildGridUrl(state: GridState): string | undefined {
  const config = urlObject[state.currentHazard]?.[state.currentExposure];
  const gridUrl = config?.gridUrl;
  if (!gridUrl) return undefined;

  const threshold = state.currentThreshold.threshold;
  const measure = state.currentMeasure.id;

  // historical is shared across scenarios
  const scenario =
    state.currentTime === 1980 ? "historical" : state.currentScenario;

  return gridUrl
    .replace("{scenario}", scenario.toLowerCase())
    .replace("{time}", String(state.currentTime))
    .replace("{threshold}", config.gridThreshold?.[threshold] ?? threshold)
    .replace("{measure}", config.gridMeasure?.[measure] ?? measure);
}

// Legend labels for the current selection, with {measure} / {threshold} filled
// from measureMapper and threshold.group. Undefined = no bivariate legend.
export function buildGridLegend(
  state: GridState,
): { exposure: string; hazard: string; source: string } | undefined {
  const config = urlObject[state.currentHazard]?.[state.currentExposure];
  const legend = config?.gridLegend;
  if (!legend) return undefined;

  const fill = (text: string) =>
    text
      .replace("{measure}", measureMapper[state.currentMeasure.id] ?? "")
      .replace(
        "{threshold}",
        config.threshold?.group[state.currentThreshold.threshold] ?? "",
      );

  return {
    exposure: fill(legend.exposure),
    hazard: fill(legend.hazard),
    source: legend.source,
  };
}

export const scenarioMapper: Record<string, string> = {
  rcp4p5: "Orderly",
  rcp8p5: "Disorderly",
  SSP126: "Orderly",
  SSP245: "Disorderly",
  SSP370: "Hot House",
};

// Physical-climate pathway codes behind each plain-language scenario name.
export const scenarioCodeMapper: Record<string, string> = {
  rcp4p5: "RCP 4.5",
  rcp8p5: "RCP 8.5",
  SSP126: "SSP1-2.6",
  SSP245: "SSP2-4.5",
  SSP370: "SSP3-7.0",
};

// Display label combining the plain-language name with its code, e.g. "Orderly (RCP 4.5)".
// Display-only: scenarioMapper stays the matching key and raw codes remain in data fields.
export const scenarioLabel = (scenario: string): string =>
  `${scenarioMapper[scenario]} (${scenarioCodeMapper[scenario]})`;

// Canonical forward-looking time-period labels (methodology TIME_PERIOD).
// Single source of truth shared by the time slider and the line-chart x-axis.
// Index order matches the year steps: 0 = Historical (1980), 1 = 2030, 2 = 2050, 3 = 2080.
export const timePeriodLabels: string[] = [
  "Historical",
  "Early century",
  "Mid century",
  "End century",
];

export const measureMapper: Record<string, string> = {
  HD_PW_EXP: "Hot Days",
  TN_PW_EXP: "Tropical Nights",
  ID_PW_EXP: "Icing Days",
  CDD_CROP_EXP: "Dry Days",
  SPEI_CROP_EXP: "SPEI Index",
  HD_LW_EXP: "Hot Days",
  RF_PW_EXP: "Flood Level", // not sure
};

const thresholdToTitle: Record<string, string> = {
  _Z: "Tmax < 0",
  H_20: "Tmin > 20",
  H_26: "Tmin > 26",
  H_32: "Tmin > 32",
  H_30: "Tmax > 30",
  H_35: "Tmax > 35",
  H_40: "Tmax > 40",
};

export const realtimeObject: Record<
  string,
  {
    url: Record<string, string>;
    colorScheme: Array<Record<string, any>>;
    title: string;
    unit: string;
    suffix: string;
    eventAttribute: string;
    categories: string[];
    icon: string;
  }
> = {
  Population: {
    url: {
      Population: `${URL_RTBASE}/worldpop_population/ImageServer`,
      "< 15 years old": `${URL_RTBASE}/worldpop_population_0_14/ImageServer`,
      "Working population": `${URL_RTBASE}/worldpop_population_15_64/ImageServer`,
      "≥ 65 years old": `${URL_RTBASE}/worldpop_population_65plus/ImageServer`,
    },
    colorScheme: [
      {
        minValue: 0.0,
        maxValue: 2.0,
        symbol: {
          type: "simple-fill",
          color: [0, 0, 4, 1.0],
        },
        label: "< 2",
      },
      {
        minValue: 2.0,
        maxValue: 8.0,
        symbol: {
          type: "simple-fill",
          color: [10, 58, 74, 1.0],
        },
        label: "8",
      },
      {
        minValue: 8.0,
        maxValue: 59.0,
        symbol: {
          type: "simple-fill",
          color: [27, 138, 138, 1.0],
        },
        label: "59",
      },
      {
        minValue: 59.0,
        maxValue: 284.0,
        symbol: {
          type: "simple-fill",
          color: [94, 201, 98, 1.0],
        },
        label: "284",
      },
      {
        minValue: 284.0,
        maxValue: 107609.0,
        symbol: {
          type: "simple-fill",
          color: [212, 255, 80, 1.0],
        },
        label: "> 284",
      },
    ],
    title: "population count",
    unit: "",
    suffix: "people",
    eventAttribute: "population",
    categories: ["Working population", "< 15 years old", "≥ 65 years old"],
    icon: "M9.26163 2.05815C9.26163 1.47929 8.81141 1.02908 8.23256 1.02908C7.65371 1.02908 7.20349 1.47929 7.20349 2.05815C7.20349 2.637 7.65371 3.08721 8.23256 3.08721C8.81141 3.08721 9.26163 2.637 9.26163 2.05815ZM6.17442 2.05815C6.17442 0.9326 7.10701 5.48363e-06 8.23256 5.48363e-06C9.3581 5.48363e-06 10.2907 0.9326 10.2907 2.05815C10.2907 3.18369 9.3581 4.11628 8.23256 4.11628C7.10701 4.11628 6.17442 3.18369 6.17442 2.05815ZM3.08721 3.60175C3.50527 3.60175 3.85901 3.24801 3.85901 2.82995C3.85901 2.41189 3.50527 2.05815 3.08721 2.05815C2.66915 2.05815 2.31541 2.41189 2.31541 2.82995C2.31541 3.24801 2.66915 3.60175 3.08721 3.60175ZM3.08721 1.02908C4.08412 1.02908 4.88808 1.83304 4.88808 2.82995C4.88808 3.82686 4.08412 4.63082 3.08721 4.63082C2.0903 4.63082 1.28634 3.82686 1.28634 2.82995C1.28634 1.83304 2.0903 1.02908 3.08721 1.02908ZM13.3779 3.60175C13.796 3.60175 14.1497 3.24801 14.1497 2.82995C14.1497 2.41189 13.796 2.05815 13.3779 2.05815C12.9598 2.05815 12.6061 2.41189 12.6061 2.82995C12.6061 3.24801 12.9598 3.60175 13.3779 3.60175ZM13.3779 1.02908C14.3748 1.02908 15.1788 1.83304 15.1788 2.82995C15.1788 3.82686 14.3748 4.63082 13.3779 4.63082C12.381 4.63082 11.577 3.82686 11.577 2.82995C11.577 1.83304 12.381 1.02908 13.3779 1.02908ZM4.08412 6.20658C3.85901 6.52817 3.66606 6.84975 3.50527 7.20349C2.12246 7.23565 1.02907 8.39336 1.02907 9.77617C1.02907 10.548 1.35065 11.2233 1.89735 11.7057C1.99382 11.8021 2.05814 11.9308 2.05814 12.0916V14.9215C2.05814 15.2109 1.83303 15.4361 1.5436 15.4361C1.25418 15.4361 1.02907 15.2109 1.02907 14.9215V12.2845C0.385901 11.6414 0 10.7731 0 9.77617C0 7.78235 1.60792 6.17442 3.60174 6.17442C3.76254 6.17442 3.92333 6.17442 4.08412 6.20658ZM12.9598 7.20349C12.7991 6.84975 12.6061 6.52817 12.381 6.20658C12.5418 6.17442 12.7026 6.17442 12.8634 6.17442C14.8572 6.17442 16.4651 7.78235 16.4651 9.77617C16.4651 10.7731 16.0792 11.6414 15.436 12.2845V14.9215C15.436 15.2109 15.2109 15.4361 14.9215 15.4361C14.6321 15.4361 14.407 15.2109 14.407 14.9215V12.0916C14.407 11.9308 14.4713 11.8021 14.5678 11.7057C15.1145 11.2233 15.436 10.548 15.436 9.77617C15.436 8.39336 14.3427 7.26781 12.9598 7.20349ZM8.23256 6.68896C6.81759 6.68896 5.65988 7.84666 5.65988 9.26163V9.77617C5.65988 10.548 5.98147 11.2233 6.52816 11.7057C6.62464 11.8021 6.68895 11.9308 6.68895 12.0916V14.6642C6.68895 15.0823 7.0427 15.4361 7.46076 15.4361H9.00436C9.42242 15.4361 9.77616 15.0823 9.77616 14.6642V12.0916C9.77616 11.9308 9.84048 11.8021 9.93696 11.7057C10.4836 11.2233 10.8052 10.548 10.8052 9.77617V9.26163C10.8052 7.84666 9.64753 6.68896 8.23256 6.68896ZM4.63081 9.26163C4.63081 7.26781 6.23874 5.65989 8.23256 5.65989C10.2264 5.65989 11.8343 7.26781 11.8343 9.26163V9.77617C11.8343 10.7731 11.4484 11.6414 10.8052 12.2845V14.6642C10.8052 15.6612 10.0013 16.4651 9.00436 16.4651H7.46076C6.46384 16.4651 5.65988 15.6612 5.65988 14.6642V12.2845C5.01672 11.6414 4.63081 10.7731 4.63081 9.77617V9.26163Z",
  },
  Buildings: {
    url: {
      Buildings: `${URL_RTBASE}/gba_buildings_count/ImageServer`,
    },
    colorScheme: [
      {
        minValue: 0.0,
        maxValue: 1.0,
        symbol: {
          type: "simple-fill",
          color: [0, 0, 139, 1.0],
        },
        label: "< 1",
      },
      {
        minValue: 1.0,
        maxValue: 5.0,
        symbol: {
          type: "simple-fill",
          color: [0, 153, 204, 1.0],
        },
        label: "5",
      },
      {
        minValue: 5.0,
        maxValue: 18.0,
        symbol: {
          type: "simple-fill",
          color: [0, 204, 136, 1.0],
        },
        label: "18",
      },
      {
        minValue: 18.0,
        maxValue: 81.0,
        symbol: {
          type: "simple-fill",
          color: [204, 204, 0, 1.0],
        },
        label: "81",
      },
      {
        minValue: 81.0,
        maxValue: 30203.0,
        symbol: {
          type: "simple-fill",
          color: [255, 0, 0, 1.0],
        },
        label: "> 81",
      },
    ],
    title: "building count",
    unit: "",
    suffix: "assets",
    eventAttribute: "buildings",
    categories: [],
    icon: "M18.5877 1.02908H11.3842C10.8054 1.02908 10.3552 1.47929 10.3552 2.05815V4.01981L9.32608 3.11937V2.05815C9.32608 0.9326 10.2587 5.48363e-06 11.3842 5.48363e-06H18.5877C19.7133 5.48363e-06 20.6458 0.9326 20.6458 2.05815V14.407C20.6458 15.5325 19.7133 16.4651 18.5877 16.4651H13.3137C13.5388 16.1435 13.6996 15.822 13.7961 15.4361H18.5877C19.1666 15.4361 19.6168 14.9858 19.6168 14.407V2.05815C19.6168 1.47929 19.1666 1.02908 18.5877 1.02908ZM15.7578 3.85902C15.7578 3.56959 15.9829 3.34448 16.2723 3.34448H16.7868C17.0763 3.34448 17.3014 3.56959 17.3014 3.85902V4.37355C17.3014 4.66298 17.0763 4.88809 16.7868 4.88809H16.2723C15.9829 4.88809 15.7578 4.66298 15.7578 4.37355V3.85902ZM16.2723 6.43169H16.7868C17.0763 6.43169 17.3014 6.6568 17.3014 6.94623V7.46076C17.3014 7.75019 17.0763 7.9753 16.7868 7.9753H16.2723C15.9829 7.9753 15.7578 7.75019 15.7578 7.46076V6.94623C15.7578 6.6568 15.9829 6.43169 16.2723 6.43169ZM15.7578 10.0334C15.7578 9.74401 15.9829 9.5189 16.2723 9.5189H16.7868C17.0763 9.5189 17.3014 9.74401 17.3014 10.0334V10.548C17.3014 10.8374 17.0763 11.0625 16.7868 11.0625H16.2723C15.9829 11.0625 15.7578 10.8374 15.7578 10.548V10.0334ZM13.1851 3.34448H13.6996C13.9891 3.34448 14.2142 3.56959 14.2142 3.85902V4.37355C14.2142 4.66298 13.9891 4.88809 13.6996 4.88809H13.1851C12.8957 4.88809 12.6706 4.66298 12.6706 4.37355V3.85902C12.6706 3.56959 12.8957 3.34448 13.1851 3.34448ZM7.10715 3.21585L13.2816 8.61846C13.4745 8.81142 13.5067 9.133 13.3137 9.35811C13.1208 9.55106 12.7992 9.58322 12.5741 9.39027L12.4133 9.22948V14.407C12.4133 15.5325 11.4807 16.4651 10.3552 16.4651H3.15166C2.02612 16.4651 1.09352 15.5325 1.09352 14.407V9.22948L0.932731 9.39027C0.707622 9.58322 0.386037 9.55106 0.193087 9.35811C0.000136264 9.133 0.0322947 8.81142 0.257404 8.61846L6.43182 3.21585C6.62477 3.05506 6.9142 3.05506 7.10715 3.21585ZM11.3842 8.32904L6.75341 4.27708L2.12259 8.32904V14.407C2.12259 14.9858 2.57281 15.4361 3.15166 15.4361H10.3552C10.934 15.4361 11.3842 14.9858 11.3842 14.407V8.32904ZM4.95253 9.5189C4.95253 8.94005 5.40275 8.48983 5.9816 8.48983H7.52521C8.10406 8.48983 8.55428 8.94005 8.55428 9.5189V11.0625C8.55428 11.6414 8.10406 12.0916 7.52521 12.0916H5.9816C5.40275 12.0916 4.95253 11.6414 4.95253 11.0625V9.5189ZM5.9816 9.5189V11.0625H7.52521V9.5189H5.9816Z",
  },
  "Capital stock": {
    url: {
      "Capital stock": `${URL_RTBASE}/residential_shell_replacement_value_usd/ImageServer`,
      "Residential capital stock": `${URL_RTBASE}/residential_shell_replacement_value_usd/ImageServer`,
      "Non-residential capital stock": `${URL_RTBASE}/nonresidential_shell_replacement_value_usd/ImageServer`,
    },
    colorScheme: [
      {
        minValue: 0.1,
        maxValue: 1000,
        symbol: {
          type: "simple-fill",
          color: [50, 48, 50, 1.0],
        },
        label: "< $1K",
      },
      {
        minValue: 1000,
        maxValue: 30000,
        symbol: {
          type: "simple-fill",
          color: [90, 55, 65, 1.0],
        },
        label: "$30K",
      },
      {
        minValue: 30000,
        maxValue: 800000,
        symbol: {
          type: "simple-fill",
          color: [160, 70, 100, 1.0],
        },
        label: "$800K",
      },
      {
        minValue: 800000,
        maxValue: 170000000,
        symbol: {
          type: "simple-fill",
          color: [210, 130, 60, 1.0],
        },
        label: "$170M",
      },
      {
        minValue: 170000000,
        maxValue: 36000000000,
        symbol: {
          type: "simple-fill",
          color: [240, 249, 33, 1.0],
        },
        label: "> $170M",
      },
    ],
    title: "Capital stock",
    unit: "(USD)",
    suffix: "in 2021 USD",
    eventAttribute: "capitalstock_res",
    categories: ["Residential capital stock", "Non-residential capital stock"],
    icon: "M18.5877 1.02908H11.3842C10.8054 1.02908 10.3552 1.47929 10.3552 2.05815V4.01981L9.32608 3.11937V2.05815C9.32608 0.9326 10.2587 5.48363e-06 11.3842 5.48363e-06H18.5877C19.7133 5.48363e-06 20.6458 0.9326 20.6458 2.05815V14.407C20.6458 15.5325 19.7133 16.4651 18.5877 16.4651H13.3137C13.5388 16.1435 13.6996 15.822 13.7961 15.4361H18.5877C19.1666 15.4361 19.6168 14.9858 19.6168 14.407V2.05815C19.6168 1.47929 19.1666 1.02908 18.5877 1.02908ZM15.7578 3.85902C15.7578 3.56959 15.9829 3.34448 16.2723 3.34448H16.7868C17.0763 3.34448 17.3014 3.56959 17.3014 3.85902V4.37355C17.3014 4.66298 17.0763 4.88809 16.7868 4.88809H16.2723C15.9829 4.88809 15.7578 4.66298 15.7578 4.37355V3.85902ZM16.2723 6.43169H16.7868C17.0763 6.43169 17.3014 6.6568 17.3014 6.94623V7.46076C17.3014 7.75019 17.0763 7.9753 16.7868 7.9753H16.2723C15.9829 7.9753 15.7578 7.75019 15.7578 7.46076V6.94623C15.7578 6.6568 15.9829 6.43169 16.2723 6.43169ZM15.7578 10.0334C15.7578 9.74401 15.9829 9.5189 16.2723 9.5189H16.7868C17.0763 9.5189 17.3014 9.74401 17.3014 10.0334V10.548C17.3014 10.8374 17.0763 11.0625 16.7868 11.0625H16.2723C15.9829 11.0625 15.7578 10.8374 15.7578 10.548V10.0334ZM13.1851 3.34448H13.6996C13.9891 3.34448 14.2142 3.56959 14.2142 3.85902V4.37355C14.2142 4.66298 13.9891 4.88809 13.6996 4.88809H13.1851C12.8957 4.88809 12.6706 4.66298 12.6706 4.37355V3.85902C12.6706 3.56959 12.8957 3.34448 13.1851 3.34448ZM7.10715 3.21585L13.2816 8.61846C13.4745 8.81142 13.5067 9.133 13.3137 9.35811C13.1208 9.55106 12.7992 9.58322 12.5741 9.39027L12.4133 9.22948V14.407C12.4133 15.5325 11.4807 16.4651 10.3552 16.4651H3.15166C2.02612 16.4651 1.09352 15.5325 1.09352 14.407V9.22948L0.932731 9.39027C0.707622 9.58322 0.386037 9.55106 0.193087 9.35811C0.000136264 9.133 0.0322947 8.81142 0.257404 8.61846L6.43182 3.21585C6.62477 3.05506 6.9142 3.05506 7.10715 3.21585ZM11.3842 8.32904L6.75341 4.27708L2.12259 8.32904V14.407C2.12259 14.9858 2.57281 15.4361 3.15166 15.4361H10.3552C10.934 15.4361 11.3842 14.9858 11.3842 14.407V8.32904ZM4.95253 9.5189C4.95253 8.94005 5.40275 8.48983 5.9816 8.48983H7.52521C8.10406 8.48983 8.55428 8.94005 8.55428 9.5189V11.0625C8.55428 11.6414 8.10406 12.0916 7.52521 12.0916H5.9816C5.40275 12.0916 4.95253 11.6414 4.95253 11.0625V9.5189ZM5.9816 9.5189V11.0625H7.52521V9.5189H5.9816Z",
  },
  Nightlights: {
    url: {
      Nightlights: `${URL_RTBASE}/viirs_nighttimelights_harmonized/ImageServer`,
    },
    colorScheme: [
      {
        minValue: 7,
        maxValue: 10,
        symbol: { type: "simple-fill", color: [45, 48, 64, 1.0] },
        label: "< 10",
      },
      {
        minValue: 10,
        maxValue: 15,
        symbol: { type: "simple-fill", color: [74, 80, 104, 1.0] },
        label: "15",
      },
      {
        minValue: 15,
        maxValue: 25,
        symbol: { type: "simple-fill", color: [120, 136, 168, 1.0] },
        label: "25",
      },
      {
        minValue: 25,
        maxValue: 40,
        symbol: { type: "simple-fill", color: [255, 200, 100, 1.0] },
        label: "40",
      },
      {
        minValue: 40,
        maxValue: 63,
        symbol: { type: "simple-fill", color: [255, 255, 255, 1.0] },
        label: "> 40",
      },
    ],
    title: "night-time luminosity",
    unit: "(nW/cm²/sr)",
    suffix: "",
    eventAttribute: "N/A",
    categories: [],
    icon: "M3.47311 0.28946C4.59866 3.38703e-05 5.65988 0.836153 5.65988 1.99386C5.65988 2.09033 5.65988 2.21897 5.62773 2.31544L8.10392 1.70443C9.22947 1.415 10.2907 2.25112 10.2907 3.40883C10.2907 3.8912 10.0656 4.37358 9.744 4.69516C10.0656 5.01675 10.2907 5.46697 10.2907 5.9815C10.2907 6.46388 10.0656 6.94625 9.744 7.26784C10.0656 7.58942 10.2907 8.03964 10.2907 8.55418C10.2907 9.35814 9.744 10.0656 8.9722 10.2586L6.68895 10.8374V12.4775H7.20349C7.78234 12.4775 8.23256 12.9277 8.23256 13.5066V14.0211C8.23256 15.4361 7.07485 16.5938 5.65988 16.5938H4.63081C3.21584 16.5938 2.05814 15.4361 2.05814 14.0211V13.5066C2.05814 12.9277 2.50836 12.4775 3.08721 12.4775H3.60174V10.355L4.63081 10.0978V12.4775H5.65988V10.4194C5.65988 10.1943 5.82068 9.96915 6.04578 9.93699L8.71493 9.26166C9.03652 9.16519 9.26163 8.87576 9.26163 8.55418C9.26163 8.0718 8.81141 7.71806 8.36119 7.84669C4.92024 8.68281 6.6568 8.26475 4.24491 8.87576L2.18677 9.3903C1.09339 9.64756 0 8.81144 0 7.65374C0 7.17136 0.225109 6.68899 0.546693 6.3674C0.225109 6.04582 0 5.5956 0 5.08107C0 4.59869 0.225109 4.11631 0.546693 3.79473C0.225109 3.47314 0 3.02293 0 2.50839C0 1.70443 0.546693 0.996945 1.35065 0.803995L3.47311 0.28946ZM3.98765 7.84669L8.71493 6.68899C9.03652 6.59251 9.26163 6.30309 9.26163 5.9815C9.26163 5.49913 8.81141 5.14538 8.36119 5.24186L2.18677 6.78546L1.57576 6.94625C1.25418 7.04273 1.02907 7.33216 1.02907 7.65374C1.02907 8.13612 1.47929 8.48986 1.92951 8.36123L3.98765 7.84669ZM4.34139 3.69825L2.18677 4.21279L1.57576 4.37358C1.25418 4.47006 1.02907 4.75948 1.02907 5.08107C1.02907 5.56344 1.47929 5.91719 1.92951 5.78855L8.10392 4.27711V4.24495L8.71493 4.11631C9.03652 4.01984 9.26163 3.73041 9.26163 3.40883C9.26163 2.92645 8.81141 2.57271 8.36119 2.70134L4.34139 3.69825H4.30923H4.34139ZM4.63081 1.99386C4.63081 1.51148 4.1806 1.15774 3.73038 1.28637L1.57576 1.80091C1.25418 1.89738 1.02907 2.18681 1.02907 2.50839C1.02907 2.99077 1.47929 3.34451 1.92951 3.21588L4.08412 2.70134C4.40571 2.60487 4.63081 2.31544 4.63081 1.99386ZM3.08721 13.5066V14.0211C3.08721 14.8894 3.79469 15.5647 4.63081 15.5647H5.65988C6.52816 15.5647 7.20349 14.8894 7.20349 14.0211V13.5066H3.08721Z",
  },
  GDP: {
    // formerly GDP 3
    url: {
      GDP: `${URL_RTBASE}/global_total_GVA_2022_constant2015USD_1km/ImageServer`,
      Agriculture: `${URL_RTBASE}/global_agriculture_GVA_2022_constant2015USD_1km/ImageServer`,
      Industry: `${URL_RTBASE}/global_industry_GVA_2022_constant2015USD_1km/ImageServer`,
      Services: `${URL_RTBASE}/global_services_GVA_2022_constant2015USD_1km/ImageServer`,
    },
    colorScheme: [
      {
        minValue: 0,
        maxValue: 400,
        symbol: {
          type: "simple-fill",
          color: [50, 48, 50, 1.0],
        },
        label: "< $400",
      },
      {
        minValue: 400,
        maxValue: 1600,
        symbol: {
          type: "simple-fill",
          color: [90, 55, 65, 1.0],
        },
        label: "$1.6K",
      },
      {
        minValue: 1600,
        maxValue: 30000,
        symbol: {
          type: "simple-fill",
          color: [160, 70, 100, 1.0],
        },
        label: "$30K",
      },
      {
        minValue: 30000,
        maxValue: 12500000,
        symbol: {
          type: "simple-fill",
          color: [210, 130, 60, 1.0],
        },
        label: "$12.5M",
      },
      {
        minValue: 12500000,
        maxValue: 96000000000,
        symbol: {
          type: "simple-fill",
          color: [240, 249, 33, 1.0],
        },
        label: "> $12.5M",
      },
    ],
    title: "gdp",
    unit: "(Purchasing Power Parity, USD)",
    suffix: "USD",
    eventAttribute: "gdp",
    categories: ["Agriculture", "Industry", "Services"],
    icon: "M2.05814 1.02911C1.47929 1.02911 1.02907 1.47933 1.02907 2.05818V3.08725C2.15461 3.08725 3.08721 2.15465 3.08721 1.02911H2.05814ZM1.02907 4.11632V8.2326C2.73347 8.2326 4.11628 9.61541 4.11628 11.3198H12.3488C12.3488 9.61541 13.7316 8.2326 15.436 8.2326V4.11632C13.7316 4.11632 12.3488 2.73351 12.3488 1.02911H4.11628C4.11628 2.73351 2.73347 4.11632 1.02907 4.11632ZM13.3779 11.3198H14.407C14.9858 11.3198 15.436 10.8696 15.436 10.2907V9.26167C14.3105 9.26167 13.3779 10.1943 13.3779 11.3198ZM1.02907 9.26167V10.2907C1.02907 10.8696 1.47929 11.3198 2.05814 11.3198H3.08721C3.08721 10.1943 2.15461 9.26167 1.02907 9.26167ZM15.436 3.08725V2.05818C15.436 1.47933 14.9858 1.02911 14.407 1.02911H13.3779C13.3779 2.15465 14.3105 3.08725 15.436 3.08725ZM0 2.05818C0 0.932634 0.932594 3.95775e-05 2.05814 3.95775e-05H14.407C15.5325 3.95775e-05 16.4651 0.932634 16.4651 2.05818V10.2907C16.4651 11.4163 15.5325 12.3489 14.407 12.3489H2.05814C0.932594 12.3489 0 11.4163 0 10.2907V2.05818ZM10.2907 6.17446C10.2907 5.04891 9.3581 4.11632 8.23256 4.11632C7.10701 4.11632 6.17442 5.04891 6.17442 6.17446C6.17442 7.3 7.10701 8.2326 8.23256 8.2326C9.3581 8.2326 10.2907 7.3 10.2907 6.17446ZM5.14535 6.17446C5.14535 4.47006 6.52816 3.08725 8.23256 3.08725C9.93696 3.08725 11.3198 4.47006 11.3198 6.17446C11.3198 7.87886 9.93696 9.26167 8.23256 9.26167C6.52816 9.26167 5.14535 7.87886 5.14535 6.17446Z",
  },
  // "GDP 10": {
  //   url: {
  //     "GDP 10": `${URL_RTBASE}/CANUSA_Gridded_GDP_Total_Economy_2021/ImageServer`,
  //     Agriculture: `${URL_RTBASE}/CANUSA_Gridded_GDP_Agriculture_2021/ImageServer`,
  //     Mining: `${URL_RTBASE}/CANUSA_Gridded_GDP_Mining_and_Oil_and_Gas_2021/ImageServer`,
  //     Electricity: `${URL_RTBASE}/CANUSA_Gridded_GDP_Electricity_2021/ImageServer`,
  //     Manufacturing: `${URL_RTBASE}/CANUSA_Gridded_GDP_Manufacturing_2021/ImageServer`,
  //     Construction: `${URL_RTBASE}/CANUSA_Gridded_GDP_Construction_2021/ImageServer`,
  //     Transportation: `${URL_RTBASE}/CANUSA_Gridded_GDP_Transportation_and_Warehousing_2021/ImageServer`,
  //     Trade: `${URL_RTBASE}/CANUSA_Gridded_GDP_Trade_2021/ImageServer`,
  //     Finance: `${URL_RTBASE}/CANUSA_Gridded_GDP_Financial_Intermediate_and_Real_Estate_2021/ImageServer`,
  //     Government: `${URL_RTBASE}/CANUSA_Gridded_GDP_Government_and_Public_Administration_2021/ImageServer`,
  //     Other: `${URL_RTBASE}/CANUSA_Gridded_GDP_Other_Services_2021/ImageServer`,
  //   },
  //   colorScheme: [
  //     {
  //       minValue: 0.1,
  //       maxValue: 800000,
  //       symbol: {
  //         type: "simple-fill",
  //         color: [50, 48, 50, 1.0],
  //       },
  //       label: "< $800K",
  //     },
  //     {
  //       minValue: 800000,
  //       maxValue: 1200000,
  //       symbol: {
  //         type: "simple-fill",
  //         color: [90, 55, 65, 1.0],
  //       },
  //       label: "$1.2M",
  //     },
  //     {
  //       minValue: 1200000,
  //       maxValue: 10700000,
  //       symbol: {
  //         type: "simple-fill",
  //         color: [160, 70, 100, 1.0],
  //       },
  //       label: "$10.7M",
  //     },
  //     {
  //       minValue: 10700000,
  //       maxValue: 25000000,
  //       symbol: {
  //         type: "simple-fill",
  //         color: [210, 130, 60, 1.0],
  //       },
  //       label: "$25M",
  //     },
  //     {
  //       minValue: 25000000,
  //       maxValue: 14220000000,
  //       symbol: {
  //         type: "simple-fill",
  //         color: [240, 249, 33, 1.0],
  //       },
  //       label: "> $25M",
  //     },
  //   ],
  //   title: "gdp 10",
  //   unit: "(Purchasing Power Parity, USD)",
  //   suffix: "USD",
  //   categories: [
  //       "Agriculture",
  //       "Mining",
  //       "Electricity",
  //       "Construction",
  //       "Manufacturing",
  //       "Transportation",
  //       "Trade",
  //       "Finance",
  //       "Government",
  //       "Other",
  //     ],
  //   icon: "M2.05814 1.02911C1.47929 1.02911 1.02907 1.47933 1.02907 2.05818V3.08725C2.15461 3.08725 3.08721 2.15465 3.08721 1.02911H2.05814ZM1.02907 4.11632V8.2326C2.73347 8.2326 4.11628 9.61541 4.11628 11.3198H12.3488C12.3488 9.61541 13.7316 8.2326 15.436 8.2326V4.11632C13.7316 4.11632 12.3488 2.73351 12.3488 1.02911H4.11628C4.11628 2.73351 2.73347 4.11632 1.02907 4.11632ZM13.3779 11.3198H14.407C14.9858 11.3198 15.436 10.8696 15.436 10.2907V9.26167C14.3105 9.26167 13.3779 10.1943 13.3779 11.3198ZM1.02907 9.26167V10.2907C1.02907 10.8696 1.47929 11.3198 2.05814 11.3198H3.08721C3.08721 10.1943 2.15461 9.26167 1.02907 9.26167ZM15.436 3.08725V2.05818C15.436 1.47933 14.9858 1.02911 14.407 1.02911H13.3779C13.3779 2.15465 14.3105 3.08725 15.436 3.08725ZM0 2.05818C0 0.932634 0.932594 3.95775e-05 2.05814 3.95775e-05H14.407C15.5325 3.95775e-05 16.4651 0.932634 16.4651 2.05818V10.2907C16.4651 11.4163 15.5325 12.3489 14.407 12.3489H2.05814C0.932594 12.3489 0 11.4163 0 10.2907V2.05818ZM10.2907 6.17446C10.2907 5.04891 9.3581 4.11632 8.23256 4.11632C7.10701 4.11632 6.17442 5.04891 6.17442 6.17446C6.17442 7.3 7.10701 8.2326 8.23256 8.2326C9.3581 8.2326 10.2907 7.3 10.2907 6.17446ZM5.14535 6.17446C5.14535 4.47006 6.52816 3.08725 8.23256 3.08725C9.93696 3.08725 11.3198 4.47006 11.3198 6.17446C11.3198 7.87886 9.93696 9.26167 8.23256 9.26167C6.52816 9.26167 5.14535 7.87886 5.14535 6.17446Z"
  // },
  "Urban GDP": {
    url: { "Urban GDP": `${URL_RTBASE}/murakami_urbangdp/ImageServer` },
    colorScheme: [
      {
        minValue: 4.0,
        maxValue: 6096.0,
        symbol: {
          type: "simple-fill",
          color: [50, 48, 50, 1.0],
        },
        label: "< $6.1K",
      },
      {
        minValue: 6096.0,
        maxValue: 104910.0,
        symbol: {
          type: "simple-fill",
          color: [90, 55, 65, 1.0],
        },
        label: "$104.9K",
      },
      {
        minValue: 104910.0,
        maxValue: 627995.0,
        symbol: {
          type: "simple-fill",
          color: [160, 70, 100, 1.0],
        },
        label: "$628.0K",
      },
      {
        minValue: 627995.0,
        maxValue: 13321377.0,
        symbol: {
          type: "simple-fill",
          color: [210, 130, 60, 1.0],
        },
        label: "$13.3M",
      },
      {
        minValue: 13321377.0,
        maxValue: 4346626560.0,
        symbol: {
          type: "simple-fill",
          color: [240, 249, 33, 1.0],
        },
        label: "> $13.3M",
      },
    ],
    title: "urban gdp",
    unit: "(Purchasing Power Parity, USD)",
    suffix: "USD",
    eventAttribute: "urbangdp",
    categories: [],
    icon: "M9.26163 1.02908C8.68278 1.02908 8.23256 1.47929 8.23256 2.05815V14.407C8.23256 14.9858 8.68278 15.4361 9.26163 15.4361H16.4651C17.044 15.4361 17.4942 14.9858 17.4942 14.407V8.23256C17.4942 7.65371 17.044 7.20349 16.4651 7.20349H13.8924C13.603 7.20349 13.3779 6.97838 13.3779 6.68896V2.05815C13.3779 1.47929 12.9277 1.02908 12.3488 1.02908H9.26163ZM7.20349 14.407V4.11628H2.05814C1.47929 4.11628 1.02907 4.5665 1.02907 5.14535V14.407C1.02907 14.9858 1.47929 15.4361 2.05814 15.4361H7.49291C7.29996 15.1466 7.20349 14.7929 7.20349 14.407ZM7.20349 2.05815C7.20349 0.9326 8.13608 5.48363e-06 9.26163 5.48363e-06H12.3488C13.4744 5.48363e-06 14.407 0.9326 14.407 2.05815V6.17442H16.4651C17.5907 6.17442 18.5233 7.10702 18.5233 8.23256V14.407C18.5233 15.5325 17.5907 16.4651 16.4651 16.4651H2.05814C0.932594 16.4651 0 15.5325 0 14.407V5.14535C0 4.01981 0.932594 3.08721 2.05814 3.08721V0.51454C2.05814 0.225114 2.28325 5.48363e-06 2.57267 5.48363e-06C2.8621 5.48363e-06 3.08721 0.225114 3.08721 0.51454V3.08721H4.88808V0.51454C4.88808 0.225114 5.11319 5.48363e-06 5.40262 5.48363e-06C5.69204 5.48363e-06 5.91715 0.225114 5.91715 0.51454V3.08721H7.20349V2.05815ZM10.0334 3.34448C10.0334 3.05506 10.2585 2.82995 10.548 2.82995H11.0625C11.3519 2.82995 11.577 3.05506 11.577 3.34448V3.85902C11.577 4.14844 11.3519 4.37355 11.0625 4.37355H10.548C10.2585 4.37355 10.0334 4.14844 10.0334 3.85902V3.34448ZM10.548 5.91716H11.0625C11.3519 5.91716 11.577 6.14227 11.577 6.43169V6.94623C11.577 7.23565 11.3519 7.46076 11.0625 7.46076H10.548C10.2585 7.46076 10.0334 7.23565 10.0334 6.94623V6.43169C10.0334 6.14227 10.2585 5.91716 10.548 5.91716ZM10.0334 9.5189C10.0334 9.22948 10.2585 9.00437 10.548 9.00437H11.0625C11.3519 9.00437 11.577 9.22948 11.577 9.5189V10.0334C11.577 10.3229 11.3519 10.548 11.0625 10.548H10.548C10.2585 10.548 10.0334 10.3229 10.0334 10.0334V9.5189ZM3.34448 5.91716H3.85901C4.14844 5.91716 4.37355 6.14227 4.37355 6.43169V6.94623C4.37355 7.23565 4.14844 7.46076 3.85901 7.46076H3.34448C3.05505 7.46076 2.82994 7.23565 2.82994 6.94623V6.43169C2.82994 6.14227 3.05505 5.91716 3.34448 5.91716ZM2.82994 9.5189C2.82994 9.22948 3.05505 9.00437 3.34448 9.00437H3.85901C4.14844 9.00437 4.37355 9.22948 4.37355 9.5189V10.0334C4.37355 10.3229 4.14844 10.548 3.85901 10.548H3.34448C3.05505 10.548 2.82994 10.3229 2.82994 10.0334V9.5189ZM14.6642 9.00437H15.1788C15.4682 9.00437 15.6933 9.22948 15.6933 9.5189V10.0334C15.6933 10.3229 15.4682 10.548 15.1788 10.548H14.6642C14.3748 10.548 14.1497 10.3229 14.1497 10.0334V9.5189C14.1497 9.22948 14.3748 9.00437 14.6642 9.00437Z",
  },
  Cropland: {
    url: { Cropland: `${URL_RTBASE}/esri_cropland/ImageServer` },
    colorScheme: [
      {
        minValue: 0.5,
        maxValue: 1.0,
        symbol: { type: "simple-fill", color: [168, 198, 108, 1] },
        label: "",
      },
    ],
    title: "land cover class: cropland",
    unit: "",
    suffix: "hectares",
    eventAttribute: "cropland",
    categories: [],
    icon: "M0.932617 17.3335C0.739667 17.5586 0.418082 17.5586 0.225132 17.3335C2.27168e-05 17.1406 0.0321811 16.819 0.225132 16.626L0.932617 17.3335ZM2.37975 7.97541C2.50838 7.97541 2.63701 8.03973 2.73349 8.1362L4.21278 9.61549C5.01674 10.3873 5.27401 11.5128 5.0489 12.5097C6.04581 12.2846 7.17135 12.5419 7.94316 13.3459L9.42244 14.8252C9.51892 14.9216 9.58324 15.0503 9.58324 15.1789C9.58324 15.3075 9.51892 15.4362 9.42244 15.5326L9.19733 15.7899C8.00747 16.9798 6.04581 16.9798 4.82379 15.7899L3.66608 14.6322L0.932617 17.3335C0.707508 17.1084 0.450241 16.8511 0.225132 16.626L2.92644 13.8926L1.76874 12.7349C0.578874 11.5128 0.578874 9.58333 1.76874 8.36131L2.026 8.1362L2.09032 8.07189C2.1868 8.00757 2.28327 7.97541 2.37975 7.97541ZM7.23567 14.0534C6.49603 13.3459 5.33832 13.2494 4.5022 13.8926L4.43789 13.9569L5.56343 15.0503C6.30308 15.8221 7.5251 15.8542 8.32906 15.1789L7.23567 14.0534ZM5.72422 4.63093C5.85286 4.63093 5.98149 4.69525 6.07797 4.79173L7.55725 6.27101C8.36121 7.04282 8.61848 8.16836 8.39337 9.16527C9.39028 8.94016 10.5158 9.19743 11.2876 10.0014L12.7669 11.4807C12.8634 11.5772 12.9277 11.7058 12.9277 11.8344C12.9277 11.9631 12.8634 12.0917 12.7669 12.1882L12.5418 12.4454C11.3519 13.6353 9.39028 13.6353 8.16826 12.4454L5.11321 9.39038C3.92335 8.16836 3.92335 6.23885 5.11321 5.01683L5.37048 4.79173L5.4348 4.72741C5.53127 4.66309 5.62775 4.63093 5.72422 4.63093ZM2.37975 9.22959C1.70442 10.0335 1.73658 11.2556 2.50838 11.9952L3.63393 13.1208L3.66608 13.0564L3.79472 12.8956C4.30925 12.0917 4.18062 11.0305 3.50529 10.323L2.37975 9.22959ZM10.5801 10.7089C9.8405 9.96923 8.6828 9.90492 7.84668 10.5481L7.78236 10.5802L8.90791 11.7058C9.64755 12.4776 10.8696 12.5097 11.6735 11.8344L10.5801 10.7089ZM9.0687 1.28646C9.19733 1.28646 9.32597 1.35077 9.42244 1.44725L10.9017 2.92654C11.7057 3.69834 11.963 4.82388 11.7378 5.82079C12.7348 5.59569 13.8603 5.85295 14.6321 6.65691L16.1114 8.1362C16.2079 8.23268 16.2722 8.36131 16.2722 8.48994C16.2722 8.61858 16.2079 8.74721 16.1114 8.84369L15.8863 9.10095C14.6964 10.2908 12.7348 10.2908 11.5127 9.10095L8.45769 6.0459C7.26783 4.82388 7.26783 2.89438 8.45769 1.67236L8.71496 1.44725L8.77927 1.38293C8.87575 1.31861 8.97222 1.28646 9.0687 1.28646ZM5.72422 5.88511C5.0489 6.68907 5.08105 7.91109 5.85286 8.65074L6.9784 9.77628L7.01056 9.71197L7.13919 9.55117C7.65373 8.74721 7.5251 7.68598 6.84977 6.9785L5.72422 5.88511ZM13.9246 7.3644C13.185 6.62476 12.0273 6.56044 11.1912 7.20361L11.1268 7.26792L12.2524 8.36131C12.992 9.13311 14.214 9.16527 15.018 8.48994L13.9246 7.3644ZM9.0687 2.54064C8.39337 3.3446 8.42553 4.56662 9.19733 5.30626L10.3229 6.43181L10.355 6.36749L10.4837 6.2067C10.9982 5.40274 10.8696 4.34151 10.1942 3.63402L9.0687 2.54064ZM17.1405 0.00011903C17.2369 0.0322775 17.3334 0.0644359 17.3977 0.160911C17.4942 0.257386 17.5585 0.38602 17.5585 0.514654V1.6402V1.80099C17.4942 3.31244 16.24 4.56662 14.7286 4.63093H14.5678H13.4422C13.3136 4.63093 13.185 4.56662 13.0885 4.47014C12.992 4.37367 12.9277 4.24503 12.9277 4.1164V2.99085C12.9277 1.35077 14.2784 0.00011903 15.9184 0.00011903H17.044H17.1405ZM15.9184 1.02919C14.8251 1.02919 13.9568 1.89747 13.9568 2.99085V3.60186H14.5678H14.7607C15.6933 3.50539 16.433 2.76574 16.5295 1.83315V1.6402V1.02919H15.9184Z",
  },
  Airports: {
    url: { Airports: `${URL_BASE}/airports_latest/FeatureServer` },
    colorScheme: [
      {
        minValue: 0.5,
        maxValue: 1.0,
        symbol: { type: "simple-fill", color: [255, 200, 0, 1] },
        label: "",
      },
    ],
    title: "airports",
    unit: "",
    suffix: "airports",
    eventAttribute: "airports",
    categories: [],
    icon: "M16.7544 6.17442C17.88 6.17442 18.8126 7.10702 18.8126 8.23256C18.8126 9.35811 17.88 10.2907 16.7544 10.2907H13.3778L7.87871 16.3043C7.78224 16.4008 7.6536 16.4651 7.49281 16.4651H4.92014C4.75935 16.4651 4.59855 16.4008 4.50208 16.24C4.4056 16.1114 4.37344 15.9506 4.43776 15.7898L6.27079 10.2907H4.4056L2.50826 12.6704C2.41178 12.7991 2.25099 12.8634 2.0902 12.8634H0.546591C0.385799 12.8634 0.225007 12.7991 0.128532 12.6704C0.0320562 12.5418 -0.000102188 12.381 0.0642147 12.2202L1.06113 8.23256L0.0642147 4.24492C-0.000102188 4.08413 0.0320562 3.92333 0.128532 3.7947C0.225007 3.66607 0.385799 3.60175 0.546591 3.60175H2.0902C2.25099 3.60175 2.41178 3.66607 2.50826 3.7947L4.4056 6.17442H6.27079L4.43776 0.675333C4.37344 0.51454 4.4056 0.353748 4.50208 0.225114C4.59855 0.0964808 4.75935 5.48363e-06 4.92014 5.48363e-06H7.49281C7.6536 5.48363e-06 7.78224 0.0643223 7.87871 0.160798L13.3778 6.17442H16.7544ZM17.7835 8.23256C17.7835 7.65371 17.3333 7.20349 16.7544 7.20349H4.14834C3.98754 7.20349 3.85891 7.13918 3.76243 7.01054L1.83293 4.63082H1.22192L2.0902 8.10393C2.0902 8.20041 2.0902 8.26472 2.0902 8.3612L1.22192 11.8343H1.83293L3.76243 9.45458C3.85891 9.32595 3.98754 9.26163 4.14834 9.26163H16.7544C17.3333 9.26163 17.7835 8.81142 17.7835 8.23256ZM11.995 10.2907H7.36418L5.62762 15.4361H7.2677L11.995 10.2907ZM7.2677 1.02908H5.62762L7.36418 6.17442H11.995L7.2677 1.02908Z",
  },
  Ports: {
    url: { Ports: `${URL_BASE}/PortWatch_ports_database/FeatureServer` },
    colorScheme: [
      {
        minValue: 0.5,
        maxValue: 1.0,
        symbol: { type: "simple-fill", color: [255, 200, 0, 1] },
        label: "",
      },
    ],
    title: "ports",
    unit: "",
    suffix: "ports",
    eventAttribute: "ports",
    categories: [],
    icon: "M12.6062 15.1466C13.7639 14.4713 15.2432 14.5034 16.3687 15.3074L16.5938 15.4682C17.1084 15.7898 17.6229 16.047 18.1053 16.1435C18.652 16.24 19.2308 16.1757 19.8097 15.7576L19.9061 15.7255C20.0991 15.629 20.3885 15.6933 20.5171 15.8863C20.6779 16.1114 20.6458 16.4329 20.3885 16.5937L20.2599 16.6902C19.4881 17.2047 18.6841 17.3012 17.9123 17.1726C17.237 17.044 16.5938 16.6902 16.015 16.3043L15.7577 16.1435C14.9859 15.5968 13.9568 15.5647 13.1207 16.047L12.9599 16.1435C12.1881 16.6902 11.3842 17.1726 10.5159 17.2369H10.3229C9.51896 17.2369 8.715 16.851 8.00752 16.3686L7.68593 16.1435C6.91413 15.5968 5.8529 15.5325 5.04894 16.047L4.88815 16.1435C4.14851 16.6581 3.24807 17.1726 2.28332 17.2047L2.09037 17.2369C1.54367 17.2047 0.996979 17.0761 0.482445 16.7545L0.257336 16.5937L0.16086 16.5294C6.81318e-05 16.3686 6.81318e-05 16.0792 0.128702 15.8863C0.289494 15.6933 0.546761 15.629 0.77187 15.7255L0.836187 15.7576L0.996979 15.8863C1.38288 16.1114 1.73662 16.1757 2.09037 16.2078L2.219 16.1757C2.89433 16.1435 3.60181 15.8219 4.27714 15.3074L4.50225 15.1466C5.69211 14.4713 7.1714 14.5034 8.29694 15.3074L8.58637 15.5004C9.2617 15.9506 9.80839 16.2078 10.3229 16.2078H10.548C11.0626 16.1435 11.6414 15.8219 12.3489 15.3074L12.6062 15.1466ZM10.3229 -1.15633e-05C10.6124 -1.15633e-05 10.8375 0.225097 10.8375 0.514523V1.54359H13.9247C14.7929 1.54359 15.4683 2.25108 15.4683 3.0872V5.20965L16.4652 5.43476L16.626 5.46692C17.4621 5.75635 17.9123 6.65678 17.5907 7.46074L16.5295 10.2907C16.4973 10.355 16.4973 10.4193 16.4973 10.4836V13.603C16.1758 13.4422 15.822 13.3136 15.4683 13.2493V10.4836C15.4683 10.2907 15.5004 10.0977 15.5647 9.93694L16.626 7.107C16.7225 6.81758 16.5617 6.49599 16.2401 6.43167L10.8375 5.27397V14.4391C10.6445 14.5678 10.4837 14.6321 10.4194 14.6642H10.3229C10.2908 14.6642 10.13 14.6321 9.80839 14.4391V5.27397L4.40577 6.43167C4.08419 6.49599 3.9234 6.81758 4.01987 7.107L5.0811 9.93694L5.11326 10.0656C5.14542 10.1942 5.17758 10.355 5.17758 10.4836V13.2493C4.82383 13.3136 4.47009 13.4422 4.14851 13.603V10.4836C4.14851 10.4515 4.14851 10.4193 4.14851 10.3872L4.11635 10.2907L3.05512 7.46074C2.73353 6.59247 3.24807 5.62771 4.18066 5.43476L5.17758 5.20965V3.0872C5.17758 2.25108 5.88506 1.54359 6.72118 1.54359H9.80839V0.514523C9.80839 0.225097 10.0335 -1.15633e-05 10.3229 -1.15633e-05ZM6.72118 2.57266C6.43175 2.57266 6.20665 2.79777 6.20665 3.0872V4.98455L10.0013 4.18058C10.2264 4.11627 10.4194 4.11627 10.6445 4.18058L14.4392 4.98455V3.0872C14.4392 2.79777 14.2141 2.57266 13.9247 2.57266H6.72118Z",
  },
};

export const comparisonTitles = (
  hazard: string,
  exposure: string,
  measure: string,
  threshold: string,
  iso3: string,
) => {
  const colorAxisTitleMapper: Record<
    string,
    Record<string, Record<string, string>>
  > = {
    "Temperature Extremes": {
      Population: {
        colorAxis: `${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year`,
        chart: `${countryByIso3[iso3]}: Population-weighted ${measureMapper[measure]} (${thresholdToTitle[threshold]}° C)`,
        subtitle: `(${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year; trajectory across all time periods and scenarios)`,
      },
      Livestock: {
        colorAxis: `${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year`,
        chart: `${countryByIso3[iso3]}: Livestock-weighted ${measureMapper[measure]} (${thresholdToTitle[threshold]}° C)`,
        subtitle: `(${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year; trajectory across all time periods and scenarios)`,
      },
      GDP: {
        colorAxis: `${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year`,
        chart: `${countryByIso3[iso3]}: GDP-weighted ${measureMapper[measure]} (${thresholdToTitle[threshold]}° C)`,
        subtitle: `(${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year; trajectory across all time periods and scenarios)`,
      },
      "Urban GDP": {
        colorAxis: `${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year`,
        chart: `${countryByIso3[iso3]}: Urban GDP-weighted ${measureMapper[measure]} (${thresholdToTitle[threshold]}° C)`,
        subtitle: `(${["H_20", "H_26", "H_32"].includes(threshold) ? "Nights" : "Days"} per year; trajectory across all time periods and scenarios)`,
      },
    },
    "Riverine Flooding": {
      Population: {
        colorAxis: "Percent of population exposed",
        chart: `${countryByIso3[iso3]}: Population Exposed to Riverine Flooding`,
        subtitle:
          "(Percent of total population; trajectory across all time periods and scenarios)",
      },
      Buildings: {
        colorAxis: "Percent of buildings exposed",
        chart: `${countryByIso3[iso3]}: Buildings Exposed to Riverine Flooding`,
        subtitle:
          "(Percent of total buildings; trajectory across all time periods and scenarios)",
      },
      "Builtup Area": {
        colorAxis: "Builtup area exposed (Km²)",
        chart: `${countryByIso3[iso3]}: Builtup Area (Km²) Exposed to Riverine Flooding`,
        subtitle:
          "(Builtup area in Km²; trajectory across all time periods and scenarios)",
      },
      GDP: {
        colorAxis: "Percent of GDP exposed",
        chart: `${countryByIso3[iso3]}: GDP Exposed to Riverine Flooding`,
        subtitle:
          "(Percent of total GDP; trajectory across all time periods and scenarios)",
      },
      "Urban GDP": {
        colorAxis: "Percent of urban GDP exposed",
        chart: `${countryByIso3[iso3]}: Urban GDP Exposed to Riverine Flooding`,
        subtitle:
          "(Percent of total urban GDP; trajectory across all time periods and scenarios)",
      },
    },
    "Coastal Flooding": {
      Population: {
        colorAxis: "Percent of population exposed",
        chart: `${countryByIso3[iso3]}: Population Exposed to Coastal Flooding`,
        subtitle:
          "(Percent of total population; trajectory across all time periods and scenarios)",
      },
      Buildings: {
        colorAxis: "Percent of buildings exposed",
        chart: `${countryByIso3[iso3]}: Buildings Exposed to Coastal Flooding`,
        subtitle:
          "(Percent of total buildings; trajectory across all time periods and scenarios)",
      },
      "Builtup Area": {
        colorAxis: "Builtup area exposed (Km²)",
        chart: `${countryByIso3[iso3]}: Builtup Area (Km²) Exposed to Coastal Flooding`,
        subtitle:
          "(Builtup area in Km²; trajectory across all time periods and scenarios)",
      },
      GDP: {
        colorAxis: "Percent of GDP exposed",
        chart: `${countryByIso3[iso3]}: GDP Exposed to Coastal Flooding`,
        subtitle:
          "(Percent of total GDP; trajectory across all time periods and scenarios)",
      },
      "Urban GDP": {
        colorAxis: "Percent of urban GDP exposed",
        chart: `${countryByIso3[iso3]}: Urban GDP Exposed to Coastal Flooding`,
        subtitle:
          "(Percent of total urban GDP; trajectory across all time periods and scenarios)",
      },
    },
    Drought: {
      Cropland: {
        colorAxis: `${measureMapper[measure] == "Dry Days" ? "Days per year" : "SPEI Index for cropland"}`,
        chart: `${measureMapper[measure] == "Dry Days" ? `${countryByIso3[iso3]}: Maximum Number of Consecutive Dry Days on Cropland` : `${countryByIso3[iso3]}: Standardized Precipitation Evapotranspiration Index for Cropland`}`,
        subtitle: `(${measureMapper[measure] == "Dry Days" ? "Days per year" : "Index value"}; trajectory across all time periods and scenarios)`,
      },
    },
  };

  return colorAxisTitleMapper[hazard][exposure];
};

// Single page-level note for the Compare view. Content varies by indicator only.
// Historical baselines: temperature Population 2005, Livestock 2010 (confirmed).
// TODO(baseline-year): 2020 exposure layer and 2005 flood-historical baseline are still from the
// mocks and unconfirmed (Open Question 1). Update once the team confirms.
export const comparisonNote = (
  hazard: string,
  exposure: string,
  _measure: string,
  threshold: string,
): string[] => {
  const isTmin = ["H_20", "H_26", "H_32"].includes(threshold);
  const daysNights = isTmin ? "nights" : "days";

  switch (hazard) {
    case "Riverine Flooding":
    case "Coastal Flooding": {
      const years = threshold
        ? parseInt(threshold.replace(/[^0-9]/g, ""), 10)
        : undefined;
      const annualProb =
        urlObject[hazard][exposure].threshold?.group[threshold];
      return [
        `Values shown for the ${years}-year return period (${annualProb} annual probability of flooding). ${exposure} is held at the observed 2020 layer (2005 for the historical baseline); only the flood hazard evolves across periods, so values isolate the effect of a changing climate. The historical value is common to both scenarios. See the indicator methodology note for details.`,
        "Scenario names (Orderly / Disorderly) are display conventions referring to the physical-climate pathways RCP 4.5 and RCP 8.5. Downloadable tables report the scenario codes (historical, rcp4p5, rcp8p5).",
      ];
    }
    case "Temperature Extremes": {
      const avgClause =
        exposure === "Population"
          ? " — i.e. what the average resident experiences"
          : "";
      const historicalYear = exposure === "Livestock" ? "2010" : "2005";
      return [
        `Values shown for the selected hazard type. The measure is the ${exposure.toLowerCase()}-weighted mean number of ${daysNights} per year meeting the threshold${avgClause}. ${exposure} is held at the observed 2020 layer (${historicalYear} for the historical baseline); only the temperature hazard evolves across periods, so values isolate the effect of a changing climate. The historical value is common to all scenarios. See the indicator methodology note for details.`,
        "Scenario names (Orderly / Disorderly / Hot House) are display conventions referring to the physical-climate pathways SSP1-2.6, SSP2-4.5 and SSP3-7.0. Downloadable tables report the scenario codes (historical, ssp126, ssp245, ssp370).",
      ];
    }
    case "Drought":
      return [
        "Values shown for the selected measure on cropland. Cropland exposure is held fixed; only the drought hazard evolves across periods, so values isolate the effect of a changing climate. The historical value is common to all scenarios. See the indicator methodology note for details.",
        "A dry day is defined as a day with less than 1 mm of accumulated precipitation.",
        "Scenario names (Orderly / Disorderly / Hot House) are display conventions referring to the physical-climate pathways SSP1-2.6, SSP2-4.5 and SSP3-7.0. Downloadable tables report the scenario codes (historical, ssp126, ssp245, ssp370).",
      ];
    default:
      return [];
  }
};

// Context line under the map title: the map is a single-period, single-scenario snapshot,
// so it carries the current selection state (unit; scenario; return period [Method B]; time period).
export const comparisonMapContext = (
  hazard: string,
  exposure: string,
  measure: string,
  threshold: string,
  scenario: string,
  time: number,
  iso3: string,
): string => {
  const parts: string[] = [];

  // unit — reuse the legend title so wording stays consistent
  parts.push(
    comparisonTitles(hazard, exposure, measure, threshold, iso3).colorAxis,
  );

  // return period — Method B (flooding) only
  if (
    urlObject[hazard][exposure].threshold?.type === "RETURN_PERIOD" &&
    threshold
  ) {
    const years = parseInt(threshold.replace(/[^0-9]/g, ""), 10);
    parts.push(`${years}-year return period`);
  }

  // scenario — omit for the scenario-independent historical period; include the code in parens
  const isHistorical = time === 1980;
  if (!isHistorical && scenarioMapper[scenario])
    parts.push(scenarioLabel(scenario));

  // time period
  const timeIndex = [1980, 2030, 2050, 2080].indexOf(time);
  if (timePeriodLabels[timeIndex]) parts.push(timePeriodLabels[timeIndex]);

  return `(${parts.join("; ")})`;
};

export const eventTypes: Record<
  string,
  { type: string; singularType: string; color: string }
> = {
  AL: {
    type: "All Events",
    singularType: "",
    color: "",
  },
  EQ: {
    type: "Earthquakes",
    singularType: "Earthquake",
    color: "var(--green)",
  },
  TC: {
    type: "Tropical Cyclones",
    singularType: "Tropical Cyclone",
    color: "var(--red)",
  },
  DR: {
    type: "Droughts",
    singularType: "Drought",
    color: "var(--purple)",
  },
  FL: {
    type: "Flooding",
    singularType: "Flooding",
    color: "var(--cyan)",
  },
  VO: {
    type: "Volcanic Eruptions",
    singularType: "Volcanic Eruption",
    color: "var(--yellow)",
  },
  WF: {
    type: "Wildfires",
    singularType: "Wildfire",
    color: "var(--orange)",
  },
};

export const timePeriods: { period: string; year: number }[] = [
  { period: "Historical", year: 1980 },
  { period: "2030", year: 2030 },
  { period: "2050", year: 2050 },
  { period: "2080", year: 2080 },
];
