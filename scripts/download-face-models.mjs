#!/usr/bin/env node
/**
 * 下载 face-api.js 模型文件
 * 运行: node scripts/download-face-models.mjs
 */

import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MODEL_DIR = join(__dirname, '../public/face-models')
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'

// 需要下载的模型文件
const MODELS = [
  // TinyFaceDetector (轻量级人脸检测)
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',

  // FaceLandmark68Net (人脸特征点检测)
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
]

async function downloadFile(url, destPath) {
  console.log(`下载: ${url}`)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const fileStream = createWriteStream(destPath)
    await pipeline(response.body, fileStream)

    console.log(`✓ 已保存: ${destPath}`)
  } catch (error) {
    console.error(`✗ 下载失败: ${url}`, error.message)
    throw error
  }
}

async function main() {
  console.log('开始下载 face-api.js 模型文件...\n')

  // 创建目录
  await mkdir(MODEL_DIR, { recursive: true })
  console.log(`创建目录: ${MODEL_DIR}\n`)

  // 下载所有模型文件
  for (const filename of MODELS) {
    const url = `${BASE_URL}/${filename}`
    const destPath = join(MODEL_DIR, filename)

    try {
      await downloadFile(url, destPath)
    } catch (error) {
      console.error(`跳过文件: ${filename}`)
    }
  }

  console.log('\n✓ 模型文件下载完成!')
  console.log(`总计: ${MODELS.length} 个文件`)
}

main().catch(error => {
  console.error('下载过程出错:', error)
  process.exit(1)
})
