import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@fotoman/ai', '@fotoman/core', '@fotoman/pdf', '@fotoman/db', '@fotoman/jobs'],
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    }
    return config
  },
  turbopack: {
    resolveAlias: {
      // Turbopack needs explicit extension resolution for .js -> .ts
    },
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
}

export default nextConfig
