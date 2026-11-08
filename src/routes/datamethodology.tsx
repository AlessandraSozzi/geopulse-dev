import { createFileRoute, Link } from "@tanstack/react-router";
import { useContext, useEffect, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { AppActionsContext } from "@/app";
import { ContentPage, Section, contentCard } from "@/components/ContentPage";

import GriddedCapitalStock from "../assets/Gridded_Capital_Stock.png";
import GriddedGDP from "../assets/Gridded_GDP.png";
import Events from "../assets/events_thumbnail.png";
import HazardTemperatureExtremes from "../assets/hazardTemperatureExtreme.svg";

export const Route = createFileRoute("/datamethodology")({
  component: RouteComponent,
});

const hub = (slug: string) =>
  `https://geopulse-data-imf-dataviz.hub.arcgis.com/datasets/imf-dataviz::${slug}/explore`;

const body = "text-[16px] leading-relaxed text-[#3D4A5C]";
const linkCls =
  "underline underline-offset-2 text-[#234E90] hover:text-[#0F1A3A]";
// TODO: buttons have no link/handler yet; wire up once the download/API URLs are known
const buttonCls =
  "inline-flex h-8 w-fit items-center rounded-md bg-[#234E90] px-3.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 cursor-pointer";
const thumbCls = "rounded-md border border-[#E3E9F1]";

// jump buttons under the intro
const pageSections = [
  { id: "imagery-layers", label: "Imagery Layers" },
  { id: "events-layer", label: "Events Layer" },
  { id: "forward-looking-indicators", label: "Forward-Looking Indicators" },
];

// the app uses hash routing, so a "#id" link would change the route; scroll instead
const jumpTo = (id: string) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

// "Browse indicators by hazard": label + ArcGIS Hub dataset slug
const indicatorsByHazard: { hazard: string; links: [string, string][] }[] = [
  {
    hazard: "Temperature Extremes",
    links: [
      ["Population", "population-weighted-mean-extreme-temperatures"],
      ["Livestock", "livestock-weighted-mean-extreme-temperatures"],
    ],
  },
  {
    hazard: "Drought",
    links: [["Cropland", "cropland-weighted-mean-drought-conditions"]],
  },
  {
    hazard: "Riverine Flooding",
    links: [
      ["Population", "percent-of-population-exposed-to-riverine-flooding"],
      ["Buildings", "percent-of-buildings-exposed-to-riverine-flooding"],
      ["GDP", "percent-of-gdp-exposed-to-riverine-flooding"],
      ["Urban GDP", "percent-of-urban-gdp-exposed-to-riverine-flooding"],
    ],
  },
  {
    hazard: "Coastal Flooding",
    links: [
      ["Population", "percent-of-population-exposed-to-coastal-flooding"],
      ["Buildings", "percent-of-buildings-exposed-to-coastal-flooding"],
      ["GDP", "percent-of-gdp-exposed-to-coastal-flooding"],
      ["Urban GDP", "percent-of-urban-gdp-exposed-to-coastal-flooding"],
    ],
  },
];

// Papers / Citation / Data label + value
function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7A90]">
        {label}
      </p>
      <div className="mt-1 text-[14px] leading-relaxed text-[#3D4A5C]">
        {children}
      </div>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      className={`${linkCls} inline-flex items-center gap-0.5`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight className="size-3.5" strokeWidth={2} />
    </a>
  );
}

