// Global state management with Zustand
// Manages upload photos, selected styles, current task, milestones, and progress

import { create } from 'zustand'
import type { AppStore, PhotoUpload, SimilarityLevel } from './types'
import type { Milestone } from './types/milestone'
import type { GenerationTask, TaskProgress, GenerationMode } from './types/task'

interface ExtendedAppStore extends AppStore {
  // Milestone state (T014)
  selectedMilestone: Milestone | null
  setSelectedMilestone: (milestone: Milestone | null) => void
  clearMilestone: () => void
  generationMode: GenerationMode
  setGenerationMode: (mode: GenerationMode) => void

  // Task progress state (T015)
  currentTask: GenerationTask | null
  setCurrentTask: (task: GenerationTask | null) => void
  taskProgress: TaskProgress | null
  updateProgress: (progress: Partial<TaskProgress>) => void
  clearTask: () => void
}

export const useAppStore = create<ExtendedAppStore>((set) => ({
  // Initial state (existing)
  currentTaskId: undefined,
  uploadedPhotos: [],
  selectedStyleIds: [],
  similarityLevel: 'medium',

  // Milestone state (T014 - NEW)
  selectedMilestone: null,
  generationMode: 'auto',

  // Task progress state (T015 - NEW)
  currentTask: null,
  taskProgress: null,

  // Actions (existing)
  setUploadedPhotos: (photos) => set({ uploadedPhotos: photos }),

  addPhoto: (photo) =>
    set((state) => ({
      uploadedPhotos: [...state.uploadedPhotos, photo],
    })),

  removePhoto: (photoId) =>
    set((state) => ({
      uploadedPhotos: state.uploadedPhotos.filter((p) => p.id !== photoId),
    })),

  setSelectedStyleIds: (styleIds) => set({ selectedStyleIds: styleIds }),

  setSimilarityLevel: (level) => set({ similarityLevel: level }),

  setCurrentTaskId: (taskId) => set({ currentTaskId: taskId }),

  // Milestone actions (T014 - NEW)
  setSelectedMilestone: (milestone) => set({ selectedMilestone: milestone }),

  clearMilestone: () => set({ selectedMilestone: null }),

  setGenerationMode: (mode) => set({ generationMode: mode }),

  // Task progress actions (T015 - NEW)
  setCurrentTask: (task) =>
    set({
      currentTask: task,
      taskProgress: task?.progress || null,
    }),

  updateProgress: (progress) =>
    set((state) => ({
      taskProgress: state.taskProgress
        ? { ...state.taskProgress, ...progress }
        : null,
    })),

  clearTask: () =>
    set({
      currentTask: null,
      taskProgress: null,
    }),

  reset: () =>
    set({
      currentTaskId: undefined,
      uploadedPhotos: [],
      selectedStyleIds: [],
      similarityLevel: 'medium',
      selectedMilestone: null,
      generationMode: 'auto',
      currentTask: null,
      taskProgress: null,
    }),
}))
