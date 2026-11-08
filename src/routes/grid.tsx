import { createFileRoute } from "@tanstack/react-router";
import { AppStateContext, AppActionsContext } from "../app";
import { useState, useRef, useEffect, useContext } from "react";

import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";

import ScaleBar from "@arcgis/core/widgets/ScaleBar.js";

import { buildGridUrl, buildGridLegend } from "@/config/datasets";
import { Thresholds } from "@/components/thresholds";
import { cn } from "@/lib/utils";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";

export const Route = createFileRoute("/grid")({
  component: GridView,
});

function GridView() {
  const state = useContext(AppStateContext);
  const actions = useContext(AppActionsContext);
  actions?.setView("Event tracking");

  const [position, setPosition] = useState({});

  const [isolatedField, setIsolatedField] = useState<number | null>(null);
  const [hoveredField, setHoveredField] = useState<number | null>(null);

  const ref = useRef(null);
  let map = useRef<Map | null>(null);
  const vtlayer = useRef<ImageryTileLayer | null>(null);
  var view = useRef<MapView>(new MapView());

  useEffect(() => {
    if (ref.current) {
      // same unlabelled base + boundaries as the real-time view
      const baseLayer = new VectorTileLayer({
        url: "https://cdn.arcgis.com/sharing/rest/content/items/d7397603e9274052808839b70812be50/resources/styles/root.json",
        title: "base",
      });
      const boundariesLayer = new VectorTileLayer({
        url: "https://cdn.arcgis.com/sharing/rest/content/items/e8ecee3086f34b06b85229d832a1c14a/resources/styles/root.json",
        title: "boundaries",
        opacity: 0.25,
      });

      map.current = new Map({
        layers: [baseLayer, boundariesLayer],
        // basemap: "dark-gray"
      });

      view.current = new MapView({
        container: ref.current,
        map: map.current,
        zoom: 3,
        center: [-40.9465, 0.775],
        constraints: {
          minZoom: 2,
          maxZoom: 10,
        },
        spatialReference: {
          wkid: 3857,
        },
        viewpoint: position,
      });

      view.current.ui.components = [];

      const scaleBar = new ScaleBar({
        view: view.current,
        unit: "metric", // Options: "metric", "non-metric", or "dual"
      });

      view.current.ui.add(scaleBar, {
        position: "bottom-right",
      });

      reactiveUtils.watch(
        () => [view.current.interacting, view.current.viewpoint],
        ([interacting, viewpoint]) => {
          if (interacting) {
          }
          if (viewpoint) {
            setPosition(viewpoint);
          }
        },
      );
    }
    return () => {
      view.current.destroy();
    };
  }, []);



  // new pink
  var colors: Record<string, { field: number, colorValue: string }> = {
    "High Population & High Flood Height": {
      field: 9,
      colorValue: "#FF139C"
    },
    "High Population & Medium Flood Height": {
      field: 8,
      colorValue: "#E643C4"
    },
    "High Population & Low Flood Height": {
      field: 7,
      colorValue: "#A659EE"
    },
    "Medium Population & High Flood Height": {
      field: 6,
      colorValue: "#BC8DA1"
    },
    "Medium Population & Medium Flood ": {
      field: 5,
      colorValue: "#956D9C"
    },
    "Medium Population & Low Flood Height": {
      field: 4,
      colorValue: "#6D4E93"
    },
    "Low Population & High Flood Height": {
      field: 3,
      colorValue: "#00BCA6"
    },
    "Low Population & Medium Flood Height": {
      field: 2,
      colorValue: "#127A71"
    },
    "Low Population & Low Flood Height": {
      field: 1,
      colorValue: "#343D41"
    }
  };

  // new green
  // var colors: Record<string, { field: number, colorValue: string }> = {
  //   "High Population & High Flood Height": {
  //     field: 9,
  //     colorValue: "rgb(153, 252, 133)"
  //   },
  //   "High Population & Medium Flood Height": {
  //     field: 8,
  //     colorValue: "rgb(79, 142, 171)"
  //   },
  //   "High Population & Low Flood Height": {
  //     field: 7,
  //     colorValue: "rgb(50, 109, 241)"
  //   },
  //   "Medium Population & High Flood Height": {
  //     field: 6,
  //     colorValue: "rgb(140, 215, 90)"
  //   },
  //   "Medium Population & Medium Flood ": {
  //     field: 5,
  //     colorValue: "rgb(71, 119, 138)"
  //   },
  //   "Medium Population & Low Flood Height": {
  //     field: 4,
  //     colorValue: "rgb(37, 75, 157)"
  //   },
  //   "Low Population & High Flood Height": {
  //     field: 3,
  //     colorValue: "rgb(122, 165, 50)"
  //   },
  //   "Low Population & Medium Flood Height": {
  //     field: 2,
  //     colorValue: "rgb(70, 110, 50)"
  //   },
  //   "Low Population & Low Flood Height": {
  //     field: 1,
  //     colorValue: "rgb(31, 77, 87)"
  //   }
  // };

  var valuesArray = [
    {
      value: 1,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[8].colorValue,
      },
    },
    {
      value: 2,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[7].colorValue,
      },
    },
    {
      value: 3,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[6].colorValue,
      },
    },
    {
      value: 4,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[5].colorValue,
      },
    },
    {
      value: 5,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[4].colorValue,
      },
    },
    {
      value: 6,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[3].colorValue,
      },
    },
    {
      value: 7,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[2].colorValue,
      },
    },
    {
      value: 8,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[1].colorValue,
      },
    },
    {
      value: 9,
      symbol: {
        type: "simple-fill",
        color: Object.values(colors)[0].colorValue,
      },
    },
  ];

  const legend = state ? buildGridLegend(state) : undefined;

  // legend matrix layout: rows top→bottom = high→low exposure, columns left→right = low→high hazard
  const cellOrder = [7, 8, 9, 4, 5, 6, 1, 2, 3];
  const byField: Record<number, string> = Object.fromEntries(
    Object.values(colors).map((c) => [c.field, c.colorValue]),
  );
  const yTickColors = ["#8E8E93", "#9C8BB5", "#A97CF2"]; // low, mid, high
  const xTickColors = ["#8E8E93", "#5FAE9F", "#4FD1BC"];

  // cell that is popped + labelled: hovered first, otherwise the clicked/isolated one
  const activeField = hoveredField ?? isolatedField;

  // tooltip text for a legend cell, e.g. "High Population" / "Low Flood"
  const levels = ["Low", "Medium", "High"];
  const hazardShort = legend ? legend.hazardAxis.replace(/\s*height$/i, "") : "";
  const tooltipLines = (field: number) =>
    legend
      ? [
          `${levels[Math.floor((field - 1) / 3)]} ${legend.exposureAxis}`,
          `${levels[(field - 1) % 3]} ${hazardShort}`,
        ]
      : ["", ""];

  useEffect(() => {
    if (!map.current) return;
    
    isolateField(isolatedField, "dimension");
  }, [
    state.currentTime,
    state.currentHazard,
    state.currentExposure,
    state.currentScenario,
    state.currentThreshold,
    state.currentMeasure,
  ]);

  useEffect(() => {

    let pointerTracker = view.current.on("pointer-move", async (event) => {
      const response = await view.current.hitTest(event);
      const hasImageryTileLayer = response.results.some(
        (result) => result.layer instanceof ImageryTileLayer,
      );
      if (hasImageryTileLayer) {
        response.results.forEach((e) => {
          if (e.type == 'raster') {
            for (const value of Object.values(colors)) {
              if (e.pixelValue[0] == value.field) {
                if (isolatedField == null || isolatedField == value.field) {
                  setHoveredField(value.field);
                }
              }
            }
          }
        })
      } else {
        setHoveredField(null);
      }
    });

    return () => {
      pointerTracker.remove();
    };
  },[vtlayer.current])

  function isolateField(value: number | null, type: string) {
    if (map.current) {
      if (vtlayer.current) {
        map.current.remove(vtlayer.current);
        vtlayer.current.destroy();
        vtlayer.current = null;
      }
      let isolatedValues = valuesArray;
      if (type == "dimension") {
        if (isolatedField) {
          isolatedValues = valuesArray.filter((v) => v.value == value);
        }
      }

      if (type == "exposure") {
        if (isolatedField !== value) {
          // look up in the full list, not the current renderer (which may already be filtered)
          isolatedValues = valuesArray.filter((v) => v.value == value);
          setIsolatedField(value);
        } else {
          setIsolatedField(null);
        }
      }

      vtlayer.current = new ImageryTileLayer({
        url: state ? buildGridUrl(state) : undefined,
        renderer: new UniqueValueRenderer({
          field: "Value",
          uniqueValueInfos: isolatedValues,
        }),
      });
      map.current.add(vtlayer.current);
    }
  }

  return (
    <div className="h-full">
      <div className="w-full h-full bg-[#1D2224] " ref={ref}></div>
      <Thresholds />
      {legend && (
      <div className="absolute bottom-2 left-2 w-64 rounded-lg border border-[#2A3B5F] bg-[#1B1B1D] p-3.5 text-white shadow-lg">
        <h3 className="text-[12px] font-bold uppercase leading-tight tracking-wide">{legend.title}</h3>
        <p className="mt-0.5 text-[11px] text-[#8E8E93]">{legend.subtitle}</p>

        <div id="newLegend" className="mt-3 grid grid-cols-[auto_auto_auto] justify-start gap-x-2">
          {/* y axis: label + arrow */}
          <div className="flex items-stretch gap-1">
            <span className="rotate-180 text-center text-[11px] text-[#A97CF2] [writing-mode:vertical-rl]">{legend.exposureAxis}</span>
            <svg width="8" className="h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 8 112">
              <path d="M4 112V2M1 6l3-4 3 4" stroke="#A97CF2" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          {/* y ticks (high → low) */}
          <div className="flex flex-col gap-0.5">
            {[2, 1, 0].map((i) => (
              <span key={i} className="flex h-9 items-center justify-end whitespace-nowrap text-[11px]" style={{ color: yTickColors[i] }}>
                {legend.exposureClasses[i]}
              </span>
            ))}
          </div>

          {/* matrix */}
          <div className="grid w-28 grid-cols-3 gap-0.5">
            {cellOrder.map((field, i) => {
              const active = activeField === field;
              const [line1, line2] = tooltipLines(field);
              return (
                <div key={field} className={cn("relative size-9", active && "z-10")}>
                  <div
                    className={cn(
                      "size-full cursor-pointer transition-all duration-150",
                      active && "scale-115 shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
                      isolatedField != null && isolatedField !== field && "opacity-30",
                    )}
                    style={{
                      backgroundColor: byField[field],
                      outline: active ? "1.5px solid rgba(255,255,255,0.9)" : "none",
                      outlineOffset: active ? -1.5 : 0, // draw inside the square
                    }}
                    onClick={() => isolateField(field, "exposure")}
                    onMouseEnter={() => setHoveredField(field)}
                    onMouseLeave={() => setHoveredField(null)}
                    onTouchStart={() => setHoveredField(field)}
                  />
                  {active && (
                    <div
                      className={cn(
                        "pointer-events-none absolute -top-2.5 z-20 w-max rounded-md bg-black px-2.5 py-1.5 text-center text-[10px] font-bold leading-snug text-white shadow-lg",
                        i % 3 === 0 ? "right-[40%]" : "left-[40%]", // left column opens leftwards
                      )}
                    >
                      {line1}<br />{line2}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* x ticks, arrow, label (under the matrix only) */}
          <div className="col-start-3 mt-1.5 grid w-28 grid-cols-3 gap-0.5 text-center text-[11px]">
            {legend.hazardClasses.map((c, i) => (
              <span key={c} className="whitespace-nowrap" style={{ color: xTickColors[i] }}>{c}</span>
            ))}
          </div>
          <svg className="col-start-3 mt-1 w-28 overflow-visible" height="8" viewBox="0 0 112 8">
            <path d="M0 4h110M106 1l4 3-4 3" stroke="#4FD1BC" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="col-start-3 mt-1 w-28 text-center text-[11px] text-[#4FD1BC]">{legend.hazardAxis}</span>
        </div>

        <p className="mt-3 text-[10px] leading-snug text-[#A1A1A6]">
          {legend.note} {legend.source}
        </p>
      </div>
      )}
    </div>
  );
}
