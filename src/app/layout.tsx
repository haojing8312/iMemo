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
        <title>HomeMemo - 百岁照生成</title>
        <meta name="description" content="基于AI的百岁照生成应用" />
      </head>
      <body>
        <AppInitializer />
        <header className="w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold">HomeMemo</Link>
            <nav className="flex items-center gap-4">
              <Link href="/upload" className="text-sm text-muted-foreground hover:text-foreground">上传照片</Link>
              <Link href="/generation/milestone" className="text-sm text-muted-foreground hover:text-foreground">选择里程碑</Link>
              <Link href="/settings" className="text-sm font-medium hover:underline">设置</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
