import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Docker optimization: Enable standalone output for minimal production builds
  output: "standalone",

  // Performance optimizations
  experimental: {
    // Enable optimized package imports for better bundle size
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
    // Enable aggressive tree shaking
    turbo: {
      resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },
  },

  // Optimize bundling and loading
  compiler: {
    // Remove console.log in production but keep errors
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Image optimization
  images: {
    // Enable modern image formats
    formats: ["image/webp", "image/avif"],
    // Optimize for better performance
    minimumCacheTTL: 86400, // 24 hours
  },

  // Enable gzip compression
  compress: true,

  // Optimize page loading
  poweredByHeader: false,

  // Ensure proper CSS handling in production
  swcMinify: true,

  // Webpack configuration to handle CSS properly
  webpack: (config, { dev, isServer }) => {
    // Ensure CSS is handled properly in production
    if (!dev && !isServer) {
      // Prevent CSS purging issues with Tailwind
      config.optimization = {
        ...config.optimization,
        sideEffects: ["*.css"],
      };
    }
    return config;
  },
};

export default nextConfig;
