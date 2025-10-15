# Seedream多人照片生成API

## 概述

本API用于调用Seedream 4.0图像生成服务，支持单人和多人照片生成。通过传递一张或多张参考照片的base64编码，生成指定风格的AI照片。该API通过Tauri Rust后端命令调用，确保API密钥安全性。

## 请求

### 端点/函数签名

**Tauri命令调用**

```typescript
/**
 * 调用Seedream图像生成服务
 * @param payload - 生成请求参数
 * @returns 生成的图片base64数组
 */
import { invoke } from '@tauri-apps/api/core'

async function seedreamGenerate(
  payload: SeedreamGeneratePayload
): Promise<SeedreamGenerateResponse>
```

**Rust后端命令（参考实现）**

```rust
// src-tauri/src/commands/seedream.rs
#[tauri::command]
pub async fn seedream_generate(
    payload: SeedreamGeneratePayload
) -> Result<SeedreamGenerateResponse, String>
```

### 参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| payload | SeedreamGeneratePayload | 是 | 生成请求参数 |

### 类型定义

```typescript
/** Seedream生成请求参数 */
interface SeedreamGeneratePayload {
  api_key: string                    // Seedream API密钥
  base_url: string                   // API基础URL（通常为豆包API地址）
  model: string                      // 模型名称（固定为 'doubao-seedream-4-0-250828'）
  prompt: string                     // 生成提示词
  image_base64: string | string[]    // 参考图片base64（单人=string，多人=string[]）
  size?: string                      // 图片尺寸（默认 '2K'）
  n?: number                         // 生成数量（默认 1）
  similarity_level?: string          // 相似度级别（'high'/'medium'/'low'，默认 'high'）
}

/** Seedream生成响应 */
interface SeedreamGenerateResponse {
  images: string[]                   // 生成的图片base64数组
  task_id?: string                   // 任务ID（用于溯源）
  error?: string                     // 错误消息（失败时）
}

/** 生成任务参数（应用层封装） */
interface GenerateTaskParams {
  mode: 'single' | 'multi'           // 生成模式
  photoIds: string[]                 // 照片ID列表
  styleIds: string[]                 // 风格ID列表
  similarityLevel: 'high' | 'medium' | 'low'  // 相似度级别
  milestoneName?: string             // 里程碑名称
}
```

## 响应

### 成功响应

**单人照片生成**

```json
{
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a...",
    "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAAACXBIWXMAAAsTAAALEwEAmpwY..."
  ],
  "task_id": "task_abc123"
}
```

**多人照片生成**

```json
{
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a..."
  ],
  "task_id": "task_def456"
}
```

### 错误响应

| 错误码 | 错误消息 | 说明 |
|-------|---------|------|
| API_KEY_INVALID | "API密钥无效" | API密钥错误或已过期 |
| QUOTA_EXCEEDED | "API配额已用尽" | 月度API调用次数超限 |
| INVALID_PROMPT | "提示词不符合内容安全要求" | 提示词包含敏感内容 |
| INVALID_IMAGE | "参考图片格式错误" | base64解码失败或图片损坏 |
| NETWORK_ERROR | "网络请求失败: [详细错误]" | 网络连接中断或超时 |
| GENERATION_FAILED | "图片生成失败: [详细错误]" | 服务端生成过程异常 |

**错误响应示例**

```json
{
  "error": "API密钥无效，请检查配置"
}
```

## 示例

### 请求示例

