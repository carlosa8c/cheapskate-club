"use client";

import { useState, useEffect } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Build } from "../lib/builds";
import { decodeBenchmarkComment } from "../lib/task-parser";
import { BenchmarkPanel } from "./benchmark-panel";

type BuildDetailViewProps = {
  build: Build;
  supabaseUrl?: string;
  supabaseKey?: string;
  siteUrl?: string;
};

type CommentItem = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  text: string;
  time: string;
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Community commenting state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    // Load local project discussion comments
    const saved = localStorage.getItem(`comments_${build.id}`);
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch {}
    }

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

  function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    setPostingComment(true);
    const authorName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Fellow Builder";
    const authorHandle = user?.user_metadata?.user_name || "cheapskate";

    const newComment: CommentItem = {
      id: Date.now().toString(),
      author: authorName,
      handle: authorHandle,
      avatar: authorName.slice(0, 1).toUpperCase(),
      text,
      time: "Just now",
    };

    const updated = [...comments, newComment];
    setComments(updated);
    localStorage.setItem(`comments_${build.id}`, JSON.stringify(updated));
    setCommentText("");
    setPostingComment(false);
  }

  const shareOrigin = siteUrl || (typeof window !== "undefined" ? window.location.origin : "https://cheapos.lol");
  const targetId = build.slug || build.id;
  const shareUrl = `${shareOrigin.replace(/\/$/, "")}/community/${targetId}`;
  const tweetText = encodeURIComponent(`${build.title} — autonomous zero-cost showcase on The Cheapskate Club`);
  // Decode embedded benchmark if not present directly in build.telemetry
  const decoded = decodeBenchmarkComment(build.description);
  const displayDescription = decoded.cleanText;
  const benchmark = build.telemetry?.benchmark || decoded.benchmark;
  const telemetry = build.telemetry || (benchmark ? {
    benchmark,
    tokens: benchmark.dimension1_cost_tokens.totalTokens,
    cost: benchmark.dimension1_cost_tokens.billedCost,
    requests: benchmark.dimension2_effort.totalActions,
    tests: benchmark.dimension5_quality.finalUnitTestScore,
    commitSha: benchmark.dimension5_quality.commitSha,
  } : null);

  const readmeUrl = build.readme_url || (
    build.project_url && build.project_url.includes("github.com")
      ? `${build.project_url.replace(/\/$/, "")}/blob/main/README.md`
      : null
  );

  return (
    <section className="build-detail" style={{ maxWidth: "100%", margin: "32px 0 60px" }}>
      <div style={{ marginBottom: "24px" }}>
        <a href="/community" className="inline-link" style={{ textDecoration: "underline", color: "var(--muted)" }}>
          ← Around the workbench
        </a>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          {telemetry ? "AUTONOMOUS CHEAPOS SHOWCASE · ZERO-COST COMPUTE" : "A FELLOW CHEAPSKATE MADE THIS"}
        </p>
        {telemetry && (
          <span className="pill" style={{ margin: 0, padding: "2px 8px", borderRadius: "12px", background: "var(--line)", fontWeight: "bold" }}>
            100% FREE TIER
          </span>
        )}
      </div>

      <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.15, margin: "16px 0 12px" }}>
        {build.title}
      </h1>

      <p className="lede" style={{ marginBottom: "28px" }}>
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
          alt={`Screenshot of ${build.title}`}
          referrerPolicy="no-referrer"
          style={{ marginBottom: "28px" }}
        />
      )}

      <div
        className="build-description"
        style={{ fontSize: "17px", lineHeight: "1.7", whiteSpace: "pre-wrap", marginBottom: "32px" }}
      >
        {displayDescription}
      </div>

      {build.narrative && build.narrative.quickstart && (
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            background: "var(--ink, #1f2320)",
            color: "var(--bg, #f7f5ef)",
            marginBottom: "32px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: "var(--mono)", color: "var(--accent, #d16647)", marginBottom: "8px" }}>
            💻 RUN LOCALLY FROM CHEAPOS CHECKOUT
          </div>
          <pre style={{ margin: 0, fontFamily: "var(--mono)", fontSize: "13px", overflowX: "auto" }}>
            <code>{build.narrative.quickstart}</code>
          </pre>
        </div>
      )}

      {/* Repository Source File Inspector */}
      {telemetry && telemetry.files && telemetry.files.length > 0 && (
        <section
          className="repository-files-section"
          style={{
            padding: "24px",
            borderRadius: "12px",
            background: "var(--card-bg, #f7f5ef)",
            border: "1px solid var(--card-border, #e2ded4)",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <div>
              <span className="eyebrow" style={{ fontSize: "10px", letterSpacing: "1px" }}>CODE PROVENANCE</span>
              <h3 style={{ font: "24px var(--serif)", margin: "4px 0" }}>Repository Source Files</h3>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                Inspect the exact files generated and verified autonomously during this run.
              </p>
            </div>
            {build.project_url && (
              <a
                href={build.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ fontSize: "12px" }}
              >
                View Folder on GitHub ↗
              </a>
            )}
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {telemetry.files.map((f: any) => {
              const githubFileUrl = `https://github.com/carlosa8c/cheapoS/blob/main/${f.path}`;
              const isTest = f.name.startsWith("test_");
              return (
                <div
                  key={f.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    background: "var(--bg, #faf8f5)",
                    border: "1px solid var(--line)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span aria-hidden="true">{isTest ? "🧪" : "📄"}</span>
                    <div>
                      <a
                        href={githubFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: "var(--mono)", fontSize: "13px", fontWeight: "bold", textDecoration: "underline" }}
                      >
                        {f.name}
                      </a>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                        {f.description}
                      </p>
                    </div>
                  </div>
                  <a
                    href={githubFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--muted)", textDecoration: "underline" }}
                  >
                    inspect ↗
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {statusMessage && (
        <p role="alert" className="notice" style={{ marginTop: "16px" }}>
          {statusMessage}
        </p>
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

        {readmeUrl && (
          <a
            className="button primary"
            href={readmeUrl}
            target="_blank"
            rel="noopener noreferrer ugc"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>📖</span> Read Project README ↗
          </a>
        )}

        {build.project_url && (
          <a
            className="button"
            href={build.project_url}
            target="_blank"
            rel="noopener noreferrer ugc"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>📂</span> Browse Source Tree ↗
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
                fontSize: "13px",
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
              style={{ color: "#d16647" }}
            >
              {deleting ? "Removing…" : "Delete this build"}
            </button>
          </div>
        </details>
      )}

      {/* Project Discussion & Builder Chat Section */}
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
            <span className="eyebrow" style={{ fontSize: "11px", letterSpacing: "1px" }}>COMMUNITY WORKBENCH CHAT</span>
            <h2 style={{ font: "32px var(--serif)", margin: "8px 0" }}>Project Discussion</h2>
            <p style={{ color: "var(--muted)", margin: "4px 0 20px" }}>
              Chat with the builder, ask questions about prompts and setup, or share feedback.
            </p>
          </div>
          {build.discussion_url && (
            <a
              href={build.discussion_url}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="button"
              style={{ fontSize: "13px" }}
            >
              View thread on X ↗
            </a>
          )}
        </div>

        {/* Comment List */}
        <div className="comments-list" style={{ display: "grid", gap: "16px", margin: "24px 0" }}>
          {comments.length > 0 ? (
            comments.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid var(--card-border)",
                  background: "var(--card-bg)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "var(--line)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {c.avatar}
                    </span>
                    <strong style={{ fontSize: "14px" }}>{c.author}</strong>
                    <span style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "var(--mono)" }}>
                      @{c.handle}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>{c.time}</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "15px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {c.text}
                </p>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "24px",
                border: "1px dashed var(--line)",
                borderRadius: "10px",
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              <p style={{ margin: "6px 0" }}>No comments yet on this project.</p>
              <p style={{ fontSize: "13px", margin: "0" }}>
                Be the first to share your thoughts or ask @{build.handle} about this build.
              </p>
            </div>
          )}
        </div>

        {/* Comment Composer */}
        <form onSubmit={handlePostComment} style={{ marginTop: "24px" }}>
          <label htmlFor="comment-box" style={{ fontWeight: "bold", fontSize: "14px", display: "block", marginBottom: "8px" }}>
            Add to the discussion
          </label>
          <textarea
            id="comment-box"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Ask @${build.handle} about their prompts, models used, or build architecture…`}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid var(--input-border)",
              background: "var(--input-bg)",
              color: "var(--input-color)",
              font: "inherit",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              type="submit"
              className="button primary"
              disabled={postingComment || !commentText.trim()}
            >
              {postingComment ? "Posting…" : "Post Comment"}
            </button>
            {!user && (
              <a href="/join" className="text-button" style={{ fontSize: "13px" }}>
                Join with X or GitHub to get verified badge →
              </a>
            )}
          </div>
        </form>
      </section>
    </section>
  );
}
