# 多人照片生成功能开发快速入门

**功能分支**: `003-2`
**创建日期**: 2025-10-15
**适用对象**: 后端/前端开发工程师、新加入项目的开发者
**预计开发周期**: 5个工作日

---

## 功能概述

本功能为 HomeMemo 应用引入了**多人照片生成模式选择**能力,允许用户在生成照片前先选择生成模式(单人/多人),然后根据模式上传或选择不同数量的照片,最后系统会根据模式过滤并展示对应的风格选项。

### 核心价值

- **单人模式**: 用户上传1张宝宝照片,生成多种艺术风格的个人写真(如百日照、周岁照)
- **多人模式**: 用户上传2-4张单人照(如宝宝、爸爸、妈妈的照片),生成包含所有人的温馨全家福
- **照片库分离**: 将用户上传的参考照片库和AI生成的照片相册分开管理,支持多维度筛选,提升照片管理效率

### 业务场景

90%的用户使用单人模式为宝宝生成纪念照,10%的用户使用多人模式生成家庭合照。通过模式选择,系统能够:
1. 智能验证照片数量是否符合要求(单人1张,多人2-4张)
2. 对多人模式上传的照片进行人脸检测,确保每张照片只包含1人
3. 根据模式过滤风格列表(单人风格 vs 多人风格)
4. 将AI生成的照片自动归类到生成照片相册,与原始参考照片分离存储

---

## 技术架构

### 技术栈

```
前端框架: Next.js 14 + React 18 + TypeScript 5
UI组件库: Radix UI + Tailwind CSS 4
状态管理: Zustand 5
桌面框架: Tauri 2 (Rust 1.75+)
数据库: SQLite 3.38+ (Tauri内置,通过@tauri-apps/plugin-sql访问)
AI生成: Seedream 4.0 API (通过Tauri后端调用)
人脸检测: face-api.js 0.22 (TensorFlow.js,客户端运行)
```

### 架构分层

```
┌─────────────────────────────────────────────────┐
│  前端UI层 (Next.js Pages)                        │
│  - app/generation/mode/page.tsx (模式选择)       │
│  - app/upload/page.tsx (照片上传)                │
│  - app/generation/style/page.tsx (风格选择)      │
│  - app/album/page.tsx (生成照片相册)             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  状态管理层 (Zustand Store)                      │
│  - src/lib/store.ts (全局状态)                   │
│  - generationMode: 'single' | 'multi'           │
│  - uploadedPhotos: PhotoUpload[]                │
│  - photoValidationResults: Map<>                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  业务逻辑层 (Services)                           │
│  - src/lib/photoLibraryService.ts (照片库管理)   │
│  - src/lib/faceDetection.ts (人脸检测)           │
│  - src/lib/multiStyleGenerator.ts (批量生成)     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  数据访问层 (Database)                           │
│  - src/lib/database.ts (数据库Schema)            │
│  - library_photos 表 (单表+标识分离设计)         │
│  - generation_tasks 表 (任务管理)                │
│  - style_templates 表 (风格配置)                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Tauri后端层 (Rust Commands)                     │
│  - src-tauri/src/seedream.rs (API调用)           │
│  - seedream_generate(payload) 命令               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  外部服务                                        │
│  - Seedream 4.0 API (图片生成)                   │
│  - 本地模型文件 (public/face-models/)            │
└─────────────────────────────────────────────────┘
```

---

## 开发环境准备

### 前置条件

确保您的开发环境满足以下要求:

```bash
# Node.js 版本
node --version  # 需要 >= 18.0.0

# pnpm 版本
pnpm --version  # 需要 >= 9.0.0

# Rust 版本 (Tauri编译需要)
rustc --version  # 需要 >= 1.75.0
cargo --version

# 操作系统
# Windows 10/11, macOS 12+, 或 Linux (Ubuntu 20.04+)
```

### 安装依赖

```bash
# 1. 克隆项目(如果还未克隆)
git clone <repository-url>
cd HomeMemo

# 2. 切换到功能分支
git checkout 003-2

# 3. 安装Node.js依赖
pnpm install

# 4. 下载face-api.js人脸检测模型文件(约6MB)
pnpm download-models
# 模型文件将保存到 public/face-models/ 目录
# 包含: tiny_face_detector_model, face_landmark_68_model
```

### 环境变量配置

创建 `.env.local` 文件(如果不存在):

```env
# Seedream API密钥(必需)
SEEDREAM_API_KEY=your_api_key_here

# Seedream API地址(可选,默认使用官方地址)
SEEDREAM_API_URL=https://api.seed-byteplux.com

# 开发模式(可选)
NODE_ENV=development
```

**获取API密钥**: 访问 Seedream 官网注册并获取API Key。

### 验证环境

```bash
# 启动开发服务器(Next.js + Tauri)
pnpm tauri dev

# 预期结果:
# - Next.js开发服务器启动在 http://localhost:3000
# - Tauri窗口自动打开并加载应用
# - 控制台无报错信息
# - 能够看到主界面
```

---

## 核心开发流程

### Phase 1: 数据库迁移 (1天)

#### 1.1 理解数据库设计

本功能采用**单表+标识分离**设计,避免创建多张表的复杂性:

- **library_photos** 表同时存储用户上传照片和AI生成照片
- 通过 `is_ai_generated` 字段区分照片类型(0=用户上传, 1=AI生成)
- 通过 `ai_metadata` JSON字段存储AI照片的元数据(风格ID、任务ID等)
- 通过 `face_count` 和 `face_confidence` 字段存储人脸检测结果

#### 1.2 执行迁移脚本

打开 `src/lib/database.ts`,在 `createTables()` 函数中添加迁移逻辑:

