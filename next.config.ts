import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "@react-three/fiber",
      "@react-three/drei",
      "three",
      "gsap",
    ],
  },

  // Nueva sintaxis de Turbopack (actualizada)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    // Resolvers optimizados para librerías pesadas
    resolveAlias: {
      three: "three",
      gsap: "gsap",
    },
  },
};

export default nextConfig;
