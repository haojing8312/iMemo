'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorDialog } from '@/components/ErrorDialog'
import { useAppStore } from '@/lib/store'
import { getTaskById, updateTaskStatus, updateTaskProgress, addTaskResult } from '@/lib/taskService'
import { getStylesByIds } from '@/lib/styleService'
import { generateMultiStyle } from '@/lib/multiStyleGenerator'
import { Loader2 } from 'lucide-react'
import { MultiStyleProgress } from '@/components/MultiStyleProgress'

export default function ProgressPage() {
  const router = useRouter()
  const { currentTask, updateProgress: updateStoreProgress } = useAppStore()

  const [error, setError] = useState<string>()
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (!currentTask) {
      router.push('/upload')
      return
    }

    // 防止重复调用 - 只在未开始时执行
    if (!hasStarted && !isGenerating) {
      setHasStarted(true)
      startGeneration()
    }
  }, [currentTask?.id, hasStarted, isGenerating])

  const startGeneration = async () => {
    if (!currentTask || isGenerating) return

    setIsGenerating(true)

    try {
      // Update task status to processing
      await updateTaskStatus(currentTask.id, 'processing')

      // Get styles for this task
      const styles = await getStylesByIds(currentTask.selectedStyleIds)

      if (styles.length === 0) {
        throw new Error('未找到可用的风格')
      }

      // Get first uploaded photo path
      // TODO: For now using first photo, later support multiple photos
      const photoPath = currentTask.uploadedPhotoIds[0] || ''

      console.log(`[ProgressPage] Starting multi-style generation`)
      console.log(`  - Task ID: ${currentTask.id}`)
      console.log(`  - Milestone: ${currentTask.milestoneName}`)
      console.log(`  - Styles: ${styles.length}`)
      console.log(`  - Photo: ${photoPath}`)

      // Execute multi-style generation
      const result = await generateMultiStyle({
        photoPath,
        styles,
        milestoneName: currentTask.milestoneName,
        imagesPerStyle: 4,

        // Progress callback
        onProgress: (current, total) => {
          const percent = (current / total) * 100
          updateStoreProgress({
            completedImages: current,
            totalImages: total
          })
          console.log(`[ProgressPage] Progress: ${current}/${total} (${percent.toFixed(1)}%)`)
        },

        // Style complete callback
        onStyleComplete: async (styleId, styleName, results) => {
          console.log(`[ProgressPage] Style completed: ${styleName} (${results.length} images)`)

          // Save each result to task
          for (const result of results) {
            await addTaskResult(currentTask.id, result)
          }

          // Update progress
          const newCompletedStyles = (currentTask.progress?.completedStyles || 0) + 1
          await updateTaskProgress(currentTask.id, {
            completedStyles: newCompletedStyles
          })
          updateStoreProgress({
            completedStyles: newCompletedStyles
          })
        },

        // Style failed callback
        onStyleFailed: async (styleId, styleName, error) => {
          console.error(`[ProgressPage] Style failed: ${styleName}`, error)

          // Track failed style
          const failedStyles = [...(currentTask.progress?.failedStyles || []), styleId]
          await updateTaskProgress(currentTask.id, {
            failedStyles
          })
          updateStoreProgress({
            failedStyles
          })
        }
      })

      // Determine final status
      let finalStatus: 'completed' | 'partial-success' | 'failed'
      if (result.completedStyles === result.totalStyles) {
        finalStatus = 'completed'
      } else if (result.completedStyles > 0) {
        finalStatus = 'partial-success'
      } else {
        finalStatus = 'failed'
      }

      await updateTaskStatus(currentTask.id, finalStatus)

      console.log(`[ProgressPage] Generation finished with status: ${finalStatus}`)
      console.log(`  - Completed styles: ${result.completedStyles}/${result.totalStyles}`)
      console.log(`  - Total images: ${result.results.length}`)

      // Navigate to results after 1 second
      setTimeout(() => {
        router.push('/generation/result')
      }, 1000)

    } catch (err: any) {
      console.error('[ProgressPage] Generation failed:', err)
      setError(err.message || '生成失败,请重试')
      if (currentTask) {
        await updateTaskStatus(currentTask.id, 'failed')
      }
      setIsGenerating(false)
    }
  }

  const handleRetry = () => {
    setError(undefined)
    setIsGenerating(false)
    setHasStarted(false) // 重置开始状态,允许重新生成
  }

  const handleCancel = () => {
    router.push('/upload')
  }

  if (!currentTask) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>AI 生成中</span>
          </CardTitle>
          <CardDescription>
            正在为您生成 {currentTask.milestoneName} 纪念照片...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multi-style progress component */}
          <MultiStyleProgress task={currentTask} />

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>温馨提示:</strong> 正在生成多种风格的照片,每种风格生成 4 张图片。
              生成过程可能需要几分钟,请耐心等待。完成后将自动跳转到结果页面。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 错误对话框 */}
      {error && (
        <ErrorDialog
          error={error}
          onRetry={handleRetry}
          onClose={handleCancel}
        />
      )}
    </div>
  )
}