```typescript
// 在 createTables() 函数末尾添加
async function migrateToV2(db: Database) {
  console.log('[Migration] 开始迁移到v2.0 - 多人照片生成支持')

  // 1. library_photos 表扩展
  try {
    await db.execute(
      'ALTER TABLE library_photos ADD COLUMN face_count INTEGER DEFAULT 0'
    )
    console.log('[Migration] ✓ library_photos.face_count')
  } catch (e) {
    // 字段已存在,忽略
  }

  try {
    await db.execute(
      'ALTER TABLE library_photos ADD COLUMN face_confidence REAL'
    )
    console.log('[Migration] ✓ library_photos.face_confidence')
  } catch (e) {}

  try {
    await db.execute(
      'ALTER TABLE library_photos ADD COLUMN quality_score REAL'
    )
    console.log('[Migration] ✓ library_photos.quality_score')
  } catch (e) {}

  // 2. generation_tasks 表扩展
  try {
    await db.execute(`
      ALTER TABLE generation_tasks
      ADD COLUMN mode TEXT NOT NULL DEFAULT 'single'
      CHECK (mode IN ('single', 'multi'))
    `)
    console.log('[Migration] ✓ generation_tasks.mode')
  } catch (e) {}

  // 3. style_templates 表扩展
  try {
    await db.execute(`
      ALTER TABLE style_templates
      ADD COLUMN supported_modes TEXT NOT NULL DEFAULT '["single"]'
    `)
    console.log('[Migration] ✓ style_templates.supported_modes')
  } catch (e) {}

  try {
    await db.execute(`
      ALTER TABLE style_templates
      ADD COLUMN min_photos INTEGER NOT NULL DEFAULT 1
    `)
    console.log('[Migration] ✓ style_templates.min_photos')
  } catch (e) {}

  try {
    await db.execute(`
      ALTER TABLE style_templates
      ADD COLUMN max_photos INTEGER NOT NULL DEFAULT 1
    `)
    console.log('[Migration] ✓ style_templates.max_photos')
  } catch (e) {}

  try {
    await db.execute(`
      ALTER TABLE style_templates
      ADD COLUMN is_multi_person INTEGER NOT NULL DEFAULT 0
    `)
    console.log('[Migration] ✓ style_templates.is_multi_person')
  } catch (e) {}

  // 4. 创建索引
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_library_photos_ai_type_time
    ON library_photos(is_ai_generated, uploaded_at DESC);

    CREATE INDEX IF NOT EXISTS idx_library_photos_face_count
    ON library_photos(face_count);

    CREATE INDEX IF NOT EXISTS idx_library_photos_style
    ON library_photos(json_extract(ai_metadata, '$.styleId'));

    CREATE INDEX IF NOT EXISTS idx_library_photos_milestone
    ON library_photos(json_extract(ai_metadata, '$.milestoneName'));

    CREATE INDEX IF NOT EXISTS idx_library_photos_task
    ON library_photos(json_extract(ai_metadata, '$.taskId'));

    CREATE INDEX IF NOT EXISTS idx_generation_tasks_mode
    ON generation_tasks(mode);

    CREATE INDEX IF NOT EXISTS idx_generation_tasks_mode_status_time
    ON generation_tasks(mode, status, created_at DESC);
  `)
  console.log('[Migration] ✓ 所有索引创建完成')

  console.log('[Migration] 迁移到v2.0完成')
}

// 在 createTables() 函数末尾调用
export async function createTables() {
  // ... 现有代码 ...

  // 执行迁移
  await migrateToV2(db)

  return db
}
```

#### 1.3 验证迁移结果

```bash
# 1. 重启开发服务器
pnpm tauri dev

# 2. 打开Tauri DevTools控制台,检查迁移日志
# 预期输出:
# [Migration] 开始迁移到v2.0 - 多人照片生成支持
# [Migration] ✓ library_photos.face_count
# [Migration] ✓ library_photos.face_confidence
# ... (其他字段)
# [Migration] ✓ 所有索引创建完成
# [Migration] 迁移到v2.0完成

# 3. 验证数据库Schema
# 可以使用SQLite客户端工具连接到数据库文件查看表结构
# 数据库文件位置: ~/.local/share/com.homememo.app/homememo.db (Linux/Mac)
# 或 C:\Users\<YourName>\AppData\Local\com.homememo.app\homememo.db (Windows)
```

---

### Phase 2: 状态管理扩展 (1天)

#### 2.1 更新TypeScript类型定义

在 `src/lib/types.ts` 中添加新类型:

```typescript
// 生成模式枚举
export type GenerationMode = 'single' | 'multi'

// AI照片元数据结构
export interface AIPhotoMetadata {
  taskId: string              // 生成任务ID
  styleId: string             // 风格ID
  styleName: string           // 风格名称
  milestoneName?: string      // 里程碑名称
  similarityLevel: string     // 相似度级别
  sourcePhotoIds: string[]    // 源照片ID数组
  sequenceNumber: number      // 风格内序号(1-4)
  generatedAt: number         // 生成时间戳
  generationMode?: GenerationMode  // 生成模式
}

// 人脸检测验证结果
export interface FaceValidationResult {
  photoId: string
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
  timestamp: number
}

// 扩展PhotoUpload类型
export interface PhotoUpload {
  // ... 现有字段 ...

  // 新增字段
  isAIGenerated?: boolean         // AI生成标识
  aiMetadata?: string             // AI元数据JSON字符串
  faceCount?: number              // 人脸数量
  faceConfidence?: number         // 人脸检测置信度
  qualityScore?: number           // 综合质量评分
}

