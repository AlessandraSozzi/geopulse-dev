import { createFileRoute, Link } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { AppActionsContext } from "@/app";
import { CompareIcon, EventTrackingIcon, GridIcon } from "@/assets/NavIcons";
import { ContentPage, Section, contentCard } from "@/components/ContentPage";

export const Route = createFileRoute("/about")({
  component: About,
});

const body = "text-[16px] leading-relaxed text-[#3D4A5C]";

type View = {
  name: string;
  to: "/events" | "/compare" | "/grid";
  Icon: typeof GridIcon;
  text: string;
};

const realtimeViews: View[] = [
  {
    name: "Event Tracking",
    to: "/events",
    Icon: EventTrackingIcon,
    text: "Monitor looming and ongoing natural disasters on an interactive global map, and see their impacts on population, buildings, capital stock, GDP, agriculture and critical infrastructure.",
  },
];

// same order and icons as the header's Forward looking tab
const forwardViews: View[] = [
  {
    name: "Compare",
    to: "/compare",
    Icon: CompareIcon,
    text: "Benchmark exposure and risk across countries or subnational regions using harmonized indicators, aiding resource allocation and international cooperation.",
  },
  {
    name: "Grid",
    to: "/grid",
    Icon: GridIcon,
    text: "Investigate hazard–exposure indicators on 2D and 3D interactive maps, with color‑coded intensities and legends to support local decision‑making.",
  },
];

// clickable card linking to one of the app's views; lifts with a shadow on hover/focus
function ViewCard({ name, to, Icon, text }: View) {
  return (
    <Link
      to={to}
      className={`${contentCard} group flex gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#234E90]/40 hover:shadow-[0_8px_24px_rgba(16,24,40,0.12)] focus-visible:-translate-y-0.5 focus-visible:shadow-[0_8px_24px_rgba(16,24,40,0.12)] focus-visible:outline-2 focus-visible:outline-[#234E90]`}
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-[#E8EFFA]">
        <Icon color="#234E90" size={22} />
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-[16px] font-bold group-hover:text-[#234E90]">
          {name}
          <ArrowRight
            className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            strokeWidth={2}
          />
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-[#3D4A5C]">{text}</p>
      </div>
    </Link>
  );
}

function About() {
  const actions = useContext(AppActionsContext);
  useEffect(() => {
    actions?.setView("About");
  }, []);

  return (
    <ContentPage
      eyebrow="About GeoPulse"
      title="IMF GeoPulse: Track, Analyze, and Respond to Economic Risk"
    >
      {/* intro: two columns on large screens */}
      <div className={`mt-8 grid gap-x-12 gap-y-5 lg:grid-cols-2 ${body}`}>
        <p>
          IMF GeoPulse is a geospatial platform that monitors physical risks to
          the economy, people, and our environment. The frequency and severity
          of damages from natural disasters such as floods, hurricanes, and
          wildfires have been increasing over time resulting in billions of
          dollars damage to economies and loss of human lives. As impacts often
          ripple through economies, including the financial systems, public
          finances, and trade, the first-order effects of most of these risks
          are highly localized.
        </p>
        <p>
          GeoPulse provides high-resolution geospatial data on hazards,
          exposures, and risks to help economies prepare for, respond to, and
          recover from natural disasters. It is state-of-the-art platform
          translating complex and big geospatial data into actionable insights
          for policy analysis, financing, and resilience planning now and for
          the future.
        </p>
        <p>
          Designed to map the exposure of economies to physical hazards,
          GeoPulse enables users to quantify both potential and realized risks
          on people, GDP, physical capital, agriculture, critical
          infrastructures, and other key sectors of the economy.
        </p>
        <p>
          By delivering globally harmonized data at an unprecedented level of
          spatial granularity down to one kilometer grid resolution, the
          platform provides critical and timely information far beyond
          macroeconomic statistics down to the local level where risks
          materialize and impacts are felt.
        </p>
      </div>

      <Section title="Real-Time Insights">
        <div className={`flex max-w-[75ch] flex-col gap-y-5 ${body}`}>
          <p>
            The real‑time feature of GeoPulse provides continuous monitoring of
            looming and ongoing natural disasters, through an interactive
            global map interface. It enables users to assess the immediate
            risks and quantify the scale and nature of impacts on population,
            buildings, capital stock, GDP, agriculture and critical
            infrastructure such as airports and maritime ports as events unfold
            in affected regions.
          </p>
          <p>
            Further, it supports retrospective analysis, providing users with
            detailed data on past disaster events and their impacts. Users can
            toggle through panels to view and download severity metrics,
            affected economies, and disaster footprints.
          </p>
        </div>
        <p className="mt-6 text-[14px] font-bold">Explore the real-time view:</p>
        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
          {realtimeViews.map((v) => (
            <ViewCard key={v.name} {...v} />
          ))}
        </div>
      </Section>

      <Section title="Forward-Looking Analysis">
        <p className={`max-w-[75ch] ${body}`}>
          Beyond monitoring today’s risks and shocks, GeoPulse enables users to
          explore tomorrow’s risks. The platform provides forward‑looking
          indicators under multiple climate scenarios—with projections
          extending through 2100—so policymakers can visualize how exposure
          trajectories change under different warming pathways and plan
          adaptation investments accordingly.
        </p>
        <p className="mt-6 text-[14px] font-bold">
          Explore the two forward-looking views:
        </p>
        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
          {forwardViews.map((v) => (
            <ViewCard key={v.name} {...v} />
          ))}
        </div>
      </Section>

      <Section title="From Insight to Action">
        <p className={`max-w-[75ch] ${body}`}>
          GeoPulse supports exportable charts and downloadable datasets,
          helping users communicate findings, inform disaster risk financing,
          and embed results in reports to authorities or funders. Methodology
          and data‑source documentation are available to promote transparency
          and correct interpretation.
        </p>
      </Section>

      <Section title="An IMF Initiative Advancing Global Data Standards">
        <p className={`max-w-[75ch] ${body}`}>
          GeoPulse helps fill priority data gaps identified by the G20 Data
          Gaps Initiative, bringing IMF‑generated risk indicators into a
          consistent, accessible format for surveillance and policy analysis.
          The platform is designed and sponsored within the IMF, leveraging
          secure cloud infrastructure and geospatial services to deliver
          scalable, high‑quality analytics.
        </p>
      </Section>
    </ContentPage>
  );
}
