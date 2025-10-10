'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, Shield, Zap, Heart, Check, Clock, Github, FileText, Mail, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePhotoLibrary } from '@/lib/photoLibraryStore'

export default function Home() {
  const { libraryPhotos, loadLibraryPhotos } = usePhotoLibrary()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    loadLibraryPhotos().then(() => setIsLoaded(true))
  }, [])

  const hasPhotos = libraryPhotos.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 装饰性背景元素 */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary-200/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-8 py-20 md:py-32">
          <div className="text-center animate-fade-in">
            {/* Logo / 品牌标识 */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-neutral-200">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <span className="text-body font-medium text-neutral-700">AI 原生家庭相册</span>
            </div>

            {/* 主标题 */}
            <h1 className="text-display-lg md:text-[4rem] lg:text-[5rem] font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 bg-clip-text text-transparent">
                iMemo
              </span>
              <br />
              <span className="text-neutral-800">有爱（AI）的记忆</span>
            </h1>

            {/* 副标题 */}
            <p className="text-heading-md text-neutral-700 mb-6 max-w-2xl mx-auto">
              您的智能家庭相册管家
            </p>

            {/* 价值主张 */}
            <p className="text-body-lg text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              注重隐私保护的 AI 原生相册应用。所有数据本地存储，绝不上传云端，
              让您的珍贵记忆安全无忧。
            </p>

            {/* CTA 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-up">
              {isLoaded && (
                hasPhotos ? (
                  // 有照片：直接生成
                  <>
                    <Link href="/generation/select-photo">
                      <Button
                        size="lg"
                        className="gradient-ai text-white px-8 py-6 text-heading-xs shadow-ai hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        生成 AI 艺术照
                      </Button>
                    </Link>
                    <Link href="/library">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-8 py-6 text-heading-xs border-2 hover:bg-neutral-50 transition-all duration-300"
                      >
                        <ImagePlus className="h-5 w-5 mr-2" />
                        照片库 ({libraryPhotos.length})
                      </Button>
                    </Link>
                  </>
                ) : (
                  // 无照片：引导添加
                  <>
                    <Link href="/library">
                      <Button
                        size="lg"
                        className="gradient-ai text-white px-8 py-6 text-heading-xs shadow-ai hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <ImagePlus className="h-5 w-5 mr-2" />
                        开始添加照片
                      </Button>
                    </Link>
                    <Link href="#features">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-8 py-6 text-heading-xs border-2 hover:bg-neutral-50 transition-all duration-300"
                      >
                        了解更多
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>

            {/* 提示信息 */}
            <p className="mt-6 text-body-sm text-neutral-500 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              100% 本地处理，保护隐私安全
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading-lg text-neutral-800 mb-4">核心特性</h2>
            <p className="text-body-lg text-neutral-600">
              强大功能，为您的记忆保驾护航
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 特性 1: AI 艺术照 */}
            <Card className="border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="text-heading-sm text-neutral-800 mb-2 font-semibold">
                  多风格 AI 艺术照
                </h3>
                <p className="text-body text-neutral-600 leading-relaxed">
                  支持婚纱照、百日照、周岁照、毕业照等 20+ 种风格，每种风格生成 4 张高质量图片
                </p>
              </CardContent>
            </Card>

            {/* 特性 2: 隐私保护 */}
            <Card className="border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-gradient-to-br from-success-50 to-success-100 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-success-500" />
                </div>
                <h3 className="text-heading-sm text-neutral-800 mb-2 font-semibold">
                  隐私保护优先
                </h3>
                <p className="text-body text-neutral-600 leading-relaxed">
                  所有照片本地存储，绝不上传。AI 处理在本地或指定 API 完成，用户完全掌控数据
                </p>
              </CardContent>
            </Card>

            {/* 特性 3: 智能重试 */}
            <Card className="border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-secondary-500" />
                </div>
                <h3 className="text-heading-sm text-neutral-800 mb-2 font-semibold">
                  智能重试机制
                </h3>
                <p className="text-body text-neutral-600 leading-relaxed">
                  自动重试失败任务（指数退避），部分失败不影响成功图片展示，友好的错误提示
                </p>
              </CardContent>
            </Card>

            {/* 特性 4: 收藏管理 */}
            <Card className="border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="mb-4 p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <h3 className="text-heading-sm text-neutral-800 mb-2 font-semibold">
                  收藏管理
                </h3>
                <p className="text-body text-neutral-600 leading-relaxed">
                  一键收藏喜欢的照片，按风格分类浏览，独立的收藏夹视图，方便快速查找
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-heading-lg text-neutral-800 mb-4">产品规划</h2>
            <p className="text-body-lg text-neutral-600">
              持续进化，打造完整的 AI 原生家庭相册解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 第一阶段 - 当前版本 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center shadow-lg">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <Badge className="bg-primary-500 text-white mb-3 px-4 py-1">当前版本 v0.1.0</Badge>
                <h3 className="text-heading-md text-neutral-800 mb-2 font-semibold">
                  AI 艺术照生成
                </h3>
                <p className="text-body text-neutral-600 mb-4 leading-relaxed">
                  基于 SeeDream 4.0 超强图生图 AI 模型，自动生成人生各阶段艺术照
                </p>
                <ul className="text-body-sm text-neutral-600 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>多风格批量生成</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>收藏与导出功能</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>智能重试机制</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 第二阶段 - 规划中 */}
            <div className="relative opacity-75">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-16 w-16 rounded-full border-4 border-primary-300 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary-500" />
                </div>
                <Badge variant="outline" className="border-primary-500 text-primary-600 mb-3 px-4 py-1">规划中 v0.2.0</Badge>
                <h3 className="text-heading-md text-neutral-800 mb-2 font-semibold">
                  智能相册管理
                </h3>
                <p className="text-body text-neutral-600 mb-4 leading-relaxed">
                  家庭成员照片分类管理，AI 自动打标，智能搜索与筛选
                </p>
                <ul className="text-body-sm text-neutral-600 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>照片批量导入</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>人脸识别分类</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span>场景标签生成</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 第三阶段 - 未来计划 */}
            <div className="relative opacity-50">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-16 w-16 rounded-full border-4 border-neutral-300 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-neutral-500" />
                </div>
                <Badge variant="outline" className="border-neutral-400 text-neutral-600 mb-3 px-4 py-1">未来计划 v0.3.0+</Badge>
                <h3 className="text-heading-md text-neutral-800 mb-2 font-semibold">
                  创意内容生成
                </h3>
                <p className="text-body text-neutral-600 mb-4 leading-relaxed">
                  自动生成影集、视频剪辑、智能故事叙述、节日卡片生成
                </p>
                <ul className="text-body-sm text-neutral-600 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span>影集自动排版</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span>视频剪辑配乐</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                    <span>节日祝福卡片</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Promise Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-heading-lg text-neutral-800 mb-4">我们的隐私承诺</h2>
            <p className="text-body-lg text-neutral-600">
              隐私保护是 iMemo 的核心设计原则
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 本地存储 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-4 bg-primary-50 rounded-full inline-block">
                <Shield className="h-10 w-10 text-primary-500" />
              </div>
              <h3 className="text-heading-sm text-neutral-800 mb-2 font-semibold">本地存储</h3>
              <p className="text-body text-neutral-600 leading-relaxed">
                所有照片和生成结果仅保存在您的设备，绝不上传到任何服务器
              </p>
            </div>

            {/* 无遥测 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-4 bg-success-50 rounded-full inline-block">
                <Check className="h-10 w-10 text-success-500" />
              </div>
              <h3 className="text-heading-sm text-neutral-800 mb-2 font-semibold">无遥测追踪</h3>
              <p className="text-body text-neutral-600 leading-relaxed">
                不收集任何用户行为数据，不发送任何使用统计，完全尊重您的隐私
              </p>
            </div>

            {/* 开源透明 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-4 bg-info-50 rounded-full inline-block">
                <Github className="h-10 w-10 text-info-500" />
              </div>
              <h3 className="text-heading-sm text-neutral-800 mb-2 font-semibold">开源透明</h3>
              <p className="text-body text-neutral-600 leading-relaxed">
                代码完全开源，接受社区审计，确保安全可信，可自建 API 服务
              </p>
            </div>
          </div>

          {/* 许可证信息 */}
          <div className="mt-12 text-center">
            <p className="text-body text-neutral-600 mb-4">
              iMemo 采用双重许可模式：个人用户永久免费，企业用户需购买商业许可证
            </p>
            <Link href="/LICENSE">
              <Button variant="outline" size="sm" className="text-primary-600 border-primary-300 hover:bg-primary-50">
                <FileText className="h-4 w-4 mr-2" />
                查看许可证详情
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white/80 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* 版权信息 */}
            <div className="text-center md:text-left">
              <p className="text-body-sm text-neutral-600 mb-1">
                © 2025 <span className="font-semibold text-neutral-800">iMemo</span>. 版权所有.
              </p>
              <p className="text-caption text-neutral-500">
                采用双重许可模式 (Community & Commercial)
              </p>
            </div>

            {/* 导航链接 */}
            <div className="flex flex-wrap gap-6 justify-center">
              <a
                href="https://github.com/yourusername/imemo/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-neutral-600 hover:text-primary-500 transition-colors flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                问题反馈
              </a>
              <a
                href="https://github.com/yourusername/imemo/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-neutral-600 hover:text-primary-500 transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                功能建议
              </a>
              <Link
                href="/LICENSE"
                className="text-body-sm text-neutral-600 hover:text-primary-500 transition-colors flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                许可证
              </Link>
            </div>

            {/* 社交媒体 / 联系方式 */}
            <div className="text-center md:text-right">
              <p className="text-body-sm text-neutral-600 mb-1">商业许可咨询</p>
              <a
                href="mailto:364430879@qq.com"
                className="text-body-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
              >
                364430879@qq.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
