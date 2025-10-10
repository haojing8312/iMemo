# Implementation Tasks: Life Milestone Photo Generation with Auto-Style Mode

**Feature**: 002-12-18-ai
**Branch**: `002-12-18-ai`
**Generated**: 2025-10-09
**Total Tasks**: 47

## Task Organization

Tasks are organized by **User Story** to enable independent implementation and testing. Each user story phase is a complete, shippable increment.

**Priority Guide**:
- **P1 Stories (US1, US2)**: MVP - Core auto-generation flow
- **P2 Stories (US3, US5)**: Enhanced features - Manual selection and export
- **P3 Story (US4)**: Admin features - Style management

## Implementation Strategy

**MVP Approach**: Implement US1 + US2 first (Phases 1-4) for a working auto-generation system.

**Incremental Delivery**:
1. Phase 1-4: MVP (US1 + US2) - ~3 days
2. Phase 5: Manual Selection (US3) - ~1 day
3. Phase 6: Export & Gallery (US5) - ~1 day
4. Phase 7: Admin UI (US4) - ~1 day
5. Phase 8: Polish - ~0.5 day

---

## Phase 1: Project Setup & Dependencies (Foundational)

**Purpose**: Install dependencies and create base infrastructure needed by ALL user stories.

**Tasks**:

### T001 - Install Zod for Runtime Validation [P]
**File**: `package.json`
**Story**: Foundation
**Command**: `pnpm add zod`
**Description**: Add Zod for validating milestone and style configurations at runtime.

### T002 - Create Base Directory Structure [P]
**Files**: Multiple directories
**Story**: Foundation
**Commands**:
```bash
mkdir -p src/config
mkdir -p src/lib/types
mkdir -p public/styles
mkdir -p src/__tests__
```
**Description**: Create all necessary directories for config files, types, and tests.

### T003 - Create Milestone Configuration File
**File**: `src/config/milestones.json`
**Story**: Foundation
**Description**: Create milestone configuration with 5 categories (Infancy, Childhood, Adolescence, Adulthood, Elderly) and 15+ milestones. Copy structure from `data-model.md` Section 1 sample data.
**Sample Milestones**: Birth, Full Month, 100-Day, 1st Birthday, Wedding, Anniversary, Graduation, etc.

### T004 - Create Style Configuration File
**File**: `src/config/styles.json`
**Story**: Foundation
**Description**: Create style configuration with 15+ styles distributed across categories. Copy structure from `data-model.md` Section 2 sample data.
**Sample Styles**: Soft Pastel, Natural Light, Romantic Soft Focus, Vintage Film, Documentary, Cute Props, etc.
**Note**: Each style must have `promptTemplate`, `compatibleMilestones`, and `exampleImage` path.

### T005 - Add Example Style Preview Images
**Files**: `public/styles/*.jpg`
**Story**: Foundation
**Description**: Add at least 5 example style preview images (can use placeholders initially). Name them according to style IDs (e.g., `romantic-soft-focus.jpg`).

**Checkpoint**: ✅ Configuration infrastructure ready. All dependencies installed.

---

## Phase 2: Foundational Type System (Foundational)

**Purpose**: Create TypeScript types and Zod schemas that ALL user stories depend on. Must complete before implementing any user story.

**Tasks**:

### T006 - Create Milestone Type Definitions
**File**: `src/lib/types/milestone.ts`
**Story**: Foundation
**Description**:
- Define `Milestone`, `MilestoneCategory`, `MilestoneConfig` interfaces
- Create Zod schemas: `MilestoneSchema`, `MilestoneCategorySchema`, `MilestoneConfigSchema`
- Export TypeScript types using `z.infer<typeof Schema>`
- Copy exact structure from `data-model.md` Section 1

### T007 - Create Style Type Definitions
**File**: `src/lib/types/style.ts`
**Story**: Foundation
**Description**:
- Define `Style`, `StyleConfig` interfaces
- Create Zod schemas: `StyleSchema`, `StyleConfigSchema`
- Export TypeScript types using `z.infer<typeof Schema>`
- Copy exact structure from `data-model.md` Section 2

