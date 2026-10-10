/**
 * Slash command router for the chat.
 *
 * Commands are parsed from the latest user message in the chat route.
 * /incognito and /reveal are intercepted client side (ChatPanel) because
 * they need browser side encryption; everything else is handled here.
 */

export interface SlashCommand {
  name: string;
  arg: string;
}

const KNOWN_COMMANDS = new Set([
  "help",
  "timetravel",
  "mentor",
  "insight",
  "blindspot",
  "mybook",
  "testme",
  "share",
  "wisdom",
]);

/** Extracts a known slash command from raw user text, or null. */
export function parseSlashCommand(text: string): SlashCommand | null {
  const match = text.match(/^\/([a-z]+)\s*([\s\S]*)$/);
  if (!match) return null;
  if (!KNOWN_COMMANDS.has(match[1])) return null;
  return { name: match[1], arg: match[2].trim() };
}

/**
 * The prompt the model actually sees for a command turn.
 * The raw "/command ..." prefix is replaced so the model responds to
 * the intent, guided by the matching instruction below.
 */
export function effectivePrompt(cmd: SlashCommand): string {
  switch (cmd.name) {
    case "timetravel":
      return cmd.arg || "Simulate an alternate present for me based on my past.";
    case "mentor":
      return cmd.arg
        ? `I want mentorship and advice from ${cmd.arg}.`
        : "I want mentorship and advice.";
    case "insight":
      return "Analyze my memories and surface the hidden patterns in my life.";
    case "blindspot":
      return "Find unfinished ideas, promises, and commitments in my memories.";
    case "mybook":
      return "Write the chapters of my life story so far from my memories.";
    case "testme":
      return "Quiz me on something from my memories.";
    case "help":
      return "What slash commands are available and what does each do?";
    default:
      return cmd.arg;
  }
}

/**
 * Extra system instruction injected for a command turn. The base system
 * prompt still applies, so tone rules and memory habits stay active.
 */
export function commandInstruction(cmd: SlashCommand): string {
  switch (cmd.name) {
    case "help":
      return [
        "List every slash command the user can use, one short line each.",
        "Commands: /timetravel followed by a what if scenario about a past decision,",
        "/mentor followed by the name of a famous figure, /insight to surface hidden",
        "patterns across memories, /blindspot to resurface forgotten ideas and promises,",
        "/mybook to draft life story chapters, /testme for a memory quiz, /share followed",
        "by a tip to share anonymously with the community pool, /wisdom followed by a",
        "question to answer from community tips, /incognito followed by a label and a secret",
        "to store with full client side encryption, /reveal followed by a label to decrypt",
        "a stored secret locally. Keep the whole list tight.",
      ].join(" ");
    case "timetravel":
      return (
        `The user asks for a time travel simulation. Their scenario: "${cmd.arg}". ` +
        "Use every relevant recalled memory about their past: traits, finances, habits, " +
        "relationships, decisions. Reconstruct a vivid, specific alternate present as if " +
        "they had taken that different path. Ground each claim in their actual history. " +
        "Be honest about uncertainty where memories are thin. Close with one reflective question."
      );
    case "mentor":
      return (
        `Become ${cmd.arg} as the user's personal mentor. Speak in their recognizable ` +
        "voice, rhythm, and bluntness. But this is not a generic impression: weave in the " +
        "concrete facts recalled about this user's life, their projects, their constraints, " +
        `their goals. Give the advice ${cmd.arg} would give to THIS person specifically. ` +
        "If the recalled memories are thin, say what you still need to know."
      );
    case "insight":
      return (
        "You are analyzing the full set of recalled memories about this user. Find the " +
        "hidden patterns: recurring sources of stress or joy, themes that repeat across " +
        "months, gaps between stated goals and actual behavior, contradictions. Present " +
        "the three strongest patterns, each with concrete evidence quoted or paraphrased " +
        "from their history. Be direct. No generic horoscope language."
      );
    case "blindspot":
      return (
        "Search the recalled memories for unfinished business: ideas they said they would " +
        "revisit, promises made to themselves or others, goals mentioned once and abandoned, " +
        "plans with no follow through. For each, give the date and quote their own words. " +
        "Rank by how much it still seems to matter. End by asking which one to revive first."
      );
    case "mybook":
      return (
        "Draft the user's life story so far from the recalled memories. Organize into " +
        "chapters with titles: origins, turning points, achievements, ongoing threads, " +
        "open questions. Write warm narrative prose using their real details, names, and " +
        "dates from memory. Where memories are thin, mark the gap honestly instead of " +
        "inventing. End by asking which chapter to expand."
      );
    case "testme":
      return (
        "Pick one specific, verifiable fact from the recalled memories. Quiz the user: " +
        "ask one clear question about it WITHOUT revealing the answer. Tell them you will " +
        "confirm after they answer. Keep it playful and encouraging. Ask only one question."
      );
    default:
      return "";
  }
}

/**
 * System prompt for the anonymizer used by /share. The model rewrites the
 * user's tip so it can join the shared pool without identifying anyone.
 */
export const SHARE_ANONYMIZER_PROMPT =
  "Rewrite the user's message as an anonymous community tip. Remove every " +
  "name, place, company, date, number, and any other identifying detail. " +
  "Keep only the transferable lesson or strategy. Output the rewritten tip " +
  "alone, with no preamble and no commentary.";
