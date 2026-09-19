"use client";

import { useState, useEffect } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Build } from "../lib/builds";
import { decodeBenchmarkComment, encodeBenchmarkComment, sanitizeProjectTitle, sanitizeProjectHook } from "../lib/task-parser";
import { BenchmarkPanel } from "./benchmark-panel";

type BuildDetailViewProps = {
  build: Build;
  supabaseUrl?: string;
  supabaseKey?: string;
  siteUrl?: string;
};

export function BuildDetailView({
  build,
  supabaseUrl,
  supabaseKey,
  siteUrl,
}: BuildDetailViewProps) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cheers, setCheers] = useState(build.cheers || 0);
  const [cheered, setCheered] = useState(false);
  const [isOwn, setIsOwn] = useState(false);
  const [cheering, setCheering] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedBenchmark, setCopiedBenchmark] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Decode embedded metadata & benchmark
  const decoded = decodeBenchmarkComment(build.description);
  const [reviewStatus, setReviewStatus] = useState<string>(
    build.review_status || decoded.status || "approved"
  );
  const [operatorActionLoading, setOperatorActionLoading] = useState(false);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;
    const sb = createClient(supabaseUrl, supabaseKey);
    setClient(sb);

    async function checkState() {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          setUser(session.user);

          // Check if current user is author
          const { data: ownBuild } = await sb
            .from("club_builds")
            .select("id")
            .eq("id", build.id)
            .eq("author_id", session.user.id)
            .maybeSingle();
          if (ownBuild) setIsOwn(true);

          // Check if already cheered
          const { data: cheerData } = await sb
            .from("club_cheers")
            .select("build_id")
            .eq("build_id", build.id)
            .eq("user_id", session.user.id)
            .maybeSingle();
          if (cheerData) setCheered(true);
        }
      } catch (err) {
        console.error("Failed to check user cheer state", err);
      }
    }

    checkState();
  }, [supabaseUrl, supabaseKey, build.id]);

  function handleCopyBenchmark() {
    const bm = telemetry || decoded.benchmark;
    const tok = bm?.dimension1_cost_tokens?.totalTokens?.toLocaleString() || '0';
    const cst = bm?.dimension1_cost_tokens?.billedCost || '$0.00';
    const tst = bm?.dimension5_quality?.finalUnitTestScore || bm?.dimension5_quality?.checksSummary || 'Verified passing';
    const shareText = `🛠️ ${cleanTitle} by @${build.handle}\n⚡ ${tok} tokens · ${cst} billed · 100% Unattended\n🧪 ${tst}\n\nInspect on cheapoS: ${shareUrl}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedBenchmark(true);
      setTimeout(() => setCopiedBenchmark(false), 2500);
    }
  }

  async function handleToggleCheer() {
    if (!client || !user) {
      window.location.href = "/join";
      return;
    }

    setCheering(true);
    setStatusMessage(null);

    const willCheer = !cheered;
    // Optimistic update
    setCheered(willCheer);
    setCheers(prev => (willCheer ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (willCheer) {
        const { error } = await client
          .from("club_cheers")
          .insert({ build_id: build.id });
        if (error && error.code !== "23505") {
          // Revert if error
          setCheered(false);
          setCheers(prev => Math.max(0, prev - 1));
          setStatusMessage("Could not record cheer. Please try again.");
        }
      } else {
        const { error } = await client
          .from("club_cheers")
          .delete()
          .eq("build_id", build.id);
        if (error) {
          setCheered(true);
          setCheers(prev => prev + 1);
          setStatusMessage("Could not remove cheer. Please try again.");
        }
      }
    } catch {
      setStatusMessage("Could not update cheer.");
    } finally {
      setCheering(false);
    }
  }

  async function handleDeleteBuild() {
    if (!client || !isOwn) return;
    if (!window.confirm("Are you sure you want to delete this build from the workbench?")) return;

    setDeleting(true);
    try {
      const { error } = await client
        .from("club_builds")
        .delete()
        .eq("id", build.id);

      if (error) {
        alert("Failed to delete build: " + error.message);
        setDeleting(false);
      } else {
        window.location.href = "/community";
      }
    } catch {
      alert("Failed to delete build. Please try again.");
      setDeleting(false);
    }
  }

  const isOperator = Boolean(
    user &&
    (
      user.user_metadata?.user_name?.toLowerCase() === "carlosa8c" ||
      user.user_metadata?.preferred_username?.toLowerCase() === "carlosa8c" ||
      user.user_metadata?.user_name?.toLowerCase() === "cheaposnumero1" ||
      user.user_metadata?.preferred_username?.toLowerCase() === "cheaposnumero1" ||
      user.email?.toLowerCase().includes("carlosa8c") ||
      user.email?.toLowerCase().includes("cheapos")
    )
  );

  async function handleApproveBuild() {
    if (!client || !isOperator) return;
    setOperatorActionLoading(true);
    setStatusMessage(null);
    try {
      const { data, error: fetchErr } = await client
        .from("club_builds")
        .select("description")
        .eq("id", build.id)
        .single();

      if (fetchErr || !data) {
        throw new Error(fetchErr?.message || "Could not read build record");
      }

      const parsed = decodeBenchmarkComment(data.description);
      let newDesc = parsed.cleanText;
      if (parsed.benchmark) {
        newDesc += encodeBenchmarkComment(parsed.benchmark, "approved");
      }

      const { error: updateErr } = await client
        .from("club_builds")
        .update({ description: newDesc })
        .eq("id", build.id);

      if (updateErr) throw updateErr;

      setReviewStatus("approved");
      setStatusMessage("Build successfully approved and published to the workbench!");
    } catch (err: any) {
      setStatusMessage("Failed to approve build: " + (err.message || "Unknown error"));
    } finally {
      setOperatorActionLoading(false);
    }
  }

  async function handleRejectBuild() {
    if (!client || !isOperator) return;
    if (!window.confirm("Reject and remove this build from the workbench?")) return;
    setOperatorActionLoading(true);
    try {
      const { error } = await client
        .from("club_builds")
        .delete()
        .eq("id", build.id);

      if (error) throw error;
      window.location.href = "/community";
    } catch (err: any) {
      setStatusMessage("Failed to remove build: " + (err.message || "Unknown error"));
      setOperatorActionLoading(false);
    }
  }

  const shareOrigin = siteUrl || (typeof window !== "undefined" ? window.location.origin : "https://cheapos.lol");
  const targetId = build.slug || build.id;
  const shareUrl = `${shareOrigin.replace(/\/$/, "")}/community/${targetId}`;
  const cleanTitle = sanitizeProjectTitle(build.title);
  const tweetText = encodeURIComponent(`${cleanTitle} — autonomous zero-cost showcase on The Cheapskate Club`);
  // Decode embedded benchmark if not present directly in build.telemetry
  const displayDescription = decoded.cleanText;
  const benchmark = build.benchmark || build.telemetry?.benchmark || decoded.benchmark;
  const telemetry = benchmark ? {
    benchmark,
    tokens: benchmark.dimension1_cost_tokens.totalTokens,
    cost: benchmark.dimension1_cost_tokens.billedCost,
    requests: benchmark.dimension2_effort.totalActions,
    tests: benchmark.dimension5_quality.finalUnitTestScore || benchmark.dimension5_quality.checksSummary,
    commitSha: benchmark.dimension5_quality.commitSha,
  } : build.telemetry;

  const rawHook = build.hook || (displayDescription && displayDescription.trim().length <= 250 ? displayDescription.trim() : null);
  const hookText = rawHook ? sanitizeProjectHook(rawHook) : null;

  const readmeUrl = build.readme_url || (
    build.project_url && build.project_url.includes("github.com")
      ? `${build.project_url.replace(/\/$/, "")}/blob/main/README.md`
      : null
  );

  const primaryProjectUrl = build.project_url || readmeUrl;
  const repoLabel = primaryProjectUrl?.includes("gitlab.com")
    ? "View on GitLab ↗"
    : primaryProjectUrl?.includes("github.com")
    ? "View on GitHub ↗"
    : "View project repository ↗";

  return (
    <section className="build-detail" style={{ maxWidth: "100%", margin: "32px 0 60px" }}>
      <div style={{ marginBottom: "24px" }}>
        <a href="/community" className="inline-link" style={{ textDecoration: "underline", color: "var(--muted)" }}>
          ← Around the workbench
        </a>
      </div>

      {reviewStatus === "pending_operator_review" && (
        <aside
          role="status"
          style={{
            margin: "0 0 32px",
            padding: "20px 24px",
            borderRadius: "10px",
            background: "rgba(217, 119, 6, 0.12)",
            border: "1px solid rgba(217, 119, 6, 0.4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "var(--status-warning)" }}>
              <span style={{ fontSize: "18px" }}>⏳</span>
              <span>PENDING OPERATOR REVIEW</span>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: "14px", lineHeight: "1.5" }}>
              {isOperator
                ? "This community project was submitted to the workbench and requires operator approval before appearing on the public feed."
                : isOwn
                ? "Your build has been received and is waiting for review by @carlosa8c before going live to the public workbench."
                : "This community project has been submitted and is currently awaiting operator review by @carlosa8c."}
            </p>
          </div>

          {isOperator && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="button primary"
                disabled={operatorActionLoading}
                onClick={handleApproveBuild}
                
              >
                {operatorActionLoading ? "Saving…" : "✓ Approve & Publish"}
              </button>
              <button
                type="button"
                className="button"
                disabled={operatorActionLoading}
                onClick={handleRejectBuild}
                style={{ color: "var(--status-brand)" }}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </aside>
      )}

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          {telemetry ? "AUTONOMOUS CHEAPOS SHOWCASE · ZERO-COST COMPUTE" : "A FELLOW CHEAPSKATE MADE THIS"}
        </p>
        {telemetry && (
          <span className="pill" style={{ margin: 0, padding: "2px 8px", borderRadius: "12px", background: "var(--status-success-bg)", color: "var(--status-success)", fontWeight: "bold" }}>
            100% FREE TIER
          </span>
        )}
      </div>

      <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.15, margin: "16px 0 12px" }}>
        {cleanTitle}
      </h1>

      <p className="lede" style={{ marginBottom: hookText ? "12px" : "28px" }}>
        By{" "}
        {build.profile_public ? (
          <a href={`/@${build.handle}`} style={{ textDecoration: "underline", fontWeight: "bold" }}>
            {build.display_name} · @{build.handle}
          </a>
        ) : (
          <span>
            {build.display_name} · @{build.handle}
          </span>
        )}
      </p>

      {hookText && (
        <p style={{ fontSize: "18px", color: "var(--muted)", maxWidth: "800px", lineHeight: "1.5", margin: "0 0 28px" }}>
          {hookText}
        </p>
      )}

      {telemetry && (
        <BenchmarkPanel
          telemetry={telemetry}
          readmeUrl={readmeUrl || `https://github.com/carlosa8c/cheapoS/blob/main/examples/${build.slug || ""}/README.md`}
          projectUrl={build.project_url}
        />
      )}

      {build.screenshot_url && (
        <img
          className="build-screenshot"
          src={build.screenshot_url}
          alt={`Screenshot of ${cleanTitle}`}
          referrerPolicy="no-referrer"
          style={{ marginBottom: "28px" }}
        />
      )}

      {!telemetry && displayDescription && (
        <div
          className="build-description"
          style={{ fontSize: "17px", lineHeight: "1.7", whiteSpace: "pre-wrap", marginBottom: "32px" }}
        >
          {displayDescription}
        </div>
      )}

      

      {statusMessage && (
        <div
          role="alert"
          style={{
            margin: "24px 0",
            padding: "14px 18px",
            borderRadius: "10px",
            background: statusMessage.includes("Failed") || statusMessage.includes("Could not")
              ? "rgba(185, 28, 28, 0.12)"
              : "var(--status-success-bg)",
            border: `1px solid ${statusMessage.includes("Failed") || statusMessage.includes("Could not") ? "var(--status-danger)" : "var(--status-success)"}`,
            color: statusMessage.includes("Failed") || statusMessage.includes("Could not")
              ? "var(--status-danger)"
              : "var(--status-success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "15px",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>
              {statusMessage.includes("Failed") || statusMessage.includes("Could not") ? "⚠️" : "✓"}
            </span>
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontSize: "16px",
              padding: "4px 8px",
              lineHeight: 1,
              opacity: 0.8,
            }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="share-buttons" style={{ margin: "32px 0", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          className={"button " + (cheered ? "primary" : "")}
          disabled={cheering}
          onClick={handleToggleCheer}
        >
          {cheered ? "✦ Cheered" : "✧ Give a cheer"} · {cheers}
        </button>

        {primaryProjectUrl && (
          <a
            className="button primary"
            href={primaryProjectUrl}
            target="_blank"
            rel="noopener noreferrer ugc"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>📂</span> {repoLabel}
          </a>
        )}

        {build.discussion_url && (
          <a
            className="button"
            href={build.discussion_url}
            target="_blank"
            rel="noopener noreferrer ugc"
          >
            Discuss on X ↗
          </a>
        )}

        <a
          className="button"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`}
        >
          Share on X ↗
        </a>
      </div>

      {/* Community Discussion & Benchmark Share Card */}
      <section
        style={{
          margin: "32px 0",
          padding: "24px",
          borderRadius: "10px",
          border: "1px solid var(--surface-border)",
          background: "var(--surface-inset)",
        }}
        aria-labelledby="discussion-heading"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
          <div>
            <div className="eyebrow" style={{ margin: "0 0 4px" }}>
              <span className="little-spark" aria-hidden="true">💬</span>
              PEER FEEDBACK & COMMUNITY BENCHMARKS
            </div>
            <h3 id="discussion-heading" style={{ font: "22px var(--serif)", margin: "0 0 6px", color: "var(--text-primary)" }}>
              Discuss this Build
            </h3>
          </div>
          <button
            type="button"
            className="button"
            onClick={handleCopyBenchmark}
            style={{ fontSize: "var(--text-meta)" }}
          >
            {copiedBenchmark ? "✓ Copied Summary!" : "📋 Copy Benchmark Summary"}
          </button>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: "var(--text-body)", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          {build.discussion_url
            ? `Join the active discussion thread on X with @${build.handle} and fellow cheapskate engineers.`
            : `Have thoughts on architecture, efficiency, or model pairings for this build? Share feedback with @${build.handle} on X.`}
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {build.discussion_url ? (
            <a
              className="button primary"
              href={build.discussion_url}
              target="_blank"
              rel="noopener noreferrer ugc"
            >
              Open Discussion Thread on X ↗
            </a>
          ) : (
            <a
              className="button primary"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just inspected @" + build.handle + "'s #cheapoS project '" + cleanTitle + "' — built for $0.00! What models would you use?")}&url=${encodeURIComponent(shareUrl)}`}
            >
              Start discussion on X ↗
            </a>
          )}
          {primaryProjectUrl && (
            <a
              className="button"
              href={primaryProjectUrl}
              target="_blank"
              rel="noopener noreferrer ugc"
            >
              Inspect Source on GitHub ↗
            </a>
          )}
        </div>
      </section>

      {/* Builder's verified Club Card */}
      {build.show_usage && (
        <aside className="build-usage">
          <h2>The builder’s Club card</h2>
          <p>Verified lifetime compute across cheapoS projects.</p>
          <a href={`/@${build.handle}`} title={`View @${build.handle} profile card`}>
            <div
              style={{
                display: "inline-block",
                padding: "16px 24px",
                border: "1px solid var(--card-border)",
                borderRadius: "10px",
                background: "var(--card-bg)",
                fontFamily: "var(--mono)",
                fontSize: "var(--text-meta)",
              }}
            >
              <strong>@{build.handle}</strong> · Verified cheapskate builder 🪪
            </div>
          </a>
        </aside>
      )}

      {/* Owner controls */}
      {isOwn && (
        <details className="profile-settings" style={{ marginTop: "24px", padding: "16px", border: "1px dashed var(--line)", borderRadius: "8px" }}>
          <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Manage your build</summary>
          <div style={{ marginTop: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
            <a className="button" href={`/community/${targetId}/edit`}>
              Edit build →
            </a>
            <button
              type="button"
              className="button"
              disabled={deleting}
              onClick={handleDeleteBuild}
              style={{ color: "var(--status-brand)" }}
            >
              {deleting ? "Removing…" : "Delete this build"}
            </button>
          </div>
        </details>
      )}

      {/* Project Discussion - Commenting temporarily disabled */}
      {build.discussion_url && (
        <section
          className="build-discussion-section"
          style={{
            marginTop: "50px",
            paddingTop: "35px",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span className="eyebrow" style={{ fontSize: "var(--text-meta)", letterSpacing: "1px" }}>COMMUNITY DISCUSSION</span>
              <h2 style={{ font: "32px var(--serif)", margin: "8px 0" }}>Project Discussion</h2>
              <p style={{ color: "var(--muted)", margin: "4px 0 20px" }}>
                Workbench comments are temporarily disabled while edit and delete controls are being added. Follow the project conversation on X.
              </p>
            </div>
            <a
              href={build.discussion_url}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="button primary"
              style={{ fontSize: "var(--text-meta)" }}
            >
              View thread on X ↗
            </a>
          </div>
        </section>
      )}
    </section>
  );
}