### T008 - Create Task Type Definitions
**File**: `src/lib/types/task.ts`
**Story**: Foundation
**Description**:
- Define `GenerationTask`, `TaskProgress`, `UploadedPhoto`, `GenerationResult`, `FailedStyle` interfaces
- Create Zod schemas for each type
- Export TypeScript types
- Copy exact structure from `data-model.md` Section 3

### T009 - Create Custom Error Types
**File**: `src/lib/types/errors.ts`
**Story**: Foundation
**Description**:
- Create `ConfigValidationError`, `NotFoundError`, `ValidationError`, `FileSystemError`, `GenerationError` classes
- All should extend `Error` base class
- Copy structure from `contracts/README.md` Error Types section

**Checkpoint**: ✅ Type system complete. All schemas and interfaces defined.

---

## Phase 3: Configuration & Data Services (Foundational)

**Purpose**: Implement configuration loading and data access services needed by all user stories.

**Tasks**:

### T010 - Implement Configuration Loader
**File**: `src/lib/configLoader.ts`
**Story**: Foundation
**Description**:
- Implement `loadMilestoneConfig(): Promise<MilestoneConfig>`
- Implement `loadStyleConfig(): Promise<StyleConfig>`
- Use dynamic imports: `import('@/config/milestones.json')`
- Validate loaded configs with Zod schemas
- Throw `ConfigValidationError` on validation failure
- Reference `quickstart.md` Phase 2.3 for implementation

### T011 - Implement Milestone Service
**File**: `src/lib/milestoneService.ts`
**Story**: Foundation
**Description**:
- Implement `getMilestoneById(id: string): Promise<Milestone>`
- Implement `getMilestonesByCategory(categoryId: string): Promise<Milestone[]>`
- Implement `getAllCategories(): Promise<MilestoneCategory[]>`
- Use `loadMilestoneConfig()` and cache results
- Throw `NotFoundError` if milestone not found

### T012 - Implement Style Service
**File**: `src/lib/styleService.ts`
**Story**: Foundation
**Description**:
- Implement `getStyleById(id: string): Promise<Style>`
- Implement `getStylesByIds(ids: string[]): Promise<Style[]>`
- Implement `getCompatibleStyles(milestoneId: string): Promise<Style[]>`
- Implement `getDefaultStylesForMilestone(milestoneId: string): Promise<Style[]>`
- Filter styles based on `compatibleMilestones` array
- Use `loadStyleConfig()` and cache results

### T013 - Implement Task Service (Storage Layer)
**File**: `src/lib/taskService.ts`
**Story**: Foundation
**Description**:
- Implement `createTask(params: CreateTaskParams): Promise<GenerationTask>`
- Implement `updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>`
- Implement `addTaskResult(taskId: string, result: GenerationResult): Promise<void>`
- Implement `getTaskById(taskId: string): Promise<GenerationTask>`
- Implement `getAllTasks(): Promise<GenerationTask[]>`
- Use localStorage with key `milestone-generation-tasks`
- Generate UUID v4 for task IDs using `crypto.randomUUID()`

**Checkpoint**: ✅ Configuration loading and data services ready. Can now load milestones and styles.

---

## Phase 4: User Story 1 - Quick Auto-Generation (P1)

**Story Goal**: Users can select a milestone, upload photos, and auto-generate 12-20 images in 3-5 styles with one click.

**Independent Test**: Select "Wedding" → Upload 3 photos → Click "Auto-Generate" → Verify 12-20 images generated in <60s → Grouped by style

**Tasks**:

### T014 - Extend Zustand Store for Milestone State
**File**: `src/lib/store.ts` (existing)
**Story**: US1
**Description**:
- Add `milestoneStore` slice with: `selectedMilestone`, `setSelectedMilestone`, `clearMilestone`
- Add `generationMode` state: `'auto' | 'manual'`
- Reuse existing `photoStore` from Phase 1 (no changes needed)

### T015 - Extend Zustand Store for Task Progress
**File**: `src/lib/store.ts` (existing)
**Story**: US1
**Description**:
- Add `currentTask` state: `GenerationTask | null`
- Add `taskProgress` state for real-time updates
- Add actions: `setCurrentTask`, `updateProgress`, `clearTask`

