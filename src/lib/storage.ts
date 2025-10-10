// Browser-based storage using localStorage
// Replaces SQLite database for Tauri frontend

import type {
  PhotoUpload,
  StyleTemplate,
  GenerationTask,
  GeneratedImage,
} from './types'

const STORAGE_KEYS = {
  PHOTOS: 'homememo_photos',
  STYLES: 'homememo_styles',
  TASKS: 'homememo_tasks',
  IMAGES: 'homememo_images',
  PRIVACY_ACCEPTED: 'homememo_privacy_accepted',
  SETTINGS: 'homememo_settings',
} as const

// Predefined style templates
const DEFAULT_STYLES: StyleTemplate[] = [
  {
    id: 'warm_home',
    name: '温馨家居',
    promptTemplate: '温馨家居风格的百岁照,温暖的家庭氛围,柔和的光线',
    thumbnailPath: '/styles/warm_home.svg',
    displayOrder: 1,
    description: '温暖的家庭氛围'
  },
  {
    id: 'fresh_nature',
    name: '清新自然',
    promptTemplate: '清新自然风格的百岁照,户外场景,绿色植物背景',
    thumbnailPath: '/styles/fresh_nature.svg',
    displayOrder: 2,
    description: '自然清新的户外场景'
  },
  {
    id: 'cartoon',
    name: '卡通童趣',
    promptTemplate: '卡通童趣风格的百岁照,可爱卡通元素,明亮色彩',
    thumbnailPath: '/styles/cartoon.svg',
    displayOrder: 3,
    description: '可爱的卡通风格'
  },
  {
    id: 'vintage',
    name: '复古怀旧',
    promptTemplate: '复古怀旧风格的百岁照,经典复古色调,怀旧氛围',
    thumbnailPath: '/styles/vintage.svg',
    displayOrder: 4,
    description: '经典复古风格'
  },
  {
    id: 'dreamy',
    name: '梦幻唯美',
    promptTemplate: '梦幻唯美风格的百岁照,柔焦效果,唯美场景',
    thumbnailPath: '/styles/dreamy.svg',
    displayOrder: 5,
    description: '梦幻般的唯美场景'
  },
  {
    id: 'festival',
    name: '节日庆典',
    promptTemplate: '节日庆典风格的百岁照,节日装饰,欢乐氛围',
    thumbnailPath: '/styles/festival.svg',
    displayOrder: 6,
    description: '欢乐的节日氛围'
  }
]

// Helper functions
function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error)
  }
}

// Photo storage
export function savePhoto(photo: PhotoUpload): void {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.PHOTOS) || []
  photos.push(photo)
  setItem(STORAGE_KEYS.PHOTOS, photos)
}

export function getAllPhotos(): PhotoUpload[] {
  return getItem<PhotoUpload[]>(STORAGE_KEYS.PHOTOS) || []
}

export function deletePhoto(photoId: string): void {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.PHOTOS) || []
  const filtered = photos.filter(p => p.id !== photoId)
  setItem(STORAGE_KEYS.PHOTOS, filtered)
}

export function clearPhotos(): void {
  setItem(STORAGE_KEYS.PHOTOS, [])
}

// Style template storage
export function initializeStyles(): void {
  const existing = getItem<StyleTemplate[]>(STORAGE_KEYS.STYLES)
  if (!existing || existing.length === 0) {
    setItem(STORAGE_KEYS.STYLES, DEFAULT_STYLES)
  }
}

export function getAllStyles(): StyleTemplate[] {
  const styles = getItem<StyleTemplate[]>(STORAGE_KEYS.STYLES)
  return styles || DEFAULT_STYLES
}

export function getStyleById(styleId: string): StyleTemplate | undefined {
  const styles = getAllStyles()
  return styles.find(s => s.id === styleId)
}

// Generation task storage
export function saveTask(task: GenerationTask): GenerationTask {
  const tasks = getItem<GenerationTask[]>(STORAGE_KEYS.TASKS) || []
  tasks.push(task)
  setItem(STORAGE_KEYS.TASKS, tasks)
  return task
}

export function getTask(taskId: string): GenerationTask | undefined {
  const tasks = getItem<GenerationTask[]>(STORAGE_KEYS.TASKS) || []
  return tasks.find(t => t.id === taskId)
}

export function updateTask(taskId: string, updates: Partial<GenerationTask>): void {
  const tasks = getItem<GenerationTask[]>(STORAGE_KEYS.TASKS) || []
  const index = tasks.findIndex(t => t.id === taskId)

  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates }
    setItem(STORAGE_KEYS.TASKS, tasks)
  }
}

export function getAllTasks(): GenerationTask[] {
  return getItem<GenerationTask[]>(STORAGE_KEYS.TASKS) || []
}

// Generated image storage
export function saveGeneratedImage(image: GeneratedImage): void {
  const images = getItem<GeneratedImage[]>(STORAGE_KEYS.IMAGES) || []
  images.push(image)
  setItem(STORAGE_KEYS.IMAGES, images)
}

export function getImagesByTask(taskId: string): GeneratedImage[] {
  const images = getItem<GeneratedImage[]>(STORAGE_KEYS.IMAGES) || []
  return images.filter(img => img.taskId === taskId)
}

export function getAllImages(): GeneratedImage[] {
  return getItem<GeneratedImage[]>(STORAGE_KEYS.IMAGES) || []
}

// Privacy consent storage
export function setPrivacyAccepted(accepted: boolean): void {
  setItem(STORAGE_KEYS.PRIVACY_ACCEPTED, accepted)
}

export function hasAcceptedPrivacy(): boolean {
  return getItem<boolean>(STORAGE_KEYS.PRIVACY_ACCEPTED) || false
}

// Initialize storage on app load
export async function initializeStorage(): Promise<void> {
  initializeStyles()

  // 初始化文件系统权限：如果已保存自定义目录,自动扩展权限
  try {
    const settings = loadSettings()
    if (settings.dataRootDir) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('expand_scope', { folderPath: settings.dataRootDir })
      console.log('启动时已扩展文件系统权限:', settings.dataRootDir)
    }
  } catch (error) {
    console.error('启动时扩展文件系统权限失败:', error)
    // 不抛出错误,避免阻塞应用启动
  }
}

// App settings (SeeDream config)
export interface AppSettings {
  seedreamApiKey?: string
  seedreamBaseUrl?: string
  dataRootDir?: string
}

export function loadSettings(): AppSettings {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS) || {}
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const current = loadSettings()
  const merged = { ...current, ...settings }
  setItem(STORAGE_KEYS.SETTINGS, merged)

  // 如果设置了自定义数据目录,动态扩展文件系统权限
  if (settings.dataRootDir) {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('expand_scope', { folderPath: settings.dataRootDir })
      console.log('文件系统权限已扩展:', settings.dataRootDir)
    } catch (error) {
      console.error('扩展文件系统权限失败:', error)
      throw new Error('无法访问指定目录,请检查路径是否正确')
    }
  }
}
