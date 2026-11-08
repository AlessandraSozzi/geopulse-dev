import { useState, useRef, useEffect, useContext } from "react";

import { AppStateContext } from "../app";

import { ComboBox } from "./comboBox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MapsChart } from "@highcharts/react/Maps";
import {
  Chart,
  Title,
  Subtitle,
  YAxis,
  XAxis,
  Legend,
  Credits,
  Highcharts,
} from "@highcharts/react";

import { Exporting } from "@highcharts/react/options/Exporting";

import { countryByIso3 } from "@/config/isoCountries";
import {
  urlObject,
  scenarioMapper,
  scenarioLabel,
  comparisonTitles,
  comparisonMapContext,
  timePeriodLabels,
} from "@/config/datasets";

export const Region = ({
  defaultIso3,
  topojson,
  regionId,
  sharedYMax,
  onDataMax,
}: any) => {
  const state = useContext(AppStateContext);

  type Feature = Record<string, any>;

  type ChartData = {
    adm1Data: Record<string, Feature[]>;
    adm0ChartData: Feature[];
    mapLegendValueRange: Record<string, MeasureRange>;
  };

  const [iso3, setIso3] = useState(defaultIso3);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [mapChartData, setMapChartData] = useState<Feature[]>([]);
  const [lineChartData, setLineChartData] = useState<Record<string, number[]>>(
    {},
  );
  const [polygons, setPolygons] = useState({
    features: [{}],
    iso3: iso3,
    name: "",
    type: "FeatureCollection",
  });

  const [currentSubnational, setSubnational] = useState<Record<any, any>>({
    refAreaName: null,
    refArea: null,
    iso3: null,
  });

  // set global highcharts chart styling options
  Highcharts.setOptions({
    chart: {
      backgroundColor: "transparent",
      plotBackgroundColor: "transparent",
      style: {
        color: "#ffffff",
        fontFamily: "Arial",
      },
    },
    lang: {
      contextButtonTitle: "Export",
    },
    exporting: {
      buttons: {
        contextButton: {
          symbol: "download",
          symbolSize: 24,
          // Center the symbol inside a box that wraps it, so the whole icon is the hit area.
          symbolX: 14,
          symbolY: 14,
          width: 28,
          height: 28,
          y: 35,
          theme: {
            fill: "transparent",
            stroke: "none",
            cursor: "pointer",
            states: {
              hover: {
                fill: "transparent",
                stroke: "none",
              },
              select: {
                fill: "transparent",
                stroke: "none",
              },
            },
          } as any,
          symbolStroke: "none",
          symbolFill: "#a3a3a3",
        },
      },
    },
  });

  Highcharts.SVGRenderer.prototype.symbols.download = function (
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    // Provided download-data icon, transformed from its 13x14 viewBox onto (x, y, w, h).
    // V/H commands are pre-expanded to L; even coord index = x, odd = y within each segment.
    // Fit with padding and preserved aspect ratio so edges aren't clipped or stretched.
    const pad = 0.1;
    const scale = Math.min((w * (1 - pad)) / 13, (h * (1 - pad)) / 14);
    const offX = x + (w - 13 * scale) / 2;
    const offY = y + (h - 14 * scale) / 2;
    const sx = (v: number) => offX + v * scale;
    const sy = (v: number) => offY + v * scale;
    const segments: (string | number)[][] = [
      ["M", 7, 0.875],
      ["L", 7, 6.64453],
      ["L", 8.12109, 5.49609],
      ["C", 8.47656, 5.16797, 9.02344, 5.16797, 9.37891, 5.49609],
      ["C", 9.70703, 5.85156, 9.70703, 6.39844, 9.37891, 6.75391],
      ["L", 6.75391, 9.37891],
      ["C", 6.39844, 9.70703, 5.85156, 9.70703, 5.49609, 9.37891],
      ["L", 2.87109, 6.75391],
      ["C", 2.54297, 6.39844, 2.54297, 5.85156, 2.87109, 5.49609],
      ["C", 3.22656, 5.16797, 3.77344, 5.16797, 4.12891, 5.49609],
      ["L", 5.25, 6.64453],
      ["L", 5.25, 0.875],
      ["C", 5.25, 0.382812, 5.63281, 0, 6.125, 0],
      ["C", 6.61719, 0, 7, 0.382812, 7, 0.875],
      ["Z"],
      ["M", 1.75, 8.75],
      ["L", 3.03516, 8.75],
      ["L", 4.56641, 10.3086],
      ["C", 5.44141, 11.1562, 6.80859, 11.1562, 7.68359, 10.3086],
      ["L", 9.21484, 8.75],
      ["L", 10.5, 8.75],
      ["C", 11.457, 8.75, 12.25, 9.54297, 12.25, 10.5],
      ["L", 12.25, 11.375],
      ["C", 12.25, 12.332, 11.457, 13.125, 10.5, 13.125],
      ["L", 1.75, 13.125],
      ["C", 0.792969, 13.125, 0, 12.332, 0, 11.375],
      ["L", 0, 10.5],
      ["C", 0, 9.54297, 0.792969, 8.75, 1.75, 8.75],
      ["Z"],
      ["M", 10.0625, 10.2812],
      ["C", 9.70703, 10.2812, 9.40625, 10.582, 9.40625, 10.9375],
      ["C", 9.40625, 11.293, 9.70703, 11.5938, 10.0625, 11.5938],
      ["C", 10.418, 11.5938, 10.7188, 11.293, 10.7188, 10.9375],
      ["C", 10.7188, 10.582, 10.418, 10.2812, 10.0625, 10.2812],
      ["Z"],
    ];
    const path: (string | number)[] = [];
    segments.forEach((seg) => {
      path.push(seg[0]);
      for (let i = 1; i < seg.length; i++) {
        path.push(i % 2 === 1 ? sx(seg[i] as number) : sy(seg[i] as number));
      }
    });
    return path as any;
  };

  const lineChartStyleMapper: Record<string, Record<string, string>> = {
    rcp4p5: { color: "#407EC9", symbol: "circle" },
    rcp8p5: { color: "#FF8200", symbol: "triangle" },
    SSP126: { color: "#407EC9", symbol: "circle" },
    SSP245: { color: "#FF8200", symbol: "triangle" },
    SSP370: { color: "#DA291C", symbol: "diamond" },
  };

  // fetch new data when country, hazard or exposure changes
  useEffect(() => {
    var loadCountryData = async (iso3: string) => {
      // reset subnational value when the iso3 property is not null and does not match the iso3 property of the new country
      if (currentSubnational.iso3 && currentSubnational.iso3 !== iso3) {
        setSubnational({ refAreaName: null, refArea: null, iso3: null });
      }

      // retrieve polygons from topojson object
      const countryPolygons = {
        ...topojson,
        objects: {
          GADM_ADMIN1: {
            ...topojson.objects.GADM_ADMIN1,
            geometries: topojson.objects.GADM_ADMIN1.geometries.filter(
              (g: any) => g.properties.GID_0 === iso3,
            ),
          },
        },
      };

      console.log("LOOK");
      console.log(countryPolygons);

      // store polygon data for selected country
      setPolygons(countryPolygons);

      // run query based on iso3
      const queryResults = await query(iso3);

      // first data organization based on filters
      const arrangedData = arrangeData(queryResults);

      // assign data to chartData state
      setChartData(arrangedData);

      // second data organization for filters, used in map and line chart
      setMapChartData(mapChartDataPrep(arrangedData.adm1Data));
      setLineChartData(
        lineChartDataPrep(
          arrangedData.adm1Data[currentSubnational.refArea] ??
            arrangedData.adm0ChartData,
        ),
      );

      // reset subnational value when the currentSubnational refArea property does not exist in the arrangedData.adm1Data object
      if (!arrangedData.adm1Data[currentSubnational.refArea]) {
        setSubnational({ refAreaName: null, refArea: null, iso3: null });
      }

      // check and see if the currentScenario exists on the chosen table based on urlObject, NEEDS FIXING
      // if (
      //     !Object.values(urlObject[state?.currentHazard][state?.currentExposure].scenarios)
      //         .map((k) => scenarioMapper[k])
      //         .includes(scenarioMapper[state?.currentScenario])) {
      //     state?.setScenario(urlObject[state?.currentHazard][state?.currentExposure].scenarios[0]);
      // }
    };
    loadCountryData(iso3);
  }, [iso3, state?.currentHazard, state?.currentExposure, topojson]);

  // re-process already-fetched data
  useEffect(() => {
    if (chartData == null) return; // guard
    setMapChartData(mapChartDataPrep(chartData.adm1Data));
    setLineChartData(
      lineChartDataPrep(
        chartData.adm1Data[currentSubnational.refArea] ??
          chartData.adm0ChartData,
      ),
    );
  }, [state?.currentMeasure, state?.currentThreshold]);

  useEffect(() => {
    if (chartData == null) return; // guard
    setMapChartData(mapChartDataPrep(chartData.adm1Data));
  }, [state?.currentTime, state?.currentScenario]);

  async function query(iso3: string) {
    const whereClause = `ISO3 IN ('${iso3}')`;
    const queryString = `where=${encodeURIComponent(whereClause)}`;
    const url =
      urlObject[state?.currentHazard][state?.currentExposure].url +
      `?${queryString}`;

    const idResult = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        returnIdsOnly: "true",
        cacheHint: "true",
        f: "json",
      }),
    });

    const { objectIds } = await idResult.json();
    const maxRecordsPerQuery = 5000;
    const tableData: Feature[] = [];

    // fetch all pages sequentially and await each one

    for (let start = 0; start < objectIds.length; start += maxRecordsPerQuery) {
      // track how many requests have been made per loop
      let attempts = 0;

      const end = Math.min(start + maxRecordsPerQuery, objectIds.length);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          objectIds: objectIds.slice(start, end).join(","),
          outFields: "*",
          f: "json",
          maxRecordCountFactor: "5",
        }),
      });

      const page = await res.json();
      if (page.error) {
        if (attempts <= 10) {
          // reduce interval by last incrememt of for loop if error occurs server-side
          // start = start - maxRecordsPerQuery; // retry disabled: attempts resets each loop, so this retried endlessly with no delay
          console.log(
            "Unable to perform query. Sending request again.",
            page.error,
          );
          attempts++;
        } else {
          alert(
            "Unable to perform query. Too many requests. Please try again later.",
          );
          break;
        }
      } else {
        tableData.push(
          ...page.features.map((f: { attributes: Feature }) => f.attributes),
        );
      }
    }

    console.log("logging tableData: ", tableData);
    return tableData;
  }

  var lineChartXLabels: string[] = timePeriodLabels;

  type MeasureRange = {
    maxValue: number;
    minValue: number;
  };

  function lineChartDataPrep(data: Record<string, any>[]) {
    const thresholdKey =
      urlObject[state?.currentHazard][state?.currentExposure].threshold?.type;
    const filteredData = data
      .filter((entry) => entry["MEASURE"] === state?.currentMeasure.id)
      .filter((entry) =>
        thresholdKey
          ? entry[thresholdKey] == state?.currentThreshold.threshold
          : true,
      );

    const dataPointZero = filteredData.filter(
      (entry) =>
        entry["CLIMATE_SCENARIO"] === "historical" ||
        entry["CLIMATE_SCENARIO"] === "H",
    );

    return urlObject[state?.currentHazard][
      state?.currentExposure
    ].scenarios.reduce((acc: Record<string, number[]>, scenario: string) => {
      const scenarioData = filteredData.filter(
        (entry) => entry["CLIMATE_SCENARIO"] === scenario,
      );
      acc[scenario] = dataPointZero
        .concat(scenarioData.sort((a, b) => a.TIME_PERIOD - b.TIME_PERIOD))
        .map(
          (x) =>
            x[urlObject[state?.currentHazard][state?.currentExposure].value],
        );
      console.log("logging line chart acc: ", acc);
      return acc;
    }, {});
  }

  function mapChartDataPrep(data: Record<string, Feature[]>) {
    console.log("logging data input: ", data);
    const mapData = Object.keys(data).flatMap((refArea: string) => {
      const thresholdKey =
        urlObject[state?.currentHazard][state?.currentExposure].threshold?.type;
      console.log("thresholdKey: ", thresholdKey);
      return data[refArea]
        .filter((entry: Feature) => entry["TIME_PERIOD"] === state?.currentTime)
        .filter(
          (entry: Feature) => entry["MEASURE"] === state?.currentMeasure.id,
        )
        .filter((entry: Feature) =>
          thresholdKey
            ? entry[thresholdKey] == state?.currentThreshold.threshold
            : true,
        )
        .filter((entry: Feature) =>
          state?.currentTime !== 1980
            ? scenarioMapper[entry["CLIMATE_SCENARIO"]] ===
              scenarioMapper[state?.currentScenario]
            : true,
        )
        .map((entry: Feature) => ({
          GID_1: entry["REF_AREA"],
          NAME_1: entry["REF_AREA_NAME"],
          value:
            entry[
              urlObject[state?.currentHazard][state?.currentExposure].value
            ],
        }));
    });
    console.log("logging mapData: ", mapData);
    return mapData;
  }

  const arrangeData = (data: Feature[]) => {
    console.log("arrange data input!: ", data);
    console.log(
      "Arrange data adm0 input: ",
      data.filter((entry: Feature) => entry["ADMIN_FILTER"] === "adm0"),
    );
    // legend values for map
    var mapLegendValueRange: Record<string, MeasureRange> = data
      .filter((entry: Feature) => entry["ADMIN_FILTER"] === "adm1")
      .reduce((acc: Record<string, MeasureRange>, entry: Feature) => {
        const measure = entry["MEASURE"] as string;
        const obsValue = Number(
          entry[urlObject[state?.currentHazard][state?.currentExposure].value],
        );

        if (!acc[measure]) {
          acc[measure] = {
            maxValue: obsValue,
            minValue: measure === "SPEI_CROP_EXP" ? obsValue : 0,
          };
        } else {
          switch (measure) {
            case "SPEI_CROP_EXP":
              acc[measure].maxValue = 2.5;
              acc[measure].minValue = -2.5;
              break;
            case "ID_PW_EXP":
            case "TN_PW_EXP":
            case "HD_PW_EXP":
            case "HD_LW_EXP":
            case "CDD_CROP_EXP":
              acc[measure].maxValue = 365;
              acc[measure].minValue = 0;
              break;
            case "RF_PW_EXP":
            case "CF_PW_EXP":
            case "RF_BLD_EXP":
            case "CF_BLD_EXP":
            case "RF_GDP_EXP":
            case "CF_GDP_EXP":
            case "RF_UGDP_EXP":
            case "CF_UGDP_EXP":
              acc[measure].maxValue = 100;
              acc[measure].minValue = 0;
              break;
            default:
              acc[measure].maxValue = Math.max(acc[measure].maxValue, obsValue);
              acc[measure].minValue = Math.min(acc[measure].minValue, obsValue);
          }
        }

        return acc;
      }, {});
    console.log(
      "ADM1 Min and Max by Measure across all Thresholds: ",
      mapLegendValueRange,
    );

    // country data for line chart
    const adm0ChartData: Feature[] = data.filter(
      (entry: Feature) => entry["ADMIN_FILTER"] === "adm0",
    );
    console.log("adm0ChartData ", adm0ChartData);

    // region selected data && adm1 data for polygons
    const adm1Data = data
      .filter((entry: Feature) => entry["ADMIN_FILTER"] === "adm1")
      .reduce((acc: Record<string, Feature[]>, entry: Feature) => {
        const key = entry["REF_AREA"] as string;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(entry);
        return acc;
      }, {});
    console.log("adm1Data ", adm1Data);

    return { adm1Data, adm0ChartData, mapLegendValueRange };
  };

  // Report this panel's current data max (across the visible scenario series) up to the parent,
  // so both panels can share a single dynamic y-scale.
  useEffect(() => {
    if (!onDataMax) return;
    const scenarios =
      urlObject[state?.currentHazard]?.[state?.currentExposure]?.scenarios ??
      [];
    const values = scenarios
      .flatMap((s: string) => lineChartData[s] ?? [])
      .filter((v: any) => typeof v === "number" && isFinite(v));
    onDataMax(regionId, values.length ? Math.max(...values) : 0);
  }, [lineChartData]);

  // High-contrast contour for the selected subnational unit, applied via Highcharts' native
  // point state (same mechanism as hover) so the outline renders complete and on top.
  const SUBNATIONAL_HIGHLIGHT = "#22D3EE";

  // SPEI keeps its fixed diverging scale; every other measure uses the shared, dynamic max
  // (floor 0, upper bound = joint max across both panels).
  const isSPEI = state?.currentMeasure.id === "SPEI_CROP_EXP";
  const yMin = isSPEI ? -2.5 : 0;
  const yMax = isSPEI
    ? 2.5
    : sharedYMax && sharedYMax > 0
      ? sharedYMax
      : undefined;
  const yTick = isSPEI ? 0.5 : undefined;

  return (
    <Card className="bg-[#1E1E1E] w-full dark flex items-center justify-center shadow-md">
      <ComboBox iso3={iso3} setIso3={setIso3} regionId={regionId}/>
      {chartData && mapChartData ? (
        <div className="w-full h-full">
          <div className="flex flex-col w-full justify-center items-center">
            <div className="w-8/10">
              <MapsChart
                options={{
                  chart: {
                    map: polygons,
                    backgroundColor: "RGBA(0,0,0,0)",
                    animation: false,
                    events: {
                      // Re-raise the selected region above its neighbours after every redraw
                      // so its full contour renders (React re-renders reset the z-order).
                      redraw: function (this: any) {
                        const pt = this.series?.[0]?.points?.find(
                          (p: any) => p.GID_1 === currentSubnational.refArea,
                        );
                        if (pt?.graphic) pt.graphic.toFront();
                      },
                    },
                    height: 550,
                    spacingTop: 20,
                  },
                  title: {
                    text:
                      (currentSubnational.refAreaName
                        ? currentSubnational.refAreaName + ", "
                        : "") +
                      comparisonTitles(
                        state?.currentHazard,
                        state?.currentExposure,
                        state?.currentMeasure.id,
                        state?.currentThreshold.threshold,
                        iso3,
                      ).chart +
                      " by Region",
                    align: "left",
                    x: 18,
                    style: {
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "16px",
                    },
                  },
                  subtitle: {
                    text: comparisonMapContext(
                      state?.currentHazard,
                      state?.currentExposure,
                      state?.currentMeasure.id,
                      state?.currentThreshold.threshold,
                      state?.currentScenario,
                      state?.currentTime,
                      iso3,
                    ),
                    align: "left",
                    x: 16,
                    style: {
                      color: "#999999",
                      fontSize: "13px",
                    },
                  },
                  caption: {
                    text: `${urlObject[state?.currentHazard][state?.currentExposure].source}`,
                    align: "left",
                    style: {
                      color: "#999999",
                    },
                  },
                  mapView: {
                    projection: {
                      name: "WebMercator",
                      rotation: [-50, 0],
                    },
                    padding: 15,
                  },
                  series: [
                    {
                      type: "map",
                      data: mapChartData,
                      joinBy: ["GID_1", "GID_1"],
                      keys: ["NAME_1", "value"],
                      nullColor: "#c9c9c9",
                    },
                  ],
                  colorAxis: {
                    min: chartData.mapLegendValueRange[state?.currentMeasure.id]
                      ?.minValue,
                    max: chartData.mapLegendValueRange[state?.currentMeasure.id]
                      ?.maxValue,
                    endOnTick: false,

                    labels: {
                      style: {
                        color: "#999999",
                        fontWeight: "bold",
                        textOverflow: "none",
                      },
                    },
                    ...(state?.currentMeasure.id == "SPEI_CROP_EXP"
                      ? {
                          stops: [
                            [0.0, "#791F1F"], // Extremely dry
                            [0.2, "#BA7517"], // Severely dry
                            [0.3, "#FAC775"], // Moderately dry
                            [0.5, "#FFFFFF"], // Near normal
                            [0.7, "#85B7EB"], // Moderately wet
                            [0.8, "#378ADD"], // Very wet
                            [1.0, "#0C447C"], // Extremely wet
                          ],
                          tickPositions: [
                            -2.5, -2, -1.5, -1, 0, 1, 1.5, 2, 2.5,
                          ],
                        }
                      : {
                          stops: undefined,
                          tickPositions: undefined,
                          minColor: "#fcdba9",
                          maxColor: "#E35205",
                        }),

                    width: "100%",
                  },

                  legend: {
                    title: {
                      text: comparisonTitles(
                        state?.currentHazard,
                        state?.currentExposure,
                        state?.currentMeasure.id,
                        state?.currentThreshold.threshold,
                        iso3,
                      ).colorAxis,
                      style: {
                        color: "white",
                        fontWeight: "bold",
                      },
                    },
                  },
                  tooltip: {
                    formatter: function (this: any) {
                      var value = this.point.value;
                      if (state?.currentMeasure.id !== "SPEI_CROP_EXP") {
                        value = Math.ceil(value).toString();
                      }
                      var counter = 0;

                      for (var i = value.length - 1; i > 0; i--) {
                        counter++;
                        if (counter % 3 === 0) {
                          value =
                            value.slice(0, i) +
                            "," +
                            value.substring(i, value.length);
                        }
                      }

                      let append;

                      switch (state?.currentHazard) {
                        case "Riverine Flooding":
                          append = `% of ${state?.currentExposure}`;
                          break;
                        case "Coastal Flooding":
                          append = `% of ${state?.currentExposure}`;
                          break;
                        case "Drought":
                          append = " Consecutive Dry Days";
                          break;
                        case "Temperature Extremes":
                          append = " Days";
                          break;
                      }

                      return `<b>${this.point.NAME_1}</b><br/>${value + append}`;
                    },
                    backgroundColor: "#212121",
                    style: {
                      color: "white",
                    },
                  },
                  credits: {
                    enabled: false,
                  },
                  plotOptions: {
                    series: {
                      point: {
                        events: {
                          click: function (this: any) {
                            if (
                              this.point.NAME_1 ==
                              currentSubnational.refAreaName
                            ) {
                              setLineChartData(
                                lineChartDataPrep(chartData.adm0ChartData),
                              );
                              setSubnational({
                                refAreaName: null,
                                refArea: null,
                                iso3: null,
                              });
                            } else {
                              setSubnational({
                                refAreaName: this.point.NAME_1,
                                refArea: this.GID_1,
                                iso3: iso3,
                              });
                              setLineChartData(
                                lineChartDataPrep(
                                  chartData.adm1Data[this.GID_1],
                                ),
                              );
                            }
                          },
                        },
                      },
                      allowPointSelect: true,
                      states: {
                        select: {
                          color: null,
                          borderColor: SUBNATIONAL_HIGHLIGHT,
                          borderWidth: 2,
                        } as any,
                      },
                      events: {},
                    },
                  },
                }}
              >
                <Exporting />
              </MapsChart>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full pt-10">
            <div className="w-8/10">
              <Chart
                options={{
                  chart: {
                    type: "line",
                    height: 550,
                    marginTop: 130,
                    events: {},
                  },
                  caption: {
                    text: `${urlObject[state?.currentHazard][state?.currentExposure].source}`,
                    align: "left",
                    style: {
                      color: "#999999",
                    },
                  },
                  legend: {
                    itemStyle: {
                      color: "#ffffff",
                      fontWeight: "700",
                    },
                    itemHoverStyle: {
                      fontWeight: "900",
                      color: "#ffffff",
                    },
                    align: "left",
                    verticalAlign: "top",
                    x: 90,
                    y: 75,
                    floating: true,
                    layout: "vertical",
                    symbolWidth: 1,
                    symbolPadding: 15,
                    itemMarginBottom: 3,
                  },
                  title: {
                    text:
                      (currentSubnational.refAreaName
                        ? currentSubnational.refAreaName + ", "
                        : "") +
                      comparisonTitles(
                        state?.currentHazard,
                        state?.currentExposure,
                        state?.currentMeasure.id,
                        state?.currentThreshold.threshold,
                        iso3,
                      ).chart,
                    align: "left",
                    style: {
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "16px",
                    },
                    useHTML: true,
                    x: 18,
                    y: 15,
                    minScale: 1,
                  },
                  subtitle: {
                    text: comparisonTitles(
                      state?.currentHazard,
                      state?.currentExposure,
                      state?.currentMeasure.id,
                      state?.currentThreshold.threshold,
                      iso3,
                    ).subtitle,
                    x: 16,
                    style: {
                      color: "#999999",
                      fontSize: "13px",
                    },
                  },
                  tooltip: {
                    backgroundColor: "#212121",
                    style: {
                      color: "white",
                    },
                    valueDecimals: 0,
                    formatter: function (this: any) {
                      var value = Math.ceil(this.y).toString();
                      var counter = 0;

                      for (var i = value.length - 1; i > 0; i--) {
                        counter++;
                        if (counter % 3 === 0) {
                          value =
                            value.slice(0, i) +
                            "," +
                            value.substring(i, value.length);
                        }
                      }
                      return (
                        "<div>" +
                        this.category +
                        "</div><br></br>" +
                        this.series.name +
                        ": " +
                        value
                      );
                    },
                  },
                  series: urlObject[state?.currentHazard][
                    state?.currentExposure
                  ].scenarios.map((scenario: string) => ({
                    type: "line",
                    name: scenarioLabel(scenario),
                    data: lineChartData[scenario],
                    color: lineChartStyleMapper[scenario].color,
                    marker: {
                      radius: 6,
                      lineWidth: 2,
                      symbol: lineChartStyleMapper[scenario].symbol,
                    },
                  })),
                }}
              >
                <Credits enabled={false} />
                <XAxis
                  categories={lineChartXLabels}
                  tickmarkPlacement={"on"}
                  lineWidth={1}
                  lineColor={"#555555"}
                  startOnTick={false}
                  labels={{
                    style: {
                      color: "#ffffff",
                      fontSize: "14px",
                    } as Highcharts.CSSObject,
                  }}
                />
                <YAxis
                  title={{ text: "" }}
                  lineWidth={1}
                  gridLineWidth={0}
                  tickWidth={1}
                  tickPosition={"inside"}
                  tickLength={5}
                  lineColor={"#555555"}
                  tickColor={"#555555"}
                  labels={{
                    reserveSpace: true,
                    style: {
                      color: "#ffffff",
                      fontSize: "14px",
                    } as Highcharts.CSSObject,
                    formatter: function (this: any) {
                      if (this.value >= 1000000) {
                        return this.value / 1000000 + "M";
                      } else if (this.value < 1000000 && this.value >= 1000) {
                        return this.value / 1000 + "k";
                      } else {
                        return this.value;
                      }
                    },
                  }}
                  min={yMin}
                  max={yMax}
                  endOnTick={!isSPEI}
                  allowDecimals={true}
                  tickInterval={yTick}
                />
                <Exporting />
              </Chart>
            </div>
          </div>
        </div>
      ) : (
        <Button disabled size="sm">
          <Spinner data-icon="inline-start" />
          Loading...
        </Button>
      )}
    </Card>
  );
};
