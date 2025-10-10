# Data Model: Life Milestone Photo Generation

**Feature**: Life Milestone Photo Generation with Auto-Style Mode
**Branch**: 002-12-18-ai
**Date**: 2025-10-08

## Overview

This document defines the data structures for milestone management, style configuration, and generation task tracking. The system uses a hybrid storage approach:

- **Configuration Data** (milestones, styles): JSON files loaded at runtime
- **Runtime Data** (tasks, photos, generated images): localStorage with TypeScript interfaces
- **TypeScript Schemas**: Zod schemas for runtime validation

## Configuration Data Models

### 1. Milestone Configuration

**File**: `src/config/milestones.json`

**TypeScript Interface**:
```typescript
interface MilestoneCategory {
  id: string                    // Unique category identifier (e.g., "infancy")
  name: string                  // Display name (e.g., "婴儿期")
  ageRange: string              // Age range description (e.g., "0-1岁")
  order: number                 // Display order in UI
  icon: string                  // Category icon emoji
  milestones: Milestone[]       // List of milestones in this category
}

interface Milestone {
  id: string                    // Unique milestone identifier (e.g., "wedding")
  name: string                  // Display name (e.g., "结婚")
  description: string           // Brief description for users
  icon: string                  // Milestone icon emoji
  order: number                 // Display order within category
  compatibleStyleIds: string[]  // IDs of styles compatible with this milestone
  defaultStyleIds: string[]     // IDs of styles to use in auto-generation mode
  minPhotos: number             // Minimum photos required (default: 1)
  maxPhotos: number             // Maximum photos accepted (default: 5)
  active: boolean               // Whether milestone is currently available
}

interface MilestoneConfig {
  version: string               // Config file version for migration
  lastUpdated: string           // ISO timestamp
  categories: MilestoneCategory[]
}
```

**Zod Schema**:
```typescript
import { z } from 'zod'

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

export type Milestone = z.infer<typeof MilestoneSchema>
export type MilestoneCategory = z.infer<typeof MilestoneCategorySchema>
export type MilestoneConfig = z.infer<typeof MilestoneConfigSchema>
```

**Sample Data**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08T00:00:00Z",
  "categories": [
    {
      "id": "infancy",
      "name": "婴儿期",
      "ageRange": "0-1岁",
      "order": 1,
      "icon": "👶",
      "milestones": [
        {
          "id": "birth",
          "name": "出生",
          "description": "新生儿照片",
          "icon": "👶",
          "order": 1,
          "compatibleStyleIds": ["soft-pastel", "natural-light", "documentary"],
          "defaultStyleIds": ["soft-pastel", "natural-light", "warm-family"],
          "minPhotos": 1,
          "maxPhotos": 5,
          "active": true
        },
        {
          "id": "full-month",
          "name": "满月",
          "description": "满月纪念照",
          "icon": "🌙",
          "order": 2,
          "compatibleStyleIds": ["soft-pastel", "natural-light", "cute-props"],
          "defaultStyleIds": ["soft-pastel", "cute-props", "warm-family"],
          "minPhotos": 1,
          "maxPhotos": 5,
          "active": true
        },
        {
          "id": "100-day",
          "name": "百日照",
          "description": "百日纪念照",
          "icon": "💯",
          "order": 3,
          "compatibleStyleIds": ["soft-pastel", "bright-colorful", "cute-props"],
          "defaultStyleIds": ["bright-colorful", "cute-props", "soft-pastel"],
          "minPhotos": 1,
          "maxPhotos": 5,
          "active": true
        }
      ]
    },
    {
      "id": "adulthood",
      "name": "成年期",
      "ageRange": "18-60岁",
      "order": 4,
      "icon": "👔",
      "milestones": [
        {
          "id": "wedding",
          "name": "结婚",
          "description": "婚礼纪念照",
          "icon": "💍",
          "order": 1,
          "compatibleStyleIds": ["romantic-soft-focus", "cinematic", "vintage-film"],
          "defaultStyleIds": ["romantic-soft-focus", "cinematic", "elegant-portrait"],
          "minPhotos": 2,
          "maxPhotos": 5,
          "active": true
        },
        {
          "id": "graduation",
          "name": "毕业",
          "description": "毕业纪念照",
          "icon": "🎓",
          "order": 2,
          "compatibleStyleIds": ["professional-portrait", "bright-colorful", "documentary"],
          "defaultStyleIds": ["professional-portrait", "bright-colorful", "natural-light"],
          "minPhotos": 1,
          "maxPhotos": 5,
          "active": true
        }
      ]
    }
  ]
}
```

### 2. Style Configuration

**File**: `src/config/styles.json`

**TypeScript Interface**:
```typescript
interface Style {
  id: string                    // Unique style identifier (e.g., "romantic-soft-focus")
  name: string                  // Display name (e.g., "浪漫柔焦")
  description: string           // User-facing description
  promptTemplate: string        // AI prompt with [SUBJECT] placeholder
  exampleImagePath: string      // Path to example image (public/styles/...)
  compatibleMilestones: string[] // Milestone IDs this style works with
  tags: string[]                // Searchable tags (e.g., ["romantic", "wedding"])
  active: boolean               // Whether style is currently available
  createdAt: string             // ISO timestamp
  updatedAt: string             // ISO timestamp
  metadata: StyleMetadata       // Additional configuration
}

