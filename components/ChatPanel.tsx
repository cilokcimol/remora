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
    <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl border-2 border-ink bg-white text-ink shadow-[0_6px_0_rgba(35,9,14,0.9)]">
      {/* header */}
      <div className="flex items-center gap-3 border-b-2 border-ink/10 bg-cream px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mascot.png"
          alt="Remora mascot"
          className="h-11 w-11 rounded-2xl border-2 border-ink/10 object-cover object-top"
        />
        <div>
          <p className="text-[15px] font-bold tracking-tight">Remora</p>
          <p className="flex items-center gap-1.5 text-xs text-ink/60">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-crimson" />
            Remembers you across sessions
          </p>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-white px-5 py-5">
        {messages.length === 0 && (
          <div className="rounded-2xl border-2 border-ink/10 bg-cream p-4">
            <p className="text-sm leading-relaxed text-ink/85">
              Hey, I&apos;m{" "}
              <span className="font-bold">Remora</span>. Like the remora
              fish, I stick with you: everything meaningful you tell me is
              stored on Walrus, and I remember you between visits. Ask me
              about Walrus Memory, or tell me something about yourself.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="rounded-full border-2 border-crimson/30 bg-white px-3 py-1.5 text-xs font-medium text-crimson transition hover:border-crimson hover:bg-crimson hover:text-cream"
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
                  ? "bg-crimson font-medium text-cream"
                  : "border-2 border-ink/10 bg-cream text-ink/90"
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
              <div className="flex gap-1.5 rounded-2xl border-2 border-ink/10 bg-cream px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-crimson"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

        {error && (
          <p className="rounded-xl border-2 border-crimson/30 bg-crimson/10 px-4 py-2 text-xs text-crimson">
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
        className="border-t-2 border-ink/10 bg-cream p-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Remora anything..."
            className="flex-1 rounded-full border-2 border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 outline-none focus:border-crimson"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream shadow-[0_2px_0_rgba(35,9,14,0.9)] transition hover:-translate-y-0.5 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink/45">
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
      <div className="h-[560px] animate-pulse rounded-3xl border-2 border-ink/10 bg-cream" />
    );
  }
  return <ChatInner userId={userId} />;
}
