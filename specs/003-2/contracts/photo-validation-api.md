# 人脸检测与照片验证API

## 概述

本API用于在多人照片生成模式下验证上传的照片是否符合要求。核心功能是检测照片中的人脸数量，确保每张照片只包含一个人。使用 face-api.js 在客户端本地执行，保护用户隐私。

## 请求

### 函数签名

```typescript
/**
 * 验证单人照片
 * @param filePath - 照片文件的本地绝对路径
 * @returns 验证结果，包含人脸数量、置信度等信息
 */
async function validateSinglePersonPhoto(
  filePath: string
): Promise<FaceValidationResult>
```

### 参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| filePath | string | 是 | 照片文件的本地绝对路径 |

### 类型定义

```typescript
interface FaceValidationResult {
  isValid: boolean       // 照片是否有效（单人且置信度达标）
  faceCount: number      // 检测到的人脸数量
  confidence: number     // 主要人脸的检测置信度 (0.0-1.0)
  error?: string         // 错误消息（验证失败时）
  timestamp: number      // 验证时间戳
}
```

## 响应

### 成功响应

**单人照片（验证通过）**

```typescript
{
  isValid: true,
  faceCount: 1,
  confidence: 0.85,
  timestamp: 1729008000000
}
```

**未检测到人脸**

```typescript
{
  isValid: false,
  faceCount: 0,
  confidence: 0,
  error: "未检测到人脸，请上传清晰的人像照片",
  timestamp: 1729008000000
}
```

**检测到多人**

```typescript
{
  isValid: false,
  faceCount: 3,
  confidence: 0.82,
  error: "检测到3人，多人模式需要每张照片只包含1人",
  timestamp: 1729008000000
}
```

### 错误响应

| 错误类型 | 错误消息 | 说明 |
|---------|---------|------|
| 文件不存在 | "照片文件不存在" | 提供的文件路径无效 |
| 文件格式错误 | "不支持的照片格式" | 照片格式不是 JPG/PNG |
| 模型加载失败 | "人脸检测模型加载失败" | face-api.js 模型文件缺失或损坏 |
| 检测超时 | "人脸检测超时" | 检测时间超过10秒 |

## 示例

### 请求示例

```typescript
import { validateSinglePersonPhoto } from '@/lib/face-detection'

// 示例1: 验证用户上传的照片
const result = await validateSinglePersonPhoto(
  'E:\\photos\\baby_portrait.jpg'
)

if (result.isValid) {
  console.log(`验证通过，置信度: ${result.confidence}`)
  // 添加照片到生成任务
} else {
  console.error(`验证失败: ${result.error}`)
  // 提示用户重新选择照片
}

// 示例2: 批量验证多张照片（多人模式）
const photoPaths = [
  'E:\\photos\\baby.jpg',
  'E:\\photos\\dad.jpg',
  'E:\\photos\\mom.jpg'
]

const validations = await Promise.all(
  photoPaths.map(path => validateSinglePersonPhoto(path))
)

const allValid = validations.every(v => v.isValid)
if (allValid) {
  console.log('所有照片验证通过')
} else {
  const failedPhotos = validations
    .filter(v => !v.isValid)
    .map((v, i) => ({ path: photoPaths[i], error: v.error }))
  console.error('以下照片验证失败:', failedPhotos)
}
```

### 响应示例

```json
{
  "isValid": true,
  "faceCount": 1,
  "confidence": 0.87,
  "timestamp": 1729008123456
}
```

## 实现细节

### 检测配置参数

```typescript
const detectionOptions = {
  inputSize: 512,         // 检测输入尺寸 (512x512)
  scoreThreshold: 0.5,    // 最低置信度阈值 (50%)
  minFaceSize: 80,        // 最小人脸尺寸 (80px)
}
```

### 模型加载

```typescript
// 应用启动时预加载模型（放在 App.tsx 或主进程初始化）
import * as faceapi from 'face-api.js'

async function loadFaceDetectionModels() {
  const modelPath = '/face-models'
  await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath)
  await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
  console.log('人脸检测模型加载完成')
}
```

### 完整实现示例

```typescript
import * as faceapi from 'face-api.js'
import { convertFileSrc } from '@tauri-apps/api/core'

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function validateSinglePersonPhoto(
  filePath: string
): Promise<FaceValidationResult> {
  const timestamp = Date.now()

  try {
    // 1. 转换文件路径为可访问URL
    const imgSrc = convertFileSrc(filePath)
    const imgElement = await loadImage(imgSrc)

    // 2. 检测所有人脸
    const detections = await faceapi
      .detectAllFaces(imgElement, new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.5
      }))
      .withFaceLandmarks()

    const faceCount = detections.length

    // 3. 验证人脸数量
    if (faceCount === 0) {
      return {
        isValid: false,
        faceCount: 0,
        confidence: 0,
        error: '未检测到人脸，请上传清晰的人像照片',
        timestamp
      }
    }

    if (faceCount > 1) {
      return {
        isValid: false,
        faceCount,
        confidence: detections[0].detection.score,
        error: `检测到${faceCount}人，多人模式需要每张照片只包含1人`,
        timestamp
      }
    }

    // 4. 单人且置信度合格
    return {
      isValid: true,
      faceCount: 1,
      confidence: detections[0].detection.score,
      timestamp
    }
  } catch (error) {
    return {
      isValid: false,
      faceCount: 0,
      confidence: 0,
      error: `人脸检测失败: ${error.message}`,
      timestamp
    }
  }
}
```

## 注意事项

### 性能要求

- 单张照片检测时间应 < 2秒
- 照片尺寸建议 ≤ 4000x4000px（过大会影响检测速度）
- 如果检测时间 > 5秒，应显示加载提示
- 如果检测时间 > 10秒，应超时并提示错误

### 错误处理

- 模型文件缺失：应用启动时检查 `/face-models` 目录
- 照片格式不支持：支持 JPG、PNG，不支持 HEIC、WebP
- 内存溢出：对于超大照片（> 10MB），应先压缩再检测
- 网络依赖：所有模型文件必须本地化，不允许在线加载

### 边界情况

- **背景人脸干扰**：海报、画像、雕塑可能被误识别
  - 解决方案：添加 `minFaceSize` 参数过滤远景人脸
  - 提供"手动确认单人照"选项供用户覆盖

- **侧脸/遮挡**：大角度侧脸或部分遮挡可能检测失败
  - 解决方案：降低 `scoreThreshold` 到 0.4（权衡召回率和准确率）
  - UI提示：建议用户上传正面清晰照片

- **婴儿照片**：婴儿面部特征不明显，检测置信度较低
  - 解决方案：对于置信度 0.3-0.5 的结果，提示"照片质量一般，建议重新拍摄"
  - 不强制拒绝，允许用户继续使用

### 隐私保护

- 所有检测在客户端本地执行，照片不上传到服务器
- 人脸坐标、特征向量等敏感数据不持久化存储
- 数据库仅存储统计信息（人脸数量、置信度）
- 符合 HomeMemo Constitution 隐私原则

### 数据库存储

验证结果应存储到 `library_photos` 表：

```sql
UPDATE library_photos
SET face_count = 1,
    face_confidence = 0.85
WHERE id = 'photo_id_123';
```

存储目的：
- 避免重复检测（加载照片库时不需要重新验证）
- 支持按人脸数量筛选（如：只显示单人照）
- 后期可用于照片质量评分系统