// 相册筛选条件
export interface AlbumFilter {
  photoType?: 'all' | 'reference' | 'ai'  // 照片类型
  styleId?: string                         // 风格ID
  milestoneName?: string                   // 里程碑名称
  dateRange?: {
    start: number  // Unix timestamp
    end: number
  }
  personId?: string                        // 人物ID
  generationMode?: GenerationMode          // 生成模式
  limit?: number                           // 分页大小(默认50)
  offset?: number                          // 分页偏移(默认0)
}
```

#### 2.2 扩展Zustand Store

打开 `src/lib/store.ts`,扩展现有的store:

```typescript
import { create } from 'zustand'
import { PhotoUpload, GenerationMode, FaceValidationResult } from './types'

interface AppStore {
  // ... 现有状态字段 ...
  uploadedPhotos: PhotoUpload[]
  selectedStyleIds: string[]

  // 新增状态
  generationMode: GenerationMode
  photoValidationResults: Map<string, FaceValidationResult>
  filteredStyleIds: string[]

  // 新增方法
  setGenerationMode: (mode: GenerationMode) => void
  switchMode: (newMode: GenerationMode) => void
  addPhoto: (photo: PhotoUpload) => Promise<void>
  removePhoto: (photoId: string) => void
  clearPhotos: () => void
  setPhotoValidation: (photoId: string, result: FaceValidationResult) => void
  updateFilteredStyles: () => Promise<void>
}

export const useAppStore = create<AppStore>((set, get) => ({
  // ... 现有状态初始化 ...
  uploadedPhotos: [],
  selectedStyleIds: [],

  // 新增状态初始化
  generationMode: 'single',  // 默认单人模式
  photoValidationResults: new Map(),
  filteredStyleIds: [],

  // 模式切换逻辑
  switchMode: (newMode) => {
    set({
      generationMode: newMode,
      uploadedPhotos: [],  // 清空照片
      photoValidationResults: new Map(),
    })
    get().updateFilteredStyles()  // 重新过滤风格
  },

  setGenerationMode: (mode) => set({ generationMode: mode }),

  // 添加照片(带验证)
  addPhoto: async (photo) => {
    const { generationMode, uploadedPhotos } = get()

    // 1. 检查数量限制
    if (generationMode === 'single' && uploadedPhotos.length >= 1) {
      throw new Error('单人模式只能上传1张照片')
    }
    if (generationMode === 'multi' && uploadedPhotos.length >= 4) {
      throw new Error('多人模式最多上传4张照片')
    }

    // 2. 多人模式需要人脸检测(在调用前由UI层完成)
    // 这里直接添加到状态
    set((state) => ({
      uploadedPhotos: [...state.uploadedPhotos, photo]
    }))
  },

  removePhoto: (photoId) => {
    set((state) => ({
      uploadedPhotos: state.uploadedPhotos.filter(p => p.id !== photoId)
    }))
  },

  clearPhotos: () => {
    set({
      uploadedPhotos: [],
      photoValidationResults: new Map()
    })
  },

  setPhotoValidation: (photoId, result) => {
    set((state) => {
      const newMap = new Map(state.photoValidationResults)
      newMap.set(photoId, result)
      return { photoValidationResults: newMap }
    })
  },

  // 更新可用风格列表(根据模式过滤)
  updateFilteredStyles: async () => {
    const { generationMode } = get()
    // TODO: 从数据库加载所有风格,根据supported_modes字段过滤
    // 暂时返回空数组,在Phase 3实现
    set({ filteredStyleIds: [] })
  }
}))
```

---

### Phase 3: 人脸检测集成 (1天)

#### 3.1 创建人脸检测模块

创建文件 `src/lib/faceDetection.ts`:

```typescript
import * as faceapi from 'face-api.js'

// 模型加载状态
let modelsLoaded = false

/**
 * 加载face-api.js模型文件
 * 应用启动时调用一次
 */
export async function loadFaceDetectionModels(): Promise<void> {
  if (modelsLoaded) return

  try {
    console.log('[FaceDetection] 开始加载模型...')

    // 模型文件路径(Next.js public目录)
    const MODEL_URL = '/face-models'

    // 加载TinyFaceDetector模型(轻量级,速度快)
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)

    // 加载面部特征点模型(用于提高检测准确度)
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)

    modelsLoaded = true
    console.log('[FaceDetection] ✓ 模型加载完成')
  } catch (error) {
    console.error('[FaceDetection] 模型加载失败:', error)
    throw new Error('人脸检测模型加载失败,请重新启动应用')
  }
}

/**
 * 验证单人照片
 * @param filePath 照片文件路径(Tauri路径)
 * @returns 验证结果
 */
export async function validateSinglePersonPhoto(
  filePath: string
): Promise<{
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
}> {
  // 确保模型已加载
  if (!modelsLoaded) {
    await loadFaceDetectionModels()
  }

  try {
    // 1. 加载图片
    const { convertFileSrc } = await import('@tauri-apps/api/core')
    const imgSrc = convertFileSrc(filePath)

    const img = await loadImage(imgSrc)

    // 2. 检测所有人脸
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,        // 检测精度(512x512输入)
        scoreThreshold: 0.5    // 最低置信度阈值50%
      }))
      .withFaceLandmarks()

    // 3. 验证人脸数量
    const faceCount = detections.length

    if (faceCount === 0) {
      return {
        isValid: false,
        faceCount: 0,
        confidence: 0,
        error: '未检测到人脸,请上传清晰的人像照片'
      }
    }

    if (faceCount > 1) {
      return {
        isValid: false,
        faceCount,
        confidence: detections[0].detection.score,
        error: `检测到${faceCount}人,多人模式需要每张照片只包含1人`
      }
    }

    // 4. 单人且置信度合格
    return {
      isValid: true,
      faceCount: 1,
      confidence: detections[0].detection.score
    }
  } catch (error) {
    console.error('[FaceDetection] 验证失败:', error)
    return {
      isValid: false,
      faceCount: 0,
      confidence: 0,
      error: '照片处理失败,请重试'
    }
  }
}

