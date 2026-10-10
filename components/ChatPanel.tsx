"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  decryptSecret,
  encryptSecret,
  isValidLabel,
  type SecretPayload,
} from "@/lib/secrets";

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
  "How it remembers",
  "My memories",
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
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { userId, memoryEnabled },
      }),
    [userId, memoryEnabled]
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLFormElement>(null);
  const busy = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;

  // Local notices for vault actions (never part of the chat thread).
  const [notices, setNotices] = useState<
    { id: number; title: string; body: string }[]
  >([]);
  const noticeId = useRef(0);
  const pushNotice = (title: string, body: string) =>
    setNotices((ns) => {
      const id = ++noticeId.current;
      return [...ns.slice(-2), { id, title, body }];
    });
  const dismissNotice = (id: number) =>
    setNotices((ns) => ns.filter((n) => n.id !== id));

  // Vault password lives only in page memory, never sent anywhere.
  const vaultPassword = useRef<string | null>(null);
  const [pwInput, setPwInput] = useState("");
  const [pendingVault, setPendingVault] = useState<
    | { kind: "store"; label: string; secret: string }
    | { kind: "open"; label: string }
    | null
  >(null);
  // Encrypted payloads cached this session (ciphertext only, never plaintext).
  const secretsCache = useRef<Map<string, SecretPayload>>(new Map());

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

  const runVaultAction = async (
    password: string,
    action: { kind: "store"; label: string; secret: string } | { kind: "open"; label: string }
  ) => {
    if (action.kind === "store") {
      try {
        const payload = await encryptSecret(password, action.label, action.secret);
        secretsCache.current.set(payload.label, payload);
        const res = await fetch("/api/secrets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...payload }),
        });
        if (!res.ok) throw new Error("The server could not store it.");
        pushNotice(
          "Secret stored",
          `Label "${action.label}" was encrypted on this device before upload. ` +
            "Nobody else can read it, not even the chatbot operator. " +
            `Use /reveal ${action.label} to read it back.`
        );
      } catch {
        pushNotice("Storage failed", "The secret could not be stored. Please try again.");
      }
      return;
    }
    try {
      let payload = secretsCache.current.get(action.label);
      if (!payload) {
        const res = await fetch(`/api/secrets?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        payload = (data.secrets ?? []).find(
          (s: SecretPayload) => s.label === action.label
        );
        if (payload) secretsCache.current.set(payload.label, payload);
      }
      if (!payload) {
        pushNotice("Not found", `No secret stored under label "${action.label}".`);
        return;
      }
      const plaintext = await decryptSecret(password, payload);
      pushNotice("Decrypted locally", plaintext);
    } catch {
      vaultPassword.current = null;
      pushNotice(
        "Wrong password",
        "That password could not decrypt the secret. It was cleared; try again."
      );
    }
  };

  const requireVaultPassword = (
    action: { kind: "store"; label: string; secret: string } | { kind: "open"; label: string }
  ) => {
    if (vaultPassword.current) {
      void runVaultAction(vaultPassword.current, action);
    } else {
      setPendingVault(action);
    }
  };

  const submitVaultPassword = () => {
    const pw = pwInput;
    if (!pw || !pendingVault) return;
    vaultPassword.current = pw;
    const action = pendingVault;
    setPendingVault(null);
    setPwInput("");
    void runVaultAction(pw, action);
  };

  const handleIncognito = (value: string) => {
    const rest = value.replace(/^\/incognito\s*/, "");
    const space = rest.indexOf(" ");
    const label = space === -1 ? rest : rest.slice(0, space);
    const secret = space === -1 ? "" : rest.slice(space + 1).trim();
    if (!isValidLabel(label) || !secret) {
      pushNotice(
        "How to use /incognito",
        "Type /incognito followed by a label and your secret, for example: " +
          "/incognito diary I am secretly learning the piano. " +
          "Labels may use letters, numbers, and dashes, up to 40 characters."
      );
      return;
    }
    requireVaultPassword({ kind: "store", label, secret });
  };

  const handleReveal = (value: string) => {
    const label = value.replace(/^\/reveal\s*/, "").trim();
    if (!isValidLabel(label)) {
      pushNotice(
        "How to use /reveal",
        "Type /reveal followed by the label, for example: /reveal diary."
      );
      return;
    }
    requireVaultPassword({ kind: "open", label });
  };

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    if (value.startsWith("/incognito")) {
      handleIncognito(value);
      setInput("");
      return;
    }
    if (value.startsWith("/reveal")) {
      handleReveal(value);
      setInput("");
      return;
    }
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
          you return. Try <span className="font-mono text-white/90">/help</span> to
          see what else I can do.
        </p>
      )}

      {/* local notices: vault confirmations, usage hints, decrypted secrets */}
      {notices.length > 0 && (
        <div className="space-y-2 px-7 pt-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-semibold text-white">{n.title}</p>
                <button
                  type="button"
                  onClick={() => dismissNotice(n.id)}
                  aria-label="Dismiss"
                  className="text-white/40 transition hover:text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-white/70">
                {n.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* vault password gate: the password never leaves this page */}
      {pendingVault && (
        <div className="px-7 pt-4">
          <div className="rounded-xl border border-[#F49D70]/40 bg-[#F49D70]/10 px-4 py-3">
            <p className="text-[13px] font-semibold text-white">Vault password</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/70">
              {pendingVault.kind === "store"
                ? `Set a password to encrypt "${pendingVault.label}". It stays on this device and is never sent anywhere. If you forget it, the secret cannot be recovered.`
                : `Enter the password for "${pendingVault.label}" to decrypt it locally.`}
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="password"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitVaultPassword();
                  }
                }}
                placeholder="Vault password"
                aria-label="Vault password"
                autoFocus
                className="h-9 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 text-[13px] text-white placeholder:text-white/35 outline-none focus:border-[#F49D70]/60"
              />
              <button
                type="button"
                onClick={submitVaultPassword}
                disabled={!pwInput}
                className="h-9 rounded-lg bg-[#F49D70] px-4 text-[13px] font-semibold text-black transition hover:brightness-110 disabled:opacity-40"
              >
                Unlock
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingVault(null);
                  setPwInput("");
                }}
                className="h-9 rounded-lg border border-white/15 px-4 text-[13px] text-white/70 transition hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* input band */}
      <div className="px-7 pb-6 pt-4">
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

        {/* toolbar: chips left, model + attach + send right */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-3">
          <div className="e-chips flex flex-wrap items-center gap-[6px]">
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
                <span className="inline-block" style={{ transform: "translateY(1px)" }}>{s}</span>
              </button>
            ))}
          </div>

          <div className="e-right ml-auto flex items-center">
            <button
              type="button"
              onClick={() => setMemoryEnabled((v) => !v)}
              aria-pressed={memoryEnabled}
              title="Turn off to compare answers without your stored memories"
              className="inline-flex items-center gap-2 text-[12.5px] font-normal leading-none text-[#98999C] transition hover:text-white"
            >
              <span
                className="relative inline-block h-[17px] w-[30px] rounded-full transition"
                style={{
                  background: memoryEnabled ? "#F49D70" : "rgba(255,255,255,.15)",
                }}
              >
                <span
                  className="absolute top-[2px] h-[13px] w-[13px] rounded-full bg-white transition-all"
                  style={{ left: memoryEnabled ? 15 : 2 }}
                />
              </span>
              Memory {memoryEnabled ? "on" : "off"}
            </button>
            <a
              href="/memory"
              className="ml-4 inline-flex items-center gap-[6px] text-[12.5px] font-normal leading-none text-[#98999C] transition hover:text-white"
              title="See everything Remora remembers about you"
            >
              Vault <Chevron />
            </a>
            <span
              className="ml-4 cursor-pointer text-[#A9AAAD] transition hover:text-white"
              title="Attach"
            >
              <Paperclip />
            </span>
            <span className="e-send ml-4 translate-y-[3px]">
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
      </div>
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
