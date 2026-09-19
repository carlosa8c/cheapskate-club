"use client";

import { useState, useEffect } from "react";
import type { Member } from "../lib/member";
import type { Build } from "../lib/builds";
import { MemberStats } from "./member-stats";
import { sanitizeProjectTitle, sanitizeProjectHook } from "../lib/task-parser";
import "../styles/member-profile.css";

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

interface MemberProfileViewProps {
  member: Member;
  builds: Build[];
  initialTab?: "telemetry" | "builds";
}

export function MemberProfileView({
  member,
  builds,
  initialTab = "telemetry",
}: MemberProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"telemetry" | "builds">(initialTab);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab");
      if (urlTab === "builds" || urlTab === "telemetry") {
        setActiveTab(urlTab);
      }
    }
  }, []);

  function handleTabChange(tab: "telemetry" | "builds") {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      if (tab === "telemetry") {
        u.searchParams.delete("tab");
      } else {
        u.searchParams.set("tab", tab);
      }
      window.history.replaceState(null, "", u.pathname + u.search);
    }
  }

  return (
    <div className="member-profile-body">
      {/* Profile Section Navigation Bar */}
      <div className="member-profile-tabs-row">
        <div className="segmented" role="tablist" aria-label="Profile views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "telemetry"}
            aria-pressed={activeTab === "telemetry"}
            onClick={() => handleTabChange("telemetry")}
          >
            📊 Compute Telemetry
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "builds"}
            aria-pressed={activeTab === "builds"}
            onClick={() => handleTabChange("builds")}
          >
            🛠️ Community Builds ({builds.length})
          </button>
        </div>

        <div>
          <a href="#club-card" className="inline-link">
            🪪 Verified Club Card ↓
          </a>
        </div>
      </div>

      {/* View 1: Dense Telemetry Analysis */}
      {activeTab === "telemetry" && (
        <section aria-label="Compute Telemetry">
          <MemberStats member={member} />
        </section>
      )}

      {/* View 2: Community Showcase Builds */}
      {activeTab === "builds" && (
        <section className="member-builds-section" aria-label="Community Builds">
          <div className="member-builds-header">
            <div className="eyebrow">
              <span className="little-spark" aria-hidden="true">✳</span>
              VERIFIED CHEAPOS WORKBENCH PROJECTS
            </div>
            <h2 className="member-builds-title">
              Autonomous Builds by {member.display_name}
            </h2>
            <p className="member-builds-subtitle">
              Real projects authored with cheapoS agent swarms, backed by deterministic test verification and multi-model benchmark telemetry.
            </p>
          </div>

          {builds.length > 0 ? (
            <div className="member-builds-grid">
              {builds.map((b) => {
                const targetHref = b.slug ? `/community/${b.slug}` : `/community/${b.id}`;
                const title = sanitizeProjectTitle(b.title);
                const hook = sanitizeProjectHook(b.hook || b.description);
                const bm = b.benchmark || b.telemetry?.benchmark;
                const cost = bm?.dimension1_cost_tokens?.billedCost || b.telemetry?.cost || "$0.00";
                const totalTok = bm?.dimension1_cost_tokens?.totalTokens ?? b.telemetry?.tokens;
                const testScore = bm?.dimension5_quality?.finalUnitTestScore || bm?.dimension5_quality?.checksSummary || "Verified passing";

                return (
                  <article key={b.id} className="member-build-card">
                    <div className="member-build-top">
                      <h3 className="member-build-title">
                        <a href={targetHref} className="member-build-link">
                          {title}
                        </a>
                      </h3>
                      <p className="member-build-hook">{hook}</p>

                      <div className="member-build-badges">
                        <span className="member-build-pill test-pill">
                          🧪 {testScore}
                        </span>
                        <span className="member-build-pill cost-pill">
                          {cost}
                        </span>
                        {typeof totalTok === "number" && totalTok > 0 && (
                          <span className="member-build-pill">
                            ⚡ {formatTokens(totalTok)} tokens
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="member-build-footer">
                      <a href={targetHref} className="member-build-action">
                        Inspect build on workbench →
                      </a>
                      {b.project_url && (
                        <a
                          href={b.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="member-build-repo-link"
                        >
                          GitHub Repo ↗
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="member-builds-empty">
              <span style={{ fontSize: "40px" }} role="img" aria-label="Wrench">🛠️</span>
              <h3>No builds published yet</h3>
              <p>
                @{member.handle} is actively racking up verified compute tokens on the leaderboard, but hasn't published a project to the Community Workbench yet.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <a className="button primary" href="/community/new">
                  Share a build on the workbench ↗
                </a>
                <a className="button" href="/community">
                  Explore other community builds →
                </a>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
