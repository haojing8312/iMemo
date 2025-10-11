/**
 * 照片库数据服务
 * 使用 SQLite 数据库进行数据持久化
 */

import type { PhotoUpload, Person, SimilarityLevel, AIPhotoMetadata } from './types'
import type { GeneratedImage } from './types'
import {
  insertLibraryPhoto,
  findAllLibraryPhotos,
  findPhotosByPersonId,
  deleteLibraryPhoto as dbDeleteLibraryPhoto,
  insertPerson,
  findAllPersons,
  updatePersonPhotoCount as dbUpdatePersonPhotoCount,
  deletePerson as dbDeletePerson,
  insertAIPhotoMetadata,
  findAIPhotoMetadata,
} from './database'

// ========================================
// 照片库操作
// ========================================

/**
 * 获取照片库中的所有照片
 */
export async function getAllLibraryPhotos(): Promise<PhotoUpload[]> {
  try {
    return await findAllLibraryPhotos()
  } catch (error) {
    console.error('[PhotoLibraryService] 获取照片列表失败:', error)
    return []
  }
}

/**
 * 添加照片到照片库
 */
export async function addPhotoToLibrary(photo: PhotoUpload): Promise<void> {
  try {
    const libraryPhoto = { ...photo, isInLibrary: true }
    await insertLibraryPhoto(libraryPhoto)
    console.log(`[PhotoLibraryService] 已添加照片: ${photo.id}`)

    // 如果照片关联了人物,更新人物的照片计数
    if (photo.personId) {
      await updatePersonPhotoCount(photo.personId)
    }
  } catch (error) {
    console.error('[PhotoLibraryService] 添加照片失败:', error)
    throw new Error('保存照片失败,请重试')
  }
}

/**
 * 批量添加照片到照片库
 */
export async function addPhotosToLibrary(newPhotos: PhotoUpload[]): Promise<void> {
  try {
    for (const photo of newPhotos) {
      const libraryPhoto = { ...photo, isInLibrary: true }
      await insertLibraryPhoto(libraryPhoto)
    }
    console.log(`[PhotoLibraryService] 已批量添加 ${newPhotos.length} 张照片`)

    // 更新相关人物的照片计数
    const personIds = new Set(newPhotos.map(p => p.personId).filter(Boolean) as string[])
    for (const personId of personIds) {
      await updatePersonPhotoCount(personId)
    }
  } catch (error) {
    console.error('[PhotoLibraryService] 批量添加照片失败:', error)
    throw new Error('保存照片失败,请重试')
  }
}

/**
 * 更新照片信息
 */
export async function updateLibraryPhoto(photoId: string, updates: Partial<PhotoUpload>): Promise<void> {
  try {
    // 读取所有照片
    const photos = await findAllLibraryPhotos()
    const photo = photos.find(p => p.id === photoId)

    if (!photo) {
      console.warn(`[PhotoLibraryService] 照片不存在: ${photoId}`)
      return
    }

    // 删除旧记录
    await dbDeleteLibraryPhoto(photoId)

    // 插入更新后的记录
    const updatedPhoto = { ...photo, ...updates }
    await insertLibraryPhoto(updatedPhoto)

    console.log(`[PhotoLibraryService] 已更新照片: ${photoId}`)

    // 如果更新了人物关联,同步更新人物的照片计数
    if (updates.personId !== undefined) {
      // 更新新人物的计数
      if (updates.personId) {
        await updatePersonPhotoCount(updates.personId)
      }
      // 更新旧人物的计数
      if (photo.personId && photo.personId !== updates.personId) {
        await updatePersonPhotoCount(photo.personId)
      }
    }
  } catch (error) {
    console.error('[PhotoLibraryService] 更新照片失败:', error)
    throw new Error('更新照片失败,请重试')
  }
}

/**
 * 从照片库删除照片
 */
