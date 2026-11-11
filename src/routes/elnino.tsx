import { createFileRoute, Link } from "@tanstack/react-router";
import { AppActionsContext, AppStateContext } from "../app";
import { useState, useRef, useEffect, useContext } from "react";

import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer";
import type VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";

import "@arcgis/map-components/components/arcgis-scale-bar";
import type {} from "@arcgis/map-components/types/react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { MapDisclaimer } from "@/components/MapDisclaimer";
import { createBasemapLayers } from "@/lib/basemap";
import { cn } from "@/lib/utils";

import {
  ELNINO_PANEL_URL,
  ELNINO_SOURCE,
  buildElninoUrl,
  elninoBases,
  elninoExposures,
  elninoHazards,
  elninoLayerKey,
  ensoCategory,
  formatRoni,
  formatShare,
  phaseLabel,
  type ElninoBasis,
  type ElninoExposure,
  type ElninoHazard,
  type ElninoPanel,
  type ElninoStrength,
} from "@/config/elnino";

// El Niño view, ported from geopulse-dev2 and restyled to match the Grid (map, legend, scale bar)
// and Events (side panel) views.
export const Route = createFileRoute("/elnino")({
  component: ElninoView,
});

// Same bivariate palette and 1–9 field layout as the Grid view:
// field = (exposure class − 1) × 3 + hazard class
const byField: Record<number, string> = {
  9: "#FF139C",
  8: "#E643C4",
  7: "#A659EE",
  6: "#BC8DA1",
  5: "#956D9C",
  4: "#6D4E93",
  3: "#00BCA6",
  2: "#127A71",
  1: "#343D41",
};
const valuesArray = Object.entries(byField).map(([field, color]) => ({
  value: Number(field),
  symbol: { type: "simple-fill", color },
}));

// legend matrix layout: rows top→bottom = high→low exposure, columns left→right = low→high hazard
const cellOrder = [7, 8, 9, 4, 5, 6, 1, 2, 3];
const yTickColors = ["#8E8E93", "#9C8BB5", "#A97CF2"]; // low, mid, high
const xTickColors = ["#8E8E93", "#5FAE9F", "#4FD1BC"];
const levels = ["Low", "Medium", "High"];

const hazardNoun: Record<ElninoHazard, string> = {
  dry: "Drying",
  wet: "Wetting",
  hot: "Warming",
  cold: "Cooling",
};

// Bar colours for the recent-seasons chart, by phase.
const phaseColor: Record<string, string> = {
  "El Nino": "#DA291C",
  "El Nino conditions": "#E97F77",
  "La Nina": "#407EC9",
  "La Nina conditions": "#8CB2DF",
  Neutral: "#B6B0AC",
};

const compact = (n: number) => n.toLocaleString("en", { notation: "compact", maximumFractionDigits: 1 });
// exposure class labels per 30″ cell, from the panel's class breaks
const exposureClassLabels = (exposure: ElninoExposure, breaks?: number[]) => {
  if (!breaks || breaks.length < 2) return levels;
  const f = exposure === "agrgva" ? (n: number) => "$" + compact(n) : compact;
  const [a, b] = breaks.map(f);
  return [`<${a}`, `${a}–${b}`, `≥${b}`];
};
const exposureAxisUnit: Record<ElninoExposure, string> = {
  agrgva: "US$ per cell",
  pop: "people per cell",
};

