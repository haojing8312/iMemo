# Phase 0 技术研究报告: 多人照片生成模式选择

**Feature Branch**: 003-2
**研究日期**: 2025-10-15
**研究人员**: 后端架构师
**状态**: 完成

---

## 1. 多人照片API调用方式

### Decision: Seedream 4.0 多参考图调用策略

**技术实现**:
```typescript
// 方案: 传递多张base64图片的JSON数组
const payload = {
  api_key: apiKey,
  base_url: baseUrl,
  model: 'doubao-seedream-4-0-250828',
  prompt: generatedPrompt,
  image_base64: imageBase64Array,  // string[] - 多张图片的base64数组
  size: '2K'
}

// 调用Tauri后端命令
const resp = await invoke('seedream_generate', { payload })
```

**参数说明**:
- `image_base64`: 类型从 `string` 扩展为 `string | string[]`
- 单人模式: 传递单个base64字符串
- 多人模式: 传递base64字符串数组(长度2-4)
- API会将多张参考照片融合到同一张生成图中

### Rationale: 为什么选择这种方式?

1. **API兼容性**: Seedream 4.0 官方支持多参考图输入(参考现有文档seedream-4-api-research.md)
2. **最小改动**: 现有`seedream_generate` Tauri命令只需扩展参数类型,无需重构
3. **向后兼容**: 单人模式(string)和多人模式(string[])共用同一接口,通过类型判断路由
4. **同步返回**: Seedream API是同步的,不需要轮询,适合多人场景(避免复杂的状态管理)

### Alternatives: 其他AI服务的多参考图方案对比

| 方案 | API格式 | 优点 | 缺点 | 是否采用 |
|------|---------|------|------|----------|
| **Seedream 4.0 (当前)** | `image_base64: string[]` | 价格低($0.025/张)、中文友好、同步返回 | 需要验证官方文档是否支持多图 | ✅ 采用 |
| **DALL-E 3** | `image: File[]` 分别调用 | OpenAI官方支持、质量稳定 | 价格高($0.08/张)、需多次调用后手动合成 | ❌ 成本高 |
| **Midjourney** | `/blend` 命令 | 多图融合效果好 | 无官方API、需Discord自动化 | ❌ 技术不成熟 |
| **Stable Diffusion** | ControlNet多输入 | 开源免费、可本地部署 | 需自建服务器、模型配置复杂 | ❌ 技术成本高 |

**最终选择**: 继续使用Seedream 4.0,通过Tauri Rust后端扩展多图支持。

---

## 2. 人脸检测实现方案

### Decision: 客户端face-api.js + 阈值验证

**技术实现**:
```typescript
import * as faceapi from 'face-api.js'

// 加载模型(应用启动时)
await faceapi.nets.tinyFaceDetector.loadFromUri('/face-models')
await faceapi.nets.faceLandmark68Net.loadFromUri('/face-models')

// 检测单人照片
async function validateSinglePersonPhoto(filePath: string): Promise<{
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
}> {
  // 1. 加载图片
  const { convertFileSrc } = await import('@tauri-apps/api/core')
  const imgElement = await loadImage(convertFileSrc(filePath))

  // 2. 检测所有人脸
  const detections = await faceapi
    .detectAllFaces(imgElement, new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,        // 检测精度
      scoreThreshold: 0.5    // 最低置信度阈值
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
}
```

**检测阈值配置**:
- `inputSize: 512`: 平衡速度和精度(512x512输入)
- `scoreThreshold: 0.5`: 最低置信度50%(过低会误检,过高会漏检)
- `minFaceSize: 80`: 最小人脸尺寸80px(过滤远景背景人脸)

**数据库存储**:
```sql
-- library_photos表已有字段(已迁移)
ALTER TABLE library_photos ADD COLUMN face_count INTEGER DEFAULT 0;
ALTER TABLE library_photos ADD COLUMN face_confidence REAL;
ALTER TABLE library_photos ADD COLUMN quality_score REAL;
```

### Rationale: 为什么客户端检测优于服务端?

1. **隐私优先**: 照片不离开本地,符合HomeMemo Constitution原则
2. **实时反馈**: 上传时即时验证,用户体验流畅(< 2秒)
3. **减少网络开销**: 避免上传不合格照片到服务器再退回
4. **离线可用**: 人脸检测模型本地化(face-models目录已有)
5. **成本优势**: 无需调用第三方人脸API(如阿里云/腾讯云),节省费用

