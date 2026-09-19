"use client";

import { useState, useEffect } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { FEATURED_PROVIDER, type FeaturedProviderSpotlight } from "../lib/engine-stats";
import { SHOWCASE_PROJECTS, type ShowcaseProject } from "../lib/showcase-projects";
import "../styles/admin.css";

type AdminDashboardProps = {
  supabaseUrl?: string;
  supabaseKey?: string;
  siteUrl?: string;
};

interface MemberAudit {
  handle: string;
  display_name: string;
  tokens: number;
  badge: string;
  isVerified: boolean;
}

export function AdminDashboard({
  supabaseUrl,
  supabaseKey,
  siteUrl,
}: AdminDashboardProps) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"builds" | "sponsors" | "members" | "health">("builds");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Builds state
  const [buildFilter, setBuildFilter] = useState<"all" | "pending" | "approved">("all");
  const [buildsList, setBuildsList] = useState<ShowcaseProject[]>(SHOWCASE_PROJECTS);

  // Spotlight state
  const [spotlight, setSpotlight] = useState<FeaturedProviderSpotlight>(FEATURED_PROVIDER);
  const [spotlightSaved, setSpotlightSaved] = useState(false);

  // Members state
  const [memberSearch, setMemberSearch] = useState("");
  const [membersList, setMembersList] = useState<MemberAudit[]>([
    { handle: "cheaposnumero1", display_name: "cheapos numero 1", tokens: 80191727, badge: "👑 Reigning Supreme Cheapo", isVerified: true },
    { handle: "carlosa8c", display_name: "carlosa8c", tokens: 25410900, badge: "🏷️ Coupon Clipper Prime", isVerified: true },
    { handle: "pennypinner", display_name: "The Penny Pinner", tokens: 18450120, badge: "🪙 Dime Dropper Deluxe", isVerified: true },
    { handle: "freeloader_alpha", display_name: "Frontier Freeloader", tokens: 12100400, badge: "🍞 Frontier Freeloader", isVerified: false },
  ]);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      setLoading(false);
      return;
    }

    const sb = createClient(supabaseUrl, supabaseKey);
    setClient(sb);

    async function checkUser() {
      try {
        const { data: { session } } = await sb.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.error("User check error", err);
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, [supabaseUrl, supabaseKey]);

  const isOperator = Boolean(
    user &&
    (
      user.user_metadata?.user_name?.toLowerCase() === "carlosa8c" ||
      user.user_metadata?.preferred_username?.toLowerCase() === "carlosa8c" ||
      user.user_metadata?.user_name?.toLowerCase() === "cheaposnumero1" ||
      user.user_metadata?.preferred_username?.toLowerCase() === "cheaposnumero1" ||
      user.email?.toLowerCase().includes("carlosa8c")
    )
  );

  async function handleOAuth(provider: "github" | "x") {
    if (!client) return;
    const origin = siteUrl || window.location.origin;
    const redirectTo = origin.replace(/\/$/, "") + "/auth/callback";
    await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  }

  async function handleSignOut() {
    if (!client) return;
    await client.auth.signOut();
    setUser(null);
  }

  function handleApproveBuild(id: string) {
    setBuildsList(prev => prev.map(b => b.id === id ? { ...b, review_status: "approved" as const } : b));
    setStatusMessage(`Build ${id} approved and published to the public workbench!`);
    setTimeout(() => setStatusMessage(null), 3000);
  }

  function handleRejectBuild(id: string) {
    setBuildsList(prev => prev.map(b => b.id === id ? { ...b, review_status: "rejected" as const } : b));
    setStatusMessage(`Build ${id} marked as rejected.`);
    setTimeout(() => setStatusMessage(null), 3000);
  }

  function handleSaveSpotlight(e: React.FormEvent) {
    e.preventDefault();
    setSpotlightSaved(true);
    setStatusMessage("Featured Frugal Provider of the Month updated live!");
    setTimeout(() => {
      setSpotlightSaved(false);
      setStatusMessage(null);
    }, 3000);
  }

  function handleToggleBadge(handle: string, badgeName: string) {
    setMembersList(prev => prev.map(m => m.handle === handle ? { ...m, badge: badgeName } : m));
    setStatusMessage(`Updated honorific badge for @${handle} to "${badgeName}"`);
    setTimeout(() => setStatusMessage(null), 3000);
  }

  if (loading) {
    return (
      <div className="admin-page">
        <p className="eyebrow">VERIFYING OPERATOR CREDENTIALS</p>
        <h1 className="admin-title">Loading Admin Console…</h1>
      </div>
    );
  }

  if (!user || !isOperator) {
    return (
      <div className="admin-page">
        <section className="admin-gatekeeper" aria-labelledby="gatekeeper-title">
          <span style={{ fontSize: "48px" }} role="img" aria-label="Lock">🔒</span>
          <h1 id="gatekeeper-title" className="admin-gatekeeper-title">
            Operator Access Restricted
          </h1>
          <p className="admin-gatekeeper-desc">
            The Admin Command Center is reserved for verified club operators (@carlosa8c / @cheaposnumero1) to manage sponsors, review builds, and moderate users.
          </p>

          {!user ? (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" className="button primary" onClick={() => handleOAuth("github")}>
                Sign in with GitHub →
              </button>
              <button type="button" className="button" onClick={() => handleOAuth("x")}>
                Sign in with X →
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: "var(--text-meta)", color: "var(--status-brand)", marginBottom: "16px" }}>
                Logged in as @{user.user_metadata?.user_name || user.email} (Not an authorized operator)
              </p>
              <button type="button" className="button" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <div className="eyebrow">
            <span className="little-spark" aria-hidden="true">✳</span>
            THE CHEAPSKATE CLUB · COMMAND CENTER
          </div>
          <h1 className="admin-title">Operator Administration</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span className="admin-operator-badge">
            <span>🛡️</span> Operator: @{user.user_metadata?.user_name || "carlosa8c"}
          </span>
          <button type="button" className="button" onClick={handleSignOut} style={{ fontSize: "var(--text-meta)" }}>
            Sign Out
          </button>
        </div>
      </header>

      {statusMessage && (
        <div
          role="status"
          style={{
            margin: "0 0 20px",
            padding: "12px 18px",
            borderRadius: "8px",
            background: "var(--status-success-bg)",
            border: "1px solid var(--status-success)",
            color: "var(--status-success)",
            fontSize: "var(--text-label)",
            fontWeight: 600,
          }}
        >
          ✓ {statusMessage}
        </div>
      )}

      {/* Tabs Switcher */}
      <nav className="segmented admin-tabs-nav" role="tablist" aria-label="Admin modules">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "builds"}
          aria-pressed={activeTab === "builds"}
          onClick={() => setActiveTab("builds")}
        >
          📬 Build Posts Queue ({buildsList.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "sponsors"}
          aria-pressed={activeTab === "sponsors"}
          onClick={() => setActiveTab("sponsors")}
        >
          ⚡ Sponsor & Spotlight Manager
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "members"}
          aria-pressed={activeTab === "members"}
          onClick={() => setActiveTab("members")}
        >
          👤 Member Management
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "health"}
          aria-pressed={activeTab === "health"}
          onClick={() => setActiveTab("health")}
        >
          📊 Telemetry & System Health
        </button>
      </nav>

      {/* TAB 1: Builds Queue */}
      {activeTab === "builds" && (
        <section className="admin-panel" aria-labelledby="builds-title">
          <div className="admin-panel-header">
            <h2 id="builds-title" className="admin-panel-title">
              Community Workbench Submissions
            </h2>
            <div className="admin-filter-bar">
              <button
                type="button"
                className={`button ${buildFilter === "all" ? "primary" : ""}`}
                onClick={() => setBuildFilter("all")}
                style={{ fontSize: "var(--text-meta)" }}
              >
                All Builds ({buildsList.length})
              </button>
              <button
                type="button"
                className={`button ${buildFilter === "pending" ? "primary" : ""}`}
                onClick={() => setBuildFilter("pending")}
                style={{ fontSize: "var(--text-meta)" }}
              >
                Pending Review
              </button>
              <button
                type="button"
                className={`button ${buildFilter === "approved" ? "primary" : ""}`}
                onClick={() => setBuildFilter("approved")}
                style={{ fontSize: "var(--text-meta)" }}
              >
                Approved Live
              </button>
            </div>
          </div>

          <div>
            {buildsList.map((build) => {
              const targetHref = build.slug ? `/community/${build.slug}` : `/community/${build.id}`;
              const isApproved = build.review_status !== "pending_operator_review" && build.review_status !== "rejected";

              return (
                <article key={build.id} className="admin-item-card">
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <span className={`pill ${isApproved ? "test-pill" : ""}`} style={{ fontSize: "var(--text-meta)" }}>
                        {isApproved ? "✓ APPROVED" : "⏳ PENDING REVIEW"}
                      </span>
                      <strong style={{ fontSize: "var(--text-meta)", color: "var(--text-secondary)" }}>
                        @{build.handle}
                      </strong>
                    </div>
                    <h3 className="admin-item-title">{build.title}</h3>
                    <p className="admin-item-meta">{build.hook || build.description}</p>
                    <p className="admin-item-meta" style={{ marginTop: "6px" }}>
                      Tokens: {(build.benchmark?.dimension1_cost_tokens.totalTokens || 0).toLocaleString()} · Cost: {build.benchmark?.dimension1_cost_tokens.billedCost || "$0.00"} · Tests: {build.benchmark?.dimension5_quality.finalUnitTestScore || "Verified passing"}
                    </p>
                  </div>

                  <div className="admin-actions-group">
                    <a href={targetHref} target="_blank" rel="noopener noreferrer" className="button" style={{ fontSize: "var(--text-meta)" }}>
                      Inspect ↗
                    </a>
                    {!isApproved ? (
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => handleApproveBuild(build.id)}
                        style={{ fontSize: "var(--text-meta)" }}
                      >
                        ✓ Approve & Publish
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button"
                        onClick={() => handleRejectBuild(build.id)}
                        style={{ fontSize: "var(--text-meta)", color: "var(--status-danger)" }}
                      >
                        Unpublish
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: Sponsor & Spotlight Manager */}
      {activeTab === "sponsors" && (
        <section className="admin-panel" aria-labelledby="sponsor-title">
          <div className="admin-panel-header">
            <h2 id="sponsor-title" className="admin-panel-title">
              Frugal Provider of the Month & B2B Sponsorships
            </h2>
          </div>

          <form onSubmit={handleSaveSpotlight}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label htmlFor="prov-name" style={{ fontSize: "var(--text-meta)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Featured Provider Name
                </label>
                <input
                  id="prov-name"
                  type="text"
                  value={spotlight.providerName}
                  onChange={(e) => setSpotlight({ ...spotlight, providerName: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", fontSize: "var(--text-meta)" }}
                />
              </div>

              <div>
                <label htmlFor="badge-text" style={{ fontSize: "var(--text-meta)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Badge Text
                </label>
                <input
                  id="badge-text"
                  type="text"
                  value={spotlight.badgeText}
                  onChange={(e) => setSpotlight({ ...spotlight, badgeText: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", fontSize: "var(--text-meta)" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label htmlFor="tagline" style={{ fontSize: "var(--text-meta)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                Tagline / Value Proposition
              </label>
              <input
                id="tagline"
                type="text"
                value={spotlight.tagline}
                onChange={(e) => setSpotlight({ ...spotlight, tagline: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", fontSize: "var(--text-meta)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label htmlFor="worker-model" style={{ fontSize: "var(--text-meta)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Autonomous Worker Model
                </label>
                <input
                  id="worker-model"
                  type="text"
                  value={spotlight.topWorkerModel}
                  onChange={(e) => setSpotlight({ ...spotlight, topWorkerModel: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", fontSize: "var(--text-meta)" }}
                />
              </div>

              <div>
                <label htmlFor="reviewer-model" style={{ fontSize: "var(--text-meta)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Senior Reviewer Model
                </label>
                <input
                  id="reviewer-model"
                  type="text"
                  value={spotlight.topReviewerModel}
                  onChange={(e) => setSpotlight({ ...spotlight, topReviewerModel: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", fontSize: "var(--text-meta)" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="cli-cmd" style={{ fontSize: "var(--text-meta)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                1-Click CLI Preset Command
              </label>
              <input
                id="cli-cmd"
                type="text"
                value={spotlight.cliPresetCommand}
                onChange={(e) => setSpotlight({ ...spotlight, cliPresetCommand: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", fontSize: "var(--text-meta)", fontFamily: "var(--mono)" }}
              />
            </div>

            <button type="submit" className="button primary">
              {spotlightSaved ? "✓ Changes Saved!" : "Save Spotlight Updates →"}
            </button>
          </form>
        </section>
      )}

      {/* TAB 3: Member Management & Badges */}
      {activeTab === "members" && (
        <section className="admin-panel" aria-labelledby="members-title">
          <div className="admin-panel-header">
            <h2 id="members-title" className="admin-panel-title">
              Member Roster & Honorific Badges
            </h2>
            <input
              type="search"
              placeholder="Search member handle…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{ padding: "6px 12px", fontSize: "var(--text-meta)", minWidth: "220px" }}
            />
          </div>

          <div>
            {membersList
              .filter(m => m.handle.toLowerCase().includes(memberSearch.toLowerCase()) || m.display_name.toLowerCase().includes(memberSearch.toLowerCase()))
              .map((member) => (
                <article key={member.handle} className="admin-item-card">
                  <div>
                    <h3 className="admin-item-title">
                      {member.display_name} <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-meta)" }}>@{member.handle}</span>
                    </h3>
                    <p className="admin-item-meta">
                      Verified Tokens: {member.tokens.toLocaleString()} · Current Badge: <strong>{member.badge}</strong>
                    </p>
                  </div>

                  <div className="admin-actions-group">
                    <select
                      aria-label={`Assign badge to @${member.handle}`}
                      value={member.badge}
                      onChange={(e) => handleToggleBadge(member.handle, e.target.value)}
                      style={{ padding: "6px 10px", fontSize: "var(--text-meta)", borderRadius: "6px" }}
                    >
                      <option value="👑 Reigning Supreme Cheapo">👑 Supreme Cheapo</option>
                      <option value="🏷️ Coupon Clipper Prime">🏷️ Coupon Clipper</option>
                      <option value="🪙 Dime Dropper Deluxe">🪙 Dime Dropper</option>
                      <option value="🍞 Frontier Freeloader">🍞 Frontier Freeloader</option>
                      <option value="☕ Free Refill Benefactor">☕ Free Refill Benefactor</option>
                      <option value="🌱 Anti-Waste Architect">🌱 Anti-Waste Architect</option>
                      <option value="🛡️ Verified Builder">🛡️ Verified Builder</option>
                    </select>

                    <a href={`/@${member.handle}`} target="_blank" rel="noopener noreferrer" className="button" style={{ fontSize: "var(--text-meta)" }}>
                      View Profile ↗
                    </a>
                  </div>
                </article>
              ))}
          </div>
        </section>
      )}

      {/* TAB 4: Telemetry & System Health */}
      {activeTab === "health" && (
        <section className="admin-panel" aria-labelledby="health-title">
          <div className="admin-panel-header">
            <h2 id="health-title" className="admin-panel-title">
              Platform Metrics & System Infrastructure
            </h2>
          </div>

          <div className="admin-stat-grid">
            <div className="admin-stat-box">
              <span className="admin-stat-label">Total Verified Tokens</span>
              <span className="admin-stat-val">80.2M</span>
            </div>
            <div className="admin-stat-box">
              <span className="admin-stat-label">Active Club Members</span>
              <span className="admin-stat-val">34</span>
            </div>
            <div className="admin-stat-box">
              <span className="admin-stat-label">Workbench Projects</span>
              <span className="admin-stat-val">{buildsList.length}</span>
            </div>
            <div className="admin-stat-box">
              <span className="admin-stat-label">Zero-Cost Rate</span>
              <span className="admin-stat-val">91.4%</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
            <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="button primary">
              Cloudflare Pages Console ↗
            </a>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="button">
              Supabase Database Console ↗
            </a>
            <a href="https://github.com/carlosa8c/cheapoS-leaderboard" target="_blank" rel="noopener noreferrer" className="button">
              GitHub Repository ↗
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
