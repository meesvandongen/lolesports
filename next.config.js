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
      {
        hostname: "lolstatic-a.akamaihd.net",
      },
    ],
  },
};

module.exports = nextConfig;
