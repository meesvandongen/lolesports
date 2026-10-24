import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},

  // Linting runs through `pnpm run lint` (vp lint), not ESLint during builds.
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        hostname: "static.lolesports.com",
      },
      {
        hostname: "assets.lolesports.com",
      },
      {
        hostname: "lolstatic-a.akamaihd.net",
      },
    ],
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist(nextConfig);
