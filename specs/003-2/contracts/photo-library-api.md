# 照片库查询API

## 概述

本API用于查询和管理照片库，支持两种主要场景：
1. **参考照片库**：用户手工上传的原始照片，用于作为AI生成的参考
2. **生成照片相册**：AI生成的所有照片，支持按照片类型、日期、里程碑、风格等条件筛选

两种照片存储在同一个数据库表中，通过 `is_ai_generated` 字段区分。

## 请求

### 函数签名

```typescript
/**
 * 获取参考照片库（用户上传的原始照片）
 * @param personId - 可选，按人物筛选
 * @returns 参考照片列表
 */
async function getReferencePhotos(
  personId?: string
): Promise<PhotoUpload[]>

/**
 * 获取生成照片相册（AI生成的照片）
 * @param filter - 筛选条件
 * @returns 照片列表和总数
 */
async function getGeneratedPhotos(
  filter: AlbumFilter
): Promise<AlbumQueryResult>

/**
 * 按ID查询单张照片
 * @param photoId - 照片ID
 * @returns 照片详情
 */
async function getPhotoById(
  photoId: string
): Promise<PhotoUpload | null>

/**
 * 查询某张生成照片的源照片
 * @param generatedPhotoId - 生成照片ID
 * @returns 源照片列表
 */
async function getSourcePhotos(
  generatedPhotoId: string
): Promise<PhotoUpload[]>
```

### 参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| personId | string | 否 | 人物ID，用于筛选特定人物的照片 |
| filter | AlbumFilter | 是 | 相册筛选条件 |
| photoId | string | 是 | 照片ID |
| generatedPhotoId | string | 是 | 生成照片ID |

### 类型定义

```typescript
/** 相册筛选条件 */
interface AlbumFilter {
  photoType?: 'all' | 'reference' | 'ai'  // 照片类型
  styleId?: string                         // 风格ID
  milestoneName?: string                   // 里程碑名称
  dateRange?: {
    start: number  // Unix timestamp (毫秒)
    end: number
  }
  personId?: string                        // 人物ID
  generationMode?: 'single' | 'multi'      // 生成模式
  limit?: number                           // 分页大小（默认50）
  offset?: number                          // 分页偏移（默认0）
}

/** 相册查询结果 */
interface AlbumQueryResult {
  photos: PhotoUpload[]  // 照片列表
  total: number          // 总数（用于分页）
  hasMore: boolean       // 是否还有更多
}

/** 照片数据结构 */
interface PhotoUpload {
  id: string
  filePath: string
  originalName?: string
  width: number
  height: number
  fileSize: number
  format: 'JPG' | 'PNG'
  uploadedAt: number
  isCropped: boolean
  cropRatio?: '1:1' | '3:4' | '4:3'
  isInLibrary: boolean

  // AI生成相关字段
  isAIGenerated: boolean             // AI生成标识
  aiMetadata?: string                // AI元数据JSON字符串

  // 人物信息
  personId?: string
  personName?: string

  // 人脸检测信息
  faceCount?: number                 // 人脸数量
  faceConfidence?: number            // 人脸检测置信度
  qualityScore?: number              // 综合质量评分
}

/** AI照片元数据（aiMetadata JSON解析后的结构） */
interface AIPhotoMetadata {
  taskId: string              // 生成任务ID
  styleId: string             // 风格ID
  styleName: string           // 风格名称
  milestoneName?: string      // 里程碑名称
  similarityLevel: string     // 相似度级别 (high/medium/low)
  sourcePhotoIds: string[]    // 源照片ID数组
  sequenceNumber: number      // 同风格内的序号 (1-4)
  generatedAt: number         // 生成时间戳
  generationMode?: string     // 生成模式 (single/multi)
}
```

## 响应

### getReferencePhotos()

**成功响应**

```json
[
  {
    "id": "photo_baby_001",
    "filePath": "E:\\HomeMemo\\photos\\baby_portrait.jpg",
    "originalName": "baby_portrait.jpg",
    "width": 1920,
    "height": 1080,
    "fileSize": 2048576,
    "format": "JPG",
    "uploadedAt": 1729008000000,
    "isCropped": false,
    "isInLibrary": true,
    "isAIGenerated": false,
    "personId": "person_baby_001",
    "personName": "宝宝",
    "faceCount": 1,
    "faceConfidence": 0.85
  },
  {
    "id": "photo_dad_001",
    "filePath": "E:\\HomeMemo\\photos\\dad_portrait.jpg",
    "width": 2000,
    "height": 1500,
    "fileSize": 3145728,
    "format": "JPG",
    "uploadedAt": 1729007000000,
    "isInLibrary": true,
    "isAIGenerated": false,
    "personId": "person_dad_001",
    "personName": "爸爸",
    "faceCount": 1,
    "faceConfidence": 0.92
  }
]
```

