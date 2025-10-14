/**
 * 通用提示词生成器
 * 负责将风格模板与里程碑参数动态结合,生成完整的提示词
 *
 * 创建日期: 2025-10-14
 * 版本: 1.0.0
 */

import { realisticStudioStyles } from '@/config/styles-realistic-studio'
import { getMilestonePromptParams, type MilestonePromptParams } from '@/config/milestone-prompt-params'

/**
 * 提示词生成参数接口
 */
export interface GeneratePromptParams {
  /** 风格ID (如 "cozy-home-warm-light") */
  styleId: string
  /** 里程碑ID (如 "100-day", "wedding") */
  milestoneId: string
  /** 是否返回调试信息 (默认 false) */
  debug?: boolean
}

/**
 * 提示词生成结果接口
 */
export interface GeneratePromptResult {
  /** 生成的完整提示词 */
  prompt: string
  /** 使用的风格ID */
  styleId: string
  /** 使用的里程碑ID */
  milestoneId: string
  /** 风格名称 */
  styleName: string
  /** 里程碑场景类型 */
  sceneType: string
  /** 是否成功生成 */
  success: boolean
  /** 错误信息(如果失败) */
  error?: string
  /** 调试信息:变量替换记录 */
  replacements?: Record<string, string>
}

/**
 * 批量生成结果接口
 */
export interface BatchGenerateResult {
  /** 成功生成的数量 */
  successCount: number
  /** 失败的数量 */
  failureCount: number
  /** 所有生成结果 */
  results: GeneratePromptResult[]
}

/**
 * 核心函数:生成单个提示词
 *
 * @param params 生成参数
 * @returns 生成结果
 *
 * @example
 * ```typescript
 * const result = generatePrompt({
 *   styleId: 'cozy-home-warm-light',
 *   milestoneId: '100-day',
 *   debug: true
 * })
 *
 * if (result.success) {
 *   console.log(result.prompt)
 *   console.log(result.replacements) // 查看变量替换详情
 * }
 * ```
 */
export function generatePrompt(params: GeneratePromptParams): GeneratePromptResult {
  const { styleId, milestoneId, debug = false } = params

  // 1. 验证并获取风格配置
  const style = realisticStudioStyles.styles.find(s => s.id === styleId)

  if (!style) {
    return {
      prompt: '',
      styleId,
      milestoneId,
      styleName: '',
      sceneType: '',
      success: false,
      error: `未找到风格配置: ${styleId}`
    }
  }

  // 2. 验证并获取里程碑参数
  const milestoneParams = getMilestonePromptParams(milestoneId)

  // 3. 准备变量替换映射表
  const replacements: Record<string, string> = {
    '{SCENE_TYPE}': milestoneParams.SCENE_TYPE,
    '{SUBJECT_TYPE}': milestoneParams.SUBJECT_TYPE,
    '{AGE_DESC}': milestoneParams.AGE_DESC,
    '{EXPRESSION}': milestoneParams.EXPRESSION,
  }

  // 4. 处理可选变量 (CLOTHING 和 PROPS)
  // 如果里程碑参数中提供了这些值,则替换;否则保留模板中的原始描述
  if (milestoneParams.CLOTHING) {
    replacements['{CLOTHING}'] = milestoneParams.CLOTHING
  }

  if (milestoneParams.PROPS) {
    replacements['{PROPS}'] = milestoneParams.PROPS
  }

  // 5. 执行变量替换
  let finalPrompt = style.promptTemplate

  for (const [variable, value] of Object.entries(replacements)) {
    // 使用全局替换,支持模板中多次出现同一变量
    const regex = new RegExp(escapeRegex(variable), 'g')
    finalPrompt = finalPrompt.replace(regex, value)
  }

  // 6. 返回生成结果
  const result: GeneratePromptResult = {
    prompt: finalPrompt,
    styleId,
    milestoneId,
    styleName: style.name,
    sceneType: milestoneParams.SCENE_TYPE,
    success: true
  }

  if (debug) {
    result.replacements = replacements
  }

  return result
}

