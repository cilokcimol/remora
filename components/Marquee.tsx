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
    <div className="relative overflow-hidden border-y-2 border-ink bg-cream py-5">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-10 whitespace-nowrap pr-10">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-serif text-2xl italic text-ink sm:text-3xl">
              {item}
            </span>
            <span className="text-xl text-crimson">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}
