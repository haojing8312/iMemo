/**
 * SeeDream 4.0 官方 API 测试脚本
 * 测试图像生成并保存到本地
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

// 手动读取 .env.local 文件
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ 未找到 .env.local 文件')
    console.error('请先创建 .env.local 文件并配置 SEEDREAM_API_KEY')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const env = {}

  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return env
}

const env = loadEnv()
const API_KEY = env.SEEDREAM_API_KEY
const BASE_URL = env.SEEDREAM_BASE_URL || 'https://ark.cn-beijing.volces.com'
const MODEL = 'doubao-seedream-4-0-250828'

console.log('='.repeat(60))
console.log('SeeDream 4.0 API 测试')
console.log('='.repeat(60))
console.log('BASE_URL:', BASE_URL)
console.log('API_KEY:', API_KEY ? '***' + API_KEY.slice(-4) : 'NOT SET')
console.log('MODEL:', MODEL)
console.log('='.repeat(60))

async function testSeeDreamAPI() {
  try {
    console.log('\n📝 正在生成测试图片...')
    console.log('提示词: A cute Chinese baby smiling, soft pastel colors')

    const response = await axios.post(
      `${BASE_URL}/api/v3/images/generations`,
      {
        model: MODEL,
        prompt: 'A cute Chinese baby (6 months old, East Asian features) with a gentle smile, sitting on a soft white blanket. Soft pastel colors, dreamy atmosphere, professional photography, high quality.',
        size: '1K', // 使用 1K 测试,速度更快
        response_format: 'b64_json', // 返回 base64 格式
        watermark: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        timeout: 90000, // 90秒超时
      }
    )

    console.log('✅ API 调用成功!')
    console.log('响应状态:', response.status)
    console.log('响应数据结构:', Object.keys(response.data))

    // 检查响应数据
    if (!response.data.data || !response.data.data[0]) {
      console.error('❌ 响应数据格式不正确:', JSON.stringify(response.data, null, 2))
      return
    }

    const imageData = response.data.data[0]
    console.log('图片数据字段:', Object.keys(imageData))

    // 提取 base64 图片数据
    const base64Image = imageData.b64_json

    if (!base64Image) {
      console.error('❌ 未找到 b64_json 字段')
      console.error('可用字段:', Object.keys(imageData))
      return
    }

    console.log('✅ 成功获取图片数据')
    console.log('Base64 数据长度:', base64Image.length)

    // 保存图片到本地
    const outputDir = path.join(__dirname, '../public/test-images')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const timestamp = Date.now()
    const outputPath = path.join(outputDir, `seedream-test-${timestamp}.png`)

    // 将 base64 转换为 buffer 并保存
    const imageBuffer = Buffer.from(base64Image, 'base64')
    fs.writeFileSync(outputPath, imageBuffer)

    console.log('✅ 图片已保存到:', outputPath)
    console.log('文件大小:', (imageBuffer.length / 1024).toFixed(2), 'KB')

    console.log('\n' + '='.repeat(60))
    console.log('🎉 测试成功完成!')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n' + '='.repeat(60))
    console.error('❌ 测试失败')
    console.error('='.repeat(60))

    if (error.response) {
      console.error('HTTP 状态码:', error.response.status)
      console.error('错误响应:', JSON.stringify(error.response.data, null, 2))
    } else if (error.request) {
      console.error('网络错误: 无法连接到服务器')
      console.error('请求配置:', error.config?.url)
    } else {
      console.error('错误信息:', error.message)
    }

    process.exit(1)
  }
}

// 运行测试
testSeeDreamAPI()
