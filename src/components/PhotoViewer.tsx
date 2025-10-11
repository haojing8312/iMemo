// 照片查看器组件
// 大图查看模式，支持左右滑动

'use client'

import { useState, useEffect } from 'react'
import { convertFileSrc } from '@tauri-apps/api/core'
import { X, ChevronLeft, ChevronRight, Trash2, User, Palette, Calendar, Image } from 'lucide-react'
import type { PhotoUpload } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { AIBadge } from '@/components/AIBadge'

interface PhotoViewerProps {
  photos: PhotoUpload[]
  initialIndex: number
  open: boolean
  onClose: () => void
  onDelete?: (photoId: string) => void
}

export function PhotoViewer({
  photos,
  initialIndex,
  open,
  onClose,
  onDelete,
}: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // 当 initialIndex 改变时更新 currentIndex
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // 键盘导航
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, currentIndex])

  const currentPhoto = photos[currentIndex]
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleDelete = () => {
    if (onDelete && currentPhoto) {
      onDelete(currentPhoto.id)
      // 如果是最后一张，关闭查看器
      if (photos.length === 1) {
        onClose()
      } else if (currentIndex >= photos.length - 1) {
        // 如果删除的是最后一张，跳转到前一张
        setCurrentIndex(Math.max(0, currentIndex - 1))
      }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }

  if (!open || !photos || photos.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* 主容器 */}
      <div className="relative w-full h-full max-w-7xl mx-auto">
        {/* 顶部工具栏 */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-heading-sm font-semibold">
              {currentIndex + 1} / {photos.length}
            </h2>
            <div className="flex items-center gap-2">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-destructive hover:bg-white/20"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 主图区域 */}
        <div className="relative flex items-center justify-center h-full bg-black">
          {/* 左右导航按钮 */}
          {hasPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* 照片 */}
          <img
            src={convertFileSrc(currentPhoto.filePath)}
            alt={currentPhoto.originalName || '照片'}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* 底部信息栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
          <div className="space-y-3">
            {/* 标题行 */}
            <div className="flex items-center gap-3">
              {currentPhoto.isAIGenerated && <AIBadge size="md" />}
              <p className="text-heading-sm font-semibold">
                {currentPhoto.originalName}
              </p>
            </div>

            {/* AI 元数据（如果是 AI 照片） */}
            {currentPhoto.isAIGenerated && currentPhoto.aiMetadata && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-wide font-medium">AI 生成信息</p>
                <div className="grid grid-cols-2 gap-3 text-body-sm">
                  {/* 风格 */}
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-300" />
                    <div>
                      <p className="text-white/60 text-xs">风格</p>
                      <p className="text-white font-medium">{currentPhoto.aiMetadata.styleName}</p>
                    </div>
                  </div>

                  {/* 场景/里程碑 */}
                  {currentPhoto.aiMetadata.milestoneName && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-300" />
                      <div>
                        <p className="text-white/60 text-xs">场景</p>
                        <p className="text-white font-medium">{currentPhoto.aiMetadata.milestoneName}</p>
                      </div>
                    </div>
                  )}

                  {/* 序号 */}
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-green-300" />
                    <div>
                      <p className="text-white/60 text-xs">序号</p>
                      <p className="text-white font-medium">第 {currentPhoto.aiMetadata.sequenceNumber} 张</p>
                    </div>
                  </div>

                  {/* 生成时间 */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-300" />
                    <div>
                      <p className="text-white/60 text-xs">生成时间</p>
                      <p className="text-white font-medium">{formatDate(currentPhoto.aiMetadata.generatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 基本信息 */}
            <div className="flex flex-wrap items-center gap-4 text-body-sm text-white/80">
              {/* 人物信息 */}
              {currentPhoto.personName && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{currentPhoto.personName}</span>
                </div>
              )}

              {/* 尺寸 */}
              <span>
                {currentPhoto.width} × {currentPhoto.height}
              </span>

              {/* 大小 */}
              <span>{formatFileSize(currentPhoto.fileSize)}</span>

              {/* 上传/生成时间 */}
              {!currentPhoto.isAIGenerated && (
                <span>{formatDate(currentPhoto.uploadedAt)}</span>
              )}
            </div>

            {/* 标签 */}
            {currentPhoto.tags && currentPhoto.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentPhoto.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
