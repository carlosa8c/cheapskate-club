"use client";

import { useState } from "react";
import "../styles/provider-spotlight.css";

export interface ProviderSpotlightProps {
  variant?: "full" | "compact";
}

export default function ProviderSpotlight({ variant = "full" }: ProviderSpotlightProps) {
  const [copiedPreset, setCopiedPreset] = useState(false);
  const [tab, setTab] = useState<"cli" | "env">("cli");

  const cliCommand = "cheapos run --worker groq/llama-3.3-70b-versatile --reviewer gemini-2.5-flash-lite";
  const envSnippet = `export CHEAPOS_WORKER_MODEL="groq/llama-3.3-70b-versatile"
export CHEAPOS_REVIEWER_MODEL="gemini-2.5-flash-lite"
export GROQ_API_KEY="gsk_..."
export GEMINI_API_KEY="AIza..."`;

  const activeSnippet = tab === "cli" ? cliCommand : envSnippet;

  function copyToClipboard() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(activeSnippet);
      setCopiedPreset(true);
      setTimeout(() => setCopiedPreset(false), 2200);
    }
  }

  return (
    <aside className="spotlight-card" aria-label="Featured Frugal Model Pair of the Month">
      <div className="spotlight-top-strip">
        <div className="spotlight-pill-group">
          <span className="spotlight-badge">⚡ CHEAP MODEL PAIR OF THE MONTH</span>
          <span className="spotlight-sub-pill">VERIFIED $0.00 INFERENCE</span>
        </div>
        <div className="spotlight-external-links">
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="spotlight-ext-link"
          >
            Groq Console ↗
          </a>
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="spotlight-ext-link"
          >
            Google AI Studio ↗
          </a>
        </div>
      </div>

      <div className="spotlight-body">
        <div className="spotlight-title-row">
          <h3 className="spotlight-heading">
            Groq Llama 3.3 70B + Google Gemini 2.5 Flash Lite
          </h3>
          <p className="spotlight-tagline">
            Ultra-fast sub-200ms autonomous execution paired with an independent multi-model reviewer for zero dollars.
          </p>
        </div>

        <div className="spotlight-metrics-grid">
          <div className="spotlight-metric-box">
            <span className="spotlight-metric-label">Estimated Cost / Task</span>
            <span className="spotlight-metric-val">$0.00</span>
            <span className="spotlight-metric-note">Free community tiers</span>
          </div>
          <div className="spotlight-metric-box">
            <span className="spotlight-metric-label">Avg Execution Latency</span>
            <span className="spotlight-metric-val">172 ms</span>
            <span className="spotlight-metric-note">Groq LPU acceleration</span>
          </div>
          <div className="spotlight-metric-box">
            <span className="spotlight-metric-label">Daily Token Quota</span>
            <span className="spotlight-metric-val">14,400 RPD</span>
            <span className="spotlight-metric-note">Zero credit card needed</span>
          </div>
          <div className="spotlight-metric-box">
            <span className="spotlight-metric-label">Verification Gate</span>
            <span className="spotlight-metric-val">100% Unattended</span>
            <span className="spotlight-metric-note">Zero self-review bias</span>
          </div>
        </div>

        <div className="spotlight-cli-container">
          <div className="spotlight-cli-header">
            <span className="spotlight-cli-title">
              <span>🚀 1-Click Engine Preset</span>
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className={`spotlight-copy-btn ${tab === "cli" ? "copied" : ""}`}
                onClick={() => setTab("cli")}
              >
                CLI Preset
              </button>
              <button
                type="button"
                className={`spotlight-copy-btn ${tab === "env" ? "copied" : ""}`}
                onClick={() => setTab("env")}
              >
                .env Config
              </button>
            </div>
          </div>

          <div className="spotlight-cli-codebox">
            <code>{activeSnippet}</code>
            <button
              type="button"
              className={`spotlight-copy-btn ${copiedPreset ? "copied" : ""}`}
              onClick={copyToClipboard}
              aria-label="Copy preset to clipboard"
            >
              {copiedPreset ? "✓ Copied!" : "Copy Preset →"}
            </button>
          </div>

          <div className="spotlight-perks-row">
            <span className="spotlight-perk">
              <span>🛡️</span> Independent senior reviewer prevents intra-model blindspots
            </span>
            <span className="spotlight-perk">
              <span>⚡</span> Automatic fallback to local Ollama/Gemma if 429 rate limit hit
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
