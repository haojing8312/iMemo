import {
  GenerationTask,
  CreateTaskParams,
  CreateTaskParamsSchema,
  TaskStatus,
  GenerationResult,
  TaskProgress
} from './types/task'
import { NotFoundError, ValidationError } from './types/errors'
import { getDefaultStylesForMilestone, validateStyleCompatibility } from './styleService'
import { saveDataUrlImageToLocal } from './fileUtils'

const STORAGE_KEY = 'milestone-generation-tasks'

/**
 * Get all tasks from localStorage
 */
function loadTasks(): GenerationTask[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error)
    return []
  }
}

/**
 * Save tasks to localStorage
 */
function saveTasks(tasks: GenerationTask[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error)
    throw new Error('Failed to save tasks: ' + error)
  }
}

/**
 * Create a new generation task
 */
export async function createTask(params: CreateTaskParams): Promise<GenerationTask> {
  // Validate parameters with Zod
  const validated = CreateTaskParamsSchema.parse(params)

  // Determine which styles to use
  let selectedStyleIds: string[]
  let imagesPerStyle = 4 // 默认每种风格生成 4 张图片

  if (validated.mode === 'auto') {
    // Auto mode: use default styles for milestone
    const defaultStyles = await getDefaultStylesForMilestone(validated.milestoneId)

    // 如果提供了自动生成配置
    if (validated.autoConfig) {
      // 根据配置选择风格数量（随机选择或取前N个）
      const maxStyles = Math.min(validated.autoConfig.selectedStyleCount, defaultStyles.length)
      // 随机选择指定数量的风格
      const shuffled = [...defaultStyles].sort(() => Math.random() - 0.5)
      selectedStyleIds = shuffled.slice(0, maxStyles).map(s => s.id)
      imagesPerStyle = validated.autoConfig.imagesPerStyle
    } else {
      // 使用全部默认风格
      selectedStyleIds = defaultStyles.map(s => s.id)
    }
  } else {
    // Manual mode: use provided style IDs
    if (!validated.styleIds || validated.styleIds.length === 0) {
      throw new ValidationError('styleIds', 'Manual mode requires at least 1 style')
    }
    selectedStyleIds = validated.styleIds

    // Validate compatibility
    await validateStyleCompatibility(validated.milestoneId, selectedStyleIds)
  }

  // T016: Create new task with photoMode support
  const now = Date.now()
  const task: GenerationTask = {
    id: crypto.randomUUID(),
    milestoneId: validated.milestoneId,
    milestoneName: validated.milestoneName,
    generationMode: validated.mode, // auto | manual
    photoMode: validated.photoMode || 'single', // T016: single | multi
    selectedStyleIds,
    uploadedPhotoIds: validated.photoIds,
    status: 'pending',
    progress: {
      totalStyles: selectedStyleIds.length,
      completedStyles: 0,
      totalImages: selectedStyleIds.length * imagesPerStyle, // 根据配置计算总图片数
      completedImages: 0,
      failedStyles: []
    },
    results: [],
    createdAt: now,
    updatedAt: now
  }

  // Save to storage
  const tasks = loadTasks()
  tasks.push(task)
  saveTasks(tasks)

  return task
}

/**
 * Get a task by ID
 */
export async function getTaskById(taskId: string): Promise<GenerationTask> {
  const tasks = loadTasks()
  const task = tasks.find(t => t.id === taskId)

  if (!task) {
    throw new NotFoundError('GenerationTask', taskId)
  }

  return task
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<GenerationTask[]> {
  return loadTasks()
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const tasks = loadTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    throw new NotFoundError('GenerationTask', taskId)
  }

  tasks[taskIndex].status = status
  tasks[taskIndex].updatedAt = Date.now()

  if (status === 'completed' || status === 'partial-success' || status === 'failed') {
    tasks[taskIndex].completedAt = Date.now()
  }

  saveTasks(tasks)
}

/**
 * Update task progress
 */
export async function updateTaskProgress(
  taskId: string,
  progress: Partial<TaskProgress>
): Promise<void> {
  const tasks = loadTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    throw new NotFoundError('GenerationTask', taskId)
  }

  tasks[taskIndex].progress = {
    ...tasks[taskIndex].progress,
    ...progress
  }
  tasks[taskIndex].updatedAt = Date.now()

  saveTasks(tasks)
}

/**
 * Add a generation result to a task
 */
export async function addTaskResult(
  taskId: string,
  result: GenerationResult
): Promise<void> {
  const tasks = loadTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    throw new NotFoundError('GenerationTask', taskId)
  }

  // 如果是 dataURL，先落盘为本地文件，避免 localStorage 爆容量
  try {
    const isDataUrl = typeof (result as any).imageUrl === 'string' && (result as any).imageUrl.startsWith('data:image/')
    if (isDataUrl) {
      const sequenceNum = typeof (result as any).index === 'number' ? (result as any).index + 1 : 1
      const localPath = await saveDataUrlImageToLocal(
        (result as any).imageUrl,
        taskId,
        (result as any).styleId,
        sequenceNum
      )
      // 转为可用于 <img src> 的 URL
      const { convertFileSrc } = await import('@tauri-apps/api/core')
      ;(result as any).imageUrl = convertFileSrc(localPath)
      ;(result as any).filePath = localPath
    }
  } catch (e: any) {
    console.error('保存图片到本地失败:', e)
    throw new Error(typeof e?.message === 'string' ? e.message : '保存图片到本地失败')
  }

  tasks[taskIndex].results.push(result)
  tasks[taskIndex].updatedAt = Date.now()

  saveTasks(tasks)
}

/**
 * Toggle favorite status for a generated image
 */
export async function toggleFavorite(taskId: string, imageId: string): Promise<void> {
  const tasks = loadTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    throw new NotFoundError('GenerationTask', taskId)
  }

  const result = tasks[taskIndex].results.find(r => r.imageId === imageId)
  if (!result) {
    throw new NotFoundError('GenerationResult', imageId)
  }

  result.favorited = !result.favorited
  tasks[taskIndex].updatedAt = Date.now()

  saveTasks(tasks)
}

/**
 * Mark an image as exported
 */
export async function markAsExported(
  taskId: string,
  imageId: string,
  exportedPath: string
): Promise<void> {
  const tasks = loadTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)

  if (taskIndex === -1) {
    throw new NotFoundError('GenerationTask', taskId)
  }

  const result = tasks[taskIndex].results.find(r => r.imageId === imageId)
  if (!result) {
    throw new NotFoundError('GenerationResult', imageId)
  }

  result.exported = true
  result.exportedPath = exportedPath
  tasks[taskIndex].updatedAt = Date.now()

  saveTasks(tasks)
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const tasks = loadTasks()
  const filtered = tasks.filter(t => t.id !== taskId)

  if (filtered.length === tasks.length) {
    throw new NotFoundError('GenerationTask', taskId)
  }

  saveTasks(filtered)
}

/**
 * Get recent tasks (last N tasks)
 */
export async function getRecentTasks(limit: number = 10): Promise<GenerationTask[]> {
  const tasks = loadTasks()
  return tasks
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

/**
 * Clean up old tasks (older than specified days)
 */
export async function cleanupOldTasks(daysOld: number = 30): Promise<number> {
  const tasks = loadTasks()
  const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000)

  const filtered = tasks.filter(task => task.createdAt >= cutoffTime)
  const removedCount = tasks.length - filtered.length

  if (removedCount > 0) {
    saveTasks(filtered)
  }

  return removedCount
}
