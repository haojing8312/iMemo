/**
 * 简化版提示词生成器测试
 * 用于快速验证核心功能
 */

import { describe, it, expect } from 'vitest'

describe('简单导入测试', () => {
  it('应该能够导入配置文件', async () => {
    // 测试导入 milestone-prompt-params
    const { getMilestonePromptParams } = await import('../src/config/milestone-prompt-params')

    const params = getMilestonePromptParams('100-day')

    expect(params).toBeDefined()
    expect(params.SCENE_TYPE).toBe('百日纪念')
    expect(params.SUBJECT_TYPE).toBe('百天宝宝')
    expect(params.AGE_DESC).toBe('3-4个月大婴儿')
  })

  it('应该能够导入提示词生成器', async () => {
    const { generatePrompt } = await import('../src/lib/promptGenerator')

    expect(typeof generatePrompt).toBe('function')
  })
})
