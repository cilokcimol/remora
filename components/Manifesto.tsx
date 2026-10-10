"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";

const SENTENCE: { text: string; accent?: boolean }[] = [
  { text: "Most" }, { text: "chatbots" }, { text: "forget" }, { text: "you" },
  { text: "the" }, { text: "moment" }, { text: "you" }, { text: "close" },
  { text: "the" }, { text: "tab." },
  { text: "Remora", accent: true }, { text: "holds", accent: true },
  { text: "on", accent: true }, { text: "tight.", accent: true },
];

export default function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("on");
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="manifesto" className="relative overflow-hidden bg-[#0a0d12] py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,138,60,0.07),transparent_65%)]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <p ref={ref} className="w-reveal font-serif text-4xl italic leading-snug tracking-tight text-white/90 sm:text-6xl">
            {SENTENCE.map((w, i) => (
              <span key={i}>
                <span
                  className={`w ${w.accent ? "text-[#FBBc94]" : ""}`}
                  style={{ transitionDelay: `${i * 0.045}s` }}
                >
                  {w.text}
                </span>{" "}
              </span>
            ))}
          </p>
        </Reveal>
        <Reveal delay={200}>
          <a
            href="#chat"
            className="mt-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FBBc94] to-[#E88654] shadow-[0_8px_24px_-6px_rgba(255,138,60,0.7)] transition hover:scale-110"
            aria-label="Back to chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
