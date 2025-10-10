import { z } from 'zod'

// Task Status
export const TaskStatusSchema = z.enum([
  'pending',
  'uploading',
  'generating',
  'completed',
  'partial-success',
  'failed'
])

export type TaskStatus = z.infer<typeof TaskStatusSchema>

// Generation Mode
export const GenerationModeSchema = z.enum(['auto', 'manual'])
export type GenerationMode = z.infer<typeof GenerationModeSchema>

// Failed Style
export const FailedStyleSchema = z.object({
  styleId: z.string(),
  styleName: z.string(),
  error: z.string(),
  timestamp: z.number()
})

export type FailedStyle = z.infer<typeof FailedStyleSchema>

// Task Progress
export const TaskProgressSchema = z.object({
  totalStyles: z.number().int().nonnegative(),
  completedStyles: z.number().int().nonnegative(),
  currentStyleId: z.string().optional(),
  currentStyleName: z.string().optional(),
  totalImages: z.number().int().nonnegative(),
  completedImages: z.number().int().nonnegative(),
  failedStyles: z.array(FailedStyleSchema)
})

export type TaskProgress = z.infer<typeof TaskProgressSchema>

// Uploaded Photo
export const UploadedPhotoSchema = z.object({
  id: z.string(), // UUID v4
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string(),
  uploadedAt: z.number(),
  dataUrl: z.string().optional() // Base64 data URL for preview
})

export type UploadedPhoto = z.infer<typeof UploadedPhotoSchema>

// Generation Result
export const GenerationResultSchema = z.object({
  imageId: z.string(), // UUID v4
  styleId: z.string(),
  styleName: z.string(),
  sequenceNumber: z.number().int().positive(), // 1-4 for each style
  dataUrl: z.string(), // Base64 data URL
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fileSize: z.number().int().positive(),
  generatedAt: z.number(),
  favorited: z.boolean().default(false),
  exported: z.boolean().default(false),
  exportedPath: z.string().optional()
})

export type GenerationResult = z.infer<typeof GenerationResultSchema>

// Generation Task
export const GenerationTaskSchema = z.object({
  id: z.string(), // UUID v4
  milestoneId: z.string(),
  milestoneName: z.string(),
  generationMode: GenerationModeSchema,
  selectedStyleIds: z.array(z.string()),
  uploadedPhotoIds: z.array(z.string()),
  status: TaskStatusSchema,
  progress: TaskProgressSchema,
  results: z.array(GenerationResultSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().optional(),
  errorMessage: z.string().optional()
})

export type GenerationTask = z.infer<typeof GenerationTaskSchema>

// Create Task Parameters
export const CreateTaskParamsSchema = z.object({
  milestoneId: z.string(),
  milestoneName: z.string(),
  photoIds: z.array(z.string()).min(1),
  mode: GenerationModeSchema,
  styleIds: z.array(z.string()).optional()
}).refine(
  (data) => {
    // If mode is 'manual', styleIds must be provided and have 1-3 items
    if (data.mode === 'manual') {
      return data.styleIds && data.styleIds.length >= 1 && data.styleIds.length <= 3
    }
    return true
  },
  {
    message: 'Manual mode requires 1-3 style IDs',
    path: ['styleIds']
  }
)

export type CreateTaskParams = z.infer<typeof CreateTaskParamsSchema>
