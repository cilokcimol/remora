"use client";

import { useState } from "react";

const LINKS = [
  { label: "Chat", href: "#chat" },
  { label: "Memory", href: "#memory" },
  { label: "Demo", href: "#demo" },
  { label: "Manifesto", href: "#manifesto" },
];

function Mark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" className="e-mark">
      <circle cx="17" cy="17" r="17" fill="#9C86CE" opacity="0.9" />
      <circle cx="17" cy="17" r="8.6" fill="#FFFFFF" />
      <circle cx="17" cy="17" r="3.7" fill="#151519" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-30">
        <nav
          className="mx-auto flex h-[43px] max-w-[1560px] items-center justify-between px-6 pt-[41px] sm:px-10"
          aria-label="Primary"
        >
          <a href="#top" aria-label="Remora home" className="e-brand flex items-center gap-3">
            <Mark />
            <span
              className="text-[18.5px] font-medium tracking-[-0.0154em] text-white"
              style={{ textShadow: "0 1px 10px rgba(0,0,0,.30)", transform: "translateY(1px)" }}
            >
              Remora
            </span>
          </a>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[50px] lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="e-link text-[21.7px] font-normal leading-[1.2] tracking-[-0.0115em] text-white transition-opacity duration-200 hover:opacity-70"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,.32)" }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#chat"
              className="e-cta hidden rounded-[12px] bg-gradient-to-b from-[#3d3d3f] to-[#1d1d20] px-0 text-center text-[15.7px] font-semibold tracking-[-0.0127em] text-white transition hover:brightness-125 sm:block"
              style={{
                width: 140,
                height: 43,
                lineHeight: "43px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,.10), 0 2px 14px rgba(0,0,0,.28)",
              }}
            >
              <span className="inline-block" style={{ transform: "translateY(2px)" }}>
                Get started
              </span>
            </a>
            <button
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-white/15 bg-white/10 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-[12px] w-[17px]">
                <span
                  className={`absolute left-0 top-0 h-[1.5px] w-full bg-white transition-transform duration-300 ${open ? "translate-y-[5.25px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-white transition-transform duration-300 ${open ? "-translate-y-[5.25px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* mobile sheet */}
      <div
        className={`fixed inset-0 z-40 grid transition-all duration-300 lg:hidden ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}
        style={{ transitionTimingFunction: "cubic-bezier(.4,0,.2,1)" }}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="m-4 mt-20 rounded-2xl border border-white/10 bg-[rgba(24,24,27,.86)] p-6 backdrop-blur-[20px]">
            <div className="flex flex-col gap-1">
              {LINKS.map((l, i) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-[15px] font-medium text-white transition-all duration-300 ${open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                  style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#chat"
                onClick={() => setOpen(false)}
                className={`mt-3 rounded-[11px] bg-white py-3 text-center text-[15px] font-semibold text-[#0a0d12] transition-all duration-300 ${open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                style={{ transitionDelay: open ? "320ms" : "0ms" }}
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
