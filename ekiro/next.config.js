/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.nigeriapropertycentre.com" },
      { protocol: "http", hostname: "ekitistate.gov.ng" },
    ],
  },
};

module.exports = nextConfig;
