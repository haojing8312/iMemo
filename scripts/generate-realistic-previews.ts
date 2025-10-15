/**
 * 批量生成真实影楼风格预览图
 *
 * 功能:
 * 1. 读取 styles-realistic-studio.ts 的14个风格配置
 * 2. 使用 public/styles/cozy-home-warm.jpg 作为参考照片
 * 3. 使用动态提示词生成器为每个风格生成预览图
 * 4. 保存到 public/styles/ 目录
 *
 * 使用方法:
 * pnpm tsx scripts/generate-realistic-previews.ts
 */

import fs from 'fs/promises'
import path from 'path'
import { config } from 'dotenv'
import { realisticStudioStyles } from '../src/config/styles-realistic-studio'
import { generatePrompt } from '../src/lib/promptGenerator'

// 加载环境变量
config({ path: '.env.local' })

// 配置
const REFERENCE_PHOTO = 'public/styles/cozy-home-warm.jpg'
const OUTPUT_DIR = 'public/styles'
const MILESTONE_ID = '100-day' // 使用百日照里程碑
const IMAGES_PER_STYLE = 1 // 每个风格生成1张预览图

/**
 * 将图片文件转换为 base64
 */
async function imageToBase64(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  return buffer.toString('base64')
}

/**
 * 将 base64 图片保存为文件
 */
async function saveBase64Image(base64Data: string, outputPath: string): Promise<void> {
  // 移除 data URL 前缀
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64String, 'base64')
  await fs.writeFile(outputPath, buffer)
}

/**
 * 调用 Seedream API 生成图片
 */
async function generateImageWithSeedream(
  imageBase64: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.SEEDREAM_API_KEY || process.env.NEXT_PUBLIC_SEEDREAM_API_KEY
  const baseUrl = (process.env.SEEDREAM_BASE_URL || process.env.NEXT_PUBLIC_SEEDREAM_BASE_URL || 'https://ark.cn-beijing.volces.com').trim()

  if (!apiKey) {
    throw new Error('未配置 SEEDREAM_API_KEY 环境变量')
  }

  console.log(`  [API] 调用 Seedream API...`)
  console.log(`  [API] Base URL: ${baseUrl}`)
  console.log(`  [API] Prompt 长度: ${prompt.length} 字符`)

  // 按照 Tauri 后端的实现方式构造请求
  const url = `${baseUrl.replace(/\/$/, '')}/api/v3/images/generations`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'doubao-seedream-4-0-250828',
      prompt: prompt,
      image: [`data:image/jpeg;base64,${imageBase64}`], // 注意:这是一个数组,包含完整的 data URL
      response_format: 'b64_json',
      size: '2K',
      watermark: false
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Seedream API 调用失败: ${response.status} ${errorText}`)
  }

  const result = await response.json()
  const imageData = result?.data?.[0]?.b64_json

  if (!imageData) {
    throw new Error('Seedream API 未返回图片数据')
  }

  return `data:image/png;base64,${imageData}`
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================')
  console.log('批量生成真实影楼风格预览图')
  console.log('========================================\n')

  // 1. 检查参考照片是否存在
  console.log(`[1/5] 检查参考照片...`)
  const referencePhotoPath = path.resolve(REFERENCE_PHOTO)
  try {
    await fs.access(referencePhotoPath)
    console.log(`  ✓ 参考照片存在: ${REFERENCE_PHOTO}\n`)
  } catch {
    console.error(`  ✗ 参考照片不存在: ${REFERENCE_PHOTO}`)
    console.error(`  请确保文件存在后重试\n`)
    process.exit(1)
  }

  // 2. 转换参考照片为 base64
  console.log(`[2/5] 转换参考照片为 base64...`)
  const imageBase64 = await imageToBase64(referencePhotoPath)
  console.log(`  ✓ Base64 转换完成, 长度: ${imageBase64.length} 字符\n`)

  // 3. 获取所有影楼风格
  console.log(`[3/5] 加载影楼风格配置...`)
  const styles = realisticStudioStyles.styles
  console.log(`  ✓ 找到 ${styles.length} 个影楼风格\n`)

  // 4. 逐个生成预览图
  console.log(`[4/5] 开始生成预览图...`)
  console.log(`  里程碑: ${MILESTONE_ID}`)
  console.log(`  输出目录: ${OUTPUT_DIR}\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < styles.length; i++) {
    const style = styles[i]
    const styleNum = i + 1

    console.log(`[${styleNum}/${styles.length}] ${style.name} (${style.id})`)

    try {
      // 4.1 使用 promptGenerator 生成完整提示词
      const promptResult = generatePrompt({
        styleId: style.id,
        milestoneId: MILESTONE_ID,
        debug: false
      })

      if (!promptResult.success) {
        throw new Error(promptResult.error || '提示词生成失败')
      }

      console.log(`  ✓ 提示词生成成功`)

      // 4.2 调用 Seedream API 生成图片
      const imageDataUrl = await generateImageWithSeedream(imageBase64, promptResult.prompt)
      console.log(`  ✓ 图片生成成功`)

      // 4.3 保存图片
      const outputFilename = `${style.exampleImage.split('/').pop()}`
      const outputPath = path.join(OUTPUT_DIR, outputFilename)
      await saveBase64Image(imageDataUrl, outputPath)
      console.log(`  ✓ 已保存: ${outputFilename}\n`)

      successCount++

      // 添加延迟避免 API 限流
      if (i < styles.length - 1) {
        console.log(`  等待 2 秒...\n`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

    } catch (error: any) {
      console.error(`  ✗ 失败: ${error.message}\n`)
      failCount++
    }
  }

  // 5. 总结
  console.log(`[5/5] 生成完成!`)
  console.log(`========================================`)
  console.log(`成功: ${successCount} 个`)
  console.log(`失败: ${failCount} 个`)
  console.log(`总计: ${styles.length} 个`)
  console.log(`========================================\n`)

  if (failCount > 0) {
    console.log(`⚠️  有 ${failCount} 个风格生成失败,请检查错误信息`)
    process.exit(1)
  } else {
    console.log(`✅ 所有预览图生成成功!`)
    console.log(`\n请刷新应用查看新的预览图`)
  }
}

// 运行主函数
main().catch(error => {
  console.error('\n❌ 脚本执行失败:', error)
  process.exit(1)
})