/**
 * 批量生成多个风格的提示词 (相同里程碑)
 *
 * @param styleIds 风格ID数组
 * @param milestoneId 里程碑ID
 * @param debug 是否返回调试信息
 * @returns 批量生成结果
 *
 * @example
 * ```typescript
 * const result = generateMultiplePrompts(
 *   ['cozy-home-warm-light', 'korean-minimalist', 'dreamy-soft-fairy-light'],
 *   'first-birthday'
 * )
 *
 * console.log(`成功: ${result.successCount}, 失败: ${result.failureCount}`)
 * result.results.forEach(r => {
 *   if (r.success) {
 *     console.log(`${r.styleName}: ${r.prompt.substring(0, 100)}...`)
 *   }
 * })
 * ```
 */
export function generateMultiplePrompts(
  styleIds: string[],
  milestoneId: string,
  debug = false
): BatchGenerateResult {
  const results: GeneratePromptResult[] = []
  let successCount = 0
  let failureCount = 0

  for (const styleId of styleIds) {
    const result = generatePrompt({ styleId, milestoneId, debug })

    results.push(result)

    if (result.success) {
      successCount++
    } else {
      failureCount++
    }
  }

  return {
    successCount,
    failureCount,
    results
  }
}

/**
 * 获取所有可用的风格ID列表
 *
 * @returns 风格ID数组
 */
export function getAllStyleIds(): string[] {
  return realisticStudioStyles.styles.map(s => s.id)
}

/**
 * 获取所有风格的完整信息 (用于UI展示)
 *
 * @returns 风格信息数组
 */
export function getAllStylesInfo() {
  return realisticStudioStyles.styles.map(style => ({
    id: style.id,
    name: style.name,
    category: style.category,
    description: style.description,
    tags: style.tags,
    previewImage: style.previewImage
  }))
}

/**
 * 验证风格ID是否存在
 *
 * @param styleId 风格ID
 * @returns 是否存在
 */
export function isValidStyleId(styleId: string): boolean {
  return realisticStudioStyles.styles.some(s => s.id === styleId)
}

/**
 * 辅助函数:转义正则表达式特殊字符
 *
 * @param str 原始字符串
 * @returns 转义后的字符串
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 获取提示词中使用的所有变量
 * 用于调试和验证模板完整性
 *
 * @param promptTemplate 提示词模板
 * @returns 变量数组
 */
export function extractVariables(promptTemplate: string): string[] {
  const regex = /\{[A-Z_]+\}/g
  const matches = promptTemplate.match(regex)

  if (!matches) {
    return []
  }

  // 去重
  return Array.from(new Set(matches))
}

/**
 * 验证模板中的所有变量是否都有对应的里程碑参数
 *
 * @param styleId 风格ID
 * @param milestoneId 里程碑ID
 * @returns 验证结果
 */
export function validatePromptVariables(
  styleId: string,
  milestoneId: string
): {
  valid: boolean
  missingVariables: string[]
  availableVariables: string[]
} {
  const style = realisticStudioStyles.styles.find(s => s.id === styleId)

  if (!style) {
    return {
      valid: false,
      missingVariables: [],
      availableVariables: []
    }
  }

  const milestoneParams = getMilestonePromptParams(milestoneId)

  // 提取模板中的变量
  const templateVariables = extractVariables(style.promptTemplate)

  // 可用的变量
  const availableVariables = [
    '{SCENE_TYPE}',
    '{SUBJECT_TYPE}',
    '{AGE_DESC}',
    '{EXPRESSION}',
    '{CLOTHING}', // 可选
    '{PROPS}'     // 可选
  ]

  // 检查缺失的必需变量
  const missingVariables = templateVariables.filter(v => {
    // CLOTHING 和 PROPS 是可选的,不算缺失
    if (v === '{CLOTHING}' || v === '{PROPS}') {
      return false
    }
    return !availableVariables.includes(v)
  })

  return {
    valid: missingVariables.length === 0,
    missingVariables,
    availableVariables
  }
}
