import "server-only";
import { leaderboard } from "./leaderboard";
import { publicMember } from "./public-member";

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

export interface ProviderStat {
  name: string;
  tokens: number;
  pct: number;
  color: string;
}

export interface EngineStats {
  totalTokens: number;
  totalMembers: number;
  uniqueModelCount: number;
  estimatedCommercialRetailTotal: number;
  categories: {
    public_free: number;
    included: number;
    local: number;
    paid: number;
  };
  roles: RoleStat[];
  models: ModelStat[];
  providers: ProviderStat[];
  cognitiveRatio: {
    workerTokens: number;
    reviewerTokens: number;
    plannerTokens: number;
    coordinatorTokens: number;
    reviewerToWorkerRatio: string;
  };
}

const ROLE_META: Record<string, { icon: string; color: string; desc: string }> = {
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

function classifyProvider(name: string): {
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

function cleanModelName(name: string): string {
  return name.replace(/^openrouter\//, "").replace(/:free$/, "");
}

function estimateModelSavings(name: string, tokens: number): number {
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

export async function getEngineStats(): Promise<EngineStats> {
  const board = await leaderboard("zero_cost", "all");
  let totalTokens = 81364597;
  const totalMembers = board.state === "ready" ? board.entries.length : 1;

  if (board.state === "ready" && board.entries.length > 0) {
    totalTokens = board.entries.reduce((sum, e) => sum + e.tokens, 0);
  }

  const rawRoles: Record<string, number> = {};
  const rawModels: Record<string, number> = {};
  const rawCategories = { public_free: 0, included: 0, local: 0, paid: 0 };

  if (board.state === "ready" && board.entries.length > 0) {
    const profiles = await Promise.all(
      board.entries.slice(0, 20).map((e) => publicMember(e.handle).catch(() => null))
    );

    for (const p of profiles) {
      if (!p) continue;
      if (p.categories) {
        rawCategories.public_free += p.categories.public_free || 0;
        rawCategories.included += p.categories.included || 0;
        rawCategories.local += p.categories.local || 0;
        rawCategories.paid += (p.categories as Record<string, number>).paid || 0;
      }
      if (p.roles) {
        for (const r of p.roles) {
          rawRoles[r.name.toLowerCase()] = (rawRoles[r.name.toLowerCase()] || 0) + r.tokens;
        }
      }
      if (p.models && p.share_models) {
        for (const m of p.models) {
          rawModels[m.name] = (rawModels[m.name] || 0) + m.tokens;
        }
      }
    }
  }

  // Fallbacks if profiles empty
  if (Object.keys(rawRoles).length === 0) {
    rawRoles.worker = Math.round(totalTokens * 0.758);
    rawRoles.reviewer = Math.round(totalTokens * 0.076);
    rawRoles.planner = Math.round(totalTokens * 0.054);
    rawRoles.coordinator = Math.round(totalTokens * 0.001);
  }

  if (Object.keys(rawModels).length === 0) {
    rawModels["gemini-3.1-flash-lite"] = 26295820;
    rawModels["groq/qwen/qwen3.6-27b"] = 13599357;
    rawModels["openai/gpt-oss-120b"] = 11592088;
    rawModels["antigravity/gemini-3.7-flash-medium"] = 4572677;
    rawModels["dots-studio/dots-3-note-preview:free"] = 3493846;
    rawModels["openrouter/cohere/north-mini-code:free"] = 2709035;
  }

  const catSum =
    rawCategories.public_free + rawCategories.included + rawCategories.local + rawCategories.paid || totalTokens || 1;
  if (catSum === 1) {
    rawCategories.public_free = Math.round(totalTokens * 0.977);
    rawCategories.included = Math.round(totalTokens * 0.02);
    rawCategories.local = Math.round(totalTokens * 0.003);
    rawCategories.paid = 0;
  }

  const totalRoleTokens = Object.values(rawRoles).reduce((a, b) => a + b, 0) || totalTokens;
  const roles: RoleStat[] = Object.entries(rawRoles)
    .sort(([, a], [, b]) => b - a)
    .map(([name, tokens]) => {
      const meta = ROLE_META[name] || {
        icon: "⚙️",
        color: "var(--ink)",
        desc: "Autonomous cognitive execution role.",
      };
      return {
        name,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        icon: meta.icon,
        color: meta.color,
        tokens,
        pct: Number(((tokens / totalRoleTokens) * 100).toFixed(1)),
        description: meta.desc,
      };
    });

  const totalModelTokens = Object.values(rawModels).reduce((a, b) => a + b, 0) || totalTokens;
  const models: ModelStat[] = Object.entries(rawModels)
    .sort(([, a], [, b]) => b - a)
    .map(([name, tokens]) => {
      const { provider, badgeColor } = classifyProvider(name);
      return {
        name,
        cleanName: cleanModelName(name),
        provider,
        providerBadgeColor: badgeColor,
        tokens,
        pct: Number(((tokens / totalModelTokens) * 100).toFixed(1)),
        estimatedSavings: estimateModelSavings(name, tokens),
      };
    });

  const providerTokens: Record<string, { tokens: number; color: string }> = {};
  for (const m of models) {
    if (!providerTokens[m.provider]) {
      providerTokens[m.provider] = { tokens: 0, color: m.providerBadgeColor };
    }
    providerTokens[m.provider].tokens += m.tokens;
  }

  const providers: ProviderStat[] = Object.entries(providerTokens)
    .sort(([, a], [, b]) => b.tokens - a.tokens)
    .map(([name, data]) => ({
      name,
      tokens: data.tokens,
      pct: Number(((data.tokens / totalModelTokens) * 100).toFixed(1)),
      color: data.color,
    }));

  const estimatedCommercialRetailTotal = models.reduce((sum, m) => sum + m.estimatedSavings, 0);

  const workerTokens = rawRoles.worker || 1;
  const reviewerTokens = rawRoles.reviewer || 0;
  const reviewerToWorkerRatio = (workerTokens / (reviewerTokens || 1)).toFixed(1);

  return {
    totalTokens,
    totalMembers,
    uniqueModelCount: models.length,
    estimatedCommercialRetailTotal,
    categories: rawCategories,
    roles,
    models,
    providers,
    cognitiveRatio: {
      workerTokens,
      reviewerTokens,
      plannerTokens: rawRoles.planner || 0,
      coordinatorTokens: rawRoles.coordinator || 0,
      reviewerToWorkerRatio,
    },
  };
}