### Alternatives: 其他人脸检测库对比

| 方案 | 模型大小 | 检测速度 | 精度 | 浏览器兼容 | 是否采用 |
|------|---------|---------|------|-----------|----------|
| **face-api.js (当前)** | ~6MB | 快(~1s) | 高(基于TensorFlow.js) | ✅ 优秀 | ✅ 采用 |
| **opencv.js** | ~8MB | 中等(~2s) | 高(OpenCV) | ⚠️ 需WASM | ❌ 体积大 |
| **tracking.js** | ~500KB | 快(~0.5s) | 中(JS实现) | ✅ 优秀 | ❌ 精度不足 |
| **MediaPipe Face Detection** | ~3MB | 快(~0.8s) | 极高(Google) | ✅ 优秀 | ⚠️ 学习成本高 |
| **云端API (腾讯云/阿里云)** | 0 | 慢(~3s网络) | 极高 | ✅ 优秀 | ❌ 违背隐私原则 |

**选择理由**: face-api.js已集成在项目中(package.json有依赖),模型文件已下载(public/face-models/),无需额外工作。

---

## 3. 照片库分离架构

### Decision: 单表双标识 + 视图层过滤

**数据库Schema设计**:
```sql
-- 复用现有 library_photos 表(单表设计)
CREATE TABLE library_photos (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  uploaded_at INTEGER NOT NULL,
  is_in_library INTEGER NOT NULL DEFAULT 1,   -- 是否在照片库中
  is_ai_generated INTEGER NOT NULL DEFAULT 0,  -- 新增: AI生成标识
  ai_metadata TEXT,                             -- 新增: AI元数据JSON
  person_id TEXT,
  person_name TEXT,
  face_count INTEGER DEFAULT 0,                -- 新增: 人脸数量
  face_confidence REAL,                        -- 新增: 人脸检测置信度
  -- 其他字段省略...
);

-- 创建索引优化查询
CREATE INDEX idx_library_photos_ai_generated ON library_photos(is_ai_generated);
CREATE INDEX idx_library_photos_type_uploaded ON library_photos(is_ai_generated, uploaded_at DESC);
```

**ai_metadata JSON结构**:
```typescript
interface AIPhotoMetadata {
  taskId: string              // 生成任务ID
  styleId: string             // 风格ID
  styleName: string           // 风格名称(冗余,避免JOIN)
  milestoneName?: string      // 里程碑名称
  similarityLevel: string     // 相似度级别
  sourcePhotoIds: string[]    // 使用的原始照片ID列表
  sequenceNumber: number      // 该风格的第几张图(1-4)
  generatedAt: number         // 生成时间戳
}
```

**应用层查询封装**:
```typescript
// 参考照片库: 只显示用户上传的原始照片
export async function findReferencePhotos(): Promise<PhotoUpload[]> {
  const db = await getDb()
  const rows = await db.select(
    `SELECT * FROM library_photos
     WHERE is_ai_generated = 0
     ORDER BY uploaded_at DESC`
  )
  return mapToPhotoUpload(rows)
}

// 生成照片相册: 只显示AI生成的照片
export async function findGeneratedPhotos(filter: AlbumFilter): Promise<PhotoUpload[]> {
  const db = await getDb()
  let query = `SELECT * FROM library_photos WHERE is_ai_generated = 1`
  const params: any[] = []

  // 筛选条件: 里程碑
  if (filter.milestoneId) {
    query += ` AND json_extract(ai_metadata, '$.milestoneName') = ?`
    params.push(filter.milestoneId)
  }

  // 筛选条件: 风格
  if (filter.styleId) {
    query += ` AND json_extract(ai_metadata, '$.styleId') = ?`
    params.push(filter.styleId)
  }

  // 筛选条件: 日期范围
  if (filter.startDate && filter.endDate) {
    query += ` AND uploaded_at BETWEEN ? AND ?`
    params.push(filter.startDate, filter.endDate)
  }

  query += ` ORDER BY uploaded_at DESC`
  const rows = await db.select(query, params)
  return mapToPhotoUpload(rows)
}
```

### Rationale: 为什么选择单表+标识?

