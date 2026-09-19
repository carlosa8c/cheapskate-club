export interface SpotlightSponsor {
  status: "active" | "available";
  modelName: string;
  provider: string;
  badgeText: string;
  tagline: string;
  description: string;
  metrics: {
    speed?: string;
    costPerMillion?: string;
    contextWindow?: string;
    cheapoAvgTask?: string;
  };
  configSnippet: string;
  promoCode?: string;
  promoOffer?: string;
  actionUrl: string;
  actionLabel: string;
}

export interface FrugalTool {
  name: string;
  category: "Inference" | "Database" | "Hosting" | "Cache / Proxy";
  description: string;
  url: string;
}

export interface SponsorTier {
  id: string;
  name: string;
  price: string;
  period: string;
  eyebrow: string;
  description: string;
  deliverables: string[];
  featured?: boolean;
  scopeLabel: string;
  ctaText: string;
  ctaHref: string;
}

// Default spotlight configuration.
// If status is "available", the UI renders an honest, humorous self-promo pitch inviting providers to claim the spot.
export const CURRENT_SPOTLIGHT: SpotlightSponsor = {
  status: "available",
  modelName: "Your Model Here",
  provider: "Inference Innovator",
  badgeText: "SPOTLIGHT SLOT OPEN",
  tagline: "Have tokens cheaper than dirt? Prove it on real agent workflows.",
  description:
    "Cheapskate Club members have benchmarked 40M+ tokens across autonomous cheapoS runs. When you sponsor the spotlight, developers configure your model endpoint into their active agent loops.",
  metrics: {
    costPerMillion: "< $0.10 / 1M",
    speed: "Instant TTFT",
    cheapoAvgTask: "< $0.005",
  },
  configSnippet: `# Configure cheapoS with this month's featured engine:\nexport CHEAPOS_MODEL="provider/model-id"\nexport PROVIDER_API_KEY="your-api-key"`,
  promoOffer: "Sponsor this slot and grant trial tokens to our top builders.",
  actionUrl: "/sponsors",
  actionLabel: "Claim Next Month's Spotlight →",
};

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "spotlight",
    name: "Model spotlight",
    price: "$350 – $750",
    period: "month",
    eyebrow: "For model and inference providers",
    featured: true,
    scopeLabel: "Proposed placement and options",
    description:
      "Introduce your model with a sponsored homepage placement and a clear path for builders to try it.",
    deliverables: [
      "Homepage spotlight with your model, description, and provider link",
      "Setup guidance linking to your provider documentation",
      "Optional member trial-credit offer with your terms clearly stated",
      "Community run write-up available by agreement",
    ],
    ctaText: "Plan a launch spotlight",
    ctaHref: "mailto:sponsors@cheapos.lol?subject=Cheapskate%20Club%20-%20Model%20Spotlight",
  },
  {
    id: "directory",
    name: "Frugal Stack listing",
    price: "$49",
    period: "month",
    eyebrow: "For developer tools and infrastructure",
    scopeLabel: "Proposed listing",
    description:
      "Give your API, database, hosting platform, or developer tool a clear introduction in the club’s directory.",
    deliverables: [
      "Sponsored listing on this page for the agreed sponsorship period",
      "Product description and direct link to your platform",
      "Optional member offer with eligibility and expiry terms",
    ],
    ctaText: "Plan a launch listing",
    ctaHref: "mailto:sponsors@cheapos.lol?subject=Cheapskate%20Club%20-%20Directory%20Listing%20Inquiry",
  },
  {
    id: "patron",
    name: "Community patron",
    price: "$1 – $5",
    period: "month",
    eyebrow: "For individual supporters",
    scopeLabel: "Your support helps with",
    description:
      "Like what we’re building? Help cover the small, ongoing costs of running the club.",
    deliverables: [
      "Site hosting and maintenance",
      "Continued work on the community’s tools and documentation",
      "Contact us to arrange a way to contribute",
    ],
    ctaText: "Ask about supporting",
    ctaHref: "mailto:sponsors@cheapos.lol?subject=Cheapskate%20Club%20-%20Community%20Patron",
  },
];

// Illustrative directory entries; these do not establish a sponsorship or endorsement.
// Link to primary documentation instead of maintaining volatile third-party prices here.
export const FRUGAL_TOOLS: FrugalTool[] = [
  {
    name: "Groq Cloud",
    category: "Inference",
    description: "Hosted language-model inference with an OpenAI-compatible API.",
    url: "https://console.groq.com/docs/overview",
  },
  {
    name: "Google Antigravity",
    category: "Inference",
    description: "Free agentic model inference APIs, autonomous execution, and high-quota coding compute powered by Google Gemini.",
    url: "https://ai.google.dev/gemini-api/docs",
  },
  {
    name: "Supabase",
    category: "Database",
    description: "Postgres, authentication, and storage for application backends.",
    url: "https://supabase.com/docs",
  },
  {
    name: "Cloudflare Workers AI",
    category: "Inference",
    description: "Serverless model inference on Cloudflare’s network.",
    url: "https://developers.cloudflare.com/workers-ai/",
  },
];


export interface MicroPatronTier {
  id: string;
  name: string;
  price: string;
  badge: string;
  tagline: string;
  description: string;
  perks: string[];
  ctaUrl: string;
}

export const MICRO_PATRON_TIERS: MicroPatronTier[] = [
  {
    id: "dime-dropper",
    name: "The Dime Dropper",
    price: " / mo",
    badge: "🪙 Penny Patron",
    tagline: "Coffee is too expensive. Buy us a single penny of compute.",
    description: "Supports open-source cheapoS development and community leaderboard hosting.",
    perks: [
      "Exclusive '🪙 Penny Patron' profile badge",
      "Mention in the Cheapskate Hall of Benefactors",
      "Immense spiritual satisfaction of peak frugality"
    ],
    ctaUrl: "https://github.com/sponsors/carlosa8c"
  },
  {
    id: "free-refill",
    name: "Free Refill Connoisseur",
    price: " / mo",
    badge: "☕ Free Refill Benefactor",
    tagline: "Asking for hot water and bringing your own tea bag.",
    description: "Directly funds community test suites and automated benchmark runner infrastructure.",
    perks: [
      "All  perks + '☕ Free Refill Benefactor' profile badge",
      "Early preview access to new model-pair benchmarks",
      "Bragging rights on the community Discord/X"
    ],
    ctaUrl: "https://github.com/sponsors/carlosa8c"
  },
  {
    id: "anti-waste",
    name: "Anti-Waste Purist",
    price: " / mo",
    badge: "🌱 Anti-Waste Architect",
    tagline: "Friends don't let friends burn unquantized GPU clusters for hello-world.",
    description: "Sponsors community bounty pools for students and open-source contributors.",
    perks: [
      "All  perks + '🌱 Anti-Waste Architect' badge",
      "Vote on monthly model-pair benchmark priorities",
      "Direct recognition in the cheapoS repository README"
    ],
    ctaUrl: "https://github.com/sponsors/carlosa8c"
  }
];
