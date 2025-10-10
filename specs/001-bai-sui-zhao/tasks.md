# Tasks: 百岁照生成功能

**Feature Branch**: `001-bai-sui-zhao`
**Input**: Design documents from `/specs/001-bai-sui-zhao/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/nano_banana_api.md

**Tests**: Tests are OPTIONAL and NOT included in this task breakdown (not requested in spec.md)

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- All paths relative to repository root `/HomeMemo/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Next.js 14 + Tauri 2.0 project initialization

- [x] T001 Create Next.js 14 project with TypeScript, Tailwind CSS, and App Router at `/HomeMemo/`
- [x] T002 Initialize Tauri 2.0 desktop application with `pnpm tauri init` at `/HomeMemo/`
- [x] T003 [P] Configure `next.config.ts` for static export (`output: 'export'`) and disable image optimization
- [x] T004 [P] Configure `src-tauri/tauri.conf.json` with window settings and file system allowList permissions
- [x] T005 [P] Install core dependencies: `@tauri-apps/api`, `axios`, `better-sqlite3`, `sharp`, `face-api.js`, `zustand`
- [x] T006 [P] Install UI dependencies: `shadcn/ui` CLI and initialize components (button, card, dialog, progress)
- [x] T007 [P] Setup TypeScript strict mode in `tsconfig.json`
- [x] T008 Create project structure: `src/app/`, `src/components/`, `src/lib/`, `src/styles/`, `public/face-models/`
- [x] T009 [P] Add style template thumbnail images to `public/styles/` (README placeholder created)
- [x] T010 [P] Download and add face-api.js model files to `public/face-models/` (README with instructions created)

**Checkpoint**: Project structure ready for foundational implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Define TypeScript types in `src/lib/types.ts` for PhotoUpload, StyleTemplate, GenerationTask, GeneratedImage, TaskStatus, SimilarityLevel
- [x] T012 Initialize SQLite database in `src/lib/db.ts` with `better-sqlite3` and Tauri path API (`appDataDir`)
- [x] T013 Create database schema migrations in `src/lib/db.ts`: photo_uploads, style_templates, generation_tasks, generated_images tables
- [x] T014 [P] Add database indexes in `src/lib/db.ts` per data-model.md (created_at DESC, status, task_id, style_id)
- [x] T015 [P] Insert 6 preset StyleTemplate records into database from data-model.md SQL script
- [x] T016 Create `src/lib/validators.ts` with PhotoValidator (resolution ≥512, size ≤10MB, format JPG/PNG)
- [x] T017 Create `src/lib/image.ts` with Sharp-based image processing utilities (crop, quality check, metadata extraction)
- [x] T018 Create `src/lib/api.ts` with axios client for nano banana API (baseURL, auth headers, 40s timeout, retry interceptor)
- [x] T019 Initialize face-api.js in `src/lib/image.ts` with face detection models from `public/face-models/`
- [x] T020 Create Zustand store in `src/lib/store.ts` for global state (current task, upload photos, selected styles)
- [x] T021 Configure Tailwind CSS in `src/styles/globals.css` with Chinese font stack (Noto Sans SC fallback)
- [x] T022 Create root layout in `src/app/layout.tsx` with metadata and Chinese locale settings
- [x] T023 [P] Create reusable UI components: `src/components/ui/` (button, card, dialog, progress from shadcn/ui)
- [x] T024 [P] Create error dialog component in `src/components/ErrorDialog.tsx` with retry callback support
- [x] T025 Setup environment variables in `.env.local` for NANO_BANANA_API_KEY (gitignored - .env.local.example created)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 快速生成单风格百岁照 (Priority: P1) 🎯 MVP

**Goal**: 让家长能上传1-5张照片,选择1种风格,30秒内生成4张百岁照并保存到本地

**Independent Test**: 准备1-2张婴儿照片,选择任一风格,验证能成功生成4张图片并保存

### Implementation for User Story 1

#### Database CRUD Operations

- [x] T026 [P] [US1] Implement PhotoUpload CRUD in `src/lib/db.ts` (insert, findById, findByTaskId, delete methods)
- [x] T027 [P] [US1] Implement GenerationTask CRUD in `src/lib/db.ts` (insert, updateStatus, updateProgress, findById, delete methods)
- [x] T028 [P] [US1] Implement GeneratedImage CRUD in `src/lib/db.ts` (insert, findByTaskId, updateSaveStatus, delete methods)
- [x] T029 [P] [US1] Implement StyleTemplate query in `src/lib/db.ts` (findAll, findById methods)

#### Upload Flow

