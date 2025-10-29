// Type definitions for HomeMemo百岁照生成功能
// Based on data-model.md

export type TaskStatus = 'pending' | 'generating' | 'success' | 'failed'
export type SimilarityLevel = 'high' | 'medium' | 'low'
export type CropRatio = '1:1' | '3:4' | '4:3'
export type PhotoFormat = 'JPG' | 'PNG'

// ============================================================================
// 003-2: 多人照片生成模式类型定义
// ============================================================================

/** 照片生成模式（单人/多人） */
export type GenerationMode = 'single' | 'multi'

/** 任务创建模式（自动生成/手动选择风格） */
export type TaskCreationMode = 'auto' | 'manual'

/** 人脸检测结果 (specs/003-2/contracts/photo-validation-api.md) */
export interface FaceValidationResult {
  isValid: boolean
  faceCount: number
  confidence?: number
  timestamp: number
  error?: string
}

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

  // 新增：照片库字段
  personId?: string        // 关联的人物 ID
  personName?: string      // 人物名称（冗余，方便展示）
  tags?: string[]          // 自定义标签
  capturedAt?: number      // 拍摄时间（从 EXIF 读取或手动设置）
  croppedPath?: string     // 裁剪后的文件路径（如果有）
  isInLibrary?: boolean    // 是否保存到照片库（区分临时上传）

  // AI 生成相关字段
  isAIGenerated?: boolean  // 是否为 AI 生成照片
  aiMetadata?: AIPhotoMetadata  // AI 生成元数据（仅当 isAIGenerated=true 时有值）

  // 003-2: 人脸检测字段
  faceCount?: number       // 检测到的人脸数量
  faceConfidence?: number  // 人脸检测置信度
  qualityScore?: number    // 照片质量评分
}

// AI 照片元数据
export interface AIPhotoMetadata {
  taskId: string                  // 生成任务 ID
  styleId: string                 // 风格 ID
  styleName: string               // 风格名称（冗余，方便展示）
  milestoneName?: string          // 场景/里程碑名称
  similarityLevel: SimilarityLevel // 相似度级别
  sourcePhotoIds: string[]        // 使用的原始照片 ID 列表
  sequenceNumber: number          // 该风格的第几张图 (1-4)
  generatedAt: number             // 生成时间戳
  isFavorited?: boolean           // 是否收藏（从 GeneratedImage 同步）
  generationMode?: GenerationMode // 003-2: 生成模式
}

export interface StyleTemplate {
  id: string
  name: string
  promptTemplate: string
  thumbnailPath?: string
  displayOrder: number // 1-6
  description?: string
  // 003-2: 多人模式支持
  supportedModes?: GenerationMode[] // 支持的模式列表
  minPhotos?: number                // 最少照片数
  maxPhotos?: number                // 最多照片数
  isMultiPerson?: boolean           // 是否支持多人（冗余字段，便于筛选）
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
  mode?: GenerationMode      // 003-2: 生成模式
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

// 人物档案（照片库功能）
export interface Person {
  id: string
  name: string              // 姓名
  relationship?: string     // 关系：爸爸/妈妈/宝宝/爷爷/奶奶/其他
  birthDate?: string        // 生日，格式：YYYY-MM-DD
  avatar?: string           // 头像照片路径（从关联照片中选择）
  createdAt: number         // 创建时间
  updatedAt: number         // 更新时间
  photoCount?: number       // 关联的照片数量（冗余字段）
}

/** 相册筛选条件 (specs/003-2/contracts/photo-library-api.md) */
export interface AlbumFilter {
  photoType?: 'original' | 'ai'  // 照片类型筛选
  styleId?: string                // 风格筛选（仅对 AI 照片）
  milestoneName?: string          // 里程碑筛选
  dateRange?: {                   // 日期范围
    start: number
    end: number
  }
  generationMode?: GenerationMode // 生成模式筛选
  limit?: number                  // 分页：返回条数
  offset?: number                 // 分页：偏移量
}

// Store state types (Zustand)
export interface AppStore {
  currentTaskId?: string
  uploadedPhotos: PhotoUpload[]
  selectedStyleIds: string[]
  similarityLevel: SimilarityLevel
  // 003-2: 模式管理
  generationMode: GenerationMode          // 当前生成模式（单人/多人）
  taskCreationMode: TaskCreationMode      // 任务创建模式（自动/手动）
  photoValidationResults: Map<string, FaceValidationResult> // 照片验证结果缓存

  setUploadedPhotos: (photos: PhotoUpload[]) => void
  addPhoto: (photo: PhotoUpload) => void
  removePhoto: (photoId: string) => void
  setSelectedStyleIds: (styleIds: string[]) => void
  setSimilarityLevel: (level: SimilarityLevel) => void
  setCurrentTaskId: (taskId: string | undefined) => void
  // 003-2: 新增操作
  setGenerationMode: (mode: GenerationMode) => void
  setTaskCreationMode: (mode: TaskCreationMode) => void
  setPhotoValidationResult: (photoId: string, result: FaceValidationResult) => void
  clearValidationResults: () => void
  reset: () => void
}

// 照片类型筛选
export type PhotoTypeFilter = 'all' | 'original' | 'ai'

// 照片库状态（新增）
export interface PhotoLibraryState {
  libraryPhotos: PhotoUpload[]      // 照片库中的所有照片
  persons: Person[]                  // 所有人物档案
  selectedPhotoIds: Set<string>      // 当前选中的照片 ID
  currentPersonFilter?: string       // 当前筛选的人物 ID
  currentTypeFilter: PhotoTypeFilter // 当前照片类型筛选
  currentStyleFilter?: string        // 当前风格筛选（仅对 AI 照片有效）
  currentModeFilter?: GenerationMode // T021: 当前生成模式筛选（仅对 AI 照片有效）

  // 照片操作
  addPhotoToLibrary: (photo: PhotoUpload) => Promise<void>
  addPhotosToLibrary: (photos: PhotoUpload[]) => Promise<void>
  updatePhoto: (id: string, data: Partial<PhotoUpload>) => Promise<void>
  deletePhotoFromLibrary: (id: string) => Promise<void>
  deletePhotosFromLibrary: (ids: string[]) => Promise<void>
  loadLibraryPhotos: () => Promise<void>

  // 人物操作
  addPerson: (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Person>
  updatePerson: (id: string, data: Partial<Person>) => Promise<void>
  deletePerson: (id: string) => Promise<void>
  loadPersons: () => Promise<void>

  // 选择操作
  setSelectedPhotoIds: (ids: Set<string>) => void
  togglePhotoSelection: (id: string) => void
  clearSelection: () => void

  // 筛选操作
  setPersonFilter: (personId?: string) => void
  setTypeFilter: (type: PhotoTypeFilter) => void
  setStyleFilter: (styleId?: string) => void
  setModeFilter: (mode?: GenerationMode) => void // T021: 设置生成模式筛选
}
