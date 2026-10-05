import DropletScene from "@/components/DropletScene";
import ChatPanel from "@/components/ChatPanel";

const MEMORY_STEPS = [
  {
    title: "It remembers",
    body: "Every meaningful detail you share, your favorite fund, your questions, your decisions, is stored as an encrypted blob on Walrus, the decentralized storage network on Sui mainnet.",
  },
  {
    title: "It recalls",
    body: "When you return, Remora searches its memory by meaning, not keywords, and brings the right context into the conversation at the right moment.",
  },
  {
    title: "It continues",
    body: "No more starting from zero. Pick up exactly where you left off, days later, from any device, with your history intact.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#071224] font-sans text-white antialiased">
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#0e2a5c_0%,#0a1e3c_45%,#071224_100%)]" />
        <DropletScene />
        {/* grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 pb-20 pt-24 lg:grid-cols-[1fr_480px] lg:pt-28">
          <div>
            <p className="mb-5 inline-block rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 backdrop-blur">
              Walrus Sessions 8 · Chatbots That Remember
            </p>
            <h1 className="text-6xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              Meet
              <br />
              <span className="text-[#298DFF]">Remora.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
              The chatbot that sticks with you. Remora guides you through The
              Mutual Fun&apos;s five funds, seats, and weekly votes, and it
              actually remembers you between visits.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5 text-xs">
              {["Walrus Memory", "Z.AI GLM-4.7", "Sui Mainnet"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[#298DFF]/30 bg-[#298DFF]/10 px-3.5 py-1.5 font-medium text-[#9ec7ff]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <ChatPanel />
        </div>
      </section>

      {/* ============ MEMORY ============ */}
      <section className="bg-white text-[#0a1e3c]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#298DFF]">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Memory that sticks, not small talk that slips away.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {MEMORY_STEPS.map((s, i) => (
              <div
                key={s.title}
                className="rounded-3xl border border-[#0a1e3c]/10 bg-[#f7f8f8] p-8"
              >
                <p className="text-sm font-bold text-[#298DFF]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#0a1e3c]/70">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 bg-[#071224]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-white/50 sm:flex-row sm:items-center">
          <p>
            <span className="font-semibold text-white">Remora</span> · built for
            Walrus Session 8: Chatbots That Remember
          </p>
          <p>Memory on Walrus · Inference by Z.AI · Beyond the Big Two</p>
        </div>
      </footer>
    </main>
  );
}