- [x] T030 [US1] Create upload page in `src/app/upload/page.tsx` with Tauri file dialog integration (depends on T026)
- [x] T031 [US1] Implement photo validation logic in upload page using PhotoValidator from validators.ts
- [x] T032 [US1] Add photo preview grid in upload page with thumbnails and metadata display (resolution, size)
- [x] T033 [US1] Implement face detection validation in `src/lib/image.ts` using face-api.js (must detect ≥1 face)
- [x] T034 [US1] Save uploaded photos to Tauri app data directory and insert PhotoUpload records in database
- [x] T035 [US1] Add navigation button to proceed to style selection page

#### Style Selection Flow

- [x] T036 [P] [US1] Create StyleCard component in `src/components/StyleCard.tsx` with thumbnail, name, description (depends on T029)
- [x] T037 [US1] Create style selection page in `src/app/generation/style/page.tsx` displaying 6 style cards in grid layout
- [x] T038 [US1] Implement single-select radio button logic (P1 allows only 1 style selection)
- [x] T039 [US1] Add similarity level selector (high/medium/low) with default "medium"
- [x] T040 [US1] Add "开始生成" button that creates GenerationTask record and navigates to progress page

#### Generation Flow

- [x] T041 [US1] Implement nano banana API generateImages function in `src/lib/api.ts` (upload photo + prompt, get task_id)
- [x] T042 [US1] Implement nano banana API pollTaskStatus function in `src/lib/api.ts` (poll every 2s until complete/failed)
- [x] T043 [US1] Create progress page in `src/app/generation/progress/page.tsx` with progress bar (0-100%)
- [x] T044 [US1] Implement progress tracking with onProgress callback showing upload (0-10%) and generation (10-100%)
- [x] T045 [US1] Display estimated time remaining from API response in progress page
- [x] T046 [US1] Download generated images from CDN URLs to Tauri app data directory using axios
- [x] T047 [US1] Insert GeneratedImage records into database with local file paths
- [x] T048 [US1] Handle generation errors (network timeout, content policy violation, API failure) with ErrorDialog
- [x] T049 [US1] Navigate to result page when status = 'completed'

#### Result Preview & Save Flow

