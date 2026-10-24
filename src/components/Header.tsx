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
import DropdownArrow from "../assets/Dropdown-arrow.svg";

import { mapButton } from "../routes/home";
import { GlobeIcon } from "../assets/GlobeIcon";
import { ArrowRight } from "../assets/arrow-right";

export const Header = () => {
  const location = useRouterState({ select: (s) => s.location });

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
                <img
                  src={DropdownArrow}
                  className={`${calendarOpened ? "rotate-180" : "rotate-0"}`}
                ></img>
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.390625 1.67969C0 1.32812 0 0.703125 0.390625 0.351562C0.742188 0 1.32812 0 1.67969 0.351562L7.57812 6.25L13.4766 0.351562C13.8672 0 14.4531 0 14.8047 0.351562C15.1953 0.742188 15.1953 1.32812 14.8047 1.67969L8.90625 7.57812L14.8047 13.4766C15.1953 13.8281 15.1953 14.4531 14.8047 14.8047C14.4531 15.1562 13.8672 15.1562 13.4766 14.8047L7.57812 8.90625L1.67969 14.8047C1.32812 15.1562 0.742188 15.1562 0.390625 14.8047C0 14.4531 0 13.8281 0.390625 13.4766L6.28906 7.57812L0.390625 1.67969Z"
                fill="white"
              />
            </svg>
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
          <div className="flex items-center w-full h-14.75 text-gray-400 cursor-not-allowed">
            Team & Contact us
          </div>
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
              <svg
                width="26"
                height="23"
                viewBox="0 0 26 23"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.796233 -2.8491e-05C1.24411 -2.8491e-05 1.59247 0.348323 1.59247 0.796204V18.3133C1.59247 19.657 2.68729 20.702 3.98116 20.702H24.6832C25.1311 20.702 25.4795 21.0504 25.4795 21.4983C25.4795 21.9461 25.1311 22.2945 24.6832 22.2945H3.98116C1.79152 22.2945 0 20.503 0 18.3133V0.796204C0 0.348323 0.348352 -2.8491e-05 0.796233 -2.8491e-05ZM14.7303 4.77737C14.5313 4.77737 14.3322 4.97643 14.3322 5.17549V9.15665C14.3322 9.35571 14.5313 9.55477 14.7303 9.55477H15.5265C15.7256 9.55477 15.9247 9.35571 15.9247 9.15665V5.17549C15.9247 4.97643 15.7256 4.77737 15.5265 4.77737H14.7303ZM14.3322 3.1849V0.796204C14.3322 0.348323 14.6805 -2.8491e-05 15.1284 -2.8491e-05C15.5763 -2.8491e-05 15.9247 0.348323 15.9247 0.796204V3.1849V3.23467C16.8204 3.43373 17.5171 4.22996 17.5171 5.17549V9.15665C17.5171 10.1022 16.8204 10.9482 15.9247 11.0975C15.9247 11.1472 15.9247 11.1472 15.9247 11.1472V13.5359C15.9247 13.9838 15.5763 14.3322 15.1284 14.3322C14.6805 14.3322 14.3322 13.9838 14.3322 13.5359V11.1472C14.3322 11.1472 14.3322 11.1472 14.3322 11.0975C13.4364 10.9482 12.7397 10.1022 12.7397 9.15665V5.17549C12.7397 4.22996 13.4364 3.43373 14.3322 3.23467V3.1849ZM22.2945 9.95288V12.3416C22.2945 12.5406 22.4936 12.7397 22.6926 12.7397H23.4889C23.6879 12.7397 23.887 12.5406 23.887 12.3416V9.95288C23.887 9.75382 23.6879 9.55477 23.4889 9.55477H22.6926C22.4936 9.55477 22.2945 9.75382 22.2945 9.95288ZM22.2945 8.01206V7.9623V5.5736C22.2945 5.12572 22.6429 4.77737 23.0908 4.77737C23.5386 4.77737 23.887 5.12572 23.887 5.5736V7.9623V8.01206C24.7827 8.21112 25.4795 9.00736 25.4795 9.95288V12.3416C25.4795 13.2871 24.7827 14.1331 23.887 14.2824C23.887 14.3322 23.887 14.3322 23.887 14.3322V16.7209C23.887 17.1687 23.5386 17.5171 23.0908 17.5171C22.6429 17.5171 22.2945 17.1687 22.2945 16.7209V14.3322C22.2945 14.3322 22.2945 14.3322 22.2945 14.2824C21.3988 14.1331 20.7021 13.2871 20.7021 12.3416V9.95288C20.7021 9.00736 21.3988 8.21112 22.2945 8.01206ZM7.96233 6.76795C7.96233 6.56889 7.76327 6.36983 7.56421 6.36983H6.76798C6.56892 6.36983 6.36986 6.56889 6.36986 6.76795V12.3416C6.36986 12.5406 6.56892 12.7397 6.76798 12.7397H7.56421C7.76327 12.7397 7.96233 12.5406 7.96233 12.3416V6.76795ZM6.36986 4.82713V4.77737V2.38867C6.36986 1.94079 6.71821 1.59244 7.1661 1.59244C7.61398 1.59244 7.96233 1.94079 7.96233 2.38867V4.77737V4.82713C8.85809 5.02619 9.55479 5.82242 9.55479 6.76795V12.3416C9.55479 13.2871 8.85809 14.1331 7.96233 14.2824C7.96233 14.3322 7.96233 14.3322 7.96233 14.3322V16.7209C7.96233 17.1687 7.61398 17.5171 7.1661 17.5171C6.71821 17.5171 6.36986 17.1687 6.36986 16.7209V14.3322C6.36986 14.3322 6.36986 14.3322 6.36986 14.2824C5.4741 14.1331 4.7774 13.2871 4.7774 12.3416V6.76795C4.7774 5.82242 5.4741 5.02619 6.36986 4.82713Z"
                  fill="#1A3763"
                />
              </svg>
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
          <div className="flex w-full xl:col-start-1 xl:col-end-2">
            <Card
              className={`rounded-none p-0 flex flex-col items-center justify-center w-full gap-0 hover:bg-white transition-colors duration-200 ${location.pathname == "/events" ? "bg-white" : "bg-(--accentblue-30)"} border-0`}
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.537 9.99983C18.537 14.7074 14.7075 18.5372 10.0003 18.5372C5.29321 18.5372 1.463 14.7074 1.463 9.99983C1.463 5.2923 5.29287 1.46244 10.0003 1.46244C11.7447 1.46244 13.4073 1.98621 14.815 2.95286L13.1275 3.19924L13.3392 4.64652L17.3756 4.05635L16.7835 0.0202228L15.3363 0.232225L15.5483 1.67748C13.9192 0.586124 12.0042 0 9.99966 0C4.48571 0 0 4.48643 0 10.0002C0 15.5142 4.48638 20 10.0003 20C15.5143 20 20 15.5139 20 9.99983H18.537ZM7.43361 3.65628L6.0852 4.22286L9.25182 11.7565L16.7859 8.58929L16.2197 7.24077L10.0334 9.84142L7.43361 3.65628Z"
                      fill={`${location.pathname == "/events" ? "var(--orange)" : "black"}`}
                    />
                  </svg>
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
                      <img
                        src={DropdownArrow}
                        className={`${eventFilterOpened ? "rotate-180" : "rotate-0"}`}
                      ></img>
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
                            <svg
                              className="overflow-visible"
                              width="15"
                              height="15"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="8"
                                cy="8"
                                r="7.5"
                                stroke={eventTypes[x].color}
                                stroke-width="1"
                              />
                              <circle
                                cx="8"
                                cy="8"
                                r="3.5"
                                fill={eventTypes[x].color}
                              />
                            </svg>
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
                      <img
                        src={DropdownArrow}
                        className={`${open ? "rotate-180" : "rotate-0"}`}
                      ></img>
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
            className={`shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1)] w-full h-14.75 flex col-start-2 row-start-1 border-r ${location.pathname == "/compare" || location.pathname == "/grid" ? "xl:col-start-2 xl:col-end-3" : location.pathname == "/events" ? "xl:col-start-3 xl:col-end-4" : "xl:col-start-2 xl:col-end-3"}`}
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
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.4219 16.4062C13.1641 14.9219 13.6719 12.8516 13.75 10.625H6.25C6.32812 12.8516 6.875 14.9219 7.61719 16.4062C8.47656 18.1641 9.41406 18.75 10 18.75C10.625 18.75 11.5234 18.1641 12.4219 16.4062ZM13.75 9.375C13.6719 7.14844 13.1641 5.11719 12.4219 3.59375C11.5234 1.83594 10.625 1.25 10 1.25C9.41406 1.25 8.47656 1.83594 7.61719 3.59375C6.875 5.11719 6.32812 7.14844 6.25 9.375H13.75ZM15 10.625C14.8828 13.7109 13.9844 16.6016 12.6953 18.3203C16.0156 17.2656 18.4766 14.2578 18.7109 10.625H15ZM18.7109 9.375C18.4766 5.78125 16.0156 2.77344 12.6953 1.67969C13.9844 3.39844 14.8828 6.28906 15 9.375H18.7109ZM5 9.375C5.11719 6.28906 6.01562 3.39844 7.30469 1.67969C3.98438 2.77344 1.52344 5.78125 1.28906 9.375H5ZM1.28906 10.625C1.52344 14.2578 3.98438 17.2656 7.30469 18.3203C6.01562 16.6016 5.11719 13.7109 5 10.625H1.28906ZM10 20C4.49219 20 0 15.5078 0 10C0 4.49219 4.49219 0 10 0C15.5078 0 20 4.49219 20 10C20 15.5078 15.5078 20 10 20Z"
                          fill={`${location.pathname === "/compare" ? "var(--orange)" : "black"}`}
                        />
                      </svg>
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
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.67078 0.396729C1.86271 0.396729 0.396973 1.86246 0.396973 3.67054V16.3293C0.396973 18.1373 1.86271 19.6031 3.67078 19.6031H16.3295C18.1376 19.6031 19.6033 18.1373 19.6033 16.3293V3.67054C19.6033 1.86246 18.1376 0.396729 16.3295 0.396729H3.67078ZM16.3295 1.70625C17.4144 1.70625 18.2938 2.58569 18.2938 3.67054V4.3253L1.7065 4.3253V3.67054C1.7065 2.58569 2.58594 1.70625 3.67078 1.70625H16.3295ZM1.7065 5.63482L18.2938 5.63482V14.365L1.7065 14.365V5.63482ZM1.7065 16.3293V15.6745L18.2938 15.6745V16.3293C18.2938 17.4141 17.4144 18.2936 16.3295 18.2936H3.67078C2.58594 18.2936 1.7065 17.4141 1.7065 16.3293ZM13.9985 9.34514H6.00186L6.7792 8.47062C7.01945 8.20035 6.9951 7.78649 6.72483 7.54625C6.45455 7.30601 6.0407 7.33035 5.80045 7.60062L4.05442 9.56491C3.83391 9.81299 3.83391 10.1868 4.05442 10.4349L5.80045 12.3992C6.0407 12.6695 6.45455 12.6938 6.72483 12.4536C6.9951 12.2133 7.01945 11.7995 6.7792 11.5292L6.00184 10.6547H13.9985L13.2211 11.5292C12.9809 11.7995 13.0052 12.2133 13.2755 12.4536C13.5458 12.6938 13.9596 12.6695 14.1999 12.3992L15.9459 10.4349L15.9551 10.4243C16.047 10.3165 16.1045 10.1785 16.1107 10.0272C16.1114 10.0097 16.1115 9.99207 16.1108 9.9745C16.1048 9.8165 16.0427 9.67284 15.944 9.5628L14.1999 7.60062C13.9596 7.33035 13.5458 7.30601 13.2755 7.54625C13.0052 7.78649 12.9809 8.20035 13.2211 8.47062L13.9985 9.34514Z"
                          fill={`${location.pathname === "/grid" ? "var(--orange)" : "black"}`}
                        />
                      </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.390625 1.67969C0 1.32812 0 0.703125 0.390625 0.351562C0.742188 0 1.32812 0 1.67969 0.351562L7.57812 6.25L13.4766 0.351562C13.8672 0 14.4531 0 14.8047 0.351562C15.1953 0.742188 15.1953 1.32812 14.8047 1.67969L8.90625 7.57812L14.8047 13.4766C15.1953 13.8281 15.1953 14.4531 14.8047 14.8047C14.4531 15.1562 13.8672 15.1562 13.4766 14.8047L7.57812 8.90625L1.67969 14.8047C1.32812 15.1562 0.742188 15.1562 0.390625 14.8047C0 14.4531 0 13.8281 0.390625 13.4766L6.28906 7.57812L0.390625 1.67969Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
          {location.pathname === "/compare" || location.pathname === "/grid" ? (
            <div
              className={`flex flex-col xl:flex-row xl:w-auto ${dataOptions ? "h-full" : "h-0"} xl:h-14.75 overflow-hidden w-full col-start-1 col-end-4 xl:col-start-3 xl:col-end-4 `}
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
                          <svg
                            id="hazardIcon"
                            width="21"
                            height="19"
                            viewBox="0 0 21 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0781 0C10.625 0 11.1719 0.3125 11.4453 0.820312L19.8828 16.4453C20.1172 16.9141 20.1172 17.5 19.8438 18.0078C19.5703 18.4766 19.0625 18.75 18.5156 18.75H1.64062C1.05469 18.75 0.546875 18.4766 0.273438 18.0078C0 17.5 0 16.9141 0.234375 16.4453L8.67188 0.820312C8.94531 0.3125 9.49219 0 10.0781 0ZM10.0781 1.25C9.96094 1.25 9.84375 1.32812 9.80469 1.40625L1.36719 17.0312C1.28906 17.1484 1.28906 17.2656 1.36719 17.3438C1.40625 17.4609 1.52344 17.5 1.64062 17.5H18.5156C18.5938 17.5 18.7109 17.4609 18.7891 17.3438C18.8281 17.2656 18.8281 17.1484 18.7891 17.0312L10.3516 1.40625C10.2734 1.32812 10.1953 1.25 10.0781 1.25ZM10.0781 15.625C9.53125 15.625 9.14062 15.1953 9.14062 14.6875C9.14062 14.1797 9.53125 13.75 10.0781 13.75C10.5859 13.75 11.0156 14.1797 11.0156 14.6875C11.0156 15.1953 10.5859 15.625 10.0781 15.625ZM10.0781 6.875C10.5859 6.875 11.0156 7.34375 10.9766 7.85156L10.7031 11.9141C10.6641 12.2656 10.3906 12.5 10.0781 12.5C9.72656 12.5 9.45312 12.2656 9.45312 11.9141L9.14062 7.85156C9.10156 7.34375 9.53125 6.875 10.0781 6.875Z"
                              fill="var(--orange)"
                            />
                          </svg>
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
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 8 5"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g
                            transform={`rotate(${riskOpened ? "180" : "0"}, 3.9375, 2.1753)`}
                          >
                            <path
                              d="M3.64746 4.23193L0.131836 0.716309C-0.0439453 0.558105 -0.0439453 0.294434 0.131836 0.118652C0.290039 -0.0395508 0.553711 -0.0395508 0.729492 0.118652L3.94629 3.33545L7.16309 0.118652C7.32129 -0.0395508 7.58496 -0.0395508 7.74316 0.118652C7.91895 0.276855 7.91895 0.558105 7.74316 0.716309L4.22754 4.23193C4.06934 4.39014 3.80566 4.39014 3.64746 4.23193Z"
                              fill="black"
                            />
                          </g>
                        </svg>
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
                                    <svg
                                      width="8"
                                      height="5"
                                      viewBox="0 0 8 5"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <g
                                        transform={`rotate(${riskState === key ? "180" : "0"}, 4, 2.5)`}
                                      >
                                        <path
                                          d="M3.69141 4.27148L0.175781 0.755859C0 0.597656 0 0.333984 0.175781 0.158203C0.333984 0 0.597656 0 0.773438 0.158203L3.99023 3.375L7.20703 0.158203C7.36523 0 7.62891 0 7.78711 0.158203C7.96289 0.316406 7.96289 0.597656 7.78711 0.755859L4.27148 4.27148C4.11328 4.42969 3.84961 4.42969 3.69141 4.27148Z"
                                          fill="black"
                                        />
                                      </g>
                                    </svg>
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
                        <svg
                          width="17"
                          height="18"
                          viewBox="0 0 17 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g
                            transform={`rotate(${scenarioOpened ? "180" : "0"}, 8.5, 8.5)`}
                          >
                            <path
                              d="M16.5 8.5C16.5 12.9183 12.9183 16.5 8.5 16.5C4.08172 16.5 0.5 12.9183 0.5 8.5C0.5 4.08172 4.08172 0.5 8.5 0.5C12.9183 0.5 16.5 4.08172 16.5 8.5Z"
                              stroke="black"
                            />
                            <path
                              d="M12.4609 7.58594L8.89844 10.9375C8.78125 11.0547 8.64063 11.125 8.5 11.125C8.38281 11.125 8.24219 11.0547 8.125 10.9609L4.5625 7.60937C4.32813 7.39844 4.32813 7.04687 4.53906 6.8125C4.75 6.57812 5.10156 6.57812 5.33594 6.78906L8.52344 9.78906L11.6875 6.78906C11.9219 6.57812 12.2734 6.57812 12.4844 6.8125C12.6953 7.02344 12.6953 7.375 12.4609 7.58594Z"
                              fill="black"
                            />
                          </g>
                        </svg>
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
              className="flex flex-col items-center justify-center ml-2 xl:z-3 w-18.25 gap-y-1 cursor-pointer bg-white"
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
