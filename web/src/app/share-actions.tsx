"use client";

import { useState } from "react";

export function ShareActions({ handle, url }: { handle: string; url: string }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const cardImageUrl = `/api/cards/${handle}`;
  const markdownSnippet = `[![cheapoS Club Card](https://cheapskate-club.vercel.app/api/cards/${handle})](https://cheapskate-club.vercel.app/@${handle})`;

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

  const tweetText = `Less bill. More brag. My official cheapoS token telemetry at The Cheapskate Club:`;
  const tweetUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: tweetText,
    url,
  })}`;

  return (
    <section id="club-card" className="share-pass-showcase" aria-label="Official Club Card & Share Pass">
      <div className="club-card-preview-frame">
        <img
          src={`${cardImageUrl}?download=1`}
          alt={`@${handle} official cheapoS club card`}
          className="club-card-preview-img"
          loading="lazy"
        />
      </div>

      <div className="share-pass-content">
        <div className="engine-eyebrow">
          <span className="little-spark" aria-hidden="true">🪪</span>
          OFFICIAL MEMBERSHIP PASS · SHARE &amp; EMBED
        </div>
        <h2>Your verified Club Card.</h2>
        <p>
          Showcase your machine-verified compute mileage on X, in project docs, or
          embedded live in your GitHub README.
        </p>

        <div className="share-action-btn-group">
          <a
            className="button primary"
            href={`${cardImageUrl}?download=1`}
            download={`${handle}-cheapos-card.png`}
          >
            Download Card PNG ↓
          </a>
          <a
            className="button"
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on X ↗
          </a>
          <button className="button" type="button" onClick={handleCopyLink}>
            {copiedLink ? "✓ Link Copied" : "Copy Link 🔗"}
          </button>
        </div>

        <div className="copy-badge-code-box">
          <code>{markdownSnippet}</code>
          <button
            className="copy-mini-btn"
            type="button"
            onClick={handleCopyBadge}
            title="Copy Markdown badge to embed in GitHub README"
          >
            {copiedBadge ? "✓ Copied" : "Copy README Badge 📋"}
          </button>
        </div>
      </div>
    </section>
  );
}