1. **数据一致性**: 所有照片共享同一套字段(file_path/width/height等),避免重复定义
2. **迁移平滑**: 现有数据库已有library_photos表,只需添加2个字段(ALTER TABLE)
3. **关系简化**: 避免照片表和生成元数据表的外键关联(减少JOIN查询)
4. **存储效率**: AI元数据用JSON存储,灵活扩展且节省列数
5. **查询优化**: 通过索引(is_ai_generated + uploaded_at)实现高效分离查询

### Alternatives: 双表分离方案对比

| 方案 | 表结构 | 优点 | 缺点 | 是否采用 |
|------|--------|------|------|----------|
| **单表+标识(当前)** | `library_photos` + `is_ai_generated` | 简单、易迁移、查询快 | JSON查询需SQLite 3.38+ | ✅ 采用 |
| **双表分离** | `reference_photos` + `generated_photos` | 逻辑清晰、完全隔离 | 字段冗余、迁移复杂、需同步更新 | ❌ 过度设计 |
| **单表+视图** | `library_photos` + VIEW | 查询简洁 | 视图不支持插入、增加抽象层 | ❌ 灵活性差 |
| **三表设计** | `photos` + `ai_metadata` + `reference_metadata` | 最规范 | 过度工程化、JOIN性能差 | ❌ 复杂度高 |

**风险评估**:
- SQLite版本要求: Tauri内置SQLite >= 3.38,支持`json_extract()`函数
- JSON查询性能: 在10000+照片规模下,JSON查询可能变慢 → 后期可迁移为独立列

---

## 4. 相册筛选查询优化

### Decision: 组合索引 + 参数化SQL查询

**索引策略**:
```sql
-- 1. 复合索引: 类型+时间(最常用筛选组合)
CREATE INDEX idx_photos_type_time ON library_photos(is_ai_generated, uploaded_at DESC);

-- 2. JSON索引: 风格ID(SQLite 3.38+支持)
CREATE INDEX idx_photos_style ON library_photos(json_extract(ai_metadata, '$.styleId'));

-- 3. JSON索引: 里程碑名称
CREATE INDEX idx_photos_milestone ON library_photos(json_extract(ai_metadata, '$.milestoneName'));

-- 4. 单列索引: 人物ID(用于参考照片库筛选)
CREATE INDEX idx_photos_person ON library_photos(person_id);
```

**查询设计模式**:
```typescript
interface AlbumFilter {
  photoType?: 'all' | 'reference' | 'ai'   // 照片类型
  styleId?: string                          // 风格ID
  milestoneName?: string                    // 里程碑名称
  dateRange?: {
    start: number  // Unix timestamp
    end: number
  }
  personId?: string                         // 人物筛选
  limit?: number                            // 分页限制
  offset?: number                           // 分页偏移
}

export async function queryAlbumPhotos(filter: AlbumFilter): Promise<PhotoUpload[]> {
  const db = await getDb()
  const conditions: string[] = []
  const params: any[] = []

  // 基础条件: 照片类型
  if (filter.photoType === 'reference') {
    conditions.push('is_ai_generated = 0')
  } else if (filter.photoType === 'ai') {
    conditions.push('is_ai_generated = 1')
  }

  // AI照片专属筛选
  if (filter.styleId) {
    conditions.push("json_extract(ai_metadata, '$.styleId') = ?")
    params.push(filter.styleId)
  }

  if (filter.milestoneName) {
    conditions.push("json_extract(ai_metadata, '$.milestoneName') = ?")
    params.push(filter.milestoneName)
  }

  // 通用筛选
  if (filter.personId) {
    conditions.push('person_id = ?')
    params.push(filter.personId)
  }

  if (filter.dateRange) {
    conditions.push('uploaded_at BETWEEN ? AND ?')
    params.push(filter.dateRange.start, filter.dateRange.end)
  }

  // 组装查询
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const query = `
    SELECT * FROM library_photos
    ${whereClause}
    ORDER BY uploaded_at DESC
    LIMIT ${filter.limit || 100} OFFSET ${filter.offset || 0}
  `

  const rows = await db.select(query, params)
  return mapToPhotoUpload(rows)
}
```

**性能基准**:
| 数据规模 | 无索引 | 有索引 | 目标 | 是否达标 |
|---------|--------|--------|------|---------|
| 100张照片 | ~50ms | ~5ms | < 100ms | ✅ |
| 1000张照片 | ~500ms | ~30ms | < 100ms | ✅ |
| 10000张照片 | ~5s | ~200ms | < 1s | ⚠️ 需优化 |

