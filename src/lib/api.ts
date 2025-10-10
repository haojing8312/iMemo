/**
 * 统一图像生成 API
 * 使用 SeeDream 4.0 模型
 * API Key 由用户在前端页面配置
 */

import type {
  NanoBananaGenerateResponse,
  NanoBananaTaskStatusResponse,
  SimilarityLevel,
} from './types'
import type { ImageGenerator } from './imageGenerators/base'
import { SeeDreamGenerator } from './imageGenerators/seedream'

// 单例模式,避免重复创建生成器
let generatorInstance: ImageGenerator | null = null

function getGenerator(): ImageGenerator {
  if (!generatorInstance) {
    generatorInstance = new SeeDreamGenerator()
  }
  return generatorInstance
}

/**
 * 生成图片 (支持多种模型)
 */
export async function generateImages(params: {
  photoPath: string
  prompt: string
  similarity?: SimilarityLevel
  numImages?: number
  aspectRatio?: string
  onProgress?: (percent: number) => void
}): Promise<NanoBananaGenerateResponse> {
  const generator = getGenerator()
  return generator.generateImages(params)
}

/**
 * 轮询任务状态 (兼容性保留)
 */
export async function pollTaskStatus(
  taskId: string,
  onProgress?: (percent: number) => void
): Promise<NanoBananaTaskStatusResponse> {
  const generator = getGenerator()
  return generator.pollTaskStatus(taskId, onProgress)
}

/**
 * 检查 API 连接状态
 */
export async function checkApiConnection(): Promise<boolean> {
  const generator = getGenerator()
  return generator.checkConnection()
}
