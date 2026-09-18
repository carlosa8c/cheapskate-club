"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type Profile = {
  handle: string;
  display_name: string;
  sharing_enabled: boolean;
  share_models: boolean;
};

type Installation = {
  id: string;
  sharing_enabled: boolean;
};

type AccountManagerProps = {
  supabaseUrl?: string;
  supabaseKey?: string;
  siteUrl?: string;
  initialMode?: "account" | "join";
};

export function AccountManager({
  supabaseUrl,
  supabaseKey,
  siteUrl,
  initialMode = "account",
}: AccountManagerProps) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingIn, setSigningIn] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form edit state
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [shareModels, setShareModels] = useState(false);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      setLoading(false);
      return;
    }

    const sb = createClient(supabaseUrl, supabaseKey);
    setClient(sb);

    async function initSession() {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserData(sb, session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to read session", err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    const { data: authListener } = sb.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserData(sb, session.user);
      } else {
        setUser(null);
        setProfile(null);
        setInstallations([]);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseUrl, supabaseKey]);

  async function loadUserData(sb: SupabaseClient, currentUser: User) {
    try {
      // 1. Fetch profile
      const { data: profileData, error: profileErr } = await sb
        .from("club_profiles")
        .select("handle,display_name,sharing_enabled,share_models")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (!profileData && !profileErr) {
        // Create initial default profile if not exists
        const meta = currentUser.user_metadata || {};
        const firstText = (vals: any[]) => vals.find(v => typeof v === "string" && Boolean(v.trim()))?.trim() ?? "";
        const username = firstText([meta.user_name, meta.preferred_username, meta.username]);
        const normalized = username.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
        const fallback = "member_" + currentUser.id.replace(/-/g, "").slice(0, 12);
        const defaultHandle = normalized.length >= 3 ? normalized : fallback;
        const defaultName = [...(firstText([meta.full_name, meta.name, username]) || "Club member")].slice(0, 80).join("");

        const newProfile: Profile = {
          handle: defaultHandle,
          display_name: defaultName,
          sharing_enabled: false,
          share_models: false,
        };

        const { data: created } = await sb
          .from("club_profiles")
          .insert({ id: currentUser.id, ...newProfile })
          .select("handle,display_name,sharing_enabled,share_models")
          .maybeSingle();

        const activeProfile = created || newProfile;
        setProfile(activeProfile);
        setHandle(activeProfile.handle);
        setDisplayName(activeProfile.display_name);
        setSharingEnabled(activeProfile.sharing_enabled);
        setShareModels(activeProfile.share_models);
      } else if (profileData) {
        setProfile(profileData);
        setHandle(profileData.handle);
        setDisplayName(profileData.display_name);
        setSharingEnabled(profileData.sharing_enabled);
        setShareModels(profileData.share_models);
      }

      // 2. Fetch installations
      const { data: instData } = await sb
        .from("club_installations")
        .select("id,sharing_enabled")
        .eq("owner_id", currentUser.id);

      if (instData) {
        setInstallations(instData);
      }
    } catch (err) {
      console.error("Failed to load user profile or installations", err);
    }
  }

  async function handleOAuth(provider: "github" | "x") {
    if (!client) return;
    setSigningIn(provider);
    setStatusMessage(null);
    setErrorMessage(null);

    const origin = siteUrl || window.location.origin;
    const redirectTo = origin.replace(/\/$/, "") + "/auth/callback";

    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      setSigningIn(null);
      setErrorMessage("Could not start sign-in with " + (provider === "x" ? "X" : "GitHub") + ": " + error.message);
    } else if (data?.url) {
      window.location.href = data.url;
    }
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!client || !user) return;

    setStatusMessage(null);
    setErrorMessage(null);

    const cleanHandle = handle.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!/^[a-z0-9_]{3,30}$/.test(cleanHandle)) {
      setErrorMessage("Use 3–30 letters, numbers, or underscores for your handle.");
      return;
    }
    if (!cleanName || [...cleanName].length > 80) {
      setErrorMessage("Display name must be between 1 and 80 characters.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await client
        .from("club_profiles")
        .upsert(
          {
            id: user.id,
            handle: cleanHandle,
            display_name: cleanName,
            sharing_enabled: sharingEnabled,
            share_models: shareModels,
          },
          { onConflict: "id" }
        );

      if (error) {
        if (error.code === "23505") {
          setErrorMessage("That handle is already taken. Choose another one.");
        } else {
          setErrorMessage("Your profile couldn’t be saved. Please try again shortly.");
        }
      } else {
        setProfile({
          handle: cleanHandle,
          display_name: cleanName,
          sharing_enabled: sharingEnabled,
          share_models: shareModels,
        });
        setStatusMessage("Your profile is saved.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(installationId: string) {
    if (!client) return;
    setDisconnectingId(installationId);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const { error } = await client.rpc("club_revoke_installation", {
        installation: installationId,
      });

      if (error) {
        setErrorMessage("Disconnection failed. Please try again.");
      } else {
        setInstallations(prev => prev.filter(inst => inst.id !== installationId));
        setStatusMessage("Installation disconnected. Previously submitted usage stays with this account.");
      }
    } catch {
      setErrorMessage("Disconnection failed. Please try again.");
    } finally {
      setDisconnectingId(null);
    }
  }

  async function handleSignOut() {
    if (!client) return;
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      await client.auth.signOut({ scope: "local" });
      setUser(null);
      setProfile(null);
      setInstallations([]);
    } catch (err: any) {
      setErrorMessage("Sign-out didn’t complete. Please try again.");
    }
  }

  if (loading) {
    return (
      <section className="account-settings-page">
        <div className="account-hero">
          <div className="eyebrow">YOUR CORNER OF THE CLUB</div>
          <h1>
            Checking<br />
            <em>your credentials…</em>
          </h1>
          <p className="lede">Connecting to the club registry.</p>
        </div>
      </section>
    );
  }

  if (!supabaseUrl || !supabaseKey) {
    return (
      <section className="prose">
        <div className="eyebrow">THE CHEAPSKATE CLUB</div>
        <h1>
          Sign-in is<br />
          <em>being configured.</em>
        </h1>
        <p className="lede">
          Supabase credentials are being synced to this Cloudflare edge deployment. The public leaderboard and community workbench remain open to browse.
        </p>
        <p>
          <a className="button" href="/leaderboard">
            Browse Leaderboard ↗
          </a>
        </p>
      </section>
    );
  }

  // If user is NOT signed in: show Join / Sign In view
  if (!user) {
    return (
      <section className="prose">
        <p className="eyebrow">YOUR WORK. YOUR CHOICE.</p>
        <h1>
          Find your<br />
          <em>fellow cheapos.</em>
        </h1>
        <p className="lede">
          Join with X or GitHub. We’ll use your profile name to get you started—you can change it anytime.
        </p>

        {statusMessage && (
          <p className="notice" role="status">
            {statusMessage}
          </p>
        )}
        {errorMessage && (
          <p className="notice" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="signin-options">
          <button
            type="button"
            className="button primary"
            disabled={Boolean(signingIn)}
            onClick={() => handleOAuth("x")}
          >
            {signingIn === "x" ? "Opening X…" : "Continue with X →"}
          </button>
          <button
            type="button"
            className="button"
            disabled={Boolean(signingIn)}
            onClick={() => handleOAuth("github")}
          >
            {signingIn === "github" ? "Opening GitHub…" : "Continue with GitHub →"}
          </button>
        </div>

        <p>
          Signing in creates a Club account. It does not connect your repositories or upload anything from cheapoS. Leaderboard sharing stays off until you choose it.
        </p>

        <h2>Bring your work, keep your privacy.</h2>
        <p>
          Your email stays private. You choose the name other members see. Connect cheapoS from its Usage &amp; savings panel when you’re ready.
        </p>
      </section>
    );
  }

  // If user IS signed in: show Account & Settings page
  return (
    <section className="account-settings-page">
      <div className="account-hero">
        <div className="eyebrow">YOUR CORNER OF THE CLUB</div>
        <h1>
          You’re in.<br />
          <em>Welcome to the club.</em>
        </h1>
        {profile && (
          <div className="account-meta-bar">
            <span>
              Signed in as <strong>{profile.display_name}</strong> (<code>@{profile.handle}</code>)
            </span>
            <div className="account-nav-buttons">
              <a className="button primary" href={"/@" + profile.handle}>
                View My Profile ↗
              </a>
              <a className="button" href="/leaderboard">
                Leaderboard ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {statusMessage && (
        <p className="notice" role="status">
          {statusMessage}
        </p>
      )}

      {errorMessage && (
        <p className="notice" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="settings-cards-grid">
        {/* Card 1: Profile & Privacy Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-icon" aria-hidden="true">👤</span>
            <div>
              <h2>Profile &amp; Sharing</h2>
              <p>Manage your public identity and what appears on the leaderboard.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label htmlFor="handle">Club Handle</label>
              <div className="handle-input-wrap">
                <span className="handle-prefix" aria-hidden="true">@</span>
                <input
                  id="handle"
                  name="handle"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9_]{3,30}"
                  autoCapitalize="none"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  aria-describedby="handle-help"
                />
              </div>
              <small id="handle-help">
                3–30 characters (letters, numbers, underscores). Handles are saved in lowercase.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="display-name">Display Name</label>
              <input
                id="display-name"
                name="display_name"
                required
                maxLength={80}
                autoComplete="nickname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="sharing_enabled"
                  checked={sharingEnabled}
                  onChange={(e) => setSharingEnabled(e.target.checked)}
                />
                <div>
                  <strong>Show my profile and usage on the leaderboard</strong>
                  <p>
                    When enabled, your display name and signed token tallies appear on rankings.
                    Turning this off removes you from rankings. No prompts, code, email, or provider
                    credentials are ever shared.
                  </p>
                </div>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="share_models"
                  checked={shareModels}
                  onChange={(e) => setShareModels(e.target.checked)}
                />
                <div>
                  <strong>Show model breakdowns on my public profile</strong>
                  <p>
                    Allows other members to see the AI models in your workshop mix (requires model
                    sharing also enabled in cheapoS → Usage &amp; savings).
                  </p>
                </div>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="button primary" disabled={saving}>
                {saving ? "Saving changes…" : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: App Installations */}
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-icon" aria-hidden="true">💻</span>
            <div>
              <h2>cheapoS Installations</h2>
              <p>Connected local machines sending signed telemetry to this account.</p>
            </div>
          </div>

          {installations.length > 0 ? (
            <div className="installations-list">
              {installations.map((installation) => (
                <div className="installation-row" key={installation.id}>
                  <div className="installation-info">
                    <code className="inst-id">{installation.id}</code>
                    <span
                      className={"inst-badge " + (installation.sharing_enabled ? "badge-active" : "badge-paused")}
                    >
                      {installation.sharing_enabled ? "🟢 Sync enabled" : "⏸️ Sync paused"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="button"
                    disabled={disconnectingId === installation.id}
                    onClick={() => handleDisconnect(installation.id)}
                  >
                    {disconnectingId === installation.id ? "Disconnecting…" : "Disconnect"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-installations-box">
              <span className="empty-inst-icon" aria-hidden="true">🔌</span>
              <h3>No installations connected yet</h3>
              <p>
                In your <strong>cheapoS</strong> app, open <strong>Usage &amp; savings → Connect to Club</strong>,
                and follow the connection prompt to link your machine.
              </p>
            </div>
          )}

          <div className="settings-help-box">
            <h4>How Installation Syncing Works</h4>
            <p>
              Each cheapoS installation connects to one account at a time. Telemetry events are signed
              locally with your installation’s private Ed25519 key. No prompts, source code, project paths,
              or credentials ever leave your machine.
            </p>
          </div>
        </div>

        {/* Card 3: Session & Sign Out */}
        <div className="settings-card settings-card-session">
          <div className="settings-card-header">
            <span className="settings-icon" aria-hidden="true">🔐</span>
            <div>
              <h2>Session</h2>
              <p>Manage your login session or sign out of the club.</p>
            </div>
          </div>

          <div className="session-actions-row">
            <div>
              <strong>Signed in via {user.app_metadata?.provider || "OAuth"}</strong>
              <p className="session-email">{user.email || "Protected OAuth Account"}</p>
            </div>
            <button type="button" className="button" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
