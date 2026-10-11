"use client";

import Reveal from "@/components/Reveal";

const FEATURES = [
  {
    command: "/timetravel",
    title: "Time Traveler",
    body: "Replay a past decision and simulate the life you would be living today, reconstructed from your own history.",
  },
  {
    command: "/mentor",
    title: "Mentor Simulator",
    body: "Get advice in the voice of any great figure, with full knowledge of your projects, constraints, and goals.",
  },
  {
    command: "/insight",
    title: "Insight Extraction",
    body: "Surfaces the hidden patterns across your memories: recurring stress, repeated themes, gaps between goals and behavior.",
  },
  {
    command: "/blindspot",
    title: "Blind Spot Illuminator",
    body: "Resurfaces forgotten ideas and promises with dates and your own words, so nothing valuable evaporates.",
  },
  {
    command: "/mybook",
    title: "Legacy Story Book",
    body: "Drafts chapters of your life story from your memories: origins, turning points, achievements, open questions.",
  },
  {
    command: "/testme",
    title: "Memory Exam",
    body: "Quizzes you on one concrete fact from your own history. Active recall, powered by your vault.",
  },
  {
    command: "/incognito",
    title: "Secret Keeper",
    body: "Stores secrets encrypted in your browser before upload. Not even the operator can read them. Reveal with /reveal.",
  },
  {
    command: "/share",
    title: "Community Wisdom",
    body: "Share an anonymized tip to the opt in pool, or query it with /wisdom. Private memories are never touched.",
  },
  {
    command: "Always on",
    title: "Adaptive Tone",
    body: "Matches your energy and writing style. Warm and steady when life is heavy, direct when you are.",
  },
  {
    command: "Always on",
    title: "Friction Absorber",
    body: "Gently challenges you when your words contradict a principle you stated before, quoting your own past.",
  },
];

export default function UpgradeFeatures() {
  return (
    <section id="upgrade" className="bg-[#0c0f16] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-12 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff8a3c]">
            Latest upgrade
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            Ten new ways your memory works for you.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-white/55">
            Type a slash command in the chat. Each one turns your stored
            history into something new: a simulation, a mentor, a pattern,
            a quiz, a vault.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div className="h-full rounded-2xl border border-white/10 bg-[#131318]/80 p-7 backdrop-blur transition-[border-color] duration-300 hover:border-[#ff8a3c]/40">
                <span className="inline-block rounded-md bg-[#ff8a3c]/10 px-2.5 py-1 font-mono text-[12px] font-semibold text-[#ff8a3c]">
                  {f.command}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/55">
                  {f.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
