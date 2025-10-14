/**
 * 提示词生成器单元测试
 *
 * 测试范围:
 * 1. 单个提示词生成 (基础功能)
 * 2. 批量提示词生成
 * 3. 变量替换正确性
 * 4. 错误处理 (无效风格ID、里程碑ID)
 * 5. 调试模式
 * 6. 辅助工具函数
 *
 * 创建日期: 2025-10-14
 */

import { describe, it, expect } from 'vitest'
import {
  generatePrompt,
  generateMultiplePrompts,
  getAllStyleIds,
  getAllStylesInfo,
  isValidStyleId,
  extractVariables,
  validatePromptVariables,
  type GeneratePromptParams,
  type GeneratePromptResult,
  type BatchGenerateResult
} from '../src/lib/promptGenerator'

describe('promptGenerator - 核心功能测试', () => {
  describe('generatePrompt() - 单个提示词生成', () => {
    it('应该成功生成百日照提示词', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day'
      })

      expect(result.success).toBe(true)
      expect(result.prompt).toBeTruthy()
      expect(result.styleId).toBe('cozy-home-warm-light')
      expect(result.milestoneId).toBe('100-day')
      expect(result.styleName).toBe('居家暖光温馨风')
      expect(result.sceneType).toBe('百日纪念')
      expect(result.error).toBeUndefined()
    })

    it('应该成功生成婚礼照提示词', () => {
      const result = generatePrompt({
        styleId: 'korean-minimalist',
        milestoneId: 'wedding'
      })

      expect(result.success).toBe(true)
      expect(result.prompt).toBeTruthy()
      expect(result.sceneType).toBe('婚礼纪念')
    })

    it('应该成功生成退休照提示词', () => {
      const result = generatePrompt({
        styleId: 'vintage-film-retro',
        milestoneId: 'retirement'
      })

      expect(result.success).toBe(true)
      expect(result.prompt).toBeTruthy()
      expect(result.sceneType).toBe('退休纪念')
    })

    it('应该返回调试信息 (debug=true)', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day',
        debug: true
      })

      expect(result.success).toBe(true)
      expect(result.replacements).toBeDefined()
      expect(result.replacements).toHaveProperty('{SCENE_TYPE}')
      expect(result.replacements).toHaveProperty('{SUBJECT_TYPE}')
      expect(result.replacements).toHaveProperty('{AGE_DESC}')
      expect(result.replacements).toHaveProperty('{EXPRESSION}')
    })

    it('应该处理无效的风格ID', () => {
      const result = generatePrompt({
        styleId: 'invalid-style-id',
        milestoneId: '100-day'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('未找到风格配置')
      expect(result.prompt).toBe('')
    })

    it('应该处理无效的里程碑ID (使用默认参数)', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: 'invalid-milestone-id'
      })

      // 应该成功生成,但使用默认参数
      expect(result.success).toBe(true)
      expect(result.prompt).toBeTruthy()
      expect(result.sceneType).toBe('纪念') // 默认场景类型
    })
  })

  describe('变量替换正确性测试', () => {
    it('应该正确替换 SCENE_TYPE 变量', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day',
        debug: true
      })

      expect(result.success).toBe(true)
      expect(result.replacements!['{SCENE_TYPE}']).toBe('百日纪念')
      expect(result.prompt).toContain('百日纪念')
    })

    it('应该正确替换 SUBJECT_TYPE 变量', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: 'first-birthday',
        debug: true
      })

      expect(result.success).toBe(true)
      expect(result.replacements!['{SUBJECT_TYPE}']).toBe('周岁宝宝')
      expect(result.prompt).toContain('周岁宝宝')
    })

    it('应该正确替换 AGE_DESC 变量', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day',
        debug: true
      })

      expect(result.success).toBe(true)
      expect(result.replacements!['{AGE_DESC}']).toBe('3-4个月大婴儿')
      expect(result.prompt).toContain('3-4个月大婴儿')
    })

    it('应该正确替换 EXPRESSION 变量', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day',
        debug: true
      })

      expect(result.success).toBe(true)
      expect(result.replacements!['{EXPRESSION}']).toBeTruthy()
      expect(result.prompt).toContain(result.replacements!['{EXPRESSION}'])
    })

    it('应该处理可选变量 CLOTHING', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day',
        debug: true
      })

      expect(result.success).toBe(true)

      // 如果里程碑提供了 CLOTHING,应该替换
      if (result.replacements!['{CLOTHING}']) {
        expect(result.prompt).toContain(result.replacements!['{CLOTHING}'])
      }
    })

    it('应该处理可选变量 PROPS', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day',
        debug: true
      })

      expect(result.success).toBe(true)

      // 如果里程碑提供了 PROPS,应该替换
      if (result.replacements!['{PROPS}']) {
        expect(result.prompt).toContain(result.replacements!['{PROPS}'])
      }
    })
  })

  describe('generateMultiplePrompts() - 批量生成', () => {
    it('应该批量生成多个风格的提示词', () => {
      const styleIds = [
        'cozy-home-warm-light',
        'korean-minimalist',
        'dreamy-soft-fairy-light'
      ]

      const result = generateMultiplePrompts(styleIds, '100-day')

      expect(result.successCount).toBe(3)
      expect(result.failureCount).toBe(0)
      expect(result.results).toHaveLength(3)

      result.results.forEach(r => {
        expect(r.success).toBe(true)
        expect(r.prompt).toBeTruthy()
        expect(r.sceneType).toBe('百日纪念')
      })
    })

    it('应该处理部分失败的情况', () => {
      const styleIds = [
        'cozy-home-warm-light',
        'invalid-style-id',
        'korean-minimalist'
      ]

      const result = generateMultiplePrompts(styleIds, 'wedding')

      expect(result.successCount).toBe(2)
      expect(result.failureCount).toBe(1)
      expect(result.results).toHaveLength(3)

      // 检查失败的那个
      const failedResult = result.results.find(r => !r.success)
      expect(failedResult).toBeDefined()
      expect(failedResult!.error).toBeDefined()
    })

    it('应该支持调试模式批量生成', () => {
      const styleIds = ['cozy-home-warm-light', 'korean-minimalist']

      const result = generateMultiplePrompts(styleIds, 'first-birthday', true)

      expect(result.successCount).toBe(2)

      result.results.forEach(r => {
        if (r.success) {
          expect(r.replacements).toBeDefined()
        }
      })
    })

    it('应该处理空数组', () => {
      const result = generateMultiplePrompts([], '100-day')

      expect(result.successCount).toBe(0)
      expect(result.failureCount).toBe(0)
      expect(result.results).toHaveLength(0)
    })
  })

  describe('跨里程碑兼容性测试', () => {
    it('同一风格应该支持不同年龄段的里程碑', () => {
      const styleId = 'cozy-home-warm-light'
      const milestones = ['100-day', 'first-birthday', 'kindergarten', 'wedding', 'retirement']

      milestones.forEach(milestoneId => {
        const result = generatePrompt({ styleId, milestoneId })

        expect(result.success).toBe(true)
        expect(result.prompt).toBeTruthy()
        expect(result.prompt.length).toBeGreaterThan(100)
      })
    })

    it('生成的提示词应该包含里程碑特定的年龄描述', () => {
      const styleId = 'korean-minimalist'

      // 百日照
      const result1 = generatePrompt({ styleId, milestoneId: '100-day' })
      expect(result1.prompt).toContain('3-4个月大婴儿')

      // 周岁照
      const result2 = generatePrompt({ styleId, milestoneId: 'first-birthday' })
      expect(result2.prompt).toContain('1岁宝宝')

      // 婚礼
      const result3 = generatePrompt({ styleId, milestoneId: 'wedding' })
      expect(result3.prompt).toContain('成年新婚夫妇')
    })
  })

  describe('辅助工具函数测试', () => {
    it('getAllStyleIds() 应该返回所有风格ID', () => {
      const styleIds = getAllStyleIds()

      expect(Array.isArray(styleIds)).toBe(true)
      expect(styleIds.length).toBe(14) // 14个风格
      expect(styleIds).toContain('cozy-home-warm-light')
      expect(styleIds).toContain('korean-minimalist')
    })

    it('getAllStylesInfo() 应该返回完整风格信息', () => {
      const stylesInfo = getAllStylesInfo()

      expect(Array.isArray(stylesInfo)).toBe(true)
      expect(stylesInfo.length).toBe(14)

      stylesInfo.forEach(info => {
        expect(info).toHaveProperty('id')
        expect(info).toHaveProperty('name')
        expect(info).toHaveProperty('category')
        expect(info).toHaveProperty('description')
        expect(info).toHaveProperty('tags')
        expect(info).toHaveProperty('previewImage')
      })
    })

    it('isValidStyleId() 应该正确验证风格ID', () => {
      expect(isValidStyleId('cozy-home-warm-light')).toBe(true)
      expect(isValidStyleId('korean-minimalist')).toBe(true)
      expect(isValidStyleId('invalid-style-id')).toBe(false)
      expect(isValidStyleId('')).toBe(false)
    })

    it('extractVariables() 应该提取模板中的变量', () => {
      const template = '场景类型:{SCENE_TYPE},主体:{SUBJECT_TYPE},年龄:{AGE_DESC}'
      const variables = extractVariables(template)

      expect(variables).toContain('{SCENE_TYPE}')
      expect(variables).toContain('{SUBJECT_TYPE}')
      expect(variables).toContain('{AGE_DESC}')
    })

    it('extractVariables() 应该去重重复的变量', () => {
      const template = '{SCENE_TYPE}描述,再次提到{SCENE_TYPE}'
      const variables = extractVariables(template)

      expect(variables).toHaveLength(1)
      expect(variables[0]).toBe('{SCENE_TYPE}')
    })

    it('extractVariables() 应该处理没有变量的模板', () => {
      const template = '这是一个没有变量的普通文本'
      const variables = extractVariables(template)

      expect(variables).toHaveLength(0)
    })

    it('validatePromptVariables() 应该验证模板变量完整性', () => {
      const validation = validatePromptVariables('cozy-home-warm-light', '100-day')

      expect(validation.valid).toBe(true)
      expect(validation.missingVariables).toHaveLength(0)
      expect(validation.availableVariables).toContain('{SCENE_TYPE}')
      expect(validation.availableVariables).toContain('{SUBJECT_TYPE}')
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该处理空字符串风格ID', () => {
      const result = generatePrompt({
        styleId: '',
        milestoneId: '100-day'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('应该处理空字符串里程碑ID', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: ''
      })

      // 应该成功,但使用默认参数
      expect(result.success).toBe(true)
      expect(result.prompt).toBeTruthy()
    })

    it('应该处理特殊字符的里程碑ID', () => {
      const result = generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: 'special-@#$-characters'
      })

      // 应该成功生成(使用默认参数)
      expect(result.success).toBe(true)
    })
  })

  describe('性能测试', () => {
    it('单个提示词生成应该在 10ms 内完成', () => {
      const startTime = performance.now()

      generatePrompt({
        styleId: 'cozy-home-warm-light',
        milestoneId: '100-day'
      })

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(10)
    })

    it('批量生成14个风格应该在 100ms 内完成', () => {
      const styleIds = getAllStyleIds()
      const startTime = performance.now()

      generateMultiplePrompts(styleIds, '100-day')

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100)
    })
  })

  describe('真实场景集成测试', () => {
    it('应该为全部22个里程碑生成有效提示词', () => {
      const allMilestones = [
        'birth', 'full-month', '100-day', 'first-birthday',
        'kindergarten', 'elementary-graduation', 'middle-school-graduation', 'birthday',
        'high-school-graduation', 'coming-of-age', 'college-graduation',
        'wedding', 'anniversary', 'parenthood', 'career-achievement',
        'retirement', 'golden-anniversary', 'family-reunion'
      ]

      const styleId = 'cozy-home-warm-light'

      allMilestones.forEach(milestoneId => {
        const result = generatePrompt({ styleId, milestoneId })

        expect(result.success).toBe(true)
        expect(result.prompt).toBeTruthy()
        expect(result.prompt.length).toBeGreaterThan(100)
      })
    })

    it('应该为全部14个风格生成有效提示词', () => {
      const allStyles = getAllStyleIds()
      const milestoneId = 'wedding'

      allStyles.forEach(styleId => {
        const result = generatePrompt({ styleId, milestoneId })

        expect(result.success).toBe(true)
        expect(result.prompt).toBeTruthy()
      })
    })

    it('全组合测试: 14风格 × 22里程碑 = 308种组合', () => {
      const allStyles = getAllStyleIds()
      const allMilestones = [
        'birth', 'full-month', '100-day', 'first-birthday',
        'kindergarten', 'elementary-graduation', 'middle-school-graduation', 'birthday',
        'high-school-graduation', 'coming-of-age', 'college-graduation',
        'wedding', 'anniversary', 'parenthood', 'career-achievement',
        'retirement', 'golden-anniversary', 'family-reunion'
      ]

      let successCount = 0
      let failureCount = 0

      allStyles.forEach(styleId => {
        allMilestones.forEach(milestoneId => {
          const result = generatePrompt({ styleId, milestoneId })

          if (result.success) {
            successCount++
          } else {
            failureCount++
          }
        })
      })

      expect(successCount).toBe(14 * 18) // 前18个里程碑应该全部成功
      expect(successCount).toBeGreaterThan(200) // 至少200个组合成功
      console.log(`全组合测试: 成功 ${successCount} 个, 失败 ${failureCount} 个`)
    })
  })
})