interface StyleMetadata {
  temperatureHint?: number      // AI temperature suggestion (0-1)
  aspectRatio?: string          // Preferred aspect ratio (e.g., "3:4")
  negativePrompt?: string       // Things to avoid in generation
}

interface StyleConfig {
  version: string               // Config file version
  lastUpdated: string           // ISO timestamp
  styles: Style[]
}
```

**Zod Schema**:
```typescript
export const StyleMetadataSchema = z.object({
  temperatureHint: z.number().min(0).max(1).optional(),
  aspectRatio: z.string().optional(),
  negativePrompt: z.string().optional()
})

export const StyleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  promptTemplate: z.string().min(10),
  exampleImagePath: z.string(),
  compatibleMilestones: z.array(z.string()),
  tags: z.array(z.string()),
  active: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: StyleMetadataSchema
})

export const StyleConfigSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().datetime(),
  styles: z.array(StyleSchema)
})

export type StyleMetadata = z.infer<typeof StyleMetadataSchema>
export type Style = z.infer<typeof StyleSchema>
export type StyleConfig = z.infer<typeof StyleConfigSchema>
```

**Sample Data**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08T00:00:00Z",
  "styles": [
    {
      "id": "romantic-soft-focus",
      "name": "浪漫柔焦",
      "description": "柔和光线，梦幻氛围，适合婚礼和纪念日",
      "promptTemplate": "romantic soft focus photography, dreamy atmosphere, gentle lighting, warm tones, [SUBJECT], professional wedding photography style",
      "exampleImagePath": "/styles/romantic-soft-focus.jpg",
      "compatibleMilestones": ["wedding", "anniversary", "engagement"],
      "tags": ["romantic", "wedding", "soft", "dreamy"],
      "active": true,
      "createdAt": "2025-10-08T00:00:00Z",
      "updatedAt": "2025-10-08T00:00:00Z",
      "metadata": {
        "temperatureHint": 0.7,
        "aspectRatio": "3:4",
        "negativePrompt": "harsh lighting, oversaturated colors, busy background"
      }
    },
    {
      "id": "soft-pastel",
      "name": "柔和粉彩",
      "description": "温柔的色调，适合婴儿和儿童照片",
      "promptTemplate": "soft pastel photography, gentle colors, baby photography, natural light, tender mood, [SUBJECT], minimalist background",
      "exampleImagePath": "/styles/soft-pastel.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "1st-birthday"],
      "tags": ["baby", "soft", "pastel", "gentle"],
      "active": true,
      "createdAt": "2025-10-08T00:00:00Z",
      "updatedAt": "2025-10-08T00:00:00Z",
      "metadata": {
        "temperatureHint": 0.6,
        "aspectRatio": "3:4"
      }
    }
  ]
}
```

## Runtime Data Models

### 3. Generation Task

**Storage**: localStorage with key pattern `task:{taskId}`

