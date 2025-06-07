/** @type {import('next').NextConfig} */
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// const withPWA = require('next-pwa') // Ensure this is commented out or removed

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, {}) => {
    config.resolve.extensions.push('.ts', '.tsx');
    config.resolve.fallback = { fs: false };
    config.plugins.push(new NodePolyfillPlugin());
    return config;
  },
};

// Ensure withPWA() wrapper is NOT here
module.exports = withBundleAnalyzer(nextConfig);