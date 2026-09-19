import { SHOWCASE_PROJECTS, getShowcaseProject, type ShowcaseProject, type BenchmarkTelemetry } from "./showcase-projects";
import { decodeBenchmarkComment, sanitizeProjectTitle, sanitizeProjectHook, sanitizeChecksSummary } from "./task-parser";

export type Build = {
  id: string;
  title: string;
  description: string;
  screenshot_url: string;
  project_url: string;
  discussion_url: string;
  created_at: string;
  handle: string;
  display_name: string;
  profile_public: boolean;
  show_usage: boolean;
  cheers: number;
  slug?: string;
  readme_url?: string;
  readme_content?: string;
  hook?: string;
  telemetry?: any;
  narrative?: any;
  review_status?: "pending_operator_review" | "approved" | "rejected";
  benchmark?: BenchmarkTelemetry;
};

export async function builds(
  options: {
    id?: string;
    handle?: string;
    page?: number;
    filterStatus?: "approved" | "pending" | "all";
  } = {}
): Promise<{ items: Build[]; unavailable: boolean }> {
  // 1. If an exact showcase ID or slug was requested, return it immediately
  if (options.id) {
    const showcase = getShowcaseProject(options.id);
    if (showcase) {
      return { items: [{ ...showcase, review_status: "approved" }], unavailable: false };
    }
  }

  const url = import.meta.env.SUPABASE_URL || (typeof process !== "undefined" && process.env?.SUPABASE_URL);
  const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY || (typeof process !== "undefined" && process.env?.SUPABASE_PUBLISHABLE_KEY);

  // If Supabase not configured, serve the 6 showcase projects
  if (!url || !key) {
    const filtered = options.handle
      ? SHOWCASE_PROJECTS.filter((p) => p.handle.toLowerCase() === options.handle?.toLowerCase())
      : SHOWCASE_PROJECTS;
    return { items: filtered.map((p) => ({ ...p, review_status: "approved" })), unavailable: false };
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/club_build_feed`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({
        build_filter: options.id || null,
        author_handle: options.handle || null,
        page_number: options.page || 0,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      // Fallback to showcase projects on upstream error
      return { items: SHOWCASE_PROJECTS.map((p) => ({ ...p, review_status: "approved" })), unavailable: false };
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return { items: SHOWCASE_PROJECTS.map((p) => ({ ...p, review_status: "approved" })), unavailable: false };
    }

    // Process and decode embedded benchmark & review status for each database record
    const processed: Build[] = (data as any[]).map((item) => {
      const decoded = decodeBenchmarkComment(item.description || "");
      const bm = decoded.benchmark;
      if (bm?.dimension5_quality?.checksSummary) {
        bm.dimension5_quality.checksSummary = sanitizeChecksSummary(bm.dimension5_quality.checksSummary);
      }
      const rawTitle = item.title || "";
      const cleanTitle = sanitizeProjectTitle(rawTitle);
      const rawHook = item.hook || (decoded.cleanText && decoded.cleanText.length <= 250 ? decoded.cleanText : undefined);
      const cleanHook = rawHook ? sanitizeProjectHook(rawHook) : undefined;
      return {
        ...item,
        title: cleanTitle,
        description: decoded.cleanText,
        hook: cleanHook,
        review_status: decoded.status || item.review_status,
        benchmark: bm || undefined,
        telemetry: bm ? {
          benchmark: bm,
          cost: bm.dimension1_cost_tokens.billedCost,
          tokens: bm.dimension1_cost_tokens.totalTokens,
          tests: bm.dimension5_quality.finalUnitTestScore || bm.dimension5_quality.checksSummary,
          requests: bm.dimension2_effort.totalActions,
          commitSha: bm.dimension5_quality.commitSha,
        } : item.telemetry,
      };
    });

    // If a specific ID was requested, return it (whether approved or pending review)
    if (options.id) {
      const found = processed.find(
        (b) => b.id.toLowerCase() === options.id!.toLowerCase() || b.slug?.toLowerCase() === options.id!.toLowerCase()
      );
      if (found) {
        return { items: [found], unavailable: false };
      }
    }

    // Filter by review status
    if (options.filterStatus === "pending") {
      const pendingOnly = processed.filter((b) => b.review_status === "pending_operator_review");
      return { items: pendingOnly, unavailable: false };
    }

    // Public feed: only show approved builds
    const approvedDbBuilds = processed.filter(
      (b) => b.review_status !== "pending_operator_review" && b.review_status !== "rejected"
    );

    const dbIds = new Set(approvedDbBuilds.map((b) => b.id.toLowerCase()));
    const missingShowcases = SHOWCASE_PROJECTS.filter((p) => !dbIds.has(p.id.toLowerCase())).map((p) => ({
      ...p,
      review_status: "approved" as const,
    }));

    const combined =
      options.page === 0 || !options.page
        ? [...missingShowcases, ...approvedDbBuilds]
        : approvedDbBuilds;

    return { items: combined, unavailable: false };
  } catch {
    return { items: SHOWCASE_PROJECTS.map((p) => ({ ...p, review_status: "approved" })), unavailable: false };
  }
}
