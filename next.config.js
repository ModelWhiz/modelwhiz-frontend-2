/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true' || process.env.ANALYZE_SERVER === 'true' || process.env.ANALYZE_BROWSER === 'true',
  analyzerMode: 'static',
  reportFilename: process.env.ANALYZE_SERVER ? '../analyze/server.html' : process.env.ANALYZE_BROWSER ? '../analyze/client.html' : '../analyze/main.html',
  openAnalyzer: false,
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    optimizePackageImports: [
      '@chakra-ui/react',
      '@chakra-ui/icons',
      'framer-motion',
      'react-icons',
      'recharts'
    ],
    // Performance optimizations - disabled in development
    optimizeCss: process.env.NODE_ENV === 'production',
    // Enable faster builds
    esmExternals: true,
    // Optimize server components
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  images: {
    domains: [
      'localhost', // For local development assets from http://localhost:8000
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 20,
          },
          chakra: {
            test: /[\\/]node_modules[\\/]@chakra-ui[\\/]/,
            name: 'chakra',
            chunks: 'all',
            priority: 20,
          },
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Faster source maps in development
      config.devtool = 'eval-cheap-module-source-map';
    }

    return config;
  },

  // Bundle analyzer
  ...(process.env.ANALYZE && {
    webpack: (config) => {
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),
};

module.exports = withBundleAnalyzer(nextConfig);