```typescript
import { invoke } from '@tauri-apps/api/core'
import { readBinaryFile } from '@tauri-apps/plugin-fs'

// 示例1: 单人照片生成
async function generateSinglePersonPhoto(
  photoPath: string,
  prompt: string
): Promise<string[]> {
  // 1. 读取照片文件并转换为base64
  const photoBytes = await readBinaryFile(photoPath)
  const base64 = btoa(String.fromCharCode(...photoBytes))
  const imageBase64 = `data:image/jpeg;base64,${base64}`

  // 2. 调用Seedream API
  const payload: SeedreamGeneratePayload = {
    api_key: import.meta.env.VITE_SEEDREAM_API_KEY,
    base_url: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-seedream-4-0-250828',
    prompt: prompt,
    image_base64: imageBase64,  // 单张照片（string）
    size: '2K',
    n: 4,  // 生成4张图片
    similarity_level: 'high'
  }

  const response = await invoke<SeedreamGenerateResponse>(
    'seedream_generate',
    { payload }
  )

  if (response.error) {
    throw new Error(response.error)
  }

  return response.images
}

// 示例2: 多人照片生成
async function generateMultiPersonPhoto(
  photoPaths: string[],
  prompt: string
): Promise<string[]> {
  // 1. 批量读取照片并转换为base64数组
  const imageBase64Array: string[] = []

  for (const path of photoPaths) {
    const photoBytes = await readBinaryFile(path)
    const base64 = btoa(String.fromCharCode(...photoBytes))
    imageBase64Array.push(`data:image/jpeg;base64,${base64}`)
  }

  // 2. 调用Seedream API
  const payload: SeedreamGeneratePayload = {
    api_key: import.meta.env.VITE_SEEDREAM_API_KEY,
    base_url: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-seedream-4-0-250828',
    prompt: prompt,
    image_base64: imageBase64Array,  // 多张照片（string[]）
    size: '2K',
    n: 1,  // 多人模式通常生成1张
    similarity_level: 'high'
  }

  const response = await invoke<SeedreamGenerateResponse>(
    'seedream_generate',
    { payload }
  )

  if (response.error) {
    throw new Error(response.error)
  }

  return response.images
}

// 示例3: 完整生成任务封装
async function executeGenerationTask(
  params: GenerateTaskParams
): Promise<PhotoUpload[]> {
  const { mode, photoIds, styleIds, similarityLevel } = params

  // 1. 从数据库加载照片
  const photos = await Promise.all(
    photoIds.map(id => getPhotoById(id))
  )

  // 2. 遍历风格生成
  const generatedPhotos: PhotoUpload[] = []

  for (const styleId of styleIds) {
    const style = await getStyleById(styleId)
    const prompt = style.promptTemplate  // 从风格模板获取提示词

    // 3. 根据模式调用API
    let images: string[]

    if (mode === 'single') {
      images = await generateSinglePersonPhoto(
        photos[0].filePath,
        prompt
      )
    } else {
      images = await generateMultiPersonPhoto(
        photos.map(p => p.filePath),
        prompt
      )
    }

    // 4. 保存生成的照片
    for (let i = 0; i < images.length; i++) {
      const savedPhoto = await saveGeneratedPhoto({
        imageBase64: images[i],
        styleId,
        styleName: style.name,
        sourcePhotoIds: photoIds,
        sequenceNumber: i + 1,
        generationMode: mode,
        milestoneName: params.milestoneName
      })
      generatedPhotos.push(savedPhoto)
    }
  }

  return generatedPhotos
}
```

### 响应示例

```json
{
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAIAAgADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL...",
    "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAgAElEQVR4nOzdd1RU19oG8GdmGIYOgiCgIoIFsWGJvaEdY0mMJZpY..."
  ],
  "task_id": "task_abc123"
}
```

## 实现细节

### Rust后端实现参考

```rust
// src-tauri/src/commands/seedream.rs
use serde::{Deserialize, Serialize};
use reqwest;

#[derive(Debug, Deserialize)]
pub struct SeedreamGeneratePayload {
    api_key: String,
    base_url: String,
    model: String,
    prompt: String,
    image_base64: ImageBase64Input,
    size: Option<String>,
    n: Option<u32>,
    similarity_level: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum ImageBase64Input {
    Single(String),
    Multiple(Vec<String>),
}

#[derive(Debug, Serialize)]
pub struct SeedreamGenerateResponse {
    images: Vec<String>,
    task_id: Option<String>,
    error: Option<String>,
}

#[tauri::command]
pub async fn seedream_generate(
    payload: SeedreamGeneratePayload
) -> Result<SeedreamGenerateResponse, String> {
    let client = reqwest::Client::new();

    // 构建API请求体
    let image_field = match &payload.image_base64 {
        ImageBase64Input::Single(img) => serde_json::json!(img),
        ImageBase64Input::Multiple(imgs) => serde_json::json!(imgs),
    };

    let request_body = serde_json::json!({
        "model": payload.model,
        "prompt": payload.prompt,
        "image": image_field,
        "size": payload.size.unwrap_or_else(|| "2K".to_string()),
        "n": payload.n.unwrap_or(1),
        "similarity_level": payload.similarity_level.unwrap_or_else(|| "high".to_string()),
    });

    // 发送HTTP请求
    let response = client
        .post(format!("{}/images/generations", payload.base_url))
        .header("Authorization", format!("Bearer {}", payload.api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    // 解析响应
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Ok(SeedreamGenerateResponse {
            images: vec![],
            task_id: None,
            error: Some(format!("API请求失败: {}", error_text)),
        });
    }

    let api_response: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("响应解析失败: {}", e))?;

    // 提取图片数据
    let images = api_response["data"]
        .as_array()
        .ok_or("响应格式错误")?
        .iter()
        .filter_map(|item| item["b64_json"].as_str())
        .map(|s| s.to_string())
        .collect();

    Ok(SeedreamGenerateResponse {
        images,
        task_id: api_response["id"].as_str().map(|s| s.to_string()),
        error: None,
    })
}
```

### API配置管理

