"use client";

import { useRef } from "react";
import Reveal from "@/components/Reveal";

const CARDS = [
  {
    kicker: "Storage",
    title: "Memories live on Walrus, never on a server",
    body: "Every fact is encrypted into a blob on Walrus, the decentralized storage network on Sui mainnet. Verifiable, portable, owned by no company.",
  },
  {
    kicker: "Recall",
    title: "Recalled by meaning",
    body: "Semantic search surfaces the right memory at the right moment. No keywords, no digging through old chats.",
  },
  {
    kicker: "Privacy",
    title: "Yours alone",
    body: "Each visitor gets a private namespace. What you share never leaks into someone else's conversation.",
  },
  {
    kicker: "Models",
    title: "Beyond the Big Two",
    body: "Powered by Z.AI GLM with a Mistral fallback. Open weights spirit, frontier quality, zero Big Two.",
  },
  {
    kicker: "Sessions",
    title: "Built for Session 8",
    body: "Walrus Sessions 8 is Chatbots That Remember. Remora is the thesis in action: memory that outlives the tab.",
  },
  {
    kicker: "Proof",
    title: "Verifiable by design",
    body: "Blobs are content addressed and erasure coded across nodes. Memory you can audit, never only trust.",
  },
];

function TiltCard({ card }: { card: (typeof CARDS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.transform = `perspective(900px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg) translateY(-6px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#131318]/80 p-7 backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-[#ff8a3c]/40 hover:shadow-[0_20px_60px_-15px_rgba(255,138,60,0.35)]"
      style={{ transitionProperty: "border-color, box-shadow" }}
    >
      <span className="pointer-events-none absolute inset-y-0 w-1/3 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-700 group-hover:translate-x-[350%]" />
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ff8a3c]">
        {card.kicker}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
        {card.title}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-white/55">{card.body}</p>
    </div>
  );
}

export default function FeatureCards() {
  return (
    <section id="memory" className="bg-[#0a0d12] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-12 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff8a3c]">
            Under the hood
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            Memory, engineered.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-white/55">
            Everything a chatbot needs to truly remember you. Storage, recall,
            and privacy, built on Walrus.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 100}>
              <TiltCard card={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
