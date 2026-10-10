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

## Slash commands

- `/help` lists every command.
- `/timetravel <what if scenario>` simulates an alternate present from a past decision, grounded in your stored history.
- `/mentor <name>` advises you in the voice of a famous figure who knows your actual life details.
- `/insight` surfaces hidden patterns across your memories: recurring stress sources, repeated themes, gaps between goals and behavior.
- `/blindspot` resurfaces forgotten ideas, promises, and commitments with dates and your own words.
- `/mybook` drafts chapters of your life story from your memories.
- `/testme` quizzes you on one concrete fact from your memories.
- `/share <tip>` strips identifying details with a dedicated model pass and adds the tip to the opt in community pool.
- `/wisdom <question>` answers from the anonymized community tip pool.
- `/incognito <label> <secret>` encrypts the secret in your browser (AES-GCM, key derived from your password) before upload. The server only sees ciphertext.
- `/reveal <label>` decrypts a stored secret locally. The password never leaves your device.

The persona also adapts its tone to how you write and will gently challenge you when your current message contradicts a principle you stated in a recalled memory, quoting your own past words.

## Privacy model

- Every visitor gets a private memory namespace derived from a random browser id (`remora-<uuid>`). Recall and save are always scoped to that namespace, so one visitor's memories can never surface in another visitor's chat.
- `/api/memories` and `/api/secrets` only serve the requesting visitor's namespace. The ids are unguessable 128 bit UUIDs.
- `/incognito` secrets get a second layer: AES-GCM encryption in the browser with a password derived key, on top of Walrus Memory's own encryption. Plaintext never leaves the device.
- The community pool behind `/share` and `/wisdom` is strictly opt in and lives in a separate namespace. A dedicated model pass removes names, places, companies, dates, and numbers before anything is stored there. Private namespaces are never read for community answers.
- Honest limits: there is no login system, so the browser id in local storage is the identity. Anyone with access to that browser can open its vault. Treat the vault password as the real boundary for secrets.

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