/**
 * 加载图片元素(Promise包装)
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 批量验证照片
 * @param filePaths 照片文件路径数组
 * @returns 验证结果数组
 */
export async function validateMultiplePhotos(
  filePaths: string[]
): Promise<Map<string, {
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
}>> {
  const results = new Map()

  for (const filePath of filePaths) {
    const result = await validateSinglePersonPhoto(filePath)
    results.set(filePath, result)
  }

  return results
}
```

#### 3.2 在应用启动时加载模型

打开 `src/app/layout.tsx` 或主入口文件,添加模型加载逻辑:

```typescript
'use client'

import { useEffect } from 'react'
import { loadFaceDetectionModels } from '@/lib/faceDetection'

export default function RootLayout({ children }) {
  useEffect(() => {
    // 应用启动时加载人脸检测模型
    loadFaceDetectionModels().catch(error => {
      console.error('人脸检测模型加载失败:', error)
      // 可选:显示用户提示
    })
  }, [])

  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

---

### Phase 4: UI组件开发 (2天)

#### 4.1 模式选择页面

创建文件 `src/app/generation/mode/page.tsx`:

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'

export default function ModeSelectionPage() {
  const router = useRouter()
  const { generationMode, switchMode } = useAppStore()

  const handleModeSelect = (mode: 'single' | 'multi') => {
    switchMode(mode)
    // 跳转到照片上传页面
    router.push('/upload')
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">选择生成模式</h1>

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        {/* 单人模式卡片 */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            generationMode === 'single'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => handleModeSelect('single')}
        >
          <div className="text-6xl mb-4">👶</div>
          <h2 className="text-2xl font-semibold mb-2">单人照片</h2>
          <p className="text-gray-600 mb-4">
            上传1张照片,生成多种风格的个人写真
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>✓ 需要1张照片</li>
            <li>✓ 适合宝宝百日照、周岁照</li>
            <li>✓ 多种艺术风格可选</li>
          </ul>
        </div>

        {/* 多人模式卡片 */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            generationMode === 'multi'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => handleModeSelect('multi')}
        >
          <div className="text-6xl mb-4">👨‍👩‍👧</div>
          <h2 className="text-2xl font-semibold mb-2">多人照片</h2>
          <p className="text-gray-600 mb-4">
            上传2-4张单人照,生成温馨全家福
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>✓ 需要2-4张照片</li>
            <li>✓ 每张照片只包含1人</li>
            <li>✓ 适合家庭合照</li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={() => router.back()}
          variant="outline"
        >
          返回
        </Button>
      </div>
    </div>
  )
}
```

#### 4.2 照片上传页面(扩展现有页面)

在现有的 `src/app/upload/page.tsx` 中添加人脸检测逻辑:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { validateSinglePersonPhoto } from '@/lib/faceDetection'
import { Button } from '@/components/ui/button'

export default function PhotoUploadPage() {
  const router = useRouter()
  const {
    generationMode,
    uploadedPhotos,
    addPhoto,
    removePhoto,
    setPhotoValidation
  } = useAppStore()

  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFileSelect = async (files: FileList) => {
    setValidationError(null)

    // 检查数量限制
    const maxPhotos = generationMode === 'single' ? 1 : 4
    if (uploadedPhotos.length + files.length > maxPhotos) {
      setValidationError(
        `${generationMode === 'single' ? '单人' : '多人'}模式最多上传${maxPhotos}张照片`
      )
      return
    }

    // 逐个处理文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 上传到本地存储(使用Tauri API)
      const filePath = await savePhotoToLocal(file)

      // 多人模式需要人脸检测
      if (generationMode === 'multi') {
        setIsValidating(true)

        try {
          const validationResult = await validateSinglePersonPhoto(filePath)

          if (!validationResult.isValid) {
            setValidationError(validationResult.error || '照片验证失败')
            setIsValidating(false)
            return
          }

          // 保存验证结果
          const photoId = generatePhotoId()
          setPhotoValidation(photoId, {
            photoId,
            ...validationResult,
            timestamp: Date.now()
          })

          // 添加到状态
          await addPhoto({
            id: photoId,
            filePath,
            faceCount: validationResult.faceCount,
            faceConfidence: validationResult.confidence,
            uploadedAt: Date.now(),
            // ... 其他字段
          })
        } catch (error) {
          setValidationError('人脸检测失败,请重试')
        } finally {
          setIsValidating(false)
        }
      } else {
        // 单人模式直接添加
        await addPhoto({
          id: generatePhotoId(),
          filePath,
          uploadedAt: Date.now(),
          // ... 其他字段
        })
      }
    }
  }

  const handleContinue = () => {
    // 验证照片数量
    const minPhotos = generationMode === 'single' ? 1 : 2
    if (uploadedPhotos.length < minPhotos) {
      setValidationError(`至少需要${minPhotos}张照片`)
      return
    }

    // 跳转到风格选择页面
    router.push('/generation/style')
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">上传照片</h1>
      <p className="text-gray-600 mb-6">
        当前模式: {generationMode === 'single' ? '单人照片' : '多人照片'}
        {generationMode === 'single' && ' (需要1张照片)'}
        {generationMode === 'multi' && ' (需要2-4张单人照)'}
      </p>

      {/* 文件上传区域 */}
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <input
          type="file"
          accept="image/*"
          multiple={generationMode === 'multi'}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-lg">点击上传照片</p>
          <p className="text-sm text-gray-500 mt-2">
            支持 JPG、PNG 格式
          </p>
        </label>
      </div>

      {/* 验证状态提示 */}
      {isValidating && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">正在检测人脸,请稍候...</p>
        </div>
      )}

      {/* 错误提示 */}
      {validationError && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">{validationError}</p>
        </div>
      )}

      {/* 已上传照片列表 */}
      {uploadedPhotos.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            已选择 {uploadedPhotos.length} 张照片
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {uploadedPhotos.map(photo => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.filePath}
                  alt="上传的照片"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-8 flex gap-4">
        <Button onClick={() => router.back()} variant="outline">
          返回
        </Button>
        <Button
          onClick={handleContinue}
          disabled={uploadedPhotos.length === 0}
        >
          继续
        </Button>
      </div>
    </div>
  )
}

// 辅助函数
function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function savePhotoToLocal(file: File): Promise<string> {
  // TODO: 使用Tauri API保存文件到本地
  // 返回保存后的文件路径
  return '/path/to/saved/photo.jpg'
}
```

#### 4.3 风格选择页面(添加模式过滤)

在现有的 `src/app/generation/style/page.tsx` 中添加风格过滤逻辑:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { StyleTemplate } from '@/lib/types'

export default function StyleSelectionPage() {
  const { generationMode, filteredStyleIds } = useAppStore()
  const [availableStyles, setAvailableStyles] = useState<StyleTemplate[]>([])

  useEffect(() => {
    // 加载风格列表并根据模式过滤
    loadFilteredStyles()
  }, [generationMode])

  async function loadFilteredStyles() {
    // TODO: 从数据库查询所有风格
    const allStyles = await fetchAllStyles()

    // 根据当前模式过滤
    const filtered = allStyles.filter(style => {
      // 解析supported_modes JSON字符串
      const supportedModes = JSON.parse(style.supportedModes || '["single"]')
      return supportedModes.includes(generationMode)
    })

    setAvailableStyles(filtered)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">选择风格</h1>
      <p className="text-gray-600 mb-6">
        当前模式: {generationMode === 'single' ? '单人照片' : '多人照片'}
      </p>

      {/* 风格网格 */}
      <div className="grid grid-cols-3 gap-6">
        {availableStyles.map(style => (
          <StyleCard key={style.id} style={style} />
        ))}
      </div>

      {availableStyles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无适用于{generationMode === 'single' ? '单人' : '多人'}模式的风格
        </div>
      )}
    </div>
  )
}
```

---

### Phase 5: API集成 (1天)

#### 5.1 扩展Seedream API调用

打开 `src/lib/imageGenerators/seedream.ts`,修改生成逻辑以支持多图:

```typescript
import { invoke } from '@tauri-apps/api/core'
import { PhotoUpload, GenerationMode } from '@/lib/types'

