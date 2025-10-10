# Implementation Plan: Life Milestone Photo Generation with Auto-Style Mode

**Branch**: `002-12-18-ai` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-12-18-ai/spec.md`

## Summary

Extend the existing "百岁照" application into a comprehensive life milestone photo generation system covering all life stages (birth to elderly). Key innovations include:

1. **Multi-Milestone Support**: 15+ milestone types across 5 life stage categories
2. **Auto-Generation Mode**: One-click generation of 12-20 images in multiple artistic styles
3. **Configuration-Driven**: JSON-based milestone and style definitions for rapid expansion
4. **Graceful Degradation**: Continues generation even if individual styles fail

**Technical Approach**: Extend existing Next.js + Tauri + TypeScript stack with configuration loader, multi-style generator, and enhanced UI for milestone/style selection.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 14.2 (App Router), Rust (Tauri 2.0 backend)
**Primary Dependencies**: React 18, Zustand 5.0, Tailwind CSS 4.x, Zod (validation), shadcn/ui
**Storage**: localStorage (runtime data) + JSON files (configuration) + Tauri file system (photos)
**Testing**: Vitest + React Testing Library (unit/integration), Manual E2E testing
**Target Platform**: Desktop (Windows, macOS, Linux) via Tauri 2.0
**Project Type**: Desktop application (Next.js static export + Tauri)
**Performance Goals**: 12-20 images generated in <60s, config loading <100ms, UI interactions <16ms (60fps)
**Constraints**: localStorage <5MB, maintain existing architecture, no breaking changes to Phase 1 features
**Scale/Scope**: 50+ styles, 15+ milestones, support up to 100 concurrent tasks in history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **No violations detected** - This feature extends existing architecture without introducing new complexity:
- Reuses existing Next.js + Tauri stack
- No new runtime dependencies (only Zod for validation)
- Maintains localStorage approach from Phase 1
- Configuration files are simple JSON (no new database)
- No new external services required

## Project Structure

### Documentation (this feature)

```
specs/002-12-18-ai/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Technology research (completed)
├── data-model.md        # Data structures & schemas (completed)
├── quickstart.md        # Implementation guide (completed)
├── contracts/           # API contracts (completed)
│   └── README.md
├── checklists/
│   └── requirements.md  # Spec validation checklist
└── tasks.md             # Task breakdown (run /speckit.tasks to generate)
```

### Source Code (repository root)

**Structure Decision**: Desktop application using Next.js App Router + Tauri

```
src/
├── app/                         # Next.js App Router pages
│   ├── generation/
│   │   ├── milestone/
│   │   │   ├── page.tsx         # NEW: Milestone selection
│   │   │   └── [milestoneId]/
│   │   │       └── page.tsx     # NEW: Style selection
│   │   ├── progress/
│   │   │   └── page.tsx         # MODIFY: Multi-style progress
│   │   ├── result/
│   │   │   └── page.tsx         # MODIFY: Results by style
│   │   └── admin/
│   │       └── styles/
│   │           └── page.tsx     # NEW: Style management (P3)
│   └── upload/
│       └── page.tsx             # EXISTING: Photo upload (reuse)
├── components/
│   ├── ui/                      # EXISTING: shadcn components (reuse)
│   ├── MilestoneCard.tsx        # NEW: Milestone display
│   ├── CategoryTabs.tsx         # NEW: Life stage navigation
│   ├── StyleGallery.tsx         # NEW: Style grid view
│   ├── StyleCard.tsx            # NEW: Individual style card
│   └── ErrorDialog.tsx          # EXISTING: Error display (reuse)
├── lib/
│   ├── types/                   # NEW: TypeScript types
│   │   ├── milestone.ts         # Milestone types & Zod schemas
│   │   ├── style.ts             # Style types & Zod schemas
│   │   └── task.ts              # Task types & Zod schemas
│   ├── configLoader.ts          # NEW: Load JSON configs
│   ├── milestoneService.ts      # NEW: Milestone data access
│   ├── styleService.ts          # NEW: Style data access
│   ├── taskService.ts           # NEW: Task management
│   ├── multiStyleGenerator.ts   # NEW: Multi-style generation
│   ├── api.ts                   # EXISTING: Gemini API client (extend)
│   ├── storage.ts               # EXISTING: localStorage utils (reuse)
│   ├── store.ts                 # EXISTING: Zustand store (extend)
│   └── imageUtils.ts            # EXISTING: Image utilities (reuse)
├── config/                      # NEW: Configuration files
│   ├── milestones.json          # Milestone definitions
│   └── styles.json              # Style definitions
└── __tests__/                   # Test files
    ├── configLoader.test.ts
    ├── multiStyleGenerator.test.ts
    └── ...

public/
└── styles/                      # NEW: Style example images
    ├── romantic-soft-focus.jpg
    ├── soft-pastel.jpg
    └── ...

src-tauri/                       # EXISTING: Tauri backend (minimal changes)
├── src/
│   └── lib.rs
└── tauri.conf.json
```

**Key Architecture Points**:
1. **Reuse existing Phase 1 infrastructure** (upload, storage, API client)
2. **Add new configuration layer** (JSON files + Zod validation)
3. **Extend App Router** with new milestone/style routes
4. **Introduce multi-style generator** as orchestration layer
5. **No breaking changes** to existing Phase 1 features

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0: Research (Complete)

**Output**: `research.md`

**Key Decisions**:
- ✅ Continue Next.js 14.2 + Tauri 2.0 + TypeScript stack
- ✅ Hybrid storage: localStorage (runtime) + JSON files (configuration)
- ✅ Zod for runtime validation of configurations
- ✅ Sequential multi-style generation with graceful degradation
- ✅ Configuration-driven development pattern

## Phase 1: Design (Complete)

**Outputs**:
- `data-model.md` - Complete data structures and schemas
- `contracts/README.md` - Function signatures and error types
- `quickstart.md` - 7-phase implementation guide with timeline

**Key Artifacts**:
- MilestoneConfig and StyleConfig JSON schemas
- GenerationTask, UploadedPhoto, GenerationResult interfaces
- Service layer contracts (milestoneService, styleService, taskService)
- Multi-style generator contract with progress callbacks

## Phase 2: Task Breakdown (Next)

**Command**: `/speckit.tasks`

**Expected Output**: `tasks.md` with dependency-ordered implementation tasks

## Implementation Summary

**Estimated Timeline**: 4-5 days for MVP (P1 features)

**Day 1**: Configuration setup + Data layer (Phases 1-2 of quickstart)
**Day 2**: Milestone & Style selection UI (Phase 3.1-3.2)
**Day 3**: Progress tracking + Multi-style generation (Phases 3.3-4)
**Day 4**: Testing + Polish (Phases 6-7)
**Day 5** (optional): Admin UI (Phase 5, P3 priority)

**Performance Targets**:
- 12-20 images generated in <60 seconds (SC-002)
- Configuration loading <100ms
- UI interactions <16ms (60fps)
- localStorage usage <5MB

**Key Risks & Mitigations**:
1. **Risk**: Individual style generation failures
   - **Mitigation**: Graceful degradation, continue with remaining styles
2. **Risk**: Configuration file validation errors
   - **Mitigation**: Zod schemas with clear error messages
3. **Risk**: localStorage quota exceeded
   - **Mitigation**: Automatic cleanup of tasks >30 days old
