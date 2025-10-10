# Technical Research: Life Milestone Photo Generation System

**Feature**: Life Milestone Photo Generation with Auto-Style Mode
**Branch**: 002-12-18-ai
**Date**: 2025-10-08
**Status**: Complete

## Executive Summary

This document outlines the technical research and decisions for implementing a comprehensive life milestone photo generation system. The system will extend the existing "百岁照" (100-day baby photo) feature to cover all life stages with configurable styles and an auto-generation mode.

**Key Decision**: Extend existing Next.js + Tauri + TypeScript architecture with configuration-driven style management and milestone categorization.

## Technology Stack Decisions

### 1. Frontend Framework: Next.js 14.2 (App Router) ✅

**Decision**: Continue using Next.js 14.2 with App Router and static export

**Rationale**:
- Already implemented in Phase 1 (001-bai-sui-zhao)
- Static export (`output: 'export'`) works well with Tauri
- App Router provides better code organization for multiple milestone categories
- Server Components can be used during build for configuration loading

**Alternatives Considered**:
- **React SPA (Vite)**: Simpler but loses Next.js build optimizations and routing conventions
- **Svelte/SvelteKit**: Would require complete rewrite
- **Keep existing**: ✅ Selected - proven to work

**Implementation Notes**:
- Use App Router's parallel routes for milestone categories
- Leverage Next.js Image optimization for style preview thumbnails
- Use dynamic imports for milestone-specific components

### 2. Desktop Runtime: Tauri 2.0 ✅

**Decision**: Continue using Tauri 2.0 with Rust backend

**Rationale**:
- Already integrated in Phase 1
- Provides secure local file system access for photos
- Native performance for image processing
- Cross-platform (Windows, macOS, Linux)

**Alternatives Considered**:
- **Electron**: Larger bundle size, more memory usage
- **Keep existing**: ✅ Selected - no issues encountered

**Implementation Notes**:
- Use Tauri's `fs` plugin for reading configuration files
- Leverage Tauri's `dialog` plugin for file selection
- Consider Tauri's `store` plugin for persisting user preferences

### 3. State Management: Zustand 5.0 ✅

**Decision**: Continue using Zustand for global state

**Rationale**:
- Lightweight and performant
- Good TypeScript support
- Works well with Next.js App Router
- Already proven in Phase 1

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for this use case
- **Jotai/Recoil**: Similar but Zustand already integrated
- **Keep existing**: ✅ Selected

**New State Slices Needed**:
- `milestoneStore`: Selected milestone type, available categories
- `styleStore`: Available styles, selected styles, style configurations
- `configStore`: Admin mode, configuration management

### 4. Data Storage: localStorage + JSON Configuration Files ✅

**Decision**: Hybrid approach - runtime data in localStorage, style/milestone configs in JSON files

**Rationale**:
- Phase 1 already uses localStorage successfully
- JSON files enable hot-reloading of configurations without code changes
- Easy for non-developers to add new styles/milestones
- No database complexity needed for this use case

**Alternatives Considered**:
- **SQLite (Tauri SQL plugin)**: Overkill, adds complexity
- **IndexedDB**: Similar to localStorage but more complex API
- **Hybrid JSON + localStorage**: ✅ Selected

**File Structure**:
```
src/
├── config/
│   ├── milestones.json    # Milestone type definitions
│   ├── styles.json         # Style configurations
│   └── schema.ts           # TypeScript types for configs
```

**Configuration Schema**:
```typescript
// milestones.json
{
  "categories": [
    {
      "id": "infancy",
      "name": "婴儿期",
      "ageRange": "0-1岁",
      "milestones": [
        {
          "id": "birth",
          "name": "出生",
          "icon": "👶",
          "compatibleStyles": ["soft-pastel", "natural-light", ...]
        }
      ]
    }
  ]
}

// styles.json
{
  "styles": [
    {
      "id": "romantic-soft-focus",
      "name": "浪漫柔焦",
      "description": "柔和光线，梦幻氛围",
      "promptTemplate": "romantic soft focus photography, dreamy atmosphere, [SUBJECT], gentle lighting, warm tones",
      "exampleImage": "/styles/romantic-soft-focus.jpg",
      "compatibleMilestones": ["wedding", "anniversary", ...],
      "active": true
    }
  ]
}
```

### 5. AI Image Generation: Google Gemini 2.5 Flash Image API ✅

**Decision**: Continue using Gemini API with existing integration

**Rationale**:
- Already integrated in Phase 1
- Synchronous API simplifies progress tracking
- Cost-effective ($0.039/image)
- Free tier available

**Alternatives Considered**:
- **Replicate (Seedream 4)**: Similar pricing, requires new integration
- **Fal.ai**: Good but pricing not transparent
- **Keep existing**: ✅ Selected

**Enhancement for Phase 2**:
- Add retry logic for failed style generations
- Implement style-specific prompt templates
- Add progress callbacks for multi-style generation

### 6. Image Processing: Browser-based with Canvas API

**Decision**: Use HTML5 Canvas API for client-side image processing