export interface SeedreamGeneratePayload {
  api_key: string
  base_url: string
  model: string
  prompt: string
  image_base64: string | string[]  // 扩展类型:支持单张或多张
  size: '2K'
  // ... 其他参数
}

/**
 * 调用Seedream API生成图片
 * @param photos 参考照片数组(单人1张,多人2-4张)
 * @param mode 生成模式
 * @param prompt 生成提示词
 */
export async function generateWithSeedream(
  photos: PhotoUpload[],
  mode: GenerationMode,
  prompt: string
): Promise<string[]> {
  // 1. 将照片转换为base64
  const base64Array = await Promise.all(
    photos.map(photo => convertPhotoToBase64(photo.filePath))
  )

  // 2. 根据模式组装payload
  const payload: SeedreamGeneratePayload = {
    api_key: process.env.SEEDREAM_API_KEY!,
    base_url: process.env.SEEDREAM_API_URL || 'https://api.seed-byteplux.com',
    model: 'doubao-seedream-4-0-250828',
    prompt,
    size: '2K',
    // 关键:单人传字符串,多人传数组
    image_base64: mode === 'single' ? base64Array[0] : base64Array
  }

  // 3. 调用Tauri后端命令
  try {
    const response = await invoke<{ images: string[] }>('seedream_generate', {
      payload
    })

    return response.images
  } catch (error) {
    console.error('[Seedream] 生成失败:', error)
    throw new Error('图片生成失败,请重试')
  }
}

/**
 * 将照片文件转换为base64
 */
async function convertPhotoToBase64(filePath: string): Promise<string> {
  // TODO: 使用Tauri API读取文件并转换为base64
  return 'data:image/jpeg;base64,...'
}
```

#### 5.2 更新生成任务服务

打开 `src/lib/taskService.ts` 或创建生成服务,集成多人模式逻辑:

```typescript
import { useAppStore } from './store'
import { generateWithSeedream } from './imageGenerators/seedream'
import { insertAIGeneratedPhoto } from './photoLibraryService'

/**
 * 执行照片生成任务
 */
