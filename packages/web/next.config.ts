import type { NextConfig } from 'next'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error -- no type declarations available
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'

const nextConfig: NextConfig = {
  transpilePackages: ['@fotoman/ai', '@fotoman/core', '@fotoman/pdf', '@fotoman/db', '@fotoman/jobs'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new PrismaPlugin()]
    }
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
