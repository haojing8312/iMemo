/**
 * 多风格生成器集成测试
 * 测试新的提示词生成系统与多风格生成器的集成
 *
 * 创建日期: 2025-10-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMultiStyle, type MultiStyleGenerationParams } from '../src/lib/multiStyleGenerator'
import { getAllStyleIds } from '../src/lib/promptGenerator'
import { realisticStudioStyles } from '../src/config/styles-realistic-studio'

// Mock generateImages API
vi.mock('../src/lib/api', () => ({
  generateImages: vi.fn(async () => ({
    images: [
      {
        url: 'https://example.com/generated-image.jpg',
        id: crypto.randomUUID()
      }
    ]
  }))
}))

describe('MultiStyleGenerator 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能测试', () => {
    it('应该能够为百日照生成多个风格的图片', async () => {
      const styles = realisticStudioStyles.styles.slice(0, 3) // 前3个风格

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: '100-day',
        imagesPerStyle: 2
      }

      const result = await generateMultiStyle(params)

      expect(result.success).toBe(true)
      expect(result.totalStyles).toBe(3)
      expect(result.completedStyles).toBe(3)
      expect(result.failedStyleIds).toHaveLength(0)
      expect(result.results.length).toBe(6) // 3 styles × 2 images
    }, 30000)

    it('应该能够为婚礼照生成图片', async () => {
      const styles = realisticStudioStyles.styles.slice(0, 2)

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/wedding-photo.jpg',
        styles,
        milestoneId: 'wedding',
        imagesPerStyle: 1
      }

      const result = await generateMultiStyle(params)

      expect(result.success).toBe(true)
      expect(result.completedStyles).toBe(2)
      expect(result.results.length).toBe(2)
    }, 30000)

    it('应该能够为退休照生成图片', async () => {
      const styles = realisticStudioStyles.styles.slice(0, 2)

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/retirement-photo.jpg',
        styles,
        milestoneId: 'retirement',
        imagesPerStyle: 1
      }

      const result = await generateMultiStyle(params)

      expect(result.success).toBe(true)
      expect(result.results.length).toBe(2)
    }, 30000)
  })

  describe('进度回调测试', () => {
    it('应该正确触发进度回调', async () => {
      const progressUpdates: Array<{ current: number; total: number }> = []

      const styles = realisticStudioStyles.styles.slice(0, 2)

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: '100-day',
        imagesPerStyle: 2,
        onProgress: (current, total) => {
          progressUpdates.push({ current, total })
        }
      }

      await generateMultiStyle(params)

      expect(progressUpdates.length).toBe(4) // 2 styles × 2 images
      expect(progressUpdates[0]).toEqual({ current: 1, total: 4 })
      expect(progressUpdates[3]).toEqual({ current: 4, total: 4 })
    }, 30000)

    it('应该正确触发风格完成回调', async () => {
      const completedStyles: string[] = []

      const styles = realisticStudioStyles.styles.slice(0, 2)

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: 'first-birthday',
        imagesPerStyle: 1,
        onStyleComplete: (styleId, styleName) => {
          completedStyles.push(styleId)
        }
      }

      await generateMultiStyle(params)

      expect(completedStyles.length).toBe(2)
      expect(completedStyles).toContain(styles[0].id)
      expect(completedStyles).toContain(styles[1].id)
    }, 30000)
  })

  describe('提示词生成验证', () => {
    it('生成的提示词应该包含里程碑特定的描述', async () => {
      const styles = [realisticStudioStyles.styles[0]]

      // 百日照
      const params1: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: '100-day',
        imagesPerStyle: 1
      }

      const result1 = await generateMultiStyle(params1)
      expect(result1.results[0].prompt).toContain('3-4个月大婴儿')

      // 婚礼
      const params2: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: 'wedding',
        imagesPerStyle: 1
      }

      const result2 = await generateMultiStyle(params2)
      expect(result2.results[0].prompt).toContain('成年新婚夫妇')
    }, 30000)

    it('生成的提示词不应包含变量占位符', async () => {
      const styles = realisticStudioStyles.styles.slice(0, 3)

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: '100-day',
        imagesPerStyle: 1
      }

      const result = await generateMultiStyle(params)

      result.results.forEach(r => {
        expect(r.prompt).not.toContain('{SCENE_TYPE}')
        expect(r.prompt).not.toContain('{SUBJECT_TYPE}')
        expect(r.prompt).not.toContain('{AGE_DESC}')
        expect(r.prompt).not.toContain('{EXPRESSION}')
        expect(r.prompt).not.toContain('{CLOTHING}')
        expect(r.prompt).not.toContain('{PROPS}')
      })
    }, 30000)
  })

  describe('跨里程碑兼容性测试', () => {
    it('同一风格应该能够用于不同里程碑', async () => {
      const style = [realisticStudioStyles.styles[0]]
      const milestones = ['100-day', 'first-birthday', 'wedding', 'retirement']

      for (const milestoneId of milestones) {
        const params: MultiStyleGenerationParams = {
          photoPath: '/test/photo.jpg',
          styles: style,
          milestoneId,
          imagesPerStyle: 1
        }

        const result = await generateMultiStyle(params)

        expect(result.success).toBe(true)
        expect(result.completedStyles).toBe(1)
        expect(result.results.length).toBe(1)
      }
    }, 60000)
  })

  describe('错误处理测试', () => {
    it('应该处理无效的里程碑ID', async () => {
      const styles = [realisticStudioStyles.styles[0]]

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: 'invalid-milestone',
        imagesPerStyle: 1
      }

      const result = await generateMultiStyle(params)

      // 应该使用默认参数成功生成
      expect(result.success).toBe(true)
      expect(result.results.length).toBe(1)
    }, 30000)
  })

  describe('性能测试', () => {
    it('批量生成5个风格应该在合理时间内完成', async () => {
      const styles = realisticStudioStyles.styles.slice(0, 5)

      const startTime = Date.now()

      const params: MultiStyleGenerationParams = {
        photoPath: '/test/photo.jpg',
        styles,
        milestoneId: '100-day',
        imagesPerStyle: 1
      }

      const result = await generateMultiStyle(params)

      const duration = Date.now() - startTime

      expect(result.success).toBe(true)
      expect(result.completedStyles).toBe(5)
      expect(duration).toBeLessThan(10000) // 少于10秒 (因为是 mock)

      console.log(`批量生成5个风格耗时: ${duration}ms`)
    }, 30000)
  })
})
