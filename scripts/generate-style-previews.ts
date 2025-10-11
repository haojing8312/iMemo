/**
 * 风格预览图生成工具
 *
 * 为所有风格自动生成预览图
 * 使用 SeeDream 4.0 API
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

/**
 * 将图片文件转换为 base64
 */
async function imageToBase64(filePath: string): Promise<string> {
  const fileData = await readFile(filePath)
  return fileData.toString('base64')
}

/**
 * 调用 SeeDream API 生成图片
 */
async function generateImage(imageBase64: string, prompt: string): Promise<string> {
  // 正确的端点是 /api/v3/images/generations (参考 src-tauri/src/lib.rs:49)
  const response = await fetch(`${SEEDREAM_BASE_URL}/api/v3/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SEEDREAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      image: [`data:image/jpeg;base64,${imageBase64}`],  // 注意: 必须是数组,包含 data URL
      size: '2K',
      response_format: 'b64_json',
      watermark: false,  // 禁用水印
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

/**
 * 生成示例提示词
 * 将模板中的 [SUBJECT] 替换为具体描述
 */
function generatePrompt(template: string, styleId: string): string {
  // 根据风格类型选择合适的主体描述
  const subjectDescriptions: Record<string, string> = {
    // 婴儿/儿童风格
    'birth': '可爱的亚洲婴儿,大眼睛,粉嫩皮肤,纯真笑容',
    'baby': '可爱的亚洲婴儿,大眼睛,粉嫩皮肤,纯真笑容',
    'child': '天真可爱的亚洲儿童,明亮的眼睛,甜美笑容',

    // 青少年风格
    'teen': '青春活力的亚洲青少年,清澈的眼神,阳光笑容',

    // 成人风格
    'adult': '优雅的亚洲年轻人,温柔的面容,自信的微笑',
    'professional': '专业的亚洲职场人士,得体的着装,自信的神态',

    // 艺术风格通用
    'default': '人物主体'
  }

  // 根据风格特点选择合适的主体
  let subject = subjectDescriptions.default

  // 根据风格ID推测合适的主体
  if (styleId.includes('baby') || styleId.includes('birth') || styleId.includes('infant')) {
    subject = subjectDescriptions.baby
  } else if (styleId.includes('child') || styleId.includes('kid') || styleId.includes('kindergarten')) {
    subject = subjectDescriptions.child
  } else if (styleId.includes('teen') || styleId.includes('youth')) {
    subject = subjectDescriptions.teen
  } else if (styleId.includes('professional') || styleId.includes('business')) {
    subject = subjectDescriptions.professional
  } else {
    subject = subjectDescriptions.adult
  }

  // 替换模板中的占位符
  return template.replace(/\[SUBJECT\]/g, subject)
}

/**
 * 为单个风格生成预览图
 */
async function generateStylePreview(styleId: string, styleName: string, promptTemplate: string) {
  console.log(`\n📸 开始生成: ${styleName} (${styleId})`)

  try {
    // 1. 读取示例照片
    console.log('  ├─ 读取示例照片...')
    const imageBase64 = await imageToBase64(EXAMPLE_PHOTO_PATH)

    // 2. 生成提示词
    console.log('  ├─ 生成提示词...')
    const prompt = generatePrompt(promptTemplate, styleId)
    console.log(`  ├─ 提示词预览: ${prompt.substring(0, 100)}...`)

    // 3. 调用 API 生成图片
    console.log('  ├─ 调用 SeeDream API...')
    const generatedImageBase64 = await generateImage(imageBase64, prompt)

    // 4. 保存预览图
    const outputPath = join(OUTPUT_DIR, `${styleId}.jpg`)
    console.log(`  ├─ 保存预览图到: ${outputPath}`)

    const imageBuffer = Buffer.from(generatedImageBase64, 'base64')
    await writeFile(outputPath, imageBuffer)

    console.log(`  ✅ ${styleName} 预览图生成成功!`)
    return true
  } catch (error: any) {
    console.error(`  ❌ ${styleName} 生成失败:`, error.message)
    return false
  }
}

/**
 * 批量生成所有风格的预览图
 */
async function generateAllPreviews() {
  console.log('🎨 开始生成所有风格预览图...')
  console.log(`📋 共需生成 ${styleConfig.styles.length} 个风格的预览图\n`)

  const results = {
    total: styleConfig.styles.length,
    success: 0,
    failed: 0,
    failedStyles: [] as string[],
  }

  // 逐个生成 (避免并发过多导致 API 限流)
  for (const style of styleConfig.styles) {
    const success = await generateStylePreview(
      style.id,
      style.name,
      style.promptTemplate
    )

    if (success) {
      results.success++
    } else {
      results.failed++
      results.failedStyles.push(style.name)
    }

    // 每个请求之间等待 2 秒,避免 API 限流
    if (style !== styleConfig.styles[styleConfig.styles.length - 1]) {
      console.log('  ⏳ 等待 2 秒后继续...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // 打印总结
  console.log('\n' + '='.repeat(60))
  console.log('📊 生成结果汇总:')
  console.log(`  ✅ 成功: ${results.success}/${results.total}`)
  console.log(`  ❌ 失败: ${results.failed}/${results.total}`)

  if (results.failedStyles.length > 0) {
    console.log('\n失败的风格:')
    results.failedStyles.forEach(name => console.log(`  • ${name}`))
  }

  console.log('='.repeat(60))
}

// 执行生成
generateAllPreviews().catch(console.error)
