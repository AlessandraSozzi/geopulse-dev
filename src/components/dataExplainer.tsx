import { AppStateContext, AppActionsContext } from "@/app";
import { useContext, useEffect, useRef, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CloseIcon } from "@/assets/NavIcons";

// ---------- shared typography (matches the white content pages) ----------

function H({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-4 text-[18px] font-bold leading-snug text-[#0F1A3A] first:mt-0">
      {children}
    </h3>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-[#3D4A5C]">{children}</p>;
}

function List({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[#3D4A5C] marker:text-[#234E90]">
      {children}
    </ul>
  );
}

function B({ children }: { children: ReactNode }) {
  return <b className="font-semibold text-[#0F1A3A]">{children}</b>;
}

function Table({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-md border border-[#E3E9F1]">
      <table className="w-full text-left text-[14px] text-[#3D4A5C]">
        <thead className="bg-[#F4F7FB] text-[#0F1A3A]">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-t border-[#E3E9F1] align-top">
              <td className="px-3 py-2">{a}</td>
              <td className="px-3 py-2">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const horizons: [string, string][] = [
  ["Historical", "1980-2014"],
  ["Early-Century", "2030"],
  ["Mid-Century", "2050"],
  ["End-Century", "2100"],
];

// ---------- tabs ----------

const TABS = ["Event Tracking", "Compare", "Grid"] as const; // same order as the header
type Tab = (typeof TABS)[number];
const tabId = (t: Tab) => `explainer-tab-${t.replace(/\s/g, "-").toLowerCase()}`;
const panelId = "explainer-panel";

// tab to open for the page the user is on
const tabForPath: Record<string, Tab> = {
  "/events": "Event Tracking",
  "/grid": "Grid",
  "/compare": "Compare",
};

export default function () {
  const state = useContext(AppStateContext);
  const actions = useContext(AppActionsContext);
  const open = !!state?.dataExplainerOpen;
  const view = (state?.dataExplainerView ?? "Event Tracking") as Tab;

  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const close = () => actions?.setDataExplainerState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // open on the tab that matches the current page (Events → Event Tracking, Grid → Grid, …)
  useEffect(() => {
    if (open && tabForPath[pathname]) actions?.setDataExplainerView(tabForPath[pathname]);
  }, [open]);

  // focus management + Esc to close
  useEffect(() => {
    if (!open) return;
    returnFocusTo.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocusTo.current?.focus?.(); // back to the button that opened it
    };
  }, [open]);

  // new tab starts at the top
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [view]);

  if (!open) return null;

  const selectTab = (t: Tab) => actions?.setDataExplainerView(t);
  const onTabKeys = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = TABS.indexOf(view);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? TABS.length - 1
          : (i + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    selectTab(TABS[next]);
    document.getElementById(tabId(TABS[next]))?.focus();
  };

  const TabButton = ({ t }: { t: Tab }) => {
    const selected = view === t;
    return (
      <button
        id={tabId(t)}
        type="button"
        role="tab"
        aria-selected={selected}
        aria-controls={panelId}
        tabIndex={selected ? 0 : -1}
        onClick={() => selectTab(t)}
        className={`h-10 cursor-pointer whitespace-nowrap rounded-t-md px-6 text-[14px] font-bold uppercase tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset ${
          selected
            ? "bg-white text-(--primaryblue-100)"
            : "bg-white/15 text-white hover:bg-white/25"
        }`}
      >
        {t}
      </button>
    );
  };

  const ReadMore = () => (
    <P>
      <Link
        to="/datamethodology"
        onClick={close}
        className="font-semibold text-[#234E90] underline underline-offset-2 hover:text-[#0F1A3A]"
      >
        Read More
      </Link>{" "}
      for additional information on the methodology and data sources behind this
      analysis.
    </P>
  );

  const Column = ({ children }: { children: ReactNode }) => (
    <div className="flex flex-col gap-y-4">{children}</div>
  );

  return (
    // backdrop: click outside the panel to close
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="explainer-title"
        tabIndex={-1}
        className="flex h-full w-full max-w-275 flex-col overflow-hidden bg-white text-left shadow-2xl outline-none md:h-auto md:max-h-[85vh] md:w-[92%] md:rounded-lg"
      >
        {/* ---------- header ---------- */}
        <div className="relative shrink-0 bg-(--fundblue) px-6 pt-6 md:px-12">
          <button
            type="button"
            aria-label="Close data explainer"
            onClick={close}
            className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center rounded-full outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
          >
            <CloseIcon color="white" />
          </button>
          <h2 id="explainer-title" className="text-[28px] font-bold text-white">
            Data Explainer
          </h2>

          <div
            role="tablist"
            aria-label="Data Explainer views"
            onKeyDown={onTabKeys}
            className="mt-4 flex gap-x-6 overflow-x-auto"
          >
            <div className="flex flex-col">
              <span className="pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                Realtime
              </span>
              <TabButton t="Event Tracking" />
            </div>
            <div className="flex flex-col">
              <span className="pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                Forward Looking
              </span>
              <div className="flex gap-x-1">
                <TabButton t="Compare" />
                <TabButton t="Grid" />
              </div>
            </div>
          </div>
        </div>

        {/* ---------- content ---------- */}
        <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto">
          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId(view)}
            className="grid items-start gap-x-12 gap-y-6 px-6 py-8 md:px-12 lg:grid-cols-2"
          >
            {view === "Event Tracking" && (
              <>
                <Column>
                  <H>Navigating the Real-Time Event Tracking Page</H>
                  <P>
                    The <B>Real-Time</B> view in GeoPulse provides continuous
                    monitoring of natural hazard events as they unfold around the
                    world. The interactive maps identify affected locations,
                    understand the scale of potential impacts, and explore
                    exposure across key economic and infrastructure indicators.
                  </P>

                  <H>Explore Current and Historical Events</H>
                  <P>
                    The Real-Time page displays a global map of recent and ongoing
                    events together with relevant exposure layers. Users can
                    explore events by selecting event markers directly on the map
                    or by viewing event details in the panel on the right side of
                    the screen.
                  </P>
                  <P>
                    The right-side panel provides additional information about the
                    selected event, including:
                  </P>
                  <List>
                    <li>Event name and status</li>
                    <li>Timeline and duration</li>
                    <li>Event severity metrics</li>
                    <li>Affected countries or regions</li>
                    <li>Estimated exposure and risk indicators</li>
                    <li>Links to download supporting data and explore methodology</li>
                  </List>
                </Column>

                <Column>
                  <H>Refine Your Search</H>
                  <P>
                    The controls in the top navigation bar allow users to focus the
                    analysis on events of interest.
                  </P>
                  <P>You can narrow or expand the events displayed by:</P>
                  <List>
                    <li>
                      <B>Selecting a time frame</B> (for example, the last three
                      months, last six months, last year, or a custom date range)
                    </li>
                    <li>
                      <B>Choosing a specific country</B>
                    </li>
                    <li>
                      <B>Filtering by event type</B> to focus on particular hazards
                    </li>
                  </List>

                  <H>Understand Exposure Layers</H>
                  <P>
                    On the left side of the map, users can select from a series of{" "}
                    <B>exposure layers</B>. These layers represent key economic,
                    demographic, and infrastructure assets that may be affected by
                    natural hazards.
                  </P>
                  <P>Exposure layers help answer questions such as:</P>
                  <List>
                    <li>How many people may be affected by an event?</li>
                    <li>Which sectoral areas are most vulnerable to economic losses?</li>
                  </List>
                  <P>
                    By turning layers on and off, users can visualize where hazards
                    intersect with important assets and better understand the
                    geographic distribution of potential impacts.
                  </P>
                  <ReadMore />
                </Column>
              </>
            )}

            {view === "Compare" && (
              <>
                <Column>
                  <H>Navigating the Compare View</H>
                  <P>
                    The <B>Compare</B> view illustrates how climate-related hazards
                    and exposures may evolve under different future climate
                    scenarios. Designed for benchmarking and strategic planning,
                    this view enables side-by-side comparisons of countries or
                    subnational regions, helping users identify areas that may face
                    higher levels of exposure under future climate conditions.
                  </P>

                  <H>Compare Countries or Subnational Regions</H>
                  <P>
                    The Compare view displays two maps side by side, making it easy
                    to evaluate differences in exposure across locations. You can:
                  </P>
                  <List>
                    <li>
                      Compare <B>two different countries</B> to understand how
                      future climate risks vary across economies.
                    </li>
                    <li>
                      Compare <B>subnational regions within the same country</B> to
                      identify areas that may face higher exposure levels.
                    </li>
                  </List>

                  <H>Select a Hazard and Exposure Indicator</H>
                  <P>At the top of the page, users can choose:</P>
                  <List>
                    <li>
                      A <B>hazard category</B> (such as coastal flooding, riverine
                      flooding, heat stress, drought, or other available hazards).
                    </li>
                    <li>
                      An <B>exposure layer</B> (such as population, GDP, urban GDP,
                      buildings).
                    </li>
                    <li>
                      A <B>climate scenario</B> (Orderly or Disorderly).
                    </li>
                    <li>
                      A <B>time horizon</B> for analysis.
                    </li>
                  </List>

                  <H>Choose a Climate Scenario</H>
                  <P>
                    GeoPulse allows users to compare future outcomes under
                    different climate pathways.
                  </P>
                  <P>
                    <B>Orderly Transition</B> An orderly transition assumes that
                    climate mitigation measures are introduced early and steadily
                    over time. In climate science, this represents a
                    lower-emissions pathway where governments, businesses, and
                    societies gradually reduce greenhouse gas emissions, limiting
                    the extent of future warming and associated climate impacts.
                  </P>
                  <P>
                    <B>Disorderly Transition</B> A disorderly transition assumes
                    delayed or uneven climate action. Under this pathway, emissions
                    remain higher for longer before stronger mitigation efforts
                    occur later in the century. This results in greater warming and
                    generally higher levels of climate-related exposure and risk.
                  </P>
                </Column>

                <Column>
                  <H>Explore Future Time Horizons</H>
                  <P>
                    The time selector allows users to view projections across
                    multiple planning horizons:
                  </P>
                  <Table head={["Future Horizon", "Reference Year"]} rows={horizons} />

                  <H>[Add section about hazard sliders]</H>

                  <H>Interpret the Maps</H>
                  <P>
                    The maps display exposure levels using a graduated color scale.
                    Darker shades indicate higher levels of exposure relative to
                    the selected indicator and scenario.
                  </P>
                  <P>Users can:</P>
                  <List>
                    <li>Hover over regions to view detailed values.</li>
                    <li>Identify geographic hotspots.</li>
                    <li>Compare exposure patterns between locations.</li>
                    <li>
                      Understand where future climate impacts may become more
                      concentrated.
                    </li>
                    <li>Download results for further analysis.</li>
                  </List>
                  <ReadMore />
                </Column>
              </>
            )}

            {view === "Grid" && (
              <>
                <Column>
                  <H>Navigating the Grid View</H>
                  <P>
                    The <B>Grid</B> view enables users to explore forward-looking
                    climate risks at a highly granular spatial level. Unlike the
                    Compare view, which focuses on benchmarking locations side by
                    side, the Grid view allows users to examine how hazards and
                    exposures intersect across the globe using detailed geospatial
                    data.
                  </P>

                  <H>Select a Hazard, Exposure, and Climate Scenario</H>
                  <P>
                    Using the controls at the top of the page, you can customize
                    the map by selecting:
                  </P>
                  <List>
                    <li>
                      A <B>hazard category</B> (such as coastal flooding, riverine
                      flooding, heat stress, drought, or other available hazards).
                    </li>
                    <li>
                      An <B>exposure layer</B> (such as population, GDP, urban GDP,
                      buildings).
                    </li>
                    <li>
                      A <B>climate scenario</B> (Orderly or Disorderly).
                    </li>
                    <li>
                      A <B>time horizon</B> for analysis.
                    </li>
                  </List>

                  <H>Choose a Climate Scenario</H>
                  <P>
                    GeoPulse allows users to compare future risks under different
                    climate pathways.
                  </P>
                  <P>
                    <B>Orderly Transition</B> An orderly transition assumes that
                    emissions reductions and climate policies are implemented
                    gradually and early. This pathway generally results in lower
                    levels of warming and more moderate future climate impacts.
                  </P>
                  <P>
                    <B>Disorderly Transition</B> A disorderly transition assumes
                    delayed or uneven climate action, leading to higher greenhouse
                    gas concentrations and greater warming before mitigation
                    efforts take effect. This pathway generally produces larger
                    increases in climate-related hazards and exposures.
                  </P>

                  <H>Explore Future Time Horizons</H>
                  <P>
                    The time selector enables users to evaluate exposure across
                    multiple planning horizons.
                  </P>
                  <Table head={["Future Horizon", "Reference Year"]} rows={horizons} />
                </Column>

                <Column>
                  <H>Understanding the Bivariate Legend</H>
                  <P>
                    The legend combines two variables into a single visualization.
                    Rather than displaying only hazard intensity or only exposure,
                    the map simultaneously shows both dimensions so users can
                    quickly identify where high hazards overlap with high
                    concentrations of exposed assets.
                  </P>
                  <P>In the example shown:</P>
                  <List>
                    <li>
                      The <B>vertical axis</B> represents <B>Population Exposure</B>{" "}
                      (low to high).
                    </li>
                    <li>
                      The <B>horizontal axis</B> represents <B>Flood Height</B> (low
                      to high).
                    </li>
                    <li>
                      Each grid cell on the map is colored based on the combination
                      of these two variables.
                    </li>
                  </List>
                  <P>The legend can be interpreted as follows:</P>
                  <Table
                    head={["Legend Category", "Meaning"]}
                    rows={[
                      [
                        "Low Hazard + Low Exposure",
                        "Areas where flood levels and exposed populations are both relatively low.",
                      ],
                      [
                        "High Hazard + Low Exposure",
                        "Areas with severe flooding but relatively few people exposed.",
                      ],
                      [
                        "Low Hazard + High Exposure",
                        "Areas with large populations but relatively lower flood intensity.",
                      ],
                      [
                        "High Hazard + High Exposure",
                        "Areas where severe flooding coincides with large exposed populations, representing potential risk hotspots.",
                      ],
                    ]}
                  />
                  <P>
                    The color gradient helps users distinguish between these
                    combinations at a glance. Areas that appear in the most intense
                    colors represent locations where both hazard levels and
                    exposure levels are relatively high, making them important
                    areas for further analysis and resilience planning.
                  </P>
                  <ReadMore />
                </Column>
              </>
            )}
          </div>

          {/* fade at the bottom hints that the content scrolls */}
          <div className="pointer-events-none sticky bottom-0 h-10 bg-linear-to-t from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}