export async function executeGenerationTask() {
  const {
    generationMode,
    uploadedPhotos,
    selectedStyleIds
  } = useAppStore.getState()

  // 验证
  if (uploadedPhotos.length === 0) {
    throw new Error('请先上传照片')
  }
  if (selectedStyleIds.length === 0) {
    throw new Error('请先选择风格')
  }

  // 创建任务记录
  const taskId = await createGenerationTask({
    mode: generationMode,
    photoIds: uploadedPhotos.map(p => p.id),
    styleIds: selectedStyleIds,
    status: 'pending'
  })

  try {
    // 逐个风格生成
    for (const styleId of selectedStyleIds) {
      const style = await fetchStyleById(styleId)
      const prompt = generatePrompt(style, generationMode)

      // 调用API生成
      const generatedImages = await generateWithSeedream(
        uploadedPhotos,
        generationMode,
        prompt
      )

      // 保存生成的照片到数据库
      for (let i = 0; i < generatedImages.length; i++) {
        const imageData = generatedImages[i]

        // 保存到本地文件
        const savedPath = await saveBase64ToFile(imageData)

        // 插入到library_photos表
        await insertAIGeneratedPhoto({
          filePath: savedPath,
          isAIGenerated: true,
          aiMetadata: JSON.stringify({
            taskId,
            styleId,
            styleName: style.name,
            sourcePhotoIds: uploadedPhotos.map(p => p.id),
            sequenceNumber: i + 1,
            generatedAt: Date.now(),
            generationMode
          }),
          uploadedAt: Date.now()
        })
      }
    }

    // 更新任务状态为成功
    await updateTaskStatus(taskId, 'success')
  } catch (error) {
    // 更新任务状态为失败
    await updateTaskStatus(taskId, 'failed')
    throw error
  }
}
```

---

## 关键代码路径

| 功能模块 | 文件路径 | 说明 |
|---------|---------|------|
| 数据库Schema | `src/lib/database.ts` | 数据库表结构定义和迁移逻辑 |
| 类型定义 | `src/lib/types.ts` | TypeScript类型定义(GenerationMode等) |
| 状态管理 | `src/lib/store.ts` | Zustand全局状态(模式、照片、验证结果) |
| 人脸检测 | `src/lib/faceDetection.ts` | face-api.js集成,单人照验证 |
| 照片库服务 | `src/lib/photoLibraryService.ts` | 照片CRUD、参考库查询、相册筛选 |
| Seedream API | `src/lib/imageGenerators/seedream.ts` | API调用,支持单图/多图 |
| 模式选择页面 | `src/app/generation/mode/page.tsx` | 用户选择单人/多人模式 |
| 照片上传页面 | `src/app/upload/page.tsx` | 上传照片+人脸检测 |
| 风格选择页面 | `src/app/generation/style/page.tsx` | 根据模式过滤风格列表 |
| 生成照片相册 | `src/app/album/page.tsx` | 展示AI生成照片,支持筛选 |

---

## 测试策略

### 单元测试

创建 `src/lib/__tests__/faceDetection.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { validateSinglePersonPhoto, loadFaceDetectionModels } from '../faceDetection'

