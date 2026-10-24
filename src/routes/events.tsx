// creates file-based routing for tanstack react router
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

// react hooks holding state, context, and references
import { AppStateContext, AppActionsContext } from "../app";
import { useState, useRef, useEffect, useCallback, useContext } from "react";

// this function constructs className strings conditionally and merges tailwindcss classes in javascript
import { cn } from "@/lib/utils";

// shad cn component imports
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// imf icons
import Exposures from "../assets/Layers.svg";

// 3rd party icons
import { Check } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause } from "@fortawesome/free-solid-svg-icons";

// arcgis geographic data layers
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import GroupLayer from "@arcgis/core/layers/GroupLayer.js";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";

// arcgis map components
import "@arcgis/map-components/components/arcgis-scale-bar";
import type {} from "@arcgis/map-components/types/react";

// arcgis core utilities
import Map from "@arcgis/core/Map.js";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer.js";
import MapView from "@arcgis/core/views/MapView.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

// dataset object configurations
import { realtimeObject, eventTypes } from "@/config/datasets";
import { countryByIso3 } from "@/config/isoCountries";

//import loading overlay component
import LoadingOverlay from "@/components/loadingOverlay";

import { format } from "date-fns";

// provide search schema for query string parameters
const searchSchema = z.object({
  eventid: z.coerce
    .number()
    .catch(0)
    .transform((val) => (val === 0 ? undefined : val)),
});

export const Route = createFileRoute("/events")({
  component: Events,
  validateSearch: searchSchema,
});

