/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const nextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
