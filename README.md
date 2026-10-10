# Remora

The chatbot that sticks with you.

Walrus Sessions 8 ("Chatbots That Remember") hackathon submission: an English language web chatbot with real long term memory, powered by Walrus Memory.

**Live demo:** https://remora-delta.vercel.app

## What it does

- **Remembers you between visits.** Facts you share are encrypted and stored as blobs on Walrus, the decentralized storage network on Sui mainnet, then recalled by meaning when they become relevant again.
- **Private memory namespace per visitor.** What you tell Remora never leaks into anyone else's chat.
- **Memory Vault.** A dedicated page lists everything Remora remembers about you, with write dates and blob ids. Memory you can inspect, not a black box.
- **Memory on/off comparison.** A toggle in the chat switches Walrus Memory off, so anyone can run the before and after test themselves: same question, generic answer without memory, personal answer with it.
- **Beyond the Big Two.** Inference runs on open weights models only: KelontongAI GLM (`glm-5.2`) as primary, with automatic failover to Z.AI (`glm-4.7-flash`) then Mistral (`mistral-small-latest`) when a provider saturates.

## Stack

- Next.js 16 (App Router), React 19, Tailwind CSS v4
- Vercel AI SDK v7 (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- Walrus Memory via `@mysten-incubation/memwal` (`withMemWal` middleware)
- Cinematic nature hero: layered mouse parallax (photo, drifting fog, ember particles), 3D tilt composer card, Saturn style orb emblems on feature cards

## Run it locally

Requirements: Node 18+.

```bash
git clone https://github.com/cilokcimol/remora.git
cd remora
npm install
cp .env.example .env.local   # then fill in the keys below
npm run dev                  # open http://localhost:3000
```

Environment variables (see `.env.example`):

| Variable | Where to get it | Required |
|---|---|---|
| `KELONTONG_API_KEY` | KelontongAI dashboard | yes |
| `ZAI_API_KEY` | https://z.ai/manage-apikey/apikey-list | no, first fallback |
| `MISTRAL_API_KEY` | Mistral console | no, second fallback |
| `MEMWAL_PRIVATE_KEY` | Walrus Memory dashboard (https://memory.walrus.xyz) | yes |
| `MEMWAL_ACCOUNT_ID` | Walrus Memory dashboard | yes |
| `MEMWAL_SERVER_URL` | defaults to `https://relayer.memory.walrus.xyz` | no |

Never commit real values. `.env.local` is gitignored.

## How it works

- `app/api/chat/route.ts` the streaming chat endpoint. It derives a per visitor namespace (`remora-<userId>`, same browser keeps its memories across sessions), wraps the model with `withMemWal` (auto save plus semantic recall of up to 5 memories at min relevance 0.3), and streams UI messages back to the client. Sending `memoryEnabled: false` skips the middleware entirely for the on/off comparison.
- `app/api/memories/route.ts` returns the stored memories for one visitor as JSON. Backs the Memory Vault page.
- `app/memory/page.tsx` the Memory Vault: count plus cards with text, write date, and short blob id.
- `lib/providers.ts` builds the chat model with chained failover: KelontongAI then Z.AI then Mistral.
- `lib/model-with-fallback.ts` tries the primary model first, fails over on 429/5xx, with `maxRetries: 1` so the chat fails fast instead of hammering providers.
- `lib/memwal.ts` namespace helpers, `withMemWal` options, and the vault listing (broad semantic recall, newest first).
- `lib/system-prompt.ts` the Remora persona: warm, plain spoken, never invents facts about Walrus or Sui.
- `components/` `Hero` (living nature backdrop), `ChatPanel` (glass chat UI with memory toggle and vault link), `Marquee`, `FeatureCards` (3D tilt plus orb emblems), `MemoryDemo`, `Manifesto`, `FooterPanels`, `Reveal`.

One gotcha worth knowing: AI SDK v6+ `createOpenAI()(model)` targets OpenAI's Responses API (`/v1/responses`), which Z.AI does not implement. This project forces `/chat/completions` by calling `provider.chat(model)` explicitly.

## Deploy

Import the repo into Vercel, set the same environment variables, and deploy. If you deploy via file upload rather than git, make sure `postcss.config.mjs` is included, or Tailwind will not compile and the site ships unstyled.

## Session 8 submission notes

Built for Walrus Sessions 8, "Chatbots That Remember". No OpenAI or Anthropic anywhere in the inference path, which keeps it eligible for the "Beyond the Big Two" track.
