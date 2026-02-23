import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@fotoman/ai', '@fotoman/core'],
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    }
    return config
  },
}

export default nextConfig
