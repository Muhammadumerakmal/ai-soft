import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Pins the monorepo root explicitly so the standalone build output has a
  // deterministic shape (frontend/.next/standalone/frontend/server.js) —
  // without this, Next.js's automatic lockfile-based root detection depends
  // on which files happen to be present in the build context and can produce
  // a different layout depending on how the Docker build stage was assembled.
  outputFileTracingRoot: path.join(__dirname, '..'),
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: [],
  },
};

export default nextConfig;
