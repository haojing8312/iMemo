import { z } from 'zod'

// Zod Schemas
export const StyleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  promptTemplate: z.string().min(1),
  exampleImage: z.string(),
  compatibleMilestones: z.array(z.string()),
  active: z.boolean(),
  // 003-2: 多人模式支持
  supportedModes: z.array(z.enum(['single', 'multi'])).optional(),
  minPhotos: z.number().int().min(1).optional(),
  maxPhotos: z.number().int().min(1).optional(),
  isMultiPerson: z.boolean().optional()
})

export const StyleConfigSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().datetime(),
  styles: z.array(StyleSchema)
})

// TypeScript Types (inferred from Zod schemas)
export type Style = z.infer<typeof StyleSchema>
export type StyleConfig = z.infer<typeof StyleConfigSchema>
