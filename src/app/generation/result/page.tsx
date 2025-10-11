'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Download, Home, Heart, Check, AlertCircle, Sparkles, FolderOpen, Share2, CheckCircle, Library } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getTaskById, toggleFavorite } from '@/lib/taskService'
import { saveImageToAlbum, saveBatchToAlbum } from '@/lib/exportService'
import type { GenerationResult } from '@/lib/types/task'
import type { GeneratedImage } from '@/lib/types'
import { saveAIGeneratedPhotos } from '@/lib/photoLibraryService'
import { usePhotoLibrary } from '@/lib/photoLibraryStore'

export default function ResultPage() {
  const router = useRouter()
  const { currentTask, reset, uploadedPhotos } = useAppStore()
  const { loadLibraryPhotos } = usePhotoLibrary()

  const [results, setResults] = useState<GenerationResult[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [autoSaved, setAutoSaved] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)

  // 使用 ref 防止重复保存,不受 React Strict Mode 影响
  const autoSaveExecutedRef = useRef(false)

  useEffect(() => {
    if (!currentTask) {
      router.push('/upload')
      return
    }

    loadResults()
  }, [currentTask?.id, refreshKey])

  // 自动保存到照片库
  useEffect(() => {
    if (!currentTask || results.length === 0 || autoSaved || autoSaving) {
      return
    }

    // 使用 ref 防止重复执行
    if (autoSaveExecutedRef.current) {
      return
    }

    // 检查是否已经保存过
    const savedFlag = localStorage.getItem(`task_${currentTask.id}_auto_saved`)
    if (savedFlag) {
      setAutoSaved(true)
      return
    }

    // 标记已执行
    autoSaveExecutedRef.current = true
    setAutoSaving(true)

    // 执行自动保存
    autoSaveToLibrary()
  }, [results, currentTask?.id])

  const loadResults = async () => {
    if (!currentTask) return

    try {
      const task = await getTaskById(currentTask.id)

      // 按 imageId 去重,防止重复数据
      const uniqueResults = Array.from(
        new Map(task.results.map((r: GenerationResult) => [r.imageId, r])).values()
      )

      console.log(`[ResultPage] 加载结果: ${uniqueResults.length} 张图片 (原始: ${task.results.length})`)

      setResults(uniqueResults)

      // Set default tab to first style or 'all'
      if (uniqueResults.length > 0) {
        const firstStyleId = uniqueResults[0].styleId
        setSelectedTab(firstStyleId)
      }
    } catch (error) {
      console.error('加载结果失败:', error)
    }
  }

  const autoSaveToLibrary = async () => {
    if (!currentTask || results.length === 0) return

    try {
      setAutoSaving(true)
      console.log('[ResultPage] 开始自动保存到照片库...')

      // 动态导入文件工具
      const { copyBlobToDataDir } = await import('@/lib/fileUtils')

      // 下载并保存 AI 生成的图片到本地
      const generatedImages: GeneratedImage[] = []

      for (let i = 0; i < results.length; i++) {
        const result = results[i]

        try {
          console.log(`[ResultPage] 正在下载图片 ${i + 1}/${results.length}: ${result.imageUrl}`)

          // 1. 从 imageUrl 下载图片
          const response = await fetch(result.imageUrl)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const blob = await response.blob()

          // 2. 生成文件名
          const fileName = `${result.styleName}-${result.index + 1}.png`

          // 3. 保存到本地应用数据目录
          const localPath = await copyBlobToDataDir(blob, fileName, 'ai-photos')

          console.log(`[ResultPage] 图片已保存: ${localPath}`)

          // 4. 构造 GeneratedImage
          generatedImages.push({
            id: result.imageId,
            taskId: currentTask.id,
            styleId: result.styleId,
            sequenceNum: result.index + 1, // 修复: 使用 index + 1
            filePath: localPath, // 修复: 使用本地路径
            fileSize: blob.size,
            width: result.width,
            height: result.height,
            createdAt: result.generatedAt,
            isSavedToAlbum: false,
          })
        } catch (error) {
          console.error(`[ResultPage] 下载图片失败 (${i + 1}/${results.length}):`, error)
          // 继续处理下一张图片
        }
      }

      if (generatedImages.length === 0) {
        throw new Error('没有成功下载任何图片')
      }

      console.log(`[ResultPage] 成功下载 ${generatedImages.length}/${results.length} 张图片`)

      // 5. 保存到照片库
      const savedCount = await saveAIGeneratedPhotos(
        currentTask.id,
        currentTask.milestoneName,
        'medium', // 默认相似度
        generatedImages,
        uploadedPhotos
      )

      console.log(`[ResultPage] 已自动保存 ${savedCount} 张照片到照片库`)

      // 刷新照片库
      await loadLibraryPhotos()

      // 标记已保存
      localStorage.setItem(`task_${currentTask.id}_auto_saved`, 'true')
      setAutoSaved(true)
      setAutoSaving(false)
    } catch (error) {
      console.error('[ResultPage] 自动保存失败:', error)
      alert(`自动保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
      setAutoSaving(false)
    }
  }

  const handleGoToLibrary = () => {
    router.push('/library')
  }

  const handleToggleFavorite = async (imageId: string) => {
    if (!currentTask) return

    try {
      await toggleFavorite(currentTask.id, imageId)
      setRefreshKey(prev => prev + 1) // Trigger refresh
    } catch (error) {
      console.error('收藏失败:', error)
    }
  }

  const handleBatchDownload = async (imagesToDownload: GenerationResult[]) => {
    if (imagesToDownload.length === 0) return

    try {
      for (const result of imagesToDownload) {
        const response = await fetch(result.imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${result.styleName}-${result.index + 1}.png`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Add delay to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      alert(`成功下载 ${imagesToDownload.length} 张图片`)
    } catch (error) {
      console.error('批量下载失败:', error)
      alert('批量下载失败,请重试')
    }
  }

  const handleDownloadAll = () => {
    handleBatchDownload(results)
  }

  const handleDownloadFavorites = () => {
    const favorited = results.filter(r => r.favorited)
    if (favorited.length === 0) {
      alert('没有收藏的图片')
      return
    }
    handleBatchDownload(favorited)
  }

  const handleSaveToAlbum = async (result: GenerationResult) => {
    try {
      const success = await saveImageToAlbum({
        imageUrl: result.imageUrl,
        suggestedName: `${result.styleName}-${result.index + 1}.png`
      })

      if (success) {
        alert('图片已保存')
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败,请重试')
    }
  }

  const handleBatchSaveToAlbum = async (imagesToSave: GenerationResult[]) => {
    if (imagesToSave.length === 0) return

    try {
      const options = imagesToSave.map(r => ({
        imageUrl: r.imageUrl,
        suggestedName: `${r.styleName}-${r.index + 1}.png`
      }))

      const successCount = await saveBatchToAlbum(options)
      alert(`成功保存 ${successCount}/${imagesToSave.length} 张图片`)
    } catch (error) {
      console.error('批量保存失败:', error)
      alert('批量保存失败,请重试')
    }
  }

  const handleSaveAllToAlbum = () => {
    handleBatchSaveToAlbum(results)
  }

  const handleSaveFavoritesToAlbum = () => {
    const favorited = results.filter(r => r.favorited)
    if (favorited.length === 0) {
      alert('没有收藏的图片')
      return
    }
    handleBatchSaveToAlbum(favorited)
  }

  const handleBackHome = () => {
    reset()
    router.push('/')
  }

  if (!currentTask) {
    return null
  }

  // Group results by style
  const resultsByStyle = results.reduce((acc, result) => {
    if (!acc[result.styleId]) {
      acc[result.styleId] = {
        styleName: result.styleName,
        results: []
      }
    }
    acc[result.styleId].results.push(result)
    return acc
  }, {} as Record<string, { styleName: string; results: GenerationResult[] }>)

  const styleIds = Object.keys(resultsByStyle)
  const totalImages = results.length
  const favoriteCount = results.filter(r => r.favorited).length

  // Check if task had failures
  const hasFailures = (currentTask.progress?.failedStyles?.length || 0) > 0
  const totalStyles = (currentTask.progress?.completedStyles || 0) + (currentTask.progress?.failedStyles?.length || 0)
  const expectedImages = totalStyles * 4 // 每种风格预期4张图片
  const successRate = expectedImages > 0 ? ((totalImages / expectedImages) * 100).toFixed(0) : '100'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 自动保存成功提示 */}
        {autoSaved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  ✅ 已自动保存 {totalImages} 张艺术照到照片库
                </p>
                <p className="text-xs text-green-700 mt-1">
                  您可以在照片库中查看和管理这些AI生成的照片
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToLibrary}
              className="border-green-300 hover:bg-green-100"
            >
              <Library className="h-4 w-4 mr-2" />
              前往照片库
            </Button>
          </div>
        )}

        {/* 自动保存中提示 */}
        {autoSaving && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            <p className="text-sm text-blue-900">
              正在自动保存到照片库...
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">生成完成!</h1>
              <p className="text-gray-600">
                {currentTask.milestoneName} • 共生成 {totalImages} 张图片 • {styleIds.length} 种风格
                {totalImages < expectedImages && ` • 成功率 ${successRate}%`}
              </p>
            </div>
            <Badge variant={currentTask.status === 'completed' ? 'default' : 'secondary'} className="h-8 px-4">
              {currentTask.status === 'completed' && '全部完成'}
              {currentTask.status === 'partial-success' && '部分成功'}
              {currentTask.status === 'failed' && '生成失败'}
            </Badge>
          </div>

          {/* Warning for partial success */}
          {hasFailures && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <strong>部分风格生成失败</strong>
                <p>
                  {currentTask.progress?.failedStyles?.length} 种风格未能成功生成,
                  但已成功生成 {results.length} 张图片供您使用。
                </p>
              </div>
            </div>
          )}

          {/* Info for partial image success within a style */}
          {!hasFailures && totalImages < expectedImages && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>部分图片生成成功</strong>
                <p>
                  由于 API 限流或网络问题,部分图片生成失败。
                  已成功生成 {totalImages}/{expectedImages} 张图片 (成功率 {successRate}%)。
                  您可以重新生成以获取更多图片。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalImages}</p>
                <p className="text-sm text-muted-foreground mt-1">总图片数</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-600">{favoriteCount}</p>
                <p className="text-sm text-muted-foreground mt-1">已收藏</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{styleIds.length}</p>
                <p className="text-sm text-muted-foreground mt-1">生成风格</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>导出图片</CardTitle>
            <CardDescription>将生成的图片保存到本地</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownloadAll} variant="default">
                <Download className="h-4 w-4 mr-2" />
                快速下载全部 ({totalImages} 张)
              </Button>
              <Button onClick={handleSaveAllToAlbum} variant="secondary">
                <FolderOpen className="h-4 w-4 mr-2" />
                保存全部到相册 ({totalImages} 张)
              </Button>
              {favoriteCount > 0 && (
                <>
                  <Button onClick={handleDownloadFavorites} variant="outline">
                    <Heart className="h-4 w-4 mr-2 fill-current text-pink-500" />
                    下载收藏 ({favoriteCount} 张)
                  </Button>
                  <Button onClick={handleSaveFavoritesToAlbum} variant="outline">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    保存收藏到相册 ({favoriteCount} 张)
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for each style */}
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
            <CardDescription>按风格查看生成的图片,点击 ❤️ 收藏您喜欢的照片</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  全部 ({totalImages})
                </TabsTrigger>
                {styleIds.map(styleId => (
                  <TabsTrigger key={styleId} value={styleId}>
                    {resultsByStyle[styleId].styleName} ({resultsByStyle[styleId].results.length})
                  </TabsTrigger>
                ))}
                {favoriteCount > 0 && (
                  <TabsTrigger value="favorites">
                    收藏 ({favoriteCount})
                  </TabsTrigger>
                )}
              </TabsList>

              {/* All images tab */}
              <TabsContent value="all">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((result) => (
                    <ImageCard
                      key={result.imageId}
                      result={result}
                      taskId={currentTask.id}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Per-style tabs */}
              {styleIds.map(styleId => (
                <TabsContent key={styleId} value={styleId}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {resultsByStyle[styleId].results.map((result) => (
                      <ImageCard
                        key={result.imageId}
                        result={result}
                        taskId={currentTask.id}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}

              {/* Favorites tab */}
              {favoriteCount > 0 && (
                <TabsContent value="favorites">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results
                      .filter(r => r.favorited)
                      .map((result) => (
                        <ImageCard
                          key={result.imageId}
                          result={result}
                          taskId={currentTask.id}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={() => router.push('/upload')}>
            生成更多
          </Button>
          <Button onClick={handleBackHome}>
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    </div>
  )
}

// Image card component
function ImageCard({
  result,
  taskId,
  onToggleFavorite
}: {
  result: GenerationResult
  taskId: string
  onToggleFavorite: (imageId: string) => void
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(result.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${result.styleName}-${result.index + 1}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败,请重试')
    }
  }

  const handleSave = async () => {
    try {
      const success = await saveImageToAlbum({
        imageUrl: result.imageUrl,
        suggestedName: `${result.styleName}-${result.index + 1}.png`
      })

      if (success) {
        alert('图片已保存')
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败,请重试')
    }
  }

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          <img
            src={result.imageUrl}
            alt={`${result.styleName} - ${result.index + 1}`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={result.favorited ? 'default' : 'secondary'}
                onClick={() => onToggleFavorite(result.imageId)}
                className="h-10 w-10"
              >
                <Heart
                  className={`h-5 w-5 ${result.favorited ? 'fill-current' : ''}`}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleDownload}
                className="h-10 w-10"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleSave}
                className="h-10 w-10"
              >
                <FolderOpen className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Favorite badge */}
          {result.favorited && (
            <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1.5">
              <Heart className="h-4 w-4 fill-current" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="text-sm font-medium truncate">{result.styleName}</p>
          <p className="text-xs text-muted-foreground">
            图片 {result.index + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
