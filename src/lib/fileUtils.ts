// Tauri文件系统工具函数
// 用于下载和保存图片到本地应用数据目录

import { appDataDir, join, pictureDir } from '@tauri-apps/api/path'
import { loadSettings } from './storage'
import { mkdir, writeFile, exists } from '@tauri-apps/plugin-fs'
import axios from 'axios'

/**
 * 获取应用数据目录路径
 */
export async function getAppDataPath(): Promise<string> {
  return await appDataDir()
}

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath: string): Promise<void> {
  const dirExists = await exists(dirPath)
  if (!dirExists) {
    await mkdir(dirPath, { recursive: true })
  }
}

/**
 * 从URL下载图片到本地
 * @param url 图片CDN URL
 * @param taskId 任务ID (用于组织文件夹)
 * @param styleId 风格ID
 * @param sequenceNum 序号 (1-4)
 * @returns 本地文件路径
 */
export async function downloadImageToLocal(
  url: string,
  taskId: string,
  styleId: string,
  sequenceNum: number
): Promise<string> {
  try {
    // 计算根目录：优先用户设置目录，否则使用 appData
    const settings = loadSettings()
    const root = settings.dataRootDir && settings.dataRootDir.length > 0
      ? settings.dataRootDir
      : await getAppDataPath()
    // 构建本地路径: {root}/HomeMemo/generated/{taskId}/{styleId}_{sequenceNum}.jpg
    const generatedDir = await join(root, 'HomeMemo', 'generated', taskId)

    // 确保目录存在
    await ensureDir(generatedDir)

    // 下载图片
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30秒超时
    })

    // 生成文件名
    const filename = `${styleId}_${sequenceNum}.jpg`
    const localPath = await join(generatedDir, filename)

    // 写入文件
    const uint8Array = new Uint8Array(response.data)
    await writeFile(localPath, uint8Array)

    console.log(`图片已下载: ${localPath}`)

    return localPath
  } catch (error) {
    console.error(`下载图片失败: ${url}`, error)
    throw new Error('图片下载失败')
  }
}

/**
 * 批量下载图片
 * @param images 图片数组 [{url, taskId, styleId, sequenceNum}]
 * @param onProgress 进度回调 (current, total)
 * @returns 本地路径数组
 */
export async function downloadImagesInBatch(
  images: Array<{
    url: string
    taskId: string
    styleId: string
    sequenceNum: number
  }>,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const localPaths: string[] = []

  for (let i = 0; i < images.length; i++) {
    const image = images[i]

    try {
      const localPath = await downloadImageToLocal(
        image.url,
        image.taskId,
        image.styleId,
        image.sequenceNum
      )
      localPaths.push(localPath)

      if (onProgress) {
        onProgress(i + 1, images.length)
      }
    } catch (error) {
      console.error(`跳过图片 ${i + 1}:`, error)
      // 继续下载其他图片
    }
  }

  return localPaths
}

/**
 * 将 dataURL 图片保存到应用数据目录，并返回本地文件路径
 */
export async function saveDataUrlImageToLocal(
  dataUrl: string,
  taskId: string,
  styleId: string,
  sequenceNum: number
): Promise<string> {
  // data:image/png;base64,XXXX
  const commaIndex = dataUrl.indexOf(',')
  const base64Part = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl

  // base64 转 Uint8Array
  const binaryString = atob(base64Part)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const settings = loadSettings()
  const root = settings.dataRootDir && settings.dataRootDir.length > 0
    ? settings.dataRootDir
    : await getAppDataPath()
  const generatedDir = await join(root, 'HomeMemo', 'generated', taskId)
  await ensureDir(generatedDir)

  const filename = `${styleId}_${sequenceNum}.png`
  const localPath = await join(generatedDir, filename)
  await writeFile(localPath, bytes)
  return localPath
}

/**
 * 保存图片到用户相册 (Pictures目录)
 * @param sourcePath 源文件路径
 * @param albumFilename 相册文件名
 * @returns 相册路径
 */
export async function saveToAlbum(
  sourcePath: string,
  albumFilename: string
): Promise<string> {
  const { readFile } = await import('@tauri-apps/plugin-fs')

  try {
    // 读取源文件
    const fileData = await readFile(sourcePath)

    // 获取Pictures目录
    const picturesPath = await pictureDir()
    const homeMemoAlbum = await join(picturesPath, 'HomeMemo')

    // 确保HomeMemo文件夹存在
    await ensureDir(homeMemoAlbum)

    // 保存到相册
    const albumPath = await join(homeMemoAlbum, albumFilename)
    await writeFile(albumPath, fileData)

    console.log(`已保存到相册: ${albumPath}`)

    return albumPath
  } catch (error) {
    console.error(`保存到相册失败:`, error)
    throw new Error('保存到相册失败')
  }
}

/**
 * 生成相册文件名
 * @param styleName 风格名称
 * @param sequenceNum 序号
 * @param createdAt 创建时间
 * @returns 格式化的文件名 (YYYYMMDD-风格名-序号.jpg)
 */
export function generateAlbumFilename(
  styleName: string,
  sequenceNum: number,
  createdAt: number
): string {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const dateStr = `${year}${month}${day}`

  return `${dateStr}-${styleName}-${sequenceNum}.jpg`
}
