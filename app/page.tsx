"use client";

import Mascot from "@/components/Mascot";
import ChatPanel from "@/components/ChatPanel";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";

const PILLS = [
  { label: "Start chatting", href: "#chat", style: "solid" },
  { label: "How memory works", href: "#memory", style: "solid" },
  { label: "Session 8 entry", href: "#manifesto", style: "outline" },
] as const;

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
    kicker: "Mascot",
    title: "Sticks with you, literally",
    body: "Like the remora fish that hitches a ride on sharks, this one attaches to your story and does not let go.",
  },
];

function Pill({
  label,
  href,
  style,
}: {
  label: string;
  href: string;
  style: "solid" | "outline";
}) {
  return (
    <a
      href={href}
      className={
        style === "solid"
          ? "rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_2px_0_rgba(35,9,14,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_rgba(35,9,14,0.9)] active:translate-y-0 active:shadow-[0_2px_0_rgba(35,9,14,0.9)]"
          : "rounded-full border-2 border-cream/70 px-5 py-2 text-sm font-semibold text-cream transition duration-200 hover:-translate-y-0.5 hover:border-cream hover:bg-cream/10"
      }
    >
      {label}
    </a>
  );
}

export default function Home() {
  return (
    <main className="font-sans text-cream antialiased selection:bg-ink selection:text-cream">
      {/* ============ NAV ============ */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="#" className="text-xl font-bold tracking-tight">
            Remora<span className="align-super text-xs">®</span>
            <span className="ml-1.5 inline-block animate-[wiggle_3s_ease-in-out_infinite] text-cream">
              ✳
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium sm:flex">
            <a href="#chat" className="transition hover:opacity-70">
              Chat
            </a>
            <a href="#memory" className="transition hover:opacity-70">
              Memory
            </a>
            <a href="#manifesto" className="transition hover:opacity-70">
              Manifesto
            </a>
          </div>
          <a
            href="#chat"
            className="text-sm font-semibold underline decoration-2 underline-offset-4 transition hover:opacity-70"
          >
            Get in touch
          </a>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-crimson">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-6 pt-28 lg:grid-cols-2 lg:pt-24">
          <div className="relative z-10 pb-10 lg:pb-0">
            <Reveal>
              <p className="font-serif text-5xl italic leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Hey there, meet Remora,
              </p>
              <p className="mt-3 text-lg font-medium text-cream/85">
                Walrus Sessions 8&rsquo;s chatbot that remembers you.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cream/75">
                Glad you stopped in. Good taste tends to find us. Tell me
                something about yourself — I&rsquo;ll keep it safe on Walrus
                and remember it the next time you visit.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap gap-3">
                {PILLS.map((p) => (
                  <Pill key={p.label} {...p} />
                ))}
              </div>
            </Reveal>
          </div>
          <div className="relative h-[52vh] sm:h-[60vh] lg:h-[92vh]">
            <Mascot className="absolute inset-0 h-full w-full animate-[pop-in_1.1s_cubic-bezier(0.22,1,0.36,1)_both]" />
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-[float-slow_3s_ease-in-out_infinite] text-[11px] font-medium uppercase tracking-[0.3em] text-cream/60">
          scroll for more
        </div>
      </section>

      <Marquee />

      {/* ============ CHAT ============ */}
      <section id="chat" className="bg-cream py-24 text-ink sm:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="mb-10 text-center">
            <p className="font-serif text-5xl italic tracking-tight sm:text-6xl">
              Talk to me.
            </p>
            <p className="mt-3 text-lg text-ink/60">
              I will remember this conversation.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <ChatPanel />
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 text-center text-sm text-ink/50">
              Tell it something about yourself, then come back tomorrow and ask
              what it remembers.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ MEMORY / FEATURES ============ */}
      <section id="memory" className="bg-crimson py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cream/70">
              Under the hood
            </p>
            <h2 className="mt-4 font-serif text-5xl italic tracking-tight sm:text-6xl">
              Memory, engineered.
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 110}>
                <div className="group h-full rounded-3xl bg-cream p-7 text-ink shadow-[0_3px_0_rgba(35,9,14,0.9)] transition duration-200 hover:-translate-y-1.5 hover:rotate-[-0.5deg] hover:shadow-[0_8px_0_rgba(35,9,14,0.9)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-crimson">
                    {c.kicker}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl italic leading-tight">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink/65">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section id="manifesto" className="bg-cream py-28 text-ink sm:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="font-serif text-4xl italic leading-snug tracking-tight sm:text-6xl">
              Most chatbots forget you the second you close the tab.{" "}
              <span className="text-crimson">
                Remora sticks around.
              </span>
            </p>
          </Reveal>
          <Reveal delay={180}>
            <a
              href="#chat"
              className="mt-10 inline-block rounded-full bg-crimson px-8 py-3.5 text-sm font-bold text-cream shadow-[0_3px_0_rgba(35,9,14,0.9)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_0_rgba(35,9,14,0.9)]"
            >
              Try it now ↓
            </a>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-crimson-deep">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-20">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cream/70">
              Have a memory worth keeping?
            </p>
            <h2 className="mt-4 font-serif text-[16vw] italic leading-[0.9] tracking-tight sm:text-[9rem]">
              Stick with it.
            </h2>
          </Reveal>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-cream/20 pt-8 text-sm text-cream/60 sm:flex-row sm:items-center">
            <p>
              <span className="font-bold text-cream">Remora</span> · Walrus
              Session 8: Chatbots That Remember
            </p>
            <div className="flex gap-6 font-medium">
              <a
                href="https://github.com/cilokcimol/remora"
                className="transition hover:text-cream"
              >
                GitHub
              </a>
              <a
                href="https://www.walrus.site"
                className="transition hover:text-cream"
              >
                Walrus
              </a>
              <a
                href="https://docs.walrus.site"
                className="transition hover:text-cream"
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
