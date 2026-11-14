import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GlobeIcon } from "../assets/GlobeIcon";
import { ArrowRight } from "../assets/arrow-right";
{
  /* arrowRight needs to be chevronRight, line 257 at time of comment */
}
// import { ChevronRight } from '../assets/chevron-right'
import { TopoBackground } from "../components/TopoBackground";
import globeExtrusions from "../assets/globeExtrusions high.webp";
import trackPreview from "../assets/home-event-tracking.webp";
import seePreview from "../assets/home-forward-looking.webp";
import estimatePreview from "../assets/home-data-foundation.webp";
import exportable from "../assets/exportable.svg";
import downloadable from "../assets/downloadable.svg";
import transparentMethodology from "../assets/transparentMethodology.svg";
import harmonizedIndicators from "../assets/harmonizedIndicators.svg";
import whiteGeo from "../assets/white-geo.jpg";
import carsBackground from "../assets/cars-bg.jpg";
import IMFLogo from "../assets/IMF-logo 1.png";
import type { ReactElement } from "react";
import { useRef, useEffect } from "react";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import Map from "@arcgis/core/Map.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D.js";
import ObjectSymbol3DLayer from "@arcgis/core/symbols/ObjectSymbol3DLayer.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import Legend from "@arcgis/core/widgets/Legend.js";
import Layer from "@arcgis/core/layers/Layer.js";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

// Hero type scales with screen *height* at xl (the way earthgenome.org sizes its hero), so the whole
// first screen — headline, subtitle and cards — fits any laptop from ~630px to ~1020px of height.
// Below xl it keeps fixed sizes, since phones and tablets scroll the hero rather than fit it.
// The title's slope is steeper than a plain svh value (≈45px at 630 tall, ≈70px at 860, ≈87px at
// 1020) so short screens give up the most size while 13"–16" laptops barely change.
const heroTitle =
  "font-bold text-[40px] pb-5 xl:text-[clamp(40px,calc(10.9svh_-_24px),88px)] leading-none tracking-[-1.816px]";
const heroSubtitle =
  "tracking-[-1.089px] text-[16px] md:text-[29px] xl:text-[clamp(17px,2.8svh,28px)]";

const categoryDetails: Record<
  string,
  { title: ReactElement; subtitle?: ReactElement }
> = {
  Overview: {
    title: (
      <span className={heroTitle}>
        Monitor, Anticipate & Explore Economic Risk
      </span>
    ),
    subtitle: (
      <span className={heroSubtitle}>
        <b>GeoPulse</b> is an IMF platform that maps the exposure of economies
        to physical hazards at 1 km resolution — quantifying realized and
        potential risk to people, GDP, capital and land.
      </span>
    ),
  },
  Monitor: {
    title: (
      <span className={heroTitle}>Monitor Economic Exposure to Disasters</span>
    ),
    subtitle: (
      <span className={heroSubtitle}>
        Track ongoing <b>natural disasters in real time</b> and assess exposure
        of populations, GDP, capital stock, and critical infrastructure. Explore
        past events through interactive maps and downloadable indicators.
      </span>
    ),
  },
  Anticipate: {
    title: <span className={heroTitle}>Anticipate Future Hazard Exposure</span>,
    subtitle: (
      <span className={heroSubtitle}>
        Explore <b>forward-looking hazard–exposure indicators</b> across
        different scenarios through year 2100, using interactive maps or
        national and subnational comparisons.
      </span>
    ),
  },
  Explore: {
    title: <span className={heroTitle}>IMF Gridded Macroeconomic Layers</span>,
    // scoped to the two IMF-produced layers (GDP and capital stock); population and land cover are
    // exposure layers GeoPulse consumes, not IMF products, so they are deliberately not claimed here
    subtitle: (
      <span className={heroSubtitle}>
        Explore the economic data behind GeoPulse with detailed map layers
        showing where economic activity and assets are concentrated at{" "}
        <b>1 km resolution</b>.
      </span>
    ),
  },
};

