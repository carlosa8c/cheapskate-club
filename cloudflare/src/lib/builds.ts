import { SHOWCASE_PROJECTS, getShowcaseProject, type ShowcaseProject } from "./showcase-projects";

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
};

export async function builds(options: { id?: string; handle?: string; page?: number } = {}): Promise<{ items: Build[]; unavailable: boolean }> {
  // 1. If an exact showcase ID or slug was requested, return it immediately
  if (options.id) {
    const showcase = getShowcaseProject(options.id);
    if (showcase) {
      return { items: [showcase], unavailable: false };
    }
  }

  const url = import.meta.env.SUPABASE_URL || (typeof process !== "undefined" && process.env?.SUPABASE_URL);
  const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY || (typeof process !== "undefined" && process.env?.SUPABASE_PUBLISHABLE_KEY);

  // If Supabase not configured, serve the 6 showcase projects
  if (!url || !key) {
    const filtered = options.handle
      ? SHOWCASE_PROJECTS.filter((p) => p.handle.toLowerCase() === options.handle?.toLowerCase())
      : SHOWCASE_PROJECTS;
    return { items: filtered, unavailable: false };
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
      return { items: SHOWCASE_PROJECTS, unavailable: false };
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return { items: SHOWCASE_PROJECTS, unavailable: false };
    }

    // Combine Supabase builds with showcase exemplars (avoiding duplicate IDs)
    const dbIds = new Set((data as Build[]).map((b) => b.id.toLowerCase()));
    const missingShowcases = SHOWCASE_PROJECTS.filter((p) => !dbIds.has(p.id.toLowerCase()));
    
    // Showcase projects lead the workbench feed, followed by community contributions
    const combined = (options.page === 0 || !options.page)
      ? [...missingShowcases, ...(data as Build[])]
      : (data as Build[]);

    return { items: combined, unavailable: false };
  } catch {
    // High-availability fallback
    return { items: SHOWCASE_PROJECTS, unavailable: false };
  }
}