### T016 - Implement Multi-Style Generator
**File**: `src/lib/multiStyleGenerator.ts`
**Story**: US1
**Description**:
- Implement `generateMultiStyle(params: MultiStyleParams): Promise<GenerationResult[]>`
- Sequential generation: loop through styles, generate 4 images per style
- Call existing `generateImages()` from Phase 1's `src/lib/api.ts`
- Support `onProgress` callback for real-time updates
- Support `onStyleComplete` and `onStyleFailed` callbacks
- Graceful degradation: continue even if one style fails
- Reference `quickstart.md` Phase 4.1 for implementation details

### T017 - Create Progress Page Layout
**File**: `src/app/generation/progress/page.tsx` (modify existing)
**Story**: US1
**Description**:
- Extend existing progress page from Phase 1
- Display current style being generated: "Generating [Style Name]..."
- Show progress bar: "X of Y images completed"
- Show style-specific progress: "Style 2 of 4"
- Display failed styles with error message
- Use `taskProgress` from store

### T018 - Add Multi-Style Progress Tracking Component
**File**: `src/components/MultiStyleProgress.tsx`
**Story**: US1
**Description**:
- Create component showing progress for each style
- Display: Style name, progress bar, status (pending/generating/completed/failed)
- Show checkmarks for completed styles
- Show error icon for failed styles
- Props: `styles: Style[]`, `progress: TaskProgress`

### T019 - Integrate Auto-Generation in Upload Flow
**File**: `src/app/upload/page.tsx` (modify existing)
**Story**: US1
**Description**:
- Modify existing upload page from Phase 1
- Add "Mode Selection" UI: Radio buttons for "Auto-Generate" vs "Manual Selection"
- Default to "Auto-Generate" mode
- When user clicks "Generate" in auto mode:
  - Load default styles for selected milestone
  - Create generation task with `mode: 'auto'`
  - Navigate to progress page
  - Start multi-style generation

### T020 - Enhance Results Page for Multi-Style Display
**File**: `src/app/generation/result/page.tsx` (modify existing)
**Story**: US1
**Description**:
- Modify existing results page from Phase 1
- Group generated images by `styleId`
- Show style name header for each group
- Display 4 images per style in grid
- Show "Failed to generate" message for failed styles
- Reuse existing image grid components

**Checkpoint**: ✅ **US1 Complete & Testable**. User can auto-generate milestone photos. MVP functional.

---

## Phase 5: User Story 2 - Milestone Type Selection (P1)

**Story Goal**: Users can browse and select from comprehensive milestone types organized by life stage categories.

**Independent Test**: Open app → See 5 life stage categories → Select "Adulthood" → See Wedding, Graduation, etc. → Select "Wedding" → Proceed to upload

**Tasks**:

### T021 - Create Milestone Selection Page
**File**: `src/app/generation/milestone/page.tsx`
**Story**: US2
**Description**:
- Create new page for milestone type selection
- Load all categories using `getAllCategories()`
- Display category tabs: Infancy, Childhood, Adolescence, Adulthood, Elderly
- Default to first category
- Reference `quickstart.md` Phase 3.1

### T022 - Create Category Tabs Component
**File**: `src/components/CategoryTabs.tsx`
**Story**: US2
**Description**:
- Create tab navigation for life stage categories
- Props: `categories: MilestoneCategory[]`, `activeCategory: string`, `onCategoryChange: (id: string) => void`
- Display category icon and name
- Highlight active category
- Responsive: horizontal scroll on mobile

### T023 - Create Milestone Card Component
**File**: `src/components/MilestoneCard.tsx`
**Story**: US2
**Description**:
- Create card component for individual milestone display
- Props: `milestone: Milestone`, `onClick: () => void`
- Display: Icon, name, description
- Hover effect and click animation
- Show "NEW" badge for newly added milestones (if `createdAt` is recent)

### T024 - Create Milestone Grid Layout
**File**: `src/app/generation/milestone/page.tsx` (extend)
**Story**: US2
**Description**:
- Display milestones in responsive grid (3 cols desktop, 2 cols tablet, 1 col mobile)
- Filter milestones by selected category
- Sort by `order` field
- Only show `active: true` milestones
- On milestone click: save to store and navigate to style selection

