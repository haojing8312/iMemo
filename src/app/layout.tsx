import '@/styles/globals.css'
import Link from 'next/link'
import { AppInitializer } from '@/components/AppInitializer'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <title>iMemo - 有爱的记忆 | AI 原生家庭相册</title>
        <meta name="description" content="注重隐私保护的 AI 原生相册应用，本地存储，绝不上传云端" />
      </head>
      <body>
        <AppInitializer />
        <header className="w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/70">
          <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-heading-sm bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              iMemo
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/upload" className="text-body text-neutral-600 hover:text-primary-500 transition-colors">上传照片</Link>
              <Link href="/generation/milestone" className="text-body text-neutral-600 hover:text-primary-500 transition-colors">选择里程碑</Link>
              <Link href="/settings" className="text-body text-neutral-600 hover:text-primary-500 transition-colors">设置</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