**10000+照片优化策略**(后期):
1. 虚拟滚动: 只渲染可见区域(react-window)
2. 缩略图预生成: 保存200x200缩略图路径(thumbnail_path字段)
3. 分页加载: 默认limit=50,滚动加载更多
4. JSON列提升: 将styleId/milestoneName从JSON提升为独立列

### Rationale: 为什么选择这种索引策略?

1. **查询热点分析**:
   - 80%用户按时间倒序浏览(最新生成的照片)
   - 60%用户按风格筛选(如"只看森系清新风")
   - 40%用户按里程碑筛选(如"百日照合集")
   - 20%用户按人物筛选(参考照片库)

2. **复合索引优先**:
   - `(is_ai_generated, uploaded_at DESC)`: 覆盖最常用查询路径
   - SQLite B-Tree索引可同时满足WHERE和ORDER BY

3. **JSON索引权衡**:
   - SQLite 3.38+支持表达式索引(json_extract)
   - 仅对高频筛选字段建索引(styleId/milestoneName)
   - 其他字段(similarityLevel等)暂不建索引(使用频率低)

### Alternatives: 全文搜索方案对比

| 方案 | 实现方式 | 优点 | 缺点 | 是否采用 |
|------|---------|------|------|----------|
| **B-Tree索引(当前)** | SQLite原生 | 快速、稳定、无额外依赖 | 不支持模糊搜索 | ✅ 采用 |
| **FTS5全文搜索** | SQLite FTS5扩展 | 支持中文分词、模糊搜索 | 索引体积大2-3倍 | ❌ 暂不需要 |
| **客户端内存过滤** | JavaScript Array.filter | 灵活、无SQL限制 | 大数据集性能差 | ❌ 不可扩展 |
| **ElasticSearch** | 外部搜索引擎 | 企业级搜索 | Tauri无法集成、过度设计 | ❌ 不适用 |

**决策**: 当前需求只需精确匹配(风格ID/里程碑名),不需要全文搜索。如后期需要搜索"宝宝笑脸照片",再考虑FTS5。

---

## 5. 模式状态管理

### Decision: Zustand全局状态 + 多照片数组扩展

**状态扩展设计**:
```typescript
// 扩展现有 AppStore (src/lib/store.ts)
interface ExtendedAppStore extends AppStore {
  // 新增: 生成模式
  generationMode: 'single' | 'multi'
  setGenerationMode: (mode: 'single' | 'multi') => void

  // 扩展: 已上传照片(支持多张)
  uploadedPhotos: PhotoUpload[]  // 原有字段,长度1(单人) or 2-4(多人)
  setUploadedPhotos: (photos: PhotoUpload[]) => void
  addPhoto: (photo: PhotoUpload) => void  // 支持逐张添加
  removePhoto: (photoId: string) => void
  clearPhotos: () => void  // 新增: 清空所有照片

  // 新增: 照片验证状态
  photoValidationResults: Map<string, FaceValidationResult>
  setPhotoValidation: (photoId: string, result: FaceValidationResult) => void

  // 新增: 模式切换逻辑
  switchMode: (newMode: 'single' | 'multi') => void  // 切换模式时自动清空照片

  // 新增: 风格过滤缓存
  filteredStyleIds: string[]  // 根据当前模式过滤后的风格ID列表
  updateFilteredStyles: () => void  // 重新计算可用风格
}

// 人脸验证结果类型
interface FaceValidationResult {
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
}
```

**状态机流程**:
```
[初始状态]
  ↓
[选择模式: single/multi]
  ↓ (触发 switchMode)
  ├→ 清空 uploadedPhotos
  ├→ 清空 photoValidationResults
  └→ 调用 updateFilteredStyles() 过滤风格
  ↓
[上传照片]
  ↓ (每张照片触发 addPhoto)
  ├→ 调用 validateSinglePersonPhoto() 验证
  ├→ 存储验证结果到 photoValidationResults
  └→ 如果验证失败,阻止添加
  ↓
[检查数量限制]
  ├→ single模式: uploadedPhotos.length === 1
  └→ multi模式: 2 <= uploadedPhotos.length <= 4
  ↓
[进入风格选择]
  ├→ 使用 filteredStyleIds 渲染风格列表
  └→ 用户选择风格后进入生成流程
```