### T025 - Update App Navigation Flow
**File**: `src/app/page.tsx` (home page)
**Story**: US2
**Description**:
- Update home page to navigate to milestone selection instead of direct upload
- Add "Start Creating" button → navigate to `/generation/milestone`
- Show app branding: "有AI的家庭回忆"

**Checkpoint**: ✅ **US2 Complete & Testable**. Users can browse and select milestone types. MVP navigation flow complete.

**🎯 MVP COMPLETE**: Phases 1-5 deliver a working auto-generation system. Users can select milestones and generate styled photos.

---

## Phase 6: User Story 3 - Manual Style Selection (P2)

**Story Goal**: Advanced users can preview styles, manually select 1-3 specific styles, and generate only those.

**Independent Test**: Select milestone → Choose "Manual Selection" → Preview 5 styles → Select 2 → Generate 8 images (4 per style)

**Tasks**:

### T026 - Create Style Selection Page
**File**: `src/app/generation/milestone/[milestoneId]/page.tsx`
**Story**: US3
**Description**:
- Create dynamic route for style selection
- Load compatible styles: `getCompatibleStyles(milestoneId)`
- Display mode toggle: "Auto-Generate" vs "Manual Selection"
- Show style gallery in manual mode
- Reference `quickstart.md` Phase 3.2

### T027 - Create Style Gallery Component
**File**: `src/components/StyleGallery.tsx`
**Story**: US3
**Description**:
- Create grid component for displaying styles
- Props: `styles: Style[]`, `selectedStyles: string[]`, `onStyleToggle: (styleId: string) => void`, `maxSelection: number`
- Display StyleCard for each style
- Show selection counter: "Selected X/3"

### T028 - Create Style Card Component
**File**: `src/components/StyleCard.tsx`
**Story**: US3
**Description**:
- Create card component for individual style display
- Props: `style: Style`, `selected: boolean`, `onToggle: () => void`
- Display: Example image, style name, description
- Show checkbox overlay when selected
- Use `convertFileSrc()` for local image paths (Tauri)

### T029 - Add Style Selection State to Store
**File**: `src/lib/store.ts` (extend)
**Story**: US3
**Description**:
- Add `styleStore` slice
- State: `selectedStyles: string[]`, `maxSelection: number` (default 3)
- Actions: `toggleStyle`, `clearStyles`, `setStyles`
- Validation: prevent selecting more than max

### T030 - Create Mode Toggle Component
**File**: `src/components/ModeToggle.tsx`
**Story**: US3
**Description**:
- Create toggle UI for "Auto" vs "Manual" mode
- Props: `mode: 'auto' | 'manual'`, `onChange: (mode) => void`
- Display radio buttons or toggle switch
- Show mode descriptions

### T031 - Integrate Manual Selection into Generation Flow
**File**: `src/app/generation/milestone/[milestoneId]/page.tsx` (extend)
**Story**: US3
**Description**:
- When user clicks "Generate" in manual mode:
  - Validate at least 1 style selected
  - Get selected styles using `getStylesByIds()`
  - Create generation task with `mode: 'manual'` and selected style IDs
  - Navigate to progress page
  - Start multi-style generation with selected styles only

**Checkpoint**: ✅ **US3 Complete & Testable**. Users can manually select specific styles. Power user feature complete.

---

## Phase 7: User Story 5 - Generated Image Review & Export (P2)

**Story Goal**: Users can review generated images in gallery, favorite them, and export to device.

**Independent Test**: Complete generation → View gallery → Favorite 5 images → Export to downloads → Verify files saved with correct names

**Tasks**:

### T032 - Create Results Gallery Component
**File**: `src/components/ResultsGallery.tsx`
**Story**: US5
**Description**:
- Create gallery component with style grouping
- Props: `results: GenerationResult[]`, `onImageClick: (result) => void`
- Group images by `styleId`
- Display style name headers
- Grid layout (2-3 cols) per style group

### T033 - Add Favorite Functionality
**File**: `src/lib/taskService.ts` (extend)
**Story**: US5
**Description**:
- Implement `toggleFavorite(taskId: string, imageId: string): Promise<void>`
- Update `favorited` field in `GenerationResult`
- Persist to localStorage

