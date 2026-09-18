export interface CheapoTitle {
  title: string;
  icon: string;
}

export const CHEAPO_TITLES: Record<number, CheapoTitle> = {
  1: { title: "Supreme Frugal Overlord", icon: "👑" },
  2: { title: "The Discount Baron", icon: "🥈" },
  3: { title: "The Thrifty Wizard", icon: "🥉" },
  4: { title: "Coupon Clipper Prime", icon: "🏷️" },
  5: { title: "Frontier Freeloader", icon: "🍞" },
  6: { title: "Power Strip Parasite", icon: "🔌" },
  7: { title: "Free Refill Connoisseur", icon: "☕" },
  8: { title: "Cardboard Box Architect", icon: "📦" },
  9: { title: "Dime Dropper Deluxe", icon: "🪙" },
  10: { title: "Gate Crasher First Class", icon: "🪪" },
  11: { title: "Sample Cart Lurker", icon: "🛒" },
  12: { title: "Clearance Rack Specialist", icon: "🎪" },
  13: { title: "Free-Tier Magnet", icon: "🧲" },
  14: { title: "Bottomless Soup Enjoyer", icon: "🥣" },
  15: { title: "Token Fisher", icon: "🎣" },
  16: { title: "Receipt Shredder", icon: "🧾" },
  17: { title: "Pocket Sandwich Maker", icon: "🥪" },
  18: { title: "WiFi Leech Extraordinaire", icon: "📶" },
  19: { title: "Free Tier Archaeologist", icon: "🔦" },
  20: { title: "Benchwarmer of Thrift", icon: "🪑" },
};

export function getCheapoTitle(rank: number): CheapoTitle | null {
  return CHEAPO_TITLES[rank] || null;
}
