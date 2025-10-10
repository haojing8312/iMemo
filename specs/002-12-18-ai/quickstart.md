# Quick Start: Life Milestone Photo Generation Implementation

**Feature**: 002-12-18-ai
**Date**: 2025-10-08

## Phase 1: Setup Configuration Files (30 min)

### 1.1 Create Configuration Structure
```bash
mkdir -p src/config
mkdir -p public/styles
```

### 1.2 Create milestones.json
Copy sample from `data-model.md` Section 1 to `src/config/milestones.json`

### 1.3 Create styles.json
Copy sample from `data-model.md` Section 2 to `src/config/styles.json`

### 1.4 Add Example Style Images
Place 3-5 example images in `public/styles/` (可以先用占位图)

## Phase 2: Implement Data Layer (2 hours)

### 2.1 Install Zod
```bash
pnpm add zod
```

### 2.2 Create Type Definitions
**File**: `src/lib/types/milestone.ts`
- Copy Zod schemas from data-model.md Section 1
- Export TypeScript types

**File**: `src/lib/types/style.ts`
- Copy Zod schemas from data-model.md Section 2
- Export TypeScript types

**File**: `src/lib/types/task.ts`
- Copy Zod schemas from data-model.md Section 3
- Export TypeScript types

### 2.3 Implement Configuration Loader
**File**: `src/lib/configLoader.ts`

```typescript
import { MilestoneConfigSchema, StyleConfigSchema } from './types'

export async function loadMilestoneConfig() {
  const config = await import('@/config/milestones.json')
  return MilestoneConfigSchema.parse(config.default)
}

export async function loadStyleConfig() {
  const config = await import('@/config/styles.json')
  return StyleConfigSchema.parse(config.default)
}
```

### 2.4 Implement Service Layer
Create these files with functions from contracts/README.md:
- `src/lib/milestoneService.ts`
- `src/lib/styleService.ts`
- `src/lib/taskService.ts`

## Phase 3: Build UI Components (4 hours)

### 3.1 Milestone Selection Page
**File**: `src/app/generation/milestone/page.tsx`

**功能**:
- Load and display milestone categories
- Show milestones grouped by category
- Navigate to style selection on click

**Key Components**:
- `CategoryTabs` - Life stage categories
- `MilestoneCard` - Individual milestone display

### 3.2 Style Selection Page
**File**: `src/app/generation/milestone/[milestoneId]/page.tsx`

**功能**:
- Display compatible styles for selected milestone
- Support auto-generation and manual selection modes
- Validate selection before proceeding

**Key Components**:
- `StyleGallery` - Grid of style cards
- `ModeToggle` - Switch between auto/manual
- `StyleCard` - Individual style display with example image

### 3.3 Enhanced Progress Page
**File**: `src/app/generation/progress/page.tsx` (modify existing)

**新增功能**:
- Show current style being generated
- Display progress for multiple styles
- Handle partial failures gracefully

### 3.4 Enhanced Results Page
**File**: `src/app/generation/result/page.tsx` (modify existing)

**新增功能**:
- Group results by style
- Show style names and descriptions
- Filter by favorites

## Phase 4: Implement Multi-Style Generation (3 hours)

### 4.1 Create Multi-Style Generator
**File**: `src/lib/multiStyleGenerator.ts`

```typescript
export async function generateMultiStyle(params: MultiStyleParams) {
  const { photoPath, styles, onProgress } = params
  const results: GenerationResult[] = []
  const totalImages = styles.length * 4

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i]
    onProgress(i * 4, totalImages, style.name)

    try {
      const response = await generateImages({
        photoPath,
        prompt: style.promptTemplate,
        numImages: 4,
        onProgress: (percent) => {
          onProgress(i * 4 + Math.floor(percent * 4), totalImages, style.name)
        }
      })

      for (const [index, image] of response.images.entries()) {
        results.push({
          imageId: crypto.randomUUID(),
          styleId: style.id,
          styleName: style.name,
          sequenceNumber: index + 1,
          dataUrl: image.url,
          width: image.width,
          height: image.height,
          fileSize: image.fileSize,
          generatedAt: Date.now(),
          favorited: false,
          exported: false
        })
      }
    } catch (error) {
      console.error(`Style ${style.name} failed:`, error)
      // Continue with next style
    }
  }

  return results
}
```

### 4.2 Integrate with Progress Page
Modify `progress/page.tsx` to use `generateMultiStyle` instead of single style generation.

## Phase 5: Admin UI (Optional - P3)

### 5.1 Style Management Page
**File**: `src/app/generation/admin/styles/page.tsx`

**功能**:
- List all styles
- Add new style configuration
- Edit existing styles
- Activate/deactivate styles

**Note**: This can be implemented in a later sprint if time is limited.

## Phase 6: Testing (2 hours)

### 6.1 Configuration Validation Tests
```typescript
// src/lib/__tests__/configLoader.test.ts
describe('Configuration Loading', () => {
  it('should load valid milestone config', async () => {
    const config = await loadMilestoneConfig()
    expect(config.categories).toHaveLength(5)
  })
})
```

### 6.2 Multi-Style Generation Tests
```typescript
// src/lib/__tests__/multiStyleGenerator.test.ts
describe('Multi-Style Generation', () => {
  it('should generate all styles', async () => {
    const results = await generateMultiStyle(mockParams)
    expect(results).toHaveLength(12) // 3 styles × 4 images
  })
})
```

### 6.3 Manual Testing Checklist
- [ ] Select milestone from each category
- [ ] Auto-generation completes successfully
- [ ] Manual selection with 1-3 styles works
- [ ] Progress tracking shows correct information
- [ ] Results grouped by style correctly
- [ ] Export functionality works
- [ ] Handles network failures gracefully

## Phase 7: Polish & Deploy (1 hour)

### 7.1 Add Loading States
- Skeleton loaders for milestone/style cards
- Progress indicators during config loading

### 7.2 Error Boundaries
- Wrap pages in error boundaries
- Show user-friendly error messages

### 7.3 Accessibility
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Test with screen reader

## Implementation Order (Recommended)

**Day 1**: Phases 1-2 (Setup + Data Layer)
**Day 2**: Phase 3.1-3.2 (Milestone & Style Selection)
**Day 3**: Phase 3.3-3.4 + Phase 4 (Progress + Multi-Style)
**Day 4**: Phase 6-7 (Testing + Polish)
**Day 5** (if needed): Phase 5 (Admin UI)

## Quick Commands

```bash
# Start development
pnpm tauri dev

# Run tests
pnpm test

# Build for production
pnpm tauri build

# Lint and format
pnpm lint
pnpm format
```

## Troubleshooting

### Config validation fails
- Check JSON syntax with JSONLint
- Verify all required fields are present
- Check style/milestone ID references match

### Images not loading
- Verify file paths in style config
- Check public/styles directory exists
- Ensure convertFileSrc is used for local paths

### Generation fails
- Check API key is set in .env.local
- Verify network connectivity
- Check browser console for detailed errors

## Next Steps

After implementation:
1. Run `/speckit.tasks` to generate detailed task breakdown
2. Use `/speckit.implement` to execute tasks systematically
3. Test thoroughly with real photos
4. Gather user feedback and iterate

## Resources

- Spec Document: `specs/002-12-18-ai/spec.md`
- Data Model: `specs/002-12-18-ai/data-model.md`
- API Contracts: `specs/002-12-18-ai/contracts/README.md`
- Research: `specs/002-12-18-ai/research.md`
