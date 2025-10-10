// 照片库数据服务
// 管理照片库和人物档案的数据持久化

import type { PhotoUpload, Person } from './types'

const STORAGE_KEYS = {
  LIBRARY_PHOTOS: 'homememo_library_photos',
  PERSONS: 'homememo_persons',
} as const

// ========================================
// 辅助函数
// ========================================

function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`读取 ${key} 失败:`, error)
    return null
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`保存 ${key} 失败:`, error)
    throw new Error('保存数据失败，请检查存储空间')
  }
}

// ========================================
// 照片库操作
// ========================================

/**
 * 获取照片库中的所有照片
 */
export function getAllLibraryPhotos(): PhotoUpload[] {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.LIBRARY_PHOTOS) || []
  // 按上传时间倒序排序
  return photos.sort((a, b) => b.uploadedAt - a.uploadedAt)
}

/**
 * 添加照片到照片库
 */
export function addPhotoToLibrary(photo: PhotoUpload): void {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.LIBRARY_PHOTOS) || []
  // 标记为照片库照片
  const libraryPhoto = { ...photo, isInLibrary: true }
  photos.push(libraryPhoto)
  setItem(STORAGE_KEYS.LIBRARY_PHOTOS, photos)
}

/**
 * 批量添加照片到照片库
 */
export function addPhotosToLibrary(newPhotos: PhotoUpload[]): void {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.LIBRARY_PHOTOS) || []
  // 标记为照片库照片
  const libraryPhotos = newPhotos.map(p => ({ ...p, isInLibrary: true }))
  photos.push(...libraryPhotos)
  setItem(STORAGE_KEYS.LIBRARY_PHOTOS, photos)
}

/**
 * 更新照片信息
 */
export function updateLibraryPhoto(photoId: string, updates: Partial<PhotoUpload>): void {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.LIBRARY_PHOTOS) || []
  const index = photos.findIndex(p => p.id === photoId)

  if (index !== -1) {
    photos[index] = { ...photos[index], ...updates }
    setItem(STORAGE_KEYS.LIBRARY_PHOTOS, photos)

    // 如果更新了人物关联，同步更新人物的照片计数
    if (updates.personId !== undefined) {
      const person = getPersonById(updates.personId)
      if (person) {
        updatePersonPhotoCount(person.id)
      }
    }
  }
}

/**
 * 从照片库删除照片
 */
export function deleteLibraryPhoto(photoId: string): void {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.LIBRARY_PHOTOS) || []
  const photo = photos.find(p => p.id === photoId)
  const filtered = photos.filter(p => p.id !== photoId)
  setItem(STORAGE_KEYS.LIBRARY_PHOTOS, filtered)

  // 如果照片关联了人物，更新人物的照片计数
  if (photo?.personId) {
    updatePersonPhotoCount(photo.personId)
  }
}

/**
 * 批量删除照片
 */
export function deleteLibraryPhotos(photoIds: string[]): void {
  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.LIBRARY_PHOTOS) || []
  const photosToDelete = photos.filter(p => photoIds.includes(p.id))
  const filtered = photos.filter(p => !photoIds.includes(p.id))
  setItem(STORAGE_KEYS.LIBRARY_PHOTOS, filtered)

  // 更新所有相关人物的照片计数
  const affectedPersonIds = new Set(
    photosToDelete.map(p => p.personId).filter(Boolean) as string[]
  )
  affectedPersonIds.forEach(personId => {
    updatePersonPhotoCount(personId)
  })
}

/**
 * 根据人物筛选照片
 */
export function getPhotosByPerson(personId: string): PhotoUpload[] {
  const photos = getAllLibraryPhotos()
  return photos.filter(p => p.personId === personId)
}

/**
 * 根据标签筛选照片
 */
export function getPhotosByTag(tag: string): PhotoUpload[] {
  const photos = getAllLibraryPhotos()
  return photos.filter(p => p.tags?.includes(tag))
}

/**
 * 清空照片库
 */
export function clearLibrary(): void {
  setItem(STORAGE_KEYS.LIBRARY_PHOTOS, [])
}

// ========================================
// 人物档案操作
// ========================================

/**
 * 获取所有人物档案
 */