- [x] T050 [US1] Create result page in `src/app/generation/result/page.tsx` displaying 4 generated images in grid
- [x] T051 [US1] Implement high-resolution preview modal with left/right swipe navigation
- [x] T052 [US1] Add multi-select checkboxes for choosing images to save
- [x] T053 [US1] Implement save to local album functionality using Tauri FS API (copy to user's Pictures directory)
- [x] T054 [US1] Generate album filenames in format "YYYYMMDD-风格名-序号.jpg" using DateFormat
- [x] T055 [US1] Update GeneratedImage.is_saved_to_album and album_save_path after saving
- [x] T056 [US1] Show success toast notification "已保存X张照片到相册"
- [x] T057 [US1] Add "返回首页" button to navigate back to upload page

#### Privacy & Error Handling

- [x] T058 [US1] Create privacy dialog component in `src/components/PrivacyDialog.tsx` explaining photo transmission policy
- [x] T059 [US1] Show privacy dialog on first API call using localStorage flag "privacy_accepted"
- [x] T060 [US1] Implement retry mechanism in axios interceptor (max 3 retries with 2s delay for RETRYABLE_CODES)
- [x] T061 [US1] Add error code mapping in ErrorDialog (INVALID_PHOTO, CONTENT_POLICY_VIOLATION, QUOTA_EXCEEDED, etc.) - implemented in api.ts
- [x] T062 [US1] Implement 30-second generation timeout with clear error message - implemented in api.ts and progress page

**Checkpoint**: P1 MVP完成 - 用户可以完整地上传照片→选择单风格→生成→保存

---

## Phase 4: User Story 2 - 多风格批量生成 (Priority: P2)

**Goal**: 支持同时选择2-3种风格,生成多组照片(每组4张)

**Independent Test**: 上传照片后选择2-3种风格,验证每种风格都生成4张照片,且风格特征明显区分

### Implementation for User Story 2

- [ ] T063 [US2] Update style selection page `src/app/generation/style/page.tsx` to support multi-select (1-3 styles)
- [ ] T064 [US2] Add checkbox-based selection UI replacing radio buttons from P1
- [ ] T065 [US2] Validate max 3 styles selected before enabling "开始生成" button
- [ ] T066 [US2] Update GenerationTask.total_images calculation to `num_styles × 4`
- [ ] T067 [US2] Implement sequential generation loop in progress page for multiple styles
- [ ] T068 [US2] Update progress bar to show "正在生成第X/Y组" with overall progress percentage
- [ ] T069 [US2] Update result page to group images by style_id with style name labels
- [ ] T070 [US2] Add style filter tabs in result page to view each style's 4 images separately
- [ ] T071 [US2] Update filename generation to include style name when saving mixed-style selections

**Checkpoint**: P2完成 - 用户可以批量生成多种风格并按组查看结果

---

## Phase 5: User Story 3 - 照片编辑与重试 (Priority: P2)

**Goal**: 支持照片裁剪和单张重新生成

**Independent Test**: 上传照片→裁剪为3:4比例→生成→对某张结果点击"重新生成"→验证仅该张更新

### Implementation for User Story 3

#### Photo Cropping

- [ ] T072 [P] [US3] Install `react-image-crop` library (version ^11.0.0)
- [ ] T073 [US3] Create PhotoCropper component in `src/components/PhotoCropper.tsx` with react-image-crop integration
- [ ] T074 [US3] Add aspect ratio presets (1:1, 3:4, 4:3) to PhotoCropper component
- [ ] T075 [US3] Update upload page to show "编辑" button on each photo thumbnail
- [ ] T076 [US3] Open PhotoCropper modal when "编辑" clicked, pre-populate with original image
- [ ] T077 [US3] Save crop parameters (crop_ratio, crop_x, crop_y, crop_width, crop_height) to PhotoUpload record
- [ ] T078 [US3] Update photo preview to show cropped version after editing
- [ ] T079 [US3] Apply cropping using Sharp in `src/lib/image.ts` before uploading to nano banana API

#### Single Image Regeneration

- [ ] T080 [US3] Add "重新生成" button to each image card in result page
- [ ] T081 [US3] Implement regenerate API call reusing same photo + style + similarity parameters
- [ ] T082 [US3] Show loading spinner on specific image card during regeneration (keep other 3 intact)
- [ ] T083 [US3] Replace old GeneratedImage record with new one (same task_id, style_id, sequence_num)
- [ ] T084 [US3] Update UI to show new image in same position without page reload
- [ ] T085 [US3] Handle regeneration failure without losing original image (show error, keep old image)

**Checkpoint**: P2完成 - 用户可以精细控制输入质量并优化不满意的生成结果

---

## Phase 6: User Story 4 - 历史记录管理 (Priority: P3)

**Goal**: 查看、重新下载、删除历史生成记录

**Independent Test**: 生成一批照片→退出应用→重新打开→在历史记录中找到之前的生成结果

### Implementation for User Story 4

- [ ] T086 [US4] Create history list page in `src/app/history/page.tsx`
- [ ] T087 [US4] Implement history query in `src/lib/db.ts` (load recent 20 tasks with thumbnails, ordered by created_at DESC)
- [ ] T088 [US4] Display history records in card layout showing: creation time, style names, thumbnail grid (first 4 images)
- [ ] T089 [US4] Add click handler to navigate to history detail page for selected task
- [ ] T090 [US4] Create history detail page in `src/app/history/[taskId]/page.tsx` reusing result page layout
- [ ] T091 [US4] Load all GeneratedImage records for specific task_id
- [ ] T092 [US4] Support re-saving images to album from history (check if already saved to avoid duplicates)
- [ ] T093 [US4] Add long-press delete functionality with confirmation dialog "删除后无法恢复,是否继续?"
- [ ] T094 [US4] Implement delete operation: remove database records + delete local image files using Tauri FS API
- [ ] T095 [US4] Add "一键清理所有历史" button in history list page with double confirmation
- [ ] T096 [US4] Implement storage usage indicator showing total MB used (calculate from file_size in database)
- [ ] T097 [US4] Auto-cleanup mechanism: warn user when storage > 450MB, suggest keeping only 10 recent records

**Checkpoint**: P3完成 - 完整的历史记录管理功能,用户可查找过往生成结果

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [ ] T098 [P] Add loading states to all async operations (file upload, API calls, database queries)
- [ ] T099 [P] Implement optimistic UI updates in Zustand store for smoother UX
- [ ] T100 [P] Add keyboard shortcuts for navigation (Esc to close modals, Arrow keys in preview)
- [ ] T101 Add app-wide error boundary in `src/app/layout.tsx` to catch unhandled errors
- [ ] T102 Implement telemetry-free analytics (local-only usage statistics for SC-005 validation)
- [ ] T103 Add accessibility attributes (ARIA labels) to all interactive components
- [ ] T104 [P] Optimize bundle size: configure Next.js code splitting for app routes
- [ ] T105 [P] Add image lazy loading to history list page (React Suspense + dynamic imports)
- [ ] T106 Implement proper cleanup on component unmount (abort axios requests, close file handles)
- [ ] T107 Add Windows/macOS/Linux app icons to `src-tauri/icons/` directory
- [ ] T108 Configure Tauri build settings in `tauri.conf.json` (app name, version, bundle identifier)
- [ ] T109 Test build for all platforms: Windows (.msi), macOS (.dmg), Linux (.AppImage)
- [ ] T110 [P] Create README.md with installation instructions and development setup
- [ ] T111 [P] Validate quickstart.md instructions by following them in clean environment
- [ ] T112 Run Constitution Check validation: verify Privacy-First (local storage), AI-Transparent (privacy dialog), Graceful Degradation (error handling)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Phase 2 - No dependencies on other stories
  - US2 (P2): Can start after Phase 2 - Extends US1 style selection and result display
  - US3 (P2): Can start after Phase 2 - Extends US1 upload and result pages
  - US4 (P3): Can start after Phase 2 - Independent history feature
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - completely independent MVP
- **User Story 2 (P2)**: Modifies US1 style selection (T063-T064) and result display (T069-T071)
- **User Story 3 (P2)**: Modifies US1 upload page (T075-T078) and result page (T080-T085)
- **User Story 4 (P3)**: Completely independent - only queries existing GenerationTask/GeneratedImage records

### Within Each User Story

**US1 Task Order**:
1. T026-T029 (Database CRUD) → enables all other tasks
2. T030-T035 (Upload) → T036-T040 (Style Selection) → T041-T049 (Generation) → T050-T057 (Result)
3. T058-T062 (Privacy & Error Handling) can be added anytime after T041

**US2 Task Order**:
- T063-T065 (Multi-select UI) → T066-T068 (Generation logic) → T069-T071 (Result grouping)

**US3 Task Order**:
- Cropping: T072-T073 (Component) → T074-T079 (Integration)
- Regeneration: T080 → T081-T085 (sequential)

**US4 Task Order**:
- T086-T088 (List page) → T089-T092 (Detail page) → T093-T097 (Delete & cleanup)

### Parallel Opportunities

**Phase 1 Setup**: T003, T004, T005, T006, T007, T009, T010 can all run in parallel

**Phase 2 Foundational**: T014+T015, T023+T024 can run in parallel

**User Story 1**:
- T026+T027+T028+T029 (all database methods)
- T036 can start early (only needs T029 StyleTemplate query)

**User Story 3**: T072-T073 (cropping component) parallel with T080-T081 (regeneration API)

**Phase 7 Polish**: T098+T099+T100, T104+T105, T110+T111 can run in parallel

---

## Parallel Example: User Story 1 Database Layer

```bash
# Launch all database CRUD implementations together:
Task T026: "Implement PhotoUpload CRUD in src/lib/db.ts"
Task T027: "Implement GenerationTask CRUD in src/lib/db.ts"
Task T028: "Implement GeneratedImage CRUD in src/lib/db.ts"
Task T029: "Implement StyleTemplate query in src/lib/db.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (T026-T062)
4. **STOP and VALIDATE**: Test complete flow independently
5. Build Tauri app and deploy for user testing

**Estimated Timeline**: 2 weeks for MVP (Phase 1+2+3)

### Incremental Delivery

1. Week 1-2: Setup + Foundational + US1 → MVP deployed
2. Week 3: Add US2 (multi-style) → Test independently → Deploy
3. Week 4: Add US3 (cropping + retry) → Test independently → Deploy
4. Week 5: Add US4 (history) → Test independently → Deploy
5. Week 6: Polish + cross-platform testing

**Total Estimated Timeline**: 6 weeks

### Parallel Team Strategy

With 2 developers:

1. Both complete Setup + Foundational together (Week 1)
2. Once Foundational done:
   - Developer A: US1 (Week 2) → US3 cropping (Week 4)
   - Developer B: US2 (Week 3) → US4 history (Week 5)
3. Week 6: Both work on Phase 7 Polish

---

## Success Criteria Validation

Map tasks to success criteria from spec.md:

| Success Criteria | Validated By Tasks | Target |
|------------------|-------------------|--------|
| SC-001: Complete flow ≤2min | T030-T057 (US1 full flow) | ≤2分钟 |
| SC-002: Generation ≤30s | T041-T042, T062 (API + timeout) | ≤30秒 |
| SC-003: Quality validation ≥90% | T031, T033 (validators + face detection) | ≥90% |
| SC-004: Success rate ≥95% | T060 (retry mechanism) | ≥95% |
| SC-006: Multi-style ≤90s | T067-T068 (batch generation) | ≤90秒 |
| SC-007: History load ≤1s | T087 (optimized query with indexes) | ≤1秒 |
| SC-009: Regeneration success ≥95% | T081, T085 (single image retry) | ≥95% |
| SC-010: Storage ≤500MB | T096-T097 (auto-cleanup) | ≤500MB |

---

## Notes

- [P] tasks work on different files with no dependencies - safe to parallelize
- [Story] label maps each task to user story for traceability
- Each user story independently completable and testable per Principle V
- Commit after each task or logical group (e.g., all T026-T029 together)
- Stop at any checkpoint to validate story works independently
- Constitution compliance embedded: Privacy (T058-T059), Error Recovery (T060-T062), Incremental Value (phase structure)
