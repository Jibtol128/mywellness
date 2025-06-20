/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  // Updated dev indicators with the correct property names
  devIndicators: {
    position: 'bottom-right'
  },
  // Disable telemetry and web vitals
  experimental: {
    webVitalsAttribution: [],
    disableOptimizedLoading: true,
    // Remove optimizeCss as it requires the 'critters' package
  },
  // Disable the "Fast Refresh" overlay and DevTools
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable React DevTools in development
      config.resolve.alias['react-devtools-inline'] = false;
      
      // Add environment variables to disable dev overlay
      config.plugins.push(
        new config.webpack.DefinePlugin({
          '__NEXT_REMOVE_DEV_OVERLAY': JSON.stringify(true),
        })
      );
    }
    return config;
  },
  // Suppress the "Powered by Next.js" header
  poweredByHeader: false
};

export default nextConfig;
