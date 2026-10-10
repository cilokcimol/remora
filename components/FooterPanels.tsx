"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";

const ROTATING = [
  { title: "Encrypted blobs on Walrus", body: "Every memory is sealed before it touches storage." },
  { title: "Recall by meaning", body: "The right memory surfaces at the right moment." },
  { title: "Private namespace per visitor", body: "Your memories never mix with anyone else's." },
  { title: "Open weights models", body: "Z.AI GLM with Mistral fallback. Zero Big Two." },
];

function Rotator() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % ROTATING.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col justify-between p-7 sm:p-9">
      <div className="relative min-h-[120px]">
        {ROTATING.map((c, i) => (
          <div
            key={c.title}
            className={`transition-all duration-500 ${i === active ? "relative translate-y-0 opacity-100" : "pointer-events-none absolute inset-0 translate-y-4 opacity-0"}`}
          >
            <p className="text-xl font-semibold tracking-tight text-[#1f2a1d] sm:text-2xl">
              {c.title}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-black/60">{c.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        {ROTATING.map((_, i) => (
          <button
            key={i}
            aria-label={`Show card ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-0.5 flex-1 rounded-full transition-colors ${i === active ? "bg-black" : "bg-black/20"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function FooterPanels() {
  return (
    <section className="relative z-10 grid grid-cols-1 bg-[#0a0d12] md:grid-cols-[2fr_1fr_2fr]">
      <Reveal className="h-full" delay={0}>
        <div className="flex h-full min-h-[220px] flex-col justify-center bg-[#ecedec] p-7 sm:p-9">
          <p className="max-w-[350px] text-2xl leading-[1.1] tracking-[-0.02em] text-[#1f2a1d] sm:text-[28px]">
            Start your path to memory that lasts
          </p>
          <a
            href="#chat"
            className="mt-5 inline-block text-base text-[#1f2a1d] underline underline-offset-4 transition hover:opacity-70"
          >
            Start chatting
          </a>
        </div>
      </Reveal>
      <Reveal className="h-full" delay={120}>
        <div className="h-full min-h-[220px] bg-[#fefdf9]">
          <Rotator />
        </div>
      </Reveal>
      <Reveal className="h-full" delay={240}>
        <div className="flex h-full min-h-[220px] items-center gap-6 bg-black p-7 sm:p-9">
          <p className="text-[64px] font-semibold leading-none tracking-tight text-white sm:text-[80px]">
            10<span className="text-[#ff8a3c]">+</span>
          </p>
          <p className="max-w-[220px] text-[15px] leading-snug text-white/60">
            blobs on mainnet back every memory Remora keeps
          </p>
        </div>
      </Reveal>
    </section>
  );
}
