import Link from "next/link";
import { ensureProfile } from "@/lib/automatic-profile";
import { redirect } from "next/navigation";
import { authConfigured, supabase } from "@/lib/supabase";
import { saveProfile, signOut, disconnectInstallation } from "./actions";
import { SubmitButton } from "@/app/submit-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account & Settings · The Cheapskate Club",
  description: "Manage your cheapoS profile, linked machine installations, and sharing preferences.",
};

const messages: Record<string, string> = {
  disconnected: "Installation disconnected. Previously submitted usage stays with this account.",
  "disconnect-error": "Disconnection failed. Please try again.",
  saved: "Your profile is saved.",
  taken: "That handle is already taken. Choose another one.",
  invalid: "Use 3–30 letters, numbers or underscores for your handle, and a display name of 1–80 characters.",
  "save-error": "Your profile couldn’t be saved. Please try again shortly.",
  "signout-error": "Sign-out didn’t complete. Please try again.",
};

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!authConfigured()) redirect("/join");
  const client = await supabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/join");

  const { data: profile, error } = await ensureProfile(client, user);
  const { data: installations, error: installationError } = await client
    .from("club_installations")
    .select("id,sharing_enabled")
    .eq("owner_id", user.id);

  const { status } = await searchParams;

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
              {profile.sharing_enabled && (
                <Link className="button primary" href={`/@${profile.handle}`}>
                  View Public Profile ↗
                </Link>
              )}
              <Link className="button" href="/leaderboard">
                Leaderboard ↗
              </Link>
            </div>
          </div>
        )}
      </div>

      {status && messages[status] && (
        <p className="notice" role="status">
          {messages[status]}
        </p>
      )}

      {error && (
        <p role="alert" className="notice">
          We couldn’t load your profile. Please reload in a moment. Your saved settings haven’t changed.
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

          <form action={saveProfile} className="settings-form">
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
                  defaultValue={profile?.handle ?? ""}
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
                defaultValue={profile?.display_name ?? ""}
              />
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="sharing_enabled"
                  defaultChecked={profile?.sharing_enabled ?? false}
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
                  defaultChecked={profile?.share_models ?? false}
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
              <SubmitButton pendingText="Saving changes…">Save Profile</SubmitButton>
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

          {installationError ? (
            <p className="settings-muted-note">
              Connections are not available yet. Please try again shortly.
            </p>
          ) : installations?.length ? (
            <div className="installations-list">
              {installations.map((installation) => (
                <div className="installation-row" key={installation.id}>
                  <div className="installation-info">
                    <code className="inst-id">{installation.id}</code>
                    <span
                      className={`inst-badge ${
                        installation.sharing_enabled ? "badge-active" : "badge-paused"
                      }`}
                    >
                      {installation.sharing_enabled ? "🟢 Sync enabled" : "⏸️ Sync paused"}
                    </span>
                  </div>
                  <form action={disconnectInstallation}>
                    <input type="hidden" name="installation_id" value={installation.id} />
                    <SubmitButton pendingText="Disconnecting…">Disconnect</SubmitButton>
                  </form>
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
            <form action={signOut}>
              <SubmitButton pendingText="Signing out…">Sign Out</SubmitButton>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
