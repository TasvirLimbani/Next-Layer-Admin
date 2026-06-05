/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'nextlayer.soon.it',
      },
    ],
  },
};

export default nextConfig;