### getGeneratedPhotos()

**成功响应**

```json
{
  "photos": [
    {
      "id": "photo_ai_001",
      "filePath": "E:\\HomeMemo\\generated\\warm_home_1.jpg",
      "width": 2048,
      "height": 2048,
      "fileSize": 5242880,
      "format": "JPG",
      "uploadedAt": 1729010000000,
      "isInLibrary": true,
      "isAIGenerated": true,
      "aiMetadata": "{\"taskId\":\"task_123\",\"styleId\":\"style_warm_home\",\"styleName\":\"居家暖光温馨风\",\"milestoneName\":\"百日照\",\"similarityLevel\":\"high\",\"sourcePhotoIds\":[\"photo_baby_001\"],\"sequenceNumber\":1,\"generatedAt\":1729010000000,\"generationMode\":\"single\"}",
      "personId": "person_baby_001",
      "personName": "宝宝"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

### getSourcePhotos()

**成功响应（多人照片生成场景）**

```json
[
  {
    "id": "photo_baby_001",
    "filePath": "E:\\HomeMemo\\photos\\baby_portrait.jpg",
    "isAIGenerated": false,
    "personName": "宝宝"
  },
  {
    "id": "photo_dad_001",
    "filePath": "E:\\HomeMemo\\photos\\dad_portrait.jpg",
    "isAIGenerated": false,
    "personName": "爸爸"
  },
  {
    "id": "photo_mom_001",
    "filePath": "E:\\HomeMemo\\photos\\mom_portrait.jpg",
    "isAIGenerated": false,
    "personName": "妈妈"
  }
]
```

### 错误响应

| 错误类型 | 错误消息 | 说明 |
|---------|---------|------|
| 照片不存在 | "照片ID不存在" | 查询的照片ID在数据库中不存在 |
| 无效筛选条件 | "无效的照片类型筛选" | photoType 不在枚举值范围内 |
| 数据库错误 | "查询照片库失败: [详细错误]" | 数据库查询异常 |

## 示例

### 请求示例

```typescript
import {
  getReferencePhotos,
  getGeneratedPhotos,
  getSourcePhotos
} from '@/lib/photo-library'

// 示例1: 获取参考照片库（用于照片选择界面）
async function loadReferencePhotosForSelection() {
  const photos = await getReferencePhotos()
  console.log(`参考照片库共有 ${photos.length} 张照片`)
  return photos
}

// 示例2: 获取特定人物的参考照片
async function loadBabyPhotos() {
  const photos = await getReferencePhotos('person_baby_001')
  console.log(`宝宝的参考照片: ${photos.length} 张`)
  return photos
}

// 示例3: 获取所有AI生成照片（最新50张）
async function loadLatestGeneratedPhotos() {
  const result = await getGeneratedPhotos({
    photoType: 'ai',
    limit: 50,
    offset: 0
  })
  console.log(`共有 ${result.total} 张AI照片，当前加载 ${result.photos.length} 张`)
  return result
}

// 示例4: 按风格筛选生成照片
async function loadPhotosByStyle(styleId: string) {
  const result = await getGeneratedPhotos({
    photoType: 'ai',
    styleId: styleId
  })
  console.log(`${styleId} 风格的照片: ${result.total} 张`)
  return result
}

// 示例5: 组合筛选（里程碑 + 风格 + 日期）
async function loadFilteredPhotos() {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  const result = await getGeneratedPhotos({
    photoType: 'ai',
    milestoneName: '百日照',
    styleId: 'style_warm_home',
    dateRange: {
      start: sevenDaysAgo,
      end: Date.now()
    },
    limit: 100
  })

  console.log('筛选结果:', result)
  return result
}

