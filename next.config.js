/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Helps html5-qrcode avoid double-mount issues in development
  images: {
    domains: ['localhost', 'campuspulse.vercel.app', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
