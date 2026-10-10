"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StoredMemory } from "@/lib/memwal";

function formatDate(iso: string | null): string {
  if (!iso) return "Date unavailable";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date unavailable";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function shortBlobId(blobId: string): string {
  if (blobId.length <= 16) return blobId;
  return `${blobId.slice(0, 8)}...${blobId.slice(-6)}`;
}

export default function MemoryVault() {
  const [memories, setMemories] = useState<StoredMemory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = window.localStorage.getItem("remora-user-id");
    if (!userId) {
      setMemories([]);
      return;
    }
    fetch(`/api/memories?userId=${encodeURIComponent(userId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Request failed");
        setMemories(data.memories);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0d12] font-sans text-white antialiased">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="text-sm text-white/50 transition hover:text-white"
        >
          Back to Remora
        </Link>

        <h1 className="mt-8 text-[clamp(2rem,5vw,3.5rem)] font-normal leading-tight tracking-[-0.02em]">
          Memory Vault
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/60">
          Everything Remora remembers about you. Each entry is encrypted and
          stored as a blob on Walrus, recalled by meaning when it becomes
          relevant again. Only this browser can see this list.
        </p>

        {error && (
          <p className="mt-8 rounded-xl border border-[#E88654]/40 bg-[#E88654]/10 px-4 py-3 text-sm text-[#FBBC94]">
            Could not load memories: {error}
          </p>
        )}

        {memories === null && !error && (
          <div className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>
        )}

        {memories !== null && memories.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-[15px] text-white/70">Nothing stored yet.</p>
            <p className="mt-2 text-sm text-white/45">
              Tell Remora something in the chat and it will appear here.
            </p>
            <Link
              href="/#chat"
              className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:brightness-90"
            >
              Open the chat
            </Link>
          </div>
        )}

        {memories !== null && memories.length > 0 && (
          <div className="mt-8">
            <p className="mb-4 text-sm text-white/45">
              {memories.length} {memories.length === 1 ? "memory" : "memories"}{" "}
              stored
            </p>
            <div className="space-y-3">
              {memories.map((m) => (
                <article
                  key={m.blobId}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <p className="text-[14.5px] leading-relaxed text-white/90">
                    {m.text}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                    <span>{formatDate(m.createdAt)}</span>
                    <span className="font-mono" title={m.blobId}>
                      {shortBlobId(m.blobId)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
