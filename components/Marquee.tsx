"use client";

const ITEMS = [
  "Remembers you",
  "Stored on Walrus",
  "Sui mainnet",
  "Walrus Sessions 8",
  "Never starts from zero",
  "Beyond the Big Two",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-night py-5">
      <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center gap-10 whitespace-nowrap pr-10">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="text-sm font-medium uppercase tracking-[0.3em] text-white/40">
              {item}
            </span>
            <span className="text-ember">✳</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-night to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-night to-transparent" />
    </div>
  );
}
