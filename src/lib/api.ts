/**
 * 统一图像生成 API
 * 支持多种 AI 模型: Gemini, SeeDream 4.0
 * 通过环境变量 AI_IMAGE_MODEL 选择模型
 */

import type {
  NanoBananaGenerateResponse,
  NanoBananaTaskStatusResponse,
  SimilarityLevel,
} from './types'
import type { ImageGenerator, ImageModel } from './imageGenerators/base'
import { GeminiGenerator } from './imageGenerators/gemini'
import { SeeDreamGenerator } from './imageGenerators/seedream'

/**
 * 获取当前配置的图像生成器
 */
function getImageGenerator(): ImageGenerator {
  const model = (process.env.NEXT_PUBLIC_AI_IMAGE_MODEL || 'gemini') as ImageModel

  console.log('[API] Selected image model:', model)

  switch (model) {
    case 'seedream':
      return new SeeDreamGenerator()
    case 'gemini':
    default:
      return new GeminiGenerator()
  }
}

// 单例模式,避免重复创建生成器
let generatorInstance: ImageGenerator | null = null

function getGenerator(): ImageGenerator {
  if (!generatorInstance) {
    generatorInstance = getImageGenerator()
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