### T034 - Add Favorite State to Store
**File**: `src/lib/store.ts` (extend)
**Story**: US5
**Description**:
- Add `favoriteImages: Set<string>` (image IDs)
- Actions: `toggleFavorite(imageId: string)`, `isFavorited(imageId: string)`

### T035 - Create Full-Screen Image Viewer
**File**: `src/components/ImageViewer.tsx`
**Story**: US5
**Description**:
- Create modal component for full-screen image viewing
- Props: `image: GenerationResult`, `onClose: () => void`, `onNext: () => void`, `onPrev: () => void`
- Features: Zoom, pan, navigation arrows
- Show favorite button overlay
- Show style name and generation time

### T036 - Implement Image Export Functionality
**File**: `src/lib/exportService.ts`
**Story**: US5
**Description**:
- Implement `exportImages(images: GenerationResult[]): Promise<string[]>`
- Use Tauri's file system API to save images
- Generate filenames: `{MilestoneName}_{StyleName}_{Sequence}.jpg`
- Return array of saved file paths
- Handle errors: storage full, permission denied

### T037 - Add Export UI to Results Page
**File**: `src/app/generation/result/page.tsx` (extend)
**Story**: US5
**Description**:
- Add "Export Selected" button (enabled when favorites > 0)
- Add "Export All" button
- Show export progress dialog
- Show success message with file paths
- Handle export errors gracefully

### T038 - Create Favorites Filter Tab
**File**: `src/components/ResultsGallery.tsx` (extend)
**Story**: US5
**Description**:
- Add tabs: "All Images" | "Favorites Only"
- Filter displayed images based on `favorited` status
- Show count: "Favorites (5)"

### T039 - Implement Share Functionality (Optional)
**File**: `src/lib/shareService.ts`
**Story**: US5
**Description**:
- Implement `shareImage(image: GenerationResult): Promise<void>`
- Use Tauri's shell API or Web Share API
- Support: Save to clipboard, Open in default image viewer
- Note: Full social media integration may require platform-specific code

**Checkpoint**: ✅ **US5 Complete & Testable**. Users can review, favorite, and export images. Complete user journey implemented.

---

## Phase 8: User Story 4 - Configurable Style Management (P3)

**Story Goal**: Admins can add, edit, and manage styles through a configuration interface without code changes.

**Independent Test**: Open admin panel → Add new style "Vintage Film" → Set prompt and compatible milestones → Verify it appears in Wedding styles

**Tasks**:

### T040 - Create Style Management Page
**File**: `src/app/generation/admin/styles/page.tsx`
**Story**: US4
**Description**:
- Create admin page for style management
- List all styles in table format
- Show: Name, Compatible Milestones, Active status, Actions
- Add "Create New Style" button
- Reference `quickstart.md` Phase 5.1

### T041 - Create Style Editor Component
**File**: `src/components/StyleEditor.tsx`
**Story**: US4
**Description**:
- Create form component for adding/editing styles
- Fields: Style Name, Description, Prompt Template, Example Image Upload, Compatible Milestones (multi-select), Active status
- Validation: All fields required except description
- Preview prompt variables: `[SUBJECT]`, `[MILESTONE_NAME]`

### T042 - Implement Style CRUD Operations
**File**: `src/lib/styleService.ts` (extend)
**Story**: US4
**Description**:
- Implement `createStyle(style: Style): Promise<void>`
- Implement `updateStyle(id: string, updates: Partial<Style>): Promise<void>`
- Implement `deleteStyle(id: string): Promise<void>`
- Implement `toggleStyleActive(id: string): Promise<void>`
- Update `src/config/styles.json` file
- Reload config after changes

### T043 - Add File Upload for Example Images
**File**: `src/lib/fileService.ts`
**Story**: US4
**Description**:
- Implement `uploadStyleImage(file: File): Promise<string>`
- Save to `public/styles/` directory using Tauri file system
- Generate unique filename: `{styleId}-{timestamp}.jpg`
- Return public URL path

### T044 - Create Milestone Multi-Select Component
**File**: `src/components/MilestoneMultiSelect.tsx`
**Story**: US4
**Description**:
- Create component for selecting multiple compatible milestones
- Props: `milestones: Milestone[]`, `selected: string[]`, `onChange: (ids: string[]) => void`
- Checkbox list with category grouping
- Search/filter functionality

