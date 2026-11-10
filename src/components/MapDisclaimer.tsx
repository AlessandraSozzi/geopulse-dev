import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// IMF standard map disclaimer, shown on every map (Events, Grid, each Compare map).
export const MAP_DISCLAIMER =
  "The boundaries, colors, denominations, and any other information shown on this map do not imply, on the part of the International Monetary Fund, any judgment on the legal status of any territory or any endorsement or acceptance of such boundaries.";

export function MapDisclaimer({ className = "" }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger
        className={`shrink-0 cursor-pointer underline underline-offset-2 transition-colors hover:text-white focus-visible:outline-1 focus-visible:outline-white ${className}`}
      >
        Disclaimer
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 rounded-lg border-0 bg-white p-4 text-left text-[13px] leading-snug text-neutral-700"
      >
        {MAP_DISCLAIMER}
      </PopoverContent>
    </Popover>
  );
}
