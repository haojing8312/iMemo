# 多模型图像生成 API 使用指南

## 概述

HomeMemo 的图像生成 API 现已支持多种 AI 模型,您可以通过环境变量轻松切换。

## 支持的模型

| 模型 | ID | 价格/图 | 特点 |
|------|-----|---------|------|
| **Google Gemini 2.5 Flash** | `gemini` | 免费/收费 | 默认模型,适合快速测试 |
| **SeeDream 4.0** | `seedream` | $0.03 | 字节跳动出品,中文友好,200张免费 |

## 配置方法

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件:

```bash
# 复制模板文件
cp .env.local.example .env.local
```

### 2. 配置环境变量

编辑 `.env.local` 文件:

#### 使用 Gemini (默认)

```env
# 选择模型
AI_IMAGE_MODEL=gemini

# Gemini API 配置
NEXT_PUBLIC_NANO_BANANA_API_KEY=your_google_api_key_here
NEXT_PUBLIC_NANO_BANANA_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

#### 使用 SeeDream 4.0

```env
# 选择模型
AI_IMAGE_MODEL=seedream

# SeeDream API 配置 (BytePlus 官方)
SEEDREAM_API_KEY=your_byteplus_api_key_here
SEEDREAM_BASE_URL=https://ark.cn-beijing.volces.com
```

### 3. 获取 API 密钥

#### Gemini API Key

1. 访问 [Google AI Studio](https://ai.google.dev/gemini-api/docs)
2. 创建 API Key
3. 将 Key 填入 `NEXT_PUBLIC_NANO_BANANA_API_KEY`

#### SeeDream API Key (推荐)

1. 访问 [BytePlus SeeDream](https://www.byteplus.com/en/product/Seedream)
2. 注册 BytePlus 账号
3. 在 ModelArk 中获取 API Key
4. 将 Key 填入 `SEEDREAM_API_KEY`

**免费福利**: SeeDream 4.0 官方提供 200 张图片免费额度,价格 $0.03/图

## 架构说明

### 文件结构

```
src/lib/
├── api.ts                          # 统一 API 入口
├── imageGenerators/
│   ├── base.ts                     # 基础接口定义
│   ├── gemini.ts                   # Gemini 适配器
│   └── seedream.ts                 # SeeDream 适配器
└── types.ts                        # 类型定义
```

### 适配器模式

所有图像生成器都实现 `ImageGenerator` 接口:

```typescript
export interface ImageGenerator {
  // 生成图片
  generateImages(params: ImageGenerationParams): Promise<NanoBananaGenerateResponse>

  // 轮询任务状态 (异步 API)
  pollTaskStatus(taskId: string, onProgress?: (percent: number) => void): Promise<NanoBananaTaskStatusResponse>

  // 检查 API 连接
  checkConnection(): Promise<boolean>
}
```

### 模型选择逻辑

`src/lib/api.ts` 根据环境变量自动选择适配器:

```typescript
function getImageGenerator(): ImageGenerator {
  const model = (process.env.AI_IMAGE_MODEL || 'gemini') as ImageModel

  switch (model) {
    case 'seedream':
      return new SeeDreamGenerator()
    case 'gemini':
    default:
      return new GeminiGenerator()
  }
}
```

## 使用示例

### 在代码中调用

API 的使用方式保持不变,无需修改现有代码:

```typescript
import { generateImages, checkApiConnection } from '@/lib/api'

// 检查连接
const isConnected = await checkApiConnection()

// 生成图片
const result = await generateImages({
  photoPath: '/path/to/photo.jpg',
  prompt: 'soft pastel style baby portrait',
  numImages: 4,
  onProgress: (percent) => {
    console.log(`进度: ${Math.floor(percent * 100)}%`)
  }
})

console.log('生成的图片:', result.images)
```

### 切换模型

只需修改 `.env.local` 中的 `AI_IMAGE_MODEL` 变量,重启应用即可:

```bash
# 方法1: 编辑 .env.local
AI_IMAGE_MODEL=seedream

# 方法2: 使用命令行临时切换
AI_IMAGE_MODEL=gemini pnpm dev
```

## 性能对比

| 指标 | Gemini 2.5 Flash | SeeDream 4.0 |
|------|------------------|--------------|
| 单图生成时间 | ~15-20秒 | ~5-10秒 |
| 批量生成(4张) | ~60-80秒 | ~30-40秒 |
| 支持的最大尺寸 | 1024×1024 | 4096×4096 |
| 中文提示词支持 | 良好 | 优秀 |
| 稳定性 | 高 | 高 |

## 常见问题

### Q1: 如何验证配置是否正确?

启动应用后查看控制台日志:

```
[API] Selected image model: seedream
[SeeDream Config] BASE_URL: https://vip.apiyi.com/v1
[SeeDream Config] API_KEY: ***xyz1
```

### Q2: 切换模型后为什么还是旧模型?

确保重启了开发服务器:

```bash
# 停止当前进程 (Ctrl+C)
# 重新启动
pnpm dev
```

### Q3: SeeDream 提示 API Key 无效?

检查以下几点:
- 确认已在 BytePlus 注册账号
- 确认从 ModelArk 获取了正确的 API Key
- 确认 API Key 正确复制(无多余空格)
- 确认 `.env.local` 文件在项目根目录

### Q4: 两个模型可以同时使用吗?

当前版本不支持,只能同时使用一个模型。如有需要,可以通过修改代码实现动态切换。

## 成本估算

### Gemini (免费层)
- 免费配额: 视 Google 账户而定
- 超额后: 按量计费

### SeeDream 4.0 (BytePlus 官方)
- 免费额度: 200 张图片
- 单图成本: $0.03
- 生成 11 张风格示例图: $0.33 (约 ¥2.4)
- 每次生成 4 张: $0.12 (约 ¥0.9)

## 下一步

- 查看完整的风格提示词列表: `docs/style-prompts-table.csv`
- SeeDream 4.0 详细调研: `docs/seedream-4-api-research.md`
- 生成风格示例图指南: `docs/style-image-generation-guide.md`

---

**更新日期**: 2025-10-09
**版本**: 1.0
