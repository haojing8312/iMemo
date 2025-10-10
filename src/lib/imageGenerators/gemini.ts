/**
 * Google Gemini 图像生成适配器
 * 基于 Gemini 2.5 Flash Image Preview 模型
 */

import axios, { type AxiosInstance } from 'axios'
import type {
  NanoBananaGenerateResponse,
  NanoBananaTaskStatusResponse,
} from '../types'
import type { ImageGenerationParams, ImageGenerator } from './base'

const BASE_URL = process.env.NEXT_PUBLIC_NANO_BANANA_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
const MODEL = 'gemini-2.5-flash-image-preview'
const TIMEOUT = 60000 // 60秒

/**
 * 创建 Gemini API 客户端
 */
function createGeminiClient(): AxiosInstance {
  const apiKey = process.env.NEXT_PUBLIC_NANO_BANANA_API_KEY || ''

  console.log('[Gemini Config] BASE_URL:', BASE_URL)
  console.log('[Gemini Config] API_KEY:', apiKey ? '***' + apiKey.slice(-4) : 'NOT SET')

  return axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  })
}

/**
 * 将图片文件转换为 base64
 */
async function imageToBase64(filePath: string): Promise<string> {
  try {
    const { readFile } = await import('@tauri-apps/plugin-fs')
    const fileData = await readFile(filePath)

    // 转换 Uint8Array 为 base64
    let binary = ''
    const len = fileData.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(fileData[i])
    }
    return btoa(binary)
  } catch (error) {
    console.error('[Gemini] Failed to convert image to base64:', error)
    throw new Error('图片读取失败')
  }
}

/**
 * Google Gemini 图像生成器实现
 */
export class GeminiGenerator implements ImageGenerator {
  private client: AxiosInstance

  constructor() {
    this.client = createGeminiClient()
  }

  /**
   * 生成单张图片
   */
  private async generateSingleImage(
    imageBase64: string,
    prompt: string
  ): Promise<string> {
    try {
      // 使用 Gemini 图像生成模型
      const response = await this.client.post(
        '', // BASE_URL 已包含完整路径
        {
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Based on the reference image provided, please generate a new image with the following style: ${prompt}. Return the generated image.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NANO_BANANA_API_KEY}`,
          },
        }
      )

      console.log('[Gemini] Response received')

      // 提取内容
      const content = response.data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('Gemini API 未返回响应')
      }

      // API 返回格式: ![image](data:image/png;base64,...)
      // 从 markdown 图片格式中提取 base64 data URL
      if (typeof content === 'string') {
        // 检查 markdown 图片格式
        const markdownImageMatch = content.match(/!\[.*?\]\((data:image\/[^;]+;base64,[^)]+)\)/)
        if (markdownImageMatch && markdownImageMatch[1]) {
          return markdownImageMatch[1]
        }

        // 如果已经是 data URL,直接返回
        if (content.startsWith('data:image/')) {
          return content
        }

        // 如果是普通 URL,直接返回
        if (content.startsWith('http://') || content.startsWith('https://')) {
          return content
        }

        // 如果是纯 base64(无前缀),添加前缀
        if (/^[A-Za-z0-9+/=]+$/.test(content) && content.length > 1000) {
          return `data:image/jpeg;base64,${content}`
        }
      }

      // 如果 content 是对象或包含 image 字段
      if (typeof content === 'object' && content !== null) {
        const imageData = (content as any).image || (content as any).data
        if (imageData) {
          return imageData.startsWith('data:image/') ? imageData : `data:image/jpeg;base64,${imageData}`
        }
      }

      throw new Error('Gemini API 未返回有效的图片数据. Response: ' + JSON.stringify(content).substring(0, 200))
    } catch (error: any) {
      console.error('[Gemini] Error:', error.response?.data || error.message)
      if (error.response?.data?.error) {
        const apiError = error.response.data.error
        throw new Error(apiError.message || 'Gemini API 错误')
      }
      throw error
    }
  }

  /**
   * 生成多张图片
   */
  async generateImages(params: ImageGenerationParams): Promise<NanoBananaGenerateResponse> {
    const {
      photoPath,
      prompt,
      numImages = 4,
      onProgress,
    } = params

    try {
      // Step 1: 转换图片为 base64 (0-10%)
      if (onProgress) onProgress(0.05)
      const imageBase64 = await imageToBase64(photoPath)
      if (onProgress) onProgress(0.1)

      // Step 2: 逐个生成图片 (10-100%)
      const generatedImages: string[] = []

      for (let i = 0; i < numImages; i++) {
        const progressStart = 0.1 + (i / numImages) * 0.9
        const progressEnd = 0.1 + ((i + 1) / numImages) * 0.9

        if (onProgress) onProgress(progressStart)

        const imageData = await this.generateSingleImage(imageBase64, prompt)
        generatedImages.push(imageData)

        if (onProgress) onProgress(progressEnd)
      }

      // 返回统一格式的响应
      const taskId = `gemini-task-${Date.now()}`
      return {
        taskId,
        status: 'completed',
        progress: 100,
        images: generatedImages.map((data, index) => ({
          url: `data:image/jpeg;base64,${data}`,
          width: 768,
          height: 1024,
          fileSize: Math.floor(data.length * 0.75),
          sequence: index + 1,
        })),
        estimatedTime: 0,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 轮询任务状态 - Gemini 是同步的,此方法仅用于兼容性
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
      images: [],
    }
  }

  /**
   * 检查 API 连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      // 使用简单的文本请求测试连接
      const response = await this.client.post(
        `/models/${MODEL}:generateContent`,
        {
          contents: [
            {
              parts: [{ text: 'Test connection' }],
            },
          ],
        }
      )
      return response.status === 200
    } catch (error) {
      console.error('[Gemini] Connection check failed:', error)
      return false
    }
  }

  /**
   * 处理 API 错误
   */
  private handleError(error: any): Error {
    console.error('[Gemini] API Error:', error)

    if (error.response?.data?.error) {
      const apiError = error.response.data.error
      const message = apiError.message || ''

      // 映射常见 Gemini 错误到用户友好的消息
      if (message.includes('quota')) {
        return new Error('API 调用次数超限,请稍后重试')
      } else if (message.includes('invalid') || message.includes('Invalid')) {
        return new Error('照片格式不正确或包含不当内容')
      } else if (message.includes('API key')) {
        return new Error('API 密钥无效,请检查配置')
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
