import React from "react";
import { useEffect, useState, useContext } from "react";
import { useRouterState, Link } from "@tanstack/react-router";

import { AppStateContext, AppActionsContext } from "../app";

import DataIcon from "../assets/data_icon.svg";

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
  DataOptionsIcon,
  EventTrackingIcon,
  EventTypeIcon,
  GridIcon,
  HazardIcon,
  SmallChevron,
} from "../assets/NavIcons";


export const Header = () => {
  const location = useRouterState({ select: (s) => s.location });

  // On white pages the tab shadows smudge into the 4px gaps, so use a thin outline there instead
  const lightPage = ["/team", "/about", "/datamethodology"].includes(location.pathname);
  const tabShadow = "shadow-[2px_2px_8px_0_rgba(0,0,0,0.25)]";
  const tabOutline = "border border-[#C9D6EA]";
  const tabEdge = lightPage ? tabOutline : tabShadow;

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

  const date = new Date();
  const allData = new Date("2019-01-07");
  const threeMonthsAgo = new Date(date.setMonth(date.getMonth() - 3));
  const sixMonthsAgo = new Date(date.setMonth(date.getMonth() - 6));
  const twelveMonthsAgo = new Date(date.setMonth(date.getMonth() - 12));

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
            <div className="flex flex-row items-center w-95/100 h-full xl:h-14.75 justify-between cursor-pointer">
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
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto max-h-133.75 overflow-scroll p-0 my-2.5 rounded-none flex flex-col items-center">
            <div className="w-9/10 flex flex-wrap py-5 justify-start md:justify-center gap-2">
              <Button
                className={`font-bold ${currentDatePreset == "All Data" ? "bg-(--accentblue-100)" : "bg-(--primarygray-40) text-black hover:text-white"} cursor-pointer`}
                onClick={() => datePresets("All Data")}
              >
                All Data
              </Button>
              <Button
                className={`font-bold ${currentDatePreset == "Last 3 months" ? "bg-(--accentblue-100)" : "bg-(--primarygray-40) text-black hover:text-white"} cursor-pointer`}
                onClick={() => datePresets("Last 3 months")}
              >
                Last 3 months
              </Button>
              <Button
                className={`font-bold ${currentDatePreset == "Last 6 months" ? "bg-(--accentblue-100)" : "bg-(--primarygray-40) text-black hover:text-white"} cursor-pointer`}
                onClick={() => datePresets("Last 6 months")}
              >
                Last 6 months
              </Button>
              <Button
                className={`font-bold ${currentDatePreset == "Last Year" ? "bg-(--accentblue-100)" : "bg-(--primarygray-40) text-black hover:text-white"} cursor-pointer`}
                onClick={() => datePresets("Last Year")}
              >
                Last Year
              </Button>
            </div>
            <Calendar
              mode="range"
              defaultMonth={state?.dateRange.from}
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
                if (temporaryDate.from && !temporaryDate.to) setHoverDate(day);
              }}
              onDayMouseLeave={() => setHoverDate(undefined)}
              numberOfMonths={2}
              disabled={(date) => date < new Date("2019-01-01")}
              startMonth={new Date("2019-01-07")}
              captionLayout="dropdown"
            />
            <div className="w-4/10 flex py-5 justify-around gap-2">
              <Button
                className={`w-5/10 font-bold bg-(--accentblue-100) cursor-pointer`}
                onClick={() => {
                  actions?.setDateRange(temporaryDate);
                  setCalendarOpened(false);
                }}
              >
                Apply
              </Button>
              <Button
                className={`w-5/10 font-bold bg-white text-(--accentblue-100) hover:text-white hover:border-0 border-2 border-(--accentblue-100) cursor-pointer`}
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
        className={`${location.pathname == "/home" ? "ml-8" : ""} flex flex-col ${menuOptions ? "z-2 " : "-z-10 h-0 overflow-hidden"} ${location.pathname == "/home" ? "w-71" : "w-full xl:w-50"} bg-(--accentdarkblue-90) xl:bg-[unset] absolute shadow-xl/40`}
      >
        <div
          className={`flex w-16.75 ${location.pathname == "/home" ? "h-16" : "h-14.75"} justify-center items-center bg-(--accentdarkblue-90) cursor-pointer`}
          onClick={() => setMenuOptions(!menuOptions)}
        >
          <div className="flex items-center flex-center">
            <CloseIcon color="white" />
          </div>
        </div>
        <div className="pl-7 bg-(--accentdarkblue-90)">
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
            <div
              className="flex items-center w-full h-14.75 text-white cursor-pointer"
              onClick={() => actions?.setDataExplainerState(true)}
            >
              Data Explainer
            </div>
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
            <div
              className="flex cursor-pointer"
              onClick={() => setMenuOptions(!menuOptions)}
            >
              <div className="flex h-16 w-full">
                <div className="relative flex items-center rounded-none h-full w-17.5 border-r bg-(--accentdarkblue-90) xl:bg-(--accentdarkblue-90) text-white">
                  <img className="absolute right-4" src={Hamburger}></img>
                  <div className="absolute text-[11px] top-8.5 right-6.5 font-bold">
                    MENU
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/home"
            activeOptions={{ exact: true }}
            className="z-10 w-60 rounded-none flex items-center justify-center bg-(--fundblue) border-none"
          >
            <img className="px-9 py-6.25" src={Lockup}></img>
          </Link>
        </div>
      ) : (
        <div
          className={`flex w-full xl:w-50 justify-between xl:justify-start bg-(--fundblue) ${dataOptions ? "h-0" : "h-14.75"} overflow-hidden xl:h-14.75`}
        >
          <div
            className="flex cursor-pointer"
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
          </div>
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
            <div
              className="h-7/10 flex w-9/10 items-center justify-evenly rounded-lg bg-(--accentblue-30)"
              onClick={() => setDataOptions(true)}
            >
              <DataOptionsIcon />
              <div className="text-[12px] text-left font-bold w-15 h-7.5 leading-3.75 text-(--accentdarkblue-100)">
                DATA OPTIONS
              </div>
            </div>
          </div>
        </div>
      )}
      {location.pathname == "/home" ? (
        <div className="invisible md:visible w-full flex items-center justify-end">
          <div className="rounded-[100px] mr-8 h-15 shadow-[0_4px_6.5px_0_rgba(0,0,0,0.50)]">
            {mapButton(
              "bg-(--accentdarkblue-90)",
              "text-white",
              <GlobeIcon color={"var(--primarywhite)"} />,
              <ArrowRight color={"var(--primarywhite)"} />,
              "/events",
            )}
          </div>
        </div>
      ) : (
        <div
          className={`w-full xl:h-14.75 grid grid-cols-[1fr_1fr_50px] ${location.pathname === "/compare" || location.pathname === "/grid" ? "xl:grid-cols-[180px_300px_600px_1fr]" : location.pathname == "/events" ? "xl:grid-cols-[180px_600px_245px_1fr]" : "xl:grid-cols-[180px_360px_1fr]"}  xl:col-start-2 xl:col-end-3`}
        >
          <div className="flex w-full xl:w-auto xl:ml-1 xl:col-start-1 xl:col-end-2">
            <Card
              className={cn(
                `relative z-1 rounded-none p-0 flex flex-col items-center justify-center w-full gap-0 hover:bg-white transition-colors duration-200 ${location.pathname == "/events" ? "bg-white" : "bg-(--accentblue-30)"} border-0`,
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
                  className="flex flex-row h-[35px] items-center justify-center cursor-pointer"
                >
                  <EventTrackingIcon
                    color={location.pathname == "/events" ? "var(--orange)" : "black"}
                  />
                  <div
                    className={`text-sm font-bold text-end flex items-center pl-1 ${location.pathname == "/events" ? "text-(--orange)" : "text-black"}`}
                  >
                    Event Tracking
                  </div>
                </Link>
              </div>
              <div
                className={`h-1 w-full bg-(--orange) ${location.pathname == "/events" ? "opacity-100" : "opacity-0"}`}
              ></div>
            </Card>
          </div>
          {location.pathname == "/events" ? (
            <div
              className={`flex flex-col xl:flex-row ${dataOptions ? "h-full" : "h-0"} w-full col-start-1 col-end-4 xl:col-start-2 xl:col-end-3 `}
            >
              {calendarComponent}
              <Card className="rounded-none border-r-0 p-0 flex flex-col items-center justify-center gap-0 h-22 xl:h-14.75 w-full px-2">
                <Popover
                  open={eventFilterOpened}
                  onOpenChange={() => setEventFilterOpened(!eventFilterOpened)}
                >
                  <PopoverTrigger asChild>
                    <div className="flex flex-row items-center w-95/100 h-full justify-between cursor-pointer">
                      <div className="text-[14px] font-bold text-end flex items-center pl-2">
                        {eventTypes[state?.eventFilter].type}
                      </div>
                      <CircleChevron open={eventFilterOpened} />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56.25 p-0 py-2 my-1.25 rounded-none shadow-[0_-10px_10px_-5px_rgba(0,0,0,0.1)]">
                    <div
                      className={`flex flex-row justify-center h-[calc(80px*${urlObject[state?.currentHazard][state?.currentExposure].scenarios.length})]`}
                    >
                      <ItemGroup>
                        {Object.entries(eventTypes).map(([x, y]) => (
                          <div className="flex items-center">
                            {/* <div
                              className="flex justify-center border-1 rounded-full w-4 h-4"
                              style={{ borderColor: eventTypes[x].color }}
                            >
                              <div className="flex items-center justify-center">
                                <div
                                  className="rounded-sm w-1.75 h-1.75"
                                  style={{ background: eventTypes[x].color }}
                                ></div>
                              </div>
                            </div> */}
                            <EventTypeIcon color={eventTypes[x].color} />
                            <Item
                              key={x}
                              className={`cursor-pointer py-3 ${eventTypes[state?.eventFilter].type === eventTypes[x].type ? "font-bold text-(--orange) underline underline-offset-1.25 decoration-0.5" : ""} transition-all duration-200 ease-in`}
                              onClick={() => actions?.setEventFilter(x)}
                            >
                              {eventTypes[x].type}
                            </Item>
                          </div>
                        ))}
                      </ItemGroup>
                    </div>
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
          ) : null}
          <div
            className={cn(
              `relative z-1 xl:ml-1 w-full xl:w-auto h-14.75 flex col-start-2 row-start-1 border-r ${location.pathname == "/compare" || location.pathname == "/grid" ? "xl:col-start-2 xl:col-end-3" : location.pathname == "/events" ? "xl:col-start-3 xl:col-end-4" : "xl:col-start-2 xl:col-end-3"}`,
              tabEdge,
            )}
          >
            <Card
              className={`shadow-none rounded-none xl:grow p-0 w-full h-full flex flex-col items-center justify-end gap-0 hover:bg-white transition-colors duration-200 ${location.pathname == "/compare" || location.pathname == "/grid" ? "bg-white" : "bg-(--accentblue-30)"} border-0`}
            >
              <div className="text-[11px] font-bold text-(--primaryblack-90)">
                FORWARD LOOKING
              </div>
              <div className="flex flex-end flex-col w-full">
                <div className="flex flex-row justify-evenly items-start h-full">
                  <Link
                    to="/compare"
                    activeOptions={{ exact: true }}
                    className="flex flex-col justify-end cursor-pointer w-full"
                  >
                    <div className="flex flex-row h-8.75 items-center justify-center">
                      <CompareIcon color={location.pathname === "/compare" ? "var(--orange)" : "black"} />
                      <div
                        className={`text-sm ${location.pathname === "/compare" ? "text-(--orange)" : "text-black"} font-bold text-end flex items-center pr-0.5 pl-1`}
                      >
                        Compare
                      </div>
                    </div>
                    <div
                      className={`h-1 bg-(--orange) ${location.pathname === "/compare" ? "opacity-100" : "opacity-0"}`}
                    ></div>
                  </Link>
                  <div className="h-full flex items-center">
                    <div
                      className={`w-0.5 h-65/100 ${location.pathname === "/compare" || location.pathname === "/grid" ? "bg-(--primarygray-30)" : "bg-(--accentblue-60)"}`}
                    ></div>
                  </div>
                  <Link
                    to="/grid"
                    activeOptions={{ exact: true }}
                    className="flex flex-col justify-end cursor-pointer w-full"
                  >
                    <div className="flex flex-row h-8.75 items-center justify-center">
                      <GridIcon color={location.pathname === "/grid" ? "var(--orange)" : "black"} />
                      <div
                        className={`text-sm ${location.pathname === "/grid" ? "text-(--orange)" : "text-black"} font-bold text-end flex items-center pl-1 pr-0.5`}
                      >
                        Grid
                      </div>
                    </div>
                    <div
                      className={`h-1 bg-(--orange) ${location.pathname === "/grid" ? "opacity-100" : "opacity-0"}`}
                    ></div>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
          <div
            className="bg-(--accentblue-30) hover:bg-white w-full h-full col-start-3 row-start-1 flex justify-center items-center cursor-pointer xl:h-0 xl:w-0 xl:hidden"
            onClick={() => setDataOptions(false)}
          >
            <div className=" flex items-center flex-center">
              <CloseIcon color="black" />
            </div>
          </div>
          {location.pathname === "/compare" || location.pathname === "/grid" ? (
            <div
              className={`isolate flex flex-col xl:flex-row xl:w-auto ${dataOptions ? "h-full" : "h-0"} xl:h-14.75 overflow-hidden w-full col-start-1 col-end-4 xl:col-start-3 xl:col-end-4 `}
            >
              <Card
                id="hazardExposure"
                className="shadow-none rounded-none border-0 p-0 z-100 flex flex-col h-22 xl:h-auto xl:w-60 px-2 items-center justify-center gap-0 "
              >
                <div className="w-95/100 border-b-2">
                  <Popover open={riskOpened} onOpenChange={handleOpenChange}>
                    <PopoverTrigger asChild>
                      <div className="flex flex-row items-center justify-between w-95/100 h-14.75">
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
                      </div>
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
                    onOpenChange={() => setScenarioOpened(!scenarioOpened)}
                  >
                    <PopoverTrigger asChild>
                      <div className="flex flex-row items-center w-full h-14.75 justify-around cursor-pointer">
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
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-56.25 p-0 my-1.25 rounded-none shadow-[0_-10px_10px_-5px_rgba(0,0,0,0.1)]">
                      <div
                        className={`flex flex-row justify-center py-2.5 h-[calc(80px*${urlObject[state?.currentHazard][state?.currentExposure].scenarios.length})]`}
                      >
                        <ItemGroup>
                          {urlObject[state?.currentHazard][
                            state?.currentExposure
                          ].scenarios.map((x) => (
                            <Item
                              key={x}
                              className={`cursor-pointer my-2 ${scenarioMapper[state?.currentScenario] === scenarioMapper[x] ? "font-bold text-(--orange) underline underline-offset-1.25 decoration-0.5" : ""} transition-all duration-200 ease-in`}
                              onClick={() => actions?.setScenario(x)}
                            >
                              <ItemContent>
                                <ItemHeader
                                  onClick={() => actions?.setScenario(x)}
                                >
                                  {scenarioMapper[x]}
                                </ItemHeader>
                              </ItemContent>
                            </Item>
                          ))}
                        </ItemGroup>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </Card>
            </div>
          ) : null}
          <div
            className={`overflow-hidden h-0 w-0 xl:h-auto xl:w-full flex justify-start`}
          >
            <div
              // outline always (so it reads as a box on white); shadow only on the map pages, like the tabs
              className={cn(
                "flex flex-col items-center justify-center ml-1 xl:z-3 w-18.25 gap-y-1 cursor-pointer bg-white",
                tabOutline,
                !lightPage && tabShadow,
              )}
              onClick={() => {
                actions?.setDataExplainerState(true);
              }}
            >
              <img src={DataIcon} width={15}></img>
              <span className="font-bold text-black text-xs text-base/5">
                Data Explainer
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
