"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Build } from "../lib/builds";

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

  async function handleOAuth(provider: "github" | "twitter") {
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
    if (cleanProject && !validateHttps(cleanProject)) {
      setErrorMessage("Project URL must be a valid HTTPS link.");
      return;
    }
    if (cleanDiscussion) {
      if (!validateHttps(cleanDiscussion) || !/^https:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+\/?$/.test(cleanDiscussion)) {
        setErrorMessage("Discussion URL must be a valid X/Twitter post link (e.g. https://x.com/username/status/123...).");
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      title: cleanTitle,
      description: cleanDesc,
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

        window.location.href = "/community/" + data.id;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
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
          <button type="button" className="button primary" onClick={() => handleOAuth("twitter")}>
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

      <label htmlFor="project_url">GitHub or live demo · optional</label>
      <input
        id="project_url"
        name="project_url"
        type="url"
        value={projectUrl}
        onChange={(e) => setProjectUrl(e.target.value)}
        placeholder="https://…"
      />

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
