// Photo validation logic
// Based on FR-004 requirements from spec.md

import type { ValidationResult, PhotoUpload } from './types'

export class PhotoValidator {
  static readonly MIN_RESOLUTION = 512
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  static readonly ALLOWED_FORMATS = ['JPG', 'PNG', 'JPEG']

  /**
   * Validate photo meets all requirements
   */
  static validate(photo: Partial<PhotoUpload>): ValidationResult {
    // Resolution check
    if (!photo.width || !photo.height) {
      return {
        isValid: false,
        error: '无法读取照片尺寸',
      }
    }

    if (photo.width < this.MIN_RESOLUTION || photo.height < this.MIN_RESOLUTION) {
      return {
        isValid: false,
        error: `照片分辨率不足,需≥${this.MIN_RESOLUTION}x${this.MIN_RESOLUTION}px`,
      }
    }

    // File size check
    if (!photo.fileSize) {
      return {
        isValid: false,
        error: '无法读取文件大小',
      }
    }

    if (photo.fileSize > this.MAX_FILE_SIZE) {
      const sizeMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
      return {
        isValid: false,
        error: `照片大小超过${sizeMB}MB限制`,
      }
    }

    // Format check
    if (!photo.format) {
      return {
        isValid: false,
        error: '无法识别文件格式',
      }
    }

    const formatUpper = photo.format.toUpperCase()
    if (!this.ALLOWED_FORMATS.includes(formatUpper)) {
      return {
        isValid: false,
        error: '仅支持JPG和PNG格式',
      }
    }

    return {
      isValid: true,
    }
  }

  /**
   * Validate file extension
   */
  static isValidExtension(filename: string): boolean {
    const ext = filename.split('.').pop()?.toUpperCase()
    return ext ? this.ALLOWED_FORMATS.includes(ext) : false
  }

  /**
   * Get photo format from filename
   */
  static getFormatFromFilename(filename: string): 'JPG' | 'PNG' | null {
    const ext = filename.split('.').pop()?.toUpperCase()
    if (ext === 'JPG' || ext === 'JPEG') return 'JPG'
    if (ext === 'PNG') return 'PNG'
    return null
  }
}

/**
 * Generation task validation
 */
export class TaskValidator {
  static readonly MIN_PHOTOS = 1
  static readonly MAX_PHOTOS = 5
  static readonly MIN_STYLES = 1
  static readonly MAX_STYLES = 3

  /**
   * Validate generation task parameters
   */
  static validate(
    photoIds: string[],
    selectedStyleIds: string[]
  ): ValidationResult {
    if (photoIds.length < this.MIN_PHOTOS || photoIds.length > this.MAX_PHOTOS) {
      return {
        isValid: false,
        error: `请上传${this.MIN_PHOTOS}-${this.MAX_PHOTOS}张照片`,
      }
    }

    if (
      selectedStyleIds.length < this.MIN_STYLES ||
      selectedStyleIds.length > this.MAX_STYLES
    ) {
      return {
        isValid: false,
        error: `请选择${this.MIN_STYLES}-${this.MAX_STYLES}种风格`,
      }
    }

    return {
      isValid: true,
    }
  }
}
