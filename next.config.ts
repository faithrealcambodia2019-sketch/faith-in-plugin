import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.faithin.co" }],
        destination: "https://faithin.co/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
