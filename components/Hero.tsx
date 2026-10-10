"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import ChatPanel from "@/components/ChatPanel";

const STACK = ["Walrus", "Sui", "Z.AI", "Mistral"];

/* deterministic ember particles (identical on server and client) */
const MOTES = Array.from({ length: 26 }, (_, i) => {
  const a = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
  const b = Math.abs((Math.sin(i * 78.233 + 4.7) * 12543.2) % 1);
  const big = i % 5 === 0;
  return {
    left: `${(a * 100).toFixed(2)}%`,
    top: `${(b * 100).toFixed(2)}%`,
    size: big ? 12 + b * 9 : 2.5 + b * 5,
    big,
    dur: 9 + a * 13,
    delay: -(a * 20),
    op: big ? 0.16 + b * 0.2 : 0.35 + b * 0.55,
    dx: (a - 0.5) * 130,
  };
});

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const moteRef = useRef<HTMLDivElement>(null);

  /* layered 3D parallax: photo deep, fog mid, embers front */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t = { x: 0, y: 0 };
    const c = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      t.x = (e.clientX / window.innerWidth - 0.5) * 2;
      t.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      c.x += (t.x - c.x) * 0.055;
      c.y += (t.y - c.y) * 0.055;
      if (bgRef.current)
        bgRef.current.style.transform = `translate3d(${(c.x * -14).toFixed(1)}px, ${(c.y * -10).toFixed(1)}px, 0)`;
      if (fogRef.current)
        fogRef.current.style.transform = `translate3d(${(c.x * -30).toFixed(1)}px, ${(c.y * -20).toFixed(1)}px, 0)`;
      if (moteRef.current)
        moteRef.current.style.transform = `translate3d(${(c.x * -56).toFixed(1)}px, ${(c.y * -38).toFixed(1)}px, 0)`;
    };
    window.addEventListener("mousemove", onMove);
    loop();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="chat" className="relative flex min-h-screen flex-col overflow-hidden">
      {/* living backdrop: photo + drifting fog + embers */}
      <div className="absolute inset-0 overflow-hidden">
        <div ref={bgRef} className="absolute -inset-[6%] will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero.jpg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-full w-full animate-[kenburns_20s_ease-in-out_infinite_alternate] object-cover"
          />
        </div>
        <div ref={fogRef} className="pointer-events-none absolute -inset-[10%] will-change-transform">
          <div className="fog-a" />
          <div className="fog-b" />
        </div>
        <div ref={moteRef} className="pointer-events-none absolute inset-0 will-change-transform" aria-hidden="true">
          {MOTES.map((m, i) => (
            <span
              key={i}
              className={`mote${m.big ? " big" : ""}`}
              style={
                {
                  left: m.left,
                  top: m.top,
                  width: m.size,
                  height: m.size,
                  "--d": `${m.dur.toFixed(1)}s`,
                  "--dl": `${m.delay.toFixed(1)}s`,
                  "--o": m.op.toFixed(2),
                  "--dx": `${m.dx.toFixed(0)}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0d12]/85 via-[#0a0d12]/30 to-[#0a0d12]" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-14 pt-36 text-center">
        <p className="e-badge mb-6 inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/70 px-4 py-2 text-sm font-medium text-[#1B133C] backdrop-blur-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#ff8a3c] text-[13px] font-bold text-white">
            8
          </span>
          Walrus Sessions 8 · Chatbots That Remember
        </p>

        <h1 className="e-h1 text-[36px] font-medium leading-[1.1] tracking-[0.0018em] text-white sm:text-5xl lg:text-[56px]" style={{ textShadow: "0 2px 22px rgba(0,0,0,.30)" }}>
          <span className="hl-mask">
            <span className="hl-line">
              The chatbot that{" "}
              <em className="font-serif italic text-[#FBBc94]">sticks</em>
            </span>
          </span>
          <span className="hl-mask">
            <span className="hl-line">with you.</span>
          </span>
        </h1>

        <p className="e-sub mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed tracking-[0.007em] text-white/65">
          Tell Remora about yourself. It keeps the memory safe on Walrus and
          recalls it when you return.
        </p>

        <div className="mt-9 w-full">
          <ChatPanel />
        </div>
      </div>

      {/* proof */}
      <footer className="relative z-10 flex-none pb-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6">
          <p className="e-proof text-[14px] font-medium tracking-[0.0065em] text-white/95" style={{ textShadow: "0 1px 12px rgba(0,0,0,.35)" }}>
            Powered by
          </p>
          <div className="flex items-center gap-[62px]">
            {STACK.map((s) => (
              <span
                key={s}
                className="e-logo text-[19px] font-semibold text-white"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,.30)" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </section>
  );
}
