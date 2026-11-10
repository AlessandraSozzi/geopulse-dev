import React from "react";
import { useEffect, useLayoutEffect, useRef, useState, useContext } from "react";
import { useRouterState, Link } from "@tanstack/react-router";

import { AppStateContext, AppActionsContext } from "../app";


import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Card } from "@/components/ui/card";
import { Timeline } from "./timeline";
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
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import {
  urlObject,
  scenarioMapper,
  measureMapper,
  eventTypes,
  timePeriods,
} from "@/config/datasets";
import { isoCountries, countryByIso3 } from "@/config/isoCountries";

import Hamburger from "../assets/Group 51.png";
import Lockup from "../assets/geopulse-logo.svg";

import { mapButton } from "../routes/home";
import { GlobeIcon } from "../assets/GlobeIcon";
import { ArrowRight } from "../assets/arrow-right";
import {
  CircleChevron,
  CloseIcon,
  CompareIcon,
  DataExplainerIcon,
  DataOptionsIcon,
  EventTrackingIcon,
  EventTypeIcon,
  GridIcon,
  HazardIcon,
  SmallChevron,
} from "../assets/NavIcons";


// Single-choice dropdown list used by the event-type and scenario dropdowns.
// Same pattern as the country dropdown: light-grey row on hover / keyboard focus,
// ✓ + bold on the selected option. ↑/↓ (Home/End) move focus, Enter/Space selects.
type Option<T extends string> = { value: T; label: React.ReactNode; icon?: React.ReactNode };

