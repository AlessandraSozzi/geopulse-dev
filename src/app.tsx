// import the generated route tree
import { routeTree } from "./routeTree.gen";
import {
  RouterProvider,
  createRouter,
  createHashHistory,
} from "@tanstack/react-router";
import {
  createContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { type DateRange } from "react-day-picker";

// create a new router instance
const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

// register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// set data types
type Measure = { name: string; id: string };
type Threshold = { name: string; threshold: any };
type Coordinates = { longitude: number; latitude: number };

// this object sets types for the state context
type AppState = {
  currentView: string;
  currentTime: number;
  currentScenario: string;
  currentHazard: string;
  currentExposure: string;
  currentMeasure: Measure;
  currentThreshold: Threshold;
  dateRange: DateRange;
  eventFilter: string;
  countryFilter: string;
  countryCoordinates: Coordinates;
  dataExplainerOpen: boolean;
  dataExplainerView: string;
  loadingOverlay: boolean | string;
  elninoExposure: string;
};

// this object sets types for the set state actions
type AppActions = {
  setView: Dispatch<SetStateAction<string>>;
  setTime: Dispatch<SetStateAction<number>>;
  setScenario: Dispatch<SetStateAction<string>>;
  setHazard: Dispatch<SetStateAction<string>>;
  setExposure: Dispatch<SetStateAction<string>>;
  setMeasure: Dispatch<SetStateAction<Measure>>;
  setThreshold: Dispatch<SetStateAction<Threshold>>;
  setDateRange: Dispatch<SetStateAction<DateRange>>;
  setEventFilter: Dispatch<SetStateAction<string>>;
  setCountryFilter: Dispatch<SetStateAction<string>>;
  setCountryCoordinates: Dispatch<SetStateAction<Coordinates>>;
  setDataExplainerState: Dispatch<SetStateAction<boolean>>;
  setDataExplainerView: Dispatch<SetStateAction<string>>;
  setLoadingOverlay: Dispatch<SetStateAction<boolean | string>>;
  setElninoExposure: Dispatch<SetStateAction<string>>;
};

// create context for state values and set state actions
export const AppStateContext = createContext<AppState | null>(null);
export const AppActionsContext = createContext<AppActions | null>(null);

export function App() {
  // create date values for the dateRange state
  const today: Date = new Date();
  const fromDate: Date = new Date(
    today.getFullYear(),
    today.getMonth() - 3,
    today.getDate(),
  );
  const toDate = today;

  // set state values and update functions
  const [currentView, setView] = useState<string>("Event tracking");
  const [currentTime, setTime] = useState<number>(1980);
  const [currentScenario, setScenario] = useState<string>("rcp4p5");
  const [currentHazard, setHazard] = useState<string>("Coastal Flooding");
  const [currentExposure, setExposure] = useState<string>("Population");
  const [currentMeasure, setMeasure] = useState<Measure>({
    name: "Flood Level",
    id: "CF_PW_EXP",
  });
  const [currentThreshold, setThreshold] = useState<Threshold>({
    name: "",
    threshold: "rp0005",
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: fromDate,
    to: toDate,
  });
  const [eventFilter, setEventFilter] = useState<string>("AL");
  const [countryFilter, setCountryFilter] = useState<string>("All countries");
  const [countryCoordinates, setCountryCoordinates] = useState<Coordinates>({
    longitude: 42.55108741,
    latitude: 1.57672606,
  });
  const [dataExplainerOpen, setDataExplainerState] = useState(false);
  const [dataExplainerView, setDataExplainerView] = useState("Event Tracking");
  const [loadingOverlay, setLoadingOverlay] = useState<string | boolean>(true);
  // El Niño tab: exposure layer, chosen in the header (keys of elninoExposures)
  const [elninoExposure, setElninoExposure] = useState<string>("agrgva");

  const state = {
    currentView,
    currentTime,
    currentScenario,
    currentHazard,
    currentExposure,
    currentMeasure,
    currentThreshold,
    dateRange,
    eventFilter,
    countryFilter,
    countryCoordinates,
    dataExplainerOpen,
    dataExplainerView,
    loadingOverlay,
    elninoExposure,
  };

  const actions = {
    setView,
    setTime,
    setScenario,
    setHazard,
    setExposure,
    setMeasure,
    setThreshold,
    setDateRange,
    setEventFilter,
    setCountryFilter,
    setCountryCoordinates,
    setDataExplainerState,
    setDataExplainerView,
    setLoadingOverlay,
    setElninoExposure,
  };

  return (
    <div className={`${dataExplainerOpen ? "overflow-hidden" : ""} h-full`}>
      <AppActionsContext.Provider value={actions}>
        <AppStateContext.Provider value={state}>
          <RouterProvider router={router} />
        </AppStateContext.Provider>
      </AppActionsContext.Provider>
    </div>
  );
}