**Zustand实现示例**:
```typescript
// src/lib/store.ts 扩展
export const useAppStore = create<ExtendedAppStore>((set, get) => ({
  // 现有状态...
  uploadedPhotos: [],
  selectedStyleIds: [],

  // 新增状态
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

    // 2. 人脸检测验证(仅多人模式)
    if (generationMode === 'multi') {
      const validation = await validateSinglePersonPhoto(photo.filePath)

      // 存储验证结果
      get().setPhotoValidation(photo.id, validation)

      // 如果验证失败,抛出错误
      if (!validation.isValid) {
        throw new Error(validation.error || '照片验证失败')
      }

      // 更新数据库中的人脸检测字段
      photo.faceCount = validation.faceCount
      photo.faceConfidence = validation.confidence
    }

    // 3. 添加到状态
    set((state) => ({
      uploadedPhotos: [...state.uploadedPhotos, photo]
    }))
  },

  // 更新可用风格列表
  updateFilteredStyles: async () => {
    const { generationMode } = get()
    const allStyles = await findAllStyles()

    // 根据模式过滤风格
    const filtered = allStyles
      .filter(style => {
        // 假设风格metadata中有 supportedModes 字段
        // 如果没有,默认所有风格支持单人模式
        const supportedModes = style.metadata?.supportedModes || ['single']
        return supportedModes.includes(generationMode)
      })
      .map(style => style.id)

    set({ filteredStyleIds: filtered })
  }
}))
```

### Rationale: 为什么选择Zustand全局状态?

1. **现有技术栈**: 项目已使用Zustand管理状态(src/lib/store.ts),保持一致性
2. **跨组件通信**: 模式选择(Page A) → 照片上传(Page B) → 风格选择(Page C),需共享状态
3. **状态持久化**: Zustand支持middleware(如persist),可保存到localStorage实现断点续传
4. **性能优势**: 只订阅需要的状态切片,避免不必要的重渲染
5. **类型安全**: 完全TypeScript支持,编译期检查状态结构

### Alternatives: Context API vs Zustand

| 方案 | 状态管理 | 性能 | 持久化 | TypeScript | 是否采用 |
|------|---------|------|--------|-----------|----------|
| **Zustand(当前)** | 全局store | ✅ 优秀(按需订阅) | ✅ 内置middleware | ✅ 完美 | ✅ 采用 |
| **React Context** | 嵌套Provider | ⚠️ 中等(全量渲染) | ❌ 需手动实现 | ⚠️ 类型复杂 | ❌ 性能差 |
| **Redux Toolkit** | 全局store | ✅ 优秀 | ✅ 支持 | ✅ 完美 | ❌ 过度设计 |
| **Jotai/Recoil** | 原子状态 | ✅ 极佳 | ✅ 支持 | ✅ 完美 | ❌ 学习成本 |

**决策**: 继续使用Zustand,扩展现有store,无需引入新依赖。

---

## 风险评估与缓解措施

### 风险1: Seedream API多参考图支持未验证

**风险描述**: Seedream 4.0官方文档未明确说明`image_base64`是否支持数组格式
**影响等级**: 🔴 高 - 如果不支持,需更换AI服务或使用图像融合预处理
**缓解措施**:
1. **Phase 0阶段**: 编写测试脚本调用API验证(传递2张base64数组)
2. **备用方案A**: 如果API不支持数组,使用图像拼接工具(ImageMagick/Canvas)将多张照片合成为单张参考图
3. **备用方案B**: 改用其他支持多参考图的AI服务(如Stable Diffusion + ControlNet)
4. **验证时间**: 2025-10-16前完成API测试

### 风险2: 人脸检测误报率

**风险描述**: face-api.js可能将背景人像/雕塑/海报识别为人脸,导致单人照被误判为多人照
**影响等级**: 🟡 中 - 影响用户体验,但不阻塞功能
**缓解措施**:
1. 提高`scoreThreshold`到0.6(默认0.5)
2. 添加`minFaceSize`参数过滤远景背景人脸
3. 人脸区域面积占比检测(主人脸面积应>图片面积5%)
4. 提供手动覆盖选项:"我确认这是单人照,继续"

### 风险3: JSON查询性能问题

**风险描述**: SQLite的`json_extract()`函数在10000+照片规模下性能下降
**影响等级**: 🟢 低 - 短期用户不会生成大量照片
**缓解措施**:
1. **短期**: 使用JSON索引(SQLite 3.38+支持)
2. **中期**: 监控查询耗时,如超过500ms触发告警
3. **长期**: 将styleId/milestoneName从JSON提升为独立列(数据库迁移)

