'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/lib/store'
import { getAllCategories } from '@/lib/milestoneService'
import { createTask } from '@/lib/taskService'
import type { MilestoneCategory, Milestone } from '@/lib/types/milestone'
import { Sparkles, Settings2, ChevronRight } from 'lucide-react'

export default function MilestonePage() {
  const router = useRouter()
  const {
    uploadedPhotos,
    setSelectedMilestone,
    setGenerationMode,
    setCurrentTask
  } = useAppStore()

  const [categories, setCategories] = useState<MilestoneCategory[]>([])
  const [selectedMilestone, setLocalSelectedMilestone] = useState<Milestone | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 如果没有上传照片,返回照片选择页面
    if (!uploadedPhotos || uploadedPhotos.length === 0) {
      router.push('/generation/select-photo')
      return
    }

    // 加载里程碑配置
    loadMilestones()
  }, [])

  const loadMilestones = async () => {
    try {
      const data = await getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('加载里程碑失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectMilestone = (milestone: Milestone) => {
    setLocalSelectedMilestone(milestone)
  }

  // 一键生成 (自动模式)
  const handleAutoGenerate = async () => {
    if (!selectedMilestone) return

    try {
      setIsLoading(true)

      // 保存里程碑和生成模式到 store
      setSelectedMilestone(selectedMilestone)
      setGenerationMode('auto')

      // 创建任务
      const task = await createTask({
        milestoneId: selectedMilestone.id,
        milestoneName: selectedMilestone.name,
        photoIds: uploadedPhotos.map(p => p.filePath),
        mode: 'auto'
      })

      // 保存任务到 store
      setCurrentTask(task)

      console.log('[MilestonePage] Auto-generate task created:', task.id)

      // 跳转到进度页面
      router.push('/generation/progress')
    } catch (error) {
      console.error('创建任务失败:', error)
      alert('创建任务失败,请重试')
      setIsLoading(false)
    }
  }

  // 手动选择风格
  const handleManualSelect = () => {
    if (!selectedMilestone) return

    // 保存里程碑和生成模式到 store
    setSelectedMilestone(selectedMilestone)
    setGenerationMode('manual')

    // 跳转到风格选择页面
    router.push('/generation/style')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">选择场景主题</h1>
          <p className="text-gray-600">
            已选择 {uploadedPhotos.length} 张照片 • 步骤 2/3
          </p>
        </div>

        {/* Category tabs */}
        <Tabs defaultValue={categories[0]?.id} className="mb-8">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.milestones
                  .filter(m => m.active)
                  .map(milestone => (
                    <Card
                      key={milestone.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedMilestone?.id === milestone.id
                          ? 'ring-2 ring-primary shadow-lg'
                          : ''
                      }`}
                      onClick={() => handleSelectMilestone(milestone)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{milestone.icon}</span>
                            <CardTitle className="text-lg">{milestone.name}</CardTitle>
                          </div>
                          {selectedMilestone?.id === milestone.id && (
                            <Badge variant="default">已选择</Badge>
                          )}
                        </div>
                        <CardDescription>{milestone.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>• 推荐照片数: {milestone.minPhotos}-{milestone.maxPhotos} 张</p>
                          <p>• 默认风格数: {milestone.defaultStyleIds.length} 种</p>
                          <p>• 兼容风格数: {milestone.compatibleStyleIds.length} 种</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action buttons */}
        {selectedMilestone && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{selectedMilestone.icon}</span>
                <span>已选择: {selectedMilestone.name}</span>
              </CardTitle>
              <CardDescription>
                选择生成方式:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto-generate button */}
              <Button
                size="lg"
                className="w-full justify-between"
                onClick={handleAutoGenerate}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">一键生成 (推荐)</div>
                    <div className="text-xs font-normal opacity-90">
                      自动使用 {selectedMilestone.defaultStyleIds.length} 种精选风格，生成 {selectedMilestone.defaultStyleIds.length * 4} 张图片
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Manual select button */}
              <Button
                size="lg"
                variant="outline"
                className="w-full justify-between"
                onClick={handleManualSelect}
              >
                <div className="flex items-center space-x-2">
                  <Settings2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">手动选择风格</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      从 {selectedMilestone.compatibleStyleIds.length} 种兼容风格中自行选择
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bottom navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={() => router.push('/generation/select-photo')}>
            返回上一步
          </Button>
          {!selectedMilestone && (
            <p className="text-sm text-muted-foreground">请先选择一个场景主题</p>
          )}
        </div>
      </div>
    </div>
  )
}
