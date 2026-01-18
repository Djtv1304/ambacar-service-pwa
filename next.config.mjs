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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ambacar.ec',
        pathname: '/wp-content/**',
      },
    ],
  },
  // Silenciar warning de múltiples lockfiles
  // Especifica que este proyecto es la raíz, no el directorio HOME
  outputFileTracingRoot: process.cwd(),
}

export default nextConfig
