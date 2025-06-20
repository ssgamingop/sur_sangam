
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
    // Fix for "Module not found" and "UnhandledSchemeError" for Node.js built-ins on the client side.
    // These fallbacks are for Webpack. Turbopack currently does not support webpack.resolve.fallback.
    if (!isServer) {
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.async_hooks = false;
      config.resolve.fallback['node:async_hooks'] = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback['node:net'] = false;
      config.resolve.fallback.fs = false;
      config.resolve.fallback['node:fs'] = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback['node:tls'] = false;
      config.resolve.fallback.http2 = false;
      config.resolve.fallback['node:http2'] = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback['node:dns'] = false;
    }
    return config;
  },
};

export default nextConfig;
