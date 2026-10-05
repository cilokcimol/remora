"use client";

import { type ReactNode } from "react";

/**
 * Rich cinematic backdrop: layered gradient mesh + film grain + faint grid
 * + vignette. Kills the flat-navy "AI slop" look.
 */
export default function Backdrop({
  children,
  className = "",
  mood = "blue",
}: {
  children?: ReactNode;
  className?: string;
  mood?: "blue" | "violet" | "deep";
}) {
  const orbs =
    mood === "violet"
      ? [
          "bg-[#5b2bd9]/16 -left-40 top-10",
          "bg-[#298DFF]/12 -right-40 bottom-10",
          "bg-[#1e5eff]/10 left-1/3 top-1/2",
        ]
      : mood === "deep"
        ? [
            "bg-[#0e2a5c]/60 -left-40 top-0",
            "bg-[#298DFF]/8 -right-40 bottom-0",
            "bg-[#123a7d]/30 left-1/2 top-1/3",
          ]
        : [
            "bg-[#298DFF]/14 -left-40 top-1/4",
            "bg-[#1e5eff]/10 -right-40 bottom-1/4",
            "bg-[#2f8dff]/8 left-1/2 top-0",
          ];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {children}
      {/* gradient mesh orbs */}
      {orbs.map((o, i) => (
        <div
          key={i}
          className={`absolute h-[560px] w-[560px] rounded-full blur-[160px] ${o}`}
        />
      ))}
      {/* faint blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(120,180,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(120,180,255,0.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(75% 65% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(75% 65% at 50% 40%, black 30%, transparent 100%)",
        }}
      />
      {/* film grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay">
        <filter id="remora-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#remora-grain)" />
      </svg>
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(2,6,16,0.55)_100%)]" />
    </div>
  );
}
