"use client";

import { useEffect, useState } from "react";
import AbyssScene from "@/components/AbyssScene";
import ChatPanel from "@/components/ChatPanel";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";

function useHeroFade() {
  const [style, setStyle] = useState({});
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setStyle({
        opacity: Math.max(0, 1 - y / 650),
        transform: `translateY(${y * 0.28}px)`,
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return style;
}

const BENTO = [
  {
    span: "md:col-span-2",
    kicker: "STORAGE",
    title: "Memories live on Walrus, not on a server",
    body: "Every fact Remora keeps is encrypted and stored as a blob on Walrus, the decentralized storage network on Sui mainnet. Verifiable, portable, owned by no company.",
  },
  {
    span: "",
    kicker: "RECALL",
    title: "Remembers by meaning",
    body: "Semantic search pulls the right memory at the right moment. No keywords, no digging.",
  },
  {
    span: "",
    kicker: "ISOLATION",
    title: "Your memory is yours",
    body: "Each visitor gets a private namespace. Your funds, votes, and questions never leak into someone else's chat.",
  },
  {
    span: "md:col-span-2",
    kicker: "MODEL",
    title: "Powered beyond the Big Two",
    body: "Remora runs on Z.AI's GLM-4.7, not Anthropic or OpenAI. Open weights spirit, frontier quality, zero dollars burned on inference.",
  },
  {
    span: "",
    kicker: "RITUAL",
    title: "Built for The Mutual Fun",
    body: "Five funds. Weekly votes. 4,001 seats. Remora knows the rulebook and remembers where you left off in it.",
  },
];

export default function Home() {
  const heroStyle = useHeroFade();

  return (
    <main className="bg-[#050d1d] font-sans text-white antialiased selection:bg-[#298DFF] selection:text-white">
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[108vh] flex-col overflow-hidden">
        <AbyssScene />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_110%,rgba(41,141,255,0.14),transparent_70%)]" />

        <div
          style={heroStyle}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 text-center"
        >
          <p className="mb-6 inline-block rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-white/70 backdrop-blur">
            Walrus Sessions 8 · Chatbots That Remember
          </p>
          <h1 className="text-[19vw] font-bold leading-[0.85] tracking-[-0.05em] sm:text-[15vw] lg:text-[11rem]">
            REMORA
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
            The chatbot that{" "}
            <span className="text-white">sticks with you</span>. It guides you
            through The Mutual Fun, and it actually remembers you between
            visits.
          </p>
          <a
            href="#chat"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#298DFF] px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_0_50px_rgba(41,141,255,0.5)] transition hover:shadow-[0_0_70px_rgba(41,141,255,0.7)]"
          >
            START TALKING
            <span className="transition-transform group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-white/40">
          scroll
        </div>
      </section>

      <Marquee />

      {/* ============ CHAT ============ */}
      <section id="chat" className="relative overflow-hidden py-28 sm:py-36">
        <div className="pointer-events-none absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full bg-[#298DFF]/15 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#1e5eff]/10 blur-[140px]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <Reveal className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#298DFF]">
              Live demo
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
              Talk to Remora.
              <br />
              <span className="text-white/50">It will remember this.</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <ChatPanel />
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-6 text-center text-sm text-white/40">
              Tell it your favorite fund, then come back tomorrow and ask what
              it remembers.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ BENTO ============ */}
      <section className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#298DFF]">
              Under the surface
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
              Memory, engineered.
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {BENTO.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 120} className={c.span}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition-colors duration-300 hover:border-[#298DFF]/40 hover:bg-white/[0.06]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#298DFF]">
                    {c.kicker}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/55">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section className="relative overflow-hidden py-32 sm:py-44">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#298DFF]/10 blur-[160px]" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <Reveal>
            <p className="mx-auto max-w-3xl text-3xl font-medium leading-snug tracking-[-0.02em] text-white/85 sm:text-5xl">
              Most chatbots forget you the second you close the tab.{" "}
              <span className="text-[#298DFF]">
                Remora attaches itself to your story and does not let go.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative overflow-hidden border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-20">
          <Reveal>
            <h2 className="text-[13vw] font-bold leading-[0.9] tracking-[-0.05em] text-white/[0.07] sm:text-[9rem]">
              STICK WITH IT.
            </h2>
          </Reveal>
          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:items-center">
            <p>
              <span className="font-semibold text-white">Remora</span> · Walrus
              Session 8: Chatbots That Remember
            </p>
            <div className="flex gap-6">
              <a
                href="https://github.com/cilokcimol/remora"
                className="transition hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://themutual.fun"
                className="transition hover:text-white"
              >
                themutual.fun
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
