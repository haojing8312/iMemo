// 照片库 Zustand Store
// 管理照片库和人物档案的状态

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

  // ========================================
  // 照片操作
  // ========================================

  /**
   * 添加单张照片到照片库
   */
  addPhotoToLibrary: async (photo: PhotoUpload) => {
    photoLibraryService.addPhotoToLibrary(photo)
    const libraryPhotos = photoLibraryService.getAllLibraryPhotos()
    set({ libraryPhotos })
  },

  /**
   * 批量添加照片到照片库
   */
  addPhotosToLibrary: async (photos: PhotoUpload[]) => {
    photoLibraryService.addPhotosToLibrary(photos)
    const libraryPhotos = photoLibraryService.getAllLibraryPhotos()
    set({ libraryPhotos })
  },

  /**
   * 更新照片信息
   */
  updatePhoto: async (id: string, data: Partial<PhotoUpload>) => {
    photoLibraryService.updateLibraryPhoto(id, data)
    const libraryPhotos = photoLibraryService.getAllLibraryPhotos()
    // 如果更新了人物关联，同时刷新人物列表
    if (data.personId !== undefined) {
      const persons = photoLibraryService.getAllPersons()
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
    photoLibraryService.deleteLibraryPhoto(id)
    const libraryPhotos = photoLibraryService.getAllLibraryPhotos()

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
      const persons = photoLibraryService.getAllPersons()
      set({ persons })
    }
  },

  /**
   * 批量删除照片
   */
  deletePhotosFromLibrary: async (ids: string[]) => {
    const photosToDelete = get().libraryPhotos.filter(p => ids.includes(p.id))
    photoLibraryService.deleteLibraryPhotos(ids)
    const libraryPhotos = photoLibraryService.getAllLibraryPhotos()

    // 清除被删除照片的选中状态
    const selectedPhotoIds = get().selectedPhotoIds
    ids.forEach(id => selectedPhotoIds.delete(id))
    set({ libraryPhotos, selectedPhotoIds: new Set(selectedPhotoIds) })

    // 如果有照片关联了人物，刷新人物列表
    const hasPersonPhotos = photosToDelete.some(p => p.personId)
    if (hasPersonPhotos) {
      const persons = photoLibraryService.getAllPersons()
      set({ persons })
    }
  },

  /**
   * 从存储加载照片库
   */
  loadLibraryPhotos: async () => {
    const libraryPhotos = photoLibraryService.getAllLibraryPhotos()
    set({ libraryPhotos })
  },

  // ========================================
  // 人物操作
  // ========================================

  /**
   * 创建人物档案
   */
  addPerson: async (personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPerson = photoLibraryService.createPerson(personData)
    const persons = photoLibraryService.getAllPersons()
    set({ persons })
    return newPerson
  },

  /**
   * 更新人物档案
   */
  updatePerson: async (id: string, data: Partial<Person>) => {
    photoLibraryService.updatePerson(id, data)
    const persons = photoLibraryService.getAllPersons()
    set({ persons })

    // 如果更新了人物名称，同步更新相关照片的 personName
    if (data.name) {
      const photos = get().libraryPhotos
      const affectedPhotos = photos.filter(p => p.personId === id)
      if (affectedPhotos.length > 0) {
        affectedPhotos.forEach(photo => {
          photoLibraryService.updateLibraryPhoto(photo.id, { personName: data.name })
        })
        const libraryPhotos = photoLibraryService.getAllLibraryPhotos()
        set({ libraryPhotos })
      }
    }
  },

  /**
   * 删除人物档案
   */
  deletePerson: async (id: string) => {
    photoLibraryService.deletePerson(id)
    const persons = photoLibraryService.getAllPersons()
    const libraryPhotos = photoLibraryService.getAllLibraryPhotos()
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
    const persons = photoLibraryService.getAllPersons()
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
      // 限制最多选择 5 张
      if (newSet.size < 5) {
        newSet.add(id)
      }
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
}))

// ========================================
// 便捷 Selectors
// ========================================

/**
 * 获取筛选后的照片列表
 */
export function useFilteredPhotos() {
  return usePhotoLibrary(
    useShallow(state => {
      if (!state.currentPersonFilter) {
        return state.libraryPhotos
      }
      return state.libraryPhotos.filter(p => p.personId === state.currentPersonFilter)
    })
  )
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
  return usePhotoLibrary(
    useShallow(state => ({
      totalPhotos: state.libraryPhotos.length,
      totalPersons: state.persons.length,
      photosWithPerson: state.libraryPhotos.filter(p => p.personId).length,
      photosWithoutPerson: state.libraryPhotos.filter(p => !p.personId).length,
    }))
  )
}

/**
 * 根据人物 ID 获取照片数量
 */
export function usePersonPhotoCount(personId: string) {
  return usePhotoLibrary(state =>
    state.libraryPhotos.filter(p => p.personId === personId).length
  )
}