**TypeScript Interface**:
```typescript
interface GenerationTask {
  id: string                    // UUID v4
  milestoneId: string           // Selected milestone
  generationMode: 'auto' | 'manual'  // Auto-generation or manual selection
  selectedStyleIds: string[]    // IDs of styles to generate
  uploadedPhotoIds: string[]    // IDs of uploaded photos
  status: TaskStatus            // Current task status
  progress: TaskProgress        // Detailed progress tracking
  results: GenerationResult[]   // Generated images
  createdAt: number             // Timestamp
  updatedAt: number             // Timestamp
  completedAt?: number          // Timestamp when completed
  errorMessage?: string         // Error details if failed
}

type TaskStatus =
  | 'pending'           // Created but not started
  | 'uploading'         // Uploading photos
  | 'generating'        // Generating images
  | 'completed'         // All images generated successfully
  | 'partial-success'   // Some styles generated, some failed
  | 'failed'            // Generation failed completely

interface TaskProgress {
  totalStyles: number           // Total number of styles to generate
  completedStyles: number       // Number of styles completed
  currentStyleId?: string       // Currently generating style
  currentStyleName?: string     // Display name of current style
  totalImages: number           // Total images to generate
  completedImages: number       // Images generated so far
  failedStyles: FailedStyle[]   // Styles that failed
}

interface FailedStyle {
  styleId: string
  styleName: string
  errorMessage: string
  canRetry: boolean
}

interface GenerationResult {
  imageId: string               // UUID v4
  styleId: string               // Style used
  styleName: string             // Display name
  sequenceNumber: number        // 1-4 for this style
  dataUrl: string               // base64 encoded image
  width: number
  height: number
  fileSize: number              // Bytes
  generatedAt: number           // Timestamp
  favorited: boolean
  exported: boolean
}
```

**Zod Schema**:
```typescript
export const TaskStatusSchema = z.enum([
  'pending', 'uploading', 'generating', 'completed', 'partial-success', 'failed'
])

export const FailedStyleSchema = z.object({
  styleId: z.string(),
  styleName: z.string(),
  errorMessage: z.string(),
  canRetry: z.boolean()
})

export const TaskProgressSchema = z.object({
  totalStyles: z.number().int().nonnegative(),
  completedStyles: z.number().int().nonnegative(),
  currentStyleId: z.string().optional(),
  currentStyleName: z.string().optional(),
  totalImages: z.number().int().nonnegative(),
  completedImages: z.number().int().nonnegative(),
  failedStyles: z.array(FailedStyleSchema)
})

export const GenerationResultSchema = z.object({
  imageId: z.string().uuid(),
  styleId: z.string(),
  styleName: z.string(),
  sequenceNumber: z.number().int().min(1).max(4),
  dataUrl: z.string().startsWith('data:image/'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fileSize: z.number().int().positive(),
  generatedAt: z.number().int().positive(),
  favorited: z.boolean(),
  exported: z.boolean()
})

export const GenerationTaskSchema = z.object({
  id: z.string().uuid(),
  milestoneId: z.string(),
  generationMode: z.enum(['auto', 'manual']),
  selectedStyleIds: z.array(z.string()),
  uploadedPhotoIds: z.array(z.string()),
  status: TaskStatusSchema,
  progress: TaskProgressSchema,
  results: z.array(GenerationResultSchema),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  completedAt: z.number().int().positive().optional(),
  errorMessage: z.string().optional()
})

export type TaskStatus = z.infer<typeof TaskStatusSchema>
export type FailedStyle = z.infer<typeof FailedStyleSchema>
export type TaskProgress = z.infer<typeof TaskProgressSchema>
export type GenerationResult = z.infer<typeof GenerationResultSchema>
export type GenerationTask = z.infer<typeof GenerationTaskSchema>
```

### 4. Uploaded Photo

**Storage**: localStorage with key pattern `photo:{photoId}`

**TypeScript Interface**:
```typescript
interface UploadedPhoto {
  id: string                    // UUID v4
  originalName: string          // Original filename
  filePath: string              // Local file path (Tauri)
  dataUrl?: string              // base64 preview (optional, for display)
  mimeType: string              // e.g., "image/jpeg"
  fileSize: number              // Bytes
  width: number
  height: number
  aspectRatio: number           // width / height
  uploadedAt: number            // Timestamp
  usedInTaskIds: string[]       // Tasks that used this photo
}
```

**Zod Schema**:
```typescript
export const UploadedPhotoSchema = z.object({
  id: z.string().uuid(),
  originalName: z.string(),
  filePath: z.string(),
  dataUrl: z.string().startsWith('data:image/').optional(),
  mimeType: z.string(),
  fileSize: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  aspectRatio: z.number().positive(),
  uploadedAt: z.number().int().positive(),
  usedInTaskIds: z.array(z.string().uuid())
})

export type UploadedPhoto = z.infer<typeof UploadedPhotoSchema>
```

### 5. User Session State (Zustand)

**Storage**: In-memory Zustand store

