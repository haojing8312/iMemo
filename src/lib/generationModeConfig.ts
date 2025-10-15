/**
 * 生成模式配置模块 (T007 - 003-2)
 * 定义单人/多人生成模式的规则和约束
 * @see specs/003-2/contracts/generation-mode-api.md
 */

import type { GenerationMode } from './types'

/** 模式配置 */
export interface ModeConfig {
  id: GenerationMode
  name: string
  description: string
  icon: string // Lucide icon name
  minPhotos: number
  maxPhotos: number
  /** 是否需要人脸检测 */
  requiresFaceDetection: boolean
  /** 检测规则：'exactly-one' 表示必须恰好1张人脸 */
  faceDetectionRule?: 'exactly-one' | 'at-least-one'
  /** 用户提示文案 */
  uploadHint: string
  /** 适用场景 */
  useCases: string[]
}

/** 生成模式配置列表 */
export const GENERATION_MODES: Record<GenerationMode, ModeConfig> = {
  single: {
    id: 'single',
    name: '单人照片生成',
    description: '使用同一个人的多张照片,生成不同风格的单人写真',
    icon: 'User',
    minPhotos: 1,
    maxPhotos: 10,
    requiresFaceDetection: true,
    faceDetectionRule: 'exactly-one',
    uploadHint: '请上传1-10张单人照片(每张照片必须只包含一个人)',
    useCases: [
      '个人写真',
      '证件照生成',
      '头像制作',
      '艺术照',
    ],
  },
  multi: {
    id: 'multi',
    name: '多人合照生成',
    description: '使用多个人的照片,生成包含所有人的合照',
    icon: 'Users',
    minPhotos: 2,
    maxPhotos: 6,
    requiresFaceDetection: true,
    faceDetectionRule: 'at-least-one',
    uploadHint: '请上传2-6张照片(每人至少1张单人照,每张照片必须包含人脸)',
    useCases: [
      '全家福',
      '多人合影',
      '亲子照',
      '朋友合照',
    ],
  },
}

/**
 * 获取模式配置
 */
export function getModeConfig(mode: GenerationMode): ModeConfig {
  return GENERATION_MODES[mode]
}

/**
 * 获取所有模式列表
 */
export function getAllModes(): ModeConfig[] {
  return Object.values(GENERATION_MODES)
}

/**
 * 验证照片数量是否符合模式要求
 */
export function validatePhotoCount(mode: GenerationMode, count: number): {
  isValid: boolean
  error?: string
} {
  const config = getModeConfig(mode)

  if (count < config.minPhotos) {
    return {
      isValid: false,
      error: `${config.name}至少需要${config.minPhotos}张照片,当前只有${count}张`,
    }
  }

  if (count > config.maxPhotos) {
    return {
      isValid: false,
      error: `${config.name}最多支持${config.maxPhotos}张照片,当前有${count}张`,
    }
  }

  return { isValid: true }
}

/**
 * 根据照片数量推荐模式
 */
export function suggestMode(photoCount: number): GenerationMode | null {
  if (photoCount >= GENERATION_MODES.single.minPhotos && photoCount <= GENERATION_MODES.single.maxPhotos) {
    return 'single'
  }
  if (photoCount >= GENERATION_MODES.multi.minPhotos && photoCount <= GENERATION_MODES.multi.maxPhotos) {
    return 'multi'
  }
  return null
}
