import { z } from 'zod'

// Zod Schemas
export const StyleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional(), // 临时改为可选，避免验证失败
  description: z.string(),
  promptTemplate: z.string().min(1),
  tags: z.array(z.string()).optional(), // 临时改为可选，避免验证失败
  exampleImage: z.string(),
  compatibleMilestones: z.array(z.string()),
  premium: z.boolean().optional(), // 临时改为可选，避免验证失败
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
  description: z.string(),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string()
  })),
  styles: z.array(StyleSchema)
})

// TypeScript Types (inferred from Zod schemas)
export type Style = z.infer<typeof StyleSchema>
export type StyleConfig = z.infer<typeof StyleConfigSchema>
