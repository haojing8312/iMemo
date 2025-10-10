/**
 * Export Service
 * Handles image export functionality for Tauri desktop app
 */

import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'

export interface ExportOptions {
  imageUrl: string
  suggestedName: string
}

/**
 * Save single image to user-selected location
 */
export async function saveImageToAlbum(options: ExportOptions): Promise<boolean> {
  const { imageUrl, suggestedName } = options

  try {
    // Let user choose save location
    const filePath = await save({
      defaultPath: suggestedName,
      filters: [{
        name: 'Images',
        extensions: ['png', 'jpg', 'jpeg']
      }]
    })

    if (!filePath) {
      // User cancelled
      return false
    }

    // Fetch image data
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Write to file using Tauri FS
    await writeFile(filePath, uint8Array)

    return true
  } catch (error) {
    console.error('保存图片失败:', error)
    throw error
  }
}

/**
 * Save multiple images to user-selected directory
 */
export async function saveBatchToAlbum(images: ExportOptions[]): Promise<number> {
  let successCount = 0

  for (const image of images) {
    try {
      const saved = await saveImageToAlbum(image)
      if (saved) {
        successCount++
      }

      // Add delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`保存 ${image.suggestedName} 失败:`, error)
    }
  }

  return successCount
}