export async function deleteLibraryPhoto(photoId: string): Promise<void> {
  try {
    // 获取照片信息用于清理关联
    const photos = await findAllLibraryPhotos()
    const photo = photos.find(p => p.id === photoId)

    await dbDeleteLibraryPhoto(photoId)
    console.log(`[PhotoLibraryService] 已删除照片: ${photoId}`)

    // 如果照片关联了人物,更新人物的照片计数
    if (photo?.personId) {
      await updatePersonPhotoCount(photo.personId)
    }
  } catch (error) {
    console.error('[PhotoLibraryService] 删除照片失败:', error)
    throw new Error('删除照片失败,请重试')
  }
}

/**
 * 批量删除照片
 */
export async function deleteLibraryPhotos(photoIds: string[]): Promise<void> {
  try {
    const photos = await findAllLibraryPhotos()
    const photosToDelete = photos.filter(p => photoIds.includes(p.id))

    for (const photoId of photoIds) {
      await dbDeleteLibraryPhoto(photoId)
    }

    console.log(`[PhotoLibraryService] 已批量删除 ${photoIds.length} 张照片`)

    // 更新所有相关人物的照片计数
    const affectedPersonIds = new Set(
      photosToDelete.map(p => p.personId).filter(Boolean) as string[]
    )
    for (const personId of affectedPersonIds) {
      await updatePersonPhotoCount(personId)
    }
  } catch (error) {
    console.error('[PhotoLibraryService] 批量删除照片失败:', error)
    throw new Error('删除照片失败,请重试')
  }
}

/**
 * 根据人物筛选照片
 */
export async function getPhotosByPerson(personId: string): Promise<PhotoUpload[]> {
  try {
    return await findPhotosByPersonId(personId)
  } catch (error) {
    console.error('[PhotoLibraryService] 根据人物筛选照片失败:', error)
    return []
  }
}

/**
 * 根据标签筛选照片
 */
export async function getPhotosByTag(tag: string): Promise<PhotoUpload[]> {
  try {
    const photos = await findAllLibraryPhotos()
    return photos.filter(p => p.tags?.includes(tag))
  } catch (error) {
    console.error('[PhotoLibraryService] 根据标签筛选照片失败:', error)
    return []
  }
}

/**
 * 清空照片库
 */
export async function clearLibrary(): Promise<void> {
  try {
    const photos = await findAllLibraryPhotos()
    for (const photo of photos) {
      await dbDeleteLibraryPhoto(photo.id)
    }
    console.log('[PhotoLibraryService] 已清空照片库')
  } catch (error) {
    console.error('[PhotoLibraryService] 清空照片库失败:', error)
    throw new Error('清空照片库失败,请重试')
  }
}

// ========================================
// 人物档案操作
// ========================================

/**
 * 获取所有人物档案
 */
export async function getAllPersons(): Promise<Person[]> {
  try {
    return await findAllPersons()
  } catch (error) {
    console.error('[PhotoLibraryService] 获取人物列表失败:', error)
    return []
  }
}

/**
 * 根据 ID 获取人物
 */
export async function getPersonById(personId: string): Promise<Person | undefined> {
  try {
    const persons = await findAllPersons()
    return persons.find(p => p.id === personId)
  } catch (error) {
    console.error('[PhotoLibraryService] 获取人物失败:', error)
    return undefined
  }
}

/**
 * 创建人物档案
 */
export async function createPerson(data: Omit<Person, 'id' | 'createdAt' | 'photoCount'>): Promise<Person> {
  try {
    const newPerson = await insertPerson({
      ...data,
      photoCount: 0,
    })
    console.log(`[PhotoLibraryService] 已创建人物: ${newPerson.name}`)
    return newPerson
  } catch (error) {
    console.error('[PhotoLibraryService] 创建人物失败:', error)
    throw new Error('创建人物失败,请重试')
  }
}

/**
 * 更新人物档案
 */
export async function updatePerson(
  personId: string,
  updates: Partial<Omit<Person, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const persons = await findAllPersons()
    const person = persons.find(p => p.id === personId)

    if (!person) {
      console.warn(`[PhotoLibraryService] 人物不存在: ${personId}`)
      return
    }

    // 删除旧记录
    await dbDeletePerson(personId)

    // 插入更新后的记录
    const updatedPerson = { ...person, ...updates }
    await insertPerson(updatedPerson)

    console.log(`[PhotoLibraryService] 已更新人物: ${personId}`)
  } catch (error) {
    console.error('[PhotoLibraryService] 更新人物失败:', error)
    throw new Error('更新人物失败,请重试')
  }
}

