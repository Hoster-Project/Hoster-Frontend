/** @type {import('next').NextConfig} */
const path = require("path");

const rawBackendOrigin =
  process.env.NEXT_PUBLIC_API_PROXY_TARGET ||
  process.env.API_PROXY_TARGET ||
  "http://127.0.0.1:5000";
const backendOrigin = rawBackendOrigin.replace(/\/+$/, "");

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "serpapi.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn1.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn2.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn3.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // output: 'standalone', // Uncomment if standalone output is required later
  // Silence workspace root warning
  outputFileTracingRoot: path.join(__dirname, "../"),
  experimental: {
    // Required for large multipart uploads proxied through Next rewrites (/api -> backend).
    middlewareClientMaxBodySize: "100mb",
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
