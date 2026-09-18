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
  pricingHighlight: string;
  url: string;
  badge?: string;
}

export interface SponsorTier {
  id: string;
  name: string;
  price: string;
  period: string;
  eyebrow: string;
  description: string;
  deliverables: string[];
  popular?: boolean;
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
    name: "Model of the Month Spotlight",
    price: "$350 – $750",
    period: "per month",
    eyebrow: "MAXIMUM ADOPTION & PROOF",
    popular: true,
    description:
      "For inference providers and model labs who want developers actively plugging their API keys into autonomous coding agents.",
    deliverables: [
      "Hero spotlight card on Homepage and Observatory (/engine)",
      "Featured badge and model filter pill on the Leaderboard",
      "1-Click configuration recipe in cheapoS onboarding docs",
      "Community trial credit distribution (give $5–$10 in tokens to active builders)",
      "Monthly verified task case study featured on X / Twitter (@cheapoS)",
      "Zero-fluff social proof: real agent runs proving your low cost per completed task",
    ],
    ctaText: "Inquire about Spotlight",
    ctaHref: "mailto:sponsors@cheapos.lol?subject=Cheapskate%20Club%20-%20Model%20of%20the%20Month%20Spotlight",
  },
  {
    id: "directory",
    name: "The Frugal Stack Directory",
    price: "$49",
    period: "per month",
    eyebrow: "CURATED TOOL DIRECTORY",
    popular: false,
    description:
      "For developer tools, serverless DBs, and lean hosting providers who align with our anti-waste, small-bill philosophy.",
    deliverables: [
      "Permanent placement in our curated /tools directory",
      "Featured badge: 'Verified Frugal Tool'",
      "Direct referral link and promotional perk code for members",
      "Inclusion in the Cheapskate Club newsletter and monthly roundup",
    ],
    ctaText: "List Your Tool",
    ctaHref: "mailto:sponsors@cheapos.lol?subject=Cheapskate%20Club%20-%20Directory%20Listing%20Inquiry",
  },
  {
    id: "patron",
    name: "The Tightwad Patron",
    price: "$1 – $5",
    period: "per month",
    eyebrow: "COMMUNITY MICRO-PATRON",
    popular: false,
    description:
      "For individual developers who love the cheapoS ethos and want to help cover Supabase & Vercel hosting costs.",
    deliverables: [
      "Exclusive '🪙 Tightwad Patron' badge on your public profile card",
      "Bragging rights in the club directory and Discord/X",
      "The warm feeling of keeping a non-commercial open-source benchmark alive",
    ],
    ctaText: "Back on Polar / GitHub ($1)",
    ctaHref: "https://polar.sh",
  },
];

export const FRUGAL_TOOLS: FrugalTool[] = [
  {
    name: "Groq Cloud",
    category: "Inference",
    description: "Ultra-fast LPU inference with generous free-tier quotas and penny-fraction pricing.",
    pricingHighlight: "Generous Free Tier · Fast TTFT",
    url: "https://groq.com",
    badge: "Community Favorite",
  },
  {
    name: "Cerebras Inference",
    category: "Inference",
    description: "Wafer-scale engine delivering 2,000+ tokens/sec on Llama models for fractions of a cent.",
    pricingHighlight: "Extreme Speed · $0.10 / 1M tokens",
    url: "https://cerebras.ai",
    badge: "Speed Champion",
  },
  {
    name: "DeepSeek API",
    category: "Inference",
    description: "Frontier reasoning and coding capabilities at 1/10th the cost of legacy models.",
    pricingHighlight: "$0.14 / 1M tokens (Cache Hit $0.014)",
    url: "https://deepseek.com",
    badge: "Thrift Standard",
  },
  {
    name: "Supabase",
    category: "Database",
    description: "Generous Postgres, Auth, and Storage free tier powering the Cheapskate Club backend.",
    pricingHighlight: "Free 500MB DB · 50k MAU",
    url: "https://supabase.com",
  },
  {
    name: "Cloudflare Workers AI",
    category: "Hosting",
    description: "Serverless edge compute and serverless AI inference on Cloudflare global network.",
    pricingHighlight: "10,000 free requests / day",
    url: "https://workers.cloudflare.com",
  },
];
