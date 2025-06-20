
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for "Module not found: Can't resolve 'async_hooks'", "Module not found: Can't resolve 'net'", and "Module not found: Can't resolve 'fs'"
    // These fallbacks are for Webpack. Turbopack currently does not support webpack.resolve.fallback.
    if (!isServer) {
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.async_hooks = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

export default nextConfig;
