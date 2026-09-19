import React, { useState } from "react";

export function QuickstartSection() {
  const [activeTrack, setActiveTrack] = useState<"desktop" | "cli">("desktop");
  const [copied, setCopied] = useState(false);

  const cliCommand = "git clone https://github.com/cheapos-app/cheapos.git && cd cheapoS && python3 -B cheapos/app.py";

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="quickstart" className="quickstart-section" aria-label="Get cheapoS">
      <div className="quickstart-card">
        <div className="quickstart-header">
          <div className="eyebrow">
            <span className="little-spark" aria-hidden="true">⚡</span>
            START BUILDING IN 30 SECONDS
          </div>
          <h2>Get cheapoS Free</h2>
          <p>
            Autonomous coding with local test execution and zero subscription tax.
            Choose your preferred environment:
          </p>
        </div>

        <div className="track-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTrack === "desktop"}
            className={`track-tab-btn ${activeTrack === "desktop" ? "active" : ""}`}
            onClick={() => setActiveTrack("desktop")}
          >
            <span aria-hidden="true">🖥️</span>
            macOS Desktop App
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTrack === "cli"}
            className={`track-tab-btn ${activeTrack === "cli" ? "active" : ""}`}
            onClick={() => setActiveTrack("cli")}
          >
            <span aria-hidden="true">⌨️</span>
            Terminal & CLI
          </button>
        </div>

        {activeTrack === "desktop" ? (
          <div className="install-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <strong style={{ fontSize: "var(--text-body)", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Download cheapoS for macOS (Apple Silicon & Intel)
                </strong>
                <span style={{ fontSize: "var(--text-meta)", color: "var(--text-secondary)", lineHeight: "1.5", display: "block" }}>
                  Native desktop app featuring visual task timeline, model pair matrix, automated test runner, and 1-click Workbench sharing.
                </span>
              </div>
              <a
                className="button primary"
                href="https://github.com/cheapos-app/cheapos/releases/latest"
                target="_blank"
                rel="noreferrer"
                style={{ whiteSpace: "nowrap" }}
              >
                Download cheapoS.dmg ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="install-box">
            <strong style={{ fontSize: "var(--text-body)", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
              Run via Git & Python (macOS / Linux)
            </strong>
            <span style={{ fontSize: "var(--text-meta)", color: "var(--text-secondary)", lineHeight: "1.5", display: "block" }}>
              Requires Python 3.10+. Clones the lightweight open-source agent core with zero bloated dependencies:
            </span>
            <div className="install-code">
              <code>{cliCommand}</code>
              <button type="button" className="copy-btn" onClick={handleCopy} aria-label="Copy CLI install command">
                {copied ? "✓ Copied" : "Copy command"}
              </button>
            </div>
          </div>
        )}

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-num">STEP 01</span>
            <h3>Grab 2 Free API Keys</h3>
            <p>
              cheapos harnesses generous free quotas. Get a free key from Google AI Studio (Gemini 2.5 Flash) and GroqCloud (Llama 3.3 70B). Zero credit card required.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <a className="step-link" href="https://aistudio.google.com" target="_blank" rel="noreferrer">
                Google Studio ↗
              </a>
              <a className="step-link" href="https://console.groq.com" target="_blank" rel="noreferrer">
                GroqCloud ↗
              </a>
            </div>
          </div>

          <div className="step-card">
            <span className="step-num">STEP 02</span>
            <h3>Enter Any Task Prompt</h3>
            <p>
              Type what you want to build (CLI tool, micro-app, test suite). The fast worker drafts code while the reviewer critiques and fixes mistakes autonomously.
            </p>
            <span style={{ fontSize: "var(--text-meta)", color: "var(--status-success)", fontWeight: 600 }}>
              ⚡ 0 bill shock · 100% local execution
            </span>
          </div>

          <div className="step-card">
            <span className="step-num">STEP 03</span>
            <h3>Deterministic Test & Ship</h3>
            <p>
              cheapos never stops until local unit tests pass (e.g. 28/28 tests passing). Review the diff and 1-click share your finished product to the Workbench.
            </p>
            <a className="step-link" href="/community">
              Explore 10 showcase builds →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