/**
 * 删除人物档案
 */
export async function deletePerson(personId: string): Promise<void> {
  try {
    await dbDeletePerson(personId)
    console.log(`[PhotoLibraryService] 已删除人物: ${personId}`)

    // 清除所有照片中对该人物的关联
    const photos = await findPhotosByPersonId(personId)
    for (const photo of photos) {
      await updateLibraryPhoto(photo.id, { personId: undefined, personName: undefined })
    }
  } catch (error) {
    console.error('[PhotoLibraryService] 删除人物失败:', error)
    throw new Error('删除人物失败,请重试')
  }
}

/**
 * 更新人物的照片计数
 */
async function updatePersonPhotoCount(personId: string): Promise<void> {
  try {
    const photos = await findPhotosByPersonId(personId)
    const count = photos.length
    await dbUpdatePersonPhotoCount(personId, count)
    console.log(`[PhotoLibraryService] 已更新人物 ${personId} 的照片计数: ${count}`)
  } catch (error) {
    console.error('[PhotoLibraryService] 更新人物照片计数失败:', error)
  }
}

/**
 * 批量关联照片到人物
 */
export async function assignPhotosToPerson(photoIds: string[], personId: string): Promise<void> {
  try {
    const person = await getPersonById(personId)
    if (!person) {
      throw new Error('人物不存在')
    }

    for (const photoId of photoIds) {
      await updateLibraryPhoto(photoId, {
        personId: person.id,
        personName: person.name,
      })
    }

    await updatePersonPhotoCount(personId)
    console.log(`[PhotoLibraryService] 已将 ${photoIds.length} 张照片关联到人物: ${person.name}`)
  } catch (error) {
    console.error('[PhotoLibraryService] 批量关联照片失败:', error)
    throw new Error('关联照片失败,请重试')
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

export async function getLibraryStats(): Promise<LibraryStats> {
  try {
    const photos = await findAllLibraryPhotos()
    const persons = await findAllPersons()
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
  } catch (error) {
    console.error('[PhotoLibraryService] 获取统计信息失败:', error)
    return {
      totalPhotos: 0,
      totalPersons: 0,
      photosWithPerson: 0,
      photosWithoutPerson: 0,
      totalTags: 0,
    }
  }
}

/**
 * 获取所有使用过的标签
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const photos = await findAllLibraryPhotos()
    const tagsSet = new Set<string>()

    photos.forEach(photo => {
      photo.tags?.forEach(tag => tagsSet.add(tag))
    })

    return Array.from(tagsSet).sort()
  } catch (error) {
    console.error('[PhotoLibraryService] 获取标签列表失败:', error)
    return []
  }
}

// ========================================
// AI 生成照片操作
// ========================================

/**
 * 批量保存 AI 生成照片到照片库
 * @param taskId 生成任务 ID
 * @param milestoneName 场景/里程碑名称
 * @param similarityLevel 相似度级别
 * @param results 生成结果列表
 * @param sourcePhotos 原始照片列表
 * @returns 保存的照片数量
 */
export async function saveAIGeneratedPhotos(
  taskId: string,
  milestoneName: string,
  similarityLevel: SimilarityLevel,
  results: GeneratedImage[],
  sourcePhotos: PhotoUpload[]
): Promise<number> {
  try {
    const aiPhotos: PhotoUpload[] = results.map((result) => {
      const styleName = getStyleNameFromId(result.styleId)
      return {
        id: crypto.randomUUID(),
        filePath: result.filePath,
        originalName: `${styleName}-${result.sequenceNum}.png`,
        width: result.width || 1024,
        height: result.height || 1536,
        fileSize: result.fileSize,
        format: 'PNG',
        uploadedAt: result.createdAt,
        isCropped: false,
        isInLibrary: true,
        isAIGenerated: true,
        // 继承第一张原始照片的人物关联
        personId: sourcePhotos[0]?.personId,
        personName: sourcePhotos[0]?.personName,
        // 添加 AI 元数据
        aiMetadata: {
          styleId: result.styleId,
          styleName: styleName,
        },
      }
    })

    // 批量添加到照片库
    await addPhotosToLibrary(aiPhotos)

    // 保存 AI 元数据 - 暂时跳过外键约束问题,等数据库架构修复后再启用
    // TODO: 修复外键约束,确保 styleId 存在于 style_templates 表中
    // 或者修改数据库架构,移除外键约束
    /*
    for (let i = 0; i < aiPhotos.length; i++) {
      const photo = aiPhotos[i]
      const result = results[i]

      await insertAIPhotoMetadata({
        photoId: photo.id,
        sourcePhotoIds: sourcePhotos.map(p => p.id),
        styleId: result.styleId,
        generationPrompt: `${milestoneName} - ${getStyleNameFromId(result.styleId)}`,
        similarityLevel,
        taskId,
      })
    }
    */

    console.log(`[PhotoLibraryService] 已保存 ${aiPhotos.length} 张 AI 照片到照片库`)

    return aiPhotos.length
  } catch (error) {
    console.error('[PhotoLibraryService] 保存 AI 照片失败:', error)
    throw new Error('保存 AI 照片失败,请重试')
  }
}

/**
 * 根据风格 ID 获取风格名称
 * 辅助函数,从风格 ID 提取可读的名称
 */
function getStyleNameFromId(styleId: string): string {
  const styleNameMap: Record<string, string> = {
    'style_warm_home': '居家暖光温馨风',
    'style_fresh_nature': '森系清新治愈风',
    'style_cartoon': '卡通动漫风',
    'style_vintage': '复古可爱胶片风',
    'style_dreamy': '梦幻柔光童话风',
    'style_festival': '节日主题风',
  }

  return styleNameMap[styleId] || styleId
}

/**
 * 根据风格筛选 AI 照片
 */
export async function getPhotosByStyle(styleId: string): Promise<PhotoUpload[]> {
  try {
    const photos = await findAllLibraryPhotos()
    const aiPhotos: PhotoUpload[] = []

    for (const photo of photos) {
      if (photo.isAIGenerated) {
        const metadata = await findAIPhotoMetadata(photo.id)
        if (metadata?.styleId === styleId) {
          aiPhotos.push(photo)
        }
      }
    }

    return aiPhotos
  } catch (error) {
    console.error('[PhotoLibraryService] 根据风格筛选 AI 照片失败:', error)
    return []
  }
}

/**
 * 根据生成任务筛选照片
 */
export async function getPhotosByTask(taskId: string): Promise<PhotoUpload[]> {
  try {
    const photos = await findAllLibraryPhotos()
    const taskPhotos: PhotoUpload[] = []

    for (const photo of photos) {
      if (photo.isAIGenerated) {
        const metadata = await findAIPhotoMetadata(photo.id)
        if (metadata?.taskId === taskId) {
          taskPhotos.push(photo)
        }
      }
    }

    return taskPhotos
  } catch (error) {
    console.error('[PhotoLibraryService] 根据任务筛选照片失败:', error)
    return []
  }
}

/**
 * 获取所有 AI 生成的照片
 */
export async function getAllAIPhotos(): Promise<PhotoUpload[]> {
  try {
    const photos = await findAllLibraryPhotos()
    return photos.filter(p => p.isAIGenerated)
  } catch (error) {
    console.error('[PhotoLibraryService] 获取 AI 照片失败:', error)
    return []
  }
}

/**
 * 获取所有原始照片（非 AI 生成）
 */
export async function getAllOriginalPhotos(): Promise<PhotoUpload[]> {
  try {
    const photos = await findAllLibraryPhotos()
    return photos.filter(p => !p.isAIGenerated)
  } catch (error) {
    console.error('[PhotoLibraryService] 获取原始照片失败:', error)
    return []
  }
}
