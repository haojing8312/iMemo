'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { open } from '@tauri-apps/plugin-dialog'
import { Plus, Sparkles, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PhotoGrid } from '@/components/PhotoGrid'
import { PhotoViewer } from '@/components/PhotoViewer'
import { usePhotoLibrary, useFilteredPhotos, useLibraryStats, useAvailableAIStyles } from '@/lib/photoLibraryStore'
import { getImageMetadata, getFileSize } from '@/lib/imageUtils'
import { PhotoValidator } from '@/lib/validators'
import type { PhotoUpload, PhotoTypeFilter } from '@/lib/types'

export default function LibraryPage() {
  const router = useRouter()
  const {
    persons,
    currentPersonFilter,
    currentTypeFilter,
    currentStyleFilter,
    selectedPhotoIds,
    addPhotosToLibrary,
    deletePhotoFromLibrary,
    deletePhotosFromLibrary,
    loadLibraryPhotos,
    loadPersons,
    setPersonFilter,
    setTypeFilter,
    setStyleFilter,
    clearSelection,
    togglePhotoSelection,
  } = usePhotoLibrary()

  const filteredPhotos = useFilteredPhotos()
  const stats = useLibraryStats()
  const availableStyles = useAvailableAIStyles()

  const [isUploading, setIsUploading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  // 加载数据
  useEffect(() => {
    loadLibraryPhotos()
    loadPersons()
  }, [])

  // 添加照片
  const handleAddPhotos = async () => {
    try {
      setIsUploading(true)

      const selected = await open({
        multiple: true,
        filters: [{
          name: '图片',
          extensions: ['jpg', 'jpeg', 'png']
        }]
      })

      if (!selected || (Array.isArray(selected) && selected.length === 0)) {
        setIsUploading(false)
        return
      }

      const filePaths = Array.isArray(selected) ? selected : [selected]
      const newPhotos: PhotoUpload[] = []

      // 动态导入 Tauri API
      const { invoke } = await import('@tauri-apps/api/core')
      const { dirname } = await import('@tauri-apps/api/path')
      const { copyPhotoToDataDir } = await import('@/lib/fileUtils')

      for (const filePath of filePaths) {
        try {
          console.log(`[LibraryPage] 处理照片: ${filePath}`)

          // 1. 扩展 Tauri 文件系统权限 (读取原始文件需要)
          const parentDir = await dirname(filePath)
          await invoke('expand_scope', { folderPath: parentDir })
          console.log(`[LibraryPage] 已扩展权限: ${parentDir}`)

          // 2. 复制照片到应用数据目录
          const copiedPath = await copyPhotoToDataDir(filePath)
          console.log(`[LibraryPage] 照片已复制: ${copiedPath}`)

          // 3. 读取文件信息 (使用复制后的路径)
          const [metadata, fileSize] = await Promise.all([
            getImageMetadata(copiedPath),
            getFileSize(copiedPath)
          ])

          const photo: PhotoUpload = {
            id: crypto.randomUUID(),
            filePath: copiedPath,  // 使用复制后的路径
            originalName: filePath.split(/[/\\]/).pop() || 'unknown.jpg',
            width: metadata.width,
            height: metadata.height,
            fileSize,
            format: PhotoValidator.getFormatFromFilename(filePath) || 'JPG',
            uploadedAt: Date.now(),
            isCropped: false,
            isInLibrary: true,
          }

          // 基础验证
          const validation = PhotoValidator.validate(photo)
          if (validation.isValid) {
            newPhotos.push(photo)
          } else {
            console.warn(`照片验证失败: ${photo.originalName}`, validation.error)
          }
        } catch (error) {
          console.error(`处理照片失败: ${filePath}`, error)
          // 继续处理下一张照片
        }
      }

      if (newPhotos.length > 0) {
        await addPhotosToLibrary(newPhotos)
        console.log(`[LibraryPage] 成功添加 ${newPhotos.length} 张照片到照片库`)
      }

      setIsUploading(false)
    } catch (error) {
      console.error('添加照片失败:', error)
      alert('添加照片失败,请重试')
      setIsUploading(false)
    }
  }

  // 删除照片
  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('确定要删除这张照片吗？')) {
      await deletePhotoFromLibrary(photoId)
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedPhotoIds.size === 0) return

    // 先获取选中的照片ID数组和数量,避免在确认对话框显示时状态被修改
    const idsToDelete = Array.from(selectedPhotoIds)
    const count = idsToDelete.length

    if (confirm(`确定要删除选中的 ${count} 张照片吗？`)) {
      // 使用批量删除函数,一次性删除所有照片,避免逐个删除时UI闪烁
      await deletePhotosFromLibrary(idsToDelete)
    }
  }

  // 打开照片查看器
  const handlePhotoClick = (photo: PhotoUpload) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id)
    if (index !== -1) {
      setViewerIndex(index)
      setViewerOpen(true)
    }
  }

  // 生成艺术照（跳转到选择页）
  const handleGenerateArt = () => {
    clearSelection()
    router.push('/generation/select-photo')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-md font-bold text-neutral-800 mb-2">照片库</h1>
            <p className="text-body-lg text-neutral-600">
              共 {stats.totalPhotos} 张照片
              {stats.totalPersons > 0 && ` • ${stats.totalPersons} 位家庭成员`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={handleAddPhotos}
              disabled={isUploading}
              className="border-primary-300 hover:bg-primary-50"
            >
              <Plus className="h-5 w-5 mr-2" />
              {isUploading ? '上传中...' : '添加照片'}
            </Button>
            <Button
              size="lg"
              onClick={handleGenerateArt}
              className="gradient-ai text-white shadow-ai"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              生成 AI 艺术照
            </Button>
          </div>
        </div>

        {/* 筛选和操作栏 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* 筛选 */}
              <div className="flex items-center gap-4 flex-wrap">
                <Filter className="h-4 w-4 text-neutral-500 flex-shrink-0" />

                {/* 照片类型筛选 */}
                <select
                  value={currentTypeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as PhotoTypeFilter)}
                  className="w-[160px] h-10 px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="all">全部照片</option>
                  <option value="original">原始照片</option>
                  <option value="ai">AI 艺术照</option>
                </select>

                {/* 人物筛选 */}
                {persons.length > 0 && (
                  <select
                    value={currentPersonFilter || 'all'}
                    onChange={(e) => setPersonFilter(e.target.value === 'all' ? undefined : e.target.value)}
                    className="w-[160px] h-10 px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">所有人物</option>
                    {persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.photoCount || 0})
                      </option>
                    ))}
                  </select>
                )}

                {/* 风格筛选（仅 AI 照片） */}
                {currentTypeFilter === 'ai' && availableStyles.length > 0 && (
                  <select
                    value={currentStyleFilter || 'all'}
                    onChange={(e) => setStyleFilter(e.target.value === 'all' ? undefined : e.target.value)}
                    className="w-[160px] h-10 px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value="all">所有风格</option>
                    {availableStyles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* 当前筛选标签 */}
                <div className="flex items-center gap-2">
                  {currentPersonFilter && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                      <span>
                        {persons.find(p => p.id === currentPersonFilter)?.name}
                      </span>
                      <button onClick={() => setPersonFilter(undefined)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {currentStyleFilter && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                      <Sparkles className="h-3 w-3" />
                      <span>
                        {availableStyles.find(s => s.id === currentStyleFilter)?.name}
                      </span>
                      <button onClick={() => setStyleFilter(undefined)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 批量操作 */}
              {selectedPhotoIds.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-body text-neutral-600">
                    已选择 {selectedPhotoIds.size} 张
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearSelection()}
                  >
                    取消选择
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBatchDelete}
                  >
                    批量删除
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 照片网格 */}
        <PhotoGrid
          photos={filteredPhotos}
          selectedPhotoIds={selectedPhotoIds}
          showCheckbox={true}
          showActions={false}
          onPhotoSelect={togglePhotoSelection}
          onPhotoDelete={handleDeletePhoto}
          onPhotoClick={handlePhotoClick}
          emptyMessage={
            currentPersonFilter
              ? '该人物暂无照片'
              : '照片库为空，点击"添加照片"开始使用'
          }
        />

        {/* 照片查看器 */}
        <PhotoViewer
          photos={filteredPhotos}
          initialIndex={viewerIndex}
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          onDelete={handleDeletePhoto}
        />
      </div>
    </div>
  )
}