function OptionList<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onSelect: (v: T) => void;
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'));
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };
  return (
    <div role="listbox" aria-label={label} className="flex flex-col gap-0.5 p-1.5" onKeyDown={onKeyDown}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="option"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(o.value)}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-[14px] text-black outline-none transition-colors hover:bg-neutral-200 focus-visible:bg-neutral-200 ${selected ? "font-bold" : ""}`}
          >
            {o.icon}
            <span className="flex-1">{o.label}</span>
            <Check className={`size-4 shrink-0 ${selected ? "opacity-100" : "opacity-0"}`} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

export const Header = () => {
  const location = useRouterState({ select: (s) => s.location });

  // On white pages the tab shadows smudge into the 4px gaps, so use a thin outline there instead
  const lightPage = ["/team", "/about", "/datamethodology"].includes(location.pathname);
  const tabShadow = "shadow-[2px_2px_8px_0_rgba(0,0,0,0.25)]";
  const tabOutline = "border border-[#C9D6EA]";
  const tabEdge = lightPage ? tabOutline : tabShadow;

  // Filter panels stay mounted; switching section animates the grid columns and slides the contents
  // out from / back behind their tab (desktop only; mobile keeps the stacked layout)
  const isEvents = location.pathname === "/events";
  const isForward = location.pathname === "/compare" || location.pathname === "/grid";
  const slideEase = "xl:duration-500 xl:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
  const slide = `xl:transition-transform ${slideEase}`;

  // Column widths snap; the pieces that move (Forward Looking tab, its filters, Data Explainer) glide from
  // their old position with a transform (FLIP). Transforms run on the compositor, so the map loading on
  // the new page can't make the slide stutter (animating grid-template-columns did).
  const flTabRef = useRef<HTMLDivElement>(null);
  const flFiltersRef = useRef<HTMLDivElement>(null);
  const explainerRef = useRef<HTMLDivElement>(null);
  const lastLeft = useRef(new WeakMap<HTMLElement, number>());
  // true while the panels slide: only then (and on closed panels) are the clip-path and translate applied.
  // Popovers here are not portalled, and a transform or clip-path on an ancestor clips them,
  // so the open panel must have neither once it has settled.
  const [sliding, setSliding] = useState(false);

  useLayoutEffect(() => {
    const animate =
      window.matchMedia("(min-width: 80rem)").matches && // xl only
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    [flTabRef, flFiltersRef, explainerRef].forEach(({ current: el }) => {
      if (!el) return;
      const left = el.offsetLeft;
      const prev = lastLeft.current.get(el);
      lastLeft.current.set(el, left);
      if (!animate || prev === undefined || prev === left) return;
      el.getAnimations().forEach((a) => a.cancel());
      el.animate(
        [{ transform: `translateX(${prev - left}px)` }, { transform: "translateX(0)" }],
        { duration: 500, easing: "cubic-bezier(0.22,1,0.36,1)" },
      );
    });
    setSliding(true);
    const t = window.setTimeout(() => setSliding(false), 550);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  const state = useContext(AppStateContext);
  const actions = useContext(AppActionsContext);

  // useEffect(() => {
  //     setMenuOptions(false);
  // }, [p0rops.currentView]);

  const [riskState, setRiskState] = useState<string>("Riverine Flooding");
  const [riskOpened, setRiskOpened] = useState<boolean>(false);
  const [scenarioOpened, setScenarioOpened] = useState<boolean>(false);
  const [eventFilterOpened, setEventFilterOpened] = useState<boolean>(false);
  const [countryFilterOpened, setCountryFilterOpened] =
    useState<boolean>(false);
  const [calendarOpened, setCalendarOpened] = useState<boolean>(false);
  const [currentDatePreset, setCurrentDatePreset] =
    useState<string>("Last 3 months");
  const [temporaryDate, setTemporaryDate] = useState<any>({
    from: new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 3,
      new Date().getDate(),
    ),
    to: new Date(),
  });
  const [hoverDate, setHoverDate] = useState<Date | undefined>(undefined);
  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      setRiskState(state?.currentHazard);
    }
    setRiskOpened(newOpenState);
  };
  const [dataOptions, setDataOptions] = useState<boolean>(false);
  const [menuOptions, setMenuOptions] = useState<boolean>(false);

  const [open, setOpen] = React.useState(false);
  const [iso3, setIso3] = useState("");

  const swapTable = (
    hazard: string,
    exposure: string,
    threshold: { name: string; threshold: any },
    measure: { name: string; id: string },
    scenario: string,
  ) => {
    const findMatchingScenario = new Promise((resolve) => {
      if (
        urlObject[hazard][exposure].scenarios.find(
          (element) => scenarioMapper[element] == scenarioMapper[scenario],
        )
      ) {
        resolve(true);
      } else {
        resolve(true);
        actions?.setScenario(urlObject[hazard][exposure].scenarios[0]);
      }
    });

    findMatchingScenario.then(() => {
      actions?.setHazard(hazard);
      actions?.setExposure(exposure);
      actions?.setThreshold(threshold);
      actions?.setMeasure(measure);
    });
  };

  const allData = new Date("2019-01-07");
  const now = new Date();
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  // fresh date per preset (reusing one Date object made 6 months = 9 and 1 year = 21 months)
  const monthsAgo = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d;
  };
  const threeMonthsAgo = monthsAgo(3);
  const sixMonthsAgo = monthsAgo(6);
  const twelveMonthsAgo = monthsAgo(12);

  const datePresets = (value: string) => {
    switch (value) {
      case "All Data":
        setTemporaryDate({
          from: allData,
          to: new Date(),
        });
        setCurrentDatePreset("All Data");
        break;
      case "Last 3 months":
        setTemporaryDate({
          from: threeMonthsAgo,
          to: new Date(),
        });
        setCurrentDatePreset("Last 3 months");
        break;
      case "Last 6 months":
        setTemporaryDate({
          from: sixMonthsAgo,
          to: new Date(),
        });
        setCurrentDatePreset("Last 6 months");
        break;
      case "Last Year":
        setTemporaryDate({
          from: twelveMonthsAgo,
          to: new Date(),
        });
        setCurrentDatePreset("Last Year");
        break;
    }
  };

  const hazardsArray = [
    { type: "Earthquake", color: "var(--green)" },
    { type: "Tropical Cyclone", color: "var(--red)" },
    { type: "Drought", color: "var(--purple)" },
    { type: "Flooding", color: "var(--cyan)" },
    { type: "Volcano", color: "var(--yellow)" },
    { type: "Wildfire", color: "var(--orange)" },
  ];

  const calendarComponent = (
    <Card
      className={`rounded-none w-full h-22 xl:h-14.75 p-0 px-2 items-center justify-center border-r-0 gap-0 select-none`}
    >
      <div className="w-full flex flex-col items-center">
        <Popover
          open={calendarOpened}
          onOpenChange={() => setCalendarOpened(!calendarOpened)}
        >
          <PopoverTrigger asChild>
            <button type="button" className="flex flex-row items-center w-95/100 h-full xl:h-14.75 justify-between cursor-pointer text-left outline-none underline-offset-4 focus-visible:underline">
              <div className="flex w-full justify-between items-center pl-2">
                <div className="flex gap-x-3 items-center">
                  <section className="font-bold text-[14px]">
                    {state?.dateRange.from ? (
                      format(state?.dateRange.from, "MMM d, yyyy")
                    ) : (
                      <span>Select a date</span>
                    )}
                  </section>
                  <span>to</span>
                  <section className="font-bold text-[14px]">
                    {state?.dateRange.to ? (
                      format(state?.dateRange.to, "MMM d, yyyy")
                    ) : (
                      <span>Select a date</span>
                    )}
                  </section>
                </div>
                <CircleChevron open={calendarOpened} />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto max-h-133.75 overflow-scroll p-0 my-2.5 rounded-none flex flex-col items-center">
            <div className="w-9/10 flex flex-wrap py-5 justify-start md:justify-center gap-2">
              <Button
                className={`font-bold ${currentDatePreset == "All Data" ? "bg-(--fundblue) text-white hover:bg-(--fundblue)/90" : "bg-(--lightgray) text-black hover:bg-(--lightgray) hover:brightness-95"} cursor-pointer`}
                onClick={() => datePresets("All Data")}
              >
                All Data
              </Button>
              <Button
                className={`font-bold ${currentDatePreset == "Last 3 months" ? "bg-(--fundblue) text-white hover:bg-(--fundblue)/90" : "bg-(--lightgray) text-black hover:bg-(--lightgray) hover:brightness-95"} cursor-pointer`}
                onClick={() => datePresets("Last 3 months")}
              >
                Last 3 months
              </Button>
              <Button
                className={`font-bold ${currentDatePreset == "Last 6 months" ? "bg-(--fundblue) text-white hover:bg-(--fundblue)/90" : "bg-(--lightgray) text-black hover:bg-(--lightgray) hover:brightness-95"} cursor-pointer`}
                onClick={() => datePresets("Last 6 months")}
              >
                Last 6 months
              </Button>
              <Button
                className={`font-bold ${currentDatePreset == "Last Year" ? "bg-(--fundblue) text-white hover:bg-(--fundblue)/90" : "bg-(--lightgray) text-black hover:bg-(--lightgray) hover:brightness-95"} cursor-pointer`}
                onClick={() => datePresets("Last Year")}
              >
                Last Year
              </Button>
            </div>
            <Calendar
              mode="range"
              // open on the end of the period: its month on the right, the month before on the left
              defaultMonth={(() => {
                const end = temporaryDate.to ?? state?.dateRange.to ?? new Date();
                return new Date(end.getFullYear(), end.getMonth() - 1, 1);
              })()}
              selected={
                temporaryDate.from &&
                !temporaryDate.to &&
                hoverDate &&
                hoverDate > temporaryDate.from
                  ? { from: temporaryDate.from, to: hoverDate }
                  : temporaryDate
              }
              onSelect={(date) => {
                if (date) setTemporaryDate(date);
                if (date?.to) setHoverDate(undefined);
                setCurrentDatePreset("none");
              }}
              onDayMouseEnter={(day) => {
                // no range preview into the future
                if (temporaryDate.from && !temporaryDate.to && day < startOfTomorrow)
                  setHoverDate(day);
              }}
              onDayMouseLeave={() => setHoverDate(undefined)}
              numberOfMonths={2}
              // no future dates: days after today are disabled and you can't page past this month
              disabled={(date) => date < new Date("2019-01-01") || date >= startOfTomorrow}
              startMonth={new Date("2019-01-07")}
              endMonth={new Date()}
              captionLayout="dropdown"
            />
            <div className="w-4/10 flex py-5 justify-around gap-2">
              <Button
                className={`w-5/10 font-bold bg-(--fundblue) text-white hover:bg-(--fundblue)/90 cursor-pointer`}
                onClick={() => {
                  actions?.setDateRange(temporaryDate);
                  setCalendarOpened(false);
                }}
              >
                Apply
              </Button>
              <Button
                className={`w-5/10 font-bold bg-white text-(--fundblue) border-2 border-(--fundblue) hover:bg-(--fundblue) hover:text-white cursor-pointer`}
                onClick={() => {
                  setCalendarOpened(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );

  const queryCountryCoordinates = (iso3: string) => {
    const whereClause = `ISO3 IN ('${iso3}')`;
    const queryString = `where=${encodeURIComponent(whereClause)}`;
    const url =
      "https://services5.arcgis.com/QYf5PkPqzJKVzrmF/ArcGIS/rest/services/World_Countries_Sim/FeatureServer/0/query" +
      `?${queryString}`;

    fetch(url, {
      method: "POST",
      body: new URLSearchParams({
        outFields: "*",
        f: "json",
        maxRecordCountFactor: "5",
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        var lon = result.features[0].attributes.Longitude;
        var lat = result.features[0].attributes.Latitude;
        updateCountryCoordinates(lon, lat);
        return console.log(result);
      });

    // const result = await res.json();
    // var lon = result.features[0].attributes.Longitude;
    // var lat = result.features[0].attributes.Latitude;
    // updateCountryCoordinates(lon, lat);
  };

  function updateCountryCoordinates(lon: number, lat: number) {
    actions?.setCountryCoordinates({
      longitude: lon,
      latitude: lat,
    });
  }

  return (
    <div
      className={`grid ${location.pathname == "/home" ? "mt-10.5 grid-cols-[316px_1fr]" : "grid-cols-[1fr] xl:grid-cols-[200px_1fr]"} xl:h-14.75 fixed w-full top-0 z-3 ${dataOptions || menuOptions ? "" : "overflow-hidden h-14.75"} ${location.pathname == "/home" ? "overflow-visible" : ""} xl:h-[unset]`}
    >
      <div
        className={`${location.pathname == "/home" ? "ml-8" : ""} flex flex-col ${menuOptions ? "z-2 " : "-z-10 h-0 overflow-hidden"} ${location.pathname == "/home" ? "w-71" : "w-full xl:w-50"} ${location.pathname == "/home" ? "bg-(--fundblue)" : "bg-(--accentdarkblue-90)"} xl:bg-[unset] absolute shadow-xl/40`}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={`flex w-16.75 ${location.pathname == "/home" ? "h-16 bg-(--fundblue)" : "h-14.75 bg-(--accentdarkblue-90)"} justify-center items-center cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#234E90]`}
          onClick={() => setMenuOptions(!menuOptions)}
        >
          <div className="flex items-center flex-center">
            <CloseIcon color="white" />
          </div>
        </button>
        <div className={`pl-7 ${location.pathname == "/home" ? "bg-(--fundblue)" : "bg-(--accentdarkblue-90)"}`}>
          <Link
            to="/about"
            activeOptions={{ exact: true }}
            className="flex items-center w-full h-14.75 text-white cursor-pointer"
            onClick={() => setMenuOptions(false)}
          >
            About
          </Link>
          <Link
            to="/datamethodology"
            activeOptions={{ exact: true }}
            className="flex items-center w-full h-14.75 text-white cursor-pointer"
            onClick={() => setMenuOptions(false)}
          >
            Data & Methodology
          </Link>
          {state?.currentView == "Event tracking" ||
          state?.currentView == "Compare" ||
          state?.currentView == "Grid" ? (
            <button
              type="button"
              className="flex items-center w-full h-14.75 text-white cursor-pointer text-left outline-none underline-offset-4 focus-visible:underline"
              onClick={() => actions?.setDataExplainerState(true)}
            >
              Data Explainer
            </button>
          ) : null}
          <div className="flex items-center w-full h-14.75 text-gray-400 cursor-not-allowed">
            FAQs
          </div>
          <Link
            to="/team"
            activeOptions={{ exact: true }}
            className="flex items-center w-full h-14.75 text-white cursor-pointer"
            onClick={() => setMenuOptions(false)}
          >
            Team & Contact Us
          </Link>
        </div>
      </div>
      {location.pathname == "/home" ? (
        <div className="ml-8 flex">
          <div className={`flex h-16 shadow-[0_4px_10.4px_0_rgba(0,0,0,0.50)]`}>
            <button
              type="button"
              aria-label="Open menu"
              className="flex cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#234E90]"
              onClick={() => setMenuOptions(!menuOptions)}
            >
              <div className="flex h-16 w-full">
                <div className="relative flex items-center rounded-none h-full w-17.5 border-r bg-(--fundblue) text-white">
                  <img className="absolute right-4" src={Hamburger}></img>
                  <div className="absolute text-[11px] top-8.5 right-6.5 font-bold">
                    MENU
                  </div>
                </div>
              </div>
            </button>
          </div>
          <Link
            to="/home"
            activeOptions={{ exact: true }}
            className="z-10 w-60 rounded-none flex items-center justify-center bg-(--accentdarkblue-90) border-none"
          >
            <img className="px-9 py-6.25" src={Lockup}></img>
          </Link>
        </div>
      ) : (
        <div
          className={`flex w-full xl:w-50 justify-between xl:justify-start bg-(--fundblue) ${dataOptions ? "h-0" : "h-14.75"} overflow-hidden xl:h-14.75`}
        >
          <button
            type="button"
            aria-label="Open menu"
            className="flex cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#234E90]"
            onClick={() => setMenuOptions(!menuOptions)}
          >
            <div className="flex h-14.75 w-35 lg:w-auto">
              <div className="relative flex pl-2 items-center justify-start rounded-none h-full w-40 xl:w-16.75 bg-(--fundblue) xl:bg-(--accentdarkblue-90) text-white">
                <img className="absolute pl-3.5" src={Hamburger}></img>
                <div className="absolute text-[11px] top-8.5  font-bold">
                  MENU
                </div>
              </div>
            </div>
          </button>
          <Link
            to="/home"
            activeOptions={{ exact: true }}
            className="rounded-none w-30 lg:mx-3 flex flex-row items-center justify-center font-semibold bg-(--fundblue) text-white border-none"
          >
            <img src={Lockup}></img>
          </Link>
          <div
            className={`flex items-center w-35 xl:w-0 xl:h-0 overflow-hidden justify-center cursor-pointer bg-(--fundblue) rounded-none border-0 border-none`}
          >
            <button
              type="button"
              className="h-7/10 flex w-9/10 items-center justify-evenly rounded-lg bg-(--lightblue) cursor-pointer outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#234E90]"
              onClick={() => setDataOptions(true)}
            >
              <DataOptionsIcon />
              <div className="text-[12px] text-left font-bold w-15 h-7.5 leading-3.75 text-(--accentdarkblue-100)">
                DATA OPTIONS
              </div>
            </button>
          </div>
        </div>
      )}
      {location.pathname == "/home" ? (
        <div className="invisible md:visible w-full flex items-center justify-end">
          <div className="mr-8">
            {mapButton(
              "bg-(--fundblue)", // shadow comes from mapButton's shared pill style
              "text-white",
              <GlobeIcon color={"var(--primarywhite)"} />,
              <ArrowRight color={"var(--primarywhite)"} />,
              "/events",
            )}
          </div>
        </div>
      ) : (
        <div
          className={`w-full xl:h-14.75 grid grid-cols-[1fr_1fr_50px] ${isEvents ? "xl:grid-cols-[180px_600px_245px_0px_1fr]" : isForward ? "xl:grid-cols-[180px_0px_300px_600px_1fr]" : "xl:grid-cols-[180px_0px_360px_0px_1fr]"} xl:col-start-2 xl:col-end-3`}
        >
          <div className="flex w-full xl:w-auto xl:ml-1 xl:col-start-1 xl:col-end-2">
            <Card
              className={cn(
                `relative z-1 rounded-none p-0 flex flex-col items-center justify-center w-full gap-0 hover:bg-white transition-colors duration-300 ease-out ${isEvents ? "bg-white" : "bg-(--lightblue)"} border-0`,
                tabEdge,
              )}
            >
              <div className="h-full w-full flex flex-col justify-end">
                <div className="text-[11px] font-bold text-(--primaryblack-90)">
                  REAL-TIME
                </div>
                <Link
                  to="/events"
                  activeOptions={{ exact: true }}
                  className={`group flex flex-row h-[35px] items-center justify-center cursor-pointer outline-none transition-colors duration-300 ease-out ${isEvents ? "text-(--orange)" : "text-black"}`}
                >
                  {/* icon is currentColor, so it fades together with the label */}
                  <EventTrackingIcon />
                  <div className="text-sm font-bold text-end flex items-center pl-1 underline-offset-4 group-focus-visible:underline">
                    Event Tracking
                  </div>
                </Link>
              </div>
              <div
                className={`h-1 w-full bg-(--orange) origin-center transition-[opacity,transform] duration-300 ease-out ${isEvents ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
              ></div>
            </Card>
          </div>
          <div
            inert={!isEvents}
            className={`${isEvents ? "flex" : "hidden xl:flex"} ${dataOptions ? "h-full" : "h-0"} xl:h-auto w-full min-w-0 overflow-hidden xl:overflow-visible ${sliding || !isEvents ? "xl:[clip-path:inset(0_-100vw_0_0)]" : ""} col-start-1 col-end-4 xl:col-start-2 xl:col-end-3`}
          >
            <div
              className={`flex flex-col xl:flex-row w-full xl:w-150 xl:shrink-0 ${slide} ${isEvents ? "xl:translate-none" : "xl:-translate-x-full"}`}
            >
              {calendarComponent}
              <Card className="rounded-none border-r-0 p-0 flex flex-col items-center justify-center gap-0 h-22 xl:h-14.75 w-full px-2">
                <Popover
                  open={eventFilterOpened}
                  onOpenChange={setEventFilterOpened}
                >
                  <PopoverTrigger asChild>
                    <button type="button" className="flex flex-row items-center w-95/100 h-full justify-between cursor-pointer text-left outline-none underline-offset-4 focus-visible:underline">
                      <div className="text-[14px] font-bold text-end flex items-center pl-2">
                        {eventTypes[state?.eventFilter].type}
                      </div>
                      <CircleChevron open={eventFilterOpened} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-0 my-1.25 rounded-none shadow-[0_-10px_10px_-5px_rgba(0,0,0,0.1)]">
                    <OptionList
                      label="Event type"
                      value={state?.eventFilter ?? "AL"}
                      options={Object.entries(eventTypes).map(([x, y]) => ({
                        value: x,
                        label: y.type,
                        // "All Events" gets a neutral grey ring so every row lines up
                        icon: <EventTypeIcon color={y.color || "#9B9B9B"} />,
                      }))}
                      onSelect={(x) => {
                        actions?.setEventFilter(x);
                        setEventFilterOpened(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Card>
              <Card className="rounded-none p-0 flex flex-col items-center justify-center gap-0 h-22 xl:h-14.75 w-full px-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-95/100 p-0 pl-2 font-bold justify-between light border-0 shadow-none hover:bg-white cursor-pointer"
                    >
                      <div className="max-w-25 overflow-hidden">
                        {state?.countryFilter == "All countries"
                          ? "All countries"
                          : countryByIso3[iso3]}
                      </div>
                      <CircleChevron open={open} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-0 mt-4 light rounded-none">
                    <Command>
                      <CommandInput
                        placeholder="Search country..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>Country not found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            className="data-[selected=true]:bg-neutral-200 text-left"
                            key="all"
                            value="All countries"
                            onSelect={() => {
                              setOpen(false);
                              setIso3("");
                              actions?.setCountryFilter("All countries");
                            }}
                          >
                            All countries
                            <Check
                              className={cn(
                                "ml-auto",
                                state?.countryFilter === "All countries"
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                          {isoCountries
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((country) => (
                              <CommandItem
                                className="data-[selected=true]:bg-neutral-200 text-left"
                                key={country.iso3}
                                value={country.name}
                                onSelect={() => {
                                  setOpen(false);
                                  setIso3(country.iso3);
                                  actions?.setCountryFilter(country.iso3);
                                  queryCountryCoordinates(country.iso3);
                                }}
                              >
                                {country.name}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    iso3 === country.iso3
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Card>
            </div>
          </div>
          <div
            ref={flTabRef}
            className={cn(
              `relative z-1 xl:ml-1 w-full xl:w-auto h-14.75 flex col-start-2 row-start-1 border-r xl:col-start-3 xl:col-end-4`,
              tabEdge,
            )}
          >
            <Card
              className={`shadow-none rounded-none xl:grow p-0 w-full h-full flex flex-col items-center justify-end gap-0 hover:bg-white transition-colors duration-300 ease-out ${isForward ? "bg-white" : "bg-(--lightblue)"} border-0`}
            >
              <div className="text-[11px] font-bold text-(--primaryblack-90)">
                FORWARD LOOKING
              </div>
              <div className="flex flex-end flex-col w-full">
                <div className="flex flex-row justify-evenly items-start h-full">
                  <Link
                    to="/compare"
                    activeOptions={{ exact: true }}
                    className="group flex flex-col justify-end cursor-pointer w-full outline-none"
                  >
                    <div
                      className={`flex flex-row h-8.75 items-center justify-center transition-colors duration-300 ease-out ${location.pathname === "/compare" ? "text-(--orange)" : "text-black"}`}
                    >
                      <CompareIcon />
                      <div className="text-sm font-bold text-end flex items-center pr-0.5 pl-1 underline-offset-4 group-focus-visible:underline">
                        Compare
                      </div>
                    </div>
                    <div
                      className={`h-1 bg-(--orange) origin-center transition-[opacity,transform] duration-300 ease-out ${location.pathname === "/compare" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
                    ></div>
                  </Link>
                  <div className="h-full flex items-center">
                    <div
                      className={`w-0.5 h-65/100 transition-colors duration-300 ease-out ${isForward ? "bg-(--primarygray-30)" : "bg-(--accentblue-60)"}`}
                    ></div>
                  </div>
                  <Link
                    to="/grid"
                    activeOptions={{ exact: true }}
                    className="group flex flex-col justify-end cursor-pointer w-full outline-none"
                  >
                    <div
                      className={`flex flex-row h-8.75 items-center justify-center transition-colors duration-300 ease-out ${location.pathname === "/grid" ? "text-(--orange)" : "text-black"}`}
                    >
                      <GridIcon />
                      <div className="text-sm font-bold text-end flex items-center pl-1 pr-0.5 underline-offset-4 group-focus-visible:underline">
                        Grid
                      </div>
                    </div>
                    <div
                      className={`h-1 bg-(--orange) origin-center transition-[opacity,transform] duration-300 ease-out ${location.pathname === "/grid" ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
                    ></div>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          <button
            type="button"
            aria-label="Close data options"
            className="bg-(--lightblue) hover:bg-white w-full h-full col-start-3 row-start-1 flex justify-center items-center cursor-pointer xl:h-0 xl:w-0 xl:hidden outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#234E90]"
            onClick={() => setDataOptions(false)}
          >
            <div className=" flex items-center flex-center">
              <CloseIcon color="black" />
            </div>
          </button>
          <div
            ref={flFiltersRef}
            inert={!isForward}
            className={`isolate ${isForward ? "flex" : "hidden xl:flex"} ${dataOptions ? "h-full" : "h-0"} xl:h-14.75 min-w-0 overflow-hidden xl:overflow-visible ${sliding || !isForward ? "xl:[clip-path:inset(0_-100vw_0_0)]" : ""} w-full col-start-1 col-end-4 xl:col-start-4 xl:col-end-5`}
          >
            <div
              className={`flex flex-col xl:flex-row w-full xl:w-150 xl:shrink-0 ${slide} ${isForward ? "xl:translate-none" : "xl:-translate-x-full"}`}
            >
              <Card
                id="hazardExposure"
                className="shadow-none rounded-none border-0 p-0 z-100 flex flex-col h-22 xl:h-auto xl:w-60 px-2 items-center justify-center gap-0 "
              >
                <div className="w-95/100 border-b-2">
                  <Popover open={riskOpened} onOpenChange={handleOpenChange}>
                    <PopoverTrigger asChild>
                      <button type="button" className="flex flex-row items-center justify-between w-95/100 h-14.75 text-left outline-none underline-offset-4 focus-visible:underline">
                        <div className="flex items-center justify-start cursor-pointer">
                          <HazardIcon />
                          <div className="flex flex-col items-start pl-2">
                            <div className="text-[14px] font-bold text-end flex items-center">
                              {state?.currentHazard}
                            </div>
                            <div className="w-28.75 h-0.5 bg-gray-300"></div>
                            <div className="text-[14px] font-bold text-end flex items-center">
                              {state?.currentExposure}
                            </div>
                          </div>
                        </div>
                        <CircleChevron open={riskOpened} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-75 p-0 py-5 my-1.25 rounded-none shadow-[0_-10px_10px_-5px_rgba(0,0,0,0.1)]">
                      <div className="mx-3">
                        <ItemGroup>
                          {Object.entries(urlObject).map(([key, value]) => {
                            return (
                              <Item
                                key={key}
                                className={`cursor-pointer my-1 items-center ${riskState === key ? " " : ""} transition-all hover:duration-50 duration-200 ease-in`}
                                onClick={() => setRiskState(key)}
                              >
                                <ItemContent>
                                  <div className="flex items-center">
                                    <ItemHeader
                                      className={`${riskState === key ? "font-bold" : "font-medium"} text-[16px]`}
                                    >
                                      {key}
                                    </ItemHeader>
                                    <SmallChevron open={riskState === key} />
                                  </div>
                                  <div
                                    className={`${riskState === key ? `ml-7` : "h-0 hidden"}`}
                                  >
                                    {Object.entries(value).map(([a, b]) => (
                                      <Item
                                        key={a}
                                        className={`cursor-pointer my-2 py-1.75 pl-0 ${state?.currentExposure == a && riskState == state?.currentHazard ? "font-extrabold text-(--orange) underline underline-offset-1.25 decoration-0.5" : "font-medium"}`}
                                        onClick={() => {
                                          () => setRiskState(key);
                                          swapTable(
                                            key,
                                            a,
                                            {
                                              name: "",
                                              threshold: Object.keys(
                                                b.threshold?.group || {},
                                              )[0],
                                            },
                                            {
                                              id: b.measure[0],
                                              name: measureMapper[b.measure[0]],
                                            },
                                            state?.currentScenario,
                                          );
                                        }}
                                      >
                                        <ItemContent>
                                          <ItemHeader>{a}</ItemHeader>
                                        </ItemContent>
                                      </Item>
                                    ))}
                                  </div>
                                </ItemContent>
                              </Item>
                            );
                          })}
                        </ItemGroup>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </Card>
              <Card
                id="scenario"
                className="w-full border-0 border-l border-r shadow-none rounded-none p-0 flex flex-row h-22 xl:h-auto xl:w-90 items-center justify-center gap-0 px-2"
              >
                <div className="w-95/100 xl:w-100 flex bg-white">
                  <div
                    id="timePeriods"
                    className="h-22 xl:h-auto w-full flex justify-center items-center px-2"
                  >
                    <div className="w-full flex gap-0.5">
                      {timePeriods.map((x) => (
                        <div className="flex flex-col">
                          <div
                            className={`cursor-pointer min-w-[47px] max-w-[80px] h-[25px] px-1 flex justify-center items-center ${state?.currentTime == x.year ? "bg-white" : "bg-[#DFDFDF]"}`}
                            onClick={() => actions?.setTime(x.year)}
                          >
                            <div className="font-bold text-xs">{x.period}</div>
                          </div>
                          <div
                            className={` h-1 ${state?.currentTime == x.year ? "bg-[#ff8200]" : "bg-[#BABABA]"} `}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-95/100">
                  <Popover
                    open={scenarioOpened}
                    onOpenChange={setScenarioOpened}
                  >
                    <PopoverTrigger asChild>
                      <button type="button" className="flex flex-row items-center w-full h-14.75 justify-around cursor-pointer text-left outline-none underline-offset-4 focus-visible:underline">
                        <div className="flex h-full items-center">
                          <div
                            className="border-[#9B9B9B] border h-5/10"
                            id="divider"
                          ></div>
                          <div className="text-[14px] w-20 font-bold text-end flex items-center pl-2">
                            {scenarioMapper[state?.currentScenario]}
                          </div>
                        </div>
                        <CircleChevron open={scenarioOpened} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56.25 p-0 my-1.25 rounded-none shadow-[0_-10px_10px_-5px_rgba(0,0,0,0.1)]">
                      <OptionList
                        label="Climate scenario"
                        value={state?.currentScenario ?? ""}
                        options={urlObject[state?.currentHazard][
                          state?.currentExposure
                        ].scenarios.map((x) => ({ value: x, label: scenarioMapper[x] }))}
                        onSelect={(x) => {
                          actions?.setScenario(x);
                          setScenarioOpened(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </Card>
            </div>
          </div>
          <div
            ref={explainerRef}
            className={`overflow-hidden h-0 w-0 xl:h-auto xl:w-full flex justify-start xl:col-start-5`}
          >
            <button
              type="button"
              // outline always (so it reads as a box on white); shadow only on the map pages, like the tabs
              // keyboard focus underlines the label (parent is overflow-hidden, so an outline would be clipped)
              className={cn(
                "group flex flex-col items-center justify-center ml-1 xl:z-3 w-18.25 gap-y-1 cursor-pointer bg-(--lightblue) hover:bg-white transition-colors duration-200 outline-none",
                tabOutline,
                !lightPage && tabShadow,
              )}
              onClick={() => {
                actions?.setDataExplainerState(true);
              }}
            >
              <DataExplainerIcon />
              <span className="font-bold text-black text-xs text-base/5 underline-offset-4 group-focus-visible:underline">
                Data Explainer
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
