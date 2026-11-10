import { AppStateContext } from "@/app";
import { useContext, useRef } from "react";

export default function () {
  const state = useContext(AppStateContext);
  // Remember whether the overlay has been shown since this page mounted. Coming back to Events with
  // loadingOverlay already false used to mount it with "fadeOut", which starts at full opacity, so a
  // dark veil flashed over the whole screen for 0.5s.
  const shown = useRef(false);
  if (state?.loadingOverlay === true) shown.current = true;

  const cls =
    state?.loadingOverlay === "initial" || !shown.current
      ? "-z-10 opacity-0"
      : state?.loadingOverlay === true
        ? "fadeIn z-21"
        : "z-21 fadeOut";

  return (
    <div>
      <div
        className={`h-full w-full flex items-center justify-center ${cls} absolute top-0`}
      >
        <div className="w-21 h-21 border-dotted border-white border-10 rounded-full z-20 rotate"></div>
        <div className="h-full w-full absolute bg-black opacity-40"></div>
      </div>
    </div>
  );
}
