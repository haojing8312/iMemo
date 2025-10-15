# 生成模式管理API

## 概述

本API用于管理照片生成的模式（单人/多人），提供模式切换、验证、配置查询等功能。生成模式决定了用户需要上传的照片数量、可选的风格列表，以及是否需要执行人脸检测验证。

## 请求

### 函数签名

```typescript
/**
 * 获取生成模式配置信息
 * @param mode - 生成模式（single 或 multi）
 * @returns 模式配置详情
 */
function getGenerationModeConfig(
  mode: GenerationMode
): GenerationModeConfig

/**
 * 切换生成模式（清空已选照片）
 * @param newMode - 新的生成模式
 */
function switchGenerationMode(newMode: GenerationMode): void

/**
 * 验证照片数量是否符合当前模式要求
 * @param mode - 生成模式
 * @param photoCount - 照片数量
 * @returns 验证结果
 */
function validatePhotoCount(
  mode: GenerationMode,
  photoCount: number
): { isValid: boolean; error?: string }

/**
 * 根据模式过滤可用风格
 * @param mode - 生成模式
 * @returns 支持该模式的风格ID列表
 */
async function filterStylesByMode(
  mode: GenerationMode
): Promise<string[]>
```

### 参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| mode | GenerationMode | 是 | 生成模式：'single' 或 'multi' |
| newMode | GenerationMode | 是 | 新的生成模式 |
| photoCount | number | 是 | 照片数量 |

### 类型定义

```typescript
/** 生成模式枚举 */
type GenerationMode = 'single' | 'multi'

/** 生成模式配置 */
interface GenerationModeConfig {
  mode: GenerationMode
  displayName: string           // 显示名称
  description: string           // 说明文字
  minPhotos: number             // 最少照片数
  maxPhotos: number             // 最多照片数
  requiresFaceDetection: boolean // 是否需要人脸检测
  icon?: string                 // 图标名称（可选）
}
```

## 响应

### getGenerationModeConfig()

**单人模式配置**

```json
{
  "mode": "single",
  "displayName": "单人照片",
  "description": "上传1张照片，生成多种风格的个人写真",
  "minPhotos": 1,
  "maxPhotos": 1,
  "requiresFaceDetection": false,
  "icon": "user"
}
```

**多人模式配置**

```json
{
  "mode": "multi",
  "displayName": "多人照片",
  "description": "上传2-4张单人照（如宝宝、爸爸、妈妈），生成温馨全家福",
  "minPhotos": 2,
  "maxPhotos": 4,
  "requiresFaceDetection": true,
  "icon": "users"
}
```

### validatePhotoCount()

**验证通过**

```json
{
  "isValid": true
}
```

**验证失败（照片数量不符）**

```json
{
  "isValid": false,
  "error": "单人模式只能上传1张照片"
}
```

```json
{
  "isValid": false,
  "error": "多人模式需要上传2-4张照片，当前已上传1张"
}
```

### filterStylesByMode()

**单人模式可用风格**

```json
[
  "style_warm_home",
  "style_fresh_nature",
  "style_cartoon",
  "style_vintage",
  "style_dreamy",
  "style_festival"
]
```

**多人模式可用风格**

```json
[
  "style_family_warmth",
  "style_parent_child_interaction"
]
```

### 错误响应

| 错误类型 | 错误消息 | 说明 |
|---------|---------|------|
| 无效模式 | "无效的生成模式，仅支持 'single' 或 'multi'" | 传入的 mode 不在枚举值范围内 |
| 照片数量不足 | "多人模式至少需要2张照片" | 照片数量少于最小要求 |
| 照片数量超限 | "多人模式最多支持4张照片" | 照片数量超过最大限制 |

## 示例

### 请求示例