### T045 - Add Style Validation
**File**: `src/lib/styleService.ts` (extend)
**Story**: US4
**Description**:
- Validate prompt template syntax
- Check for duplicate style IDs
- Warn if prompt too similar to existing style (optional)
- Ensure at least one compatible milestone selected

**Checkpoint**: ✅ **US4 Complete & Testable**. Admins can manage styles. System is fully extensible without code changes.

---

## Phase 9: Polish & Cross-Cutting Concerns (Final)

**Purpose**: Add finishing touches that improve the experience across all user stories.

**Tasks**:

### T046 - Add Loading States and Skeleton Loaders
**Files**: Multiple components
**Story**: Polish
**Description**:
- Add skeleton loaders for milestone cards while loading config
- Add loading states for style gallery
- Add shimmer effect during image generation
- Use shadcn/ui Skeleton component

### T047 - Add Error Boundaries
**Files**: Layout files
**Story**: Polish
**Description**:
- Wrap pages in error boundaries
- Create custom error page component
- Log errors to console
- Show user-friendly error messages: "Something went wrong. Please try again."

**Checkpoint**: ✅ **All Features Complete**. System ready for production deployment.

---

## Task Dependencies

### Critical Path (Sequential):
1. **Phase 1 → Phase 2 → Phase 3** (Foundational - must complete first)
2. **Phase 3 → Phase 4** (US1 depends on services)
3. **Phase 3 → Phase 5** (US2 depends on services)
4. **Phase 4 + Phase 5 → Phase 6** (US3 depends on US1 + US2)
5. **Phase 4 + Phase 5 → Phase 7** (US5 depends on US1 + US2)
6. **Phase 3 → Phase 8** (US4 depends on services)

### Parallel Opportunities:

**Within Phase 1** (can be done in parallel):
- T001 (Install Zod) [P]
- T002 (Create directories) [P]
- T003, T004, T005 (Config files) can be done together

**Within Phase 2** (can be done in parallel):
- T006 (Milestone types) [P]
- T007 (Style types) [P]
- T008 (Task types) [P]
- T009 (Error types) [P]

**Within Phase 3** (sequential dependencies):
- T010 must complete first (config loader)
- Then T011, T012 can be parallel [P]
- Then T013 (depends on types)

**After Phase 3 Complete**:
- Phase 4 (US1) and Phase 5 (US2) can be done in parallel [P]
- Phase 6 (US3) can start after Phase 4+5
- Phase 7 (US5) can start after Phase 4+5
- Phase 8 (US4) can be done independently after Phase 3

**Within Phase 4** (US1 tasks - some parallel):
- T014, T015 (Store) can be parallel [P]
- T016 (Multi-style generator) sequential after store
- T017, T018 (Progress UI) can be parallel [P]
- T019, T020 (Integration) sequential after generator

**Within Phase 6** (US3 tasks - some parallel):
- T027, T028, T029, T030 can be parallel [P] (components + store)
- T026, T031 sequential (page setup then integration)

**Within Phase 7** (US5 tasks - some parallel):
- T032, T033, T034, T035 can be parallel [P]
- T036, T037, T038, T039 sequential after base components

**Within Phase 8** (US4 tasks):
- T041, T044 (Components) can be parallel [P]
- T042, T043, T045 (Services) sequential

---

## Parallel Execution Examples

### Sprint 1: MVP Foundation (2 days)
**Parallel Track A**: T001 → T006 → T007 → T008 → T009 → T010
**Parallel Track B**: T002 → T003 → T004 → T005
**Then Sequential**: T011 → T012 → T013

### Sprint 2: MVP Implementation (2 days)
**Parallel Track A (US1)**: T014 → T015 → T016 → T017 → T018 → T019 → T020
**Parallel Track B (US2)**: T021 → T022 → T023 → T024 → T025

### Sprint 3: Enhanced Features (1.5 days)
**Parallel Track A (US3)**: T026 → T027 → T028 → T029 → T030 → T031
**Parallel Track B (US5)**: T032 → T033 → T034 → T035 → T036 → T037 → T038 → T039

