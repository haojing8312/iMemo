// Global state management with Zustand
// Manages upload photos, selected styles, current task, milestones, and progress

import { create } from 'zustand'
import type { AppStore, PhotoUpload, SimilarityLevel, GenerationMode, FaceValidationResult } from './types'
import type { Milestone } from './types/milestone'
import type { GenerationTask, TaskProgress } from './types/task'

interface ExtendedAppStore extends AppStore {
  // Milestone state (T014)
  selectedMilestone: Milestone | null
  setSelectedMilestone: (milestone: Milestone | null) => void
  clearMilestone: () => void

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

  // 003-2: 模式管理状态
  generationMode: 'single' as GenerationMode,
  photoValidationResults: new Map<string, FaceValidationResult>(),

  // Milestone state (T014 - NEW)
  selectedMilestone: null,

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

  // 003-2: 模式管理 actions
  setGenerationMode: (mode) => set({ generationMode: mode }),

  setPhotoValidationResult: (photoId, result) =>
    set((state) => {
      const newResults = new Map(state.photoValidationResults)
      newResults.set(photoId, result)
      return { photoValidationResults: newResults }
    }),

  clearValidationResults: () =>
    set({ photoValidationResults: new Map<string, FaceValidationResult>() }),

  // Task progress actions (T015 - NEW)
  setCurrentTask: (task) =>
    set({
      currentTask: task,
      taskProgress: task?.progress || null,
    }),

  updateProgress: (progress) =>
    set((state) => {
      // 如果没有当前任务,不更新
      if (!state.currentTask) {
        return {
          taskProgress: state.taskProgress
            ? { ...state.taskProgress, ...progress }
            : null,
        }
      }

      // 同时更新 currentTask.progress 和 taskProgress,保持数据一致性
      const updatedProgress = state.currentTask.progress
        ? { ...state.currentTask.progress, ...progress }
        : progress

      return {
        currentTask: {
          ...state.currentTask,
          progress: updatedProgress,
        },
        taskProgress: updatedProgress,
      }
    }),

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
      generationMode: 'single',
      photoValidationResults: new Map<string, FaceValidationResult>(),
      currentTask: null,
      taskProgress: null,
    }),
}))
