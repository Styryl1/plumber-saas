/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  images: {
    domains: ["images.unsplash.com", "localhost"],
  },

  // Turbopack configuration (stable in Next.js 15+)
  turbopack: {
    rules: {
      '*.svg': ['@svgr/webpack'],
    },
  },
  
  // Server external packages (moved from experimental)
  serverExternalPackages: ["@prisma/client"],
};

export default config;