describe('人脸检测', () => {
  beforeAll(async () => {
    // 加载模型
    await loadFaceDetectionModels()
  })

  it('应该检测到单人照片', async () => {
    const result = await validateSinglePersonPhoto('/test-photos/single-person.jpg')

    expect(result.isValid).toBe(true)
    expect(result.faceCount).toBe(1)
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it('应该拒绝多人照片', async () => {
    const result = await validateSinglePersonPhoto('/test-photos/multi-person.jpg')

    expect(result.isValid).toBe(false)
    expect(result.faceCount).toBeGreaterThan(1)
    expect(result.error).toContain('检测到')
  })

  it('应该拒绝无人脸照片', async () => {
    const result = await validateSinglePersonPhoto('/test-photos/no-face.jpg')

    expect(result.isValid).toBe(false)
    expect(result.faceCount).toBe(0)
    expect(result.error).toContain('未检测到人脸')
  })
})
```

创建 `src/lib/__tests__/photoLibraryService.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { findReferencePhotos, queryAlbumPhotos } from '../photoLibraryService'

describe('照片库服务', () => {
  it('参考照片库应该只返回用户上传照片', async () => {
    const photos = await findReferencePhotos()

    // 所有照片的isAIGenerated都应该是false
    expect(photos.every(p => !p.isAIGenerated)).toBe(true)
  })

  it('生成照片相册应该只返回AI照片', async () => {
    const result = await queryAlbumPhotos({
      photoType: 'ai'
    })

    // 所有照片的isAIGenerated都应该是true
    expect(result.photos.every(p => p.isAIGenerated)).toBe(true)
  })

  it('相册筛选应该正确过滤风格', async () => {
    const result = await queryAlbumPhotos({
      photoType: 'ai',
      styleId: 'style_warm_home'
    })

    // 所有照片的styleId都应该是style_warm_home
    result.photos.forEach(photo => {
      const metadata = JSON.parse(photo.aiMetadata!)
      expect(metadata.styleId).toBe('style_warm_home')
    })
  })
})
```

### 集成测试

创建 `src/__tests__/generation-flow.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { useAppStore } from '../lib/store'
import { executeGenerationTask } from '../lib/taskService'

describe('完整生成流程', () => {
  it('单人模式生成流程', async () => {
    const store = useAppStore.getState()

    // 1. 选择单人模式
    store.switchMode('single')
    expect(store.generationMode).toBe('single')

    // 2. 上传1张照片
    await store.addPhoto({
      id: 'test_photo_1',
      filePath: '/test/photo1.jpg',
      uploadedAt: Date.now()
    })
    expect(store.uploadedPhotos).toHaveLength(1)

    // 3. 选择风格
    store.setSelectedStyleIds(['style_warm_home'])

    // 4. 执行生成
    await executeGenerationTask()

    // 5. 验证生成的照片保存到数据库
    const generatedPhotos = await queryAlbumPhotos({ photoType: 'ai' })
    expect(generatedPhotos.photos.length).toBeGreaterThan(0)
  })

  it('多人模式生成流程', async () => {
    const store = useAppStore.getState()

    // 1. 选择多人模式
    store.switchMode('multi')

    // 2. 上传3张照片(每张都通过人脸检测)
    for (let i = 1; i <= 3; i++) {
      await store.addPhoto({
        id: `test_photo_${i}`,
        filePath: `/test/photo${i}.jpg`,
        faceCount: 1,
        faceConfidence: 0.9,
        uploadedAt: Date.now()
      })
    }
    expect(store.uploadedPhotos).toHaveLength(3)

    // 3. 选择多人风格
    store.setSelectedStyleIds(['style_family_warmth'])

    // 4. 执行生成
    await executeGenerationTask()

    // 5. 验证AI元数据包含3个源照片ID
    const generatedPhotos = await queryAlbumPhotos({ photoType: 'ai' })
    const metadata = JSON.parse(generatedPhotos.photos[0].aiMetadata!)
    expect(metadata.sourcePhotoIds).toHaveLength(3)
    expect(metadata.generationMode).toBe('multi')
  })
})
```

### 性能测试

```typescript
import { describe, it, expect } from 'vitest'
import { queryAlbumPhotos } from '../lib/photoLibraryService'

describe('查询性能测试', () => {
  it('1000张照片查询应该在100ms内完成', async () => {
    const start = performance.now()

    await queryAlbumPhotos({
      photoType: 'ai',
      limit: 50
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(100)
  })

  it('组合筛选查询应该在200ms内完成', async () => {
    const start = performance.now()

    await queryAlbumPhotos({
      photoType: 'ai',
      styleId: 'style_warm_home',
      dateRange: {
        start: Date.now() - 30 * 86400 * 1000,
        end: Date.now()
      }
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(200)
  })
})
```

运行测试:

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test faceDetection.test.ts

# 运行测试并查看覆盖率
pnpm test --coverage
```

---

## 常见问题

### Q1: Seedream API不支持数组怎么办?

**现象**: 传递 `image_base64: string[]` 后API返回400错误。

**解决方案**:
1. **方案A - 图像拼接**(推荐):
   ```typescript
   // 使用Canvas将多张照片拼接为单张参考图
   async function mergePhotosToSingle(photos: PhotoUpload[]): Promise<string> {
     const canvas = document.createElement('canvas')
     const ctx = canvas.getContext('2d')!

     // 横向拼接照片
     canvas.width = 1024 * photos.length
     canvas.height = 1024

     for (let i = 0; i < photos.length; i++) {
       const img = await loadImage(photos[i].filePath)
       ctx.drawImage(img, i * 1024, 0, 1024, 1024)
     }

     return canvas.toDataURL('image/jpeg')
   }

   // 在generateWithSeedream中使用
   const image_base64 = mode === 'multi'
     ? await mergePhotosToSingle(photos)
     : base64Array[0]
   ```

2. **方案B - 多次调用合成**:
   ```typescript
   // 分别生成每个人的照片,然后使用图像编辑工具手动合成
   // (不推荐,效果较差)
   ```

3. **方案C - 更换AI服务**:
   ```typescript
   // 使用支持多参考图的服务,如Stable Diffusion + ControlNet
   // (需要额外开发成本)
   ```

---

### Q2: 人脸检测失败率高怎么办?

**现象**: 上传清晰照片后仍然提示"未检测到人脸"。

**排查步骤**:
1. **检查模型文件是否完整**:
   ```bash
   ls -lh public/face-models/
   # 应该看到以下文件:
   # tiny_face_detector_model-shard1 (~1.2MB)
   # face_landmark_68_model-shard1 (~350KB)
   ```

2. **调整检测阈值**:
   ```typescript
   // 降低scoreThreshold从0.5到0.3
   const detections = await faceapi
     .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
       inputSize: 512,
       scoreThreshold: 0.3  // 降低阈值
     }))
   ```

3. **添加图像预处理**:
   ```typescript
   // 在检测前调整图像亮度/对比度
   function preprocessImage(img: HTMLImageElement): HTMLCanvasElement {
     const canvas = document.createElement('canvas')
     const ctx = canvas.getContext('2d')!
     canvas.width = img.width
     canvas.height = img.height

     ctx.filter = 'brightness(1.2) contrast(1.1)'
     ctx.drawImage(img, 0, 0)

     return canvas
   }
   ```

4. **提供手动覆盖选项**:
   ```typescript
   // UI层添加"我确认这是单人照"复选框
   const [manualOverride, setManualOverride] = useState(false)

   if (manualOverride || validationResult.isValid) {
     // 允许继续
   }
   ```

---

### Q3: 相册筛选性能差怎么办?

**现象**: 照片数量超过5000张后,筛选查询耗时>1秒。

**优化步骤**:

1. **验证索引是否生效**:
   ```sql
   -- 在SQLite客户端执行
   EXPLAIN QUERY PLAN
   SELECT * FROM library_photos
   WHERE is_ai_generated = 1
     AND json_extract(ai_metadata, '$.styleId') = 'style_warm_home'
   ORDER BY uploaded_at DESC;

   -- 预期输出应包含:
   -- SEARCH ... USING INDEX idx_library_photos_ai_type_time
   -- SEARCH ... USING INDEX idx_library_photos_style
   ```

2. **提升JSON字段为列**(长期方案):
   ```sql
   -- 添加独立列
   ALTER TABLE library_photos ADD COLUMN style_id TEXT;
   ALTER TABLE library_photos ADD COLUMN milestone_name TEXT;

   -- 数据迁移
   UPDATE library_photos
   SET style_id = json_extract(ai_metadata, '$.styleId'),
       milestone_name = json_extract(ai_metadata, '$.milestoneName')
   WHERE is_ai_generated = 1;

   -- 创建新索引
   CREATE INDEX idx_library_photos_style_id ON library_photos(style_id);

   -- 修改查询
   SELECT * FROM library_photos
   WHERE is_ai_generated = 1
     AND style_id = 'style_warm_home'  -- 直接查询列
   ORDER BY uploaded_at DESC;
   ```

3. **实现虚拟滚动**:
   ```typescript
   // 使用react-window减少DOM渲染
   import { FixedSizeGrid } from 'react-window'

   <FixedSizeGrid
     columnCount={4}
     columnWidth={200}
     height={600}
     rowCount={Math.ceil(photos.length / 4)}
     rowHeight={200}
     width={800}
   >
     {({ columnIndex, rowIndex, style }) => {
       const photo = photos[rowIndex * 4 + columnIndex]
       return <PhotoCard photo={photo} style={style} />
     }}
   </FixedSizeGrid>
   ```

---

### Q4: 模式切换后照片没有清空?

**现象**: 从单人模式切换到多人模式后,之前上传的1张照片仍然显示。

**解决方案**:
```typescript
// 确保在switchMode中清空照片
switchMode: (newMode) => {
  set({
    generationMode: newMode,
    uploadedPhotos: [],  // 关键:清空照片数组
    photoValidationResults: new Map(),
  })
  get().updateFilteredStyles()
}

// UI层添加确认弹窗
const handleModeSwitch = (newMode: GenerationMode) => {
  if (uploadedPhotos.length > 0) {
    if (confirm('切换模式将清空已选照片,确认继续吗?')) {
      switchMode(newMode)
    }
  } else {
    switchMode(newMode)
  }
}
```

---

### Q5: 如何调试Tauri后端命令?

**场景**: `invoke('seedream_generate')` 调用失败,不知道错误原因。

**调试方法**:
```bash
# 1. 打开Tauri DevTools
# Windows: Ctrl+Shift+I
# macOS: Cmd+Option+I

# 2. 查看Rust控制台输出
# 在终端运行 pnpm tauri dev 时,Rust的println!输出会显示在终端

# 3. 添加Rust日志
# 在 src-tauri/src/seedream.rs 中:
#[tauri::command]
pub async fn seedream_generate(payload: SeedreamPayload) -> Result<SeedreamResponse, String> {
    println!("[Seedream] 收到生成请求: {:?}", payload);

    // ... 执行逻辑 ...

    match result {
        Ok(data) => {
            println!("[Seedream] 生成成功");
            Ok(data)
        }
        Err(e) => {
            eprintln!("[Seedream] 生成失败: {:?}", e);
            Err(e.to_string())
        }
    }
}

# 4. 前端捕获错误
try {
  const result = await invoke('seedream_generate', { payload })
  console.log('[Seedream] 成功:', result)
} catch (error) {
  console.error('[Seedream] 失败:', error)
  // 显示给用户
  alert(`生成失败: ${error}`)
}
```

---

## 下一步

完成快速入门后,您可以:

1. **生成实施计划**: 运行 `/speckit.tasks` 命令生成详细的任务清单(`tasks.md`)
   ```bash
   # 在Claude Code中执行
   /speckit.tasks
   ```

2. **开始迭代开发**: 按照 `tasks.md` 中的任务顺序逐个实现功能

3. **执行质量检查**: 运行 `/speckit.analyze` 检查规格、计划和任务之间的一致性
   ```bash
   /speckit.analyze
   ```

4. **参考完整文档**:
   - 功能规格: `specs/003-2/spec.md`
   - 技术研究: `specs/003-2/research.md`
   - 数据模型: `specs/003-2/data-model.md`

5. **加入开发讨论**: 查看项目 Issues 或 Pull Requests,了解其他开发者的实现经验

---

## 附录

### A. 开发环境配置检查清单

- [ ] Node.js >= 18.0.0
- [ ] pnpm >= 9.0.0
- [ ] Rust >= 1.75.0
- [ ] 项目依赖已安装 (`pnpm install`)
- [ ] face-api.js模型已下载 (`pnpm download-models`)
- [ ] `.env.local` 文件已配置(SEEDREAM_API_KEY)
- [ ] Tauri开发服务器可正常启动 (`pnpm tauri dev`)

### B. 数据库迁移验证SQL

```sql
-- 验证字段是否添加成功
PRAGMA table_info(library_photos);
-- 应该看到: face_count, face_confidence, quality_score

PRAGMA table_info(generation_tasks);
-- 应该看到: mode

PRAGMA table_info(style_templates);
-- 应该看到: supported_modes, min_photos, max_photos, is_multi_person

-- 验证索引是否创建成功
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='library_photos';
-- 应该看到: idx_library_photos_ai_type_time, idx_library_photos_style 等

-- 验证现有数据兼容性
SELECT COUNT(*) as total,
       SUM(CASE WHEN is_ai_generated = 0 THEN 1 ELSE 0 END) as reference_photos,
       SUM(CASE WHEN is_ai_generated = 1 THEN 1 ELSE 0 END) as ai_photos
FROM library_photos;
```

### C. 性能基准参考

| 操作 | 目标耗时 | 测试数据规模 |
|------|---------|-------------|
| 人脸检测(单张照片) | < 2秒 | 1024x1024图片 |
| 参考照片库查询 | < 10ms | 1000张照片 |
| 相册筛选(单条件) | < 30ms | 1000张照片 |
| 相册筛选(组合条件) | < 50ms | 1000张照片 |
| Seedream API生成 | < 30秒 | 单张2K图片 |
| 照片保存到数据库 | < 5ms | 单条记录 |

### D. 常用命令速查

```bash
# 开发
pnpm tauri dev              # 启动开发服务器
pnpm dev                    # 仅启动Next.js(不启动Tauri)

# 构建
pnpm build                  # 构建Next.js应用
pnpm tauri build            # 构建Tauri桌面应用

# 测试
pnpm test                   # 运行单元测试
pnpm test:ui                # 打开测试UI界面
pnpm test faceDetection     # 运行特定测试

# 数据库
pnpm tauri dev              # 数据库文件会自动创建在用户数据目录

# 工具
pnpm lint                   # 代码检查
pnpm download-models        # 下载face-api.js模型
```

---

**文档版本**: v1.0
**最后更新**: 2025-10-15
**维护者**: HomeMemo开发团队
**反馈渠道**: 项目GitHub Issues

祝开发顺利! 🚀
