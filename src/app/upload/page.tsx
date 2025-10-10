'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { open } from '@tauri-apps/plugin-dialog'
import { convertFileSrc } from '@tauri-apps/api/core'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { savePhoto } from '@/lib/storage'
import { PhotoValidator } from '@/lib/validators'
import { getImageMetadata, checkImageQuality, detectFaces, getFileSize } from '@/lib/imageUtils'
import type { PhotoUpload } from '@/lib/types'

interface PhotoWithValidation extends PhotoUpload {
  validationStatus: 'pending' | 'validating' | 'valid' | 'invalid'
  validationError?: string
}

export default function UploadPage() {
  const router = useRouter()
  const { uploadedPhotos, setUploadedPhotos } = useAppStore()
  const [photos, setPhotos] = useState<PhotoWithValidation[]>([])
  const [isInitialized, setIsInitialized] = useState(true) // No DB init needed

  // 选择照片
  const handleSelectPhotos = async () => {
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

      // 限制最多5张
      const remaining = 5 - photos.length
      const pathsToAdd = filePaths.slice(0, remaining)

      // 处理每张照片
      for (const path of pathsToAdd) {
        await processPhoto(path)
      }
    } catch (error) {
      console.error('选择照片失败:', error)
    }
  }

  // 处理单张照片
  const processPhoto = async (filePath: string) => {
    const tempId = crypto.randomUUID()

    // 添加待验证状态
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
      validationStatus: 'validating'
    }

    setPhotos(prev => [...prev, tempPhoto])

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
      }

      // 基础验证
      const basicValidation = PhotoValidator.validate(photo)
      if (!basicValidation.isValid) {
        setPhotos(prev => prev.map(p =>
          p.id === tempId
            ? { ...p, validationStatus: 'invalid' as const, validationError: basicValidation.error }
            : p
        ))
        return
      }

      // 质量检测
      const qualityCheck = await checkImageQuality(filePath)
      if (!qualityCheck.isValid) {
        setPhotos(prev => prev.map(p =>
          p.id === tempId
            ? { ...p, validationStatus: 'invalid' as const, validationError: qualityCheck.error }
            : p
        ))
        return
      }

      // 人脸检测 (暂时跳过,返回 valid)
      const faceDetection = await detectFaces(filePath)
      if (!faceDetection.isValid) {
        setPhotos(prev => prev.map(p =>
          p.id === tempId
            ? { ...p, validationStatus: 'invalid' as const, validationError: faceDetection.error }
            : p
        ))
        return
      }

      // 保存到 localStorage
      const savedPhoto = { ...photo, id: tempId } as PhotoUpload
      savePhoto(savedPhoto)

      // 更新状态为有效
      setPhotos(prev => prev.map(p =>
        p.id === tempId
          ? { ...savedPhoto, validationStatus: 'valid' as const }
          : p
      ))
    } catch (error) {
      console.error('处理照片失败:', error)
      setPhotos(prev => prev.map(p =>
        p.id === tempId
          ? { ...p, validationStatus: 'invalid' as const, validationError: '处理失败,请重试' }
          : p
      ))
    }
  }

  // 删除照片
  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  // 前往里程碑选择页面
  const handleProceed = () => {
    const validPhotos = photos.filter(p => p.validationStatus === 'valid')
    setUploadedPhotos(validPhotos)
    router.push('/generation/milestone')
  }

  const validPhotosCount = photos.filter(p => p.validationStatus === 'valid').length
  const canProceed = validPhotosCount >= 1 && validPhotosCount <= 5

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">上传宝宝照片</h1>
          <p className="text-gray-600">请上传1-5张宝宝近期照片，确保光线充足、面部清晰</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>照片要求</CardTitle>
            <CardDescription>
              为获得最佳效果，请确保照片符合以下要求
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">分辨率要求</p>
                <p className="text-sm text-muted-foreground">≥512x512像素</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">文件大小</p>
                <p className="text-sm text-muted-foreground">≤10MB</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">支持格式</p>
                <p className="text-sm text-muted-foreground">JPG, PNG</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 上传区域 */}
        {photos.length < 5 && (
          <Card
            className="mb-6 border-2 border-dashed cursor-pointer hover:border-primary transition"
            onClick={handleSelectPhotos}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">点击选择照片</p>
              <p className="text-sm text-muted-foreground">
                已上传 {photos.length}/5 张
              </p>
            </CardContent>
          </Card>
        )}

        {/* 照片预览网格 */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {photos.map(photo => (
              <Card key={photo.id} className="relative">
                <CardContent className="p-4">
                  {/* 状态指示器 */}
                  <div className="absolute top-2 right-2 z-10">
                    {photo.validationStatus === 'validating' && (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                    )}
                    {photo.validationStatus === 'valid' && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    {photo.validationStatus === 'invalid' && (
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    )}
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 left-2 z-10 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* 照片缩略图 */}
                  <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                    {photo.filePath && (
                      <img
                        src={convertFileSrc(photo.filePath)}
                        alt={photo.originalName || '照片'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* 照片信息 */}
                  <div className="text-xs space-y-1">
                    <p className="font-medium truncate">{photo.originalName}</p>
                    {photo.width > 0 && (
                      <p className="text-muted-foreground">
                        {photo.width}x{photo.height} • {(photo.fileSize / 1024 / 1024).toFixed(2)}MB
                      </p>
                    )}
                    {photo.validationError && (
                      <p className="text-destructive">{photo.validationError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            返回首页
          </Button>
          <Button
            size="lg"
            disabled={!canProceed}
            onClick={handleProceed}
          >
            下一步：选择里程碑
          </Button>
        </div>
      </div>
    </div>
  )
}
