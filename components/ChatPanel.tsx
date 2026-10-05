"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";

function getUserId(): string {
  let id = window.localStorage.getItem("remora-user-id");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("remora-user-id", id);
  }
  return id;
}

const SUGGESTIONS = [
  "What is Walrus Memory?",
  "How does it remember?",
  "What do you remember about me?",
];

function Chevron() {
  return (
    <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden="true">
      <path d="M1.5 2.5L4 5L6.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Paperclip() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5L12.4 20.1C11.2 21.3 9.4 22 7.5 22C3.9 22 1 19.1 1 15.5C1 13.6 1.7 11.8 2.9 10.6L14.5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(1.5,1)"
      />
    </svg>
  );
}

function UpArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5m0 0l-6 6m6-6l6 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatInner({ userId }: { userId: string }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { userId } }),
    [userId]
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLFormElement>(null);
  const busy = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // gentle 3D tilt on the composer card
  useEffect(() => {
    const card = cardRef.current;
    if (!card || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t = { x: 0, y: 0 };
    const c = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      t.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      t.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      c.x += (t.x - c.x) * 0.06;
      c.y += (t.y - c.y) * 0.06;
      card.style.transform = `perspective(1400px) rotateY(${(c.x * 2.4).toFixed(2)}deg) rotateX(${(-c.y * 2.4).toFixed(2)}deg)`;
    };
    window.addEventListener("mousemove", onMove);
    loop();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  };

  return (
    <form
      ref={cardRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit(input);
      }}
      className="e-card relative mx-auto w-full max-w-[720px] will-change-transform"
      style={{
        background: "rgba(41,41,43,.955)",
        backdropFilter: "blur(26px) saturate(112%)",
        WebkitBackdropFilter: "blur(26px) saturate(112%)",
        borderRadius: 26,
        boxShadow:
          "inset 0 0 0 1px rgba(214,228,255,.14), 0 22px 60px rgba(0,0,0,.30)",
      }}
    >
      {/* thread */}
      {hasMessages && (
        <div ref={scrollRef} className="max-h-[34vh] space-y-3 overflow-y-auto px-7 pb-1 pt-6">
          {messages.map((m, mi) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`msg-in max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${
                  m.role === "user" ? "bg-white/10 text-white" : "border border-white/10 bg-white/[0.04] text-white/90"
                }`}
                style={{ animationDelay: `${Math.min(mi, 6) * 0.06}s` }}
              >
                {m.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                  ) : null
                )}
              </div>
            </div>
          ))}
          {busy && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-[#F49D70]" />
                ))}
              </div>
            </div>
          )}
          {error && (
            <p className="rounded-xl border border-[#E88654]/40 bg-[#E88654]/10 px-4 py-2 text-xs text-[#FBBc94]">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      )}

      {/* welcome */}
      {!hasMessages && (
        <p className="e-welcome px-7 pt-7 text-[15px] leading-relaxed text-white/75">
          Hey, I am <span className="font-semibold text-white">Remora</span>. Tell me
          something about yourself. I keep it safe on Walrus and remember it when
          you return.
        </p>
      )}

      {/* input band */}
      <div className="px-7 pt-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(input);
            }
          }}
          rows={2}
          placeholder="Tell Remora something to remember..."
          aria-label="Message Remora"
          className="w-full resize-none bg-transparent text-[16px] leading-relaxed text-white placeholder:text-[#8B8C8E] outline-none"
        />
      </div>

      {/* toolbar: chips left, right cluster absolute on desktop */}
      <div className="tools relative mx-7 mb-[18px] mt-3 flex h-[30px] items-center gap-2 max-lg:h-auto max-lg:flex-wrap">
        <div className="e-chips flex items-center gap-[6px]">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="h-[30px] whitespace-nowrap rounded-[9px] border border-white/[0.05] px-3 text-[11.5px] font-medium leading-none text-[#909093] transition hover:text-[#c8c8cb]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,.088) 0%, rgba(255,255,255,.050) 45%, rgba(255,255,255,.038) 100%)",
              }}
            >
              <span className="inline-block" style={{ transform: "translateY(2px)" }}>{s}</span>
            </button>
          ))}
        </div>

        <div className="e-right right pointer-events-none absolute inset-0 max-lg:static max-lg:ml-auto max-lg:flex max-lg:items-center">
          <span
            className="pointer-events-auto absolute inline-flex items-center gap-[6px] text-[12.5px] font-normal leading-none text-[#98999C] max-lg:static"
            style={{ right: 118, top: 15 }}
          >
            Walrus Memory <Chevron />
          </span>
          <span
            className="pointer-events-auto absolute cursor-pointer text-[#A9AAAD] transition hover:text-white max-lg:static max-lg:ml-4"
            style={{ right: 62, top: 9 }}
            title="Attach"
          >
            <Paperclip />
          </span>
          <span className="e-send pointer-events-auto absolute max-lg:static max-lg:ml-4" style={{ right: 0, top: 0 }}>
            <span className="send-ring block rounded-full p-[2px]">
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send it"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{
                  background: "linear-gradient(163deg, #FBBC94 0%, #F49D70 46%, #E88654 100%)",
                  boxShadow: "0 3px 12px rgba(210,110,60,.34)",
                }}
              >
                <UpArrow />
              </button>
            </span>
          </span>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1023px) {
          .tools { align-items: center; }
        }
        @media (max-width: 599px) {
          .tools { flex-direction: column; align-items: stretch; gap: 12px; }
          .right { justify-content: flex-start; width: 100%; }
          .right > span:first-child { margin-right: auto; }
        }
      `}</style>
    </form>
  );
}

export default function ChatPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    setUserId(getUserId());
  }, []);
  if (!userId) {
    return <div className="mx-auto h-56 max-w-[720px] animate-pulse rounded-[26px] border border-white/10 bg-[#29292b]/60" />;
  }
  return <ChatInner userId={userId} />;
}