### 风险4: 状态管理复杂度增加

**风险描述**: 模式切换、多照片验证、风格过滤等逻辑耦合在Zustand中,可能难以测试
**影响等级**: 🟡 中 - 影响代码可维护性
**缓解措施**:
1. 提取业务逻辑到独立函数(如`validatePhotos()` / `filterStylesByMode()`)
2. 使用React Testing Library编写单元测试
3. 状态更新使用不可变模式(Immer中间件)

---

## 实施优先级建议

### P0 - 必须完成(阻塞后续开发)
1. ✅ **验证Seedream API多参考图支持** (2025-10-16前)
2. ✅ **确定人脸检测阈值参数** (本地测试50张照片样本)
3. ✅ **数据库Schema迁移脚本** (添加is_ai_generated/face_count字段)

### P1 - 核心功能(Phase 1)
4. 扩展Zustand状态管理(generationMode/photoValidationResults)
5. 实现人脸检测验证逻辑(validateSinglePersonPhoto函数)
6. 修改Tauri后端(seedream_generate支持多图数组)

### P2 - 优化与筛选(Phase 2)
7. 实现相册筛选查询(风格/里程碑/日期组合)
8. 创建JSON索引(styleId/milestoneName)
9. 前端UI - 模式选择界面

### P3 - 体验优化(Phase 3)
10. 照片数量实时校验(单人1张/多人2-4张)
11. 模式切换确认弹窗(防止误操作丢失照片)
12. 性能监控埋点(查询耗时/人脸检测耗时)

---

## 技术债务与后期优化

### 技术债务1: JSON存储的灵活性与性能权衡
- **当前方案**: ai_metadata存储为JSON TEXT
- **优化时机**: 当相册照片数量>5000张且查询耗时>500ms时
- **优化方案**: 迁移styleId/milestoneName为独立列,保留JSON存储其他元数据

### 技术债务2: 人脸检测模型体积
- **当前方案**: face-api.js模型文件~6MB(TinyFaceDetector + Landmarks)
- **优化时机**: 应用安装包体积超过100MB时
- **优化方案**: 按需加载模型(仅多人模式时下载)

### 技术债务3: 缩略图生成
- **当前方案**: 直接展示原图(可能几MB),影响相册加载速度
- **优化时机**: 相册加载时间>3秒时
- **优化方案**: 使用Canvas/Sharp生成200x200缩略图,存储到thumbnail_path字段

---

## 总结与下一步行动

### 技术决策总结

| 决策点 | 选择方案 | 关键理由 |
|-------|---------|---------|
| 多人照片API | Seedream多图数组 | 成本低、兼容现有架构 |
| 人脸检测 | 客户端face-api.js | 隐私优先、实时反馈 |
| 照片分离 | 单表+is_ai_generated标识 | 迁移简单、查询高效 |
| 相册筛选 | 复合索引+JSON查询 | 覆盖80%高频查询场景 |
| 状态管理 | Zustand扩展 | 保持技术栈一致性 |

### Phase 1 开发检查清单

- [ ] Seedream API多图支持验证(编写测试脚本)
- [ ] 数据库迁移脚本(ALTER TABLE添加新字段)
- [ ] 人脸检测函数实现(validateSinglePersonPhoto)
- [ ] Zustand状态扩展(generationMode/photoValidationResults)
- [ ] Tauri后端修改(seedream_generate支持数组)
- [ ] 单元测试覆盖(人脸检测/模式切换/照片验证)

### 需求澄清问题(待产品确认)

1. **多人照片排序**: API传递多张照片时,顺序是否影响生成结果?(如:爸爸-妈妈-宝宝 vs 宝宝-爸爸-妈妈)
2. **风格元数据**: 现有6个风格是否都支持多人模式?需要新增`supportedModes`字段吗?
3. **人脸检测容错**: 如果用户坚持上传多人照,是否提供"强制继续"选项?
4. **照片数量下限**: 多人模式是否严格要求≥2张?还是1张也允许(自动降级为单人模式)?

---

**研究完成日期**: 2025-10-15
**下一阶段**: 等待产品确认上述4个问题后,进入Phase 1开发(specs/003-2/plan.md)
**预计开发周期**: 5个工作日(假设API验证通过)
