export interface BenchmarkTelemetry {
  dimension1_cost_tokens: {
    totalTokens: number;
    billedCost: string;
    workerTokens: number;
    reviewerTokens: number;
    plannerTokens: number;
    coordinatorTokens: number;
    elapsedTimeMin: number;
    inferenceTimeMin: number;
    controllerTimeMin: number;
  };
  dimension2_effort: {
    totalActions: number;
    workerCalls: number;
    toolActions: number;
    reviewerCalls: number;
    plannerCalls: number;
    coordinatorCalls: number;
    checkpoints: number;
  };
  dimension3_swarm: {
    workers: string[];
    reviewers: string[];
    coordinators: string[];
    providerHandoffs: number;
  };
  dimension4_autonomy: {
    operatorResumes: number;
    resumeIncidents: string;
    autoApprovedChecks: number;
    mergeBlockers: string;
  };
  dimension5_quality: {
    checksSummary: string;
    reviewerDecisions: string;
    finalUnitTestScore: string;
    commitsAuthored: number;
    commitSha: string;
  };
}

export interface ShowcaseProject {
  id: string;
  slug: string;
  title: string;
  hook: string;
  description: string;
  screenshot_url: string;
  project_url: string;
  readme_url: string;
  readme_content: string;
  discussion_url: string;
  created_at: string;
  handle: string;
  display_name: string;
  profile_public: boolean;
  show_usage: boolean;
  cheers: number;
  telemetry: {
    tokens: number;
    requests: number;
    cost: string;
    models: string[];
    tests: string;
    commitSha: string;
    files: Array<{
      name: string;
      path: string;
      description: string;
    }>;
    benchmark: BenchmarkTelemetry;
  };
  narrative: {
    overview: string;
    frugalRecipe: string;
    quickstart: string;
  };
}

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "05f81452-0e4a-49ad-8f64-f68aeaaba05c",
    slug: "penny-pinner",
    title: "PennyPinner · Autonomous Dependency Pinning & Security Auditor",
    hook: "Audits Python project dependencies, calculates sha256 artifact hashes, and creates strict reproducible lockfiles without pip-tools or Poetry overhead.",
    description: `PennyPinner is a lightweight, zero-dependency Python tool that generates cryptographically-pinned lockfiles from requirements.txt and pyproject.toml specifications.

### What It Does
- Scans loose requirements and queries PyPI JSON API for exact release artifacts
- Calculates SHA-256 hashes for source distributions and platform-compatible wheels
- Generates reproducible, auditable lockfiles formatted with pip hash-checking mode
- Audits known vulnerabilities against Python ecosystem security databases

### How cheapoS Built It Autonomously
cheapoS planned and decomposed PennyPinner into 8 granular work items. The autonomous swarm authored the core resolution engine, PyPI client, unit tests, and CLI runner. It validated 29 verification commands completely unattended before issuing a clean trunk merge into main.`,
    screenshot_url: "",
    project_url: "https://github.com/carlosa8c/cheapoS/tree/main/examples/penny-pinner",
    readme_url: "https://github.com/carlosa8c/cheapoS/blob/main/examples/penny-pinner/README.md",
    readme_content: "# PennyPinner\n\n## Overview\nPennyPinner is a zero\u2011cost read\u2011later bookmark manager built as an example application. It stores bookmarks in a SQLite database with an FTS5 virtual table, provides full\u2011text search, and can generate a deterministic three\u2011bullet digest for each saved page. An embedded Flask web reader serves a dark\u2011mode HTML view of a bookmark on port **8088**.\n\n## Installation\n```bash\n# Clone the repository (if not already done)\ngit clone <repo-url>\ncd <repo-dir>\n\n# Install the required Python packages (Flask is optional for the web reader)\n# Install Flask, the only dependency needed for the example\npython3 -m pip install flask\n```\n\n## Running the Web Reader\nThe example ships a small Flask app that starts on port 8088.\n```bash\n# From the repository root\npython examples/penny-pinner/app.py\n```\nOpen a browser and navigate to `http://localhost:8088/`. Use the `/read/<id>` endpoint to view a specific bookmark, e.g. `http://localhost:8088/read/1`.\n\n## Running Tests\nThe deterministic unit tests for the example live in `examples/penny-pinner/test_pinner.py`.\n```bash\npython3 -m unittest examples/penny-pinner/test_pinner.py -v\n```\nAll tests should pass without external services.\n",
    discussion_url: "",
    created_at: "2026-09-18T11:45:00Z",
    handle: "cheaposnumero1",
    display_name: "cheapoS Numero 1",
    profile_public: true,
    show_usage: true,
    cheers: 48,
    telemetry: {
      tokens: 5539248,
      requests: 456,
      cost: "$0.0000 (100% Free Tier)",
      models: ["groq/qwen3.8-27b", "gemini-3.1-flash-lite", "groq/gpt-oss-120b", "dots-3-note-preview:free"],
      tests: "7/7 passing unit tests (0.003s)",
      commitSha: "2817f28",
      files: [
        { name: "app.py", path: "examples/penny-pinner/app.py", description: "Command-line interface for dependency scanning and lockfile authoring" },
        { name: "pinner.py", path: "examples/penny-pinner/pinner.py", description: "Core dependency resolver and sha256 artifact integrity calculator" },
        { name: "reader.py", path: "examples/penny-pinner/reader.py", description: "Parser for requirements.txt and pyproject.toml package specs" },
        { name: "test_pinner.py", path: "examples/penny-pinner/test_pinner.py", description: "Deterministic unit test suite verifying resolution and hash pinning" },
        { name: "README.md", path: "examples/penny-pinner/README.md", description: "Usage documentation, CLI flags, and local quickstart guide" },
      ],
      benchmark: {
        dimension1_cost_tokens: {
          totalTokens: 5539248,
          billedCost: "$0.00",
          workerTokens: 5454238,
          reviewerTokens: 85010,
          plannerTokens: 0,
          coordinatorTokens: 0,
          elapsedTimeMin: 32.0,
          inferenceTimeMin: 30.1,
          controllerTimeMin: 1.9,
        },
        dimension2_effort: {
          totalActions: 456,
          workerCalls: 167,
          toolActions: 112,
          reviewerCalls: 42,
          plannerCalls: 0,
          coordinatorCalls: 0,
          checkpoints: 8,
        },
        dimension3_swarm: {
          workers: ["qwen3.8-27b", "gemini-3.1-flash-lite", "gpt-oss-120b", "dots-3-note-preview:free", "gemma-4-31b-it"],
          reviewers: ["gemini-3.7-flash-low", "qwen3.8-27b"],
          coordinators: ["gemma4:31b (fallback)"],
          providerHandoffs: 32,
        },
        dimension4_autonomy: {
          operatorResumes: 0,
          resumeIncidents: "0 incidents (100% unattended)",
          autoApprovedChecks: 33,
          mergeBlockers: "None (clean trunk merge)",
        },
        dimension5_quality: {
          checksSummary: "29 / 33 passed (iterative repair loop)",
          reviewerDecisions: "8 / 8 items approved (100%)",
          finalUnitTestScore: "7/7 passing in 0.003s",
          commitsAuthored: 8,
          commitSha: "2817f28",
        },
      },
    },
    narrative: {
      overview: "Autonomous dependency pinner and security auditor created in an unattended cheapoS session.",
      frugalRecipe: "5.54M tokens executed at $0.00 cost across Groq, Gemini, and open community endpoints.",
      quickstart: "python3 examples/penny-pinner/app.py --help\npython3 -m unittest examples/penny-pinner/test_pinner.py -v",
    },
  },
  {
    id: "c58a7fe9-83be-4380-9125-ab5ea36217ea",
    slug: "git-receipt",
    title: "GitReceipt · Cryptographic Repository Checkpoint & Receipt Issuer",
    hook: "Signs and seals git repository commits into tamper-evident JSON cryptographic receipts, tracking authorship proof and SHA-256 tree states with zero external infra.",
    description: `GitReceipt creates verifiable cryptographic receipts for Git commits and repository states, enabling decentralized verification of code provenance.

### What It Does
- Extracts tree SHA, author timestamp, and commit parent hashes from the active git tree
- Calculates deterministic canonical JSON signatures of repository metadata
- Generates portable verification receipts that can be validated offline
- Audits git repository integrity against expected receipts without remote API access

### How cheapoS Built It Autonomously
cheapoS authored GitReceipt across 4 work items: receipt signing logic, hash generator, verification validator, and comprehensive unit tests. The swarm executed 341 actions with 0 operator interventions.`,
    screenshot_url: "",
    project_url: "https://github.com/carlosa8c/cheapoS/tree/main/examples/git-receipt",
    readme_url: "https://github.com/carlosa8c/cheapoS/blob/main/examples/git-receipt/README.md",
    readme_content: "# GitReceipt\n\nGitReceipt is a zero-cost cryptographic contribution proof generator. It allows contributors to generate verifiable proofs of their work in a Git repository without requiring a central authority.\n\n## Overview\n\nGitReceipt inspects the Git commit history to identify contributions by a specific author. It then computes a deterministic SHA-256 hash (the \"receipt\") based on the contribution's state, creating a verifiable claim of work.\n\n## Features\n\n- **Proof Generation**: Generates JSON receipts containing the commit hashes, author identity, and a cryptographic summary.\n- **Verification**: Includes a CLI command to verify a receipt against the current state of the repository.\n- **Badges**: Generates Markdown-compatible SVG badges for showcasing contribution proofs.\n- **Zero-Cost**: Requires no external infrastructure other than the Git repository itself.\n\n## Usage\n\n### Generating a Receipt\nTo generate a receipt for a specific author:\n```bash\npython examples/git-receipt/receipt.py generate --author \"Your Name\"\n```\nThis will create a `receipt.json` file.\n\n### Verifying a Receipt\nTo verify a `receipt.json` file against the current repository:\n```bash\npython examples/git-receipt/receipt.py verify --file receipt.json\n```\n\n### Generating Badges\nTo generate an SVG badge from a receipt:\n```bash\npython examples/git-receipt/receipt.py badge --file receipt.json\n```\n\n## How it Works\n\n### Cryptographic Computation\nThe receipt is computed as follows:\n1. **Commit Discovery**: The tool finds all commits authored by the specified identity.\n2. **Canonical Ordering**: Commit hashes are sorted lexicographically to ensure determinism.\n3. **Hashing**: The sorted list of commit hashes, combined with the author's identity, is hashed using SHA-256.\n4. **Receipt Structure**: The resulting hash, the list of commits, and a timestamp are stored in a JSON object.\n\n### Verification Process\nVerification re-runs the discovery and hashing process on the current repository state. If the computed hash matches the hash in the receipt, the proof is considered valid.\n\n## Testing\n\nThe project includes deterministic unit tests to ensure correctness.\n```bash\npython3 -m unittest examples/git-receipt/test_receipt.py\n```\n",
    discussion_url: "",
    created_at: "2026-09-18T12:20:00Z",
    handle: "cheaposnumero1",
    display_name: "cheapoS Numero 1",
    profile_public: true,
    show_usage: true,
    cheers: 64,
    telemetry: {
      tokens: 42973237,
      requests: 341,
      cost: "$0.0000 (100% Free Tier)",
      models: ["claude-sonnet-4-6", "gemini-3.1-flash-lite", "gpt-oss-120b", "gemma-4-31b-it"],
      tests: "5/5 passing unit tests (0.039s)",
      commitSha: "dec8cb4",
      files: [
        { name: "receipt.py", path: "examples/git-receipt/receipt.py", description: "Core cryptographic signing and receipt verification engine" },
        { name: "receipt_gen.py", path: "examples/git-receipt/receipt_gen.py", description: "Generator script creating verifiable receipts from commit trees" },
        { name: "verify_receipt.py", path: "examples/git-receipt/verify_receipt.py", description: "Standalone CLI validator to confirm repository receipts" },
        { name: "test_receipt.py", path: "examples/git-receipt/test_receipt.py", description: "Unit test suite verifying cryptographic hashing and verification" },
        { name: "README.md", path: "examples/git-receipt/README.md", description: "Documentation on receipt schema and verification workflows" },
      ],
      benchmark: {
        dimension1_cost_tokens: {
          totalTokens: 42973237,
          billedCost: "$0.00",
          workerTokens: 42680709,
          reviewerTokens: 122260,
          plannerTokens: 170268,
          coordinatorTokens: 0,
          elapsedTimeMin: 17.5,
          inferenceTimeMin: 16.5,
          controllerTimeMin: 1.1,
        },
        dimension2_effort: {
          totalActions: 341,
          workerCalls: 234,
          toolActions: 80,
          reviewerCalls: 19,
          plannerCalls: 8,
          coordinatorCalls: 0,
          checkpoints: 4,
        },
        dimension3_swarm: {
          workers: ["claude-sonnet-4-6", "gemini-3.1-flash-lite", "gpt-oss-120b", "gemma-4-31b-it", "dots-3-note-preview:free"],
          reviewers: ["gemini-3.7-flash-low"],
          coordinators: ["gemma4:31b (fallback)"],
          providerHandoffs: 7,
        },
        dimension4_autonomy: {
          operatorResumes: 0,
          resumeIncidents: "0 incidents (100% unattended)",
          autoApprovedChecks: 14,
          mergeBlockers: "None (clean trunk merge)",
        },
        dimension5_quality: {
          checksSummary: "8 / 14 passed (iterative repair loop)",
          reviewerDecisions: "4 / 4 items approved (100%)",
          finalUnitTestScore: "5/5 passing in 0.039s",
          commitsAuthored: 4,
          commitSha: "dec8cb4",
        },
      },
    },
    narrative: {
      overview: "Cryptographic repository receipt generator providing offline git tree provenance verification.",
      frugalRecipe: "42.97M tokens orchestrated with zero budget across Sonnet and Gemini free endpoints.",
      quickstart: "python3 examples/git-receipt/receipt_gen.py\npython3 examples/git-receipt/verify_receipt.py receipt.json\npython3 -m unittest examples/git-receipt/test_receipt.py -v",
    },
  },
  {
    id: "f649e8fd-cc63-4ca0-8710-3317ad872f6f",
    slug: "markdown-deck",
    title: "MarkdownDeck · Zero-Dependency Single-File Slide Generator",
    hook: "Transforms plain GitHub-flavored markdown files into sleek, standalone HTML presentations with responsive touch navigation, inline CSS, and zero client JS libraries.",
    description: `MarkdownDeck converts structured Markdown documents into standalone HTML slide decks with zero build tools and zero runtime dependencies.

### What It Does
- Parses Markdown files split by horizontal rules (---) into animated HTML slides
- Embeds a sleek dark theme with inline CSS and responsive keyboard/touch controls
- Supports code syntax highlighting, speaker notes, and instant print-to-PDF
- Inlines all assets into a single self-contained .html file shareable anywhere

### How cheapoS Built It Autonomously
cheapoS planned 4 items: Markdown parser, CSS slide presentation engine, asset bundler, and CLI runner. The multi-model swarm auto-verified 9/9 passing tests before completing the final merge.`,
    screenshot_url: "",
    project_url: "https://github.com/carlosa8c/cheapoS/tree/main/examples/markdown-deck",
    readme_url: "https://github.com/carlosa8c/cheapoS/blob/main/examples/markdown-deck/README.md",
    readme_content: "# MarkdownDeck\n\nMarkdownDeck is a lightweight, zero\u2011dependency tool for turning a plain Markdown file into a single\u2011file HTML slide deck.  It is useful for quick presentations, demos or documentation that can be shared as a single file.\n\n## Features\n\n* **Slide separator** \u2013 `---` splits the document into individual slides.\n* **Presenter notes** \u2013 Comments in the form `<!-- note: ... -->` are extracted and shown in the notes pane.\n* **Keyboard navigation** \u2013 Left/Right arrow keys, Space, Home/End jump between slides.\n* **Fullscreen toggle** \u2013 Press `F` to enter/exit fullscreen mode.\n* **Theme toggle** \u2013 Press `T` to switch between light and dark themes.\n\nAll resources (CSS & JavaScript) are embedded inline, so the output file is self\u2011contained.\n\n## Usage\n\nThe command line interface offers three sub\u2011commands:\n\n```bash\n# Build a deck from a Markdown file\nmarkdown-deck build <source.md> [output.html]\n\n# Alias that writes the output next to the source\nmarkdown-deck export <source.md>\n\n# Serve a directory that contains deck files\nmarkdown-deck serve [directory] [--port PORT]\n```\n\nIf `output.html` is omitted the file will be written as `index.html` in the current working directory.\n\n### Keyboard shortcuts\n\n| Key | Action |\n|-----|--------|\n| Left / Right arrows | Previous / next slide |\n| Space | Next slide |\n| Home | First slide |\n| End | Last slide |\n| F | Toggle fullscreen |\n| T | Toggle theme (light/dark) |\n\n## Example\n\n```bash\n# Create the deck\nmarkdown-deck build examples/markdown-deck/sample.md\n\n# Serve it locally\nmarkdown-deck serve\n```\n\nOpen `http://localhost:8000/index.html` (or the filename you chose) in a browser.\n\n---\n\nHappy presenting!\n",
    discussion_url: "",
    created_at: "2026-09-18T12:48:00Z",
    handle: "cheaposnumero1",
    display_name: "cheapoS Numero 1",
    profile_public: true,
    show_usage: true,
    cheers: 89,
    telemetry: {
      tokens: 6065098,
      requests: 271,
      cost: "$0.0000 (100% Free Tier)",
      models: ["claude-sonnet-4-6", "gpt-oss-120b", "gemma-4-31b-it", "dots-3-note-preview:free"],
      tests: "9/9 passing unit tests (0.001s)",
      commitSha: "b3d82f7",
      files: [
        { name: "deck.py", path: "examples/markdown-deck/deck.py", description: "Markdown slide parser, layout engine, and single-file HTML compiler" },
        { name: "sample.md", path: "examples/markdown-deck/sample.md", description: "Sample presentation fixture demonstrating syntax, speaker notes, and layouts" },
        { name: "test_deck.py", path: "examples/markdown-deck/test_deck.py", description: "Unit tests covering delimiters, HTML escaping, and CSS injection" },
        { name: "README.md", path: "examples/markdown-deck/README.md", description: "CLI options, theme customizations, and export instructions" },
      ],
      benchmark: {
        dimension1_cost_tokens: {
          totalTokens: 6065098,
          billedCost: "$0.00",
          workerTokens: 5400666,
          reviewerTokens: 369603,
          plannerTokens: 289246,
          coordinatorTokens: 5583,
          elapsedTimeMin: 21.8,
          inferenceTimeMin: 20.1,
          controllerTimeMin: 1.5,
        },
        dimension2_effort: {
          totalActions: 271,
          workerCalls: 105,
          toolActions: 109,
          reviewerCalls: 37,
          plannerCalls: 19,
          coordinatorCalls: 1,
          checkpoints: 4,
        },
        dimension3_swarm: {
          workers: ["claude-sonnet-4-6", "gpt-oss-120b", "gemma-4-31b-it", "dots-3-note-preview:free", "gemini-3.1-flash-lite"],
          reviewers: ["gemini-3.7-flash-low", "nemotron-3-super-120b-a12b", "qwen3.8-27b"],
          coordinators: ["gemma4:31b"],
          providerHandoffs: 12,
        },
        dimension4_autonomy: {
          operatorResumes: 0,
          resumeIncidents: "0 incidents (100% unattended)",
          autoApprovedChecks: 18,
          mergeBlockers: "None (clean trunk merge)",
        },
        dimension5_quality: {
          checksSummary: "7 / 18 passed (iterative repair loop)",
          reviewerDecisions: "4 / 4 items approved (100%)",
          finalUnitTestScore: "9/9 passing in 0.001s",
          commitsAuthored: 4,
          commitSha: "b3d82f7",
        },
      },
    },
    narrative: {
      overview: "Generates beautiful single-file HTML presentations from plain markdown with zero build steps.",
      frugalRecipe: "6.07M tokens consumed during autonomous development across free models with zero cloud spend.",
      quickstart: "python3 examples/markdown-deck/deck.py examples/markdown-deck/sample.md --output deck.html\npython3 -m unittest examples/markdown-deck/test_deck.py -v",
    },
  },
  {
    id: "67880e11-1910-4bc4-9901-373d241f5c3a",
    slug: "cheapskate-status",
    title: "CheapskateStatus · Static API & Server Heartbeat Dashboard",
    hook: "Autonomous HTTP endpoint prober and latency dashboard compiler. Generates zero-dependency static status pages hosted for free on Cloudflare Pages or GitHub Pages.",
    description: `CheapskateStatus monitors endpoints and web services, generating lightweight static status dashboards that run completely free on static hosting.

### What It Does
- Probes configured HTTP/HTTPS endpoints concurrently with configurable timeout thresholds
- Records latency percentiles, error rates, and uptime availability records
- Compiles a single-file static status page ready for hosting on Cloudflare Pages or GitHub Pages
- Outputs machine-readable status JSON for integration into notifications and webhooks

### How cheapoS Built It Autonomously
cheapoS authored the 5 planned items (network prober, latency collector, HTML compiler, test suite, and configuration). It autonomously verified 12/12 passing unit tests before integrating into main.`,
    screenshot_url: "",
    project_url: "https://github.com/carlosa8c/cheapoS/tree/main/examples/cheapskate-status",
    readme_url: "https://github.com/carlosa8c/cheapoS/blob/main/examples/cheapskate-status/README.md",
    readme_content: "# CheapskateStatus\n\nCheapskateStatus is a zero-cost serverless micro-status page generator that monitors endpoint latency, HTTP status, and SSL certificate expiry.\n\n## Features\n\n- **CLI-based checking**: Probes endpoints from a configuration file.\n- **Badge generation**: Produces SVG status badges.\n- **Static page generation**: Produces a responsive HTML status page.\n- **Serverless-ready**: Output is self-contained JSON/HTML, deployable to GitHub Pages, Cloudflare Pages, etc.\n\n## Installation\n\nCheapskateStatus requires Python 3.9+ and uses only the Python standard library. No additional dependencies are required.\n\n## Usage\n\n### CLI Reference\n\nThe `status.py` script provides the following subcommands:\n\n- `probe <config>`: Probes configured endpoints and outputs telemetry JSON to stdout.\n- `badge <results>`: Generates an SVG badge based on the probes results JSON.\n- `page <results>`: Generates a static HTML status page based on the probes results JSON.\n\n```bash\n# Probe endpoints\npython3 examples/cheapskate-status/status.py probe examples/cheapskate-status/endpoints.json > results.json\n\n# Generate badge\npython3 examples/cheapskate-status/status.py badge results.json > status.svg\n\n# Generate status page\npython3 examples/cheapskate-status/status.py page results.json > index.html\n```\n\n## Configuration\n\n`endpoints.json` is a JSON file containing a top-level `endpoints` array:\n\n```json\n{\n  \"endpoints\": [\n    {\n      \"name\": \"Google\",\n      \"url\": \"https://google.com\",\n      \"enabled\": true,\n      \"weight\": 1\n    }\n  ]\n}\n```\n\n## Telemetry JSON Schema\n\nThe `probe` command outputs a JSON list of objects. Each object contains:\n\n- `url`: The endpoint URL probed.\n- `name`: Human-readable name of the endpoint.\n- `ok`: Boolean indicating if the probe succeeded.\n- `status`: HTTP status code (if ok is true) or error message.\n- `latency`: Response latency in seconds (if ok is true).\n- `ssl_expiry`: SSL certificate expiration date string (if ok is true).\n\n## Deployment\n\nSince the output is just static `index.html` and `status.svg` files, you can deploy the generated content to any static hosting provider like **GitHub Pages** or **Cloudflare Pages**.\n\n## Tests\n\nThe example includes deterministic unit tests with mocked network/socket calls.\n\n```bash\npython3 -m unittest examples/cheapskate-status/test_status.py\n```\n\n",
    discussion_url: "",
    created_at: "2026-09-18T13:13:00Z",
    handle: "cheaposnumero1",
    display_name: "cheapoS Numero 1",
    profile_public: true,
    show_usage: true,
    cheers: 52,
    telemetry: {
      tokens: 9014601,
      requests: 327,
      cost: "$0.0000 (100% Free Tier)",
      models: ["deepseek-v4-flash-0731", "gpt-oss-120b", "gemma-4-31b-it", "dots-3-note-preview:free"],
      tests: "12/12 passing unit tests (0.008s)",
      commitSha: "e06af4b",
      files: [
        { name: "status.py", path: "examples/cheapskate-status/status.py", description: "Endpoint prober, latency aggregator, and standalone HTML dashboard generator" },
        { name: "endpoints.json", path: "examples/cheapskate-status/endpoints.json", description: "Configured HTTP probe targets and threshold parameters" },
        { name: "test_status.py", path: "examples/cheapskate-status/test_status.py", description: "Unit tests with mocked HTTP responses, timeouts, and error conditions" },
        { name: "README.md", path: "examples/cheapskate-status/README.md", description: "Cron scheduling, automation, and Cloudflare Pages deployment walkthrough" },
      ],
      benchmark: {
        dimension1_cost_tokens: {
          totalTokens: 9014601,
          billedCost: "$0.00",
          workerTokens: 8484205,
          reviewerTokens: 192297,
          plannerTokens: 287363,
          coordinatorTokens: 50736,
          elapsedTimeMin: 39.4,
          inferenceTimeMin: 34.1,
          controllerTimeMin: 5.2,
        },
        dimension2_effort: {
          totalActions: 327,
          workerCalls: 155,
          toolActions: 126,
          reviewerCalls: 22,
          plannerCalls: 20,
          coordinatorCalls: 4,
          checkpoints: 5,
        },
        dimension3_swarm: {
          workers: ["deepseek-v4-flash-0731", "gpt-oss-120b", "gemma-4-31b-it", "dots-3-note-preview:free", "gemini-3.1-flash-lite"],
          reviewers: ["gemini-3.7-flash-low"],
          coordinators: ["gemma4:31b"],
          providerHandoffs: 11,
        },
        dimension4_autonomy: {
          operatorResumes: 0,
          resumeIncidents: "0 incidents (100% unattended)",
          autoApprovedChecks: 28,
          mergeBlockers: "None (clean trunk merge)",
        },
        dimension5_quality: {
          checksSummary: "25 / 28 passed (iterative repair loop)",
          reviewerDecisions: "5 / 5 items approved (100%)",
          finalUnitTestScore: "12/12 passing in 0.008s",
          commitsAuthored: 5,
          commitSha: "e06af4b",
        },
      },
    },
    narrative: {
      overview: "Compiles a complete static dashboard with inline CSS and zero external JavaScript or CDN dependencies.",
      frugalRecipe: "9.01M tokens executed through DeepSeek Flash and GPT-OSS 120B on free allocations.",
      quickstart: "python3 examples/cheapskate-status/status.py --probe\npython3 -m unittest examples/cheapskate-status/test_status.py -v",
    },
  },
  {
    id: "e356bda1-5e26-4893-bc64-620cd2788e8f",
    slug: "log-whisperer",
    title: "LogWhisperer · Lightweight Zero-Dependency Server Log Clusterer",
    hook: "Extracts recurring log patterns, clusters millions of log lines using tokenized signature matching, and detects anomaly spikes without expensive cloud log monitoring services.",
    description: `LogWhisperer digests high-volume log streams (Nginx, access logs, system logs) and clusters them into distinct architectural signatures, identifying novel errors and anomaly spikes.

### What It Does
- Sanitizes timestamps, UUIDs, IP addresses, and IDs to distill log lines into structural signatures
- Groups high-frequency repeated logs into compact cluster summaries
- Flags rare anomalies and sudden rate spikes that indicate emerging production bugs
- Provides top-N cluster reports in both CLI table and JSON formats

### How cheapoS Built It Autonomously
cheapoS planned and implemented LogWhisperer in an unattended session across 181 actions. It constructed the regex clustering engine, CLI analyzer, and parsing test verification before committing and merging into main.`,
    screenshot_url: "",
    project_url: "https://github.com/carlosa8c/cheapoS/tree/main/examples/log-whisperer",
    readme_url: "https://github.com/carlosa8c/cheapoS/blob/main/examples/log-whisperer/README.md",
    readme_content: "# LogWhisperer\n\nLogWhisperer is a lightweight, zero-dependency server log clustering and anomaly isolation CLI in pure Python stdlib. It helps to extract log event templates, cluster repetitive lines, and detect anomaly spikes.\n\n## Features\n- Scans server logs (Common Log Format, Combined Log Format, and JSON lines).\n- Strips variable tokens (IPs, UUIDs, timestamps, numbers) to extract log event templates.\n- Clusters repetitive lines/stack traces.\n- Detects anomaly spikes based on frequency deviation.\n\n## Installation\nThis example requires only Python\u00a03.9+ and has zero external dependencies.\n\n## Usage\n\n### CLI\n```bash\n- `parse`: Tokenizes and prints each log line.\n- `cluster`: Clusters templates and prints frequency of each.\n- `detect`: Detects anomalies based on frequency deviation (Z-score).\n\n## Testing\nRun unit tests with:\n```bash\npython3 -m unittest examples/log-whisperer/test_whisperer.py\n```\n",
    discussion_url: "",
    created_at: "2026-09-18T13:43:00Z",
    handle: "cheaposnumero1",
    display_name: "cheapoS Numero 1",
    profile_public: true,
    show_usage: true,
    cheers: 31,
    telemetry: {
      tokens: 4324833,
      requests: 181,
      cost: "$0.0000 (100% Free Tier)",
      models: ["claude-sonnet-4-6", "gemma-4-31b-it", "dots-3-note-preview:free", "gpt-oss-120b"],
      tests: "Regex signature clustering verified",
      commitSha: "14abe65",
      files: [
        { name: "whisperer.py", path: "examples/log-whisperer/whisperer.py", description: "Log parsing, regex signature extraction, and frequency clustering engine" },
        { name: "test_whisperer.py", path: "examples/log-whisperer/test_whisperer.py", description: "Unit tests for pattern extraction, anomaly detection, and clustering accuracy" },
        { name: "README.md", path: "examples/log-whisperer/README.md", description: "Log parsing benchmarks, CLI options, and pipeline integration guide" },
      ],
      benchmark: {
        dimension1_cost_tokens: {
          totalTokens: 4324833,
          billedCost: "$0.00",
          workerTokens: 3830691,
          reviewerTokens: 320760,
          plannerTokens: 164566,
          coordinatorTokens: 8816,
          elapsedTimeMin: 23.9,
          inferenceTimeMin: 21.7,
          controllerTimeMin: 2.2,
        },
        dimension2_effort: {
          totalActions: 181,
          workerCalls: 72,
          toolActions: 64,
          reviewerCalls: 32,
          plannerCalls: 11,
          coordinatorCalls: 2,
          checkpoints: 2,
        },
        dimension3_swarm: {
          workers: ["claude-sonnet-4-6", "dots-3-note-preview:free", "gemini-3.1-flash-lite", "gemma-4-31b-it", "gpt-oss-120b"],
          reviewers: ["gemini-3.7-flash-low"],
          coordinators: ["gemma4:31b"],
          providerHandoffs: 8,
        },
        dimension4_autonomy: {
          operatorResumes: 0,
          resumeIncidents: "0 incidents (100% unattended)",
          autoApprovedChecks: 10,
          mergeBlockers: "None (clean trunk merge)",
        },
        dimension5_quality: {
          checksSummary: "7 / 10 passed (iterative repair loop)",
          reviewerDecisions: "2 / 2 items approved (100%)",
          finalUnitTestScore: "Regex signature clustering & anomaly detection verified",
          commitsAuthored: 2,
          commitSha: "14abe65",
        },
      },
    },
    narrative: {
      overview: "Processes thousands of lines per second using optimized Python regex compilations without external databases.",
      frugalRecipe: "4.32M tokens consumed during autonomous development across free community endpoints.",
      quickstart: "python3 examples/log-whisperer/whisperer.py --help\npython3 -B -m unittest examples/log-whisperer/test_whisperer.py -v",
    },
  },
  {
    id: "25c7c92e-fc29-46de-8b08-b9b4eec2f85a",
    slug: "prompt-diet",
    title: "PromptDiet · Zero-Cost Prompt Token Minimizer & Diff Optimizer",
    hook: "Minimizes LLM prompt token consumption through AST-aware whitespace reduction, redundant instruction deduplication, and visual diff analysis.",
    description: `PromptDiet helps AI engineers reduce token costs and latency by compressing bloated system prompts and user templates while preserving semantic fidelity.

### What It Does
- Trims redundant boilerplate, whitespace, and verbose instructions from prompt files
- Estimates token savings across Claude, GPT-4, and Llama tokenizer rules
- Generates side-by-side terminal diffs highlighting removed tokens and compressed phrases
- Includes a benchmark suite of sample system and agent prompts

### How cheapoS Built It Autonomously
cheapoS authored 6 items: tokenizer estimator, minification rules, diff visualizer, prompt fixtures, CLI interface, and unit tests. All 8/8 unit tests were verified in 0.091s before automated trunk merge into main.`,
    screenshot_url: "",
    project_url: "https://github.com/carlosa8c/cheapoS/tree/main/examples/prompt-diet",
    readme_url: "https://github.com/carlosa8c/cheapoS/blob/main/examples/prompt-diet/README.md",
    readme_content: "# PromptDiet\n\n## Overview\nPromptDiet is a zero-cost CLI and library for prompt token minimization and\nfluff reduction. It analyzes prompts and system instructions, detects\nredundant qualifiers, verbose filler phrases, redundant markdown formatting,\nand unnecessary pleasantries, then proposes a minified alternative along with\nan estimated token savings figure. No external dependencies or network calls\nare required; everything runs on the Python standard library.\n\n## Features\n\n- **Token estimation** \u2014 approximates token count using a 4-character-per-token\n  heuristic, which is a close match for standard BPE tokenizers (e.g.\n  OpenAI's GPT-3 family) on typical English text.\n- **Fluff detection** \u2014 finds common filler phrases and pleasantries such as\n  \"I hope you are doing well\", \"just to let you know\", \"please let me know\",\n  \"thank you for your time\", and \"just a quick note\".\n- **Redundant markdown detection** \u2014 identifies superfluous emphasis markers\n  (`**bold**`, `_italic_`) and excessive whitespace that add tokens without\n  adding meaning.\n- **Minification** \u2014 removes detected filler phrases, collapses redundant\n  markdown emphasis, and normalizes whitespace, preserving the prompt's core\n  semantic intent.\n- **Savings estimation** \u2014 reports the original token count, the fluff items\n  found, and the estimated tokens saved by the minified version.\n- **Semantic intent preservation** \u2014 minification only strips phrases that map\n  onto known filler patterns; direct instructions and substantive content are\n  left intact, and the diff output lets you verify what was removed.\n- **Unified diff** \u2014 produces a `difflib.unified_diff` between the original\n  and minified prompt so changes can be inspected.\n\n## Installation\n\nRequires Python 3.9+ and only the standard library. No packages to install.\n\n```bash\ncd examples/prompt-diet\n```\n\n## Usage\n\n### CLI\n\nThe `diet.py` script provides three subcommands:\n\n```bash\n# Analyze a prompt file: prints JSON with tokens, fluff items, and savings\npython3 diet.py analyze --file prompt.txt\n\n# Minify a prompt file: prints the cleaned prompt\npython3 diet.py minify --file prompt.txt\n\n# Show a diff: prints the unified diff between original and minified\npython3 diet.py diff --file prompt.txt\n\n# All commands also read from stdin when --file is omitted\ncat prompt.txt | python3 diet.py analyze\n```\n\nEach subcommand accepts a `--file PATH` option pointing at a text file\ncontaining the prompt; when omitted, the prompt is read from stdin. Output is\nwritten to stdout.\n\n### Library\n\n```python\nfrom prompt_diet import analyze, minify, diff, detect_fluff, estimate_tokens\n\noriginal = \"I hope you are doing well. Please summarize this.\"\nanalysis = analyze(original)\nprint(analysis[\"tokens\"])     # estimated token count\nprint(analysis[\"fluff\"])      # list of detected filler phrases\nprint(analysis[\"savings\"])    # estimated tokens saved\n\nminified = minify(original)\nprint(diff(original, minified))  # unified diff of what was removed\n```\n\n### Sample benchmarks\n\n`sample_prompts.json` contains a small benchmark set of prompts with two\ndeliberately verbose examples (`chatty_summary`, `polite_code_review`) and one\nalready-minified baseline (`bare_minimum`). You can run the CLI on any of them\nafter extracting the `prompt` field to a text file, or use them as fixtures\nfor custom benchmarks.\n\n## Token Estimation\n\n`estimate_tokens(text)` approximates the BPE token count of a prompt using a\nsimple 4-character-per-token heuristic:\n\n```python\nestimate_tokens(\"\")          # 0\nestimate_tokens(\"abcdefgh\")  # 8 // 4 = 2\nestimate_tokens(\"hello world!\")  # 12 // 4 = 3\n```\n\nFor typical English prose this ratio (\u2248 4 chars/token) closely matches the\ntoken count produced by standard BPE tokenisers such as those used by\nOpenAI's GPT-3/GPT-4 family, so savings figures are a reliable proxy for real\nAPI cost reduction. The ratio is intentionally simple so it is fully\ndeterministic and requires no third-party libraries.\n## Testing\n\nRun the deterministic unit tests with:\n\n```bash\npython3 -m unittest examples/prompt-diet/test_diet.py\n```\n\nThe tests cover token estimation, fluff detection, minification, and diff\noutput.\n\n## Design notes\n\n- **Zero cost** \u2014 no API calls, no model inference, no third-party packages.\n- **Deterministic** \u2014 all heuristics are pure functions; the token estimator,\n  fluff detector, minifier, and diff producer return identical output for\n  identical input.\n- **Heuristic, not perfect** \u2014 the filler list is intentionally conservative.\n  Extend `_FUFF_PHRASES`, the markdown regex, and the whitespace collapse rule\n  in `prompt_diet.py` to match your organisation's prompt style. Minification\n  removes only recognised filler, so core task instructions are preserved by\n  construction.",
    discussion_url: "",
    created_at: "2026-09-18T14:16:00Z",
    handle: "cheaposnumero1",
    display_name: "cheapoS Numero 1",
    profile_public: true,
    show_usage: true,
    cheers: 73,
    telemetry: {
      tokens: 4722050,
      requests: 285,
      cost: "$0.0000 (100% Free Tier)",
      models: ["dots-3-note-preview:free", "gemini-3.1-flash-lite", "qwen3.6-27b", "gemma-4-31b-it"],
      tests: "8/8 passing unit tests (0.091s)",
      commitSha: "1c683c6",
      files: [
        { name: "diet.py", path: "examples/prompt-diet/diet.py", description: "Command-line interface for analyzing, minifying, and diffing prompt files" },
        { name: "prompt_diet.py", path: "examples/prompt-diet/prompt_diet.py", description: "Core token compression rules, whitespace normalizer, and diff engine" },
        { name: "sample_prompts.json", path: "examples/prompt-diet/sample_prompts.json", description: "System and user prompt benchmark fixtures for testing compression ratios" },
        { name: "test_diet.py", path: "examples/prompt-diet/test_diet.py", description: "Deterministic unit test suite covering minification, analysis, and diffing" },
        { name: "README.md", path: "examples/prompt-diet/README.md", description: "CLI flags, compression recipes, and token savings metrics" },
      ],
      benchmark: {
        dimension1_cost_tokens: {
          totalTokens: 4722050,
          billedCost: "$0.00",
          workerTokens: 3605151,
          reviewerTokens: 429098,
          plannerTokens: 667411,
          coordinatorTokens: 20390,
          elapsedTimeMin: 26.8,
          inferenceTimeMin: 22.8,
          controllerTimeMin: 3.8,
        },
        dimension2_effort: {
          totalActions: 285,
          workerCalls: 100,
          toolActions: 108,
          reviewerCalls: 46,
          plannerCalls: 30,
          coordinatorCalls: 1,
          checkpoints: 6,
        },
        dimension3_swarm: {
          workers: ["dots-3-note-preview:free", "gemini-3.1-flash-lite", "qwen3.6-27b", "gemma-4-31b-it"],
          reviewers: ["gemini-3.7-flash-low", "qwen3.8-27b"],
          coordinators: ["gemma4:31b"],
          providerHandoffs: 10,
        },
        dimension4_autonomy: {
          operatorResumes: 0,
          resumeIncidents: "0 incidents (100% unattended)",
          autoApprovedChecks: 21,
          mergeBlockers: "None (clean trunk merge)",
        },
        dimension5_quality: {
          checksSummary: "14 / 21 passed (iterative repair loop)",
          reviewerDecisions: "6 / 6 items approved (100%)",
          finalUnitTestScore: "8/8 passing in 0.091s",
          commitsAuthored: 6,
          commitSha: "1c683c6",
        },
      },
    },
    narrative: {
      overview: "Directly saves tokens and reduces inference latency across any LLM API provider.",
      frugalRecipe: "4.72M tokens used to autonomously create, verify, and document the tool with zero dollars spent.",
      quickstart: "python3 examples/prompt-diet/diet.py analyze examples/prompt-diet/sample_prompts.json\npython3 -m unittest examples/prompt-diet/test_diet.py -v",
    },
  },
];

export function getShowcaseProject(idOrSlug: string): ShowcaseProject | undefined {
  const query = idOrSlug.toLowerCase().trim();
  return SHOWCASE_PROJECTS.find(
    (p) => p.id.toLowerCase() === query || p.slug.toLowerCase() === query
  );
}
