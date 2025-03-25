// next.config.mjs
import withNextIntl from "next-intl/plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const withConfig = withNextIntl("./src/i18n/config.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    domains: ["localhost"],
    formats: ["image/avif", "image/webp"],
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Improved production logging
  logging: {
    level: process.env.NODE_ENV === "production" ? "error" : "warn",
  },
  // Cache optimization
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  experimental: {
    // Enable modern optimizations
    typedRoutes: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(new MiniCssExtractPlugin());
    }
    return config;
  },
};

export default withConfig(nextConfig);