function RouteComponent() {
  const actions = useContext(AppActionsContext);
  useEffect(() => {
    actions?.setView("DataMethodology");
  }, []);

  return (
    <ContentPage
      eyebrow="Data & Methodology"
      title="Access the Data That Powers GeoPulse"
    >
      <p className={`mt-5 max-w-200 text-[18px] leading-relaxed text-[#3D4A5C]`}>
        GeoPulse maps where people and assets meet climate and disaster risks.
        Three families of open data sit behind it: the IMF’s own
        high-resolution gridded macroeconomic layers, near-real-time disaster
        events, and forward-looking climate exposure indicators. Explore them
        in the app, download them, or pull them live through the API. Sources,
        methods, and citations for each are below.
      </p>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-3">
        {pageSections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => jumpTo(id)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#C9D6EA] bg-white px-4 text-[14px] font-bold text-[#234E90] transition-all hover:-translate-y-0.5 hover:border-[#234E90] hover:shadow-[0_4px_12px_rgba(16,24,40,0.10)]"
          >
            {label}
            <ArrowDown className="size-4" strokeWidth={2} />
          </button>
        ))}
      </nav>

      {/* ---------- Imagery layers ---------- */}
      <Section id="imagery-layers" title="Imagery Layers" description="Raster files, 30 arc-second">
        <div className={`flex max-w-[75ch] flex-col gap-y-5 ${body}`}>
          <p>
            The IMF-produced exposure layers GeoPulse is built on: global
            rasters on a 30 arc-second (~1 km) grid showing where economic
            output is generated and where physical capital sits. Pair them with
            a hazard layer to see what’s in harm’s way or use them directly in
            your own GIS.
          </p>
          <p>
            Only these IMF-generated layers (Gridded GDP and Gridded Capital
            Stock) are available to download here. The other exposure layers
            GeoPulse draws on (population, cropland, livestock, buildings) are
            produced by third parties; please obtain those from their original
            sources, listed in the relevant indicators’ methodology
            descriptions. Imagery layers are provided as direct GeoTIFF
            downloads and are not available through the API.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className={`${contentCard} flex flex-col gap-4 p-6`}>
            <div className="flex items-center gap-4">
              <img width={96} src={GriddedCapitalStock} className={thumbCls} />
              <h3 className="text-[18px] font-bold">Gridded Capital Stock</h3>
            </div>
            <p className="text-[14px] leading-relaxed text-[#3D4A5C]">
              A ~1 km global estimate of the value of buildings and built
              assets, from the IMF, showing where physical capital is
              concentrated.
            </p>
            <Meta label="Papers">
              <i>[Add relevant papers(s) here.]</i>
            </Meta>
            <Meta label="Citation">
              <i>
                Gridded Physical Capital Stock (forthcoming). International
                Monetary Fund. Accessed [date].
              </i>
            </Meta>
            <Meta label="Data">
              <i>
                Global raster, 30 arc-second (~1 km at the equator), WGS84
                (EPSG:4326). Download the .zip file with the total physical
                capital stock and individual files for residential vs.
                non-residential.
              </i>
            </Meta>
            <button className={`${buttonCls} mt-auto`}>Download GeoTIFF</button>
          </div>

          <div className={`${contentCard} flex flex-col gap-4 p-6`}>
            <div className="flex items-center gap-4">
              <img width={96} src={GriddedGDP} className={thumbCls} />
              <h3 className="text-[18px] font-bold">Gridded GDP</h3>
            </div>
            <p className="text-[14px] leading-relaxed text-[#3D4A5C]">
              A ~1 km global estimate of economic output from the IMF, aligned
              to IMF WEO totals. Available as total GDP or broken down into ten
              industries. Select a sector to explore its footprint.
            </p>
            <Meta label="Papers">
              <i>[Add relevant papers(s) here.]</i>
            </Meta>
            <Meta label="Citation">
              <i>
                Gridded GDP by industry (forthcoming). International Monetary
                Fund. Accessed [date].
              </i>
            </Meta>
            <Meta label="Data">
              Global ~1 km rasters, WGS84, reconciled to WEO national totals.
              Download the .zip file with the total GDP and the ten industry
              layers{" "}
              <i>
                (Agriculture (AGR); Mining & Oil and Gas (MIN); Manufacturing
                (MAN); Construction (CON); Transportation & Warehousing (TRAN);
                Trade (TRAD); Finance, Insurance & Real Estate (FIN); Government
                & Public Administration (GOV); Public Services (PUB); Other
                Industries (OTH))
              </i>{" "}
              GeoTIFF files.
            </Meta>
            <button className={`${buttonCls} mt-auto`}>Download GeoTIFFs</button>
          </div>
        </div>
      </Section>

      {/* ---------- Events layer ---------- */}
      <Section id="events-layer" title="Events Layer" description="Polygons">
        <div className={`${contentCard} flex flex-col gap-6 p-6`}>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <img
              src={Events}
              className="size-30 shrink-0 rounded-full border border-[#E3E9F1] object-cover"
            />
            <p className={body}>
              GeoPulse draws its disaster events from the{" "}
              <ExternalLink href="https://www.gdacs.org/">
                Global Disaster Alert and Coordination System (GDACS)
              </ExternalLink>
              , a joint EC-JRC and UN OCHA service. For each event (earthquakes,
              tropical cyclones, floods, volcanic eruptions, droughts and more),
              GDACS publishes the affected-area polygons (earthquake shaking
              contours, cyclone wind-impact swaths, flood footprints, ash
              plumes), refreshed as new advisories arrive. We overlay these on
              our exposure layers inside each country’s borders to estimate the
              population, buildings, GDP, urban GDP and cropland (plus the
              airports and ports) caught within the affected area, updating the
              estimates as new advisories arrive and the disaster polygons are
              refined. The result is the per-event, per-country exposure shown
              on each Event Card.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Meta label="Papers">
              <i>[Add relevant papers(s) here.]</i>
            </Meta>
            <Meta label="Citation">
              <i>
                Hazard polygons: GDACS (European Commission, EC-JRC / UN OCHA),
                CC BY 4.0. Exposure figures: GeoPulse Event Exposures,
                International Monetary Fund (2026), derived from GDACS. Accessed
                [date].
              </i>
            </Meta>
            <Meta label="Data">
              <i>
                Per-event hazard polygons with attached exposure attributes
                (population, buildings, GDP, urban GDP, cropland, airports,
                ports) by country. Refreshed daily as new GDACS advisories
                arrive. Download event exposure tables or connect live through
                the ArcGIS REST API.
              </i>
            </Meta>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className={buttonCls}>View Details and Download</button>
            <button className={buttonCls}>Access API</button>
          </div>
        </div>
      </Section>

      {/* ---------- Forward-looking indicators ---------- */}
      <Section id="forward-looking-indicators" title="Forward-Looking Hazard Exposure Indicators">
        <p className={`max-w-[75ch] ${body}`}>
          How today’s people and assets would be exposed to tomorrow’s climate
          hazards. Each indicator pairs a hazard with an exposure layer, and
          computes exposure at country (ADM0) and sub-national (ADM1) level.
          ADM1 units are the first-level sub-national regions within a country,
          such as states, provinces or départements.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Meta label="Papers">
            <i>[Add relevant papers(s) here.]</i>
          </Meta>
          <Meta label="Citation">
            <i>
              GeoPulse Forward-looking Indicators, International Monetary Fund
              (2026). Accessed [date]. Cite alongside the underlying sources:
              temperature & drought: World Bank Climate Change Knowledge Portal
              (CMIP6 / WCRP modelling groups); flooding: WRI Aqueduct Floods v2;
              population: GHSL (GHS-POP); livestock: FAO GLW3; cropland: ESA CCI
              Land Cover; GDP: Murakami, Yoshida & Yamagata (2021).
            </i>
          </Meta>
          <Meta label="Data">
            <i>
              Country (ADM0) and sub-national (ADM1) indicator tables, one row
              per administrative unit × hazard dimension × climate scenario ×
              time period, as downloadable tables, with interactive choropleth
              maps and time series in the{" "}
              <Link to="/compare" className={linkCls}>
                Forward-Looking view
              </Link>
              .
            </i>
          </Meta>
        </div>

        <p className="mt-8 text-[14px] font-bold">Browse indicators by hazard:</p>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {indicatorsByHazard.map(({ hazard, links }) => (
            <div key={hazard} className={`${contentCard} p-5`}>
              <div className="flex items-center gap-2">
                <img src={HazardTemperatureExtremes} className="size-5" />
                <h3 className="text-[15px] font-bold">{hazard}</h3>
              </div>
              <ul className="mt-3 flex flex-col gap-1.5 text-[14px]">
                {links.map(([label, slug]) => (
                  <li key={slug}>
                    <ExternalLink href={hub(slug)}>{label}</ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[14px] italic text-[#3D4A5C]">
          Each indicator opens its dataset page, where you can view detailed
          methodology, download the data, or access it through the ArcGIS REST
          API.
        </p>
      </Section>
    </ContentPage>
  );
}
