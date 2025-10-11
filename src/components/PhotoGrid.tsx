// 照片网格组件
// 可复用的照片网格布局

'use client'

import type { PhotoUpload } from '@/lib/types'
import { PhotoCard } from './PhotoCard'

interface PhotoGridProps {
  photos: PhotoUpload[]
  selectedPhotoIds?: Set<string>
  showCheckbox?: boolean
  showActions?: boolean
  maxSelection?: number
  onPhotoSelect?: (photoId: string) => void
  onPhotoDelete?: (photoId: string) => void
  onPhotoClick?: (photo: PhotoUpload) => void
  emptyMessage?: string
}

export function PhotoGrid({
  photos,
  selectedPhotoIds = new Set(),
  showCheckbox = false,
  showActions = false,
  maxSelection,
  onPhotoSelect,
  onPhotoDelete,
  onPhotoClick,
  emptyMessage = '暂无照片',
}: PhotoGridProps) {
  // 判断是否可以选择更多照片(如果设置了maxSelection)
  const canSelectMore = maxSelection === undefined || selectedPhotoIds.size < maxSelection

  const handlePhotoSelect = (photoId: string) => {
    // 如果已选中，可以取消选中
    // 如果未选中，检查是否达到上限
    if (selectedPhotoIds.has(photoId) || canSelectMore) {
      onPhotoSelect?.(photoId)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-neutral-500 text-body-lg mb-2">{emptyMessage}</p>
        <p className="text-neutral-400 text-body-sm">
          点击上方按钮添加照片
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => {
        const isSelected = selectedPhotoIds.has(photo.id)
        const isDisabled = !isSelected && !canSelectMore

        return (
          <div
            key={photo.id}
            className={`${isDisabled && showCheckbox ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <PhotoCard
              photo={photo}
              isSelected={isSelected}
              showCheckbox={showCheckbox}
              showActions={showActions}
              onSelect={() => handlePhotoSelect(photo.id)}
              onDelete={() => onPhotoDelete?.(photo.id)}
              onClick={() => onPhotoClick?.(photo)}
            />
          </div>
        )
      })}
    </div>
  )
}
