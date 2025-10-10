// Image processing utilities using Sharp
// Based on FR-003, FR-004 requirements

import sharp from 'sharp'
import * as faceapi from 'face-api.js'
import type { ValidationResult, CropRatio } from './types'

// Face-API.js initialization flag
let faceApiInitialized = false

/**
 * Initialize face-api.js models (T019)
 * Must be called before face detection
 */
export async function initFaceDetection(): Promise<void> {
  if (faceApiInitialized) return

  try {
    // Load models from public directory
    const MODEL_URL = '/face-models'

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ])

    faceApiInitialized = true
    console.log('Face detection models loaded successfully')
  } catch (error) {
    console.error('Failed to load face detection models:', error)
    throw new Error('人脸检测模型加载失败')
  }
}

/**
 * Detect faces in image (FR-004)
 */
export async function detectFaces(imagePath: string): Promise<ValidationResult> {
  if (!faceApiInitialized) {
    await initFaceDetection()
  }

  try {
    // Convert image to buffer and create HTML Image element
    const imageBuffer = await sharp(imagePath).toBuffer()
    const base64 = imageBuffer.toString('base64')
    const img = new Image()
    img.src = `data:image/jpeg;base64,${base64}`

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    // Detect faces
    const detections = await faceapi.detectAllFaces(
      img,
      new faceapi.TinyFaceDetectorOptions()
    )

    if (detections.length === 0) {
      return {
        isValid: false,
        error: '未检测到人脸,请确保宝宝面部清晰可见',
      }
    }

    return {
      isValid: true,
    }
  } catch (error) {
    console.error('Face detection error:', error)
    return {
      isValid: false,
      error: '人脸检测失败,请重试',
    }
  }
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imagePath: string): Promise<{
  width: number
  height: number
  format: string
  size: number
}> {
  const metadata = await sharp(imagePath).metadata()
  const stats = await sharp(imagePath).stats()

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: stats.size || 0,
  }
}

/**
 * Crop image based on parameters (FR-003)
 */
export async function cropImage(
  inputPath: string,
  outputPath: string,
  cropParams: {
    x: number // 0-1
    y: number // 0-1
    width: number // 0-1
    height: number // 0-1
  }
): Promise<void> {
  const metadata = await sharp(inputPath).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('无法读取图片尺寸')
  }

  // Convert proportions to pixels
  const left = Math.round(cropParams.x * metadata.width)
  const top = Math.round(cropParams.y * metadata.height)
  const width = Math.round(cropParams.width * metadata.width)
  const height = Math.round(cropParams.height * metadata.height)

  await sharp(inputPath)
    .extract({ left, top, width, height })
    .toFile(outputPath)
}

/**
 * Get crop dimensions for a given aspect ratio
 */
export function getCropDimensionsForRatio(
  imageWidth: number,
  imageHeight: number,
  ratio: CropRatio
): {
  width: number
  height: number
  x: number
  y: number
} {
  let targetWidth: number
  let targetHeight: number

  switch (ratio) {
    case '1:1':
      // Square crop - use minimum dimension
      targetWidth = targetHeight = Math.min(imageWidth, imageHeight)
      break
    case '3:4':
      // Portrait crop
      targetHeight = imageHeight
      targetWidth = (targetHeight * 3) / 4
      if (targetWidth > imageWidth) {
        targetWidth = imageWidth
        targetHeight = (targetWidth * 4) / 3
      }
      break
    case '4:3':
      // Landscape crop
      targetWidth = imageWidth
      targetHeight = (targetWidth * 3) / 4
      if (targetHeight > imageHeight) {
        targetHeight = imageHeight
        targetWidth = (targetHeight * 4) / 3
      }
      break
  }

  // Center crop
  const x = (imageWidth - targetWidth) / 2
  const y = (imageHeight - targetHeight) / 2

  return {
    width: targetWidth,
    height: targetHeight,
    x,
    y,
  }
}

/**
 * Resize image while maintaining aspect ratio
 */
export async function resizeImage(
  inputPath: string,
  outputPath: string,
  maxWidth: number,
  maxHeight: number
): Promise<void> {
  await sharp(inputPath)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFile(outputPath)
}

/**
 * Check image quality (basic blur detection)
 */
export async function checkImageQuality(imagePath: string): Promise<ValidationResult> {
  try {
    const stats = await sharp(imagePath).stats()

    // Simple sharpness check based on standard deviation
    // Higher stdDev generally indicates sharper images
    const avgStdDev =
      stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length

    // Threshold: images with avgStdDev < 30 are likely blurred
    if (avgStdDev < 30) {
      return {
        isValid: false,
        error: '照片模糊,建议重新拍摄清晰照片',
      }
    }

    return {
      isValid: true,
    }
  } catch (error) {
    console.error('Quality check error:', error)
    return {
      isValid: false,
      error: '照片质量检测失败',
    }
  }
}
