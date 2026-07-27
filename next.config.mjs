/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.VERCEL ? ".next" : process.env.NEXT_DIST_DIR || ".next-build",
};

export default nextConfig;
