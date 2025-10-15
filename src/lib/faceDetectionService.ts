/**
 * 人脸检测服务 (T013 - 003-2)
 * 使用 face-api.js 进行客户端人脸检测
 * @see specs/003-2/contracts/photo-validation-api.md
 */

import * as faceapi from 'face-api.js'
import { convertFileSrc } from '@tauri-apps/api/core'
import type { FaceValidationResult } from './types'

let modelsLoaded = false
let loadingPromise: Promise<void> | null = null

/**
 * 加载 face-api.js 模型文件 (T015)
 * 应用启动时调用一次
 */
export async function loadFaceDetectionModels(): Promise<void> {
  if (modelsLoaded) {
    console.log('[FaceDetection] Models already loaded')
    return
  }

  // 如果正在加载,返回相同的 Promise
  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      console.log('[FaceDetection] Loading models from /face-models/')

      const MODEL_URL = '/face-models'

      // 加载 TinyFaceDetector 模型 (轻量级,速度快)
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      console.log('[FaceDetection] ✓ TinyFaceDetector loaded')

      // 加载 FaceLandmark68Net 模型 (用于更精确的人脸特征检测)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      console.log('[FaceDetection] ✓ FaceLandmark68Net loaded')

      modelsLoaded = true
      console.log('[FaceDetection] All models loaded successfully')
    } catch (error) {
      console.error('[FaceDetection] Failed to load models:', error)
      throw new Error(`人脸检测模型加载失败: ${error}`)
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}

/**
 * 验证单人照片 (T013)
 * 检测照片中的人脸数量,确保符合要求
 *
 * @param filePath Tauri 文件路径
 * @returns 验证结果,包含是否有效、人脸数量、置信度等
 */
export async function validateSinglePersonPhoto(
  filePath: string
): Promise<FaceValidationResult> {
  const startTime = Date.now()

  try {
    // 确保模型已加载
    if (!modelsLoaded) {
      await loadFaceDetectionModels()
    }

    // 转换 Tauri 文件路径为可访问的 URL
    const imageSrc = convertFileSrc(filePath)
    console.log('[FaceDetection] Validating photo:', filePath)

    // 加载图片
    const img = await loadImage(imageSrc)

    // 配置检测选项
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,      // 输入尺寸,越大越精确但越慢
      scoreThreshold: 0.5  // 置信度阈值,低于此值的检测结果会被过滤
    })

    // 执行人脸检测
    const detections = await faceapi.detectAllFaces(img, options)

    const faceCount = detections.length
    const elapsedTime = Date.now() - startTime

    console.log(`[FaceDetection] Detected ${faceCount} face(s) in ${elapsedTime}ms`)

    // 验证逻辑
    if (faceCount === 0) {
      return {
        isValid: false,
        faceCount: 0,
        timestamp: Date.now(),
        error: '未检测到人脸,请上传包含清晰人脸的照片'
      }
    }

    if (faceCount > 1) {
      return {
        isValid: false,
        faceCount,
        timestamp: Date.now(),
        error: `检测到 ${faceCount} 张人脸,单人模式只能包含1人,请重新选择照片`
      }
    }

    // 单人照片,验证通过
    const confidence = detections[0].score
    return {
      isValid: true,
      faceCount: 1,
      confidence,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('[FaceDetection] Validation error:', error)
    return {
      isValid: false,
      faceCount: 0,
      timestamp: Date.now(),
      error: `人脸检测失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 验证多人照片 (T013)
 * 检测照片是否至少包含1张人脸
 */
export async function validateMultiPersonPhoto(
  filePath: string
): Promise<FaceValidationResult> {
  const startTime = Date.now()

  try {
    if (!modelsLoaded) {
      await loadFaceDetectionModels()
    }

    const imageSrc = convertFileSrc(filePath)
    const img = await loadImage(imageSrc)

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.5
    })

    const detections = await faceapi.detectAllFaces(img, options)
    const faceCount = detections.length
    const elapsedTime = Date.now() - startTime

    console.log(`[FaceDetection] Multi-person: detected ${faceCount} face(s) in ${elapsedTime}ms`)

    if (faceCount === 0) {
      return {
        isValid: false,
        faceCount: 0,
        timestamp: Date.now(),
        error: '未检测到人脸,请上传包含清晰人脸的照片'
      }
    }

    // 多人模式:至少1人即可
    const confidence = detections.map(d => d.score).reduce((a, b) => Math.max(a, b), 0)
    return {
      isValid: true,
      faceCount,
      confidence,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('[FaceDetection] Multi-person validation error:', error)
    return {
      isValid: false,
      faceCount: 0,
      timestamp: Date.now(),
      error: `人脸检测失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

/**
 * 批量验证照片 (用于上传多张照片时)
 */
export async function validatePhotoBatch(
  filePaths: string[],
  mode: 'single' | 'multi'
): Promise<Map<string, FaceValidationResult>> {
  const results = new Map<string, FaceValidationResult>()

  for (const filePath of filePaths) {
    const result = mode === 'single'
      ? await validateSinglePersonPhoto(filePath)
      : await validateMultiPersonPhoto(filePath)

    results.set(filePath, result)
  }

  return results
}

/**
 * 辅助函数:加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = (err) => reject(new Error(`图片加载失败: ${src}`))

    img.src = src
  })
}

/**
 * 检查模型是否已加载
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded
}
