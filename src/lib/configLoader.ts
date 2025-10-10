import {
  MilestoneConfig,
  MilestoneConfigSchema
} from './types/milestone'
import {
  StyleConfig,
  StyleConfigSchema
} from './types/style'
import { ConfigValidationError } from './types/errors'
import { styleConfig as styleConfigData } from '@/config/styles'

// In-memory cache
let milestoneConfigCache: MilestoneConfig | null = null
let styleConfigCache: StyleConfig | null = null

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
 * Load style configuration from JSON file
 * Validates using Zod schema and caches result
 */
export async function loadStyleConfig(): Promise<StyleConfig> {
  // Return cached config if available
  if (styleConfigCache) {
    return styleConfigCache
  }

  try {
    // Validate with Zod schema
    const validated = StyleConfigSchema.parse(styleConfigData)

    // Cache the validated config
    styleConfigCache = validated

    return validated
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ConfigValidationError(error as any)
    }
    throw new Error(`Failed to load style configuration: ${error}`)
  }
}

/**
 * Clear cached configurations (useful for testing or hot-reload)
 */
export function clearConfigCache(): void {
  milestoneConfigCache = null
  styleConfigCache = null
}
