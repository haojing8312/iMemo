// API 测试脚本
// 使用 Node.js 运行: node test-api.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 从 .env.local 读取配置
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let BASE_URL = '';
let API_KEY = '';

envLines.forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_NANO_BANANA_BASE_URL=')) {
    BASE_URL = line.split('=')[1].trim();
  }
  if (line.startsWith('NEXT_PUBLIC_NANO_BANANA_API_KEY=')) {
    API_KEY = line.split('=')[1].trim();
  }
});

console.log('=== API 配置信息 ===');
console.log('BASE_URL:', BASE_URL);
console.log('API_KEY:', API_KEY ? '***' + API_KEY.slice(-4) : 'NOT SET');
console.log('');

// 读取测试图片（如果存在）
function getTestImageBase64() {
  const testImagePath = path.join(__dirname, 'test-image.jpg');

  if (fs.existsSync(testImagePath)) {
    const imageBuffer = fs.readFileSync(testImagePath);
    return imageBuffer.toString('base64');
  }

  // 创建一个简单的测试图片（1x1像素的红色图片）
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  return base64;
}

async function testAPI() {
  console.log('=== 开始测试 API (Gemini Image Preview 模型) ===\n');

  const testImageBase64 = getTestImageBase64();
  const testPrompt = 'Generate a beautiful portrait photo of this person in traditional Chinese style';

  try {
    console.log('发送请求到:', BASE_URL);
    console.log('请求内容:', {
      model: 'gemini-2.5-flash-image-preview',
      messages: '...(省略)',
      max_tokens: 4096
    });
    console.log('');

    const response = await axios.post(
      BASE_URL,
      {
        model: 'gemini-2.5-flash-image-preview', // 使用 Gemini 图片生成模型
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Based on the reference image provided, please generate a new image with the following style: ${testPrompt}. Return the generated image.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${testImageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 60000
      }
    );

    console.log('✅ API 调用成功！');
    console.log('');
    console.log('=== 响应信息 ===');
    console.log('状态码:', response.status);
    console.log('响应数据结构:', JSON.stringify(response.data, null, 2));
    console.log('');

    // 分析响应
    if (response.data.choices && response.data.choices[0]) {
      const content = response.data.choices[0].message?.content;
      console.log('=== 返回内容 ===');
      console.log('内容类型:', typeof content);
      console.log('内容长度:', content ? content.length : 0);
      console.log('内容预览:', content ? content.substring(0, 200) + '...' : 'N/A');
      console.log('');

      // 检查是否包含 base64 图片
      const hasBase64Image = content && content.includes('base64');
      console.log('是否包含 base64 图片:', hasBase64Image ? '✅ 是' : '❌ 否');

      if (!hasBase64Image) {
        console.log('');
        console.log('⚠️  注意: API 返回的是文本内容，不是图片！');
        console.log('这个 API 端点可能不支持图片生成。');
        console.log('');
        console.log('建议检查:');
        console.log('1. API 文档中关于图片生成的端点');
        console.log('2. 是否需要使用 DALL-E 或其他图片生成模型');
        console.log('3. 请求格式是否正确');
      }
    } else {
      console.log('⚠️  响应格式不符合预期');
    }

  } catch (error) {
    console.log('❌ API 调用失败');
    console.log('');
    console.log('=== 错误信息 ===');

    if (error.response) {
      // 服务器返回了错误响应
      console.log('状态码:', error.response.status);
      console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log('请求超时或网络错误');
      console.log('错误详情:', error.message);
    } else {
      // 其他错误
      console.log('错误:', error.message);
    }

    console.log('');
    console.log('故障排查建议:');
    console.log('1. 检查 BASE_URL 是否正确');
    console.log('2. 检查 API_KEY 是否有效');
    console.log('3. 检查网络连接');
    console.log('4. 查看 API 文档确认请求格式');
  }
}

// 测试简单的连接
async function testConnection() {
  console.log('=== 测试 API 连接 ===\n');

  try {
    const response = await axios.post(
      BASE_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test.'
          }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 30000
      }
    );

    console.log('✅ 基础连接测试成功！');
    console.log('响应:', response.data.choices[0].message.content);
    console.log('');

    // 继续测试图片生成
    await testAPI();

  } catch (error) {
    console.log('❌ 基础连接测试失败');
    console.log('错误:', error.response?.data || error.message);
    console.log('');
    console.log('跳过图片生成测试...');
  }
}

// 运行测试
console.log('');
console.log('████████████████████████████████████████');
console.log('        API 功能测试工具');
console.log('████████████████████████████████████████');
console.log('');

testConnection();
