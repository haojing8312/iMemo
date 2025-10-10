import { z } from 'zod'

// Zod Schemas
export const MilestoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  order: z.number().int().nonnegative(),
  compatibleStyleIds: z.array(z.string()),
  defaultStyleIds: z.array(z.string()),
  minPhotos: z.number().int().positive().default(1),
  maxPhotos: z.number().int().positive().default(5),
  active: z.boolean()
})

export const MilestoneCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ageRange: z.string(),
  order: z.number().int().nonnegative(),
  icon: z.string(),
  milestones: z.array(MilestoneSchema)
})

export const MilestoneConfigSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().datetime(),
  categories: z.array(MilestoneCategorySchema)
})

// TypeScript Types (inferred from Zod schemas)
export type Milestone = z.infer<typeof MilestoneSchema>
export type MilestoneCategory = z.infer<typeof MilestoneCategorySchema>
export type MilestoneConfig = z.infer<typeof MilestoneConfigSchema>
