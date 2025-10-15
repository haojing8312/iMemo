import {
  MilestoneConfig,
  MilestoneConfigSchema
} from './types/milestone'
import {
  StyleConfig,
  StyleConfigSchema,
  Style
} from './types/style'
import { ConfigValidationError } from './types/errors'
import { styleConfig as creativeStylesData } from '@/config/styles'
import { realisticStudioStyles as realisticStudioData } from '@/config/styles-realistic-studio'

/**
 * 风格集合类型定义
 */
export type StyleCollectionType = 'realistic-studio' | 'creative-artistic' | 'anime-ip' | 'sci-fi-future' | 'all'

/**
 * 风格集合元数据定义
 */
export interface StyleCollection {
  id: StyleCollectionType
  name: string
  description: string
  icon: string
  order: number
}

// 定义所有可用的风格集合
export const styleCollections: StyleCollection[] = [
  {
    id: 'realistic-studio',
    name: '影楼实拍',
    description: '专业影楼级真实摄影风格，还原传统摄影师作品',
    icon: '📷',
    order: 1
  },
  {
    id: 'creative-artistic',
    name: '艺术创意',
    description: '艺术大师流派、魔法奇幻、创意设计风格',
    icon: '🎨',
    order: 2
  },
  {
    id: 'anime-ip',
    name: '动漫IP',
    description: '吉卜力、皮克斯、迪士尼等经典动漫世界',
    icon: '🎬',
    order: 3
  },
  {
    id: 'sci-fi-future',
    name: '科幻未来',
    description: '赛博朋克、太空探索、蒸汽朋克科技美学',
    icon: '🚀',
    order: 4
  },
  {
    id: 'all',
    name: '全部风格',
    description: '所有可用风格的完整集合',
    icon: '✨',
    order: 5
  }
]

// In-memory cache
let milestoneConfigCache: MilestoneConfig | null = null
let styleConfigCache: Map<StyleCollectionType, StyleConfig> = new Map()

/**
 * Load milestone configuration from JSON file
 * Validates using Zod schema and caches result
 */
export async function loadMilestoneConfig(): Promise<MilestoneConfig> {
  // Return cached config if available
  if (milestoneConfigCache) {
    return milestoneConfigCache
  }

  try {
    // Dynamically import JSON configuration
    const config = await import('@/config/milestones.json')

    // Validate with Zod schema
    const validated = MilestoneConfigSchema.parse(config.default || config)

    // Cache the validated config
    milestoneConfigCache = validated

    return validated
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ConfigValidationError(error as any)
    }
    throw new Error(`Failed to load milestone configuration: ${error}`)
  }
}

/**
 * 根据风格集合类型加载对应的风格配置
 * @param collection 风格集合类型,默认为 'all'
 * @returns 验证后的风格配置
 */
export async function loadStyleConfig(
  collection: StyleCollectionType = 'all'
): Promise<StyleConfig> {
  // 检查缓存
  const cached = styleConfigCache.get(collection)
  if (cached) {
    return cached
  }

  try {
    let config: StyleConfig

    switch (collection) {
      case 'realistic-studio':
        // 只返回真实影楼风格
        config = StyleConfigSchema.parse(realisticStudioData)
        break

      case 'creative-artistic':
        // 返回艺术创意类风格 (art-masterpieces, fantasy-magic, trendy-creative)
        config = filterStylesByCategories(creativeStylesData, [
          'art-masterpieces',
          'fantasy-magic',
          'trendy-creative'
        ])
        break

      case 'anime-ip':
        // 返回动漫IP类风格
        config = filterStylesByCategories(creativeStylesData, ['anime-ip'])
        break

      case 'sci-fi-future':
        // 返回科幻未来类风格
        config = filterStylesByCategories(creativeStylesData, ['sci-fi-future'])
        break

      case 'all':
      default:
        // 合并所有风格配置
        config = mergeStyleConfigs([realisticStudioData, creativeStylesData])
        break
    }

    // 验证合并后的配置
    const validated = StyleConfigSchema.parse(config)

    // 缓存结果
    styleConfigCache.set(collection, validated)

    return validated
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ConfigValidationError(error as any)
    }
    throw new Error(`Failed to load style configuration for collection "${collection}": ${error}`)
  }
}

/**
 * 根据分类过滤风格
 */
function filterStylesByCategories(
  sourceConfig: any,
  categoryIds: string[]
): StyleConfig {
  const categorySet = new Set(categoryIds)

  return {
    version: sourceConfig.version,
    lastUpdated: sourceConfig.lastUpdated,
    description: sourceConfig.description,
    categories: sourceConfig.categories.filter((cat: any) => categorySet.has(cat.id)),
    styles: sourceConfig.styles.filter((style: any) => categorySet.has(style.category))
  }
}

/**
 * 合并多个风格配置
 */
function mergeStyleConfigs(configs: any[]): StyleConfig {
  const allCategories = new Map()
  const allStyles: Style[] = []

  for (const config of configs) {
    // 合并分类 (使用 Map 去重)
    for (const category of config.categories) {
      if (!allCategories.has(category.id)) {
        allCategories.set(category.id, category)
      }
    }

    // 合并风格
    allStyles.push(...config.styles)
  }

  return {
    version: '4.0.0', // 多配置源版本
    lastUpdated: new Date().toISOString(),
    description: '综合风格系统 - 影楼实拍 + 艺术创意',
    categories: Array.from(allCategories.values()),
    styles: allStyles
  }
}

/**
 * 获取指定风格集合的元数据
 */
export function getStyleCollectionInfo(
  collectionId: StyleCollectionType
): StyleCollection | undefined {
  return styleCollections.find(c => c.id === collectionId)
}

/**
 * 获取所有可用的风格集合列表
 */
export function getAllStyleCollections(): StyleCollection[] {
  return styleCollections
}

/**
 * Clear cached configurations (useful for testing or hot-reload)
 */
export function clearConfigCache(): void {
  milestoneConfigCache = null
  styleConfigCache.clear()
}
