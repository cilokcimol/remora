"use client";

const ITEMS = [
  "REMEMBERS YOU",
  "WALRUS MEMORY",
  "SUI MAINNET",
  "NEVER STARTS FROM ZERO",
  "THE MUTUAL FUN GUIDE",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#081426] py-5">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-10 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#298DFF]" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#081426] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#081426] to-transparent" />
    </div>
  );
}
