/**
 * SeeDream 4.0 图像生成适配器
 * 基于 BytePlus 官方 API
 */

import axios, { type AxiosInstance } from 'axios'
import type {
  NanoBananaGenerateResponse,
  NanoBananaTaskStatusResponse,
} from '../types'
import type { ImageGenerationParams, ImageGenerator } from './base'
import { loadSettings } from '../storage'

const MODEL = 'doubao-seedream-4-0-250828'
const TIMEOUT = 90000 // 90秒,SeeDream 生成速度较快
const DEFAULT_SIZE = '2K' // SeeDream 支持: 1K, 2K, 4K

/**
 * 创建 BytePlus 官方 API 客户端
 */
function createSeeDreamClient(): AxiosInstance {
  // Tauri 桌面版优先走 Tauri 后端命令，保留 axios 仅用于非 Tauri 回退
  const base = process.env.NEXT_PUBLIC_SEEDREAM_PROXY_BASE || '/api/seedream'
  console.log('[SeeDream Config] Using proxy BASE_URL:', base)

  return axios.create({
    baseURL: base,
    timeout: TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * 将图片文件转换为 base64
 */
async function imageToBase64(filePath: string): Promise<string> {
  try {
    console.log('[SeeDream] Reading file:', filePath)

    const { readFile } = await import('@tauri-apps/plugin-fs')

    // 读取文件内容
    const fileData = await readFile(filePath)
    console.log('[SeeDream] File read successfully, size:', fileData.byteLength, 'bytes')

    // 转换 Uint8Array 为 base64
    let binary = ''
    const len = fileData.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(fileData[i])
    }
    const base64 = btoa(binary)
    console.log('[SeeDream] Base64 conversion complete, length:', base64.length)
    return base64
  } catch (error: any) {
    console.error('[SeeDream] Failed to convert image to base64:', error)
    console.error('[SeeDream] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    })
    throw new Error(`图片读取失败: ${error.message || '未知错误'}`)
  }
}

/**
 * SeeDream 4.0 图像生成器实现
 */
export class SeeDreamGenerator implements ImageGenerator {
  private client: AxiosInstance

  constructor() {
    this.client = createSeeDreamClient()
  }

  /**
   * 生成单张图片 (带重试机制)
   */
  private async generateSingleImage(
    imageBase64: string,
    prompt: string,
    retryCount = 0
  ): Promise<string> {
    const MAX_RETRIES = 3
    const RETRY_DELAYS = [2000, 5000, 10000] // 2s, 5s, 10s 指数退避

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const { seedreamApiKey, seedreamBaseUrl } = loadSettings()
      const baseUrl = (seedreamBaseUrl || process.env.NEXT_PUBLIC_SEEDREAM_BASE_URL || '').trim() || undefined
      const apiKey = (seedreamApiKey || process.env.SEEDREAM_API_KEY || process.env.NEXT_PUBLIC_SEEDREAM_API_KEY || '').trim()
      if (!apiKey) {
        throw new Error('未配置 SeeDream API Key')
      }
      const resp: any = await invoke('seedream_generate', {
        payload: {
          api_key: apiKey,
          base_url: baseUrl,
          model: MODEL,
          prompt,
          image_base64: imageBase64,
          size: DEFAULT_SIZE,
        },
      })
      const imageData = resp?.data?.[0]?.b64Json || resp?.data?.[0]?.b64_json
      if (!imageData) throw new Error('SeeDream API 未返回图片数据')
      return `data:image/png;base64,${imageData}`
    } catch (error: any) {
      // 解析错误信息
      let errorMessage = error.message || String(error)
      let isRetryable = false

      // 检查是否是 Tauri invoke 返回的错误
      if (typeof error === 'string') {
        try {
          const parsedError = JSON.parse(error)
          if (parsedError.error) {
            errorMessage = parsedError.error.message || parsedError.error.code || errorMessage
            // 429 错误可重试
            if (parsedError.error.code === 'ServerOverloaded' || errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
              isRetryable = true
            }
          }
        } catch {
          // 如果不是 JSON,检查字符串内容
          if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('ServerOverloaded')) {
            isRetryable = true
          }
        }
      } else if (error.response?.data?.error) {
        const apiError = error.response.data.error
        errorMessage = apiError.message || apiError.code || 'SeeDream API 错误'
        if (apiError.code === 'ServerOverloaded' || errorMessage.includes('429')) {
          isRetryable = true
        }
      }

      console.error(`[SeeDream] Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, errorMessage)

      // 如果可重试且未达到最大重试次数
      if (isRetryable && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount]
        console.log(`[SeeDream] Retrying after ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.generateSingleImage(imageBase64, prompt, retryCount + 1)
      }

      // 重试次数用尽或不可重试错误,抛出
      throw new Error(errorMessage)
    }
  }

  /**
   * 生成多张图片 (支持部分成功)
   */
  async generateImages(params: ImageGenerationParams): Promise<NanoBananaGenerateResponse> {
    const {
      photoPath,
      prompt,
      numImages = 4,
      onProgress,
    } = params

    // Step 1: 转换图片为 base64 (0-10%)
    if (onProgress) onProgress(0.05)
    const imageBase64 = await imageToBase64(photoPath)
    if (onProgress) onProgress(0.1)

    // Step 2: 逐个生成图片 (10-100%)
    const generatedImages: string[] = []
    const errors: { index: number; error: Error }[] = []

    for (let i = 0; i < numImages; i++) {
      const progressStart = 0.1 + (i / numImages) * 0.9
      const progressEnd = 0.1 + ((i + 1) / numImages) * 0.9

      if (onProgress) onProgress(progressStart)

      try {
        const imageData = await this.generateSingleImage(imageBase64, prompt)
        generatedImages.push(imageData)
        console.log(`[SeeDream] ✓ Image ${i + 1}/${numImages} generated successfully`)
      } catch (error: any) {
        // 记录失败但继续生成其他图片
        const errorObj = error instanceof Error ? error : new Error(String(error))
        errors.push({ index: i, error: errorObj })
        console.error(`[SeeDream] ✗ Image ${i + 1}/${numImages} failed:`, errorObj.message)
        // 继续下一张图片
      }

      if (onProgress) onProgress(progressEnd)
    }

    // 如果全部失败,抛出错误
    if (generatedImages.length === 0) {
      const firstError = errors[0]?.error || new Error('所有图片生成失败')
      throw this.handleError(firstError)
    }

    // 返回统一格式的响应 (包含成功和失败信息)
    const taskId = `seedream-task-${Date.now()}`
    const response: NanoBananaGenerateResponse = {
      taskId,
      status: 'processing',
      estimatedTime: 0,
      message: errors.length > 0
        ? `部分成功: ${generatedImages.length}/${numImages} 张图片生成成功`
        : 'OK',
      images: generatedImages.map((data, index) => ({
        url: data, // 已经是完整的 data URL
        width: 1024,
        height: 1024,
        fileSize: Math.floor(data.length * 0.75), // 估算大小
        sequence: index + 1,
      })),
    }

    // 在响应中附加失败信息 (扩展字段)
    if (errors.length > 0) {
      (response as any).partialSuccess = true
      ;(response as any).successCount = generatedImages.length
      ;(response as any).failCount = errors.length
      ;(response as any).errors = errors.map(e => ({
        index: e.index,
        message: e.error.message
      }))
    }

    return response
  }

  /**
   * 轮询任务状态 - SeeDream 是同步的,此方法仅用于兼容性
   */
  async pollTaskStatus(
    taskId: string,
    onProgress?: (percent: number) => void
  ): Promise<NanoBananaTaskStatusResponse> {
    if (onProgress) onProgress(1)

    return {
      taskId,
      status: 'completed',
      progress: 100,
      images: [], // 已在 generateImages 中返回
    }
  }

  /**
   * 检查 API 连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      // BytePlus API 没有专门的连接测试端点
      // 使用一个最小的生成请求来测试
      const testResponse = await this.client.post('/images/generations', {
        model: MODEL,
        prompt: 'test',
        size: '1K',
        response_format: 'url',
      })
      return testResponse.status === 200
    } catch (error) {
      console.error('[SeeDream] Connection check failed:', error)
      return false
    }
  }

  /**
   * 处理 API 错误
   */
  private handleError(error: any): Error {
    console.error('[SeeDream] API Error:', error)

    if (error.response?.data?.error) {
      const apiError = error.response.data.error
      const message = apiError.message || ''

      // 映射常见错误到用户友好的消息
      if (message.includes('quota') || message.includes('insufficient')) {
        return new Error('API 调用额度不足,请充值后重试')
      } else if (message.includes('invalid') || message.includes('Invalid')) {
        return new Error('照片格式不正确或包含不当内容')
      } else if (message.includes('API key') || message.includes('Unauthorized')) {
        return new Error('API 密钥无效,请检查 SEEDREAM_API_KEY 配置')
      } else {
        return new Error(message || '生成失败,请重试')
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new Error('网络连接超时,请检查网络后重试')
    } else if (error.message) {
      return new Error(error.message)
    } else {
      return new Error('网络错误: 请检查网络连接')
    }
  }
}
