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
  "What are the five funds?",
  "How do I get a seat?",
  "Do you remember me?",
];

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
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    sendMessage({ text: value });
    setInput("");
  };

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/[0.07] shadow-[0_20px_80px_-20px_rgba(41,141,255,0.45)] backdrop-blur-xl">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#298DFF] text-xl font-bold text-white shadow-[0_0_24px_rgba(41,141,255,0.8)]">
          R
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-white">
            Remora
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/60">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Remembers you across sessions
          </p>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-sm leading-relaxed text-white/85">
              Hey, I&apos;m{" "}
              <span className="font-semibold text-white">Remora</span>. I guide
              people through The Mutual Fun, and I actually remember you
              between visits. Ask me about the five funds, seats, voting, or
              anything else.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border border-[#298DFF]/40 bg-[#298DFF]/10 px-3 py-1.5 text-xs text-[#9ec7ff] transition hover:bg-[#298DFF]/25 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[#298DFF] text-white"
                  : "border border-white/10 bg-white/[0.06] text-white/90"
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

        {busy &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#298DFF]"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

        {error && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="border-t border-white/10 p-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Remora anything..."
            className="flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#298DFF]/60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-[#298DFF] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f7bef] disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/35">
          Powered by Walrus Memory on Sui mainnet
        </p>
      </form>
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
      <div className="h-[560px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl" />
    );
  }
  return <ChatInner userId={userId} />;
}
