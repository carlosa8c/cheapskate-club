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
};

export async function builds(options: { id?: string; handle?: string; page?: number } = {}): Promise<{ items: Build[]; unavailable: boolean }> {
  const url = import.meta.env.SUPABASE_URL || (typeof process !== "undefined" && process.env?.SUPABASE_URL);
  const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY || (typeof process !== "undefined" && process.env?.SUPABASE_PUBLISHABLE_KEY);

  if (!url || !key) {
    return { items: [], unavailable: false };
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

    if (!response.ok) return { items: [], unavailable: true };
    const data = await response.json();
    if (!Array.isArray(data)) return { items: [], unavailable: true };
    return { items: data as Build[], unavailable: false };
  } catch {
    return { items: [], unavailable: true };
  }
}
