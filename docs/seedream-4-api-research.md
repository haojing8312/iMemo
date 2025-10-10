# SeeDream 4.0 API 调研报告

**调研日期**: 2025-10-09
**模型**: SeeDream 4.0 (字节跳动/ByteDance)
**用途**: HomeMemo 百岁照生成功能配图生成

---

## 📊 价格对比

### 官方渠道 - BytePlus (字节跳动官方)

| 平台 | 价格/图 | 免费额度 | 说明 |
|------|---------|----------|------|
| **BytePlus 官方** | $0.03 | 200张免费 | 官方 API，稳定可靠 |

### 第三方 API 平台

| 平台 | 价格/图 | 免费额度 | 优惠折扣 |
|------|---------|----------|----------|
| **API易 (推荐)** | **$0.025** | $0.1 (4张) | **相比官方便宜 17%** |
| Segmind | 按需定价 | - | 支持 4K 生成 |
| CometAPI | 按需定价 | - | 多模型聚合平台 |
| AI/ML API | 按需定价 | - | 超快速生成 |

---

## 💰 成本计算

### HomeMemo 项目需求
- **需要生成**: 11 张风格示例图 (800x600, 4:3 比例)
- **预估成本** (使用 API易):
  - 11 张 × $0.025 = **$0.275** (约 ¥2 人民币)
  - 考虑重新生成备选 (每个风格生成 2-3 张): 33 张 × $0.025 = **$0.825** (约 ¥6 人民币)

### 与其他方案对比

| 方案 | 单张成本 | 11张总成本 | 优缺点 |
|------|----------|------------|---------|
| **SeeDream 4.0** | $0.025 | $0.275 | ✅ 便宜、快速、质量高 |
| Google Imagen 3 | 免费/收费 | 视账户 | ⚠️ 可能有配额限制 |
| Midjourney | $10/月订阅 | 订阅制 | ❌ 按月付费，不适合少量需求 |
| DALL-E 3 | $0.04-0.08 | $0.44-0.88 | ⚠️ 较贵 |

---

## 🔧 API 调用方法

### 推荐平台：API易 (兼容 OpenAI 格式)

#### 1. 基础配置

```python
import openai

client = openai.OpenAI(
    api_key="your_api_key",  # 从 API易 获取
    base_url="https://vip.apiyi.com/v1"
)
```

#### 2. 文生图 (Text-to-Image)

```python
response = client.images.generate(
    model="seedream-4-0-250828",
    prompt="Please generate on this blank canvas: A professional portrait photography in soft pastel style...",
    size="1024x1024",  # 支持: 1024x1024, 2048x2048, 4096x4096
    n=1,  # 生成数量 (1-15)
    response_format="url"  # 或 "b64_json"
)

image_url = response.data[0].url
print(f"生成的图片: {image_url}")
```

#### 3. 图生图 (Image-to-Image)

```python
# 上传白底图作为参考
with open("public/templates/white-base-4x3.png", "rb") as f:
    base64_image = base64.b64encode(f.read()).decode()

response = client.images.edit(
    model="seedream-4-0-250828",
    image=base64_image,
    prompt="Please generate on this blank canvas: ...",
    size="1024x1024",
    n=1
)
```

#### 4. 支持的图片尺寸

| 尺寸 | 分辨率 | 适用场景 |
|------|--------|----------|
| 1K | 1024×1024 | 快速预览 |
| 2K | 2048×2048 | 高质量输出 |
| 4K | 4096×4096 | 超高清大图 |

**注意**: HomeMemo 需要 800×600 (4:3)，可以使用 1024×768 或 2048×1536 生成后裁剪

---

## ⚙️ 关键参数说明

### 必需参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `model` | string | 模型名称 | `"seedream-4-0-250828"` |
| `prompt` | string | 提示词 | `"A Chinese baby..."` |
| `size` | string | 图片尺寸 | `"1024x1024"` |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `n` | integer | 1 | 生成数量 (1-15) |
| `response_format` | string | `"url"` | 返回格式: `url` 或 `b64_json` |
| `quality` | string | `"standard"` | 质量: `standard` 或 `hd` |

---

## ✅ SeeDream 4.0 特点

### 优势

1. **价格便宜**: $0.025/张，比 Imagen 3、DALL-E 便宜
2. **速度快**: 平均生成时间 5-10 秒
3. **中文友好**: 字节跳动出品，更懂中文提示词
4. **高质量**: 支持 4K 超高清生成
5. **兼容性好**: 使用 OpenAI SDK，无需学习新 API
6. **批量生成**: 单次可生成 1-15 张

### 适合场景

- ✅ 游戏资产生成
- ✅ 电商产品图
- ✅ 社交媒体内容
- ✅ 角色设计
- ✅ **人物肖像摄影** (HomeMemo 需求)

---

## 🚀 使用建议

### HomeMemo 项目集成方案

