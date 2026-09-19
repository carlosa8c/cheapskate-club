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
  accessTier: string;
  verifiedFree: boolean;
  successRate?: number;
}

export interface ModelHealthStat {
  model: string;
  cleanName: string;
  provider: string;
  requests: number;
  tokens: number;
  successes: number;
  failures: number;
  successRate: number;
  failureBreakdown: Record<string, number>;
}

export interface ModelPairStat {
  pairId: string;
  workerModel: string;
  reviewerModel: string;
  isIndependent: boolean;
  totalJobs: number;
  completionRate: number;
  reviewApprovedJobs: number;
  mergedRuns: number;
  totalTokens: number;
  avgTokensPerJob: number;
}

export interface ProviderHealthStat {
  provider: string;
  badgeColor: string;
  totalRequests: number;
  successRate: number;
  avgLatencyMs: number;
  rateLimitPct: number;
  status: "Optimal" | "Degraded" | "Throttled";
}

export interface SelfHealingIndex {
  initialWorkTokens: number;
  recoveryTokens: number;
  repairOverheadPct: number;
}

export const ROLE_META: Record<string, { icon: string; color: string; desc: string }> = {
  worker: {
    icon: "🧑‍💻",
    color: "var(--accent-mint)",
    desc: "The execution workhorse: editing files, running terminal checks, and tool calling.",
  },
  reviewer: {
    icon: "🛡️",
    color: "var(--status-info)",
    desc: "The quality gatekeeper: auditing diffs, inspecting tests, and enforcing safety.",
  },
  planner: {
    icon: "🗺️",
    color: "var(--status-purple)",
    desc: "The architect: breaking complex requests into actionable autonomous milestones.",
  },
  coordinator: {
    icon: "🧭",
    color: "var(--status-warning)",
    desc: "The dispatcher: routing tasks between subagents and orchestrating checkpoints.",
  },
};

export function classifyProvider(name: string): {
  provider: "Google" | "Groq" | "OpenRouter" | "Local" | "Other";
  badgeColor: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes("gemini") || lower.includes("google")) {
    return { provider: "Google", badgeColor: "var(--status-info)" };
  }
  if (lower.includes("groq")) {
    return { provider: "Groq", badgeColor: "var(--status-brand)" };
  }
  if (lower.includes("openrouter") || lower.includes(":free")) {
    return { provider: "OpenRouter", badgeColor: "var(--status-purple)" };
  }
  if (lower.includes("local") || lower.includes("gemma") || lower.includes("ollama")) {
    return { provider: "Local", badgeColor: "var(--status-success)" };
  }
  return { provider: "Other", badgeColor: "var(--status-purple)" };
}

export function cleanModelName(name: string): string {
  return name.replace(/^openrouter\//, "").replace(/:free$/, "");
}

export function classifyAccessTier(name: string, category?: string): { tier: string; verifiedFree: boolean } {
  if (category === "local" || name.toLowerCase().includes("local") || name.toLowerCase().includes("ollama")) {
    return { tier: "Local (zsh.00)", verifiedFree: true };
  }
  if (category === "included" || name.toLowerCase().startsWith("antigravity/")) {
    return { tier: "Included (zsh.00)", verifiedFree: true };
  }
  if (category === "paid") {
    return { tier: "Paid API", verifiedFree: false };
  }
  return { tier: "Public Free (zsh.00)", verifiedFree: true };
}
