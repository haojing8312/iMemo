/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Tauri
  images: {
    unoptimized: true, // Tauri doesn't support next/image optimization
  },
}

export default nextConfig
