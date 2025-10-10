// Browser-based image utilities
// Replaces Sharp for image processing in Tauri frontend

export interface ImageMetadata {
  width: number
  height: number
  aspectRatio: number
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Get image metadata from file path using browser Image API
 */
export async function getImageMetadata(filePath: string): Promise<ImageMetadata> {
  return new Promise(async (resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      })
    }

    img.onerror = (e) => {
      console.error('Failed to load image:', filePath, e)
      reject(new Error(`Failed to load image: ${filePath}`))
    }

    try {
      // Use Tauri's convertFileSrc to properly handle file paths
      const { convertFileSrc } = await import('@tauri-apps/api/core')
      img.src = convertFileSrc(filePath)
    } catch (error) {
      console.error('Error converting file path:', error)
      reject(error)
    }
  })
}

/**
 * Check if image quality is acceptable
 */
export async function checkImageQuality(filePath: string): Promise<ValidationResult> {
  try {
    const metadata = await getImageMetadata(filePath)

    // Check minimum resolution
    if (metadata.width < 512 || metadata.height < 512) {
      return {
        isValid: false,
        error: `图片分辨率过低: ${metadata.width}x${metadata.height}。最小要求: 512x512`,
      }
    }

    // Check maximum resolution (to prevent memory issues)
    if (metadata.width > 4096 || metadata.height > 4096) {
      return {
        isValid: false,
        error: `图片分辨率过高: ${metadata.width}x${metadata.height}。最大支持: 4096x4096`,
      }
    }

    // Check aspect ratio (should be reasonable for portraits)
    if (metadata.aspectRatio < 0.5 || metadata.aspectRatio > 2.0) {
      return {
        isValid: false,
        error: '图片宽高比异常,请使用接近方形的照片',
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: '无法读取图片信息',
    }
  }
}

/**
 * Detect faces in image using face-api.js
 * Note: face-api.js will be loaded separately
 */
export async function detectFaces(filePath: string): Promise<ValidationResult> {
  // TODO: Implement face detection using face-api.js
  // For now, just return valid to allow basic functionality
  return {
    isValid: true,
  }
}

/**
 * Get file size from file path
 */
export async function getFileSize(filePath: string): Promise<number> {
  // This needs to use Tauri fs plugin
  const { readFile } = await import('@tauri-apps/plugin-fs')
  const data = await readFile(filePath)
  return data.length
}
