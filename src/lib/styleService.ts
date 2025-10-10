import { loadStyleConfig } from './configLoader'
import { Style } from './types/style'
import { NotFoundError } from './types/errors'
import { getMilestoneById } from './milestoneService'

/**
 * Get all active styles
 */
export async function getAllStyles(): Promise<Style[]> {
  const config = await loadStyleConfig()
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
 */
export async function getCompatibleStyles(milestoneId: string): Promise<Style[]> {
  // Verify milestone exists
  await getMilestoneById(milestoneId)

  const config = await loadStyleConfig()

  return config.styles.filter(
    style =>
      style.active &&
      style.compatibleMilestones.includes(milestoneId)
  )
}

/**
 * Get default styles for a specific milestone (for auto-generation)
 */
export async function getDefaultStylesForMilestone(milestoneId: string): Promise<Style[]> {
  const milestone = await getMilestoneById(milestoneId)
  const config = await loadStyleConfig()

  const defaultStyles: Style[] = []

  for (const styleId of milestone.defaultStyleIds) {
    const style = config.styles.find(s => s.id === styleId && s.active)
    if (style) {
      defaultStyles.push(style)
    }
  }

  // If no default styles found, fall back to first 3 compatible styles
  if (defaultStyles.length === 0) {
    const compatibleStyles = await getCompatibleStyles(milestoneId)
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