**Rationale**:
- No additional dependencies needed
- Fast enough for preview generation
- Cross-platform compatible
- Tauri provides file system access for saving

**Alternatives Considered**:
- **Sharp (Node.js)**: Can't use in Tauri frontend
- **WASM Image libraries**: Unnecessary complexity
- **Canvas API**: ✅ Selected - sufficient for needs

**Use Cases**:
- Generate thumbnails for style previews
- Validate image dimensions/format before upload
- Create data URLs for display

### 7. UI Component Library: shadcn/ui + Tailwind CSS ✅

**Decision**: Continue using shadcn/ui components with Tailwind

**Rationale**:
- Already integrated and styled consistently
- Component-based approach fits milestone/style cards
- Easy to customize per milestone category
- Good accessibility out of the box

**New Components Needed**:
- `MilestoneCard`: Display milestone types with icons
- `CategoryTabs`: Navigate between life stage categories
- `StyleGallery`: Grid view of style options with preview
- `ConfigEditor`: Admin interface for style management
- `GenerationProgress`: Multi-style progress indicator

### 8. Routing Architecture: App Router with Dynamic Routes

**Decision**: Use Next.js App Router with dynamic segments for milestones

**Rationale**:
- Clean URLs: `/generation/milestone/[milestoneId]`
- Server Components for loading configuration
- Parallel routes for category navigation

**Route Structure**:
```
app/
├── page.tsx                        # Home/Welcome
├── upload/
│   └── page.tsx                    # Photo upload (existing)
├── generation/
│   ├── milestone/
│   │   ├── page.tsx                # Milestone selection (NEW)
│   │   └── [milestoneId]/
│   │       └── page.tsx            # Style selection (NEW)
│   ├── progress/
│   │   └── page.tsx                # Generation progress (modified)
│   ├── result/
│   │   └── page.tsx                # Results gallery (modified)
│   └── admin/
│       └── styles/
│           └── page.tsx            # Style configuration (NEW)
```

### 9. Configuration Management: File-based with Hot Reload

**Decision**: JSON configuration files loaded at runtime with optional hot-reload

**Rationale**:
- Easy for non-technical users to add styles
- Version controllable (can commit to git)
- No build step required for config changes
- Can implement hot-reload in development

**Implementation**:
```typescript
// src/lib/configLoader.ts
export async function loadMilestoneConfig(): Promise<MilestoneConfig> {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    // In Tauri: load from file system
    const { readTextFile } = await import('@tauri-apps/plugin-fs')
    const configPath = 'src/config/milestones.json'
    const content = await readTextFile(configPath)
    return JSON.parse(content)
  } else {
    // In browser/build: load from bundled resource
    return import('@/config/milestones.json').then(m => m.default)
  }
}
```

### 10. Type Safety: Zod for Runtime Validation

**Decision**: Use Zod schemas for validating configuration files

**Rationale**:
- Runtime validation prevents invalid configs from crashing app
- Generate TypeScript types from schemas
- User-friendly error messages for config issues

**Implementation**:
```typescript
import { z } from 'zod'

export const StyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  promptTemplate: z.string(),
  exampleImage: z.string(),
  compatibleMilestones: z.array(z.string()),
  active: z.boolean()
})

export const StyleConfigSchema = z.object({
  styles: z.array(StyleSchema)
})

export type Style = z.infer<typeof StyleSchema>
export type StyleConfig = z.infer<typeof StyleConfigSchema>
```

## Architecture Patterns

### 1. Configuration-Driven Development

**Pattern**: All milestones and styles defined in JSON, not code

**Benefits**:
- Rapid expansion without code changes
- Non-developers can contribute content
- Easy A/B testing of styles
- Simple rollback if style doesn't work

**Trade-offs**:
- Need validation to prevent bad configs
- More files to manage

### 2. Multi-Style Batch Generation

**Pattern**: Sequential generation with progress tracking

```typescript
async function generateMultiStyle(
  photos: string[],
  styles: Style[],
  onProgress: (current: number, total: number, styleName: string) => void
): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = []
  const totalImages = styles.length * 4 // 4 images per style

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i]
    onProgress(i * 4, totalImages, style.name)

    try {
      const images = await generateImages({
        photoPath: photos[0],
        prompt: style.promptTemplate,
        numImages: 4,
        onProgress: (percent) => {
          onProgress(i * 4 + Math.floor(percent * 4), totalImages, style.name)
        }
      })
      results.push(...images.images)
    } catch (error) {
      console.error(`Failed to generate ${style.name}:`, error)
      // Continue with other styles
    }
  }

  return results
}
```

### 3. Graceful Degradation

**Pattern**: Continue generation even if some styles fail

**Implementation**:
- Wrap each style generation in try/catch
- Show partial results with failed styles marked
- Allow retrying failed styles individually

## Performance Considerations

### 1. Configuration Loading

- **Strategy**: Load configurations on app start, cache in memory
- **Optimization**: Use dynamic imports for large config files
- **Target**: <100ms to load all configs

### 2. Image Generation

- **Strategy**: Sequential generation to avoid API rate limits
- **Optimization**: Reuse API connections, implement request pooling
- **Target**: 12-20 images in 60 seconds (meets SC-002)