export function getAllPersons(): Person[] {
  const persons = getItem<Person[]>(STORAGE_KEYS.PERSONS) || []
  // 按创建时间倒序排序
  return persons.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 根据 ID 获取人物
 */
export function getPersonById(personId: string): Person | undefined {
  const persons = getAllPersons()
  return persons.find(p => p.id === personId)
}

/**
 * 创建人物档案
 */
export function createPerson(data: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'photoCount'>): Person {
  const persons = getItem<Person[]>(STORAGE_KEYS.PERSONS) || []

  const newPerson: Person = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    photoCount: 0,
  }

  persons.push(newPerson)
  setItem(STORAGE_KEYS.PERSONS, persons)

  return newPerson
}

/**
 * 更新人物档案
 */
export function updatePerson(personId: string, updates: Partial<Omit<Person, 'id' | 'createdAt'>>): void {
  const persons = getItem<Person[]>(STORAGE_KEYS.PERSONS) || []
  const index = persons.findIndex(p => p.id === personId)

  if (index !== -1) {
    persons[index] = {
      ...persons[index],
      ...updates,
      updatedAt: Date.now(),
    }
    setItem(STORAGE_KEYS.PERSONS, persons)
  }
}

/**
 * 删除人物档案
 */
export function deletePerson(personId: string): void {
  const persons = getItem<Person[]>(STORAGE_KEYS.PERSONS) || []
  const filtered = persons.filter(p => p.id !== personId)
  setItem(STORAGE_KEYS.PERSONS, filtered)

  // 清除所有照片中对该人物的关联
  const photos = getAllLibraryPhotos()
  photos.forEach(photo => {
    if (photo.personId === personId) {
      updateLibraryPhoto(photo.id, { personId: undefined, personName: undefined })
    }
  })
}

/**
 * 更新人物的照片计数
 */
function updatePersonPhotoCount(personId: string): void {
  const photos = getAllLibraryPhotos()
  const count = photos.filter(p => p.personId === personId).length

  const persons = getItem<Person[]>(STORAGE_KEYS.PERSONS) || []
  const index = persons.findIndex(p => p.id === personId)

  if (index !== -1) {
    persons[index] = {
      ...persons[index],
      photoCount: count,
      updatedAt: Date.now(),
    }
    setItem(STORAGE_KEYS.PERSONS, persons)
  }
}

/**
 * 批量关联照片到人物
 */
export function assignPhotosToPerson(photoIds: string[], personId: string): void {
  const person = getPersonById(personId)
  if (!person) {
    throw new Error('人物不存在')
  }

  const photos = getItem<PhotoUpload[]>(STORAGE_KEYS.LIBRARY_PHOTOS) || []
  let updated = false

  photos.forEach((photo, index) => {
    if (photoIds.includes(photo.id)) {
      photos[index] = {
        ...photo,
        personId: person.id,
        personName: person.name,
      }
      updated = true
    }
  })

  if (updated) {
    setItem(STORAGE_KEYS.LIBRARY_PHOTOS, photos)
    updatePersonPhotoCount(personId)
  }
}

// ========================================
// 统计信息
// ========================================

/**
 * 获取照片库统计信息
 */
export interface LibraryStats {
  totalPhotos: number
  totalPersons: number
  photosWithPerson: number
  photosWithoutPerson: number
  totalTags: number
}

export function getLibraryStats(): LibraryStats {
  const photos = getAllLibraryPhotos()
  const persons = getAllPersons()
  const allTags = new Set<string>()

  photos.forEach(photo => {
    photo.tags?.forEach(tag => allTags.add(tag))
  })

  return {
    totalPhotos: photos.length,
    totalPersons: persons.length,
    photosWithPerson: photos.filter(p => p.personId).length,
    photosWithoutPerson: photos.filter(p => !p.personId).length,
    totalTags: allTags.size,
  }
}

/**
 * 获取所有使用过的标签
 */
export function getAllTags(): string[] {
  const photos = getAllLibraryPhotos()
  const tagsSet = new Set<string>()

  photos.forEach(photo => {
    photo.tags?.forEach(tag => tagsSet.add(tag))
  })

  return Array.from(tagsSet).sort()
}