function ElninoView() {
  const actions = useContext(AppActionsContext);
  const appState = useContext(AppStateContext);
  useEffect(() => {
    actions?.setView("El Niño");
  }, []);

  const [basis, setBasis] = useState<ElninoBasis>("both");
  const [hazard, setHazard] = useState<ElninoHazard>("dry");
  const [strength, setStrength] = useState<ElninoStrength>("now");
  // chosen in the header's El Niño Exposure dropdown
  const exposure: ElninoExposure =
    appState?.elninoExposure && appState.elninoExposure in elninoExposures
      ? (appState.elninoExposure as ElninoExposure)
      : (Object.keys(elninoExposures)[0] as ElninoExposure);
  const [panel, setPanel] = useState<ElninoPanel | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [layerError, setLayerError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const [position, setPosition] = useState({});
  const [isolatedField, setIsolatedField] = useState<number | null>(null);
  const [hoveredField, setHoveredField] = useState<number | null>(null);

  const ref = useRef(null);
  const scaleBarRef = useRef<any>(null);
  const map = useRef<Map | null>(null);
  const layer = useRef<ImageryTileLayer | null>(null);
  const labelsLayer = useRef<VectorTileLayer | null>(null);
  const view = useRef<MapView>(new MapView());

  useEffect(() => {
    // A missing file usually comes back from the dev server as index.html
    // (HTTP 200, not JSON), so check both the status and the content type.
    fetch(ELNINO_PANEL_URL)
      .then(async (res) => {
        const type = res.headers.get("content-type") ?? "";
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!type.includes("json")) throw new Error(`got ${type || "unknown content"}, not JSON`);
        return res.json();
      })
      .then((json: ElninoPanel) => {
        setPanel(json);
        setPanelError(null);
      })
      .catch((err) => {
        console.error("El Niño panel data not loaded:", ELNINO_PANEL_URL, err);
        setPanelError(String(err?.message ?? err));
      });
  }, []);

  // map: shared basemap (same as Grid and Events), centred on 60°E so the Pacific sits under the side panel
  useEffect(() => {
    if (!ref.current) return;
    const { base, boundaries, labels } = createBasemapLayers();
    labelsLayer.current = labels;
    map.current = new Map({ layers: [base, boundaries, labels] });

    view.current = new MapView({
      container: ref.current,
      map: map.current,
      zoom: 2,
      center: [60, 10],
      constraints: { minZoom: 2, maxZoom: 10 },
      spatialReference: { wkid: 3857 },
      viewpoint: position,
    });
    view.current.ui.components = [];
    view.current.padding = { top: 59, right: 366, bottom: 0, left: 0 }; // header + side panel
    if (scaleBarRef.current) scaleBarRef.current.view = view.current;

    reactiveUtils.watch(
      () => view.current.viewpoint,
      (viewpoint) => {
        if (viewpoint) setPosition(viewpoint);
      },
    );
    return () => {
      view.current.destroy();
    };
  }, []);

  const url = buildElninoUrl(basis, hazard, strength, exposure);

  // (re)build the bivariate layer; `only` keeps a single class (legend isolation)
  const showLayer = (only: number | null) => {
    if (!map.current) return;
    if (layer.current) {
      map.current.remove(layer.current);
      layer.current.destroy();
    }
    layer.current = new ImageryTileLayer({
      url,
      renderer: new UniqueValueRenderer({
        field: "Value",
        uniqueValueInfos: (only == null ? valuesArray : valuesArray.filter((v) => v.value === only)) as any,
      }),
    });
    // below the place-name labels so names stay readable on top of the data
    const labelsIndex = labelsLayer.current ? map.current.layers.indexOf(labelsLayer.current) : -1;
    map.current.add(layer.current, labelsIndex >= 0 ? labelsIndex : undefined);
    layer.current.load().catch((err: any) => {
      if (err?.name === "AbortError") return; // replaced by a newer selection
      console.error("El Niño map layer not loaded:", url, err);
      setLayerError(String(err?.message ?? err));
    });
  };

  // new selection: swap the layer and clear any isolation
  useEffect(() => {
    setIsolatedField(null);
    setLayerError(null);
    showLayer(null);
  }, [url]);

  function isolateField(field: number) {
    const next = isolatedField === field ? null : field;
    setIsolatedField(next);
    showLayer(next);
  }

  // hovering the map highlights the matching legend cell
  useEffect(() => {
    const pointerTracker = view.current.on("pointer-move", async (event) => {
      const response = await view.current.hitTest(event);
      const raster = response.results.find(
        (r: any) => r.layer instanceof ImageryTileLayer && r.type === "raster",
      ) as any;
      const field = raster?.pixelValue?.[0];
      setHoveredField(field && (isolatedField == null || isolatedField === field) ? field : null);
    });
    return () => pointerTracker.remove();
  }, [isolatedField]);

  const exposureCfg = elninoExposures[exposure];
  const exposureLabel = exposureCfg.label;
  const hazardCfg = elninoHazards[hazard];
  const summary = panel?.layers[elninoLayerKey(exposure, basis, hazard, strength)];
  const fmt = exposureCfg.format;

  // Slider stops come from the panel file; the thumb snaps to the nearest one.
  const stops = panel?.strengths ?? [];
  const current = stops.find((s) => s.key === strength) ?? stops.find((s) => s.key === "now");
  const nowStop = stops.find((s) => s.key === "now");
  const sMin = stops.length ? stops[0].value : -2;
  const sMax = stops.length ? stops[stops.length - 1].value : 2.5;
  const pos = (v: number) => ((v - sMin) / (sMax - sMin)) * 100;
  const snap = (v: number) =>
    stops.reduce((best, s) => (Math.abs(s.value - v) < Math.abs(best.value - v) ? s : best), stops[0]);
  const sliderOff = basis === "observed" || !stops.length;

  // legend labels
  const hazardThreshold = panel?.thresholds[basis === "expected" ? "expected" : "observed"][hazardCfg.variable];
  const hazardClasses = hazardThreshold
    ? panel!.thresholds.class_steps.map((m) => `≥${+(m * hazardThreshold).toFixed(2)}`)
    : levels;
  const exposureClasses = exposureClassLabels(exposure, panel?.exposures[exposure]?.class_breaks);
  const basisLabel = elninoBases.find((b) => b.key === basis)?.label ?? "";
  const legendSubtitle =
    basis === "observed"
      ? `${basisLabel} · latest three months`
      : current && panel
        ? `${basisLabel} · ${current.key === "now" ? `now (${panel.season} ${panel.year})` : "scenario"}, RONI ${formatRoni(current.value, current.key === "now" ? 2 : 1)} °C`
        : basisLabel;
  const activeField = hoveredField ?? isolatedField;

  return (
    <div className="h-full relative overflow-hidden">
      <div className="w-full h-full bg-[#1D2224]" ref={ref}></div>

      {/* control card: same frame as the Grid view's threshold slider */}
      <div
        className="absolute w-[440px] max-w-[calc(100%-32px)] left-1/2 md:left-[calc(50%-183px)] top-[75px] -translate-x-1/2 p-px rounded-xl z-2"
        style={{ background: "linear-gradient(174.18deg, #0084FF 7.23%, rgba(92, 92, 92, 0) 95.52%)" }}
      >
        <div className="dark w-full rounded-xl bg-[#1D1D1D] px-5 pt-3.5 pb-2.5 flex flex-col items-center gap-3">
          <Tabs value={basis} onValueChange={(v) => setBasis(v as ElninoBasis)}>
            <TabsList className="w-[300px] bg-[#1E1E1E]">
              {elninoBases.map((b) => (
                <TabsTrigger key={b.key} value={b.key} title={b.description}>
                  {b.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="text-[13px] w-full font-bold text-muted-foreground">EL NIÑO STRENGTH · RONI (°C)</div>
          <div className={`w-full flex flex-col items-center ${sliderOff ? "opacity-40 pointer-events-none" : ""}`}>
            {/* "Now" marker above the track */}
            <div className="relative h-5" style={{ width: "calc(300px*0.9)" }}>
              {nowStop ? (
                <div
                  className="absolute bottom-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${pos(nowStop.value)}%` }}
                >
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${strength === "now" ? "text-white" : "text-muted-foreground"}`}
                  >
                    Now {formatRoni(nowStop.value, 2)}
                  </span>
                  <div className="w-px h-1.5 bg-white/70"></div>
                </div>
              ) : null}
            </div>
            <Slider
              aria-label="El Niño strength (RONI)"
              className="w-75 z-1 cursor-pointer [&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:bg-[linear-gradient(to_right,#004C97_0%,#5C5C5C_44%,#FDBB33_66%,#FF8200_83%,#FF0000_100%)]"
              min={sMin}
              max={sMax}
              step={0.01}
              value={[current?.value ?? 0]}
              onValueChange={(v) => stops.length && setStrength(snap(v[0]).key)}
              disabled={sliderOff}
            />
            <div className="relative h-11" style={{ width: "calc(300px*0.9)" }}>
              {stops
                .filter((s) => s.key !== "now")
                .map((s) => {
                  const whole = Number.isInteger(s.value);
                  return (
                    <div
                      key={s.key}
                      className="absolute flex flex-col items-center -translate-x-1/2"
                      style={{ left: `${pos(s.value)}%` }}
                    >
                      <div className={`w-px ${whole ? "h-2" : "h-1"} bg-muted-foreground/50`}></div>
                      {whole ? (
                        <span
                          className={`text-xs font-bold mt-0.5 whitespace-nowrap ${s.key === strength ? "text-white" : "text-muted-foreground"}`}
                        >
                          {formatRoni(s.value, 0)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              <div className="absolute left-0 bottom-0 text-[11px] font-bold text-(--accentblue-60)">La Niña</div>
              <div className="absolute right-0 bottom-0 text-[11px] font-bold text-(--red)">El Niño</div>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground text-center">
            {basis === "observed"
              ? "Observed conditions do not depend on El Niño strength"
              : !current || !panel
                ? "Strength scenarios load with the El Niño data"
                : current.key === "now"
                  ? `Current strength, ${panel.season} ${panel.year}: ${ensoCategory(current.value)} (RONI ${formatRoni(current.value, 2)} °C)`
                  : `Scenario: ${ensoCategory(current.value)} (RONI ${formatRoni(current.value)} °C)`}
          </div>
        </div>
      </div>

      {/* side panel: same card as the Events list (blue header, collapses to the header on desktop) */}
      <div
        className={`absolute z-2 bottom-0 md:bottom-2 right-0 md:right-2 h-[45%] md:h-auto md:top-[67px] w-full md:w-[350px] flex flex-col text-left ${collapsed ? "md:pointer-events-none" : ""}`}
      >
        <div
          className={`pointer-events-auto px-5 py-4 shadow-[0px_4px_5.8px_0px_#00000024] bg-(--accentdarkblue-100) text-white flex items-center justify-between gap-3 transition-[border-radius] duration-300 ${collapsed ? "md:rounded-lg rounded-t-lg" : "rounded-t-lg"}`}
        >
          <div className="flex flex-col items-start min-w-0">
            <b className="text-[20px] leading-tight">
              {panel ? phaseLabel(panel.phase) : panelError ? "El Niño data not available" : "Loading…"}
            </b>
            {panel && (
              <div className="text-[12px] mt-0.5">
                {panel.index.toUpperCase()} {formatRoni(panel.value, 2)} °C · {panel.season} {panel.year}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand El Niño panel" : "Collapse El Niño panel"}
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF24] cursor-pointer transition-colors hover:bg-[#FFFFFF40] focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <rect x="2.1" y="6.65" width="9.8" height="0.7" rx="0.35" fill="white" />
              <rect
                x="6.65"
                y="2.1"
                width="0.7"
                height="9.8"
                rx="0.35"
                fill="white"
                className={`origin-center [transform-box:fill-box] transition-transform duration-300 ease-out motion-reduce:transition-none ${collapsed ? "scale-y-100" : "scale-y-0"}`}
              />
            </svg>
          </button>
        </div>

        <div
          className={`grid min-h-0 flex-1 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${collapsed ? "md:grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
        >
          <div className="min-h-0 overflow-hidden rounded-b-lg bg-white">
            <div className="h-full overflow-y-auto flex flex-col">
              {panelError || layerError ? (
                <div
                  role="alert"
                  className="mx-5 mt-4 p-3 rounded-md bg-[#FBEAE8] text-black text-[12px] leading-snug flex flex-col gap-2"
                >
                  {panelError ? (
                    <div>
                      <b>Panel data not loaded</b> ({panelError}). Expected at:
                      <code className="block break-all mt-1 text-[11px]">{ELNINO_PANEL_URL}</code>
                    </div>
                  ) : null}
                  {layerError ? (
                    <div>
                      <b>Map layer not loaded</b> ({layerError}). Expected at:
                      <code className="block break-all mt-1 text-[11px]">{url}</code>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {panel ? <StatusSection panel={panel} /> : null}

              {/* hazard chips: same style as the Events "view exposure by economy" chips */}
              <div className="px-5 pt-4 flex flex-col gap-3">
                <div className="font-bold text-[10px] text-[#6B7A90] tracking-[1px]">VIEW EXPOSURE TO</div>
                <div className="flex flex-wrap gap-2 text-[14px]">
                  {(Object.keys(elninoHazards) as ElninoHazard[]).map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={hazard === h}
                      onClick={() => setHazard(h)}
                      className={`rounded-xl h-6 whitespace-nowrap px-3 font-bold flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-(--accentdarkblue-100)/40 ${hazard === h ? "bg-(--accentdarkblue-100) text-white" : "bg-(--lightblue) text-(--accentdarkblue-100) hover:brightness-95"}`}
                    >
                      {elninoHazards[h].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* headline: exposed total and share of the world */}
              <div className="mx-5 mt-4 rounded-xl bg-[#F4F7FB] px-3 py-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="font-bold text-[10px] text-[#6B7A90]">{exposureLabel.toUpperCase()} EXPOSED</div>
                  <div className="text-[22px] font-bold text-[#0B1B33] leading-tight mt-1">
                    {summary ? fmt(summary.exposed) : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="font-bold text-[10px] text-[#6B7A90]">SHARE OF WORLD</div>
                  <div className="text-[22px] font-bold text-[#0B1B33] leading-tight mt-1">
                    {summary ? formatShare(summary.share) : "N/A"}
                  </div>
                </div>
              </div>

              {/* countries */}
              <div className="px-5 pt-5 grid grid-cols-[1.3fr_1fr_1fr] text-[12px]">
                <div className="pb-2 border-b border-[#E3E9F1] font-bold text-[10px] text-[#6B7A90]">COUNTRY</div>
                <div className="pb-2 border-b border-[#E3E9F1] font-bold text-[10px] text-[#6B7A90] pl-3">
                  {exposureCfg.column}
                </div>
                <div className="pb-2 border-b border-[#E3E9F1] font-bold text-[10px] text-[#6B7A90] pl-3">
                  {exposureCfg.shareColumn}
                </div>
                {summary?.countries.map((c) => (
                  <CountryRow key={c.iso3} name={c.country} exposed={fmt(c.exposed)} share={c.share} />
                ))}
                {summary && summary.countries.length === 0 ? (
                  <div className="col-span-3 h-11 text-[14px] flex items-center text-[#6B7A90]">
                    No exposure for this selection
                  </div>
                ) : null}
              </div>

              <div className="mt-auto w-full flex items-center px-5 py-5 gap-2">
                <Link
                  to="/datamethodology"
                  className="font-bold text-[13px] text-(--fundblue) underline-offset-4 hover:underline"
                >
                  Explore Methodology →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bivariate legend: same as the Grid view */}
      <div className="absolute bottom-2 left-2 z-2 w-66 rounded-lg border border-[#2A3B5F] bg-[#1B1B1D] p-3.5 text-left text-white shadow-lg">
        <h3 className="text-[12px] font-bold uppercase leading-tight tracking-wide">
          {hazardNoun[hazard]} & {exposureLabel}
        </h3>
        <p className="mt-0.5 text-[11px] text-white">{legendSubtitle}</p>

        <div className="mt-3 grid grid-cols-[auto_auto_auto] justify-start gap-x-2">
          <div className="flex h-28 w-10 shrink-0 items-stretch justify-end gap-1">
            <span className="rotate-180 text-center text-[11px] leading-tight text-[#A97CF2] [writing-mode:vertical-rl]">
              {exposureLabel} ({exposureAxisUnit[exposure]})
            </span>
            <svg width="8" className="h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 8 112">
              <path d="M4 112V2M1 6l3-4 3 4" stroke="#A97CF2" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="flex w-16 shrink-0 flex-col gap-0.5">
            {[2, 1, 0].map((i) => (
              <span
                key={i}
                className="flex h-9 items-center justify-end whitespace-nowrap text-[11px]"
                style={{ color: yTickColors[i] }}
              >
                {exposureClasses[i]}
              </span>
            ))}
          </div>

          <div className="grid w-28 grid-cols-3 grid-rows-[repeat(3,36px)] gap-0.5 self-start">
            {cellOrder.map((field, i) => {
              const active = activeField === field;
              return (
                <div key={field} className={cn("relative size-9", active && "z-10")}>
                  <div
                    className={cn(
                      "size-full cursor-pointer transition-all duration-150 inset-ring-1 inset-ring-white/15",
                      active && "scale-115 shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
                      isolatedField != null && isolatedField !== field && "opacity-30",
                    )}
                    style={{
                      backgroundColor: byField[field],
                      outline: active ? "1.5px solid rgba(255,255,255,0.9)" : "none",
                      outlineOffset: active ? -1.5 : 0,
                    }}
                    onClick={() => isolateField(field)}
                    onMouseEnter={() => setHoveredField(field)}
                    onMouseLeave={() => setHoveredField(null)}
                    onTouchStart={() => setHoveredField(field)}
                  />
                  {active && (
                    <div
                      className={cn(
                        "pointer-events-none absolute -top-2.5 z-20 w-max rounded-md bg-black px-2.5 py-1.5 text-center text-[10px] font-bold leading-snug text-white shadow-lg",
                        i % 3 === 0 ? "right-[40%]" : "left-[40%]",
                      )}
                    >
                      {levels[Math.floor((field - 1) / 3)]} {exposureLabel}
                      <br />
                      {levels[(field - 1) % 3]} {hazardNoun[hazard]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="col-start-3 mt-1.5 grid w-28 grid-cols-3 gap-0.5 text-[11px]">
            {hazardClasses.map((c, i) => (
              <span
                key={c}
                className={cn("whitespace-nowrap", i === 0 ? "text-left" : i === 2 ? "text-right" : "text-center")}
                style={{ color: xTickColors[i] }}
              >
                {c}
              </span>
            ))}
          </div>
          <svg className="col-start-3 mt-1 w-28 overflow-visible" height="8" viewBox="0 0 112 8">
            <path d="M0 4h110M106 1l4 3-4 3" stroke="#4FD1BC" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="col-start-3 mt-1 w-28 text-center text-[11px] text-[#4FD1BC]">
            {hazardCfg.legend} ({hazardCfg.unit})
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-white/10 pt-2 text-[10px] text-[#A1A1A6]">
          <span>{ELNINO_SOURCE}</span>
          <MapDisclaimer />
        </div>
      </div>
      {/* left = 8px inset + 264px legend + 8px gap */}
      <arcgis-scale-bar
        className="calcite-mode-dark z-2 absolute bottom-[22px] left-[280px] max-w-21"
        ref={scaleBarRef}
        bar-style="line"
        unit="metric"
      ></arcgis-scale-bar>
    </div>
  );
}

function StatusSection({ panel }: { panel: ElninoPanel }) {
  const declared = panel.phase === "El Nino" || panel.phase === "La Nina";
  const active = panel.phase !== "Neutral";
  const chipColor = panel.phase.startsWith("La Nina") ? "bg-(--accentblue-100)" : active ? "bg-(--red)" : "bg-[#6B7A90]";
  const scale = Math.max(1, ...panel.recent.map((r) => Math.abs(r.value)));
  const barArea = 70; // px for |value| = scale
  const negRoom = panel.recent.some((r) => r.value < 0) ? 0.25 * barArea : 0;
  const base = 22 + negRoom; // px from the bottom: season labels, then negative bars
  const thr = (panel.threshold / scale) * barArea;

  return (
    <div className="px-5 pt-4 pb-4 border-b border-[#E3E9F1] flex flex-col gap-1.5">
      <div className="font-bold text-[10px] text-[#6B7A90] tracking-[1px]">CURRENT STATUS</div>
      <div className="flex items-baseline gap-2">
        <div className="font-bold text-[30px] leading-tight text-[#0B1B33]">
          {panel.value > 0 ? "+" : ""}
          {panel.value.toFixed(2)} °C
        </div>
        <div className="text-[13px] text-[#6B7A90]">
          {panel.index.toUpperCase()}, {panel.season} {panel.year}
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <span className={`flex h-6 items-center ${chipColor} rounded-full font-bold text-white px-3 text-[11px] tracking-[0.06em]`}>
          {phaseLabel(panel.phase).toUpperCase()}
        </span>
        {active && !declared ? (
          <span className="flex h-6 items-center bg-(--lightblue) text-(--accentdarkblue-100) rounded-full font-bold px-3 text-[11px] tracking-[0.06em]">
            {panel.run_length} OF {panel.min_run} SEASONS
          </span>
        ) : null}
      </div>

      <div
        role="img"
        aria-label={`${panel.index.toUpperCase()} by season: ${panel.recent.map((r) => `${r.season} ${r.value}`).join(", ")}`}
        className="relative mt-3"
        style={{ height: `${base + barArea + 22}px` }}
      >
        <div
          className="absolute left-0 right-0 border-t border-dashed border-[#B6B0AC]"
          style={{ bottom: base + thr }}
        ></div>
        <div className="absolute right-0 text-[10px] text-[#6B7A90]" style={{ bottom: base + thr + 1 }}>
          +{panel.threshold}
        </div>
        <div className="absolute left-0 right-0 h-px bg-(--primaryblack-90)" style={{ bottom: base }}></div>
        <div className="absolute left-0 right-6 top-0 bottom-0 flex">
          {panel.recent.map((r, i) => {
            const h = Math.max(2, (Math.abs(r.value) / scale) * barArea);
            const last = i === panel.recent.length - 1;
            const up = r.value >= 0;
            return (
              <div key={`${r.season}${r.year}`} className="relative flex-1">
                <div
                  className={`absolute left-1/2 -ml-[13px] w-[26px] ${up ? "rounded-t-xs" : "rounded-b-xs"}`}
                  style={{
                    bottom: up ? base : base - h,
                    height: h,
                    background: phaseColor[r.phase] ?? phaseColor.Neutral,
                  }}
                ></div>
                <div
                  className={`absolute left-0 right-0 text-center text-[11px] ${last ? "font-extrabold" : "font-bold text-(--primaryblack-90)"}`}
                  style={{ bottom: up ? base + h + 3 : base + 3 }}
                >
                  {r.value.toFixed(2)}
                </div>
                <div
                  className={`absolute left-0 right-0 bottom-1 text-center text-[11px] ${last ? "font-extrabold" : "text-[#6B7A90]"}`}
                >
                  {r.season}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-[12px] text-[#3D4A5C] leading-snug">
        {declared
          ? `${phaseLabel(panel.phase)} episode: beyond ±${panel.threshold} °C for ${panel.run_length} overlapping seasons.`
          : active
            ? `Beyond ±${panel.threshold} °C for ${panel.run_length} overlapping season${panel.run_length === 1 ? "" : "s"}. NOAA declares an episode after ${panel.min_run}.`
            : "ENSO-neutral: the index is within ±0.5 °C."}
      </div>
    </div>
  );
}

function CountryRow({ name, exposed, share }: { name: string; exposed: string; share: number | null }) {
  const pct = share == null ? 0 : Math.min(100, share * 100);
  return (
    <>
      <div className="h-10 text-[13px] font-medium border-b border-[#E3E9F1] flex items-center text-[#0B1B33]">
        {name}
      </div>
      <div className="h-10 text-[13px] font-bold border-b border-[#E3E9F1] flex items-center pl-3 text-[#0B1B33]">
        {exposed}
      </div>
      <div className="h-10 text-[12px] font-bold border-b border-[#E3E9F1] flex items-center gap-2 pl-3">
        <span className="w-8.5 text-right">{share == null ? "N/A" : `${Math.round(pct)}%`}</span>
        <span className="relative flex-1 h-1 rounded-xl bg-[#E3E9F1] overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 rounded-xl bg-black" style={{ width: `${pct}%` }}></span>
        </span>
      </div>
    </>
  );
}
