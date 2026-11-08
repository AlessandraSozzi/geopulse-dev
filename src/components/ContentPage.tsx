import type { ReactNode } from "react";

import { TopoBackground } from "@/components/TopoBackground";

// Shared layout for the white text pages (About, Team & Contact Us):
// topo-line background, 1200px column, eyebrow + title, then sections.

export const contentCard =
  "rounded-lg border border-[#E3E9F1] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]";

export function ContentPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    // outer div scrolls; inner div grows with the content so the topo background covers the full page
    <div className="h-full overflow-auto">
      <div className="relative isolate min-h-full bg-white">
        <TopoBackground />
        <main className="mx-auto w-9/10 max-w-300 pt-24 pb-24 text-left text-[#0F1A3A]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#234E90]">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-225 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            {title}
          </h1>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string; // jump target; scroll-mt keeps the heading clear of the fixed header
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-20">
      <h2 className="text-[28px] font-bold leading-tight">{title}</h2>
      {description && (
        <p className="mt-2 text-[14px] text-[#3D4A5C]">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}
