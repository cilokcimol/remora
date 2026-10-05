"use client";

import ChatPanel from "@/components/ChatPanel";

const STACK = ["Walrus", "Sui", "Z.AI", "Mistral"];

export default function Hero() {
  return (
    <section id="chat" className="relative flex min-h-screen flex-col overflow-hidden">
      {/* backdrop */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.jpg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-full w-full animate-[kenburns_26s_ease-in-out_infinite_alternate] object-cover"
        />
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
