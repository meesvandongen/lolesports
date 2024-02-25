import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},

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
