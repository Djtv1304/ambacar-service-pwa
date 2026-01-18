/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Silenciar warning de múltiples lockfiles
  // Especifica que este proyecto es la raíz, no el directorio HOME
  outputFileTracingRoot: process.cwd(),
}

export default nextConfig