```typescript
import {
  getGenerationModeConfig,
  switchGenerationMode,
  validatePhotoCount,
  filterStylesByMode
} from '@/lib/generation-mode'
import { useAppStore } from '@/lib/store'

// 示例1: 获取模式配置
const singleConfig = getGenerationModeConfig('single')
console.log(singleConfig.displayName) // "单人照片"
console.log(singleConfig.maxPhotos)   // 1

const multiConfig = getGenerationModeConfig('multi')
console.log(multiConfig.requiresFaceDetection) // true

// 示例2: 切换模式（Zustand store）
const { generationMode, switchMode } = useAppStore()

function handleModeChange(newMode: GenerationMode) {
  if (confirm('切换模式将清空已选照片，是否继续？')) {
    switchMode(newMode)
    console.log('模式已切换:', newMode)
  }
}

// 示例3: 验证照片数量
const result = validatePhotoCount('multi', 1)
if (!result.isValid) {
  alert(result.error) // "多人模式需要上传2-4张照片，当前已上传1张"
}

// 示例4: 过滤可用风格
const availableStyles = await filterStylesByMode('single')
console.log('单人模式可用风格:', availableStyles)

// 示例5: 添加照片时自动验证
async function handleAddPhoto(photo: PhotoUpload) {
  const { generationMode, uploadedPhotos, addPhoto } = useAppStore()
  const config = getGenerationModeConfig(generationMode)

  // 检查数量限制
  if (uploadedPhotos.length >= config.maxPhotos) {
    alert(`${config.displayName}最多上传${config.maxPhotos}张照片`)
    return
  }

  try {
    await addPhoto(photo) // 内部会触发人脸检测（如果需要）
    console.log('照片添加成功')
  } catch (error) {
    alert(error.message)
  }
}
```

### 响应示例

```json
{
  "mode": "multi",
  "displayName": "多人照片",
  "description": "上传2-4张单人照（如宝宝、爸爸、妈妈），生成温馨全家福",
  "minPhotos": 2,
  "maxPhotos": 4,
  "requiresFaceDetection": true
}
```

## 实现细节

### 模式配置常量

```typescript
// src/lib/generation-mode.ts
export const GENERATION_MODES: Record<GenerationMode, GenerationModeConfig> = {
  single: {
    mode: 'single',
    displayName: '单人照片',
    description: '上传1张照片，生成多种风格的个人写真',
    minPhotos: 1,
    maxPhotos: 1,
    requiresFaceDetection: false,
    icon: 'user'
  },
  multi: {
    mode: 'multi',
    displayName: '多人照片',
    description: '上传2-4张单人照（如宝宝、爸爸、妈妈），生成温馨全家福',
    minPhotos: 2,
    maxPhotos: 4,
    requiresFaceDetection: true,
    icon: 'users'
  }
}
```

### Zustand Store 集成

```typescript
// src/lib/store.ts
interface ExtendedAppStore extends AppStore {
  // 新增状态
  generationMode: GenerationMode
  photoValidationResults: Map<string, FaceValidationResult>
  filteredStyleIds: string[]

  // 模式管理方法
  setGenerationMode: (mode: GenerationMode) => void
  switchMode: (newMode: GenerationMode) => void

  // 照片管理方法
  addPhoto: (photo: PhotoUpload) => Promise<void>
  clearPhotos: () => void

  // 风格过滤方法
  updateFilteredStyles: () => Promise<void>
}

export const useAppStore = create<ExtendedAppStore>((set, get) => ({
  generationMode: 'single',
  uploadedPhotos: [],
  photoValidationResults: new Map(),
  filteredStyleIds: [],

  switchMode: (newMode) => {
    const config = getGenerationModeConfig(newMode)
    console.log(`切换到${config.displayName}`)

    set({
      generationMode: newMode,
      uploadedPhotos: [],
      photoValidationResults: new Map(),
    })

    get().updateFilteredStyles()
  },

  addPhoto: async (photo) => {
    const { generationMode, uploadedPhotos } = get()
    const config = GENERATION_MODES[generationMode]

    // 验证数量限制
    if (uploadedPhotos.length >= config.maxPhotos) {
      throw new Error(`${config.displayName}最多上传${config.maxPhotos}张照片`)
    }

    // 人脸检测（仅多人模式）
    if (config.requiresFaceDetection) {
      const validation = await validateSinglePersonPhoto(photo.filePath)
      get().setPhotoValidation(photo.id, validation)

      if (!validation.isValid) {
        throw new Error(validation.error || '照片验证失败')
      }

      photo.faceCount = validation.faceCount
      photo.faceConfidence = validation.confidence
    }

    set((state) => ({
      uploadedPhotos: [...state.uploadedPhotos, photo]
    }))
  },

  updateFilteredStyles: async () => {
    const { generationMode } = get()
    const filtered = await filterStylesByMode(generationMode)
    set({ filteredStyleIds: filtered })
  }
}))
```