// the hero rests on this entry; the cards below cycle through the rest while the user is idle
const mainCategory = "Overview";
const idleMs = 12000; // 12 seconds for the main overview
const rotationMs = 10000; // 10 seconds for each feature card

// `category` keys the hero copy in categoryDetails; `title`/`misc` are all the card shows.
// `link` must stay in step with the matching entry in overviewCategories below — the card and the
// section band are two routes into the same component, so they should not disagree.
const cardDetails: {
  category: string;
  title: string;
  link: string;
  misc: ReactElement;
}[] = [
  {
    category: "Monitor",
    title: "Event Tracking",
    link: "/events",
    misc: (
      <span className="flex items-center gap-2 text-(--red)">
        {/* pulsing live dot — dot size is w-[7px]/h-[7px], halo follows it via inset-0 */}
        <span className="relative flex w-[7px] h-[7px]">
          <span className="absolute inset-0 rounded-full bg-current opacity-70 motion-safe:animate-ping" />
          <span className="relative inline-flex w-[7px] h-[7px] rounded-full bg-current" />
        </span>
        LIVE
      </span>
    ),
  },
  {
    category: "Anticipate",
    title: "Forward-Looking Risks",
    link: "/compare",
    misc: <span>THROUGH 2100</span>,
  },
  {
    category: "Explore",
    title: "Data Foundation",
    link: "/datamethodology",
    misc: <span>1KM GEOSPATIAL GRIDS</span>,
  },
];

// the carousel walks the cards in order, then returns to the main entry
const cycleCategories = cardDetails.map((card) => card.category);

// Pill buttons: hover = darken + lift + arrow nudges right; press settles; keyboard focus shows a ring
const pillButton =
  "group rounded-[100px] h-15 flex items-center justify-center py-5 px-10 gap-2 cursor-pointer outline-none " +
  "shadow-[0_4px_6.5px_0_rgba(0,0,0,0.50)] " + // on the button itself, so it lifts with it on hover
  "transition-[filter,translate] duration-200 ease-out " +
  "hover:brightness-90 hover:-translate-y-px active:translate-y-0 active:brightness-85 " +
  "focus-visible:brightness-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--fundblue) " +
  "motion-reduce:hover:translate-y-0";

const arrowNudge =
  "transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transform-none";

export const mapButton = (
  background: string,
  foreground: string,
  icon1: ReactElement,
  icon2: ReactElement,
  link: string,
  label = "Explore the Map",
) => (
  <Link
    to={link}
    activeOptions={{ exact: true }}
    className={`${background} ${foreground} ${pillButton}`}
  >
    {icon1}
    <span className="font-bold text-[18px]">{label}</span>
    <span className={arrowNudge}>{icon2}</span>
  </Link>
);