### Sprint 4: Admin & Polish (1 day)
**Sequential**: T040 → T041 → T042 → T043 → T044 → T045 → T046 → T047

---

## Testing Strategy

**Note**: Tests are NOT required for this implementation. The following are optional if you want to add tests later.

### Optional Unit Tests (if desired):
- `src/lib/__tests__/configLoader.test.ts` - Validate config loading and Zod validation
- `src/lib/__tests__/milestoneService.test.ts` - Test data access methods
- `src/lib/__tests__/styleService.test.ts` - Test style filtering and compatibility
- `src/lib/__tests__/multiStyleGenerator.test.ts` - Test sequential generation and graceful degradation

### Optional Integration Tests (if desired):
- E2E flow: Select milestone → Upload → Auto-generate → View results
- Manual selection flow: Select milestone → Choose styles → Generate
- Export flow: Generate → Favorite → Export

### Manual Testing Checklist (Recommended):
- [ ] **US1**: Auto-generation completes successfully for 3-5 styles
- [ ] **US1**: Progress updates show correct style and image count
- [ ] **US1**: Graceful degradation works when one style fails
- [ ] **US2**: All milestone categories load and display correctly
- [ ] **US2**: Milestone selection persists through navigation
- [ ] **US3**: Manual style selection allows selecting 1-3 styles
- [ ] **US3**: Cannot select more than 3 styles
- [ ] **US5**: Favorited images persist across sessions
- [ ] **US5**: Export saves files with correct naming convention
- [ ] **US4**: New styles appear immediately after creation
- [ ] **Edge Cases**: Handles invalid images, network failures, storage full

---

## Implementation Notes

### Key Architecture Decisions:
1. **Configuration-First**: All milestones and styles in JSON, not code
2. **Graceful Degradation**: Multi-style generation continues even if some styles fail
3. **Sequential Generation**: Generate styles one at a time to avoid API rate limits
4. **localStorage**: All runtime data in localStorage (tasks, favorites, history)
5. **Zod Validation**: Runtime validation prevents bad configurations from crashing app

### Critical Files to Understand:
- `src/lib/multiStyleGenerator.ts` - Core generation orchestration
- `src/lib/configLoader.ts` - Configuration loading and validation
- `src/lib/taskService.ts` - Task state management
- `src/config/milestones.json` - Milestone definitions
- `src/config/styles.json` - Style definitions

### Common Patterns:
- All services load config once and cache in memory
- All components use Zustand store for state
- All async operations handle errors with try/catch
- All user-facing errors show friendly messages

### Performance Targets:
- Config loading: <100ms
- Milestone selection: <50ms to display all categories
- Generation: 12-20 images in <60 seconds (target: SC-002)
- Export: <10 seconds per image (target: SC-007)

---

## Success Criteria Mapping

| Success Criteria | Related Tasks | Validation Method |
|------------------|---------------|-------------------|
| SC-001: Complete flow in <90s | T021-T031 | Manual timing test |
| SC-002: Generate 12-20 images in <60s | T016 | Performance test with timer |
| SC-003: 80% choose auto mode | T019, T026 | Analytics tracking (future) |
| SC-004: 0% data loss on interruption | T013, T019 | Test app close during generation |
| SC-005: Add style in <5 min | T040-T045 | Manual admin flow test |
| SC-006: 90% tasks succeed | T016 | Error rate monitoring |
| SC-007: Export in <10s per image | T036 | Performance test |
| SC-008: 100% invalid images detected | T011, T019 | Upload various invalid files |
| SC-009: 95% recognizable faces | T016 | Manual quality review |
| SC-010: Support 50+ styles | T012, T042 | Load test with 50 styles |

---

## Next Steps

1. **Start with MVP**: Implement Phases 1-5 (Tasks T001-T031) first
2. **Test Thoroughly**: After Phase 5, test complete auto-generation flow
3. **Iterate**: Add US3, US5, US4 based on user feedback
4. **Polish**: Add Phase 9 improvements for production readiness

**Estimated Timeline**: 6.5 days for all features, 3.5 days for MVP (Phases 1-5)

---

**Generated by**: `/speckit.tasks` command
**Based on**: spec.md, plan.md, data-model.md, contracts/README.md, quickstart.md