### 3. Style Preview Images

- **Strategy**: Lazy load preview images, use next/image optimization
- **Optimization**: Serve previews as WebP with placeholder blur
- **Target**: <2s to show all style previews

### 4. Local Storage

- **Strategy**: Use compressed JSON, cleanup old tasks
- **Optimization**: Implement automatic cleanup of tasks >30 days old
- **Limit**: Keep <100MB in localStorage

## Security Considerations

### 1. Configuration File Validation

**Risk**: Malicious JSON could inject harmful prompts

**Mitigation**:
- Validate all configs with Zod schemas
- Sanitize prompt templates before sending to API
- Reject configs with suspicious patterns

### 2. File System Access

**Risk**: Unauthorized file access via Tauri

**Mitigation**:
- Use Tauri's permission system
- Restrict fs access to app data directory
- Validate all file paths before access

### 3. API Key Protection

**Risk**: API key exposure in compiled code

**Mitigation**:
- Store API key in environment variables
- Use Tauri's secure storage for production
- Never commit keys to git

## Testing Strategy

### 1. Configuration Validation Tests

```typescript
describe('Configuration Validation', () => {
  it('should load valid milestone config', () => {
    const config = loadMilestoneConfig()
    expect(StyleConfigSchema.parse(config)).toBeDefined()
  })

  it('should reject invalid style config', () => {
    const badConfig = { styles: [{ id: 123 }] }
    expect(() => StyleConfigSchema.parse(badConfig)).toThrow()
  })
})
```

### 2. Multi-Style Generation Tests

```typescript
describe('Multi-Style Generation', () => {
  it('should generate all styles successfully', async () => {
    const styles = [mockStyle1, mockStyle2, mockStyle3]
    const results = await generateMultiStyle(photos, styles, mockProgress)
    expect(results).toHaveLength(12) // 3 styles × 4 images
  })

  it('should continue after partial failure', async () => {
    // Mock one style to fail
    const results = await generateMultiStyle(photos, styles, mockProgress)
    expect(results.length).toBeGreaterThan(0)
  })
})
```

### 3. E2E User Flows

- Auto-generation flow: Select milestone → Upload → Auto-generate → View results
- Manual selection flow: Select milestone → Choose styles → Generate → Export
- Admin flow: Add new style → Verify it appears → Generate with new style

## Migration from Phase 1

### Data Migration

No data migration needed - Phase 1 and Phase 2 are independent features that will coexist.

**Consideration**: Users may have generated "百岁照" in Phase 1. We should:
1. Keep Phase 1 task history intact
2. Add Phase 2 tasks as separate entries
3. Provide unified history view later (Phase 3?)

### Code Refactoring

**Shared Components** (can be reused):
- `/upload/page.tsx` - Photo upload UI
- `/components/ErrorDialog.tsx` - Error display
- `/components/ui/*` - shadcn components
- `/lib/api.ts` - Gemini API client (needs extension)
- `/lib/storage.ts` - localStorage utilities

**New Components** (to be created):
- Milestone selection UI
- Style gallery UI
- Multi-style progress tracking
- Configuration management UI
- Category navigation

## Open Questions & Decisions

### Q1: Should we support custom user-added styles?

**Decision**: Phase 2 will support admin-added styles only. User-added styles can be Phase 3.

**Rationale**: Simplifies validation and content moderation. Admin interface provides sufficient flexibility for curated content expansion.

### Q2: How many default styles should we provide at launch?

**Decision**: Minimum 15 styles distributed across categories (3 per life stage category)

**Rationale**: Meets FR-020 requirement. Provides variety while keeping configuration manageable. Can expand based on user feedback.

### Q3: Should generated images be stored locally or in cloud?

**Decision**: Store locally in Tauri app data directory, export to user's chosen location

**Rationale**:
- Aligns with desktop app nature
- No cloud storage costs
- Better privacy
- User controls their data

### Q4: How to handle prompt template variables?

**Decision**: Support simple variable substitution: `[SUBJECT]`, `[MILESTONE_NAME]`, `[AGE]`

**Example**:
```
Template: "Professional portrait photography, [SUBJECT], celebrating [MILESTONE_NAME], age [AGE], studio lighting"
Rendered: "Professional portrait photography, young woman, celebrating wedding anniversary, age 25, studio lighting"
```

## Conclusion

The Phase 2 implementation will leverage the existing Next.js + Tauri + TypeScript stack while adding configuration-driven milestone and style management. The key innovations are:

1. **JSON-based Configuration**: Enables rapid content expansion without code changes
2. **Multi-Style Batch Generation**: Auto-generates diverse results in one click
3. **Graceful Degradation**: Continues even if some styles fail
4. **Category-Based Organization**: Intuitive life stage browsing

**Next Steps**:
1. Review this research document
2. Create data model specification (data-model.md)
3. Define API contracts (contracts/)
4. Write implementation guide (quickstart.md)
5. Generate task breakdown (tasks.md)

**Estimated Implementation Timeline**: 3-5 days for MVP with P1 features
