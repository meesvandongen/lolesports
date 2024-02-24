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

module.exports = nextConfig;
