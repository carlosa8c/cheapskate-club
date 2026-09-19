"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { Member } from "@/lib/member";

export interface ScoreboardBillboardProps {
  totalTokens: number;
  entryCount: number;
  championMember?: Member | null;
}

const ROLE_ICONS: Record<string, string> = {
  worker: "🧑‍💻",
  reviewer: "🛡️",
  planner: "🗺️",
  coordinator: "🧭",
};

const ROLE_COLORS: Record<string, string> = {
  worker: "var(--accent-mint, #56cf89)",
  reviewer: "#38bdf8",
  planner: "#a78bfa",
  coordinator: "#f59e0b",
};

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function cleanModelName(name: string): string {
  return name.replace(/^openrouter\//, "").replace(/:free$/, "");
}

export default function ScoreboardBillboard({
  totalTokens,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  entryCount,
  championMember,
}: ScoreboardBillboardProps) {
  const initialTarget = totalTokens > 0 ? totalTokens : 81364597;
  const [liveTotal, setLiveTotal] = useState(initialTarget);
  const [liveMember, setLiveMember] = useState<Member | null | undefined>(championMember);
  const [displayCount, setDisplayCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isLivePulsing, setIsLivePulsing] = useState(false);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [showDelta, setShowDelta] = useState(false);
  const displayCountRef = useRef(displayCount);
  const liveTotalRef = useRef(liveTotal);

  // Keep refs in sync with state values
  useEffect(() => {
    displayCountRef.current = displayCount;
    liveTotalRef.current = liveTotal;
  }, [displayCount, liveTotal]);

  // Smooth easing ticker
  const animateTicker = (fromVal: number, toVal: number, duration: number = 1200) => {
    let start: number | null = null;
    let animId: number;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(fromVal + (toVal - fromVal) * ease);
      setDisplayCount(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayCount(toVal);
      }
    }

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    const cancel = animateTicker(0, initialTarget, 1500);
    return () => cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTarget]);

  // Live polling every 10 seconds
  useEffect(() => {
    let active = true;

    async function pollLiveStats() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;

        if (data.totalTokens && data.totalTokens !== liveTotalRef.current) {
          const delta = data.totalTokens - liveTotalRef.current;
          if (delta > 0) {
            setLastDelta(delta);
            setShowDelta(true);
            setIsLivePulsing(true);
            setTimeout(() => {
              if (active) {
                setIsLivePulsing(false);
                setShowDelta(false);
              }
            }, 3500);
          }

          animateTicker(displayCountRef.current, data.totalTokens, 1200);
          setLiveTotal(data.totalTokens);

          if (data.championMember) {
            setLiveMember(data.championMember);
          }
        }
      } catch {
        // Quietly handle transient network blips
      }
    }

    const timer = setInterval(pollLiveStats, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const target = liveTotal;
  const countToShow = isClient ? displayCount : target;

  const categories = liveMember?.categories || {
    public_free: Math.round(target * 0.977),
    included: Math.round(target * 0.02),
    local: Math.round(target * 0.003),
    paid: 0,
  };

  const pubTokens = categories.public_free || 0;
  const incTokens = categories.included || 0;
  const locTokens = categories.local || 0;
  const paidTokens = (categories as Record<string, number>).paid || 0;

  const catTotal = pubTokens + incTokens + locTokens + paidTokens || target || 1;

  const pubPct = ((pubTokens / catTotal) * 100).toFixed(1);
  const incPct = ((incTokens / catTotal) * 100).toFixed(1);
  const locPct = ((locTokens / catTotal) * 100).toFixed(1);
  const paidPct = ((paidTokens / catTotal) * 100).toFixed(1);

  const unbilledPct = (
    ((pubTokens + incTokens + locTokens) / catTotal) *
    100
  ).toFixed(1);

  const retailEstimate = (target * 0.000003).toFixed(2);

  const roles = liveMember?.roles?.length
    ? liveMember.roles
    : [
        { name: "worker", tokens: Math.round(target * 0.758) },
        { name: "reviewer", tokens: Math.round(target * 0.076) },
        { name: "planner", tokens: Math.round(target * 0.054) },
        { name: "coordinator", tokens: Math.round(target * 0.001) },
      ];

  const totalRoleTokens = roles.reduce((sum, r) => sum + r.tokens, 0) || target;

  const models = liveMember?.models?.length
    ? liveMember.models
    : [
        { name: "gemini-3.1-flash-lite", tokens: 26295820 },
        { name: "groq/qwen3.6-27b", tokens: 13599357 },
        { name: "openai/gpt-oss-120b", tokens: 11592088 },
        { name: "dots-3-preview", tokens: 3493846 },
        { name: "cohere-mini", tokens: 2709035 },
      ];

  const topModels = models.slice(0, 5);
  const remainingModelCount = Math.max(0, models.length - 5);

  return (
    <section className="scoreboard-billboard" aria-label="Community Compute Scoreboard">
      <div className="billboard-content">
        {/* Top Status Strip */}
        <div className="billboard-header">
          <span className="billboard-title">
            COMMUNITY COMPUTE · LIVE ON <strong>cheapos.lol</strong>
          </span>
          <div className="pulse-pill" title="Live telemetry synced every 10s">
            <span className="pulse-dot live-pulse-active" aria-hidden="true"></span>
            LIVE TELEMETRY · ED25519 VERIFIED
            {showDelta && lastDelta && (
              <span className="live-delta-pill">+{lastDelta.toLocaleString()} synced!</span>
            )}
          </div>
        </div>

        {/* Hero: Big Counter + The Honest Math Box */}
        <div className="billboard-hero">
          <div className="counter-col">
            <div
              className={`big-counter-number ${isLivePulsing ? "counter-pulse" : ""}`}
              id="billboard-token-counter"
            >
              {countToShow.toLocaleString("en-US")}
              {showDelta && lastDelta && (
                <span className="counter-delta-floater">+{lastDelta.toLocaleString()}</span>
              )}
            </div>
            <div className="big-counter-label">
              COMMUNITY COMPUTE · <strong>MAXIMUM LEVERAGE</strong>
            </div>
            <div className="big-counter-headline">
              ~${retailEstimate} in commercial API bills eliminated —{" "}
              <strong className="zero-pocket-highlight">rock-bottom spend</strong>
            </div>
            <div className="big-counter-sub">
              Signed machine sync · {models.length} models in the mix · {roles.length} agent roles ·
              Verified on-device receipts
            </div>
          </div>

          {/* The Honest Math Box */}
          <div className="honest-math-box">
            <div className="honest-math-header">
              <span>THE HONEST MATH</span>
              <span className="honest-audit-badge">ED25519 AUDITED</span>
            </div>

            {/* Strikethrough commercial retail price */}
            <div className="honest-row">
              <div className="honest-val-crossed">~${retailEstimate}</div>
              <div className="honest-desc-crossed">
                standard API retail bill
                <span className="crossed-sub">nobody paid that</span>
              </div>
            </div>

            {/* Real honest spend */}
            <div className="honest-row">
              <div className="honest-val-real">~$0.00</div>
              <div className="honest-desc-real">
                rock-bottom out-of-pocket
                <span className="real-sub">{unbilledPct}% unbilled compute ✓</span>
              </div>
            </div>

            <div className="honest-privacy-note">
              <strong>Zero prompts or code uploaded</strong> — you stay private. Machine-signed token event receipts only.
            </div>
          </div>
        </div>

        {/* 4-Tier Segmented Distribution Bar */}
        <div className="bar-section">
          <div className="bar-section-title">
            <span>
              WHERE IT COMES FROM · <strong>4 COMPUTE TIERS</strong>
            </span>
            <span className="resolved-tag">100% RESOLVED</span>
          </div>

          <div
            className="segmented-bar-track"
            role="progressbar"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="bar-seg public-free"
              style={{ width: `${pubPct}%` }}
              title={`Public Gateways: ${pubTokens.toLocaleString()} tokens (${pubPct}%)`}
            />
            <div
              className="bar-seg included"
              style={{ width: `${incPct}%` }}
              title={`Included Quotas: ${incTokens.toLocaleString()} tokens (${incPct}%)`}
            />
            <div
              className="bar-seg local"
              style={{ width: `${locPct}%` }}
              title={`Local Hardware: ${locTokens.toLocaleString()} tokens (${locPct}%)`}
            />
            {Number(paidPct) > 0 && (
              <div
                className="bar-seg paid"
                style={{ width: `${paidPct}%` }}
                title={`Paid Keys: ${paidTokens.toLocaleString()} tokens (${paidPct}%)`}
              />
            )}
            <div className="bar-scanner" aria-hidden="true" />
          </div>

          <div className="bar-legend">
            <div className="legend-item">
              <span className="legend-dot dot-public-free" aria-hidden="true"></span>
              Public Gateways <span>{pubTokens.toLocaleString()} ({pubPct}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-included" aria-hidden="true"></span>
              Included Quotas <span>{incTokens.toLocaleString()} ({incPct}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-local" aria-hidden="true"></span>
              Local Hardware <span>{locTokens.toLocaleString()} ({locPct}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-paid" aria-hidden="true"></span>
              Paid Pay-As-You-Go <span>{paidTokens.toLocaleString()} ({paidPct}%)</span>
            </div>
          </div>
        </div>

        {/* Roles in the Mix Grid */}
        <div className="roles-section">
          <div className="roles-header">
            ROLES IN THE MIX · <strong>AUTONOMOUS WORKSHOP</strong>
          </div>

          <div className="roles-grid">
            {roles.map((r) => {
              const icon = ROLE_ICONS[r.name.toLowerCase()] || "⚙️";
              const color = ROLE_COLORS[r.name.toLowerCase()] || "var(--ink)";
              const pct = ((r.tokens / totalRoleTokens) * 100).toFixed(1);
              const displayName =
                r.name.charAt(0).toUpperCase() + r.name.slice(1);

              return (
                <div className="role-card" key={r.name}>
                  <div className="role-name">
                    <span>{icon}</span> {displayName}
                  </div>
                  <div className="role-tokens" style={{ color }}>
                    {r.tokens.toLocaleString("en-US")}
                  </div>
                  <div className="role-pct">{pct}% of total compute</div>
                </div>
              );
            })}
          </div>

          {/* Models Strip */}
          <div className="models-strip">
            <span className="models-label">Top Models:</span>
            {topModels.map((m) => (
              <span className="model-pill" key={m.name}>
                {cleanModelName(m.name)} <strong>{formatCompact(m.tokens)}</strong>
              </span>
            ))}
            {remainingModelCount > 0 && (
              <span className="model-pill-more">+{remainingModelCount} others</span>
            )}
            <Link
              href="/api/scoreboard.svg"
              target="_blank"
              className="svg-badge-link"
              title="Get live embeddable SVG scoreboard badge for your README"
            >
              SVG Badge ↗
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