#### 方案一：直接调用 API易 (推荐)

**优点**:
- 价格最低 ($0.025/张)
- 兼容 OpenAI SDK，代码简单
- 免费 $0.1 额度可测试

**缺点**:
- 需要注册账号
- 需要充值

**实施步骤**:
1. 注册 API易 账号
2. 获取 API Key
3. 使用提供的 Python/Node.js 代码生成图片
4. 下载保存到 `public/styles/`

#### 方案二：使用 Google Imagen 3 (备选)

**优点**:
- 可能有免费配额
- Google 官方支持

**缺点**:
- 价格不透明
- 可能需要 GCP 账号
- 对中文提示词支持可能不如 SeeDream

---

## 📋 完整代码示例

### Python 批量生成 11 张风格图

```python
import openai
import requests
import os

# 配置 API
client = openai.OpenAI(
    api_key="your_api_key_here",
    base_url="https://vip.apiyi.com/v1"
)

# 读取提示词 CSV
import csv

prompts = []
with open('docs/style-prompts-table.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        prompts.append({
            'id': row['风格ID'],
            'name': row['风格名称'],
            'filename': row['文件名'],
            'prompt': row['AI生图提示词（英文 - 中国面孔版 + 画布引导）']
        })

# 批量生成
output_dir = 'public/styles/'
os.makedirs(output_dir, exist_ok=True)

for style in prompts:
    print(f"正在生成 {style['name']} ({style['filename']})...")

    try:
        response = client.images.generate(
            model="seedream-4-0-250828",
            prompt=style['prompt'],
            size="1024x1024",  # 或 "2048x1536" for 4:3
            n=1,
            response_format="url"
        )

        # 下载图片
        image_url = response.data[0].url
        img_data = requests.get(image_url).content

        # 保存到文件
        output_path = os.path.join(output_dir, style['filename'])
        with open(output_path, 'wb') as f:
            f.write(img_data)

        print(f"✅ 成功: {output_path}")

    except Exception as e:
        print(f"❌ 失败: {style['name']} - {e}")

print("\n🎉 批量生成完成!")
```

### Node.js 版本

```javascript
const OpenAI = require('openai');
const fs = require('fs');
const https = require('https');
const csv = require('csv-parser');

const client = new OpenAI({
  apiKey: 'your_api_key_here',
  baseURL: 'https://vip.apiyi.com/v1'
});

async function generateStyleImages() {
  const prompts = [];

  // 读取 CSV
  fs.createReadStream('docs/style-prompts-table.csv')
    .pipe(csv())
    .on('data', (row) => prompts.push(row))
    .on('end', async () => {
      for (const style of prompts) {
        console.log(`生成 ${style['风格名称']}...`);

        try {
          const response = await client.images.generate({
            model: 'seedream-4-0-250828',
            prompt: style['AI生图提示词（英文 - 中国面孔版 + 画布引导）'],
            size: '1024x1024',
            n: 1
          });

          const imageUrl = response.data[0].url;
          const outputPath = `public/styles/${style['文件名']}`;

          // 下载图片
          await downloadImage(imageUrl, outputPath);
          console.log(`✅ 成功: ${outputPath}`);

        } catch (error) {
          console.error(`❌ 失败: ${style['风格名称']}`, error);
        }
      }
    });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

generateStyleImages();
```

---

## 💡 最终推荐

### 推荐使用：SeeDream 4.0 via API易

**理由**:
1. **成本最低**: $0.275 生成 11 张图 (约 ¥2)
2. **质量高**: 字节跳动模型，中文友好
3. **速度快**: 5-10 秒/张
4. **集成简单**: 兼容 OpenAI SDK
5. **免费测试**: $0.1 免费额度

**下一步行动**:
1. 注册 API易 账号: https://www.apiyi.com
2. 获取 API Key
3. 充值 $5 (可生成 200 张，足够测试和正式使用)
4. 运行批量生成脚本
5. 验证图片质量和风格

---

## 📝 注意事项

1. **比例问题**: SeeDream 4.0 标准尺寸是正方形，需要使用自定义尺寸或后期裁剪到 4:3
2. **提示词优化**: 已有的"Please generate on this blank canvas:"前缀完全适用
3. **中国面孔**: SeeDream 4.0 对中文和亚洲面孔支持很好，提示词中的"Chinese"关键词应该能准确识别
4. **批量限制**: 单次请求最多生成 15 张，足够我们使用

---

**总结**: SeeDream 4.0 是 HomeMemo 项目生成风格配图的**最佳选择**，性价比高、质量好、速度快！

---

**参考资料**:
- BytePlus 官网: https://www.byteplus.com/en/product/Seedream
- API易 文档: https://help.apiyi.com/seedream-4-0-usage-comprehensive-guide.html
- SeeDream 4.0 发布: https://seed.bytedance.com/en/seedream4_0
