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
  "How does your memory work?",
  "What do you remember about me?",
];

function SendArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5m0 0l-6 6m6-6l6 6"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatInner({ userId }: { userId: string }) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { userId },
      }),
    [userId]
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // subtle 3D tilt on the composer card
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
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
      c.x += (t.x - c.x) * 0.05;
      c.y += (t.y - c.y) * 0.05;
      card.style.transform = `perspective(1200px) rotateY(${c.x * 2.2}deg) rotateX(${-c.y * 2.2}deg)`;
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
    <div
      ref={cardRef}
      className="overflow-hidden rounded-3xl border border-white/10 bg-char/85 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl will-change-transform"
    >
      {/* thread */}
      {hasMessages && (
        <div
          ref={scrollRef}
          className="max-h-[38vh] space-y-4 overflow-y-auto px-6 pb-2 pt-6"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-white/10 text-white"
                    : "border border-white/10 bg-white/[0.04] text-white/90"
                }`}
              >
                {m.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          ))}
          {busy && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-ember"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          {error && (
            <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-2 text-xs text-ember-soft">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      )}

      {/* composer */}
      <div className="p-5 sm:p-6">
        {!hasMessages && (
          <p className="mb-4 text-[15px] leading-relaxed text-white/75">
            Hey, I&apos;m{" "}
            <span className="font-semibold text-white">Remora</span>. Tell me
            something about yourself — I&apos;ll keep it safe on Walrus and
            remember it next time you visit.
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={hasMessages ? 2 : 3}
            placeholder="Tell Remora something to remember..."
            className="w-full resize-none bg-transparent text-[17px] leading-relaxed text-white placeholder:text-white/35 outline-none"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!hasMessages &&
              SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[13px] text-white/70 transition hover:border-white/25 hover:text-white"
                >
                  {s}
                </button>
              ))}
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/70 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                Walrus Memory
              </span>
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-ember-soft to-ember shadow-[0_8px_24px_-6px_rgba(255,138,60,0.7)] transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                <SendArrow />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  if (!userId) {
    return (
      <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-char/60 backdrop-blur-xl" />
    );
  }
  return <ChatInner userId={userId} />;
}