### 风格过滤实现

```typescript
export async function filterStylesByMode(
  mode: GenerationMode
): Promise<string[]> {
  // 查询所有风格模板
  const allStyles = await findAllStyles()

  // 根据模式过滤
  const filtered = allStyles.filter(style => {
    // 检查风格的 supported_modes 字段
    const supportedModes = style.supportedModes || ['single']
    return supportedModes.includes(mode)
  })

  return filtered.map(style => style.id)
}
```

## 注意事项

### 性能要求

- 模式切换应立即生效（< 100ms）
- 风格过滤查询应 < 50ms（本地数据库查询）
- 切换模式时的确认弹窗应清晰说明后果（清空已选照片）

### 错误处理

- 模式切换前应检查是否有未保存的照片，提示用户确认
- 照片数量验证应在添加照片前执行，避免错误状态
- 人脸检测失败时，应保留原有照片列表，不清空

### 边界情况

- **单人模式添加第2张照片**：应立即拒绝，提示"单人模式只能上传1张照片"
- **多人模式只上传1张照片**：允许添加，但在进入下一步时验证并提示"至少需要2张照片"
- **超过4张照片**：多人模式上传第5张时，应禁用上传按钮或显示"已达上限"
- **模式切换时机**：
  - 允许切换：照片选择阶段
  - 禁止切换：已进入风格选择阶段（需返回上一步）
  - 禁止切换：生成任务进行中

### 数据库持久化

生成任务应存储模式信息：

```sql
-- generation_tasks 表
INSERT INTO generation_tasks (
  id, mode, photo_ids, selected_style_ids, created_at
) VALUES (
  'task_123', 'multi', '["photo1","photo2","photo3"]', '["style1"]', 1729008000000
);
```

### 风格模板配置

风格模板应包含模式支持信息：

```sql
-- style_templates 表
ALTER TABLE style_templates
ADD COLUMN supported_modes TEXT NOT NULL DEFAULT '["single"]';
ADD COLUMN min_photos INTEGER NOT NULL DEFAULT 1;
ADD COLUMN max_photos INTEGER NOT NULL DEFAULT 1;
ADD COLUMN is_multi_person INTEGER NOT NULL DEFAULT 0;

-- 示例：配置多人风格
UPDATE style_templates SET
  supported_modes = '["multi"]',
  min_photos = 2,
  max_photos = 4,
  is_multi_person = 1
WHERE id = 'style_family_warmth';
```

### UI集成建议

**模式选择界面**

```tsx
function ModeSelectionPage() {
  const { generationMode, switchMode } = useAppStore()

  const modes: GenerationMode[] = ['single', 'multi']

  return (
    <div>
      <h2>选择生成模式</h2>
      {modes.map(mode => {
        const config = getGenerationModeConfig(mode)
        return (
          <Card
            key={mode}
            selected={generationMode === mode}
            onClick={() => switchMode(mode)}
          >
            <Icon name={config.icon} />
            <h3>{config.displayName}</h3>
            <p>{config.description}</p>
            <Badge>{config.minPhotos === config.maxPhotos
              ? `${config.maxPhotos}张照片`
              : `${config.minPhotos}-${config.maxPhotos}张照片`}
            </Badge>
          </Card>
        )
      })}
    </div>
  )
}
```

**实时验证提示**

```tsx
function PhotoUploadSection() {
  const { generationMode, uploadedPhotos } = useAppStore()
  const config = getGenerationModeConfig(generationMode)

  const validation = validatePhotoCount(generationMode, uploadedPhotos.length)

  return (
    <div>
      <h3>已上传 {uploadedPhotos.length}/{config.maxPhotos} 张照片</h3>

      {!validation.isValid && (
        <Alert type="warning">{validation.error}</Alert>
      )}

      <Button
        disabled={uploadedPhotos.length >= config.maxPhotos}
        onClick={handleUploadClick}
      >
        上传照片
      </Button>
    </div>
  )
}
```
