/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "static.lolesports.com",
      },
      {
        hostname: "assets.lolesports.com",
      },
    ],
  },
};

module.exports = nextConfig;
