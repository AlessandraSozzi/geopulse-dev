import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { urlObject } from "@/config/datasets";

// Two-pane hazard → exposure picker. Hover/click a hazard to show its exposures; one click on an
// exposure selects both. Rows match OptionList (grey rounded highlight, ✓ on the selected one).
// Used by Header when HAZARD_MENU is "panels" (see the switch at the top of Header.tsx).
export function HazardExposureMenu({
  hazard,
  exposure,
  onSelect,
}: {
  hazard: string;
  exposure: string;
  onSelect: (hazard: string, exposure: string) => void;
}) {
  const [active, setActive] = useState(hazard); // hazard whose exposures are shown on the right
  const row =
    "flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-[14px] text-black cursor-pointer outline-none transition-colors hover:bg-neutral-200 focus-visible:bg-neutral-200";
  const heading = "px-2.5 pb-1 text-[11px] font-bold tracking-wide text-neutral-500";
  const tick = (on: boolean) => (
    <span className="w-4 shrink-0">{on && <Check className="size-4" strokeWidth={3} />}</span>
  );

  return (
    <div className="flex w-105 gap-2 p-2">
      <div role="listbox" aria-label="Hazard" className="flex-1 border-r border-neutral-200 pr-2">
        <div className={heading}>HAZARD</div>
        {Object.keys(urlObject).map((h) => (
          <button
            key={h}
            type="button"
            role="option"
            aria-selected={h === hazard}
            className={`${row} ${h === active ? "bg-neutral-100" : ""} ${h === hazard ? "font-bold" : ""}`}
            onMouseEnter={() => setActive(h)}
            // keyboard focus only: the popover auto-focuses the first row on open, which must not
            // replace the current hazard's exposures with the first hazard's
            onFocus={(ev) => ev.currentTarget.matches(":focus-visible") && setActive(h)}
            onClick={() => setActive(h)}
          >
            {tick(h === hazard)}
            <span className="flex-1">{h}</span>
            <ChevronRight className="size-4 shrink-0 text-neutral-400" />
          </button>
        ))}
      </div>
      <div role="listbox" aria-label={`${active}: exposure`} className="flex-1">
        <div className={heading}>EXPOSURE</div>
        {Object.keys(urlObject[active]).map((e) => {
          const on = active === hazard && e === exposure;
          return (
            <button
              key={e}
              type="button"
              role="option"
              aria-selected={on}
              className={`${row} ${on ? "font-bold" : ""}`}
              onClick={() => onSelect(active, e)}
            >
              {tick(on)}
              {e}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Column layout: one column per hazard listing only its exposures, so every option is a valid
// hazard + exposure pair and coverage is visible at a glance. One click applies and closes.
export function HazardExposureColumns({
  hazard,
  exposure,
  onSelect,
}: {
  hazard: string;
  exposure: string;
  onSelect: (hazard: string, exposure: string) => void;
}) {
  const row =
    "flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-[14px] text-black cursor-pointer outline-none transition-colors hover:bg-neutral-200 focus-visible:bg-neutral-200";

  return (
    <div className="flex gap-1 p-2">
      {Object.keys(urlObject).map((h, i) => (
        <div
          key={h}
          role="listbox"
          aria-label={h}
          className={`min-w-40 shrink-0 ${i > 0 ? "border-l border-neutral-200 pl-1" : ""}`}
        >
          <div
            className={`px-2.5 pb-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-wide ${h === hazard ? "text-(--fundblue)" : "text-neutral-500"}`}
          >
            {h}
          </div>
          {Object.keys(urlObject[h]).map((e) => {
            const on = h === hazard && e === exposure;
            return (
              <button
                key={e}
                type="button"
                role="option"
                aria-selected={on}
                className={`${row} ${on ? "font-bold" : ""}`}
                onClick={() => onSelect(h, e)}
              >
                <span className="w-4 shrink-0">
                  {on && <Check className="size-4" strokeWidth={3} />}
                </span>
                {e}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
