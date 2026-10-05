"use client";

import { useEffect, useState } from "react";
import JourneyScene from "@/components/JourneyScene";
import ChatPanel from "@/components/ChatPanel";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import Backdrop from "@/components/Backdrop";

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
    body: "Each visitor gets a private namespace. What you tell Remora never leaks into someone else's chat.",
  },
  {
    span: "md:col-span-2",
    kicker: "MODEL",
    title: "Powered beyond the Big Two",
    body: "Remora runs on Z.AI's GLM with a Mistral fallback, not Anthropic or OpenAI. Open weights spirit, frontier quality, zero dollars burned on inference.",
  },
  {
    span: "",
    kicker: "SESSIONS",
    title: "Built for Session 8",
    body: "Walrus Sessions 8 is 'Chatbots That Remember.' Remora is its thesis in action: a chatbot whose memory outlives the tab it runs in.",
  },
];

export default function Home() {
  const heroStyle = useHeroFade();

  return (
    <main className="relative font-sans text-white antialiased selection:bg-[#298DFF] selection:text-white">
      {/* one continuous 3D world behind the whole page — scroll to dive through it */}
      <JourneyScene />

      <div className="relative z-10">
        {/* ============ HERO ============ */}
        <section className="relative flex min-h-[108vh] flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#040b1a]/60" />

          <div
            style={heroStyle}
            className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 text-center"
          >
            <Parallax speed={0.08}>
              <p className="mb-6 inline-block rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-white/70 backdrop-blur">
                Walrus Sessions 8 · Chatbots That Remember
              </p>
            </Parallax>
            <Parallax speed={0.16}>
              <h1 className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-[19vw] font-bold leading-[0.85] tracking-[-0.05em] text-transparent drop-shadow-[0_0_60px_rgba(41,141,255,0.35)] sm:text-[15vw] lg:text-[11rem]">
                REMORA
              </h1>
            </Parallax>
            <Parallax speed={0.1}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65 sm:text-xl">
                The chatbot that{" "}
                <span className="text-white">sticks with you</span>. Built for
                Walrus Sessions 8, it stores what you tell it on Walrus and
                actually remembers you between visits.
              </p>
            </Parallax>
            <a
              href="#chat"
              className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#298DFF] px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_0_50px_rgba(41,141,255,0.5)] transition duration-300 hover:scale-[1.04] hover:shadow-[0_0_80px_rgba(41,141,255,0.75)]"
            >
              <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/25 blur-md animate-[shine-sweep_2.8s_ease-in-out_infinite]" />
              <span className="relative">START TALKING</span>
              <span className="relative transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-[float-slow_3s_ease-in-out_infinite] text-[11px] uppercase tracking-[0.3em] text-white/40">
            scroll to dive
          </div>
        </section>

        <Marquee />

        {/* ============ CHAT ============ */}
        <section id="chat" className="relative overflow-hidden py-28 sm:py-36">
          <Backdrop mood="blue" />
          <div className="relative mx-auto max-w-3xl px-6">
            <Reveal className="mb-12 text-center">
              <Parallax speed={0.06}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#298DFF]">
                  Live demo
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
                  Talk to Remora.
                  <br />
                  <span className="bg-gradient-to-r from-white/50 to-white/25 bg-clip-text text-transparent">
                    It will remember this.
                  </span>
                </h2>
              </Parallax>
            </Reveal>
            <Reveal delay={150}>
              <Parallax speed={-0.04}>
                <div className="transition duration-500 hover:[filter:drop-shadow(0_0_45px_rgba(41,141,255,0.35))]">
                  <ChatPanel />
                </div>
              </Parallax>
            </Reveal>
            <Reveal delay={250}>
              <p className="mt-6 text-center text-sm text-white/40">
                Tell it something about yourself, then come back tomorrow and
                ask what it remembers.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ============ BENTO ============ */}
        <section className="relative overflow-hidden py-28 sm:py-36">
          <Backdrop mood="violet" />
          <div className="relative mx-auto max-w-6xl px-6">
            <Reveal className="mb-14">
              <Parallax speed={0.06}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#298DFF]">
                  Under the surface
                </p>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
                  Memory, engineered.
                </h2>
              </Parallax>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {BENTO.map((c, i) => (
                <Reveal key={c.title} delay={(i % 3) * 120} className={c.span}>
                  <Parallax speed={i % 2 === 0 ? 0.03 : -0.03} className="h-full">
                    <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[#060f22]/70 p-8 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-[#298DFF]/50 hover:bg-[#060f22]/85 hover:shadow-[0_20px_60px_-15px_rgba(41,141,255,0.45)]">
                      <span className="pointer-events-none absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-[shine-sweep_1.1s_ease-out] group-hover:opacity-100" />
                      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#298DFF]/0 blur-[70px] transition-all duration-500 group-hover:bg-[#298DFF]/25" />
                      <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-[#298DFF]">
                        {c.kicker}
                      </p>
                      <h3 className="relative mt-4 text-2xl font-semibold tracking-tight">
                        {c.title}
                      </h3>
                      <p className="relative mt-3 text-[15px] leading-relaxed text-white/55">
                        {c.body}
                      </p>
                    </div>
                  </Parallax>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============ MANIFESTO ============ */}
        <section className="relative overflow-hidden py-32 sm:py-44">
          <Backdrop mood="deep" />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <Reveal>
              <Parallax speed={0.08}>
                <p className="mx-auto max-w-3xl text-3xl font-medium leading-snug tracking-[-0.02em] text-white/85 sm:text-5xl">
                  Most chatbots forget you the second you close the tab.{" "}
                  <span className="bg-gradient-to-r from-[#298DFF] to-[#9ec7ff] bg-clip-text text-transparent">
                    Remora attaches itself to your story and does not let go.
                  </span>
                </p>
              </Parallax>
            </Reveal>
            <Reveal delay={200}>
              <a
                href="#chat"
                className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden rounded-full border border-[#298DFF]/40 bg-[#298DFF]/10 px-8 py-4 text-sm font-semibold tracking-wide text-white backdrop-blur transition duration-300 hover:scale-[1.04] hover:border-[#298DFF]/70 hover:bg-[#298DFF]/20"
              >
                <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/20 blur-md animate-[shine-sweep_3.2s_ease-in-out_infinite]" />
                <span className="relative">TRY IT NOW</span>
                <span className="relative transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            </Reveal>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="relative overflow-hidden border-t border-white/10">
          <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-20">
            <Reveal>
              <Parallax speed={0.05}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#298DFF]">
                  Have a memory worth keeping?
                </p>
                <h2 className="mt-4 bg-gradient-to-b from-white/25 to-white/[0.04] bg-clip-text text-[13vw] font-bold leading-[0.9] tracking-[-0.05em] text-transparent sm:text-[9rem]">
                  STICK WITH IT.
                </h2>
              </Parallax>
            </Reveal>
            <div className="relative mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:items-center">
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
                  href="https://www.walrus.site"
                  className="transition hover:text-white"
                >
                  Walrus
                </a>
                <a
                  href="https://docs.walrus.site"
                  className="transition hover:text-white"
                >
                  Docs
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