**TypeScript Interface**:
```typescript
interface SessionStore {
  // Current workflow state
  currentMilestoneId: string | null
  currentTaskId: string | null
  uploadedPhotoIds: string[]

  // UI state
  selectedStyleIds: string[]
  generationMode: 'auto' | 'manual'

  // Actions
  setMilestone: (milestoneId: string) => void
  setTask: (taskId: string) => void
  addPhoto: (photoId: string) => void
  removePhoto: (photoId: string) => void
  toggleStyle: (styleId: string) => void
  setGenerationMode: (mode: 'auto' | 'manual') => void
  resetSession: () => void
}
```

## Data Relationships

```
MilestoneCategory (1) ─── (N) Milestone
                                  │
                                  │ compatibleStyleIds
                                  │
                                  ▼
Milestone (N) ─── (N) Style
      │                  │
      │                  │ defaultStyleIds
      │                  │
      ▼                  ▼
GenerationTask ─── selectedStyleIds ─── Style
      │
      │ uploadedPhotoIds
      │
      ▼
UploadedPhoto
      │
      ▼
GenerationResult ─── styleId ─── Style
```

## Data Operations

### Create Generation Task
```typescript
async function createGenerationTask(
  milestoneId: string,
  photoIds: string[],
  mode: 'auto' | 'manual',
  styleIds?: string[]
): Promise<GenerationTask> {
  const milestone = await getMilestoneById(milestoneId)
  const selectedStyles = mode === 'auto'
    ? await getStylesByIds(milestone.defaultStyleIds)
    : await getStylesByIds(styleIds!)

  const task: GenerationTask = {
    id: crypto.randomUUID(),
    milestoneId,
    generationMode: mode,
    selectedStyleIds: selectedStyles.map(s => s.id),
    uploadedPhotoIds: photoIds,
    status: 'pending',
    progress: {
      totalStyles: selectedStyles.length,
      completedStyles: 0,
      totalImages: selectedStyles.length * 4,
      completedImages: 0,
      failedStyles: []
    },
    results: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  localStorage.setItem(`task:${task.id}`, JSON.stringify(task))
  return task
}
```

### Update Task Progress
```typescript
async function updateTaskProgress(
  taskId: string,
  update: Partial<TaskProgress>
): Promise<void> {
  const task = await getTaskById(taskId)
  task.progress = { ...task.progress, ...update }
  task.updatedAt = Date.now()
  localStorage.setItem(`task:${taskId}`, JSON.stringify(task))
}
```

### Add Generation Result
```typescript
async function addGenerationResult(
  taskId: string,
  result: GenerationResult
): Promise<void> {
  const task = await getTaskById(taskId)
  task.results.push(result)
  task.progress.completedImages++
  task.updatedAt = Date.now()

  // Check if all styles are done
  const completedStyleIds = new Set(task.results.map(r => r.styleId))
  task.progress.completedStyles = completedStyleIds.size

  if (task.progress.completedStyles === task.progress.totalStyles) {
    task.status = task.progress.failedStyles.length > 0
      ? 'partial-success'
      : 'completed'
    task.completedAt = Date.now()
  }

  localStorage.setItem(`task:${taskId}`, JSON.stringify(task))
}
```

## Data Validation Strategy

1. **Configuration Files**: Validate with Zod when loading
2. **User Inputs**: Validate before creating tasks
3. **localStorage Data**: Validate when reading, fallback to defaults if invalid
4. **API Responses**: Validate structure before processing

## Data Migration Strategy

**Version 1.0.0 → 1.1.0 Example**:
```typescript
function migrateTaskData(oldTask: any): GenerationTask {
  if (oldTask.version === '1.0.0') {
    // Add new fields with defaults
    return {
      ...oldTask,
      version: '1.1.0',
      progress: {
        ...oldTask.progress,
        failedStyles: []  // New field
      }
    }
  }
  return oldTask
}
```

## Storage Size Management

**Limits**:
- Max tasks in localStorage: 100
- Auto-cleanup: Delete tasks older than 30 days
- Max localStorage size: ~5MB (browsers limit ~10MB)

**Cleanup Strategy**:
```typescript
async function cleanupOldTasks(): Promise<void> {
  const now = Date.now()
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

  const allTasks = await getAllTasks()
  const oldTasks = allTasks.filter(t => t.completedAt && t.completedAt < thirtyDaysAgo)

  for (const task of oldTasks) {
    localStorage.removeItem(`task:${task.id}`)
  }
}
```

## Conclusion

This data model provides:
- ✅ Flexible configuration management
- ✅ Robust task tracking with progress
- ✅ Type-safe runtime validation
- ✅ Efficient localStorage usage
- ✅ Clear data relationships
- ✅ Migration-friendly structure

**Next Steps**: Define API contracts for data operations
