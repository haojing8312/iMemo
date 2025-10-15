// 照片库 Zustand Store
// 管理照片库和人物档案的状态

import { useMemo } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { PhotoUpload, Person, PhotoLibraryState } from './types'
import * as photoLibraryService from './photoLibraryService'

export const usePhotoLibrary = create<PhotoLibraryState>((set, get) => ({
  // 初始状态
  libraryPhotos: [],
  persons: [],
  selectedPhotoIds: new Set<string>(),
  currentPersonFilter: undefined,
  currentTypeFilter: 'all',
  currentStyleFilter: undefined,
  currentModeFilter: undefined, // T021: 生成模式筛选

  // ========================================
  // 照片操作
  // ========================================

  /**
   * 添加单张照片到照片库
   */
  addPhotoToLibrary: async (photo: PhotoUpload) => {
    await photoLibraryService.addPhotoToLibrary(photo)
    const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()
    set({ libraryPhotos })
  },

  /**
   * 批量添加照片到照片库
   */
  addPhotosToLibrary: async (photos: PhotoUpload[]) => {
    await photoLibraryService.addPhotosToLibrary(photos)
    const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()
    set({ libraryPhotos })
  },

  /**
   * 更新照片信息
   */
  updatePhoto: async (id: string, data: Partial<PhotoUpload>) => {
    await photoLibraryService.updateLibraryPhoto(id, data)
    const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()
    // 如果更新了人物关联，同时刷新人物列表
    if (data.personId !== undefined) {
      const persons = await photoLibraryService.getAllPersons()
      set({ libraryPhotos, persons })
    } else {
      set({ libraryPhotos })
    }
  },

  /**
   * 从照片库删除单张照片
   */
  deletePhotoFromLibrary: async (id: string) => {
    const photo = get().libraryPhotos.find(p => p.id === id)
    await photoLibraryService.deleteLibraryPhoto(id)
    const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()

    // 如果照片被选中，取消选中
    const selectedPhotoIds = get().selectedPhotoIds
    if (selectedPhotoIds.has(id)) {
      selectedPhotoIds.delete(id)
      set({ libraryPhotos, selectedPhotoIds: new Set(selectedPhotoIds) })
    } else {
      set({ libraryPhotos })
    }

    // 如果照片关联了人物，刷新人物列表
    if (photo?.personId) {
      const persons = await photoLibraryService.getAllPersons()
      set({ persons })
    }
  },

  /**
   * 批量删除照片
   */
  deletePhotosFromLibrary: async (ids: string[]) => {
    const photosToDelete = get().libraryPhotos.filter(p => ids.includes(p.id))
    await photoLibraryService.deleteLibraryPhotos(ids)
    const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()

    // 清除被删除照片的选中状态
    const selectedPhotoIds = get().selectedPhotoIds
    ids.forEach(id => selectedPhotoIds.delete(id))
    set({ libraryPhotos, selectedPhotoIds: new Set(selectedPhotoIds) })

    // 如果有照片关联了人物，刷新人物列表
    const hasPersonPhotos = photosToDelete.some(p => p.personId)
    if (hasPersonPhotos) {
      const persons = await photoLibraryService.getAllPersons()
      set({ persons })
    }
  },

  /**
   * 从存储加载照片库
   */
  loadLibraryPhotos: async () => {
    const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()
    set({ libraryPhotos })
  },

  // ========================================
  // 人物操作
  // ========================================

  /**
   * 创建人物档案
   */
  addPerson: async (personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPerson = await photoLibraryService.createPerson(personData)
    const persons = await photoLibraryService.getAllPersons()
    set({ persons })
    return newPerson
  },

  /**
   * 更新人物档案
   */
  updatePerson: async (id: string, data: Partial<Person>) => {
    await photoLibraryService.updatePerson(id, data)
    const persons = await photoLibraryService.getAllPersons()
    set({ persons })

    // 如果更新了人物名称，同步更新相关照片的 personName
    if (data.name) {
      const photos = get().libraryPhotos
      const affectedPhotos = photos.filter(p => p.personId === id)
      if (affectedPhotos.length > 0) {
        for (const photo of affectedPhotos) {
          await photoLibraryService.updateLibraryPhoto(photo.id, { personName: data.name })
        }
        const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()
        set({ libraryPhotos })
      }
    }
  },

  /**
   * 删除人物档案
   */
  deletePerson: async (id: string) => {
    await photoLibraryService.deletePerson(id)
    const persons = await photoLibraryService.getAllPersons()
    const libraryPhotos = await photoLibraryService.getAllLibraryPhotos()
    set({ persons, libraryPhotos })

    // 如果正在筛选该人物，清除筛选
    if (get().currentPersonFilter === id) {
      set({ currentPersonFilter: undefined })
    }
  },

  /**
   * 从存储加载人物列表
   */
  loadPersons: async () => {
    const persons = await photoLibraryService.getAllPersons()
    set({ persons })
  },

  // ========================================
  // 选择操作
  // ========================================

  /**
   * 设置选中的照片 ID 集合
   */
  setSelectedPhotoIds: (ids: Set<string>) => {
    set({ selectedPhotoIds: ids })
  },

  /**
   * 切换照片的选中状态
   */
  togglePhotoSelection: (id: string) => {
    const selectedPhotoIds = get().selectedPhotoIds
    const newSet = new Set(selectedPhotoIds)

    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      // 无限制选择
      newSet.add(id)
    }

    set({ selectedPhotoIds: newSet })
  },

  /**
   * 清除所有选择
   */
  clearSelection: () => {
    set({ selectedPhotoIds: new Set<string>() })
  },

  // ========================================
  // 筛选操作
  // ========================================

  /**
   * 设置人物筛选
   */
  setPersonFilter: (personId?: string) => {
    set({ currentPersonFilter: personId })
  },

  /**
   * 设置照片类型筛选
   */
  setTypeFilter: (type) => {
    set({ currentTypeFilter: type })
    // 如果不是筛选 AI 照片，清除风格筛选和模式筛选 (T021)
    if (type !== 'ai') {
      set({ currentStyleFilter: undefined, currentModeFilter: undefined })
    }
  },

  /**
   * 设置风格筛选（仅对 AI 照片有效）
   */
  setStyleFilter: (styleId?: string) => {
    set({ currentStyleFilter: styleId })
  },

  /**
   * T021: 设置生成模式筛选（仅对 AI 照片有效）
   */
  setModeFilter: (mode?: 'single' | 'multi') => {
    set({ currentModeFilter: mode })
  },
}))

