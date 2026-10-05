"use client";

import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import FeatureCards from "@/components/FeatureCards";
import MemoryDemo from "@/components/MemoryDemo";
import Manifesto from "@/components/Manifesto";
import FooterPanels from "@/components/FooterPanels";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <main id="top" className="font-sans text-white antialiased">
      <Nav />
      <Hero />
      <Marquee />
      <FeatureCards />
      <MemoryDemo />
      <Manifesto />
      <FooterPanels />
      <footer className="border-t border-white/10 bg-[#0a0d12]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-10 text-sm text-white/40 sm:flex-row sm:items-center">
          <Reveal>
            <p>
              <span className="font-semibold text-white">Remora</span> · Walrus
              Session 8: Chatbots That Remember
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex gap-6">
              <a href="https://github.com/cilokcimol/remora" className="transition hover:text-white">
                GitHub
              </a>
              <a href="https://www.walrus.site" className="transition hover:text-white">
                Walrus
              </a>
              <a href="https://docs.walrus.site" className="transition hover:text-white">
                Docs
              </a>
            </div>
          </Reveal>
        </div>
      </footer>
    </main>
  );
}
