/**
 * 为单个风格生成预览图
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { styleConfig } from '../src/config/styles'

// SeeDream API 配置
const SEEDREAM_API_KEY = process.env.NEXT_PUBLIC_SEEDREAM_API_KEY || '94ad3075-e977-4839-a520-b5243202326d'
const SEEDREAM_BASE_URL = process.env.NEXT_PUBLIC_SEEDREAM_BASE_URL || 'https://ark.cn-beijing.volces.com'
const MODEL = 'doubao-seedream-4-0-250828'

// 示例人物照片路径
const EXAMPLE_PHOTO_PATH = join(process.cwd(), 'public/test-images/seedream-test-1759981600449.png')

// 预览图输出目录
const OUTPUT_DIR = join(process.cwd(), 'public/styles')

// 要生成的风格ID
const STYLE_ID = 'cel-animation-90s'

async function imageToBase64(filePath: string): Promise<string> {
  const fileData = await readFile(filePath)
  return fileData.toString('base64')
}

async function generateImage(imageBase64: string, prompt: string): Promise<string> {
  const response = await fetch(`${SEEDREAM_BASE_URL}/api/v3/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SEEDREAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      image: [`data:image/jpeg;base64,${imageBase64}`],
      size: '2K',
      response_format: 'b64_json',
      watermark: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error [${response.status}]: ${errorText}`)
  }

  const result = await response.json()
  const imageData = result.data?.[0]?.b64_json || result.data?.[0]?.b64Json

  if (!imageData) {
    throw new Error(`未返回图片数据。API响应: ${JSON.stringify(result)}`)
  }

  return imageData
}

function generatePrompt(template: string): string {
  const subject = '优雅的亚洲年轻人,温柔的面容,自信的微笑'
  return template.replace(/\[SUBJECT\]/g, subject)
}

async function main() {
  const style = styleConfig.styles.find(s => s.id === STYLE_ID)

  if (!style) {
    console.error(`❌ 未找到风格: ${STYLE_ID}`)
    return
  }

  console.log(`📸 开始生成: ${style.name} (${style.id})`)

  try {
    console.log('  ├─ 读取示例照片...')
    const imageBase64 = await imageToBase64(EXAMPLE_PHOTO_PATH)

    console.log('  ├─ 生成提示词...')
    const prompt = generatePrompt(style.promptTemplate)
    console.log(`  ├─ 提示词预览: ${prompt.substring(0, 100)}...`)

    console.log('  ├─ 调用 SeeDream API...')
    const generatedImageBase64 = await generateImage(imageBase64, prompt)

    const outputPath = join(OUTPUT_DIR, `${style.id}.jpg`)
    console.log(`  ├─ 保存预览图到: ${outputPath}`)

    const imageBuffer = Buffer.from(generatedImageBase64, 'base64')
    await writeFile(outputPath, imageBuffer)

    console.log(`  ✅ ${style.name} 预览图生成成功!`)
  } catch (error: any) {
    console.error(`  ❌ ${style.name} 生成失败:`, error.message)
  }
}

main()
