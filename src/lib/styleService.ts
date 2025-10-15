import { loadStyleConfig, type StyleCollectionType, getAllStyleCollections, getStyleCollectionInfo } from './configLoader'
import { Style } from './types/style'
import { NotFoundError } from './types/errors'
import { getMilestoneById } from './milestoneService'

// 导出风格集合相关类型和函数
export type { StyleCollectionType }
export { getAllStyleCollections, getStyleCollectionInfo }

/**
 * Get all active styles from a specific collection
 * @param collection 风格集合类型,默认为 'all'
 */
export async function getAllStyles(
  collection: StyleCollectionType = 'all'
): Promise<Style[]> {
  const config = await loadStyleConfig(collection)
  return config.styles.filter(style => style.active)
}

/**
 * Get a specific style by ID
 */
export async function getStyleById(id: string): Promise<Style> {
  const config = await loadStyleConfig()
  const style = config.styles.find(s => s.id === id)

  if (!style) {
    throw new NotFoundError('Style', id)
  }

  return style
}

/**
 * Get multiple styles by their IDs
 * Filters out invalid IDs (doesn't throw error)
 */
export async function getStylesByIds(ids: string[]): Promise<Style[]> {
  const config = await loadStyleConfig()
  const styles: Style[] = []

  for (const id of ids) {
    const style = config.styles.find(s => s.id === id && s.active)
    if (style) {
      styles.push(style)
    }
  }

  return styles
}

/**
 * Get all styles compatible with a specific milestone
 * @param milestoneId 里程碑ID
 * @param collection 风格集合类型,默认为 'all'
 */
export async function getCompatibleStyles(
  milestoneId: string,
  collection: StyleCollectionType = 'all'
): Promise<Style[]> {
  // Verify milestone exists
  await getMilestoneById(milestoneId)

  const config = await loadStyleConfig(collection)

  return config.styles.filter(
    style =>
      style.active &&
      style.compatibleMilestones.includes(milestoneId)
  )
}

/**
 * Get default styles for a specific milestone (for auto-generation)
 * 注意: 一键生成使用全部风格池 (collection='all'),不受分类限制
 */
export async function getDefaultStylesForMilestone(milestoneId: string): Promise<Style[]> {
  const milestone = await getMilestoneById(milestoneId)
  // 一键生成从全部风格中选择
  const config = await loadStyleConfig('all')

  const defaultStyles: Style[] = []

  for (const styleId of milestone.defaultStyleIds) {
    const style = config.styles.find(s => s.id === styleId && s.active)
    if (style) {
      defaultStyles.push(style)
    }
  }

  // If no default styles found, fall back to first 3 compatible styles from all collections
  if (defaultStyles.length === 0) {
    const compatibleStyles = await getCompatibleStyles(milestoneId, 'all')
    return compatibleStyles.slice(0, 3)
  }

  return defaultStyles
}

/**
 * Search styles by name or description (case-insensitive)
 */
export async function searchStyles(query: string): Promise<Style[]> {
  const allStyles = await getAllStyles()
  const lowerQuery = query.toLowerCase()

  return allStyles.filter(style =>
    style.name.toLowerCase().includes(lowerQuery) ||
    style.description.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Validate that style IDs are compatible with a milestone
 * Throws error if any style is incompatible
 */
export async function validateStyleCompatibility(
  milestoneId: string,
  styleIds: string[]
): Promise<void> {
  const compatibleStyles = await getCompatibleStyles(milestoneId)
  const compatibleStyleIds = new Set(compatibleStyles.map(s => s.id))

  for (const styleId of styleIds) {
    if (!compatibleStyleIds.has(styleId)) {
      const style = await getStyleById(styleId)
      throw new Error(
        `Style "${style.name}" (${styleId}) is not compatible with milestone ${milestoneId}`
      )
    }
  }
}
