"use client";

import { useState, useEffect } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type Profile = {
  handle: string;
  display_name: string;
};

type ConnectManagerProps = {
  supabaseUrl?: string;
  supabaseKey?: string;
  siteUrl?: string;
};

export function ConnectManager({
  supabaseUrl,
  supabaseKey,
  siteUrl,
}: ConnectManagerProps) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [status, setStatus] = useState<"pending" | "approved" | "failed">("pending");
  const [id, setId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get("id") || localStorage.getItem("club_pairing") || "";
    setId(paramId);

    if (paramId) {
      localStorage.setItem("club_pairing", paramId);
    }

    if (!supabaseUrl || !supabaseKey) {
      setLoading(false);
      return;
    }

    const sb = createClient(supabaseUrl, supabaseKey);
    setClient(sb);

    async function checkUser() {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data } = await sb
            .from("club_profiles")
            .select("handle,display_name")
            .eq("id", session.user.id)
            .maybeSingle();
          if (data) {
            setProfile(data);
          }
        }
      } catch (err) {
        console.error("Session check error", err);
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, [supabaseUrl, supabaseKey]);

  async function handleApprove() {
    if (!client || !id) return;
    setApproving(true);

    try {
      const { error } = await client.rpc("club_approve_pairing", { pair: id });
      localStorage.removeItem("club_pairing");
      if (error) {
        setStatus("failed");
      } else {
        setStatus("approved");
      }
    } catch {
      setStatus("failed");
    } finally {
      setApproving(false);
    }
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

  if (loading) {
    return (
      <section className="prose">
        <p className="eyebrow">ONE INSTALLATION. ONE ACCOUNT.</p>
        <h1>Connecting…</h1>
      </section>
    );
  }

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return (
      <section className="prose">
        <p className="eyebrow">ONE INSTALLATION. ONE ACCOUNT.</p>
        <h1>Connect cheapoS</h1>
        <p className="lede">
          Start from <strong>Usage &amp; savings</strong> in cheapoS to connect this installation.
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="prose">
        <p className="eyebrow">ONE INSTALLATION. ONE ACCOUNT.</p>
        <h1>Connect cheapoS</h1>
        <p className="lede">
          Sign in to choose the Club account for this installation.
        </p>
        <div className="signin-options">
          <button type="button" className="button primary" onClick={() => handleOAuth("x")}>
            Sign in with X to continue →
          </button>
          <button type="button" className="button" onClick={() => handleOAuth("github")}>
            Sign in with GitHub to continue →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="prose">
      <p className="eyebrow">ONE INSTALLATION. ONE ACCOUNT.</p>
      <h1>
        Connect to<br />
        <em>@{profile?.handle || "your account"}</em>
      </h1>

      {status === "approved" ? (
        <div className="notice" role="status">
          <strong>Approved!</strong> Return to cheapoS and click <strong>Check connection</strong>, then review what you want to share.
        </div>
      ) : (
        <>
          <p>
            This installation will send future opted-in usage to this account only. Connecting does not enable sharing. To switch accounts later, disconnect in cheapoS first. Existing usage stays with its original account.
          </p>
          <p>Only approve if you just started this connection in your own cheapoS app.</p>

          {status === "failed" && (
            <p className="notice" role="alert">
              Pairing expired or the installation is already connected. Start a fresh connection from cheapoS.
            </p>
          )}

          <div style={{ margin: "24px 0" }}>
            <button
              type="button"
              className="button primary"
              disabled={approving}
              onClick={handleApprove}
            >
              {approving ? "Connecting…" : "Connect to @" + (profile?.handle || "club")}
            </button>
          </div>

          <p>
            Wrong account? <a href="/account">Open My Club to sign out</a>, then return to this connection link.
          </p>
        </>
      )}
    </section>
  );
}