// 示例6: 查看生成照片的源照片（溯源）
async function showSourcePhotosForGenerated(generatedPhotoId: string) {
  const sourcePhotos = await getSourcePhotos(generatedPhotoId)
  console.log(`该照片使用了 ${sourcePhotos.length} 张源照片:`)
  sourcePhotos.forEach(photo => {
    console.log(`- ${photo.personName}: ${photo.filePath}`)
  })
  return sourcePhotos
}

// 示例7: 分页加载（无限滚动）
async function loadMorePhotos(currentOffset: number) {
  const LIMIT = 50

  const result = await getGeneratedPhotos({
    photoType: 'ai',
    limit: LIMIT,
    offset: currentOffset
  })

  return {
    photos: result.photos,
    nextOffset: currentOffset + LIMIT,
    hasMore: result.hasMore
  }
}
```

### 响应示例

```json
{
  "photos": [
    {
      "id": "photo_ai_multi_001",
      "filePath": "E:\\HomeMemo\\generated\\family_warmth_1.jpg",
      "width": 2048,
      "height": 2048,
      "fileSize": 6291456,
      "format": "JPG",
      "uploadedAt": 1729012000000,
      "isInLibrary": true,
      "isAIGenerated": true,
      "aiMetadata": "{\"taskId\":\"task_456\",\"styleId\":\"style_family_warmth\",\"styleName\":\"温馨亲子互动风\",\"milestoneName\":\"周岁照\",\"similarityLevel\":\"high\",\"sourcePhotoIds\":[\"photo_baby_001\",\"photo_dad_001\",\"photo_mom_001\"],\"sequenceNumber\":1,\"generatedAt\":1729012000000,\"generationMode\":\"multi\"}"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

## 实现细节

### 数据库查询实现

```typescript
// src/lib/photo-library.ts
import { getDb } from './database'

/**
 * 获取参考照片库
 */
export async function getReferencePhotos(
  personId?: string
): Promise<PhotoUpload[]> {
  const db = await getDb()

  let query = `
    SELECT * FROM library_photos
    WHERE is_ai_generated = 0
  `
  const params: any[] = []

  if (personId) {
    query += ` AND person_id = ?`
    params.push(personId)
  }

  query += ` ORDER BY uploaded_at DESC`

  const rows = await db.select(query, params)
  return mapToPhotoUpload(rows)
}

/**
 * 获取生成照片相册（支持多维度筛选）
 */
export async function getGeneratedPhotos(
  filter: AlbumFilter
): Promise<AlbumQueryResult> {
  const db = await getDb()
  const conditions: string[] = []
  const params: any[] = []

  // 1. 基础条件：照片类型
  if (filter.photoType === 'reference') {
    conditions.push('is_ai_generated = 0')
  } else if (filter.photoType === 'ai') {
    conditions.push('is_ai_generated = 1')
  }

  // 2. AI照片专属筛选
  if (filter.styleId) {
    conditions.push("json_extract(ai_metadata, '$.styleId') = ?")
    params.push(filter.styleId)
  }

  if (filter.milestoneName) {
    conditions.push("json_extract(ai_metadata, '$.milestoneName') = ?")
    params.push(filter.milestoneName)
  }

  if (filter.generationMode) {
    conditions.push("json_extract(ai_metadata, '$.generationMode') = ?")
    params.push(filter.generationMode)
  }

  // 3. 通用筛选
  if (filter.personId) {
    conditions.push('person_id = ?')
    params.push(filter.personId)
  }

  if (filter.dateRange) {
    conditions.push('uploaded_at BETWEEN ? AND ?')
    params.push(filter.dateRange.start, filter.dateRange.end)
  }

  // 4. 组装查询
  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  // 查询总数
  const countQuery = `SELECT COUNT(*) as count FROM library_photos ${whereClause}`
  const countResult = await db.select<Array<{ count: number }>>(countQuery, params)
  const total = countResult[0]?.count || 0

  // 查询数据
  const limit = filter.limit || 50
  const offset = filter.offset || 0

  const dataQuery = `
    SELECT * FROM library_photos
    ${whereClause}
    ORDER BY uploaded_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  const rows = await db.select(dataQuery, params)
  const photos = mapToPhotoUpload(rows)

  return {
    photos,
    total,
    hasMore: offset + photos.length < total
  }
}

/**
 * 查询某张生成照片的源照片
 */
export async function getSourcePhotos(
  generatedPhotoId: string
): Promise<PhotoUpload[]> {
  const db = await getDb()

  // 1. 获取生成照片的元数据
  const photo = await getPhotoById(generatedPhotoId)
  if (!photo || !photo.aiMetadata) {
    return []
  }

  // 2. 解析源照片ID数组
  const metadata = JSON.parse(photo.aiMetadata) as AIPhotoMetadata
  const sourceIds = metadata.sourcePhotoIds

  if (!sourceIds || sourceIds.length === 0) {
    return []
  }

  // 3. 批量查询源照片
  const placeholders = sourceIds.map(() => '?').join(',')
  const query = `SELECT * FROM library_photos WHERE id IN (${placeholders})`
  const rows = await db.select(query, sourceIds)

  return mapToPhotoUpload(rows)
}
```

### 索引优化

确保以下索引已创建：

```sql
-- 核心索引：照片类型+时间
CREATE INDEX IF NOT EXISTS idx_library_photos_ai_type_time
ON library_photos(is_ai_generated, uploaded_at DESC);

-- 人脸数量索引
CREATE INDEX IF NOT EXISTS idx_library_photos_face_count
ON library_photos(face_count);

-- JSON字段索引（SQLite 3.38+）
CREATE INDEX IF NOT EXISTS idx_library_photos_style
ON library_photos(json_extract(ai_metadata, '$.styleId'));

CREATE INDEX IF NOT EXISTS idx_library_photos_milestone
ON library_photos(json_extract(ai_metadata, '$.milestoneName'));

CREATE INDEX IF NOT EXISTS idx_library_photos_task
ON library_photos(json_extract(ai_metadata, '$.taskId'));
```

## 注意事项

### 性能要求

- 参考照片库查询（100张照片）：< 10ms
- 相册筛选查询（1000张照片，单条件）：< 30ms
- 相册筛选查询（1000张照片，多条件）：< 50ms
- 源照片溯源查询（4张照片）：< 5ms

### 错误处理

- 数据库查询失败应返回空数组，而不是抛出异常
- JSON解析失败时，`aiMetadata` 字段应返回 `null`
- 照片文件不存在时，应在UI层处理（显示占位图）

### 边界情况

- **空照片库**：首次使用应用，参考照片库和生成照片相册都为空
  - 解决方案：显示"暂无照片"占位图，引导用户上传

- **大数据量**：10000+张照片时，查询可能变慢
  - 解决方案：使用虚拟滚动（react-window），每次只渲染可见区域
  - 优化方案：生成缩略图，添加 `thumbnail_path` 字段

- **筛选无结果**：用户组合筛选后没有匹配的照片
  - 解决方案：显示"暂无符合条件的照片"提示，显示当前筛选条件

- **日期范围**：用户选择未来日期范围
  - 解决方案：前端验证，禁止选择未来日期

### 数据一致性

- **照片删除**：删除照片时，需要同步更新相关任务记录
- **元数据更新**：修改风格名称/里程碑名称后，需要同步更新 `aiMetadata`
- **文件清理**：删除照片记录时，应同步删除磁盘文件

### UI集成建议

**参考照片库选择界面**

```tsx
function ReferencePhotoSelector() {
  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { generationMode } = useAppStore()
  const config = getGenerationModeConfig(generationMode)

  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    const data = await getReferencePhotos()
    setPhotos(data)
  }

  function handleSelect(photoId: string) {
    const newSelected = new Set(selected)
    if (selected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      if (selected.size >= config.maxPhotos) {
        alert(`最多选择${config.maxPhotos}张照片`)
        return
      }
      newSelected.add(photoId)
    }
    setSelected(newSelected)
  }

  return (
    <div>
      <h3>从照片库选择（{selected.size}/{config.maxPhotos}）</h3>
      <PhotoGrid photos={photos} selected={selected} onSelect={handleSelect} />
    </div>
  )
}
```

**相册筛选界面**

```tsx
function GeneratedPhotoAlbum() {
  const [photos, setPhotos] = useState<PhotoUpload[]>([])
  const [filter, setFilter] = useState<AlbumFilter>({ photoType: 'ai' })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadPhotos()
  }, [filter])

  async function loadPhotos() {
    const result = await getGeneratedPhotos(filter)
    setPhotos(result.photos)
    setTotal(result.total)
  }

  return (
    <div>
      <FilterBar filter={filter} onChange={setFilter} />
      <p>共 {total} 张照片</p>
      <PhotoGrid photos={photos} />
    </div>
  )
}
```
