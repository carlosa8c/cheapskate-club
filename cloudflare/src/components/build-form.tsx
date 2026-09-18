"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Build } from "../lib/builds";
import { parseTaskJson, encodeBenchmarkComment } from "../lib/task-parser";
import type { BenchmarkTelemetry } from "../lib/showcase-projects";

type BuildFormProps = {
  supabaseUrl?: string;
  supabaseKey?: string;
  siteUrl?: string;
  build?: Build;
};

export function BuildForm({
  supabaseUrl,
  supabaseKey,
  siteUrl,
  build,
}: BuildFormProps) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState(build?.title || "");
  const [description, setDescription] = useState(build?.description || "");
  const [screenshotUrl, setScreenshotUrl] = useState(build?.screenshot_url || "");
  const [projectUrl, setProjectUrl] = useState(build?.project_url || "");
  const [discussionUrl, setDiscussionUrl] = useState(build?.discussion_url || "");
  const [showUsage, setShowUsage] = useState(build?.show_usage || false);
  const [benchmark, setBenchmark] = useState<BenchmarkTelemetry | null>(null);
  const [taskFiles, setTaskFiles] = useState<any[]>([]);
  const [taskJsonStatus, setTaskJsonStatus] = useState<string | null>(null);
  const [taskJsonText, setTaskJsonText] = useState("");
  const [showPasteJson, setShowPasteJson] = useState(false);
  const [submittedPending, setSubmittedPending] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      setLoadingUser(false);
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
        setLoadingUser(false);
      }
    }

    checkUser();
  }, [supabaseUrl, supabaseKey]);

    function processTaskJsonString(content: string) {
    try {
      const res = parseTaskJson(content);
      setBenchmark(res.benchmark);
      setTaskFiles(res.files || []);
      if (!title && res.title) setTitle(res.title);
      if (!description && res.hook) setDescription(res.hook);
      setTaskJsonStatus(
        `Verified cheapoS run: ${(res.benchmark.dimension1_cost_tokens.totalTokens).toLocaleString()} tokens · ${res.benchmark.dimension1_cost_tokens.billedCost} billed · ${res.benchmark.dimension2_effort.totalActions} actions · 0 resumes`
      );
    } catch (err: any) {
      setTaskJsonStatus("Error parsing task.json: " + (err?.message || "Invalid JSON"));
    }
  }

  function handleFileSelect(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        processTaskJsonString(text);
      }
    };
    reader.readAsText(file);
  }

  async function handleOAuth(provider: "github" | "x") {
    if (!client) return;
    const origin = siteUrl || window.location.origin;
    const redirectTo = origin.replace(/\/$/, "") + "/auth/callback";
    await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!client || !user) return;

    setErrorMessage(null);

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanScreenshot = screenshotUrl.trim();
    const cleanProject = projectUrl.trim();
    const cleanDiscussion = discussionUrl.trim();

    if (cleanTitle.length < 3 || cleanTitle.length > 100) {
      setErrorMessage("Title must be between 3 and 100 characters.");
      return;
    }
    if (cleanDesc.length < 10 || cleanDesc.length > 3000) {
      setErrorMessage("Description must be between 10 and 3,000 characters.");
      return;
    }

    const validateHttps = (u: string) => {
      if (!u) return true;
      try {
        const parsed = new URL(u);
        return parsed.protocol === "https:";
      } catch {
        return false;
      }
    };

    if (cleanScreenshot && !validateHttps(cleanScreenshot)) {
      setErrorMessage("Screenshot URL must be a valid HTTPS link.");
      return;
    }
    if (!cleanProject) {
      setErrorMessage("GitHub Repository or README link is mandatory to verify project authenticity.");
      return;
    }
    if (!validateHttps(cleanProject) || !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/.test(cleanProject)) {
      setErrorMessage("Project URL must be a valid public GitHub repository or README link (e.g. https://github.com/username/repository).");
      return;
    }
    if (cleanDiscussion) {
      if (!validateHttps(cleanDiscussion) || !/^https:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+\/?$/.test(cleanDiscussion)) {
        setErrorMessage("Discussion URL must be a valid X/Twitter post link (e.g. https://x.com/username/status/123...).");
        return;
      }
    }

    setSubmitting(true);

    let finalDesc = cleanDesc;
    if (benchmark) {
      finalDesc = cleanDesc + encodeBenchmarkComment(benchmark, "pending_operator_review", taskFiles);
    }

    const payload = {
      title: cleanTitle,
      description: finalDesc,
      screenshot_url: cleanScreenshot,
      project_url: cleanProject,
      discussion_url: cleanDiscussion,
      show_usage: showUsage,
    };

    try {
      if (build?.id) {
        // Update existing build
        const { error } = await client
          .from("club_builds")
          .update(payload)
          .eq("id", build.id);

        if (error) {
          setErrorMessage("Failed to update build: " + error.message);
          setSubmitting(false);
          return;
        }

        window.location.href = "/community/" + build.id;
      } else {
        // Insert new build
        const { data, error } = await client
          .from("club_builds")
          .insert(payload)
          .select("id")
          .single();

        if (error || !data) {
          setErrorMessage("Failed to publish build: " + (error?.message || "Please try again."));
          setSubmitting(false);
          return;
        }

        setSubmittedPending(data.id);
        setSubmitting(false);
        return;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  }

  if (submittedPending) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          maxWidth: "600px",
          margin: "40px auto",
          borderRadius: "12px",
          border: "1px solid var(--card-border)",
          background: "var(--card-bg)",
        }}
      >
        <span style={{ fontSize: "52px" }} role="img" aria-label="Hourglass">⏳</span>
        <h2 style={{ font: "34px var(--serif)", margin: "16px 0 8px" }}>Build submitted!</h2>
        <div style={{ display: "inline-block", margin: "4px 0 16px", padding: "4px 12px", borderRadius: "12px", background: "rgba(217, 119, 6, 0.15)", color: "var(--status-warning)", fontWeight: "bold", fontSize: "var(--text-meta)" }}>
          AWAITING OPERATOR REVIEW
        </div>
        <p style={{ color: "var(--muted)", margin: "0 auto 28px", maxWidth: "480px", lineHeight: "1.6" }}>
          Your build has been received and is waiting in the review queue. It will appear publicly on the workbench feed as soon as @carlosa8c verifies the GitHub repository.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a className="button primary" href={`/community/${submittedPending}`}>
            Preview your submission →
          </a>
          <a className="button" href="/community">
            Around the workbench →
          </a>
        </div>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div style={{ padding: "40px 0" }}>
        <p className="eyebrow">CHECKING CLUB CREDENTIALS</p>
        <p className="lede">Preparing the workbench…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="prose">
        <p className="eyebrow">MEMBER EXCLUSIVE</p>
        <h2>Sign in to share your build</h2>
        <p className="lede">
          Join fellow builders in the Cheapskate Club to showcase your project, receive community cheers, and spark discussions.
        </p>
        <div className="signin-options">
          <button type="button" className="button primary" onClick={() => handleOAuth("x")}>
            Continue with X →
          </button>
          <button type="button" className="button" onClick={() => handleOAuth("github")}>
            Continue with GitHub →
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="profile-form build-form">
      {/* ⚡ Task.json Telemetry Autodetect Card */}
      <div
        style={{
          padding: "20px",
          borderRadius: "10px",
          background: "var(--card-bg, #f7f5ef)",
          border: "1px dashed var(--line, #e2ded4)",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "var(--text-meta)", letterSpacing: "1px", fontWeight: "bold", color: "var(--status-brand)" }}>
                ⚡ CHEAPOS TASK AUTODETECT
              </span>
              <span className="pill" style={{ margin: 0, padding: "2px 8px", borderRadius: "12px", background: "rgba(36, 63, 50, 0.12)", color: "var(--status-success)", fontSize: "var(--text-meta)", fontWeight: "bold" }}>
                BENCHMARK TEMPLATE
              </span>
            </div>
            <h3 style={{ font: "20px var(--serif)", margin: "4px 0" }}>Auto-Fill from your cheapoS Task JSON</h3>
            <p style={{ margin: 0, fontSize: "var(--text-meta)", color: "var(--muted)" }}>
              Export or copy your task JSON from cheapoS to automatically generate your verified 5-dimension benchmark matrix.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <label className="button primary" style={{ fontSize: "var(--text-meta)", cursor: "pointer", margin: 0 }}>
              <span>📁 Upload exported task.json</span>
              <input
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
            </label>
            <button
              type="button"
              className="button"
              style={{ fontSize: "var(--text-meta)" }}
              onClick={() => setShowPasteJson(!showPasteJson)}
            >
              {showPasteJson ? "Hide paste box" : "📋 Paste task JSON"}
            </button>
          </div>
        </div>

        {showPasteJson && (
          <div style={{ marginTop: "14px" }}>
            <textarea
              rows={4}
              placeholder="Paste your copied cheapoS task JSON here..."
              value={taskJsonText}
              onChange={(e) => setTaskJsonText(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData?.getData("text");
                if (pasted && pasted.length > 200) {
                  e.preventDefault();
                  setTaskJsonStatus("Parsing task JSON…");
                  setTimeout(() => {
                    processTaskJsonString(pasted);
                    setTaskJsonText(`[Task JSON loaded: ${(pasted.length / 1024).toFixed(1)} KB]`);
                  }, 20);
                }
              }}
              style={{ fontFamily: "var(--mono)", fontSize: "var(--text-meta)" }}
            />
            <button
              type="button"
              className="button"
              style={{ marginTop: "8px", fontSize: "var(--text-meta)" }}
              onClick={() => {
                if (taskJsonText.trim()) processTaskJsonString(taskJsonText.trim());
              }}
            >
              Parse Pasted JSON →
            </button>
          </div>
        )}

        {taskJsonStatus && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "6px",
              background: taskJsonStatus.startsWith("Error") ? "rgba(209, 102, 71, 0.1)" : "rgba(36, 63, 50, 0.08)",
              color: taskJsonStatus.startsWith("Error") ? "var(--status-brand)" : "var(--status-success)",
              fontSize: "var(--text-meta)",
              fontFamily: "var(--mono)",
            }}
          >
            {taskJsonStatus.startsWith("Error") ? "⚠️ " : "✅ "}
            {taskJsonStatus}
          </div>
        )}
      </div>

      <label htmlFor="title">What did you build?</label>
      <input
        id="title"
        name="title"
        required
        minLength={3}
        maxLength={100}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="A tiny tool with a big purpose"
      />

      <label htmlFor="description">Tell us about it</label>
      <textarea
        id="description"
        name="description"
        required
        minLength={10}
        maxLength={3000}
        rows={7}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What it does, how cheapoS helped, and what you learned."
      />

      <label htmlFor="screenshot_url">Screenshot URL · optional</label>
      <input
        id="screenshot_url"
        name="screenshot_url"
        type="url"
        value={screenshotUrl}
        onChange={(e) => setScreenshotUrl(e.target.value)}
        placeholder="https://…"
      />
      <small>Use a public image link. Image uploads are not available yet.</small>

      <label htmlFor="project_url" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span>GitHub Repository or README Link</span>
        <strong style={{ color: "var(--status-brand)", fontSize: "var(--text-meta)", fontFamily: "var(--mono)" }}>MANDATORY PROOF</strong>
      </label>
      <input
        id="project_url"
        name="project_url"
        type="url"
        required
        value={projectUrl}
        onChange={(e) => setProjectUrl(e.target.value)}
        placeholder="https://github.com/username/project"
      />
      <small>
        Mandatory proof of project authenticity. Must be a public GitHub repository or direct README.md link.
      </small>

      <label htmlFor="discussion_url">Your X post · optional</label>
      <input
        id="discussion_url"
        name="discussion_url"
        type="url"
        value={discussionUrl}
        onChange={(e) => setDiscussionUrl(e.target.value)}
        placeholder="https://x.com/you/status/…"
      />

      <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
        <input
          type="checkbox"
          name="show_usage"
          checked={showUsage}
          onChange={(e) => setShowUsage(e.target.checked)}
        />
        <span>Include my public Club usage card</span>
      </label>
      <small>
        Your lifetime Club totals, not measurements for this project. Only appears while your profile is public.
      </small>

      <small style={{ marginTop: "12px", display: "block" }}>
        Publishing shares this build, your Club name, and handle publicly. Your usage sharing settings stay yours to choose.
      </small>

      {errorMessage && (
        <p role="alert" className="notice" style={{ marginTop: "18px" }}>
          {errorMessage}
        </p>
      )}

      <div style={{ marginTop: "24px" }}>
        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? "Publishing…" : build ? "Save changes" : "Publish build ↗"}
        </button>
      </div>
    </form>
  );
}
