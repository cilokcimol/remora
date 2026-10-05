"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";

type Msg = { role: "user" | "ai"; text: string };

const SCRIPT: Msg[] = [
  { role: "user", text: "I am training for a marathon in November." },
  { role: "ai", text: "Saved. I will bring it up when it is useful." },
  { role: "user", text: "What do you remember about me?" },
  {
    role: "ai",
    text: "You are training for a marathon in November. Race week is near. Want a taper plan?",
  },
];

function Bubble({ msg, index }: { msg: Msg; index: number }) {
  const user = msg.role === "user";
  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div
        className="msg-in max-w-[78%] rounded-[15px] bg-[#1c1c1c] px-4 py-3 text-[#efefef]"
        style={{
          fontSize: "clamp(0.8rem,1.12vw,1.06rem)",
          lineHeight: 1.42,
          animationDelay: `${index * 0.05}s`,
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

export default function MemoryDemo() {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            let i = 0;
            const tick = () => {
              i += 1;
              setShown(i);
              if (i < SCRIPT.length) setTimeout(tick, 1100);
            };
            setTimeout(tick, 500);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="demo" className="bg-[#0c0c0c] py-24 sm:py-32">
      <div className="mx-auto max-w-[1300px] px-6 sm:px-[6vw]">
        <Reveal className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ff8a3c]">
            Live demo
          </p>
          <h2 className="mt-4 font-sans text-[clamp(1.6rem,4.1vw,3.3rem)] font-normal leading-[1.11] tracking-[-0.02em] text-white">
            <span className="hl-mask"><span className="hl-line">Memory you can see</span></span>
            <span className="hl-mask"><span className="hl-line">working in real time.</span></span>
          </h2>
          <p className="mt-4 max-w-xl text-[clamp(0.82rem,1.25vw,1.125rem)] text-[#8b8b8d]">
            Tell Remora a fact. Ask about it later. It recalls the meaning,
            never the exact words.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div
            ref={ref}
            className="relative overflow-hidden rounded-[14px] p-6 sm:p-10"
            style={{
              background:
                "radial-gradient(120% 150% at 9% 52%, #3a2c14 0%, #2c2318 22%, rgba(44,35,24,0) 56%), radial-gradient(120% 150% at 95% 50%, #1d3a4a 0%, #16303c 34%, rgba(22,48,60,0) 64%), linear-gradient(96deg, #232a3f 0%, #3a2f3a 45%, #6b4a2e 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(135% 120% at 50% 50%, transparent 58%, rgba(0,0,0,.30) 100%)",
              }}
            />
            <div className="relative">
              <div className="mb-6 flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-[#ff8a3c]"
                  style={{
                    boxShadow: "0 0 8px rgba(255,138,60,.8)",
                    animation: "glow-pulse 2s ease-in-out infinite",
                  }}
                />
                <span className="text-sm font-medium text-white/85">Live memory</span>
              </div>

              <div className="mx-auto max-w-[814px] rounded-[18px] bg-[#0d0d0d] p-5 sm:p-7">
                <div className="min-h-[280px] space-y-4">
                  {SCRIPT.slice(0, shown).map((m, i) => (
                    <Bubble key={i} msg={m} index={i} />
                  ))}
                  {shown < SCRIPT.length && shown > 0 && (
                    <div className="flex justify-start">
                      <div className="flex gap-1.5 rounded-[15px] bg-[#1c1c1c] px-4 py-3">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-[#F49D70]" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex h-[48px] items-center justify-between rounded-full bg-[#fdfdfd] px-5">
                  <span className="text-[14px] text-[#6b6b6d]">
                    Ask about your marathon training...
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c0c0c]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 19V5m0 0l-6 6m6-6l6 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
