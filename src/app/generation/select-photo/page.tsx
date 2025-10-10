'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { open } from '@tauri-apps/plugin-dialog'
import { Upload, ChevronRight, Info, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhotoGrid } from '@/components/PhotoGrid'
import { useAppStore } from '@/lib/store'
import { usePhotoLibrary, useFilteredPhotos } from '@/lib/photoLibraryStore'
import { getImageMetadata, getFileSize, checkImageQuality, detectFaces } from '@/lib/imageUtils'
import { PhotoValidator } from '@/lib/validators'
import type { PhotoUpload } from '@/lib/types'

interface PhotoWithValidation extends PhotoUpload {
  validationStatus: 'pending' | 'validating' | 'valid' | 'invalid'
  validationError?: string
}

export default function SelectPhotoPage() {
  const router = useRouter()
  const { setUploadedPhotos } = useAppStore()

  // 照片库状态
  const {
    persons,
    currentPersonFilter,
    selectedPhotoIds,
    loadLibraryPhotos,
    loadPersons,
    setPersonFilter,
    togglePhotoSelection,
    clearSelection,
    setSelectedPhotoIds,
  } = usePhotoLibrary()

  const filteredPhotos = useFilteredPhotos()

  // 本地状态
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [tempPhotos, setTempPhotos] = useState<PhotoWithValidation[]>([])
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set())

  // 加载照片库数据
  useEffect(() => {
    loadLibraryPhotos()
    loadPersons()
  }, [])

  // 临时上传照片
  const handleTempUpload = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{
          name: '图片',
          extensions: ['jpg', 'jpeg', 'png']
        }]
      })

      if (!selected || (Array.isArray(selected) && selected.length === 0)) {
        return
      }

      const filePaths = Array.isArray(selected) ? selected : [selected]
      const remaining = 5 - tempPhotos.length
      const pathsToAdd = filePaths.slice(0, remaining)

      for (const path of pathsToAdd) {
        await processTempPhoto(path)
      }
    } catch (error) {
      console.error('选择照片失败:', error)
    }
  }

  // 处理单张临时照片
  const processTempPhoto = async (filePath: string) => {
    const tempId = crypto.randomUUID()

    const tempPhoto: PhotoWithValidation = {
      id: tempId,
      filePath,
      originalName: filePath.split(/[/\\]/).pop() || 'unknown.jpg',
      width: 0,
      height: 0,
      fileSize: 0,
      format: 'JPG',
      uploadedAt: Date.now(),
      isCropped: false,
      isInLibrary: false,
      validationStatus: 'validating'
    }

    setTempPhotos(prev => [...prev, tempPhoto])

    try {
      // 读取文件信息
      const [metadata, fileSize] = await Promise.all([
        getImageMetadata(filePath),
        getFileSize(filePath)
      ])

      const photo: Partial<PhotoUpload> = {
        filePath,
        originalName: filePath.split(/[/\\]/).pop() || 'unknown.jpg',
        width: metadata.width,
        height: metadata.height,
        fileSize,
        format: PhotoValidator.getFormatFromFilename(filePath) || 'JPG',
        uploadedAt: Date.now(),
        isCropped: false,
        isInLibrary: false,
      }

      // 基础验证
      const basicValidation = PhotoValidator.validate(photo)
      if (!basicValidation.isValid) {
        setTempPhotos(prev => prev.map(p =>
          p.id === tempId
            ? { ...p, validationStatus: 'invalid' as const, validationError: basicValidation.error }
            : p
        ))
        return
      }

      // 质量检测
      const qualityCheck = await checkImageQuality(filePath)
      if (!qualityCheck.isValid) {
        setTempPhotos(prev => prev.map(p =>
          p.id === tempId
            ? { ...p, validationStatus: 'invalid' as const, validationError: qualityCheck.error }
            : p
        ))
        return
      }

      // 人脸检测
      const faceDetection = await detectFaces(filePath)
      if (!faceDetection.isValid) {
        setTempPhotos(prev => prev.map(p =>
          p.id === tempId
            ? { ...p, validationStatus: 'invalid' as const, validationError: faceDetection.error }
            : p
        ))
        return
      }

      // 更新为有效状态
      setTempPhotos(prev => prev.map(p =>
        p.id === tempId
          ? { ...photo, id: tempId, validationStatus: 'valid' as const } as PhotoWithValidation
          : p
      ))
    } catch (error) {
      console.error('处理照片失败:', error)
      setTempPhotos(prev => prev.map(p =>
        p.id === tempId
          ? { ...p, validationStatus: 'invalid' as const, validationError: '处理失败,请重试' }
          : p
      ))
    }
  }

  // 删除临时照片
  const handleRemoveTempPhoto = (photoId: string) => {
    setTempPhotos(prev => prev.filter(p => p.id !== photoId))
    setTempSelectedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(photoId)
      return newSet
    })
  }

  // 切换临时照片选择
  const toggleTempSelection = (photoId: string) => {
    setTempSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else if (newSet.size < 5) {
        newSet.add(photoId)
      }
      return newSet
    })
  }

  // 下一步：选择里程碑
  const handleProceed = () => {
    let selectedPhotos: PhotoUpload[] = []

    if (activeTab === 'library') {
      // 从照片库选择
      selectedPhotos = filteredPhotos.filter(p => selectedPhotoIds.has(p.id))
    } else {
      // 临时上传
      selectedPhotos = tempPhotos
        .filter(p => tempSelectedIds.has(p.id) && p.validationStatus === 'valid')
        .map(p => ({ ...p, isInLibrary: false }))
    }

    if (selectedPhotos.length === 0) {
      alert('请至少选择 1 张照片')
      return
    }

    setUploadedPhotos(selectedPhotos)
    router.push('/generation/milestone')
  }

  // 计算选中数量
  const selectedCount = activeTab === 'library'
    ? selectedPhotoIds.size
    : tempSelectedIds.size

  const canProceed = selectedCount >= 1 && selectedCount <= 5

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 顶部标题 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/library')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回照片库
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display-md font-bold text-neutral-800 mb-2">
                选择照片
              </h1>
              <p className="text-body-lg text-neutral-600">
                生成 AI 艺术照 · 步骤 1/3
              </p>
            </div>
            <Badge variant="outline" className="text-heading-xs px-4 py-2">
              已选择 {selectedCount}/5 张
            </Badge>
          </div>
        </div>

        {/* 提示卡片 */}
        <Card className="mb-6 border-primary-200 bg-primary-50/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div className="text-body text-neutral-700">
              <p className="font-medium mb-1">照片选择建议</p>
              <p>选择光线充足、面部清晰的照片可获得最佳效果。支持选择 1-5 张照片进行生成。</p>
            </div>
          </CardContent>
        </Card>

        {/* 选择方式标签页 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'library' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="library" className="text-heading-xs">
              从照片库选择（推荐）
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-heading-xs">
              临时上传新照片
            </TabsTrigger>
          </TabsList>

          {/* 从照片库选择 */}
          <TabsContent value="library" className="space-y-6">
            {/* 人物筛选 */}
            {persons.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <label className="text-body font-medium text-neutral-700">
                      筛选人物：
                    </label>
                    <Select
                      value={currentPersonFilter || 'all'}
                      onValueChange={(value) => setPersonFilter(value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="所有人物" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有人物</SelectItem>
                        {persons.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentPersonFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPersonFilter(undefined)}
                      >
                        清除筛选
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 照片网格 */}
            <PhotoGrid
              photos={filteredPhotos}
              selectedPhotoIds={selectedPhotoIds}
              showCheckbox={true}
              showActions={false}
              maxSelection={5}
              onPhotoSelect={togglePhotoSelection}
              emptyMessage="照片库为空，请先添加照片或切换到临时上传"
            />
          </TabsContent>

          {/* 临时上传 */}
          <TabsContent value="upload" className="space-y-6">
            {/* 上传提示 */}
            <Card className="border-2 border-dashed border-neutral-300 bg-neutral-50/50">
              <CardHeader>
                <CardTitle className="text-heading-md">临时上传照片</CardTitle>
                <CardDescription>
                  临时上传的照片不会自动保存到照片库，仅用于本次生成
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tempPhotos.length < 5 ? (
                  <button
                    onClick={handleTempUpload}
                    className="w-full py-12 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-neutral-400 mb-4" />
                      <p className="text-heading-sm text-neutral-700 mb-2">
                        点击选择照片
                      </p>
                      <p className="text-body-sm text-neutral-500">
                        已上传 {tempPhotos.length}/5 张 • 支持 JPG, PNG
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="text-center py-8 text-neutral-600">
                    已达到上传上限（5张）
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 临时照片网格 */}
            {tempPhotos.length > 0 && (
              <PhotoGrid
                photos={tempPhotos}
                selectedPhotoIds={tempSelectedIds}
                showCheckbox={true}
                showActions={true}
                maxSelection={5}
                onPhotoSelect={toggleTempSelection}
                onPhotoDelete={handleRemoveTempPhoto}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* 底部操作栏 */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/')}
          >
            返回首页
          </Button>
          <Button
            size="lg"
            disabled={!canProceed}
            onClick={handleProceed}
            className="gradient-ai text-white shadow-ai"
          >
            下一步：选择场景主题
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