```typescript
// src/config/seedream.ts
export const SEEDREAM_CONFIG = {
  API_BASE_URL: 'https://ark.cn-beijing.volces.com/api/v3',
  MODEL_NAME: 'doubao-seedream-4-0-250828',
  DEFAULT_SIZE: '2K',
  DEFAULT_N: 4,  // 单人模式默认生成4张
  DEFAULT_SIMILARITY: 'high',
  TIMEOUT_MS: 60000,  // 60秒超时
  MAX_RETRY: 3,       // 最多重试3次
}

// API密钥从环境变量读取（避免硬编码）
export function getSeedreamApiKey(): string {
  const apiKey = import.meta.env.VITE_SEEDREAM_API_KEY
  if (!apiKey) {
    throw new Error('Seedream API密钥未配置，请在.env文件中设置VITE_SEEDREAM_API_KEY')
  }
  return apiKey
}
```

### 提示词模板

```typescript
// src/lib/prompt-builder.ts

/**
 * 构建生成提示词
 * @param styleTemplate - 风格模板
 * @param mode - 生成模式
 * @param personNames - 人物名称列表（用于多人场景）
 */
export function buildPrompt(
  styleTemplate: string,
  mode: 'single' | 'multi',
  personNames?: string[]
): string {
  if (mode === 'single') {
    // 单人模式：直接使用风格模板
    return styleTemplate
  } else {
    // 多人模式：在模板中插入人物关系
    const personsText = personNames?.join('、') || '多人'
    return styleTemplate.replace(
      '{persons}',
      personsText
    )
  }
}

// 示例风格模板
export const STYLE_TEMPLATES = {
  single: {
    warm_home: '一张温馨的家庭照片，柔和的暖光照明，居家环境，人物表情自然放松',
    fresh_nature: '清新自然的森系风格照片，户外绿色背景，阳光透过树叶的斑驳光影'
  },
  multi: {
    family_warmth: '一张温馨的全家福照片，{persons}在一起，温暖的光线，亲密互动的姿态，家庭氛围浓厚'
  }
}
```

## 注意事项

### 性能要求

- 单张照片生成时间：≤ 30秒
- 多张照片生成时间：≤ 45秒（每增加1张参考照片 +5秒）
- 网络请求超时：60秒
- 失败重试间隔：2秒
- 最多重试次数：3次

### 错误处理

- **网络中断**：保存已生成的照片，允许用户重试未完成的风格
- **API配额耗尽**：提示用户稍后再试，记录失败任务以便恢复
- **内容安全审核失败**：提示用户修改风格或照片，记录失败原因
- **照片过大**：自动压缩到 < 5MB 后再编码为base64

### 边界情况

- **单人模式传递多张照片**：应在应用层拦截，不允许调用API
- **多人模式只传1张照片**：应降级为单人模式或提示错误
- **超过4张照片**：应在应用层限制，不允许上传第5张
- **照片格式不支持**：仅支持 JPG/PNG，不支持 HEIC/WebP
- **base64编码过大**：单张照片 < 10MB，总payload < 20MB

### 安全性

- **API密钥保护**：
  - 前端不直接存储API密钥（使用环境变量）
  - 通过Tauri后端调用API（密钥存储在Rust代码中）
  - 避免在日志中输出完整API密钥

- **内容安全**：
  - 提示词应避免敏感词汇（政治、暴力、色情）
  - 参考照片应符合内容规范（不包含违规内容）
  - API响应应检查内容审核状态

### 成本控制

- **定价参考**：Seedream 4.0约 $0.025/张（512x512），$0.05/张（2K）
- **优化策略**：
  - 单人模式生成4张（满足用户选择需求）
  - 多人模式生成1张（降低成本）
  - 相似度级别默认 'high'（质量优先）
  - 避免重复生成（缓存已生成照片）

### 数据存储

生成后应保存照片到数据库和文件系统：

```typescript
async function saveGeneratedPhoto(params: {
  imageBase64: string
  styleId: string
  styleName: string
  sourcePhotoIds: string[]
  sequenceNumber: number
  generationMode: 'single' | 'multi'
  milestoneName?: string
}): Promise<PhotoUpload> {
  // 1. 解码base64并保存到磁盘
  const fileName = `${params.styleId}_${params.sequenceNumber}_${Date.now()}.jpg`
  const filePath = await saveBase64ToFile(params.imageBase64, fileName)

  // 2. 构建AI元数据
  const aiMetadata: AIPhotoMetadata = {
    taskId: generateTaskId(),
    styleId: params.styleId,
    styleName: params.styleName,
    sourcePhotoIds: params.sourcePhotoIds,
    sequenceNumber: params.sequenceNumber,
    generatedAt: Date.now(),
    generationMode: params.generationMode,
    milestoneName: params.milestoneName,
    similarityLevel: 'high'
  }

  // 3. 插入数据库
  const photo: PhotoUpload = {
    id: generatePhotoId(),
    filePath,
    width: 2048,
    height: 2048,
    format: 'JPG',
    uploadedAt: Date.now(),
    isInLibrary: true,
    isAIGenerated: true,
    aiMetadata: JSON.stringify(aiMetadata)
  }

  await insertLibraryPhoto(photo)
  return photo
}
```
