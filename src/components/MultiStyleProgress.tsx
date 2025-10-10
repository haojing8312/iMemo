'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { GenerationTask } from '@/lib/types/task'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getStylesByIds } from '@/lib/styleService'
import type { Style } from '@/lib/types/style'

interface MultiStyleProgressProps {
  task: GenerationTask
}

export function MultiStyleProgress({ task }: MultiStyleProgressProps) {
  const [styles, setStyles] = useState<Style[]>([])

  useEffect(() => {
    // Load style details
    getStylesByIds(task.selectedStyleIds).then(setStyles)
  }, [task.selectedStyleIds])

  const { progress } = task
  const totalImages = progress?.totalImages || 0
  const completedImages = progress?.completedImages || 0
  const totalStyles = progress?.totalStyles || 0
  const completedStyles = progress?.completedStyles || 0
  const failedStyles = progress?.failedStyles || []

  const overallPercent = totalImages > 0 ? (completedImages / totalImages) * 100 : 0

  // Get status for each style
  const getStyleStatus = (styleId: string, index: number) => {
    if (failedStyles.includes(styleId)) {
      return 'failed'
    }
    if (index < completedStyles) {
      return 'completed'
    }
    if (index === completedStyles) {
      return 'processing'
    }
    return 'pending'
  }

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">总体进度</span>
          <span className="font-semibold">{Math.round(overallPercent)}%</span>
        </div>
        <Progress value={overallPercent} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>已完成 {completedImages} / {totalImages} 张图片</span>
          <span>{completedStyles} / {totalStyles} 种风格</span>
        </div>
      </div>

      {/* Per-style progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">风格生成进度</h3>
        <div className="space-y-2">
          {task.selectedStyleIds.map((styleId, index) => {
            const style = styles.find(s => s.id === styleId)
            const status = getStyleStatus(styleId, index)

            return (
              <div
                key={styleId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center space-x-3">
                  {/* Status icon */}
                  {status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {status === 'processing' && (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  {status === 'failed' && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {status === 'pending' && (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}

                  {/* Style name */}
                  <span className="text-sm font-medium">
                    {style?.name || styleId}
                  </span>
                </div>

                {/* Status badge */}
                <Badge
                  variant={
                    status === 'completed'
                      ? 'default'
                      : status === 'processing'
                      ? 'secondary'
                      : status === 'failed'
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {status === 'completed' && '已完成'}
                  {status === 'processing' && '生成中...'}
                  {status === 'failed' && '生成失败'}
                  {status === 'pending' && '等待中'}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>

      {/* Failed styles warning */}
      {failedStyles.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            ⚠️ <strong>部分风格生成失败</strong>
            <br />
            {failedStyles.length} 种风格生成失败,但其他风格仍会继续生成。
            您可以稍后在结果页面查看成功生成的图片。
          </p>
        </div>
      )}
    </div>
  )
}
