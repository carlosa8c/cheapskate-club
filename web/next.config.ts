import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/scoreboard.svg",
        destination: "/api/scoreboard",
      },
    ];
  },
};

export default nextConfig;
