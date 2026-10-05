"use client";

const ROW_A = [
  "REMEMBERS YOU",
  "WALRUS MEMORY",
  "SUI MAINNET",
  "NEVER STARTS FROM ZERO",
];

const ROW_B = [
  "SESSION 8",
  "ENCRYPTED BLOBS",
  "PRIVATE NAMESPACES",
  "BEYOND THE BIG TWO",
];

function Row({ items, reverse = false, outline = false }: { items: string[]; reverse?: boolean; outline?: boolean }) {
  const row = [...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex w-max items-center gap-12 whitespace-nowrap py-4 pr-12 ${
          reverse
            ? "animate-[marquee-reverse_36s_linear_infinite]"
            : "animate-[marquee_32s_linear_infinite]"
        }`}
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-12">
            <span
              className={`text-sm font-semibold uppercase tracking-[0.3em] ${
                outline
                  ? "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)]"
                  : "text-white/70"
              }`}
            >
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#298DFF]" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#060f22]">
      <Row items={ROW_A} />
      <div className="border-t border-white/5">
        <Row items={ROW_B} reverse outline />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#060f22] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#060f22] to-transparent" />
    </div>
  );
}