// ========================================
// 便捷 Selectors
// ========================================

/**
 * 获取筛选后的照片列表
 * 使用 useMemo 缓存筛选结果,避免无限循环
 */
export function useFilteredPhotos() {
  // 分别获取各个依赖项
  const libraryPhotos = usePhotoLibrary(state => state.libraryPhotos)
  const currentTypeFilter = usePhotoLibrary(state => state.currentTypeFilter)
  const currentPersonFilter = usePhotoLibrary(state => state.currentPersonFilter)
  const currentStyleFilter = usePhotoLibrary(state => state.currentStyleFilter)
  const currentModeFilter = usePhotoLibrary(state => state.currentModeFilter) // T021

  // 使用 useMemo 缓存筛选结果
  return useMemo(() => {
    let photos = libraryPhotos

    // 类型筛选
    if (currentTypeFilter === 'original') {
      photos = photos.filter(p => !p.isAIGenerated)
    } else if (currentTypeFilter === 'ai') {
      photos = photos.filter(p => p.isAIGenerated)
    }

    // 人物筛选
    if (currentPersonFilter) {
      photos = photos.filter(p => p.personId === currentPersonFilter)
    }

    // 风格筛选（仅对 AI 照片有效）
    if (currentStyleFilter && currentTypeFilter === 'ai') {
      photos = photos.filter(p => p.aiMetadata?.styleId === currentStyleFilter)
    }

    // T021: 生成模式筛选（仅对 AI 照片有效）
    if (currentModeFilter && currentTypeFilter === 'ai') {
      photos = photos.filter(p => p.aiMetadata?.generationMode === currentModeFilter)
    }

    return photos
  }, [libraryPhotos, currentTypeFilter, currentPersonFilter, currentStyleFilter, currentModeFilter])
}

/**
 * 获取当前选中的照片数量
 */
export function useSelectedCount() {
  return usePhotoLibrary(state => state.selectedPhotoIds.size)
}

/**
 * 获取照片库统计信息
 */
export function useLibraryStats() {
  const libraryPhotos = usePhotoLibrary(state => state.libraryPhotos)
  const persons = usePhotoLibrary(state => state.persons)

  return useMemo(() => ({
    totalPhotos: libraryPhotos.length,
    totalPersons: persons.length,
    photosWithPerson: libraryPhotos.filter(p => p.personId).length,
    photosWithoutPerson: libraryPhotos.filter(p => !p.personId).length,
  }), [libraryPhotos, persons])
}

/**
 * 根据人物 ID 获取照片数量
 */
export function usePersonPhotoCount(personId: string) {
  return usePhotoLibrary(state =>
    state.libraryPhotos.filter(p => p.personId === personId).length
  )
}

/**
 * 获取所有 AI 照片的可用风格列表（去重）
 */
export function useAvailableAIStyles() {
  const libraryPhotos = usePhotoLibrary(state => state.libraryPhotos)

  return useMemo(() => {
    const aiPhotos = libraryPhotos.filter(p => p.isAIGenerated)
    const stylesMap = new Map<string, string>() // styleId -> styleName

    aiPhotos.forEach(photo => {
      if (photo.aiMetadata) {
        stylesMap.set(photo.aiMetadata.styleId, photo.aiMetadata.styleName)
      }
    })

    return Array.from(stylesMap.entries()).map(([id, name]) => ({ id, name }))
  }, [libraryPhotos])
}
