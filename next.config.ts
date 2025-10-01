import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },

  turbopack: {

    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"], 
        as: "component",
      },
    },
  },
};

export default nextConfig;
