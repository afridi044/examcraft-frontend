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

  // DEVELOPMENT PERFORMANCE OPTIMIZATIONS
  ...(process.env.NODE_ENV === "development" && {
    // Faster development builds
    swcMinify: false, // Disable minification in dev for speed
    typescript: {
      ignoreBuildErrors: true, // Skip type checking in dev for speed
    },
    eslint: {
      ignoreDuringBuilds: true, // Skip linting in dev for speed
    },
  }),

  // Performance optimizations
  experimental: {
    // Enable optimized package imports for better bundle size
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "framer-motion",
      "chart.js",
    ],
    // Turbo optimizations
    turbo: {
      resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      // Reduce file watching for faster rebuilds
      rules: {
        "*.{js,jsx,ts,tsx}": {
          loaders: ["swc-loader"],
          as: "*.js",
        },
      },
    },
    // Enable concurrent features for better performance
    cpus: Math.max(1, require("os").cpus().length - 1),
  },

  // Optimize bundling and loading
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
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

  // DEVELOPMENT-SPECIFIC OPTIMIZATIONS
  ...(process.env.NODE_ENV === "development" && {
    // Reduce bundle analysis overhead
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Optimize development builds
        config.optimization = {
          ...config.optimization,
          // Disable splitChunks in development for faster rebuilds
          splitChunks: false,
        };

        // Reduce file watching overhead
        config.watchOptions = {
          ignored: [
            "**/node_modules/**",
            "**/.git/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
          ],
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  }),
};

export default nextConfig;
