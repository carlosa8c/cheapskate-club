export interface RoleStat {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  tokens: number;
  pct: number;
  description: string;
}

export interface ModelStat {
  name: string;
  cleanName: string;
  provider: "Google" | "Groq" | "OpenRouter" | "Local" | "Other";
  providerBadgeColor: string;
  tokens: number;
  pct: number;
  estimatedSavings: number;
}

export const ROLE_META: Record<string, { icon: string; color: string; desc: string }> = {
  worker: {
    icon: "🧑‍💻",
    color: "var(--accent-mint, #56cf89)",
    desc: "The execution workhorse: editing files, running terminal checks, and tool calling.",
  },
  reviewer: {
    icon: "🛡️",
    color: "#38bdf8",
    desc: "The quality gatekeeper: auditing diffs, inspecting tests, and enforcing safety.",
  },
  planner: {
    icon: "🗺️",
    color: "#a78bfa",
    desc: "The architect: breaking complex requests into actionable autonomous milestones.",
  },
  coordinator: {
    icon: "🧭",
    color: "#f59e0b",
    desc: "The dispatcher: routing tasks between subagents and orchestrating checkpoints.",
  },
};

export function classifyProvider(name: string): {
  provider: "Google" | "Groq" | "OpenRouter" | "Local" | "Other";
  badgeColor: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes("gemini") || lower.includes("google")) {
    return { provider: "Google", badgeColor: "#4285F4" };
  }
  if (lower.includes("groq")) {
    return { provider: "Groq", badgeColor: "#F55036" };
  }
  if (lower.includes("openrouter") || lower.includes(":free")) {
    return { provider: "OpenRouter", badgeColor: "#6366F1" };
  }
  if (lower.includes("local") || lower.includes("gemma") || lower.includes("ollama")) {
    return { provider: "Local", badgeColor: "#10B981" };
  }
  return { provider: "Other", badgeColor: "#8B5CF6" };
}

export function cleanModelName(name: string): string {
  return name.replace(/^openrouter\//, "").replace(/:free$/, "");
}

export function estimateModelSavings(name: string, tokens: number): number {
  const lower = name.toLowerCase();
  let ratePerMillion = 3.0;
  if (lower.includes("flash-lite") || lower.includes("mini")) {
    ratePerMillion = 0.30;
  } else if (lower.includes("flash") || lower.includes("27b")) {
    ratePerMillion = 1.00;
  } else if (lower.includes("120b") || lower.includes("pro")) {
    ratePerMillion = 5.00;
  }
  return Number(((tokens / 1_000_000) * ratePerMillion).toFixed(2));
}
