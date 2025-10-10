// 照片卡片组件
// 用于照片库和照片选择页面

'use client'

import { useState } from 'react'
import { convertFileSrc } from '@tauri-apps/api/core'
import { Check, Trash2, User, Calendar } from 'lucide-react'
import type { PhotoUpload } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PhotoCardProps {
  photo: PhotoUpload
  isSelected?: boolean
  showCheckbox?: boolean
  showActions?: boolean
  onSelect?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export function PhotoCard({
  photo,
  isSelected = false,
  showCheckbox = false,
  showActions = false,
  onSelect,
  onDelete,
  onClick,
}: PhotoCardProps) {
  const [imageError, setImageError] = useState(false)

  // 格式化时间显示
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
    return date.toLocaleDateString('zh-CN')
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  const handleCardClick = () => {
    if (showCheckbox && onSelect) {
      onSelect()
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
      } ${showCheckbox ? 'hover:ring-2 hover:ring-primary-300' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* 复选框 */}
        {showCheckbox && (
          <div
            className={`absolute top-2 left-2 z-10 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white border-neutral-300 hover:border-primary-400'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.()
            }}
          >
            {isSelected && <Check className="h-4 w-4 text-white" />}
          </div>
        )}

        {/* 删除按钮 */}
        {showActions && onDelete && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 照片缩略图 */}
        <div className="aspect-square bg-neutral-100 overflow-hidden">
          {!imageError ? (
            <img
              src={convertFileSrc(photo.filePath)}
              alt={photo.originalName || '照片'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-neutral-400 text-sm">加载失败</p>
            </div>
          )}
        </div>

        {/* 照片信息 */}
        <div className="p-3 space-y-2">
          {/* 文件名 */}
          <p className="text-xs font-medium text-neutral-800 truncate" title={photo.originalName}>
            {photo.originalName}
          </p>

          {/* 人物信息 */}
          {photo.personName && (
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <User className="h-3 w-3" />
              <span>{photo.personName}</span>
            </div>
          )}

          {/* 上传时间 */}
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(photo.uploadedAt)}</span>
          </div>

          {/* 照片尺寸和大小 */}
          {photo.width > 0 && (
            <p className="text-xs text-neutral-500">
              {photo.width} × {photo.height} • {formatFileSize(photo.fileSize)}
            </p>
          )}

          {/* 标签 */}
          {photo.tags && photo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {photo.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {photo.tags.length > 2 && (
                <span className="inline-block px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded">
                  +{photo.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
