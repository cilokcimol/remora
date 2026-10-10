# Remora: The Chatbot That Sticks With You

*How I built a chatbot with real long term memory on Walrus, what broke along the way, and the transcript that proves it works.*

*Built for Walrus Sessions 8, "Chatbots That Remember". Try it at remora-delta.vercel.app. Source at https://github.com/cilokcimol/remora.*

Every chatbot I have ever used has the memory of a goldfish. You tell it your name, your project, the thing you are training for. You close the tab. You come back tomorrow and it asks for your name again. We have built machines that can reason through complex problems, and they cannot remember what you had for lunch.

That gap is what Walrus Sessions 8 asked us to close: chatbots that remember. So I built Remora.

## Why a remora

A remora is the small fish that attaches itself to sharks with a suction disc on its head and rides along for the journey. It sticks with you. That is the entire product thesis in one image: a chatbot that attaches to your life and holds on across sessions, instead of resetting to a stranger every time you refresh.

## The build

Remora is a Next.js App Router site on Vercel, using the Vercel AI SDK for streaming chat. Memory comes from the official MemWal AI SDK (`@mysten-incubation/memwal`), through its `withMemWal` middleware that wraps the language model directly:

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

Three decisions shaped the design.

**One namespace per visitor.** The API route derives a namespace from a per browser user id, so the same browser keeps its memories across sessions, and different visitors never see each other's memories. Privacy is structural, not a promise.

**Auto save plus semantic recall.** With autoSave enabled, the middleware extracts meaningful facts from the conversation and encrypts them into blobs on Walrus mainnet in the background. On every new message it recalls the most relevant memories and injects them into the model's context. Recall is by meaning, not keywords, so "what am I training for" finds "marathon in November" without any shared words.

**No Big Two anywhere.** Inference runs on Z.AI GLM 4.7 Flash as primary, with automatic failover to Mistral Small when the primary saturates. Both sit outside Anthropic and OpenAI, which keeps the project eligible for the Beyond the Big Two track.

## The proof

Claims about memory are cheap. Here is a real transcript from the live deployment, two separate conversations, same visitor.

Conversation 1, teaching a fact:

> You: My favorite noodle dish is bakmi cong sim. Remember that.
>
> Remora: I have saved that preference. Bakmi cong sim sounds delicious. I will remember this for when we talk again.

Conversation 2, a new session, only this message sent:

> You: What is my favorite noodle dish?
>
> Remora: You told me your favorite noodle dish is bakmi cong sim.

No chat history was passed in the second request. The answer came from an encrypted blob on Walrus, recalled by meaning and injected into context. That is the whole thesis in one exchange: memory doing real work, visible in the conversation.

## What broke along the way

Building on the free tier taught me a few things worth sharing.

First, the AI SDK changed its default endpoint for OpenAI compatible providers to the Responses API. Z.AI does not implement it, so every call 404'd until I forced the chat completions endpoint explicitly. If your Z.AI integration 404s after an SDK upgrade, this is probably why.

Second, the free tier is flaky. Z.AI intermittently returns rate limits and overloaded errors, and Mistral's free tier rate limits too. The fix was retries plus a cross provider fallback wrapper that fails over instead of erroring. Users never see the chaos.

Third, Walrus Memory's remember path is asynchronous by design. The SDK accepts the job immediately and the blob lands shortly after. Tests that teach a fact and immediately ask about it need a short wait, around 20 seconds in my experience, or the recall comes up empty. Not a bug, just something to design around.

And while reading the SDK source to understand the failure modes, I found two real bugs and filed them upstream: autoSave silently drops memories when the analyzer call fails even once, with no retry and no error surfaced, and the recall path swallows every failure with zero signal. Both are now tracked on the MemWal repository. Building in the open means the ecosystem gets better too.

## What it solves

Remora solves the blank slate problem. Every conversation starts where the last one ended. That matters for anyone who talks to AI regularly: the developer who should not have to reintroduce their stack every morning, the student working through a months long course, the founder thinking out loud across weeks of late nights. Memory turns a tool into a companion.

The deeper point is architectural. Memory that lives in encrypted blobs on Walrus is portable and user scoped. It is not locked inside one provider's black box. Your history becomes an asset you carry, not exhaust you leave behind.

## Try it

Open remora-delta.vercel.app, tell Remora something about yourself, close the tab, and come back. It will remember. The full source, including the middleware wiring and the fallback logic, is public at https://github.com/cilokcimol/remora.
