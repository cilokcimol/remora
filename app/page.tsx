"use client";

import ChatPanel from "@/components/ChatPanel";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";

const CARDS = [
  {
    kicker: "Storage",
    title: "Memories live on Walrus, not on a server",
    body: "Every fact Remora keeps is encrypted and stored as a blob on Walrus, the decentralized storage network on Sui mainnet. Verifiable, portable, owned by no company.",
  },
  {
    kicker: "Recall",
    title: "Remembers by meaning",
    body: "Semantic search pulls the right memory at the right moment. No keywords, no digging through old chats.",
  },
  {
    kicker: "Isolation",
    title: "Your memory is yours",
    body: "Each visitor gets a private namespace. What you tell Remora never leaks into someone else's conversation.",
  },
  {
    kicker: "Model",
    title: "Powered beyond the Big Two",
    body: "Runs on Z.AI's GLM with a Mistral fallback — not Anthropic or OpenAI. Open-weights spirit, frontier quality.",
  },
  {
    kicker: "Sessions",
    title: "Built for Session 8",
    body: "Walrus Sessions 8 is 'Chatbots That Remember.' Remora is the thesis in action: a chatbot whose memory outlives the tab.",
  },
  {
    kicker: "Presence",
    title: "Sticks with you, literally",
    body: "Like the remora fish that hitches a ride on sharks, this one attaches to your story and does not let go.",
  },
];

const STACK = ["Walrus", "Sui", "Z.AI", "Mistral"];

export default function Home() {
  return (
    <main className="font-sans text-white antialiased">
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {/* nature backdrop */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full animate-[kenburns_24s_ease-in-out_infinite_alternate] object-cover"
            draggable={false}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night/80 via-night/35 to-night" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,15,0.55)_100%)]" />

        {/* nav */}
        <header className="absolute inset-x-0 top-0 z-20">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <a href="#" className="text-[17px] font-semibold tracking-tight">
              Remora
            </a>
            <div className="hidden items-center gap-8 text-sm text-white/70 sm:flex">
              <a href="#chat" className="transition hover:text-white">
                Chat
              </a>
              <a href="#memory" className="transition hover:text-white">
                Memory
              </a>
              <a href="#manifesto" className="transition hover:text-white">
                Manifesto
              </a>
            </div>
            <a
              href="#chat"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-night transition hover:bg-white/85"
            >
              Get started
            </a>
          </nav>
        </header>

        {/* hero content */}
        <div
          id="chat"
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-16 pt-32 text-center"
        >
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 text-[12px] font-medium tracking-wide text-white/75 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              Walrus Sessions 8 · Chatbots That Remember
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[52px]">
              The chatbot that sticks with you.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/65">
              Tell Remora something about yourself. It encrypts the memory onto
              Walrus — and remembers you the next time you visit.
            </p>
          </Reveal>
          <Reveal delay={300} className="mt-9 w-full">
            <ChatPanel />
          </Reveal>
        </div>

        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-[float-slow_3s_ease-in-out_infinite] text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
          Scroll
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <section className="border-b border-white/10 bg-night py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 sm:flex-row sm:justify-center sm:gap-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {STACK.map((s) => (
              <span
                key={s}
                className="text-[15px] font-semibold text-white/55"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ============ MEMORY / FEATURES ============ */}
      <section id="memory" className="bg-night py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ember">
              Under the hood
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
              Memory, engineered.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/55">
              Everything a chatbot needs to actually remember you — storage,
              recall, and privacy — built on Walrus.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 100}>
                <div className="group h-full rounded-2xl border border-white/10 bg-char/70 p-7 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-ember/40 hover:bg-char">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-ember">
                    {c.kicker}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/55">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section
        id="manifesto"
        className="relative overflow-hidden bg-night py-28 sm:py-36"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,138,60,0.08),transparent_65%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="font-serif text-4xl italic leading-snug tracking-tight text-white/90 sm:text-6xl">
              Most chatbots forget you the second you close the tab.{" "}
              <span className="text-ember-soft">Remora sticks around.</span>
            </p>
          </Reveal>
          <Reveal delay={180}>
            <a
              href="#chat"
              className="mt-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ember-soft to-ember shadow-[0_8px_24px_-6px_rgba(255,138,60,0.7)] transition hover:scale-105"
              aria-label="Back to chat"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 5v14m0 0l-6-6m6 6l6-6"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 bg-night">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-16">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/35">
              Have a memory worth keeping?
            </p>
            <h2 className="mt-4 font-serif text-6xl italic tracking-tight sm:text-8xl">
              Stick with it.
            </h2>
          </Reveal>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/40 sm:flex-row sm:items-center">
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
    </main>
  );
}
