'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { getCompatibleStyles, getAllStyleCollections } from '@/lib/styleService'
import { type StyleCollectionType } from '@/lib/configLoader'
import { createTask } from '@/lib/taskService'
import type { Style } from '@/lib/types/style'
import { Check, ChevronLeft, Sparkles } from 'lucide-react'

export default function StyleSelectionPage() {
  const router = useRouter()
  const {
    uploadedPhotos,
    selectedMilestone,
    setCurrentTask,
    setGenerationMode
  } = useAppStore()

  const [compatibleStyles, setCompatibleStyles] = useState<Style[]>([])
  const [selectedStyleIds, setSelectedStyleIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [selectedCollection, setSelectedCollection] = useState<StyleCollectionType>('realistic-studio')

  // 获取所有风格集合
  const styleCollections = getAllStyleCollections().filter(c => c.id !== 'all')

  useEffect(() => {
    // Validate navigation
    if (!uploadedPhotos || uploadedPhotos.length === 0) {
      router.push('/upload')
      return
    }

    if (!selectedMilestone) {
      router.push('/generation/milestone')
      return
    }

    // Load compatible styles for selected milestone
    loadCompatibleStyles()
  }, [selectedMilestone, selectedCollection])

  const loadCompatibleStyles = async () => {
    if (!selectedMilestone) return

    try {
      setIsLoading(true)
      const styles = await getCompatibleStyles(selectedMilestone.id, selectedCollection)
      setCompatibleStyles(styles)

      // Pre-select default styles
      const defaultIds = new Set(
        selectedMilestone.defaultStyleIds.filter(id =>
          styles.some(s => s.id === id)
        )
      )
      setSelectedStyleIds(defaultIds)
    } catch (err) {
      console.error('加载风格失败:', err)
      setError('加载风格失败,请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStyle = (styleId: string) => {
    setSelectedStyleIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(styleId)) {
        newSet.delete(styleId)
      } else {
        newSet.add(styleId)
      }
      return newSet
    })
  }

  const handleStartGeneration = async () => {
    if (!selectedMilestone || selectedStyleIds.size === 0) return

    try {
      setIsLoading(true)
      setGenerationMode('manual')

      // Create task with manually selected styles
      const task = await createTask({
        milestoneId: selectedMilestone.id,
        milestoneName: selectedMilestone.name,
        photoIds: uploadedPhotos.map(p => p.filePath),
        mode: 'manual',
        styleIds: Array.from(selectedStyleIds)
      })

      // Save task to store
      setCurrentTask(task)

      console.log('[StylePage] Manual generation task created:', task.id)

      // Navigate to progress page
      router.push('/generation/progress')
    } catch (err) {
      console.error('创建任务失败:', err)
      setError('创建任务失败,请重试')
      setIsLoading(false)
    }
  }

  if (!selectedMilestone) {
    return null
  }

  const selectedCount = selectedStyleIds.size
  const canProceed = selectedCount > 0 && selectedCount <= 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <span>已上传 {uploadedPhotos.length} 张照片</span>
            <span>•</span>
            <span className="flex items-center">
              <span className="text-2xl mr-1">{selectedMilestone.icon}</span>
              {selectedMilestone.name}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">选择生成风格</h1>
          <p className="text-gray-600">
            从 {compatibleStyles.length} 种兼容风格中选择 1-10 种,每种风格生成 4 张图片
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
            {error}
          </div>
        )}

        {/* Style Collection Tabs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>风格分类</CardTitle>
            <CardDescription>选择不同的风格类型浏览</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCollection} onValueChange={(value) => setSelectedCollection(value as StyleCollectionType)}>
              <TabsList className="grid w-full grid-cols-4 gap-2">
                {styleCollections.map(collection => (
                  <TabsTrigger
                    key={collection.id}
                    value={collection.id}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-lg">{collection.icon}</span>
                    <span className="hidden sm:inline">{collection.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <p className="text-sm text-muted-foreground mt-4">
              {styleCollections.find(c => c.id === selectedCollection)?.description}
            </p>
          </CardContent>
        </Card>

        {/* Style selection info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>已选择 {selectedCount} 种风格</CardTitle>
            <CardDescription>
              {selectedCount > 0 ? (
                <>将生成 {selectedCount * 4} 张图片</>
              ) : (
                '请至少选择 1 种风格'
              )}
            </CardDescription>
          </CardHeader>
          {selectedCount > 0 && (
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedStyleIds).map(styleId => {
                  const style = compatibleStyles.find(s => s.id === styleId)
                  return style ? (
                    <Badge key={styleId} variant="default">
                      {style.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Style grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">加载风格...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {compatibleStyles.map(style => (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedStyleIds.has(style.id)
                    ? 'ring-2 ring-primary shadow-lg'
                    : ''
                }`}
                onClick={() => handleToggleStyle(style.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{style.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {style.description}
                      </CardDescription>
                    </div>
                    <Checkbox
                      checked={selectedStyleIds.has(style.id)}
                      onCheckedChange={() => handleToggleStyle(style.id)}
                      className="mt-1"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Style preview image */}
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                    {style.exampleImage ? (
                      <img
                        src={style.exampleImage}
                        alt={`${style.name} 预览`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 图片加载失败时显示占位符
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = `
                              <div class="flex items-center justify-center h-full">
                                <span class="text-muted-foreground text-sm">${style.name} 预览</span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground text-sm">
                          {style.name} 预览
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {style.tags?.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Default badge */}
                  {selectedMilestone.defaultStyleIds.includes(style.id) && (
                    <Badge variant="secondary" className="mt-2">
                      <Sparkles className="h-3 w-3 mr-1" />
                      推荐
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push('/generation/milestone')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            返回里程碑选择
          </Button>

          <div className="flex items-center space-x-4">
            {selectedCount > 10 && (
              <p className="text-sm text-destructive">
                最多选择 10 种风格
              </p>
            )}
            <Button
              size="lg"
              disabled={!canProceed || isLoading}
              onClick={handleStartGeneration}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  创建任务中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  开始生成 ({selectedCount * 4} 张图片)
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
