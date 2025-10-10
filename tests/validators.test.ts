import { describe, it, expect } from 'vitest'
import { PhotoValidator, TaskValidator } from '@/lib/validators'
import type { PhotoUpload } from '@/lib/types'

describe('PhotoValidator', () => {
  describe('validate', () => {
    it('应该接受有效的照片', () => {
      const validPhoto: Partial<PhotoUpload> = {
        width: 1024,
        height: 768,
        fileSize: 2 * 1024 * 1024, // 2MB
        format: 'JPG',
      }

      const result = PhotoValidator.validate(validPhoto)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该拒绝分辨率不足的照片', () => {
      const lowResPhoto: Partial<PhotoUpload> = {
        width: 400,
        height: 300,
        fileSize: 1 * 1024 * 1024,
        format: 'JPG',
      }

      const result = PhotoValidator.validate(lowResPhoto)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('分辨率不足')
    })

    it('应该拒绝文件过大的照片', () => {
      const largePhoto: Partial<PhotoUpload> = {
        width: 2048,
        height: 1536,
        fileSize: 15 * 1024 * 1024, // 15MB
        format: 'JPG',
      }

      const result = PhotoValidator.validate(largePhoto)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('超过')
    })

    it('应该拒绝不支持的格式', () => {
      const invalidFormatPhoto: Partial<PhotoUpload> = {
        width: 1024,
        height: 768,
        fileSize: 2 * 1024 * 1024,
        format: 'GIF' as any,
      }

      const result = PhotoValidator.validate(invalidFormatPhoto)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('仅支持')
    })
  })

  describe('getFormatFromFilename', () => {
    it('应该正确识别JPG格式', () => {
      expect(PhotoValidator.getFormatFromFilename('photo.jpg')).toBe('JPG')
      expect(PhotoValidator.getFormatFromFilename('photo.jpeg')).toBe('JPG')
      expect(PhotoValidator.getFormatFromFilename('PHOTO.JPG')).toBe('JPG')
    })

    it('应该正确识别PNG格式', () => {
      expect(PhotoValidator.getFormatFromFilename('photo.png')).toBe('PNG')
      expect(PhotoValidator.getFormatFromFilename('PHOTO.PNG')).toBe('PNG')
    })

    it('应该对不支持的格式返回null', () => {
      expect(PhotoValidator.getFormatFromFilename('photo.gif')).toBe(null)
      expect(PhotoValidator.getFormatFromFilename('photo.bmp')).toBe(null)
    })
  })
})

describe('TaskValidator', () => {
  describe('validate', () => {
    it('应该接受有效的任务参数', () => {
      const photoIds = ['photo1', 'photo2']
      const styleIds = ['style1']

      const result = TaskValidator.validate(photoIds, styleIds)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('应该拒绝照片数量过少', () => {
      const photoIds: string[] = []
      const styleIds = ['style1']

      const result = TaskValidator.validate(photoIds, styleIds)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('请上传')
    })

    it('应该拒绝照片数量过多', () => {
      const photoIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']
      const styleIds = ['style1']

      const result = TaskValidator.validate(photoIds, styleIds)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('请上传')
    })

    it('应该拒绝风格数量过多', () => {
      const photoIds = ['photo1']
      const styleIds = ['s1', 's2', 's3', 's4']

      const result = TaskValidator.validate(photoIds, styleIds)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('请选择')
    })

    it('应该接受最大允许数量', () => {
      const photoIds = ['p1', 'p2', 'p3', 'p4', 'p5']
      const styleIds = ['s1', 's2', 's3']

      const result = TaskValidator.validate(photoIds, styleIds)

      expect(result.isValid).toBe(true)
    })
  })
})