function Events() {
  // reads context from provider for app-level state functions
  const state = useContext(AppStateContext);
  const actions = useContext(AppActionsContext);

  actions?.setView("Event tracking");

  // store the value from the query string parameter
  const eventid = Route.useSearch().eventid;

  // state hook that enables/disables exposure sub-category animations
  const [popInState, setPopInState] = useState<string>("initial");

  const [realtimeExposure, setRealtimeExposure] = useState<{
    exposure: string;
    filter: string;
  }>({ exposure: "Population", filter: "Population" });
  const [events, setEvents] = useState<any>(null);
  const [focusedEvent, setFocusedEvent] = useState<any>("");
  const [eventsList, setEventsList] = useState<boolean>(false);
  const [eventPopup, setEventPopup] = useState<string>("all events");
  const [focusedFeatures, setFocusedFeatures] = useState<any>(null);
  const [focusedSliderValue, setFocusedSliderValue] = useState<number[]>([0]);
  const [focusedSliderPlaying, setFocusedSliderPlaying] =
    useState<boolean>(false);
  const [focusedCountryExposures, setFocusedCountryExposures] =
    useState<any>(null);

  const [currentCountryExposure, setCurrentCountryExposure] =
    useState<any>(null);

  const [otherCountryDropdownStatus, setOtherCountryDropdownStatus] =
    useState<any>(false);

  const [eventLoaded, setEventLoaded] = useState<boolean>(false);
  const [polygonsLoaded, setPolygonsLoaded] = useState<boolean>(false);

  const ref = useRef(null);
  const scaleBarRef = useRef<any>(null);
  const eventRef = useRef<HTMLDivElement | null>(null);
  const pulseContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mobileExposures, setMobileExposures] = useState<boolean>(false);

  let map = useRef<Map | null>(null);
  const view = useRef<MapView>(new MapView());

  const baseLayer = useRef<VectorTileLayer | null>(null);
  const boundariesLayer = useRef<VectorTileLayer | null>(null);
  const exposureLayer = useRef<any>(null);
  const eventFeatureLayer = useRef<FeatureLayer | null>(null);

  const [layerSettingsPopup, setLayerSettingsPopup] = useState<boolean>(false);

  const exposureLayerForGroup = useRef<any>(null);
  const unweightedEventLayer = useRef<GraphicsLayer>(null);
  const weightedEventLayer = useRef<GraphicsLayer>(null);
  const groupLayer = useRef<GroupLayer>(null);

  useEffect(() => {
    // Register click events on the mapView. If the eventid of the symbol graphic
    // matches an eventid in the events array, load the event polygon and exposure values
    view.current.on("click", async (event) => {
      const response = await view.current.hitTest(event);
      response.results.forEach((a: any) => {
        events.forEach((i: any) => {
          if (i.attributes.eventid == a.graphic.attributes.eventid) {
            focusOnEvent(
              {
                longitude: i.geometry.longitude,
                latitude: i.geometry.latitude,
              },
              i.attributes,
            );
          }
        });
      });
      // close symbol popup
      view.current.closePopup();
    });

    // Register pointer movement on the mapView. Check if the mouse cursor overlaps a
    // symbol graphic and the symbol graphic contains an object with a FeatureLayer
    // layer. If true, check if the eventid of the symbol graphic matches an eventid
    // in the events array and set mouse cursor to pointer style. Otherwise, close
    // any open popup and set mouse cursor to default style.
    view.current.on("pointer-move", async (event) => {
      const response = await view.current.hitTest(event);
      const hasFeatureLayer = response.results.some(
        (result) => result.layer instanceof FeatureLayer,
      );
      if (hasFeatureLayer) {
        document.body.style.cursor = "pointer";
        response.results.forEach((a: any) => {
          if (a.graphic) {
            events.forEach((i: any) => {
              if (i.attributes.eventid == a.graphic.attributes.eventid) {
                view.current.openPopup({
                  location: i.geometry,
                  title: i.attributes.description,
                });
                return;
              }
            });
          }
        });
      } else {
        document.body.style.cursor = "default";
        view.current.closePopup();
      }
    });
  }, [events]);

  useEffect(() => {
    // When the query string parameter matches an eventid, load the event only once when page loads
    if (events && !eventsList) {
      if (eventid !== 0 && eventid !== undefined) {
        events.forEach((e: any) => {
          if (e.attributes.eventid == eventid) {
            focusOnEvent(
              {
                longitude: e.geometry.longitude,
                latitude: e.geometry.latitude,
              },
              e.attributes,
            );
          }
        });
      } else {
        actions?.setLoadingOverlay(false);
      }
      setEventsList(true);
    }
  }, [events]);

  // Every time the eventPopup changes, return the results of the query of the events feature
  // layer, sorted by end date, then set the events on the events sidebar and the mapView.
  const queryEvents = useCallback(() => {
    if (
      !eventFeatureLayer.current ||
      !view.current ||
      !pulseContainerRef.current
    )
      return;

    const query = eventFeatureLayer.current!.createQuery();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.outSpatialReference = view.current.spatialReference;
    query.maxRecordCountFactor = 5;

    function runQuery() {
      eventFeatureLayer
        .current!.queryFeatures(query)
        .then((result) => {
          result.features.forEach((f: any) => {
            if (!f.geometry) return;
            var x = result.features
              .map((feature) => {
                return {
                  attributes: feature.attributes,
                  geometry: feature.geometry,
                };
              })
              .sort(
                (a, b) =>
                  Math.floor(Date.parse(b.attributes.todate) / 1000) -
                  Math.floor(Date.parse(a.attributes.todate) / 1000),
              );
            setEvents(x);
          });
        })
        .catch((error) => {
          console.log(error);
          runQuery();
        });
    }

    runQuery();
  }, []);

  // gdacs event polygon feature layer
  const eventPolygonsLayer = new FeatureLayer({
    url: "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/geopulse_episodes/FeatureServer",
  });

  // country exposures feature layer
  const countryExposures = new FeatureLayer({
    url: "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/geopulse_exposures_by_country/FeatureServer",
  });

  // implements language-sensitive number formatting
  const fmt = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  useEffect(() => {
    if (ref.current) {
      // base layer displaying the regions of the world
      baseLayer.current = new VectorTileLayer({
        url: "https://cdn.arcgis.com/sharing/rest/content/items/d7397603e9274052808839b70812be50/resources/styles/root.json",
        title: "base",
      });

      // vector tile layer displaying country boundaries
      boundariesLayer.current = new VectorTileLayer({
        url: "https://cdn.arcgis.com/sharing/rest/content/items/e8ecee3086f34b06b85229d832a1c14a/resources/styles/root.json",
        title: "boundaries",
        opacity: 0.25,
      });

      // graphics layer that masks-in the event exposures feature layer
      unweightedEventLayer.current = new GraphicsLayer({
        blendMode: "destination-atop",
        title: "graphics",
      });

      // graphics layer that displays the event polygon
      weightedEventLayer.current = new GraphicsLayer({
        blendMode: "normal",
        title: "outline",
      });

      // group layer that will only be shown when an event is in focus
      groupLayer.current = new GroupLayer({
        layers: [unweightedEventLayer.current, weightedEventLayer.current],
      });

      // assign the layers to the map class
      map.current = new Map({
        layers: [
          baseLayer.current,
          boundariesLayer.current,
          groupLayer.current,
        ],
      });

      // calculate minimum zoom level for map based on browser viewport dimensions
      function getMinZoom(
        containerWidth: number,
        containerHeight: number,
      ): number {
        const minZoomX = Math.log2(containerWidth / 256);
        const minZoomY = Math.log2(containerHeight / 256);
        return Math.max(minZoomX, minZoomY);
      }
      const minZoom = getMinZoom(window.innerWidth, window.innerHeight);

      // Observe the width and height of the browser viewport to enforce minimum
      // zoom level
      const resizeObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        const newMinZoom = getMinZoom(width, height);
        view.current.constraints.minZoom = Math.floor(newMinZoom);

        if (view.current.zoom < newMinZoom) {
          view.current.zoom = newMinZoom;
        }
      });
      resizeObserver.observe(ref.current);

      // assign properties to mapView
      if (!state) return;
      view.current = new MapView({
        container: ref.current,
        map: map.current,
        zoom: Math.max(2, minZoom),
        center: [
          state.countryCoordinates.longitude,
          state.countryCoordinates.latitude,
        ],
        constraints: {
          minZoom: Math.floor(minZoom),
          maxZoom: 11,
        },
        popup: {
          dockEnabled: false,
          viewModel: {
            includeDefaultActions: false,
          },
          dockOptions: {
            position: "top-left",
            breakpoint: false,
            buttonEnabled: false,
          },
          visibleElements: {
            closeButton: false,
          },
        },
      });

      // assign the mapView properties to the scalebar zoom measurement
      scaleBarRef.current.view = view.current;

      // remove all arcgis default ui components
      view.current.ui.components = [];
    }

    // clean up mapView between state changes
    return () => {
      view.current.destroy();
    };
  }, []);

  // When realtimeExposure value changes, remove exposure layer from map and from group layer
  // that is stacked with the event polygons. Remove existing exposure layers, add new exposure
  // layers, and reorder them. Blur base layer and exposure layer outside of event polygon to
  // achieve blurring effect outside of event polygon.
  useEffect(() => {
    if (!map.current || !groupLayer.current) return;

    // Remove existing exposure layers if they exist
    map.current.remove(exposureLayer.current);
    groupLayer.current.remove(exposureLayerForGroup.current);

    // Set up renderer classes depending on the exposure type
    const url =
      realtimeObject[realtimeExposure.exposure].url[realtimeExposure.filter];
    const classBreaksRenderer = new ClassBreaksRenderer({
      field: "Value",
      classBreakInfos: realtimeObject[realtimeExposure.exposure].colorScheme,
    });
    const renderer = new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        size: 3,
        color: [255, 200, 0],
      }),
    });

    // assign layers based on exposure type
    switch (realtimeExposure.exposure) {
      case "Airports":
      case "Ports":
        exposureLayer.current = new FeatureLayer({
          url: url,
          effect: "bloom(1.8, 0.85px, 0.4)",
          renderer: renderer,
          title: "exposure",
        });
        exposureLayerForGroup.current = new FeatureLayer({
          url: url,
          effect: "bloom(1.8, 0.85px, 0.4)",
          renderer: renderer,
          title: "exposure",
        });
        break;
      default:
        exposureLayer.current = new ImageryTileLayer({
          url: url,
          renderer: classBreaksRenderer,
          title: "exposure",
        });
        exposureLayerForGroup.current = new ImageryTileLayer({
          url: url,
          renderer: classBreaksRenderer,
          title: "exposure",
        });
        break;
    }

    // Add and reorder exposure layers to achieve the correct masking effect if the layers
    // used to display the event polygons exist. Layers are ordered such that the exposure
    // feature layer remains at the bottom, while the graphics layer sits above, with the 2nd exposure layer is at the top.
    if (
      unweightedEventLayer.current &&
      baseLayer.current &&
      weightedEventLayer.current
    ) {
      map.current.layers.add(exposureLayer.current);
      groupLayer.current.add(exposureLayerForGroup.current);
      map.current.reorder(exposureLayer.current, 1);
      groupLayer.current.layers.reorder(exposureLayerForGroup.current, 0);
      groupLayer.current.layers.reorder(unweightedEventLayer.current, 1);
      groupLayer.current.layers.reorder(weightedEventLayer.current, 2);

      // if an event is focused and focusedFeatures exists, apply blur, darken, and greyscale to layers outside of the group layer
      if (focusedFeatures?.length > 0) {
        baseLayer.current.effect = "blur(6px) brightness(0.7) grayscale(0.8)";
        exposureLayer.current.effect =
          "blur(6px) brightness(0.7) grayscale(0.8)";
      }
    }
  }, [realtimeExposure]);

  // remove all blur effects when removing focus from an event
  const removeBlur = () => {
    if (
      baseLayer.current &&
      exposureLayer.current &&
      unweightedEventLayer.current &&
      weightedEventLayer.current
    ) {
      baseLayer.current.effect = ""; // remove css filters from layers if no event is focused
      switch (realtimeExposure.exposure) {
        case "Airports":
        case "Ports":
          exposureLayer.current.effect = "bloom(1.8, 0.85px, 0.4)";
          break;
        default:
          exposureLayer.current.effect = "";
          break;
      }
      unweightedEventLayer.current.graphics.removeAll(); // remove graphics from graphics layers
      weightedEventLayer.current.graphics.removeAll();
      setFocusedFeatures(null); // reset focused features in state
      setFocusedSliderValue([0]); // reset focused slider value
    }
  };

  // generate arcs for circle shapes that dot the mapView to show events
  function generateCircleGeometry() {
    return {
      rings: [
        [
          [8.5, 0],
          [7.02, 0.13],
          [5.59, 0.51],
          [4.25, 1.14],
          [3.04, 1.99],
          [1.99, 3.04],
          [1.14, 4.25],
          [0.51, 5.59],
          [0.13, 7.02],
          [0, 8.5],
          [0.13, 9.98],
          [0.51, 11.41],
          [1.14, 12.75],
          [1.99, 13.96],
          [3.04, 15.01],
          [4.25, 15.86],
          [5.59, 16.49],
          [7.02, 16.87],
          [8.5, 17],
          [9.98, 16.87],
          [11.41, 16.49],
          [12.75, 15.86],
          [13.96, 15.01],
          [15.01, 13.96],
          [15.86, 12.75],
          [16.49, 11.41],
          [16.87, 9.98],
          [17, 8.5],
          [16.87, 7.02],
          [16.49, 5.59],
          [15.86, 4.25],
          [15.01, 3.04],
          [13.96, 1.99],
          [12.75, 1.14],
          [11.41, 0.51],
          [9.98, 0.13],
          [8.5, 0],
        ],
      ],
    };
  }

  // Arcade expression returning min + [0, range) from a hash of the feature's location
  const pulseRandom = (seed: number, min: number, range: number) => `
        var g = Geometry($feature);
        var h = Abs(Sin(g.x * 12.9898 + g.y * 78.233 + ${seed}) * 43758.5453);
        return ${min} + (h - Floor(h)) * ${range};`;

  // event
  const eventColor = (value: string) => {
    let x;
    switch (value) {
      case "EQ":
        x = [101, 141, 27, 255];
        break;
      case "TC":
        x = [218, 41, 28, 255];
        break;
      case "DR":
        x = [128, 49, 167, 255];
        break;
      case "FL":
        x = [0, 176, 185, 255];
        break;
      case "VO":
        x = [242, 169, 0, 255];
        break;
      case "WF":
        x = [255, 130, 0, 255];
        break;
      default:
        x = [217, 217, 217, 255];
    }

    return {
      type: "cim", // autocasts as new CIMSymbol
      data: {
        type: "CIMSymbolReference",
        primitiveOverrides: [
          {
            type: "CIMPrimitiveOverride",
            primitiveName: "strokeOverride",
            propertyName: "Color",
            valueExpressionInfo: {
              type: "CIMExpressionInfo",
              title: "Animation override",
              expression: `return 'rgba(${x[0]},${x[1]},${x[2]},${x[3]})';`,
              returnType: "Default",
            },
          },
          // per-feature pseudo-random timing so markers don't pulse in unison;
          // seeded from the point location (not Random()) so the scale and
          // transparency animations always get identical values and stay in sync
          {
            type: "CIMPrimitiveOverride",
            primitiveName: "animationOverride",
            propertyName: "StartTimeOffset",
            valueExpressionInfo: {
              type: "CIMExpressionInfo",
              expression: pulseRandom(1, 0, 3),
              returnType: "Numeric",
            },
          },
          {
            type: "CIMPrimitiveOverride",
            primitiveName: "animationOverride",
            propertyName: "Duration",
            valueExpressionInfo: {
              type: "CIMExpressionInfo",
              expression: pulseRandom(2, 1.4, 1),
              returnType: "Numeric",
            },
          },
          {
            type: "CIMPrimitiveOverride",
            primitiveName: "animationOverride",
            propertyName: "RepeatDelay",
            valueExpressionInfo: {
              type: "CIMExpressionInfo",
              expression: pulseRandom(3, 0.5, 2),
              returnType: "Numeric",
            },
          },
        ],
        symbol: {
          type: "CIMPointSymbol",
          symbolLayers: [
            {
              type: "CIMVectorMarker",
              enable: true,
              animations: [
                {
                  type: "CIMSymbolAnimationScale",
                  primitiveName: "scaleOverride",
                  scaleFactor: 3,
                  animatedSymbolProperties: {
                    type: "CIMAnimatedSymbolProperties",
                    primitiveName: "animationOverride",
                    playAnimation: true,
                    repeatType: "Loop",
                    repeatDelay: 1,
                    duration: 1.8,
                    easing: "EaseOut",
                  },
                },
                {
                  type: "CIMSymbolAnimationTransparency",
                  toTransparency: 100,
                  animatedSymbolProperties: {
                    type: "CIMAnimatedSymbolProperties",
                    primitiveName: "animationOverride",
                    playAnimation: true,
                    repeatType: "Loop",
                    repeatDelay: 1,
                    duration: 1.8,
                    easing: "EaseIn",
                  },
                },
              ],
              size: 5,
              frame: {
                xmin: 0,
                ymin: 0,
                xmax: 17,
                ymax: 17,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: generateCircleGeometry(),
                  symbol: {
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidStroke",
                        primitiveName: "strokeOverride",
                        enable: true,
                        width: 1,
                        color: [255, 255, 255, 0],
                      },
                    ],
                  },
                },
              ],
            },
            {
              type: "CIMVectorMarker",
              enable: true,
              size: 5,
              frame: {
                xmin: 0,
                ymin: 0,
                xmax: 17,
                ymax: 17,
              },
              markerGraphics: [
                {
                  type: "CIMMarkerGraphic",
                  geometry: generateCircleGeometry(),
                  symbol: {
                    type: "CIMPolygonSymbol",
                    symbolLayers: [
                      {
                        type: "CIMSolidFill",
                        enable: true,
                        color: x,
                      },
                    ],
                  },
                },
              ],
              scaleSymbolsProportionally: true,
              respectFrame: true,
            },
          ],
        },
      },
    };
  };
  const uniqueColorValues = [
    {
      value: "EQ",
      symbol: eventColor("EQ"),
    },
    {
      value: "TC",
      symbol: eventColor("TC"),
    },
    {
      value: "DR",
      symbol: eventColor("DR"),
    },
    {
      value: "FL",
      symbol: eventColor("FL"),
    },
    {
      value: "VO",
      symbol: eventColor("VO"),
    },
    {
      value: "WF",
      symbol: eventColor("WF"),
    },
  ];

  useEffect(() => {
    if (!map.current) return;

    // clean up
    if (eventFeatureLayer.current) {
      map.current.remove(eventFeatureLayer.current);
      eventFeatureLayer.current.destroy();
    }

    // convert time values to unix time for query
    function toTimestamp(date: any) {
      return date.toISOString().replace("T", " ").split(".")[0];
    }

    // assign query properties for the feature layer to retrieve world events within the date range
    eventFeatureLayer.current = new FeatureLayer({
      url: "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/geopulse_events/FeatureServer",
      outFields: ["*"],
      renderer: {
        type: "unique-value",
        field: "eventtype",
        uniqueValueInfos: uniqueColorValues,
      },
      definitionExpression: `(fromdate >= timestamp '${toTimestamp(new Date(state?.dateRange.from))}' AND fromdate <= timestamp '${toTimestamp(new Date(state?.dateRange.to))}'
            OR
            todate >= timestamp '${toTimestamp(new Date(state?.dateRange.from))}' AND todate <= timestamp '${toTimestamp(new Date(state?.dateRange.to))}'
            OR
            fromdate <= timestamp '${toTimestamp(new Date(state?.dateRange.from))}' AND todate >= timestamp '${toTimestamp(new Date(state?.dateRange.to))}'
        )`,
    });

    // run query on feature layer
    eventFeatureLayer.current.when(() => {
      queryEvents();
    });

    map.current.add(eventFeatureLayer.current); // add events feature layer to map
  }, [state?.dateRange.from, state?.dateRange.to]);

  view.current
    .whenLayerView(eventFeatureLayer.current as FeatureLayer)
    .then((layerView) => {
      var x = `eventtype='${state?.eventFilter}' AND`;
      var y = `%${state?.countryFilter}%`;
      if (state?.eventFilter == "AL") {
        x = "";
      }
      if (state?.countryFilter == "All countries") {
        y = "%";
      }
      layerView.filter = {
        where: `${x} affectedcountries LIKE '${y}'`,
      };
    });

  // query feature layer
  function highlightCountry(eventid: any) {
    const newQuery = eventPolygonsLayer.createQuery();
    newQuery.returnGeometry = true;
    newQuery.outFields = ["*"];
    newQuery.where = `eventid = ${eventid}`;

    function runQuery() {
      eventPolygonsLayer
        .queryFeatures(newQuery)
        .then((result) => {
          console.log("events: ", result);

          const ascendingFeatures = Object.values(
            result.features.reduce(
              (groups, feature) => {
                const id = feature.attributes.episodeid;
                (groups[id] ??= []).push(feature);
                return groups;
              },
              {} as Record<number, typeof result.features>,
            ),
          ).sort(
            (a, b) => a[0].attributes.episodeid - b[0].attributes.episodeid,
          );

          console.log("ASCENDING FEATURES: ", ascendingFeatures);
          console.log("feature ", result.features);

          setFocusedFeatures(ascendingFeatures); // Store the features in state
          console.log("FocusedFeatures: ", ascendingFeatures);

          let combinedExtent: __esri.Extent | null = null;
          for (const feature of result.features) {
            const ext = feature.geometry?.extent;
            console.log(
              "feature element extent: ",
              feature.geometry?.extent?.toJSON(),
            );
            if (!ext) continue;
            combinedExtent = combinedExtent ? combinedExtent.union(ext) : ext;
          }

          if (combinedExtent) {
            console.log("combinedExtent: ", combinedExtent.toJSON());
            view.current.goTo(combinedExtent);
          }

          applyPolygon(ascendingFeatures[ascendingFeatures.length - 1]); // Apply the polygon styling from the first feature (or the specified index)
          setPolygonsLoaded(true);
        })
        .catch((error) => {
          console.log(error);
          runQuery();
        });
    }
    runQuery();
  }

  const applyPolygon = (features: any) => {
    console.log("sS: ", features);
    if (
      features &&
      unweightedEventLayer.current &&
      baseLayer.current &&
      groupLayer.current &&
      weightedEventLayer.current
    ) {
      unweightedEventLayer.current.graphics.removeAll();
      weightedEventLayer.current.graphics.removeAll();

      function polygonStyle(value: any) {
        var outlineColor: string = "";
        var color: string = "";
        var style: string = "";
        switch (value.attributes.weight) {
          case 0:
            outlineColor = "#FF000050";
            color = "rgba(0, 0, 0, 0)";
            style = "solid";
            break;
          case 1:
            outlineColor = "#7E0063";
            color = "rgba(62, 28, 52, 1)";
            style = "solid";
        }

        let polygonClone = value.clone();
        polygonClone.symbol = {
          type: "simple-fill",
          color: color,
          outline: {
            color: outlineColor,
            width: "2px",
            style: style,
          },
        };

        switch (value.attributes.weight) {
          case 0:
            weightedEventLayer.current?.graphics.add(polygonClone);
            break;
          case 1:
            unweightedEventLayer.current?.graphics.add(polygonClone);
        }
      }

      features.forEach((x: any) => {
        // if (x.attributes.weight == 1) {
        polygonStyle(x);
        // }
      });

      baseLayer.current.effect = "blur(6px) brightness(0.7) grayscale(0.8)"; // blur, darken, and greyscale map base layer
      exposureLayer.current.effect = "blur(6px) brightness(0.7) grayscale(0.8)"; // blur, darken, and greyscale map exposure layer
      groupLayer.current.effect =
        "brightness(1) drop-shadow(0, 0px, 12px, #7E0063)"; // brighten and add drop shadow to the group layer
    }
  };

  // uses tanstack router method to update query in url
  const navigate = Route.useNavigate();
  const updateURL = (newURL: string) => {
    navigate({
      search: (prev) => ({
        ...prev, // Keep existing search params
        eventid: newURL, // Update or add a specific parameter
      }),
    });
  };

  useEffect(() => {
    setFocusedSliderValue([focusedFeatures?.length - 1]);
  }, [focusedFeatures]);

  // focuses view on the event selected
  const focusOnEvent = async (
    coors: { longitude: number; latitude: number },
    attributes: any,
  ) => {
    actions?.setLoadingOverlay(true);
    pauseSlider();
    removeBlur(); // remove blur from previous event if it exists
    setFocusedSliderValue([0]); // reset slider value to 0 when focusing on a new event
    console.log(coors);

    // update url
    updateURL(attributes.eventid);

    if (!map.current) return;

    // reveal group layer for focused event and blur other layers
    highlightCountry(attributes.eventid);

    console.log(map.current);

    const newQuery = countryExposures.createQuery();
    newQuery.returnGeometry = true;
    newQuery.outFields = ["*"];
    newQuery.where = `eventid = ${attributes.eventid}`;

    // TESTING
    function runQuery() {
      countryExposures
        .queryFeatures(newQuery)
        .then((result) => {
          console.log("theCountryEXPOSURES: ", result);
          setCurrentCountryExposure("ALL");
          setFocusedCountryExposures(result.features);
          setFocusedEvent(attributes);
          setEventPopup("focused event");

          // hide event dots
          document.querySelectorAll<HTMLElement>(".pw").forEach((element) => {
            element.style.visibility = "hidden";
          });

          if (!eventFeatureLayer.current) return;

          eventFeatureLayer.current.renderer.uniqueValueInfos = [];
          setEventLoaded(true);
        })
        .catch((error) => {
          console.log(error);
          runQuery();
        });
    }

    runQuery();
  };

  // play through the event by incrementing the slider value which updates the position
  const playEvent = (status: string) => {
    const blocker = focusedEvent;
    let i = focusedSliderValue[0];
    let interval = 0;

    switch (status) {
      case "play":
        setFocusedSliderPlaying(true);
        intervalRef.current = setInterval(() => {
          if (
            blocker !== focusedEvent ||
            (i >= focusedFeatures.length - 1 && interval !== 0)
          ) {
            pauseSlider();
            return;
          } else if (i == focusedFeatures.length - 1 && interval == 0) {
            i = 0;
            interval += 1;
            applyPolygon(focusedFeatures[i]);
            setFocusedSliderValue([i]);
          } else {
            i += 1;
            interval += 1;
            applyPolygon(focusedFeatures[i]);
            setFocusedSliderValue([i]);
          }
        }, 500);
        break;
      case "pause":
        pauseSlider();
        break;
    }
  };

  const pauseSlider = () => {
    // clear any existing intervals and reset slider when focusing on a new event
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setFocusedSliderPlaying(false); // reset playing state of slider when focusing on a new event
    }
  };

  const unfocusEvent = () => {
    if (eventPopup == "focused event") {
      updateURL("");
    }
    setEventPopup("all events");
    setFocusedEvent("");
    removeBlur();
    pauseSlider();

    if (!eventFeatureLayer.current) return;
    eventFeatureLayer.current.renderer.uniqueValueInfos = uniqueColorValues;
  };

  const toggleLayerSettingsPopup = (value: boolean) => {
    if (window.innerWidth < 768) {
      setLayerSettingsPopup(value);
    }
  };

  const togglePopIn = (value: string) => {
    if (window.innerWidth >= 768) {
      setPopInState(value);
    }
  };

  const MAX_Y = 90;
  const MIN_Y = window.innerHeight - 50;
  const INITIAL_HEIGHT = window.innerHeight - 50;
  const SNAP_TO_MAX_HEIGHT = window.innerHeight + 75;
  const SNAP_TO_MIN_HEIGHT = 90;

  const [y, setY] = useState(INITIAL_HEIGHT);
  const dragRef = useRef({ active: false, startY: 0, startOffset: 0 });

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { active: true, startY: e.clientY, startOffset: y };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const delta = e.clientY - dragRef.current.startY;
    if (y < MAX_Y) return;
    setY(dragRef.current.startOffset + delta);
  };

  const onPointerUp = (event) => {
    event.preventDefault();
    dragRef.current.active = false;
    if (y > MIN_Y) setY(SNAP_TO_MAX_HEIGHT);
    if (y < MAX_Y) setY(SNAP_TO_MIN_HEIGHT);
  };

  useEffect(() => {
    view.current.goTo({
      center: [
        state.countryCoordinates.longitude,
        state.countryCoordinates.latitude,
      ],
    });
  }, [state?.countryCoordinates]);

  useEffect(() => {
    if (polygonsLoaded && eventLoaded) {
      actions?.setLoadingOverlay(false);
      setPolygonsLoaded(false);
      setEventLoaded(false);
    }
  }, [polygonsLoaded, eventLoaded]);

  useEffect(() => {
    unfocusEvent();
  }, [state?.dateRange, state?.eventFilter, state?.countryFilter]);

  // temporary object for exposure svgs
  const exposureSVGs: Record<string, string> = {
    Population:
      "M5.40005 8.1002C5.40005 7.38411 5.68451 6.69736 6.19086 6.19101C6.69721 5.68466 7.38396 5.4002 8.10005 5.4002C8.81613 5.4002 9.50289 5.68466 10.0092 6.19101C10.5156 6.69736 10.8 7.38411 10.8 8.1002C10.8 8.81628 10.5156 9.50304 10.0092 10.0094C9.50289 10.5157 8.81613 10.8002 8.10005 10.8002C7.38396 10.8002 6.69721 10.5157 6.19086 10.0094C5.68451 9.50304 5.40005 8.81628 5.40005 8.1002ZM8.10005 4.2002C7.0657 4.2002 6.07372 4.61109 5.34233 5.34248C4.61094 6.07387 4.20005 7.06585 4.20005 8.1002C4.20005 9.13454 4.61094 10.1265 5.34233 10.8579C6.07372 11.5893 7.0657 12.0002 8.10005 12.0002C9.13439 12.0002 10.1264 11.5893 10.8578 10.8579C11.5892 10.1265 12 9.13454 12 8.1002C12 7.06585 11.5892 6.07387 10.8578 5.34248C10.1264 4.61109 9.13439 4.2002 8.10005 4.2002ZM14.928 18.1802C15.56 18.4442 16.384 18.5842 17.4 18.6002C19.656 18.6002 20.904 17.7962 21.564 16.8842C21.9342 16.3524 22.1539 15.7305 22.2001 15.0842V15.0002C22.2001 14.0042 21.396 13.2002 20.4 13.2002H14.844C15.132 13.5522 15.344 13.9522 15.48 14.4002H20.4C20.736 14.4002 21 14.6642 21 15.0002V15.1202L20.952 15.3842C20.912 15.6162 20.792 15.8802 20.592 16.1762C20.196 16.7282 19.344 17.4002 17.4 17.4002C16.536 17.3922 15.8601 17.2802 15.3721 17.0642C15.276 17.4082 15.128 17.7802 14.928 18.1802ZM1.80005 15.6002C1.80005 14.2802 2.88005 13.2002 4.20005 13.2002H12C12.6366 13.2002 13.247 13.4531 13.6971 13.9031C14.1472 14.3532 14.4 14.9637 14.4 15.6002V15.6962L14.388 15.9122C14.38 16.0482 14.348 16.2282 14.292 16.4522C14.196 16.8962 13.9921 17.4842 13.5721 18.0842C12.732 19.2962 11.112 20.4002 8.10005 20.4002C5.08805 20.4002 3.45605 19.2962 2.61605 18.0842C2.13593 17.3752 1.85419 16.5507 1.80005 15.6962V15.6002ZM3.00005 15.6722V15.7922L3.07205 16.1882C3.15605 16.5122 3.31205 16.9562 3.61205 17.3882C4.18805 18.2402 5.40005 19.2002 8.10005 19.2002C10.8 19.2002 12.012 18.2402 12.588 17.4002C12.9296 16.8924 13.1361 16.306 13.188 15.6962L13.2 15.6722V15.6002C13.2 15.2819 13.0736 14.9767 12.8486 14.7517C12.6235 14.5266 12.3183 14.4002 12 14.4002H4.20005C3.88179 14.4002 3.57656 14.5266 3.35152 14.7517C3.12648 14.9767 3.00005 15.2819 3.00005 15.6002V15.6722ZM15.6 9.0002C15.6 8.52281 15.7897 8.06497 16.1273 7.7274C16.4648 7.38984 16.9227 7.2002 17.4 7.2002C17.8774 7.2002 18.3353 7.38984 18.6728 7.7274C19.0104 8.06497 19.2001 8.52281 19.2001 9.0002C19.2001 9.47759 19.0104 9.93542 18.6728 10.273C18.3353 10.6106 17.8774 10.8002 17.4 10.8002C16.9227 10.8002 16.4648 10.6106 16.1273 10.273C15.7897 9.93542 15.6 9.47759 15.6 9.0002ZM17.4 6.0002C16.6044 6.0002 15.8413 6.31627 15.2787 6.87888C14.7161 7.44148 14.4 8.20455 14.4 9.0002C14.4 9.79585 14.7161 10.5589 15.2787 11.1215C15.8413 11.6841 16.6044 12.0002 17.4 12.0002C18.1957 12.0002 18.9588 11.6841 19.5214 11.1215C20.084 10.5589 20.4 9.79585 20.4 9.0002C20.4 8.20455 20.084 7.44148 19.5214 6.87888C18.9588 6.31627 18.1957 6.0002 17.4 6.0002Z",
    GDP: "M0.6 0C0.936 0 1.2 0.264 1.2 0.6V16.2C1.2 17.196 2.004 18 3 18H18.6C18.7591 18 18.9117 18.0632 19.0243 18.1757C19.1368 18.2883 19.2 18.4409 19.2 18.6C19.2 18.7591 19.1368 18.9117 19.0243 19.0243C18.9117 19.1368 18.7591 19.2 18.6 19.2H3C2.20435 19.2 1.44129 18.8839 0.87868 18.3213C0.316071 17.7587 0 16.9956 0 16.2V0.6C0 0.264 0.264 0 0.6 0ZM12 4.2C12 3.864 12.264 3.6 12.6 3.6H17.4C17.736 3.6 18 3.864 18 4.2V9C18 9.15913 17.9368 9.31174 17.8243 9.42426C17.7117 9.53679 17.5591 9.6 17.4 9.6C17.2409 9.6 17.0883 9.53679 16.9757 9.42426C16.8632 9.31174 16.8 9.15913 16.8 9V5.64L11.22 11.22C11.1078 11.3299 10.9571 11.3915 10.8 11.3915C10.6429 11.3915 10.4922 11.3299 10.38 11.22L8.4 9.252L4.62 13.02C4.50446 13.1067 4.36153 13.1487 4.21747 13.1385C4.0734 13.1283 3.93786 13.0664 3.83574 12.9643C3.73361 12.8621 3.67175 12.7266 3.66151 12.5825C3.65127 12.4385 3.69334 12.2955 3.78 12.18L7.98 7.98C8.09216 7.87006 8.24295 7.80849 8.4 7.80849C8.55705 7.80849 8.70784 7.87006 8.82 7.98L10.8 9.948L15.96 4.8H12.6C12.4409 4.8 12.2883 4.73679 12.1757 4.62426C12.0632 4.51174 12 4.35913 12 4.2Z",
    "Urban GDP":
      "M12 4.222C11.375 4.222 10.889 4.708 10.889 5.333V18.667C10.889 19.292 11.375 19.778 12 19.778H19.778C20.403 19.778 20.889 19.292 20.889 18.667V12C20.889 11.375 20.403 10.889 19.778 10.889H17C16.687 10.889 16.444 10.646 16.444 10.333V5.333C16.444 4.708 15.958 4.222 15.333 4.222H12ZM9.778 18.667V7.556H4.222C3.597 7.556 3.111 8.042 3.111 8.667V18.667C3.111 19.292 3.597 19.778 4.222 19.778H10.09C9.882 19.465 9.778 19.083 9.778 18.667ZM9.778 5.333C9.778 4.118 10.785 3.111 12 3.111H15.333C16.549 3.111 17.556 4.118 17.556 5.333V9.778H19.778C20.993 9.778 22 10.785 22 12V18.667C22 19.882 20.993 20.889 19.778 20.889H4.222C3.007 20.889 2 19.882 2 18.667V8.667C2 7.451 3.007 6.444 4.222 6.444V3.667C4.222 3.354 4.465 3.111 4.778 3.111C5.09 3.111 5.333 3.354 5.333 3.667V6.444H7.278V3.667C7.278 3.354 7.521 3.111 7.833 3.111C8.146 3.111 8.389 3.354 8.389 3.667V6.444H9.778V5.333ZM12.833 6.722C12.833 6.41 13.076 6.167 13.389 6.167H13.944C14.257 6.167 14.5 6.41 14.5 6.722V7.278C14.5 7.59 14.257 7.833 13.944 7.833H13.389C13.076 7.833 12.833 7.59 12.833 7.278V6.722ZM13.389 9.5H13.944C14.257 9.5 14.5 9.743 14.5 10.056V10.611C14.5 10.924 14.257 11.167 13.944 11.167H13.389C13.076 11.167 12.833 10.924 12.833 10.611V10.056C12.833 9.743 13.076 9.5 13.389 9.5ZM12.833 13.389C12.833 13.076 13.076 12.833 13.389 12.833H13.944C14.257 12.833 14.5 13.076 14.5 13.389V13.944C14.5 14.257 14.257 14.5 13.944 14.5H13.389C13.076 14.5 12.833 14.257 12.833 13.944V13.389ZM5.611 9.5H6.167C6.479 9.5 6.722 9.743 6.722 10.056V10.611C6.722 10.924 6.479 11.167 6.167 11.167H5.611C5.299 11.167 5.056 10.924 5.056 10.611V10.056C5.056 9.743 5.299 9.5 5.611 9.5ZM5.056 13.389C5.056 13.076 5.299 12.833 5.611 12.833H6.167C6.479 12.833 6.722 13.076 6.722 13.389V13.944C6.722 14.257 6.479 14.5 6.167 14.5H5.611C5.299 14.5 5.056 14.257 5.056 13.944V13.389ZM17.833 12.833H18.389C18.701 12.833 18.944 13.076 18.944 13.389V13.944C18.944 14.257 18.701 14.5 18.389 14.5H17.833C17.521 14.5 17.278 14.257 17.278 13.944V13.389C17.278 13.076 17.521 12.833 17.833 12.833Z",
    "Capital stock":
      "M12.0001 7.04408C12.2642 7.04408 12.5176 6.93914 12.7043 6.75236C12.8911 6.56557 12.9961 6.31223 12.9961 6.04808C12.9961 5.78392 12.8911 5.53059 12.7043 5.3438C12.5176 5.15701 12.2642 5.05208 12.0001 5.05208C11.7359 5.05208 11.4826 5.15701 11.2958 5.3438C11.109 5.53059 11.0041 5.78392 11.0041 6.04808C11.0041 6.31223 11.109 6.56557 11.2958 6.75236C11.4826 6.93914 11.7359 7.04408 12.0001 7.04408ZM19.2001 16.0081V9.60008H19.3201C19.5529 9.59686 19.7788 9.52011 19.9653 9.38079C20.1519 9.24148 20.2897 9.04673 20.3589 8.8244C20.4281 8.60207 20.4253 8.36355 20.3508 8.14293C20.2763 7.92232 20.1339 7.73091 19.9441 7.59608L12.9241 2.61608C12.6562 2.41918 12.3325 2.31299 12.0001 2.31299C11.6676 2.31299 11.3439 2.41918 11.0761 2.61608L4.05607 7.59608C3.86622 7.73091 3.72386 7.92232 3.64935 8.14293C3.57484 8.36355 3.572 8.60207 3.64123 8.8244C3.71045 9.04673 3.84821 9.24148 4.03479 9.38079C4.22138 9.52011 4.44723 9.59686 4.68007 9.60008H4.80007V16.0081C4.08007 16.4641 3.60007 17.2801 3.60007 18.2041V19.8001C3.60007 20.1361 3.86407 20.4001 4.20007 20.4001H19.8001C19.9592 20.4001 20.1118 20.3369 20.2243 20.2243C20.3369 20.1118 20.4001 19.9592 20.4001 19.8001V18.2041C20.4001 17.2801 19.9201 16.4641 19.2001 16.0081ZM11.7601 3.60008C11.8261 3.54104 11.9115 3.50841 12.0001 3.50841C12.0886 3.50841 12.1741 3.54104 12.2401 3.60008L18.9961 8.40008H5.00407L11.7601 3.60008ZM18.0001 9.60008V15.6001H15.6001V9.60008H18.0001ZM6.00007 15.6001V9.60008H8.40007V15.6001H6.00007ZM6.20407 16.8001H17.7961C18.5761 16.8001 19.2001 17.4241 19.2001 18.2041V19.2001H4.80007V18.2041C4.80007 17.4241 5.42407 16.8001 6.20407 16.8001ZM11.4001 15.6001H9.60007V9.60008H11.4001V15.6001ZM12.6001 15.6001V9.60008H14.4001V15.6001H12.6001Z",
    Buildings:
      "M6.0751 5.8498C6.25412 5.8498 6.42581 5.77869 6.55239 5.6521C6.67898 5.52551 6.7501 5.35383 6.7501 5.1748C6.7501 4.99578 6.67898 4.82409 6.55239 4.69751C6.42581 4.57092 6.25412 4.4998 6.0751 4.4998C5.89608 4.4998 5.72439 4.57092 5.5978 4.69751C5.47121 4.82409 5.4001 4.99578 5.4001 5.1748C5.4001 5.35383 5.47121 5.52551 5.5978 5.6521C5.72439 5.77869 5.89608 5.8498 6.0751 5.8498ZM6.7501 7.8748C6.7501 8.05383 6.67898 8.22551 6.55239 8.3521C6.42581 8.47869 6.25412 8.5498 6.0751 8.5498C5.89608 8.5498 5.72439 8.47869 5.5978 8.3521C5.47121 8.22551 5.4001 8.05383 5.4001 7.8748C5.4001 7.69578 5.47121 7.5241 5.5978 7.39751C5.72439 7.27092 5.89608 7.1998 6.0751 7.1998C6.25412 7.1998 6.42581 7.27092 6.55239 7.39751C6.67898 7.5241 6.7501 7.69578 6.7501 7.8748ZM6.0751 11.2498C6.16374 11.2498 6.25151 11.2323 6.33341 11.1984C6.4153 11.1645 6.48972 11.1148 6.55239 11.0521C6.61507 10.9894 6.66479 10.915 6.69872 10.8331C6.73264 10.7512 6.7501 10.6634 6.7501 10.5748C6.7501 10.4862 6.73264 10.3984 6.69872 10.3165C6.66479 10.2346 6.61507 10.1602 6.55239 10.0975C6.48972 10.0348 6.4153 9.98511 6.33341 9.95119C6.25151 9.91726 6.16374 9.8998 6.0751 9.8998C5.89608 9.8998 5.72439 9.97092 5.5978 10.0975C5.47121 10.2241 5.4001 10.3958 5.4001 10.5748C5.4001 10.7538 5.47121 10.9255 5.5978 11.0521C5.72439 11.1787 5.89608 11.2498 6.0751 11.2498ZM9.4501 5.1748C9.4501 5.35383 9.37898 5.52551 9.25239 5.6521C9.12581 5.77869 8.95412 5.8498 8.7751 5.8498C8.59608 5.8498 8.42439 5.77869 8.2978 5.6521C8.17121 5.52551 8.1001 5.35383 8.1001 5.1748C8.1001 4.99578 8.17121 4.82409 8.2978 4.69751C8.42439 4.57092 8.59608 4.4998 8.7751 4.4998C8.95412 4.4998 9.12581 4.57092 9.25239 4.69751C9.37898 4.82409 9.4501 4.99578 9.4501 5.1748ZM8.7751 8.5498C8.95412 8.5498 9.12581 8.47869 9.25239 8.3521C9.37898 8.22551 9.4501 8.05383 9.4501 7.8748C9.4501 7.69578 9.37898 7.5241 9.25239 7.39751C9.12581 7.27092 8.95412 7.1998 8.7751 7.1998C8.59608 7.1998 8.42439 7.27092 8.2978 7.39751C8.17121 7.5241 8.1001 7.69578 8.1001 7.8748C8.1001 8.05383 8.17121 8.22551 8.2978 8.3521C8.42439 8.47869 8.59608 8.5498 8.7751 8.5498ZM9.4501 10.5748C9.4501 10.7538 9.37898 10.9255 9.25239 11.0521C9.12581 11.1787 8.95412 11.2498 8.7751 11.2498C8.59608 11.2498 8.42439 11.1787 8.2978 11.0521C8.17121 10.9255 8.1001 10.7538 8.1001 10.5748C8.1001 10.3958 8.17121 10.2241 8.2978 10.0975C8.42439 9.97092 8.59608 9.8998 8.7751 9.8998C8.95412 9.8998 9.12581 9.97092 9.25239 10.0975C9.37898 10.2241 9.4501 10.3958 9.4501 10.5748ZM11.4751 11.2498C11.5637 11.2498 11.6515 11.2323 11.7334 11.1984C11.8153 11.1645 11.8897 11.1148 11.9524 11.0521C12.0151 10.9894 12.0648 10.915 12.0987 10.8331C12.1326 10.7512 12.1501 10.6634 12.1501 10.5748C12.1501 10.4862 12.1326 10.3984 12.0987 10.3165C12.0648 10.2346 12.0151 10.1602 11.9524 10.0975C11.8897 10.0348 11.8153 9.98511 11.7334 9.95119C11.6515 9.91726 11.5637 9.8998 11.4751 9.8998C11.2961 9.8998 11.1244 9.97092 10.9978 10.0975C10.8712 10.2241 10.8001 10.3958 10.8001 10.5748C10.8001 10.7538 10.8712 10.9255 10.9978 11.0521C11.1244 11.1787 11.2961 11.2498 11.4751 11.2498ZM4.0501 16.1998C3.93075 16.1998 3.81629 16.1524 3.7319 16.068C3.64751 15.9836 3.6001 15.8692 3.6001 15.7498V3.1498C3.6001 2.4028 4.2031 1.7998 4.9501 1.7998H10.3501C11.0971 1.7998 11.7001 2.4028 11.7001 3.1498V7.1998H13.0501C13.7971 7.1998 14.4001 7.8028 14.4001 8.5498V15.7498C14.4001 15.8692 14.3527 15.9836 14.2683 16.068C14.1839 16.1524 14.0694 16.1998 13.9501 16.1998H4.0501ZM4.5001 3.1498V15.2998H6.3001V13.0498C6.3001 12.7978 6.4981 12.5998 6.7501 12.5998H11.2501C11.5021 12.5998 11.7001 12.7978 11.7001 13.0498V15.2998H13.5001V8.5498C13.5001 8.43046 13.4527 8.316 13.3683 8.23161C13.2839 8.14721 13.1694 8.0998 13.0501 8.0998H11.2501C11.1307 8.0998 11.0163 8.05239 10.9319 7.968C10.8475 7.88361 10.8001 7.76915 10.8001 7.6498V3.1498C10.8001 3.03046 10.7527 2.916 10.6683 2.83161C10.5839 2.74722 10.4694 2.6998 10.3501 2.6998H4.9501C4.83075 2.6998 4.71629 2.74722 4.6319 2.83161C4.54751 2.916 4.5001 3.03046 4.5001 3.1498ZM10.8001 13.4998H9.4501V15.2998H10.8001V13.4998ZM8.5501 13.4998H7.2001V15.2998H8.5501V13.4998Z",
    Cropland:
      "M6.16495 2.8352H6.18295L6.20095 2.8712L6.62395 3.3392C6.90595 3.6632 7.24195 4.1192 7.63195 4.7072C8.11795 5.4542 8.63995 6.3902 8.99995 7.4702C9.52093 5.95141 10.3274 4.5462 11.376 3.3302L11.799 2.8622L11.817 2.8352L11.826 2.8262C11.8884 2.76144 11.9688 2.71687 12.0567 2.69824C12.1447 2.67961 12.2363 2.68777 12.3196 2.72167C12.4029 2.75558 12.4741 2.81366 12.5241 2.88844C12.5741 2.96322 12.6005 3.05126 12.6 3.1412V7.7312C12.828 7.2632 13.068 6.8792 13.32 6.5792C13.689 6.10939 14.1479 5.71777 14.67 5.4272H14.679C14.7471 5.39919 14.8211 5.38835 14.8945 5.39565C14.9678 5.40294 15.0382 5.42813 15.0996 5.46902C15.1609 5.5099 15.2112 5.56522 15.2462 5.63012C15.2811 5.69501 15.2996 5.76749 15.3 5.8412V12.6002C15.3 13.3163 15.0155 14.003 14.5091 14.5094C14.0028 15.0157 13.316 15.3002 12.6 15.3002H5.39995C4.68387 15.3002 3.99711 15.0157 3.49076 14.5094C2.98441 14.003 2.69995 13.3163 2.69995 12.6002V5.8502C2.70032 5.77649 2.71878 5.70401 2.75372 5.63911C2.78866 5.57422 2.83901 5.5189 2.90033 5.47802C2.96166 5.43713 3.03208 5.41194 3.10543 5.40465C3.17877 5.39735 3.25278 5.40819 3.32095 5.4362H3.33895L3.45595 5.4992C3.53995 5.5412 3.64495 5.6072 3.77095 5.6972C4.02295 5.8772 4.34695 6.1472 4.68895 6.5882C4.93495 6.8882 5.17195 7.2752 5.39995 7.7492V3.1502C5.40119 3.06212 5.42825 2.97634 5.47778 2.9035C5.5273 2.83066 5.59712 2.77395 5.67857 2.74041C5.76002 2.70687 5.84952 2.69798 5.93598 2.71483C6.02244 2.73168 6.10205 2.77353 6.16495 2.8352ZM3.59995 6.7232V12.6002C3.59995 13.5902 4.40995 14.4002 5.39995 14.4002H12.6C13.0773 14.4002 13.5352 14.2106 13.8727 13.873C14.2103 13.5354 14.4 13.0776 14.4 12.6002V6.7232C14.2655 6.85321 14.1392 6.99147 14.022 7.1372C13.464 7.8572 12.816 9.1172 12.6 11.2952C12.594 11.4145 12.5408 11.5266 12.4522 11.6068C12.3636 11.687 12.2468 11.7287 12.1275 11.7227C12.0081 11.7167 11.896 11.6636 11.8158 11.575C11.7357 11.4864 11.694 11.3695 11.7 11.2502V4.3742C11.52 4.6142 11.328 4.8872 11.124 5.1932C10.26 6.49515 9.68888 7.96906 9.44995 9.5132C9.44995 9.63254 9.40254 9.747 9.31815 9.83139C9.23376 9.91579 9.1193 9.9632 8.99995 9.9632C8.8806 9.9632 8.76614 9.91579 8.68175 9.83139C8.59736 9.747 8.54995 9.63254 8.54995 9.5132C8.31102 7.96906 7.73988 6.49515 6.87595 5.1932C6.67795 4.8812 6.48595 4.6082 6.29995 4.3742V11.2502C6.30592 11.3695 6.26423 11.4864 6.18406 11.575C6.10389 11.6636 5.9918 11.7167 5.87245 11.7227C5.7531 11.7287 5.63627 11.687 5.54766 11.6068C5.45905 11.5266 5.40592 11.4145 5.39995 11.2952C5.18395 9.1172 4.53595 7.8482 3.97795 7.1372C3.86068 6.99147 3.73443 6.85321 3.59995 6.7232Z",
    Airports:
      "M7.902 7.4611L7.29 2.5291C7.25426 2.25461 7.32899 1.97716 7.49776 1.75776C7.66653 1.53836 7.91553 1.39496 8.19 1.3591H8.262L8.415 1.3501C8.955 1.3501 9.432 1.6651 9.648 2.1601L11.907 7.3261L14.382 7.2451C15.309 7.2181 16.092 7.9021 16.182 8.8111L16.2 8.9461V9.0001C16.2 9.9721 15.417 10.7551 14.436 10.7551L11.916 10.6651L9.648 15.8401C9.432 16.3351 8.946 16.6501 8.415 16.6501H8.325C8.17738 16.6499 8.03148 16.6184 7.89693 16.5577C7.76237 16.497 7.64223 16.4084 7.54442 16.2978C7.44661 16.1873 7.37336 16.0572 7.3295 15.9162C7.28565 15.7753 7.27219 15.6266 7.29 15.4801L7.902 10.5301L5.976 10.4761L5.112 11.9791C4.896 12.3661 4.482 12.6001 4.05 12.6001C3.81131 12.6001 3.58239 12.5053 3.41361 12.3365C3.24482 12.1677 3.15 11.9388 3.15 11.7001V10.3771H3.006C2.66118 10.3492 2.33952 10.1924 2.10499 9.93813C1.87045 9.68382 1.74023 9.35054 1.74023 9.0046C1.74023 8.65865 1.87045 8.32538 2.10499 8.07107C2.33952 7.81676 2.66118 7.66004 3.006 7.6321L3.15 7.6231V6.3001C3.15 6.0614 3.24482 5.83248 3.41361 5.6637C3.58239 5.49492 3.81131 5.4001 4.05 5.4001C4.491 5.4001 4.896 5.6341 5.112 6.0211L5.976 7.5241L7.902 7.4611ZM8.415 2.2501H8.307C8.28803 2.25232 8.26969 2.25829 8.25305 2.26767C8.23641 2.27704 8.2218 2.28964 8.21008 2.30471C8.19835 2.31979 8.18974 2.33705 8.18475 2.35548C8.17976 2.37392 8.17848 2.39316 8.181 2.4121L8.919 8.3251L5.463 8.4421L4.329 6.4621C4.2983 6.41525 4.2571 6.37622 4.20866 6.34809C4.16023 6.31997 4.1059 6.30354 4.05 6.3001V8.4871L3.168 8.5231C3.04149 8.5231 2.92017 8.57335 2.83071 8.66281C2.74126 8.75226 2.691 8.87359 2.691 9.0001C2.691 9.12661 2.74126 9.24793 2.83071 9.33739C2.92017 9.42684 3.04149 9.4771 3.168 9.4771L4.05 9.5131V11.7001H4.122C4.212 11.6701 4.281 11.6161 4.329 11.5381L5.463 9.5581L8.919 9.6751L8.181 15.6061C8.187 15.6961 8.235 15.7441 8.325 15.7501H8.415C8.50129 15.7487 8.58535 15.7225 8.65716 15.6746C8.72897 15.6267 8.78549 15.5592 8.82 15.4801L11.331 9.7561L14.445 9.8551C14.913 9.8551 15.3 9.4771 15.3 9.0001V8.9731C15.2965 8.8608 15.2709 8.75029 15.2247 8.64789C15.1785 8.54549 15.1125 8.4532 15.0306 8.3763C14.9487 8.2994 14.8524 8.2394 14.7473 8.19973C14.6422 8.16006 14.5303 8.1415 14.418 8.1451L11.331 8.2441L8.82 2.5201C8.78549 2.441 8.72897 2.37348 8.65716 2.32561C8.58535 2.27774 8.50129 2.25153 8.415 2.2501Z",
    Ports:
      "M6.75005 1.83594C6.6307 1.83594 6.51624 1.88335 6.43185 1.96774C6.34746 2.05213 6.30005 2.16659 6.30005 2.28594V4.49994H4.05005C3.9307 4.49994 3.81624 4.54735 3.73185 4.63174C3.64746 4.71613 3.60005 4.83059 3.60005 4.94994V8.60394L2.13305 9.01794C2.06919 9.03518 2.00992 9.06628 1.95946 9.10903C1.90899 9.15179 1.86857 9.20514 1.84107 9.26529C1.81358 9.32545 1.79967 9.39092 1.80036 9.45706C1.80105 9.5232 1.81631 9.58837 1.84505 9.64794L3.46505 13.0859C3.66905 12.8459 3.92705 12.6929 4.23905 12.6269L2.88905 9.74694L8.51405 8.17194C8.82909 8.08448 9.16201 8.08448 9.47705 8.17194L15.111 9.73794L13.725 12.6179C14.037 12.6779 14.301 12.8249 14.517 13.0589L16.155 9.63894C16.1838 9.57937 16.199 9.5142 16.1997 9.44806C16.2004 9.38192 16.1865 9.31645 16.159 9.25629C16.1315 9.19614 16.0911 9.14279 16.0406 9.10003C15.9902 9.05728 15.9309 9.02618 15.867 9.00894L14.4 8.61294V4.94994C14.4 4.83059 14.3526 4.71613 14.2682 4.63174C14.1839 4.54735 14.0694 4.49994 13.95 4.49994H11.7V2.28594C11.7 2.16659 11.6526 2.05213 11.5682 1.96774C11.4839 1.88335 11.3694 1.83594 11.25 1.83594H6.75005ZM10.8 4.49994H7.20005V2.73594H10.8V4.49994ZM13.5 5.39994V8.36994L9.72005 7.31694C9.2489 7.18658 8.7512 7.18658 8.28005 7.31694L4.50005 8.35194V5.39994H13.5ZM13.941 13.8509C13.9202 13.7553 13.8687 13.6691 13.7945 13.6053C13.7202 13.5415 13.6271 13.5038 13.5294 13.4976C13.4317 13.4915 13.3347 13.5175 13.2531 13.5715C13.1714 13.6255 13.1096 13.7046 13.077 13.7969V13.8149L12.969 14.0309C12.897 14.1929 12.777 14.3729 12.609 14.5709C12.294 14.9759 11.844 15.3089 11.25 15.3089C10.656 15.3089 10.206 14.9669 9.88205 14.5709C9.69792 14.336 9.54374 14.079 9.42305 13.8059C9.39152 13.7191 9.334 13.644 9.25832 13.591C9.18264 13.5379 9.09247 13.5095 9.00005 13.5095C8.90763 13.5095 8.81745 13.5379 8.74177 13.591C8.66609 13.644 8.60858 13.7191 8.57705 13.8059L8.46905 14.0309C8.39105 14.1929 8.27105 14.3729 8.10905 14.5709C7.79405 14.9759 7.34405 15.3089 6.75005 15.3089C6.15605 15.3089 5.70605 14.9759 5.38205 14.5799C5.20107 14.3445 5.04992 14.0875 4.93205 13.8149L4.92305 13.7969C4.89046 13.7046 4.82865 13.6255 4.74702 13.5715C4.66538 13.5175 4.56835 13.4915 4.47066 13.4976C4.37296 13.5038 4.27992 13.5415 4.20564 13.6053C4.13136 13.6691 4.0799 13.7553 4.05905 13.8509L3.98705 14.0669C3.92705 14.2169 3.82805 14.3909 3.69005 14.5889C3.42005 14.9579 2.97005 15.3089 2.25005 15.3089C2.1307 15.3089 2.01624 15.3563 1.93185 15.4407C1.84746 15.5251 1.80005 15.6396 1.80005 15.7589C1.80005 15.8783 1.84746 15.9927 1.93185 16.0771C2.01624 16.1615 2.1307 16.2089 2.25005 16.2089C2.70816 16.2181 3.16059 16.1064 3.56188 15.8852C3.96316 15.6641 4.29914 15.3411 4.53605 14.9489L4.68905 15.1469C5.09405 15.6419 5.76005 16.1999 6.75005 16.1999C7.74005 16.1999 8.40605 15.6419 8.82005 15.1379L9.00005 14.8859L9.18005 15.1379C9.42409 15.4581 9.73663 15.7196 10.0948 15.9033C10.453 16.0871 10.8477 16.1884 11.25 16.1999C11.6943 16.1883 12.1288 16.0673 12.515 15.8475C12.9012 15.6277 13.2272 15.3159 13.464 14.9399L13.59 15.1199C13.986 15.6599 14.67 16.2089 15.75 16.1999C15.8694 16.1999 15.9839 16.1525 16.0682 16.0681C16.1526 15.9837 16.2 15.8693 16.2 15.7499C16.2 15.6306 16.1526 15.5161 16.0682 15.4317C15.9839 15.3473 15.8694 15.2999 15.75 15.2999C15.03 15.3089 14.58 14.9579 14.31 14.5889C14.1571 14.3766 14.0358 14.1432 13.95 13.8959L13.941 13.8509Z",
  };

  const formatExposure = (exposure: string) => {
    if (focusedCountryExposures) {
      return fmt.format(
        focusedCountryExposures[
          focusedCountryExposures.indexOf(
            focusedCountryExposures.find(
              (c: any) => c.attributes.areaid == currentCountryExposure,
            ),
          )
        ]?.attributes[realtimeObject[`${exposure}`].eventAttribute],
      );
    }
  };

  const formatPercentage = (exposure: string) => {
    if (focusedCountryExposures) {
      return fmt.format(
        focusedCountryExposures[
          focusedCountryExposures.indexOf(
            focusedCountryExposures.find(
              (c: any) => c.attributes.areaid == currentCountryExposure,
            ),
          )
        ]?.attributes[realtimeObject[`${exposure}`].eventAttribute + "_pct"],
      );
    }
  };

  const exposureSubComponent = (exposure: string) => {
    var filterExposure = formatExposure(exposure);
    var exposurePercentage = formatPercentage(exposure);

    return (
      <div className="flex flex-row items-start gap-3">
        <div className="flex w-2/10 h-full items-center">
          <div className="flex items-center justify-center bg-[#E8EFFA] rounded-xl w-full h-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d={exposureSVGs[exposure]} fill="#234E90" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-start w-full">
          <span className="font-bold text-[10px] text-left text-[#6B7A90]">
            {exposure.toUpperCase()} EXPOSURE
          </span>
          <div className="flex flex-row gap-3 bg-white w-full py-3.5">
            <div className="flex flex-col gap-3 w-full bg-white">
              <span className="text-[36px] text-[#0B1B33] font-bold">
                {
                  <div className="text-[36px] text-left font-bold text-[#0B1B33] leading-[42px]">
                    {focusedCountryExposures ? (
                      <>
                        {filterExposure}{" "}
                        <span className="text-[15px]">
                          {realtimeObject[`${exposure}`].suffix}
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </div>
                }
              </span>
              <span className="text-[11px] text-left font-bold">
                {
                  <div className="text-[#234E90] growAnimation flex flex-col gap-y-0.5">
                    {currentCountryExposure !== "ALL" ? (
                      focusedCountryExposures ? (
                        <>
                          <div>
                            <span className="growAnimation">
                              {exposurePercentage}
                              {"% "}
                            </span>
                            <span className="growAnimation text-[#6B7A90]">
                              of national {exposure}
                            </span>
                          </div>
                          <div className="bg-[#E3E9F1] growAnimation rounded-xl h-1 w-full flex item-stretch items-start">
                            <div
                              className="bg-[#234E90] rounded-xl h-full"
                              style={{
                                width: `${exposurePercentage}%`,
                              }}
                            ></div>
                          </div>
                        </>
                      ) : (
                        "N/A"
                      )
                    ) : (
                      <div className="h-[22.5px]"></div>
                    )}
                  </div>
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sectorSubComponent = (exposure: string) => {
    return (
      <div className="rounded-xl bg-[#F4F7FB] flex flex-col items-start px-2 py-3">
        <div className="font-bold text-[10px] text-left text-[#6B7A90]">
          BY SECTOR
        </div>
        <div className="flex items-start justify-between py-3 gap-2 w-full">
          {realtimeObject[exposure].categories.map((x) => (
            <div className="flex flex-col items-start self-stretch gap-3 w-full">
              <div className="flex flex-col items-center gap-1">
                {/* <svg></svg> */}
                <span className="font-bold text-[11px] text-left text-[#4A5A70]">
                  {x}
                </span>
              </div>
              <span className="text-[#0B1B33] text-[17px] font-bold">N/A</span>
              <div className="flex w-full gap-1.5 items-center">
                <div className="bg-[#E3E9F1] rounded-xl h-1 w-full flex item-stretch items-start">
                  <div
                    className="bg-[#234E90] rounded-xl h-full w-8/10 growAnimation"
                    style={{ width: `25%` }}
                  ></div>
                </div>
                <span className="text-[#234E90] text-[10px] font-bold">
                  N/A
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const assetsSubComponent = (exposure: string) => {
    var filterExposure = formatExposure(exposure);
    var exposurePercentage = formatPercentage(exposure);
    return (
      <div className="flex py-2.5 px-3.5 flex-col gap-2 items-start h-full rounded-xl border border-[#E3E9F1]">
        <div className="flex w-full gap-1 items-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={exposureSVGs[exposure]} fill="#234E90" />
          </svg>
          <span className="text-[#4A5A70] text-[12px] font-bold">
            {exposure}
          </span>
        </div>
        <div className="text-[22px] text-left font-bold text-[#0B1B33] leading-[28px] h-full text-nowrap">
          {focusedCountryExposures ? (
            <>
              {filterExposure}{" "}
              <span className="text-[12px] text-[#6B7A90] font-bold">
                {realtimeObject[`${exposure}`].suffix}
              </span>
            </>
          ) : (
            "N/A"
          )}
          <span className="text-[11px] text-left font-bold">
            {
              <div className="text-[#234E90]">
                {currentCountryExposure !== "ALL" ? (
                  focusedCountryExposures ? (
                    <>
                      <span className="growAnimation">
                        {exposurePercentage}
                        {"% "}
                      </span>
                      <span className="growAnimation text-[#6B7A90]">
                        of national {exposure}
                      </span>
                      <div className="bg-[#E3E9F1] rounded-xl h-1 w-full flex item-stretch items-start growAnimation">
                        <div
                          className="bg-[#234E90] rounded-xl h-full"
                          style={{
                            width: `${exposurePercentage}%`,
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    "N/A"
                  )
                ) : (
                  <div className="h-[32px]"></div>
                )}
              </div>
            }
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <LoadingOverlay />
      <div className="w-full h-full relative overflow-hidden">
        <div className="w-full h-full">
          <div
            className="w-full h-full flex justify-start pt-15"
            ref={ref}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
            ref={pulseContainerRef}
          ></div>
        </div>
        <div
          className={`absolute z-0 md:-z-1 top-33.5 left-8.25 flex items-center border-solid transition-all duration-300 text-white`}
          onClick={() => toggleLayerSettingsPopup(true)}
        >
          <div
            className="rounded-full flex items-center justify-center cursor-pointer h-17.5 w-17.5 md:invisible text-white bg-black border-[1.37px] border-solid border-[#0084FF] mr-[10px]"
            onClick={() => setMobileExposures(!mobileExposures)}
          >
            <img src={Exposures}></img>
          </div>
        </div>
        {Object.entries(realtimeObject).map(([key, layer], index: number) => (
          <div
            key={index}
            id={`${index}`}
            className={`absolute -z-1 md:z-1 left-8.25 pointer-events-none`}
            style={{ top: index * 55 + 200 }}
            onMouseLeave={() => setPopInState("")}
          >
            <div className=" flex gap-2 items-start pointer-events-none has-[.pop-in]:pointer-events-auto">
              <div
                className={`flex items-center border-solid transition-all duration-300 text-white`}
              >
                <div
                  className={`flex items-center pointer-events-auto cursor-pointer transition-all duration-300  text-white`}
                  onClick={() =>
                    setRealtimeExposure({ exposure: key, filter: key })
                  }
                  onMouseEnter={() => togglePopIn(key)}
                >
                  <div
                    className={`rounded-full flex items-center justify-start ${realtimeExposure.exposure == key ? "bg-(--accentblue-100)" : "bg-black hover:bg-(--accentdarkblue-100)"} transition-all duration-300 border-[1.37px] border-solid border-[#0084FF] h-[37px] pr-[10px]`}
                  >
                    <div className="rounded-full flex items-center justify-center bg-black border border-solid border-[#0084FF] h-[37px] w-[37px]">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d={layer.icon} />
                      </svg>
                    </div>
                    <div className="text-white text-[12px] ml-3 font-bold">
                      {key}
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="exposureContainer"
                className={`pointer-events-none has-[.pop-in]:pointer-events-auto flex gap-2 ml-10 flex-wrap max-w-5/10 items-center border-solid transition-all duration-300 text-white`}
              >
                {layer.categories.map((f: any, index: number) => (
                  <div
                    key={`exposure_category_${f}`}
                    id={`exposure_category_${f}`}
                    className={`exposure_ h-9 bg-black border-2 rounded-2xl px-5 opacity-0 cursor-pointer ${popInState == key ? "pop-in" : popInState == "initial" ? "pop-default" : "pop-out"} ${realtimeExposure.filter == f ? "border-(--accentcyan-100)" : "border-(--accentdarkblue-50)"}`}
                    style={
                      popInState == "initial"
                        ? { animationDelay: index * 0 + "ms" }
                        : { animationDelay: index * 50 + "ms" }
                    }
                    onClick={() =>
                      setRealtimeExposure({ exposure: key, filter: f })
                    }
                  >
                    <div className="h-9/10 flex justify-center items-center overflow-hidden">
                      <div className="text-white text-[12px] font-bold">
                        {f}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div
          className={`absolute ${layerSettingsPopup ? "z-3" : "-z-1"} top-0 h-full w-full bg-[#00000090] flex items-center justify-center`}
        >
          <div className="flex flex-col justify-center items-center gap-y-4 h-full w-full border-(--accentdarkblue-80) border bg-(--accentdarkblue-100)">
            <div className="flex w-full flex-col h-1/10 items-center justify-center">
              <div className="flex h-full w-86/100 py-4 items-center justify-between">
                <section className="text-white font-bold text-[16px]">
                  Layers
                </section>
                <div
                  className="text-white font-bold text-[16px] cursor-pointer"
                  onClick={() => setLayerSettingsPopup(false)}
                >
                  X
                </div>
              </div>
              <div className="w-9/10 border-b-1 border-(--accentdarkblue-80)"></div>
            </div>
            <div className="h-9/10 w-86/100 flex flex-col gap-2 justify-start items-center overflow-scroll">
              <div className="flex gap-y-3 flex-col justify-center ">
                <section className="text-left w-95/100 font-bold text-(--accentdarkblue-50)">
                  EXPOSURES
                </section>
                <div className="flex flex-row flex-wrap gap-3">
                  {Object.entries(realtimeObject).map(
                    ([key, layer], index: number) => (
                      <div
                        key={key}
                        className={`w-25 h-25 bg-black border-2 rounded-2xl cursor-pointer ${realtimeExposure.exposure == key ? "border-(--accentcyan-100)" : "border-(--accentdarkblue-50)"}`}
                        onClick={() => {
                          setRealtimeExposure({ exposure: key, filter: key });
                          setLayerSettingsPopup(false);
                        }}
                      >
                        <div className="h-full flex justify-center items-end">
                          <div className="text-white text-[12px] font-bold">
                            {key}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`absolute z-2 bottom-65 md:bottom-0 rounded-lg rounded-t-xl md:transition-[right] md:duration-300 md:ease-in-out ${eventPopup == "all events" ? "md:right-0" : "md:-right-100 invisible"} md:visible max-h-full md:h-85/100 w-full md:w-[350px] flex flex-col bg-white cursor-default draggable`}
          style={{
            "--drag-y": `${y}px`,
            touchAction: "none",
          }}
        >
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => onPointerUp(e)}
          >
            <div className="rounded-t-lg px-5 py-4 shadow-[0px_4px_5.8px_0px_#00000024] bg-[#242558] text-white flex flex-row items-center justify-between">
              <div className="w-full flex flex-col items-start justify-center">
                <div className="h-4 w-full flex items-end justify-center md:hidden">
                  <div className="w-15 h-1 bg-(--accentcoolgray-60) rounded-xl"></div>
                </div>
                <div className="w-full flex justify-between">
                  <b className="text-[20px] text-left max-w-8/10">
                    {state?.eventFilter == "AL"
                      ? "Events"
                      : eventTypes[state?.eventFilter].type}
                    {state?.countryFilter == "All countries"
                      ? ""
                      : ` in ${countryByIso3[state?.countryFilter]}`}
                  </b>
                  <div className="h-8 w-8 bg-[#FFFFFF24] rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="white"
                    >
                      <path
                        d="M2.1001 6.9999C2.1001 6.8039 2.2541 6.6499 2.4501 6.6499H11.5501C11.6429 6.6499 11.7319 6.68678 11.7976 6.75241C11.8632 6.81805 11.9001 6.90708 11.9001 6.9999C11.9001 7.09273 11.8632 7.18175 11.7976 7.24739C11.7319 7.31303 11.6429 7.3499 11.5501 7.3499H2.4501C2.35727 7.3499 2.26825 7.31303 2.20261 7.24739C2.13697 7.18175 2.1001 7.09273 2.1001 6.9999Z"
                        fill="#FFFFFF"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-[12px]">
                  {
                    events?.filter(
                      (element: Record<string, any>) =>
                        (element.attributes.eventtype == state?.eventFilter ||
                          state?.eventFilter == "AL") &&
                        (element.attributes.affectedcountries?.includes(
                          state?.countryFilter,
                        ) ||
                          state?.countryFilter == "All countries"),
                    ).length
                  }{" "}
                  {" in date range · "}
                  {state?.dateRange.from
                    ? format(state?.dateRange.from, "MMM d")
                    : null}
                  {" — "}
                  {state?.dateRange.to
                    ? format(state?.dateRange.to, "MMM d, yyyy")
                    : null}
                </div>
              </div>
            </div>
          </div>
          <div
            className="h-full pb-20 md:pb-0 overflow-y-scroll flex flex-col justify-start"
            ref={eventRef}
          >
            {events
              ?.filter(
                (element: Record<string, any>) =>
                  (element.attributes.eventtype == state?.eventFilter ||
                    state?.eventFilter == "AL") &&
                  (element.attributes.affectedcountries?.includes(
                    state?.countryFilter,
                  ) ||
                    state?.countryFilter == "All countries"),
              )
              ?.map((event: any) => (
                <div
                  key={event.attributes.htmldescription}
                  className="flex flex-col gap-1.5 py-4 px-5 border-b border-gray-300 items-start flex flex-col text-left"
                >
                  <h3 className="w-full flex items-start justify-between font-bold text-[10px] text-[#6B7A90] tracking-[1px]">
                    <div className="w-55">
                      {event.attributes.country.toUpperCase()}
                    </div>
                    {event.attributes.iscurrent == 1 ? (
                      <div className="flex justify-center items-center text-(--accentred-100) gap-1.5 font-bold px-[5px] text-[11px]">
                        <span className="relative flex w-[7px] h-[7px] items-center">
                          <span className="absolute inset-0 rounded-full bg-current opacity-70  transition-all duration-12500 motion-safe:animate-ping" />
                          <span className="relative inline-flex w-[7px] h-[7px] rounded-full bg-current" />
                        </span>
                        <div className="">Ongoing</div>
                      </div>
                    ) : null}
                  </h3>
                  <h3 className="font-bold text-[16px]">
                    {event.attributes.description}
                  </h3>
                  <p className="text-[14px] flex items-center">
                    <svg
                      className="mr-1.5"
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.54995 7.14995C4.72234 7.14995 4.88767 7.08147 5.00957 6.95957C5.13147 6.83767 5.19995 6.67234 5.19995 6.49995C5.19995 6.32756 5.13147 6.16223 5.00957 6.04033C4.88767 5.91843 4.72234 5.84995 4.54995 5.84995C4.37756 5.84995 4.21223 5.91843 4.09033 6.04033C3.96843 6.16223 3.89995 6.32756 3.89995 6.49995C3.89995 6.67234 3.96843 6.83767 4.09033 6.95957C4.21223 7.08147 4.37756 7.14995 4.54995 7.14995ZM5.19995 8.44995C5.19995 8.62234 5.13147 8.78767 5.00957 8.90957C4.88767 9.03147 4.72234 9.09995 4.54995 9.09995C4.37756 9.09995 4.21223 9.03147 4.09033 8.90957C3.96843 8.78767 3.89995 8.62234 3.89995 8.44995C3.89995 8.27756 3.96843 8.11223 4.09033 7.99033C4.21223 7.86843 4.37756 7.79995 4.54995 7.79995C4.72234 7.79995 4.88767 7.86843 5.00957 7.99033C5.13147 8.11223 5.19995 8.27756 5.19995 8.44995ZM6.49995 7.14995C6.67234 7.14995 6.83767 7.08147 6.95957 6.95957C7.08147 6.83767 7.14995 6.67234 7.14995 6.49995C7.14995 6.32756 7.08147 6.16223 6.95957 6.04033C6.83767 5.91843 6.67234 5.84995 6.49995 5.84995C6.32756 5.84995 6.16223 5.91843 6.04033 6.04033C5.91843 6.16223 5.84995 6.32756 5.84995 6.49995C5.84995 6.67234 5.91843 6.83767 6.04033 6.95957C6.16223 7.08147 6.32756 7.14995 6.49995 7.14995ZM7.14995 8.44995C7.14995 8.62234 7.08147 8.78767 6.95957 8.90957C6.83767 9.03147 6.67234 9.09995 6.49995 9.09995C6.32756 9.09995 6.16223 9.03147 6.04033 8.90957C5.91843 8.78767 5.84995 8.62234 5.84995 8.44995C5.84995 8.27756 5.91843 8.11223 6.04033 7.99033C6.16223 7.86843 6.32756 7.79995 6.49995 7.79995C6.67234 7.79995 6.83767 7.86843 6.95957 7.99033C7.08147 8.11223 7.14995 8.27756 7.14995 8.44995ZM8.44995 7.14995C8.62234 7.14995 8.78767 7.08147 8.90957 6.95957C9.03147 6.83767 9.09995 6.67234 9.09995 6.49995C9.09995 6.32756 9.03147 6.16223 8.90957 6.04033C8.78767 5.91843 8.62234 5.84995 8.44995 5.84995C8.27756 5.84995 8.11223 5.91843 7.99033 6.04033C7.86843 6.16223 7.79995 6.32756 7.79995 6.49995C7.79995 6.67234 7.86843 6.83767 7.99033 6.95957C8.11223 7.08147 8.27756 7.14995 8.44995 7.14995ZM11.05 3.57495C11.05 3.14397 10.8787 2.73065 10.574 2.4259C10.2693 2.12116 9.85593 1.94995 9.42495 1.94995H3.57495C3.14397 1.94995 2.73065 2.12116 2.4259 2.4259C2.12116 2.73065 1.94995 3.14397 1.94995 3.57495V9.42495C1.94995 9.85593 2.12116 10.2693 2.4259 10.574C2.73065 10.8787 3.14397 11.05 3.57495 11.05H9.42495C9.85593 11.05 10.2693 10.8787 10.574 10.574C10.8787 10.2693 11.05 9.85593 11.05 9.42495V3.57495ZM2.59995 4.54995H10.4V9.42495C10.4 9.96445 9.96445 10.4 9.42495 10.4H3.57495C3.31637 10.4 3.06837 10.2972 2.88552 10.1144C2.70267 9.93153 2.59995 9.68354 2.59995 9.42495V4.54995ZM3.57495 2.59995H9.42495C9.96445 2.59995 10.4 3.03545 10.4 3.57495V3.89995H2.59995V3.57495C2.59995 3.03545 3.03545 2.59995 3.57495 2.59995Z"
                        fill="#6B7A90"
                      />
                    </svg>
                    <span className="[text-box:trim-both_cap_alphabetic]">
                      {new Date(event.attributes.fromdate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}{" "}
                      -{" "}
                      {event.attributes.todate == Date.now()
                        ? "Present"
                        : new Date(event.attributes.todate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                    </span>
                  </p>
                  <div className="flex w-full justify-between ">
                    <div
                      className="flex h-6.25 gap-1.5 px-2.25 [text-box:trim-both_cap_alphabetic] items-center justify-center font-bold cursor-pointer bg-[#234E90] text-white rounded-sm shadow-lg/10 mb-[6px] mt-[9px] text-[12px]"
                      onClick={() =>
                        focusOnEvent(event.geometry, event.attributes)
                      }
                    >
                      <span className="[text-box:trim-both_cap_alphabetic]">
                        View details
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M6.50395 1.87784C6.44507 1.82373 6.36711 1.79523 6.28722 1.79861C6.20733 1.80198 6.13206 1.83696 6.07795 1.89584C6.02385 1.95471 5.99535 2.03267 5.99872 2.11256C6.0021 2.19245 6.03707 2.26773 6.09595 2.32184L9.79795 5.69984H1.49995C1.42039 5.69984 1.34408 5.73144 1.28782 5.7877C1.23156 5.84397 1.19995 5.92027 1.19995 5.99984C1.19995 6.0794 1.23156 6.15571 1.28782 6.21197C1.34408 6.26823 1.42039 6.29984 1.49995 6.29984H9.79795L6.09595 9.67783C6.03707 9.73194 6.0021 9.80722 5.99872 9.88711C5.99535 9.967 6.02385 10.045 6.07795 10.1038C6.13206 10.1627 6.20733 10.1977 6.28722 10.2011C6.36711 10.2044 6.44507 10.1759 6.50395 10.1218L10.65 6.32984C10.6954 6.28771 10.7316 6.23666 10.7564 6.17987C10.7812 6.12309 10.794 6.0618 10.794 5.99984C10.794 5.93788 10.7812 5.87658 10.7564 5.8198C10.7316 5.76301 10.6954 5.71196 10.65 5.66984L6.50395 1.87784Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div
          className={`z-2 absolute bottom-0 right-0 md:transition-all md:duration-300 md:ease-in-out ${eventPopup == "focused event" ? "md:right-0 visible" : "md:-right-100 invisible"} h-6/10 md:h-85/100 w-full md:w-[385px] shadow-lg/40 md:rounded-2xl flex flex-col items-start  cursor-default transition-all ease-in-out duration-300 overflow-y-auto`}
        >
          <div className="flex flex-col bg-[#242558] w-full gap-y-3 px-4 py-4 rounded-t-xl">
            <div className="flex flex-row rounded-t-lg items-center gap-2">
              <div className="w-9/10 flex flex-row gap-2">
                {focusedEvent.iscurrent == 1 ? (
                  <div className="flex px-3 h-6.25 justify-center items-center bg-(--accentred-100) rounded-xl shadow-lg/10 font-bold text-white text-[11px]">
                    <span className="[text-box:trim-both_cap_alphabetic]">
                      ONGOING
                    </span>
                  </div>
                ) : (
                  <b className="flex px-3 h-6.25 justify-center items-center bg-[#FFFFFF14] rounded-xl shadow-lg/10 font-bold text-white text-[11px]">
                    <span className="[text-box:trim-both_cap_alphabetic]">
                      PAST EVENT
                    </span>
                  </b>
                )}
                {focusedEvent ? (
                  <div
                    className="flex px-3 items-center justify-center font-bold h-6.25 uppercase text-white rounded-xl text-[11px]"
                    style={{
                      backgroundColor: eventTypes[focusedEvent.eventtype].color,
                    }}
                  >
                    <div className="[text-box:trim-both_cap_alphabetic]">
                      {eventTypes[focusedEvent.eventtype].singularType}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="w-1/10 flex justify-end">
                <div
                  className="text-[14px] h-8 w-8 bg-[#FFFFFF24] rounded-full flex items-center justify-center font-bold cursor-pointer"
                  onClick={() => unfocusEvent()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2.86294 2.95394L2.90494 2.90494C2.96232 2.84815 3.03757 2.81294 3.11795 2.80529C3.19832 2.79763 3.27886 2.818 3.34594 2.86294L3.39494 2.90494L6.99994 6.50294L10.6049 2.90494C10.6623 2.84815 10.7376 2.81294 10.8179 2.80529C10.8983 2.79763 10.9789 2.818 11.0459 2.86294L11.0949 2.90494C11.2209 3.02394 11.2349 3.21294 11.1369 3.34594L11.0949 3.39494L7.49694 6.99994L11.0949 10.6049C11.2209 10.7239 11.2349 10.9129 11.1369 11.0459L11.0949 11.0949C11.0376 11.1517 10.9623 11.1869 10.8819 11.1946C10.8016 11.2022 10.721 11.1819 10.6539 11.1369L10.6049 11.0949L6.99994 7.49694L3.39494 11.0949C3.33755 11.1517 3.2623 11.1869 3.18193 11.1946C3.10156 11.2022 3.02101 11.1819 2.95394 11.1369L2.90494 11.0949C2.84815 11.0376 2.81294 10.9623 2.80529 10.8819C2.79763 10.8016 2.818 10.721 2.86294 10.6539L2.90494 10.6049L6.50294 6.99994L2.90494 3.39494C2.84815 3.33755 2.81294 3.2623 2.80529 3.18193C2.79763 3.10156 2.818 3.02101 2.86294 2.95394Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-[26px] text-left text-white font-bold w-9/10">
              {focusedEvent.description}
            </div>
            <p className="text-[14px] flex items-center text-white">
              <svg
                className="mr-1.5"
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.54995 7.14995C4.72234 7.14995 4.88767 7.08147 5.00957 6.95957C5.13147 6.83767 5.19995 6.67234 5.19995 6.49995C5.19995 6.32756 5.13147 6.16223 5.00957 6.04033C4.88767 5.91843 4.72234 5.84995 4.54995 5.84995C4.37756 5.84995 4.21223 5.91843 4.09033 6.04033C3.96843 6.16223 3.89995 6.32756 3.89995 6.49995C3.89995 6.67234 3.96843 6.83767 4.09033 6.95957C4.21223 7.08147 4.37756 7.14995 4.54995 7.14995ZM5.19995 8.44995C5.19995 8.62234 5.13147 8.78767 5.00957 8.90957C4.88767 9.03147 4.72234 9.09995 4.54995 9.09995C4.37756 9.09995 4.21223 9.03147 4.09033 8.90957C3.96843 8.78767 3.89995 8.62234 3.89995 8.44995C3.89995 8.27756 3.96843 8.11223 4.09033 7.99033C4.21223 7.86843 4.37756 7.79995 4.54995 7.79995C4.72234 7.79995 4.88767 7.86843 5.00957 7.99033C5.13147 8.11223 5.19995 8.27756 5.19995 8.44995ZM6.49995 7.14995C6.67234 7.14995 6.83767 7.08147 6.95957 6.95957C7.08147 6.83767 7.14995 6.67234 7.14995 6.49995C7.14995 6.32756 7.08147 6.16223 6.95957 6.04033C6.83767 5.91843 6.67234 5.84995 6.49995 5.84995C6.32756 5.84995 6.16223 5.91843 6.04033 6.04033C5.91843 6.16223 5.84995 6.32756 5.84995 6.49995C5.84995 6.67234 5.91843 6.83767 6.04033 6.95957C6.16223 7.08147 6.32756 7.14995 6.49995 7.14995ZM7.14995 8.44995C7.14995 8.62234 7.08147 8.78767 6.95957 8.90957C6.83767 9.03147 6.67234 9.09995 6.49995 9.09995C6.32756 9.09995 6.16223 9.03147 6.04033 8.90957C5.91843 8.78767 5.84995 8.62234 5.84995 8.44995C5.84995 8.27756 5.91843 8.11223 6.04033 7.99033C6.16223 7.86843 6.32756 7.79995 6.49995 7.79995C6.67234 7.79995 6.83767 7.86843 6.95957 7.99033C7.08147 8.11223 7.14995 8.27756 7.14995 8.44995ZM8.44995 7.14995C8.62234 7.14995 8.78767 7.08147 8.90957 6.95957C9.03147 6.83767 9.09995 6.67234 9.09995 6.49995C9.09995 6.32756 9.03147 6.16223 8.90957 6.04033C8.78767 5.91843 8.62234 5.84995 8.44995 5.84995C8.27756 5.84995 8.11223 5.91843 7.99033 6.04033C7.86843 6.16223 7.79995 6.32756 7.79995 6.49995C7.79995 6.67234 7.86843 6.83767 7.99033 6.95957C8.11223 7.08147 8.27756 7.14995 8.44995 7.14995ZM11.05 3.57495C11.05 3.14397 10.8787 2.73065 10.574 2.4259C10.2693 2.12116 9.85593 1.94995 9.42495 1.94995H3.57495C3.14397 1.94995 2.73065 2.12116 2.4259 2.4259C2.12116 2.73065 1.94995 3.14397 1.94995 3.57495V9.42495C1.94995 9.85593 2.12116 10.2693 2.4259 10.574C2.73065 10.8787 3.14397 11.05 3.57495 11.05H9.42495C9.85593 11.05 10.2693 10.8787 10.574 10.574C10.8787 10.2693 11.05 9.85593 11.05 9.42495V3.57495ZM2.59995 4.54995H10.4V9.42495C10.4 9.96445 9.96445 10.4 9.42495 10.4H3.57495C3.31637 10.4 3.06837 10.2972 2.88552 10.1144C2.70267 9.93153 2.59995 9.68354 2.59995 9.42495V4.54995ZM3.57495 2.59995H9.42495C9.96445 2.59995 10.4 3.03545 10.4 3.57495V3.89995H2.59995V3.57495C2.59995 3.03545 3.03545 2.59995 3.57495 2.59995Z"
                  fill="#6B7A90"
                />
              </svg>
              <span className="[text-box:trim-both_cap_alphabetic]">
                {new Date(focusedEvent.fromdate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}{" "}
                -{" "}
                {focusedEvent.todate == Date.now()
                  ? "Present"
                  : new Date(focusedEvent.todate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
              </span>
            </p>
          </div>
          <div className="w-full bg-white overflow-y-scroll">
            {focusedFeatures?.length > 1 ? (
              <div className="w-full bg-[#F4F7FB] py-3">
                <div className="flex justify-between font-bold text-[10px] w-full py-4 px-4">
                  <span className="text-[#6B7890]">TIMELINE</span>
                  <span className="text-[#4999D0]">
                    Full event · {focusedFeatures?.length - 1} days
                  </span>
                </div>
                <div className="flex flex-row h-5 justify-center items-center w-full gap-x-2 px-4">
                  {focusedSliderPlaying ? (
                    <div
                      className="flex items-center justify-center z-2 text-6.25 w-6.25 h-6.25 text-white bg-(--accentblue-100) rounded-4xl"
                      onClick={() => playEvent("pause")}
                    >
                      <FontAwesomeIcon
                        icon={faPause}
                        size="2xs"
                        color="white"
                      />
                    </div>
                  ) : (
                    <div
                      className="z-2 flex items-center justify-center text-6.25 p-2 text-white bg-(--accentblue-100) rounded-full"
                      onClick={() => playEvent("play")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M10.332 5.20806C10.4734 5.28566 10.5914 5.39983 10.6735 5.53863C10.7557 5.67743 10.799 5.83576 10.799 5.99706C10.799 6.15835 10.7557 6.31668 10.6735 6.45548C10.5914 6.59429 10.4734 6.70846 10.332 6.78606L4.332 10.0861C4.1952 10.1609 4.04131 10.1989 3.8854 10.1964C3.72948 10.1939 3.5769 10.1509 3.44261 10.0716C3.30831 9.99238 3.19691 9.87961 3.11932 9.74435C3.04173 9.60909 3.00061 9.45599 3 9.30006V2.70006C3.00164 2.54463 3.04351 2.39229 3.12152 2.25785C3.19954 2.12341 3.31103 2.01147 3.44516 1.93293C3.57929 1.85439 3.73147 1.81192 3.88688 1.80967C4.0423 1.80741 4.19565 1.84544 4.332 1.92006L10.332 5.20806Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col justify-center h-full w-full">
                    <Slider
                      className="mr-6 z-2 [&_[data-slot=slider-track]]:bg-(--primarygray-50) [&_[data-slot=slider-thumb]]:border-[#4999D0] [&_[data-slot=slider-thumb]]:border-2 cursor-pointer "
                      step={1}
                      min={0}
                      // if there are no features, set max to 10 for demonstrative purposes
                      max={focusedFeatures?.length - 1 || 10}
                      value={focusedSliderValue}
                      onValueChange={(value) => {
                        setFocusedSliderValue(value);
                        // apply polygon based on slider value, if features exist
                        if (focusedFeatures) {
                          applyPolygon(focusedFeatures[value[0]]);
                          pauseSlider();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-row h-5 justify-center items-center w-full gap-x-2 px-4">
                  <div className="p-2 invisible">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M10.332 5.20806C10.4734 5.28566 10.5914 5.39983 10.6735 5.53863C10.7557 5.67743 10.799 5.83576 10.799 5.99706C10.799 6.15835 10.7557 6.31668 10.6735 6.45548C10.5914 6.59429 10.4734 6.70846 10.332 6.78606L4.332 10.0861C4.1952 10.1609 4.04131 10.1989 3.8854 10.1964C3.72948 10.1939 3.5769 10.1509 3.44261 10.0716C3.30831 9.99238 3.19691 9.87961 3.11932 9.74435C3.04173 9.60909 3.00061 9.45599 3 9.30006V2.70006C3.00164 2.54463 3.04351 2.39229 3.12152 2.25785C3.19954 2.12341 3.31103 2.01147 3.44516 1.93293C3.57929 1.85439 3.73147 1.81192 3.88688 1.80967C4.0423 1.80741 4.19565 1.84544 4.332 1.92006L10.332 5.20806Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div className="relative h-6 w-full flex justify-between">
                    {focusedFeatures?.map((feature: any, index: any) => {
                      return (
                        <div key={index} className="flex items-center">
                          {index == 0 ? (
                            <span
                              className={`text-xs w-10 mt-3 text-[#6B7A90]`}
                            >
                              {new Date(
                                focusedEvent.fromdate,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          ) : index == focusedFeatures.length - 1 ? (
                            focusedEvent.todate == Date.now() ? (
                              "Present"
                            ) : (
                              <span
                                className={`text-xs w-10 mt-3 text-[#6B7A90]`}
                              >
                                {new Date(
                                  focusedEvent.todate,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )
                          ) : index ==
                            Math.ceil((focusedFeatures.length - 1) / 2) ? (
                            <span
                              className={`text-xs w-10 mt-3 text-[#6B7A90]`}
                            >
                              {new Date(
                                (new Date(focusedEvent.fromdate).getTime() +
                                  new Date(focusedEvent.todate).getTime()) /
                                  2,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          ) : (
                            ""
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="px-5 w-full flex flex-col gap-y-2.5">
              <div className="flex flex-col gap-3 bg-white w-full py-3">
                <div className="font-bold text-[10px] text-left text-[#6B7A90]">
                  VIEW EXPOSURE BY ECONOMY
                </div>
                <div className="text-left flex flex-wrap text-[14px] gap-3">
                  <div
                    className={`[text-box:trim-both_cap_alphabetic] rounded-xl h-6 whitespace-nowrap px-3  ${currentCountryExposure == "ALL" ? "bg-[#234E90] text-white" : "bg-(--accentwarmgray-20)"} font-bold flex items-center justify-center cursor-pointer`}
                    onClick={() => setCurrentCountryExposure("ALL")}
                  >
                    <div className="[text-box:trim-both_cap_alphabetic]">
                      Total
                    </div>
                  </div>
                  {focusedEvent?.affectedcountries
                    ?.split(",")
                    ?.map((a: string, i: number) => {
                      if (i < 3) {
                        return (
                          <div
                            className={`rounded-xl h-6 whitespace-nowrap px-3  ${currentCountryExposure == a ? "bg-(--accentblue-100) text-white" : "bg-(--accentwarmgray-20)"} font-bold flex items-center justify-center cursor-pointer`}
                            onClick={() => {
                              setCurrentCountryExposure(a);
                              console.log(
                                focusedCountryExposures.indexOf(
                                  focusedCountryExposures.find(
                                    (c: any) => c.attributes.areaid == a,
                                  ),
                                ),
                              );
                            }}
                          >
                            <div>{countryByIso3[a]}</div>
                          </div>
                        );
                      }
                    })}
                  {focusedEvent?.affectedcountries?.split(",")?.length > 3 ? (
                    <div
                      className={`rounded-xl overflow-hidden h-5 px-2 py-3 ${focusedEvent?.affectedcountries?.split(",")?.find((a, i) => a == currentCountryExposure && i > 2) ? "bg-(--accentblue-100) text-white" : "bg-(--accentwarmgray-20)"}  font-bold flex items-center justify-center`}
                      onClick={() =>
                        setOtherCountryDropdownStatus(
                          !otherCountryDropdownStatus,
                        )
                      }
                    >
                      <div className="text-nowrap max-w-40 flex justify-between cursor-pointer">
                        {currentCountryExposure !== "ALL" &&
                        focusedEvent?.affectedcountries
                          ?.split(",")
                          ?.find((a, i) => a == currentCountryExposure && i > 2)
                          ? countryByIso3[currentCountryExposure]
                          : "Other"}
                      </div>
                      <Popover
                        open={otherCountryDropdownStatus}
                        onOpenChange={setOtherCountryDropdownStatus}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={otherCountryDropdownStatus}
                            className="w-4 h-5.25 font-bold justify-between light border-0 shadow-none p-0 bg-transparent hover:bg-transparent cursor-pointer"
                          >
                            <svg
                              className={`${otherCountryDropdownStatus ? "rotate-180" : "rotate-0"}`}
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                            >
                              <path
                                d="M11.0949 5.35484C11.2349 5.49484 11.2349 5.70484 11.0949 5.84484L7.27289 9.68784C7.23711 9.72382 7.19458 9.75238 7.14773 9.77186C7.10087 9.79134 7.05063 9.80137 6.99989 9.80137C6.94915 9.80137 6.89891 9.79134 6.85206 9.77186C6.80521 9.75238 6.76267 9.72382 6.72689 9.68784L2.90489 5.84484C2.86478 5.81476 2.83159 5.7764 2.80759 5.73237C2.78359 5.68835 2.76933 5.63967 2.76577 5.58966C2.76222 5.53964 2.76945 5.48944 2.78699 5.44246C2.80452 5.39548 2.83195 5.35281 2.86741 5.31736C2.90286 5.2819 2.94553 5.25447 2.99251 5.23694C3.03949 5.2194 3.08968 5.21217 3.1397 5.21572C3.18972 5.21928 3.23839 5.23354 3.28242 5.25754C3.32645 5.28154 3.36481 5.31473 3.39489 5.35484L6.99989 8.95984L10.6049 5.34784C10.7449 5.20784 10.9549 5.20784 11.0949 5.34784"
                                fill={`${focusedEvent?.affectedcountries?.split(",")?.find((a, i) => a == currentCountryExposure && i > 2) ? "white" : "black"}`}
                              />
                            </svg>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-0 light rounded-none">
                          <Command>
                            <CommandInput
                              placeholder="Search country..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>Country not found.</CommandEmpty>
                              <CommandGroup>
                                {focusedEvent?.affectedcountries
                                  ?.split(",")
                                  ?.map((a, i) => {
                                    if (i > 2) {
                                      return (
                                        <CommandItem
                                          className="data-[selected=true]:bg-white text-left"
                                          key="all"
                                          value="All countries"
                                          onSelect={() => {
                                            setOtherCountryDropdownStatus(
                                              false,
                                            );
                                            setCurrentCountryExposure(a);
                                          }}
                                        >
                                          <div className="w-90 text-wrap">
                                            <div>{countryByIso3[a]}</div>
                                          </div>
                                          <Check
                                            className={cn(
                                              "ml-auto",
                                              currentCountryExposure === a
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
                                        </CommandItem>
                                      );
                                    }
                                  })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : null}
                </div>
              </div>
              {exposureSubComponent("Population")}
              <div id="divider" className="h-px w-full bg-[#E6EBF2]"></div>
              <div className="font-bold text-[10px] text-left text-[#6B7A90]">
                ECONOMIC EXPOSURE
              </div>
              {exposureSubComponent("GDP")}
              {sectorSubComponent("GDP")}
              {exposureSubComponent("Urban GDP")}
              {exposureSubComponent("Capital stock")}
              <div id="divider" className="h-px w-full bg-[#E6EBF2]"></div>
              <div className="font-bold text-[10px] text-left text-[#6B7A90]">
                ASSET EXPOSURE
              </div>
              <div className="bg-white grid grid-cols-2 gap-2">
                {assetsSubComponent("Buildings")}
                {assetsSubComponent("Cropland")}
                {assetsSubComponent("Airports")}
                {assetsSubComponent("Ports")}
              </div>
              <div className="w-full flex items-center p-5 gap-2 bg-white">
                <Link to="/datamethodology">
                  <u className="cursor-pointer font-bold text-left text-[13px] text-[#234E90] no-underline">
                    Explore Methodology
                  </u>
                </Link>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M7.5879 2.19089C7.51921 2.12777 7.42826 2.09452 7.33505 2.09846C7.24185 2.1024 7.15402 2.1432 7.0909 2.21189C7.02778 2.28058 6.99453 2.37153 6.99847 2.46474C7.00241 2.55795 7.04321 2.64577 7.1119 2.70889L11.4309 6.64989H1.7499C1.65708 6.64989 1.56805 6.68677 1.50242 6.7524C1.43678 6.81804 1.3999 6.90706 1.3999 6.99989C1.3999 7.09272 1.43678 7.18174 1.50242 7.24738C1.56805 7.31302 1.65708 7.34989 1.7499 7.34989H11.4309L7.1119 11.2909C7.04321 11.354 7.00241 11.4418 6.99847 11.535C6.99453 11.6282 7.02778 11.7192 7.0909 11.7879C7.15402 11.8566 7.24185 11.8974 7.33505 11.9013C7.42826 11.9053 7.51921 11.872 7.5879 11.8089L12.4249 7.38489C12.4779 7.33575 12.5202 7.27618 12.5491 7.20993C12.578 7.14368 12.593 7.07218 12.593 6.99989C12.593 6.9276 12.578 6.8561 12.5491 6.78985C12.5202 6.7236 12.4779 6.66404 12.4249 6.61489L7.5879 2.19089Z"
                    fill="#234E90"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 invisible md:visible h-20 w-[350px] bg-[rgba(0,0,0,0.85)] flex flex-col items-center justify-around">
          <div className="w-8/10 flex flex-col items-center justify-end">
            <div className="flex text-white w-full font-extrabold tracking-wide text-[12px] pb-[10px]">
              <div>
                {realtimeObject[realtimeExposure.exposure].title.toUpperCase()}{" "}
                {realtimeObject[realtimeExposure.exposure].unit}
              </div>
            </div>
            <div
              className="h-2 w-full"
              style={{
                background: `linear-gradient(to right, ${realtimeObject[realtimeExposure.exposure].colorScheme.map((e, i) => "rgba(" + e.symbol.color.join(",") + ") " + (i / realtimeObject[realtimeExposure.exposure].colorScheme.length) * 100 + "%," + " rgba(" + e.symbol.color.join(",") + ") " + ((i + 1) / realtimeObject[realtimeExposure.exposure].colorScheme.length) * 100 + "% ").join(",")})`,
              }}
            ></div>
            <div className="h-[20px] w-full flex justify-between">
              {realtimeObject[realtimeExposure.exposure].colorScheme.map(
                (e, i) => (
                  <div key={i} className="flex flex-col w-full h-[full]">
                    <div
                      style={{ justifyContent: "center" }}
                      className="flex items-start w-full h-[20px]"
                    >
                      <div className="flex justify-end items-start w-full gap-0">
                        <div className="text-white text-[12px]">{e.label}</div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        <arcgis-scale-bar
          className="calcite-mode-dark z-2 absolute top-30 right-5 md:top-auto md:right-auto md:bottom-1 md:left-90 max-w-21"
          ref={scaleBarRef}
          bar-style="line"
          unit="metric"
        ></arcgis-scale-bar>
      </div>
    </div>
  );
}
