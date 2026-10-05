# Remora: The Chatbot That Sticks With You

*Built for Walrus Sessions 8, "Chatbots That Remember". Live at https://remora-delta.vercel.app. Source at https://github.com/cilokcimol/remora.*

## What it does

Remora is a web chatbot with one job: remember you. Tell it you are training for a marathon in November, close the tab, come back next week, and it will ask how the taper is going. Every other chatbot starts from zero each visit. Remora does not.

It is for anyone who has ever retyped the same context into a chat window for the tenth time. The problem it solves is simple: conversations should accumulate. A chatbot that forgets everything between sessions is a stranger every time. Remora is built to be the opposite, a companion that holds on tight.

## How Walrus Memory was integrated

The stack is Next.js (App Router) with the Vercel AI SDK. Memory comes from `@mysten-incubation/memwal` through its `withMemWal` middleware, which wraps the language model directly:

```ts
const model = withMemWal(llm, {
  key: process.env.MEMWAL_PRIVATE_KEY ?? "",
  accountId: process.env.MEMWAL_ACCOUNT_ID ?? "",
  serverUrl: process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
  namespace,
  maxMemories: 5,
  autoSave: true,
  minRelevance: 0.3,
});
```

Three design decisions matter here.

**One namespace per visitor.** The API route derives a namespace from a per browser user id (`remora-<userId>`). The same browser keeps its memories across sessions, and different visitors never see each other's memories. Privacy is structural, not a promise.

**Auto save plus semantic recall.** With `autoSave: true`, the middleware extracts meaningful facts from the conversation and encrypts them into blobs on Walrus mainnet in the background. On every new message it recalls up to 5 memories above 0.3 relevance and injects them into the model's context. Recall is by meaning, not keywords.

**No Big Two anywhere.** Inference runs on Z.AI GLM (`glm-4.7-flash`) as primary with automatic fallback to Mistral (`mistral-small-latest`) when the free tier saturates. Both are outside Anthropic and OpenAI, which keeps the project eligible for the Beyond the Big Two track.

## Before and after

Before memory, the chatbot was a polite amnesiac. You could tell it your name, refresh the page, and it would ask for your name again. Every session was a first meeting. The conversation below is what that looked like: technically fluent, completely forgetful.

After memory, the same flow changes character. Here is a real transcript from the live deployment, two separate conversations, same visitor:

**Conversation 1, teaching a fact:**

> You: My favorite noodle dish is bakmi cong sim. Remember that.
>
> Remora: I have saved that preference. Bakmi cong sim sounds delicious. I will remember this for when we talk again.

**Conversation 2, a new session, only this message sent:**

> You: What is my favorite noodle dish?
>
> Remora: You told me your favorite noodle dish is bakmi cong sim.

No chat history was passed in the second request. The answer came from a blob on Walrus, recalled by meaning and injected into context. That is the whole thesis: memory doing real work, visible in the conversation.

## Integration friction, honestly documented

Building on the free tier taught us a few things worth sharing.

First, AI SDK v6 changed the default endpoint for `createOpenAI()` providers to OpenAI's Responses API (`/v1/responses`). Z.AI does not implement it, so every call 404'd until we forced `/chat/completions` by calling `provider.chat(model)` explicitly. If your Z.AI integration suddenly 404s after an SDK upgrade, this is probably why.

Second, the free tier is flaky. Z.AI intermittently returns 429 rate limits and "temporarily overloaded" errors, and Mistral's free tier rate limits too. The fix was `maxRetries: 4` plus a cross provider fallback wrapper that fails over from Z.AI to Mistral on 429/5xx instead of erroring. Users never see the chaos.

Third, Walrus Memory's remember path is asynchronous by design: the SDK returns an accepted job immediately and the blob lands shortly after. Tests that teach a fact and immediately ask about it need a short wait, around 20 seconds in our experience, or the recall comes up empty. Not a bug, just something to design around.

## Try it

Open https://remora-delta.vercel.app, tell Remora something about yourself, close the tab, and come back. It will remember. The source, including the middleware wiring and the fallback logic, is public at https://github.com/cilokcimol/remora.
