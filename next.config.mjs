/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Tauri
  images: {
    unoptimized: true, // Tauri doesn't support next/image optimization
  },
  // T014: 配置 webpack 以忽略 face-api.js 在浏览器中不需要的 Node.js 模块
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
}

export default nextConfig
