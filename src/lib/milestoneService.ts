import { loadMilestoneConfig } from './configLoader'
import { Milestone, MilestoneCategory } from './types/milestone'
import { NotFoundError } from './types/errors'

/**
 * Get all milestone categories
 */
export async function getAllCategories(): Promise<MilestoneCategory[]> {
  const config = await loadMilestoneConfig()
  return config.categories.sort((a, b) => a.order - b.order)
}

/**
 * Get a specific milestone category by ID
 */
export async function getCategoryById(categoryId: string): Promise<MilestoneCategory> {
  const config = await loadMilestoneConfig()
  const category = config.categories.find(cat => cat.id === categoryId)

  if (!category) {
    throw new NotFoundError('MilestoneCategory', categoryId)
  }

  return category
}

/**
 * Get all milestones in a specific category
 */
export async function getMilestonesByCategory(categoryId: string): Promise<Milestone[]> {
  const category = await getCategoryById(categoryId)
  return category.milestones
    .filter(m => m.active)
    .sort((a, b) => a.order - b.order)
}

/**
 * Get a specific milestone by ID
 */
export async function getMilestoneById(id: string): Promise<Milestone> {
  const config = await loadMilestoneConfig()

  // Search through all categories
  for (const category of config.categories) {
    const milestone = category.milestones.find(m => m.id === id)
    if (milestone) {
      return milestone
    }
  }

  throw new NotFoundError('Milestone', id)
}

/**
 * Get all active milestones across all categories
 */
export async function getAllMilestones(): Promise<Milestone[]> {
  const config = await loadMilestoneConfig()
  const allMilestones: Milestone[] = []

  for (const category of config.categories) {
    const activeMilestones = category.milestones.filter(m => m.active)
    allMilestones.push(...activeMilestones)
  }

  return allMilestones
}

/**
 * Search milestones by name (case-insensitive)
 */
export async function searchMilestones(query: string): Promise<Milestone[]> {
  const allMilestones = await getAllMilestones()
  const lowerQuery = query.toLowerCase()

  return allMilestones.filter(milestone =>
    milestone.name.toLowerCase().includes(lowerQuery) ||
    milestone.description.toLowerCase().includes(lowerQuery)
  )
}
