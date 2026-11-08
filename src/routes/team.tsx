import { createFileRoute } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { Building2, Mail, User } from "lucide-react";

import { AppActionsContext } from "@/app";
import {
  ContentPage,
  Section,
  contentCard as card,
} from "@/components/ContentPage";

export const Route = createFileRoute("/team")({
  component: Team,
});

// TODO: replace placeholders with real names, roles and institutions
const coreTeam = [
  { name: "Full Name", role: "Project Lead", department: "Department Name" },
  { name: "Full Name", role: "Lead Economist", department: "Department Name" },
  { name: "Full Name", role: "Economist", department: "Department Name" },
  { name: "Full Name", role: "Data Scientist", department: "Department Name" },
  { name: "Full Name", role: "Data Scientist", department: "Department Name" },
  { name: "Full Name", role: "Geospatial Analyst", department: "Department Name" },
  { name: "Full Name", role: "Product Designer", department: "Department Name" },
  { name: "Full Name", role: "Software Engineer", department: "Department Name" },
];
const advisoryBoard = Array.from({ length: 9 }, () => ({
  name: "Full Name",
  institution: "Institution Name",
}));
const collaborators = Array.from({ length: 12 }, () => ({
  name: "Full Name",
  institution: "Institution Name",
}));
const institutions = Array.from({ length: 5 }, () => ({
  name: "Institution Name",
}));

// TODO: placeholder address, confirm before launch
const CONTACT_EMAIL = "IMF-GeoPulse@imf.org";

// compact card used by Advisory board and Collaborators
function PersonRow({ name, institution }: { name: string; institution: string }) {
  return (
    <div className={`${card} flex items-center gap-3 px-3.5 py-3`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E8EFFA]">
        <User className="size-4.5 text-[#234E90]" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[14px] font-bold">{name}</p>
        <p className="truncate text-[12px] text-[#3D4A5C]">{institution}</p>
      </div>
    </div>
  );
}

function Team() {
  const actions = useContext(AppActionsContext);
  useEffect(() => {
    actions?.setView("Team");
  }, []);

  return (
    <ContentPage eyebrow="About GeoPulse" title="Our Team">
          <p className="mt-5 max-w-160 text-[16px] leading-relaxed text-[#3D4A5C]">
            GeoPulse is built by a team of economists, data scientists and
            designers, guided by an advisory board and supported by
            collaborators and partner institutions around the world.
          </p>

          {/* contact: compact, part of the intro */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={`${card} group mt-8 flex w-full max-w-110 items-center gap-4 px-5 py-4 transition-colors hover:border-[#234E90]`}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-[#E8EFFA]">
              <Mail className="size-5.5 text-[#234E90]" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7A90]">
                Contact us
              </p>
              <p className="truncate text-[16px] font-bold text-[#234E90] group-hover:underline">
                {CONTACT_EMAIL}
              </p>
            </div>
          </a>

          <Section
            title="Core Team"
            description="The team that builds and maintains GeoPulse."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {coreTeam.map((p, i) => (
                <div
                  key={i}
                  className={`${card} flex flex-col items-center px-4 py-6 text-center`}
                >
                  <div className="flex size-20 items-center justify-center rounded-full bg-[#E8EFFA]">
                    <User className="size-8 text-[#234E90]" strokeWidth={1.5} />
                  </div>
                  <p className="mt-4 text-[16px] font-bold">{p.name}</p>
                  <p className="mt-1 text-[13px] text-[#3D4A5C]">{p.role}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7A90]">
                    {p.department}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Advisory Board"
            description="Experts who guide the direction of the GeoPulse project."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {advisoryBoard.map((p, i) => (
                <PersonRow key={i} {...p} />
              ))}
            </div>
          </Section>

          <Section
            title="Collaborators"
            description="Colleagues who contributed data, methods and expertise."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {collaborators.map((p, i) => (
                <PersonRow key={i} {...p} />
              ))}
            </div>
          </Section>

          <Section
            title="Supporting Institutions"
            description="We gratefully acknowledge the support of these institutions."
          >
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {institutions.map((inst, i) => (
                <div
                  key={i}
                  className={`${card} flex flex-col items-center gap-3 px-4 py-6 text-center`}
                >
                  <div className="flex size-10 items-center justify-center rounded-md bg-[#E8EFFA]">
                    <Building2 className="size-5 text-[#234E90]" strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] font-bold">{inst.name}</p>
                </div>
              ))}
            </div>
          </Section>
    </ContentPage>
  );
}
