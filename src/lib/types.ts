// Type definitions for HomeMemo百岁照生成功能
// Based on data-model.md

export type TaskStatus = 'pending' | 'generating' | 'success' | 'failed'
export type SimilarityLevel = 'high' | 'medium' | 'low'
export type CropRatio = '1:1' | '3:4' | '4:3'
export type PhotoFormat = 'JPG' | 'PNG'

export interface PhotoUpload {
  id: string
  filePath: string
  originalName?: string
  width: number
  height: number
  fileSize: number
  format: PhotoFormat
  uploadedAt: number // Unix milliseconds
  isCropped: boolean
  cropRatio?: CropRatio
  cropX?: number // 0-1
  cropY?: number // 0-1
  cropWidth?: number // 0-1
  cropHeight?: number // 0-1
}

export interface StyleTemplate {
  id: string
  name: string
  promptTemplate: string
  thumbnailPath?: string
  displayOrder: number // 1-6
  description?: string
}

export interface GenerationTask {
  id: string
  createdAt: number
  updatedAt: number
  status: TaskStatus
  similarityLevel: SimilarityLevel
  selectedStyleIds: string[] // JSON array in DB
  photoIds: string[] // JSON array in DB
  errorMessage?: string
  totalImages: number
  completedImages: number
}

export interface GeneratedImage {
  id: string
  taskId: string
  styleId: string
  sequenceNum: number // 1-4
  filePath: string
  fileSize: number
  width?: number
  height?: number
  createdAt: number
  isSavedToAlbum: boolean
  albumSavePath?: string
}

// Validation result type
export interface ValidationResult {
  isValid: boolean
  error?: string
}

// API response types for nano banana
export interface NanoBananaGenerateResponse {
  taskId: string
  status: 'processing' | 'completed'
  images?: NanoBananaImage[]
  progress?: number
  estimatedTime?: number
  message?: string
}

export interface NanoBananaTaskStatusResponse {
  taskId: string
  status: 'processing' | 'completed' | 'failed'
  progress?: number
  completedImages?: number
  totalImages?: number
  estimatedTimeRemaining?: number
  images?: NanoBananaImage[]
  error?: {
    code: string
    message: string
  }
}

export interface NanoBananaImage {
  url: string
  width: number
  height: number
  fileSize: number
  sequence: number
}

// Store state types (Zustand)
export interface AppStore {
  currentTaskId?: string
  uploadedPhotos: PhotoUpload[]
  selectedStyleIds: string[]
  similarityLevel: SimilarityLevel

  setUploadedPhotos: (photos: PhotoUpload[]) => void
  addPhoto: (photo: PhotoUpload) => void
  removePhoto: (photoId: string) => void
  setSelectedStyleIds: (styleIds: string[]) => void
  setSimilarityLevel: (level: SimilarityLevel) => void
  setCurrentTaskId: (taskId: string | undefined) => void
  reset: () => void
}