const externalButton = (
  background: string,
  foreground: string,
  label: string,
  icon: ReactElement,
  href: string,
) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${background} ${foreground} ${pillButton}`}
  >
    <span className="font-bold text-[18px]">{label}</span>
    <span className={arrowNudge}>{icon}</span>
  </a>
);

const overviewCategories: {
  title: string;
  description: ReactElement;
  picture: string;
  pictureAlt: string;
  pictureSize: [number, number]; // intrinsic px, so the page reserves the space before the image loads
  order: string;
  link: string;
}[] = [
  {
    title: "Event Tracking",
    description: (
      <div className="max-w-90 flex flex-col gap-5">
        <span>
          Monitor disaster events as they unfold on an interactive global map,
          or revisit past events.
        </span>
        <span>
          Map disaster footprints to see where and to what extent people,
          economic activity, and assets are exposed.
        </span>
        <span>
          Learn more about each event, including its timeline and detailed
          exposure metrics by country, with access to supporting data.
        </span>
      </div>
    ),
    picture: trackPreview,
    pictureAlt: "Event details card for Tropical Cyclone ARNAB-26 over a population exposure map",
    pictureSize: [1292, 1170],
    order: "normal",
    link: "/events",
  },
  {
    title: "Forward-Looking Risks",
    description: (
      <div className="max-w-90 flex flex-col gap-5">
        <span>
          Explore how hazards and exposure may evolve across different scenarios
          and time horizons, with projections extending through 2100.
        </span>
        <span>
          Compare countries and subnational regions side by side using
          interactive maps and charts. Download data and maps to support
          economic analysis, inform policy decisions, and guide adaptation
          investments.
        </span>
      </div>
    ),
    picture: seePreview,
    pictureAlt: "Compare view: Bangladesh coastal flooding map by region and exposure trend chart",
    pictureSize: [1293, 1175],
    order: "reverse",
    link: "/compare",
  },
  {
    title: "Data Foundation",
    description: (
      <div className="max-w-90 flex flex-col gap-5">
        <span>
          Access the gridded macroeconomic statistics behind GeoPulse. The new
          IMF layers bring GDP and capital stock to a 1 km grid through
          Fine-Scale Spatial Disaggregation of Macroeconomic Data.
        </span>
        <span>
          Part of the IMF’s innovative agenda for geospatially enabled
          macroeconomic statistics, these layers connect national economic
          measures to local geographies. Download the data to assess economic
          exposure to hazards and support research and policy analysis.
        </span>
      </div>
    ),
    picture: estimatePreview,
    pictureAlt: "Grid view: temperature threshold slider and riverine flooding and GDP legend",
    pictureSize: [1302, 1200],
    order: "normal",
    link: "/datamethodology",
  },
];

const featureCategories: {
  icon: string;
  title: string;
  subtitle: string;
  position: number;
}[] = [
  {
    icon: exportable,
    title: "Exportable Charts",
    subtitle:
      "Download publication-ready charts to communicate your findings in reports and presentations.",
    position: 0,
  },
  {
    icon: downloadable,
    title: "Downloadable Datasets",
    subtitle:
      "Take severity metrics, affected economies and disaster footprints with you.",
    position: 2,
  },
  {
    icon: transparentMethodology,
    title: "Transparent Methodology",
    subtitle:
      "Documented data sources and methods support accurate interpretation and proper citation.",
    position: 1,
  },
  {
    icon: harmonizedIndicators,
    title: "Harmonized Indicators",
    subtitle:
      "Globally consistent indicators for surveillance, financing and policy analysis.",
    position: 3,
  },
];
const stops = [
  {
    value: 0,
    size: 100000,
    color: "#FFFFE1",
  },
  {
    value: 400000,
    size: 250000,
    color: "#F3758C",
  },
  {
    value: 7000000,
    size: 1500000,
    color: "#7D2898",
  },
  {
    value: 30000000,
    size: 3500000,
    color: "#4C1E6E",
  },
];
function RouteComponent() {
  const ref = useRef(null);
  let map = useRef<Map | null>(null);
  const view = useRef<SceneView>(new SceneView());

  const graticule = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/World_graticule_15deg/FeatureServer",
    opacity: 0.6,
    legendEnabled: false,
  });

  useEffect(() => {
    if (ref.current) {
      map.current = new Map({
        layers: [graticule],
        ground: {
          surfaceColor: "#eaf2ff",
        },
      });

      view.current = new SceneView({
        map: map.current,
        container: ref.current,
        camera: {
          position: {
            spatialReference: {
              latestWkid: 4326,
              wkid: 4326,
            },
            x: 50.34885653510194,
            y: 18.68409306191745,
            z: 19134228.85529455,
          },
          heading: 0,
          tilt: 0.1,
        },
        alphaCompositingEnabled: true,
        environment: {
          background: {
            type: "color",
            color: [0, 0, 0, 0],
          },
          atmosphereEnabled: false,
          starsEnabled: false,
          lighting: {
            type: "virtual",
          },
        },
      });
      view.current.ui.empty("top-left");
      // window.view = view;

      // create 5 population layers, one for each year
      for (let i = 2000; i <= 2020; i += 5) {
        const layer = new FeatureLayer({
          url: "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/World_population/FeatureServer",
          opacity: 0,
          outFields: ["*"],
          renderer: getRenderer(i),
          title: "Population " + i.toString(),
          legendEnabled: false,
        });
        map.current?.layers.push(layer);
      }

      // generates a renderer based on the year attribute
      function getRenderer(year: number) {
        return new SimpleRenderer({
          symbol: new PointSymbol3D({
            symbolLayers: [
              new ObjectSymbol3DLayer({
                resource: {
                  primitive: "cube",
                },
                anchor: "bottom",
                width: 80000,
              }),
            ],
          }),
          visualVariables: [
            {
              type: "color",
              field: "pop" + year,
              stops: stops,
              legendOptions: {
                title: "Number of persons/grid unit",
              },
            },
            {
              type: "size",
              field: "pop" + year,
              stops: stops,
              axis: "height",
              legendOptions: {
                showLegend: false,
              },
            },
            {
              type: "size",
              axis: "width-and-depth",
              useSymbolValue: true, // uses the width value defined in the symbol layer (80,000)
              legendOptions: {
                showLegend: false,
              },
            },
          ],
        });
      }

      // utility function to get the layer currently displayed
      function getCurrentLayer() {
        const layer = map.current?.layers.find(function (layer) {
          return layer.title === "Population " + currentYear;
        });
        return layer as any;
      }

      let popLayerView: any;
      let oldLayer;
      let currentHighlight = null;
      let currentYear = 2000;
      let currentLayer = getCurrentLayer();
      const loader: any = document.getElementById("loader");

      view.current.whenLayerView(currentLayer).then(function (lyrView) {
        popLayerView = lyrView;
        reactiveUtils
          .whenOnce(() => !popLayerView.updating)
          .then(() => {
            fadeIn(currentLayer);
            currentLayer.legendEnabled = true;
            ref.current.style.opacity = 1;
          });
      });

      function fadeIn(layer: any) {
        const opacity = parseFloat((layer.opacity + 0.2).toFixed(2));
        layer.opacity = opacity;
        if (layer.opacity < 1) {
          window.requestAnimationFrame(function () {
            fadeIn(layer);
          });
        }
      }

      function rotateGlobe() {
        if (!view.current.interacting) {
          const camera = view.current.camera.clone();
          camera.position.longitude += 0.1;
          view.current.camera = camera;
        }
        requestAnimationFrame(rotateGlobe);
      }

      view.current.when(() => {
        rotateGlobe();
      });
    }

    return () => {
      // view.current.destroy();
    };
  }, []);

  // "Built to be Used" cards: bounce in once, the first time the section scrolls into view
  const featuresRef = useRef<HTMLDivElement>(null);
  const [featuresIn, setFeaturesIn] = useState(false);
  useEffect(() => {
    const el = featuresRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesIn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const featureCard = (e: (typeof featureCategories)[number]) => (
    <div
      key={e.title}
      style={{ animationDelay: `${e.position * 120}ms` }}
      className={`flex p-10 flex-col items-start gap-4 rounded-[6px] border-[0.5px] bg-white shadow-[0_10px_14px_0_rgba(0,0,0,0.12)] text-left ${featuresIn ? "card-pop" : "card-hidden"}`}
    >
      <img src={e.icon}></img>
      <span className="text-[24px] font-bold leading-[120%]">{e.title}</span>
      <span className="text-[16px] leading-[140%]">{e.subtitle}</span>
    </div>
  );

  const [activeCategory, setActiveCategory] = useState<string>(mainCategory);
  const [hovering, setHovering] = useState(false);
  // While the pointer is on a card the user is driving; otherwise the hero rests on the main
  // entry, and after idleMs walks the cards once before settling back on it.
  useEffect(() => {
    if (
      hovering ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let step = 0;
    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      const atEndOfCycle = step >= cycleCategories.length;
      setActiveCategory(atEndOfCycle ? mainCategory : cycleCategories[step]);
      step = atEndOfCycle ? 0 : step + 1;
      timer = setTimeout(advance, atEndOfCycle ? idleMs : rotationMs);
    };

    timer = setTimeout(advance, idleMs);
    return () => clearTimeout(timer);
  }, [hovering]);

  // highlight: true only while a card owns the hero, so the resting state dims nothing
  const highlighting = cycleCategories.includes(activeCategory);
  return (
    <div className="relative isolate bg-white">
      <TopoBackground />
      <div className="flex justify-center">
        <div className="w-92/100 max-w-500 2xl:h-210 absolute overflow-hidden top-40 pb-16 grid grid-cols-1 lg:grid-cols-[0.5fr_1fr]">
          <div className="col-span-full flex flex-col gap-y-10 lg:gap-y-30 2xl:justify-between">
            <div className="lg:w-auto max-w-120 lg:max-w-100 grid text-black text-left z-1">
              {Object.entries(categoryDetails).map(([key, details]) => (
                <div
                  key={key}
                  aria-hidden={key !== activeCategory}
                  className={`md:max-w-80 lg:max-w-120 2xl:max-w-max col-start-1 row-start-1 flex flex-col gap-3 xl:gap-5 transition-opacity duration-500 ease-in-out
                                    ${/* gap: the title sets leading-none, so title and subtitle otherwise touch */ ""}
                                    ${key === activeCategory ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  {details.title}
                  {details.subtitle}
                </div>
              ))}
            </div>
            <div
              className="relative col-span-full flex flex-col lg:flex-row  justify-center w-fit gap-5 z-10"
              onMouseLeave={() => {
                setHovering(false);
                setActiveCategory(mainCategory);
              }}
            >
              {cardDetails.map((e, i) => (
                <Link
                  key={i}
                  to={e.link}
                  activeOptions={{ exact: true }}
                  className={`group relative overflow-hidden flex w-70 min-h-32 border border-[#A7A7A7] rounded-[6px] shadow-[0_8px_16px_0_rgba(0,0,0,0.14)] bg-white p-5 flex-col justify-between items-start cursor-pointer
                                ${/* highlight: dim the cards that are not active — delete this line to remove */ ""}
                                transition-opacity duration-500 ${!highlighting || e.category === activeCategory ? "opacity-100" : "opacity-60"}`}
                  onMouseEnter={() => {
                    setHovering(true);
                    setActiveCategory(e.category);
                  }}
                >
                  {/* --- highlight: countdown bar showing how long this card holds the hero.
                                Delete this block (and the `relative overflow-hidden` above) to remove. --- */}
                  {e.category === activeCategory && !hovering && (
                    <span
                      key={activeCategory}
                      className="absolute inset-x-0 top-0 h-1 origin-left bg-(--fundblue)"
                      style={{
                        animation: `cardCountdown ${rotationMs}ms linear forwards`,
                      }}
                    />
                  )}
                  {/* --- end countdown bar --- */}
                  <div className="flex flex-col w-full justify-between h-full">
                    <div className="w-full flex justify-end">
                      <div
                        className={`font-bold transition-colors duration-700 ${e.category == activeCategory ? "text-(--fundblue)" : "text-black"}`}
                      >
                        {e.misc}
                      </div>
                    </div>
                    {/* Title + arrow. The arrow closes the diagonal with the badge and marks the card as navigable. */}
                    <div
                      className={`w-full flex items-center justify-between gap-3 transition-colors duration-700 ${e.category == activeCategory ? "text-(--fundblue)" : "text-black"}`}
                    >
                      <span className="text-left uppercase font-bold leading-[110%] tracking-[-0.2px] text-[18px]">
                        {e.title}
                      </span>
                      {/* filled disc: bg-current picks up the row's active colour, so the circle
                                        and the title change together; the chevron stays knocked out in white */}
                      <div className="w-11 h-11 shrink-0 rounded-full bg-current flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                        <ArrowRight color={"white"} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="w-92/100 max-w-500 h-320 lg:h-auto relative overflow-hidden pt-20 pb-16 grid grid-cols-1 md:grid-cols-[40%_1fr] grid-rows-[500px_1fr] md:grid-rows-[1fr_150px] justify-start items-center">
          <div
            className={`h-250 md:col-start-2 row-start-2 md:row-start-1 opacity-0 transition-opacity duration-1200 pointer-events-none`}
            ref={ref}
          ></div>
        </div>
      </div>
      <div className="w-full flex flex-col items-center pt-15">
        {overviewCategories.map((e, i) => (
          <div
            className={`w-full md:max-w-500 flex items-center ${e.order == "normal" ? "flex-col md:flex-row" : "flex-col md:flex-row-reverse"} pt-10 md:pt-0`}
            key={i}
          >
            <div className="w-9/10 md:w-5/10 flex flex-col text-left items-center justify-center">
              <div className="lg:w-7/10 flex flex-col gap-y-5 justify-start items-start">
                <div className="font-bold text-[40px] md:text-[4cqw] xl:text-[100px] tracking-[-1.2px] leading-[100%]">
                  {e.title}
                </div>
                {e.description}
                {mapButton(
                  "bg-(--fundblue)",
                  "text-white",
                  <GlobeIcon color={"var(--primarywhite)"} />,
                  <ArrowRight color={"var(--primarywhite)"} />,
                  e.link,
                  e.title === "Data Foundation"
                    ? "Access the Data"
                    : "Explore the Map",
                )}
              </div>
            </div>
            <img
              className="pt-10 md:pt-0 md:w-5/10"
              src={e.picture}
              alt={e.pictureAlt}
              width={e.pictureSize[0]}
              height={e.pictureSize[1]}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-cover py-25 flex flex-col xl:flex-row bg-position-[50%] bg-no-repeat items-center">
        <div className="flex w-full justify-center">
          <span className="w-9/10 tracking-[-1.2px] leading-[100%] font-bold text-[50px] md:text-[60px] max-w-250">
            Built to be Used, Cited & Trusted
          </span>
        </div>
        <div className="flex w-full justify-center items-center">
          <div
            ref={featuresRef}
            className="grid grid-cols-1 grid-rows-1 md:grid-cols-2 gap-10 md:gap-10 py-10 w-9/10"
          >
            <div className="grid grid-cols-1 grid-rows-2 gap-10 h-140">
              {featureCategories.filter((i) => i.position < 2).map(featureCard)}
            </div>
            <div className="grid grid-cols-1 grid-rows-2 gap-10 md:mt-20 h-140">
              {featureCategories.filter((i) => i.position > 1).map(featureCard)}
            </div>
          </div>
        </div>
      </div>
      <div
        className="w-full bg-cover pt-16 flex flex-col items-center"
        style={{
          backgroundImage: `url(${carsBackground})`,
        }}
      >
        <div className="leading-[100%] tracking-[-0.34px] font-bold text-[60px] w-9/10 pb-7 text-white ">
          Advancing Global Data Standards
        </div>
        <span className="leading-[140%] text-[20px] text-center text-white w-9/10 max-w-220 pb-10">
          The G20 Data Gaps Initiative (DGI-3) aims to improve economic and
          financial statistics, including data on climate-related risks.
        </span>
        <span className="leading-[140%] text-[20px] text-center text-white w-9/10 max-w-220 pb-10">
          GeoPulse supports{" "}
          <b>Recommendation 5 — climate physical and transition risks</b> — by
          developing high-resolution gridded macroeconomic data and indicators
          of exposure to physical hazards, and making them accessible for
          surveillance and policy analysis.
        </span>
        {externalButton(
          "bg-white",
          "text-(--accentdarkblue-90)",
          "Learn More",
          <ArrowRight color={"var(--accentdarkblue-90)"} />,
          "https://www.imf.org/en/news/seminars/conferences/g20-data-gaps-initiative",
        )}
        <div className="w-full flex justify-center items-center py-25">
          <div className="flex w-9/10 flex-col items-center gap-9.25">
            <img src={IMFLogo}></img>
            <div className="text-white font-bold leading-[140%]">
              © 2026 INTERNATIONAL MONETARY FUND. ALL RIGHTS RESERVED |{" "}
              <a
                href="https://www.imf.org/en/about/privacy-notice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit no-underline hover:underline focus-visible:underline"
              >
                Privacy Policy
              </a>
              {" | "}
              <a
                href="https://www.imf.org/en/about/copyright-and-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit no-underline hover:underline focus-visible:underline"
              >
                Copyright &amp; Usage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
