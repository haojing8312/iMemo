/**
 * 基础图像生成器接口
 * 所有AI模型适配器必须实现此接口
 */

import type {
  NanoBananaGenerateResponse,
  NanoBananaTaskStatusResponse,
  SimilarityLevel,
} from '../types'

export interface ImageGenerationParams {
  photoPath: string
  prompt: string
  similarity?: SimilarityLevel
  numImages?: number
  aspectRatio?: string
  onProgress?: (percent: number) => void
}

export interface ImageGenerator {
  /**
   * 生成图片
   */
  generateImages(params: ImageGenerationParams): Promise<NanoBananaGenerateResponse>

  /**
   * 轮询任务状态 (对于异步API)
   */
  pollTaskStatus(
    taskId: string,
    onProgress?: (percent: number) => void
  ): Promise<NanoBananaTaskStatusResponse>

  /**
   * 检查API连接
   */
  checkConnection(): Promise<boolean>
}

export type ImageModel = 'gemini' | 'seedream'
