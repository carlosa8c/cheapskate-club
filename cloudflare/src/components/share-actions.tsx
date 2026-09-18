"use client";

import { useState, useEffect } from "react";

type ShareActionsProps = {
  handle: string;
  displayName: string;
  tokens: number;
  isChampion: boolean;
  url: string;
};

export function ShareActions({
  handle,
  displayName,
  tokens,
  isChampion,
  url,
}: ShareActionsProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const updateTheme = () => {
      const themeAttr = document.documentElement.getAttribute("data-theme");
      setCurrentTheme(themeAttr === "light" ? "light" : "dark");
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const cardImageUrl = `/api/cards/${handle}?theme=${currentTheme}`;
  const markdownSnippet = `[![cheapoS Club Card](https://cheapos.lol/api/cards/${handle}?theme=${currentTheme})](https://cheapos.lol/@${handle})`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyBadge = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2500);
    } catch {
      // Fallback
    }
  };

  const formattedTokens = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(tokens);

  const tweetText = `Less bill. More brag. My official cheapoS token telemetry at The Cheapskate Club:`;
  const tweetUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: tweetText,
    url,
  })}`;

  return (
    <section id="club-card" className="share-pass-showcase" aria-label="Official Club Card & Share Pass">
      {/* Dynamic Native Theme-Adaptive Club Card Preview */}
      <div className="club-card-preview-container">
        <div className={`club-card-face ${isChampion ? "is-champion" : ""}`}>
          <div className="card-arch-top">
            <span className="card-arch-eyebrow">
              {isChampion ? "ALL-TIME ZERO-COST CHAMPION" : "THE CHEAPSKATE CLUB"}
            </span>
            <div className="card-arch-title">
              {isChampion ? "Top Cheapo" : "Proudly cheap."}
            </div>
            <div className="card-arch-art" aria-hidden="true">
              {isChampion ? (
                <svg width="44" height="44" viewBox="0 0 160 164" style={{ transform: "rotate(-6deg)" }}>
                  <path d="M44 19h72v37c0 24-15 43-36 43S44 80 44 56V19Z" fill="currentColor" />
                  <path d="M43 29H21v20c0 20 12 30 31 30M117 29h22v20c0 20-12 30-31 30" fill="none" stroke="currentColor" strokeWidth="10" />
                  <path d="M72 95h16v29h21v15H51v-15h21Z" fill="currentColor" />
                  <path d="m80 34 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z" fill="var(--champ-bg)" />
                  <path d="M45 147h70" stroke="currentColor" strokeWidth="6" />
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 100 100">
                  <path d="M50 5V95M5 50H95M18 18L82 82M18 82L82 18" stroke="currentColor" strokeWidth="7" />
                </svg>
              )}
            </div>
            <span className="card-arch-motto">BIG BRAIN. SMALL BILL.</span>
          </div>

          <div className="card-member-info">
            <div className="card-member-display">{displayName}</div>
            <div className="card-member-h">@{handle}</div>
          </div>

          <div className="card-tokens-big">{formattedTokens}</div>
          <div className="card-tokens-lbl">zero-cost tokens &amp; counting</div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(86, 207, 137, 0.12)",
            border: "1px solid rgba(86, 207, 137, 0.3)",
            borderRadius: "999px",
            padding: "4px 12px",
            fontSize: "var(--text-meta)",
            fontWeight: 600,
            color: "var(--accent-mint)",
            margin: "10px 0 6px"
          }}>
            <span>🧑‍💻 72 Completed Tasks</span>
            <span>·</span>
            <span>🎯 91% Acceptance</span>
          </div>

          <div className="card-badge-footer">
            <span>Free remote + included + local</span>
            <span>cheapoS · Verified</span>
          </div>
        </div>
      </div>

      {/* Share Actions */}
      <div className="share-pass-content">
        <div className="engine-eyebrow">
          <span className="little-spark" aria-hidden="true">🪪</span>
          OFFICIAL MEMBERSHIP PASS · SHARE &amp; EMBED
        </div>
        <h2>Your verified Club Card.</h2>
        <p>
          Showcase your machine-verified compute mileage on X, in project docs, or
          embed the live badge in your GitHub README. Card dynamically matches dark &amp; light theme.
        </p>

        <div className="share-action-btn-group">
          <a
            className="button primary"
            href={`${cardImageUrl}&download=1`}
            download={`${handle}-cheapos-${currentTheme}.png`}
          >
            Download Card PNG ({currentTheme === "dark" ? "Dark" : "Light"}) ↓
          </a>
          <a
            className="button"
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on X ↗
          </a>
          <button
            type="button"
            className="button"
            onClick={handleCopyLink}
          >
            {copiedLink ? "Link Copied! ✓" : "Copy Link 🔗"}
          </button>
          <button
            type="button"
            className="button"
            onClick={handleCopyBadge}
          >
            {copiedBadge ? "Badge Copied! ✓" : "Copy README Badge 📋"}
          </button>
        </div>
      </div>
    </section>
  );
}
