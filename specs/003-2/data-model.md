# 数据模型设计

**Feature**: 多人照片生成模式选择 (003-2)
**设计日期**: 2025-10-15
**设计者**: 数据库优化专家
**状态**: 待审核

---

## 1. Schema变更总览

### 1.1 修改现有表

#### 1.1.1 library_photos 表扩展

**目标**: 支持AI生成照片标识、人脸检测结果存储、照片分离管理

```sql
-- 已执行的迁移(database.ts第40-51行已处理)
ALTER TABLE library_photos
ADD COLUMN is_ai_generated INTEGER NOT NULL DEFAULT 0
CHECK (is_ai_generated IN (0, 1));

ALTER TABLE library_photos
ADD COLUMN ai_metadata TEXT;

-- 新增迁移(需要在database.ts中添加)
ALTER TABLE library_photos
ADD COLUMN face_count INTEGER DEFAULT 0;

ALTER TABLE library_photos
ADD COLUMN face_confidence REAL;

ALTER TABLE library_photos
ADD COLUMN quality_score REAL;
```

**字段说明**:

| 字段 | 类型 | 约束 | 说明 | 用途 |
|------|------|------|------|------|
| `is_ai_generated` | INTEGER | NOT NULL, 0或1 | AI生成标识(0=用户上传, 1=AI生成) | 照片分离查询的核心字段 |
| `ai_metadata` | TEXT | NULL | AI生成元数据(JSON格式) | 存储风格ID、任务ID、里程碑等信息 |
| `face_count` | INTEGER | DEFAULT 0 | 人脸数量 | 多人模式验证依据 |
| `face_confidence` | REAL | NULL | 人脸检测置信度(0.0-1.0) | 照片质量评分 |
| `quality_score` | REAL | NULL | 综合质量评分(0.0-1.0) | 未来扩展:亮度/清晰度评分 |

**ai_metadata JSON结构**:

```typescript
interface AIPhotoMetadata {
  taskId: string              // 生成任务ID (关联generation_tasks.id)
  styleId: string             // 风格ID (关联style_templates.id)
  styleName: string           // 风格名称 (冗余存储,避免JOIN查询)
  milestoneName?: string      // 里程碑名称 (如"百日照"、"周岁照")
  similarityLevel: string     // 相似度级别 (high/medium/low)
  sourcePhotoIds: string[]    // 源照片ID数组 (用于多人生成溯源)
  sequenceNumber: number      // 同风格内的序号 (1-4)
  generatedAt: number         // 生成时间戳 (Unix timestamp)
  generationMode?: string     // 生成模式 (single/multi) - 新增
}
```

**示例数据**:
```json
{
  "taskId": "task_abc123",
  "styleId": "style_warm_home",
  "styleName": "居家暖光温馨风",
  "milestoneName": "百日照",
  "similarityLevel": "high",
  "sourcePhotoIds": ["photo_baby", "photo_dad", "photo_mom"],
  "sequenceNumber": 1,
  "generatedAt": 1729008000000,
  "generationMode": "multi"
}
```

---

#### 1.1.2 generation_tasks 表扩展

**目标**: 记录生成模式(单人/多人),支持多照片ID数组

```sql
-- 新增字段
ALTER TABLE generation_tasks
ADD COLUMN mode TEXT NOT NULL DEFAULT 'single'
CHECK (mode IN ('single', 'multi'));

-- photo_ids字段原本就是TEXT类型,存储JSON数组,无需修改
-- 示例: '["photo_id_1"]' (单人) 或 '["photo_id_1","photo_id_2","photo_id_3"]' (多人)
```

**字段说明**:

| 字段 | 类型 | 约束 | 说明 | 用途 |
|------|------|------|------|------|
| `mode` | TEXT | NOT NULL, single或multi | 生成模式 | 区分单人/多人生成任务 |
| `photo_ids` | TEXT | NOT NULL | 照片ID数组(JSON) | 单人模式长度=1, 多人模式长度=2-4 |

**迁移兼容性**:
- 现有数据自动默认为`mode='single'`
- 现有`photo_ids`字段保持不变(已是JSON数组格式)

---

#### 1.1.3 style_templates 表扩展

**目标**: 标记风格支持的生成模式(单人/多人/通用)

```sql
-- 新增字段
ALTER TABLE style_templates
ADD COLUMN supported_modes TEXT NOT NULL DEFAULT '["single"]';

ALTER TABLE style_templates
ADD COLUMN min_photos INTEGER NOT NULL DEFAULT 1
CHECK (min_photos >= 1 AND min_photos <= 4);

ALTER TABLE style_templates
ADD COLUMN max_photos INTEGER NOT NULL DEFAULT 1
CHECK (max_photos >= 1 AND max_photos <= 4);

ALTER TABLE style_templates
ADD COLUMN is_multi_person INTEGER NOT NULL DEFAULT 0
CHECK (is_multi_person IN (0, 1));
```

**字段说明**:

| 字段 | 类型 | 约束 | 说明 | 用途 |
|------|------|------|------|------|
| `supported_modes` | TEXT | NOT NULL | 支持的模式JSON数组 | 风格过滤依据,如`["single"]`或`["single","multi"]` |
| `min_photos` | INTEGER | 1-4 | 最少照片数 | 验证照片数量下限 |
| `max_photos` | INTEGER | 1-4 | 最多照片数 | 验证照片数量上限 |
| `is_multi_person` | INTEGER | 0或1 | 是否为多人风格 | 快速过滤字段(冗余,但提升查询性能) |

**现有风格配置迁移**:

```sql
-- 默认所有现有风格仅支持单人模式
-- 后期根据产品需求,手动更新特定风格为多人支持

UPDATE style_templates SET
  supported_modes = '["single"]',
  min_photos = 1,
  max_photos = 1,
  is_multi_person = 0
WHERE id IN (
  'style_warm_home',
  'style_fresh_nature',
  'style_cartoon',
  'style_vintage',
  'style_dreamy',
  'style_festival'
);

-- 示例:未来添加多人风格
-- INSERT INTO style_templates (id, name, ..., supported_modes, min_photos, max_photos, is_multi_person)
-- VALUES ('style_family_warmth', '温馨亲子互动风', ..., '["multi"]', 2, 4, 1);
```

---

### 1.2 新增索引

#### 1.2.1 照片分离查询索引

```sql
-- 核心索引:照片类型+上传时间(复合索引)
-- 用途:快速查询参考照片库(is_ai_generated=0)或生成照片相册(is_ai_generated=1)
CREATE INDEX IF NOT EXISTS idx_library_photos_ai_type_time
ON library_photos(is_ai_generated, uploaded_at DESC);

-- 人脸数量索引(用于多人模式照片筛选)
CREATE INDEX IF NOT EXISTS idx_library_photos_face_count
ON library_photos(face_count);
```

**查询优化效果**:

| 查询场景 | SQL | 使用索引 | 预期性能 |
|---------|-----|---------|---------|
| 参考照片库 | `WHERE is_ai_generated = 0 ORDER BY uploaded_at DESC` | `idx_library_photos_ai_type_time` | < 10ms (1000张照片) |
| 生成照片相册 | `WHERE is_ai_generated = 1 ORDER BY uploaded_at DESC` | `idx_library_photos_ai_type_time` | < 10ms (1000张照片) |
| 单人照筛选 | `WHERE face_count = 1` | `idx_library_photos_face_count` | < 5ms (1000张照片) |

---

#### 1.2.2 JSON字段索引(SQLite 3.38+)

```sql
-- AI照片风格筛选索引
-- 用途:相册按风格筛选(如"只看森系清新风")
CREATE INDEX IF NOT EXISTS idx_library_photos_style
ON library_photos(json_extract(ai_metadata, '$.styleId'));

-- AI照片里程碑筛选索引
-- 用途:相册按里程碑筛选(如"只看百日照")
CREATE INDEX IF NOT EXISTS idx_library_photos_milestone
ON library_photos(json_extract(ai_metadata, '$.milestoneName'));

-- AI照片任务ID索引
-- 用途:查询某次生成任务产生的所有照片
CREATE INDEX IF NOT EXISTS idx_library_photos_task
ON library_photos(json_extract(ai_metadata, '$.taskId'));
```

**兼容性说明**:
- 需要SQLite >= 3.38.0 (Tauri内置SQLite版本已满足)
- 表达式索引在查询时必须使用相同表达式才能命中

**查询示例**:
```sql
-- ✅ 正确:使用json_extract表达式,命中索引
SELECT * FROM library_photos
WHERE json_extract(ai_metadata, '$.styleId') = 'style_warm_home';

-- ❌ 错误:使用JSON运算符,不会命中索引
SELECT * FROM library_photos
WHERE ai_metadata->>'styleId' = 'style_warm_home';
```

---

#### 1.2.3 生成任务索引

```sql
-- 任务模式索引(用于统计单人/多人任务数量)
CREATE INDEX IF NOT EXISTS idx_generation_tasks_mode
ON generation_tasks(mode);

-- 组合索引:模式+状态+创建时间(支持按模式查询任务列表)
CREATE INDEX IF NOT EXISTS idx_generation_tasks_mode_status_time
ON generation_tasks(mode, status, created_at DESC);
```

---

### 1.3 不新增的表

**决策**: 不创建独立的`reference_photos`或`generated_photos`表

**理由**:
1. **单表设计优势**:
   - 所有照片共享字段定义(file_path/width/height/uploaded_at等)
   - 避免字段冗余和表同步问题
   - 迁移成本低(只需添加标识字段)

2. **查询性能**:
   - 通过`is_ai_generated`字段 + 索引实现高效分离查询
   - 避免UNION ALL查询(双表合并查询)
   - SQLite在单表上的B-Tree索引性能优于多表JOIN

3. **维护简化**:
   - 统一的CRUD操作接口
   - 无需担心表结构不同步
   - 迁移脚本简单(ALTER TABLE即可)

---

## 2. 实体定义与关系

### 2.1 核心实体

#### GenerationMode (生成模式)

**存储位置**: `generation_tasks.mode` 字段 (枚举值)

**枚举定义**:
```typescript
type GenerationMode = 'single' | 'multi'

interface GenerationModeConfig {
  mode: GenerationMode
  displayName: string
  description: string
  minPhotos: number
  maxPhotos: number
  requiresFaceDetection: boolean
}

// 配置常量(前端使用)
const GENERATION_MODES: Record<GenerationMode, GenerationModeConfig> = {
  single: {
    mode: 'single',
    displayName: '单人照片',
    description: '上传1张照片,生成多种风格的个人写真',
    minPhotos: 1,
    maxPhotos: 1,
    requiresFaceDetection: false  // 单人模式不强制检测
  },
  multi: {
    mode: 'multi',
    displayName: '多人照片',
    description: '上传2-4张单人照(如宝宝、爸爸、妈妈),生成温馨全家福',
    minPhotos: 2,
    maxPhotos: 4,
    requiresFaceDetection: true  // 多人模式必须检测
  }
}
```

**业务规则**:
- 单人模式:必须且仅上传1张照片
- 多人模式:上传2-4张照片,每张照片必须通过人脸检测(face_count=1)
- 模式切换时清空已选照片,防止混合使用

---

#### PhotoSelection (照片选择集合)

**存储位置**: 前端Zustand状态 + `generation_tasks.photo_ids`字段

**类型定义**:
```typescript
interface PhotoSelection {
  photos: PhotoUpload[]           // 已选照片列表
  validationResults: Map<string, FaceValidationResult>  // 验证结果映射
  mode: GenerationMode            // 当前模式
  isValid: boolean                // 整体是否有效(数量+验证)
}

interface FaceValidationResult {
  photoId: string
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
  timestamp: number               // 验证时间戳
}
```

**验证逻辑**:
```typescript
function validatePhotoSelection(selection: PhotoSelection): boolean {
  const { photos, mode } = selection

  // 1. 验证数量
  const config = GENERATION_MODES[mode]
  if (photos.length < config.minPhotos || photos.length > config.maxPhotos) {
    return false
  }

  // 2. 验证人脸检测(仅多人模式)
  if (config.requiresFaceDetection) {
    for (const photo of photos) {
      const result = selection.validationResults.get(photo.id)
      if (!result || !result.isValid || result.faceCount !== 1) {
        return false
      }
    }
  }

  return true
}
```

---

#### ReferencePhotoLibrary (参考照片库 - 查询视图)

**实现方式**: 应用层查询函数 (非数据库视图)

**查询逻辑**:
```typescript
/**
 * 查询参考照片库(用户上传的原始照片)
 * 用于生成流程中的照片选择步骤
 */
export async function findReferencePhotos(
  personId?: string
): Promise<PhotoUpload[]> {
  const db = await getDb()

  let query = `
    SELECT * FROM library_photos
    WHERE is_ai_generated = 0
  `
  const params: any[] = []

  // 可选:按人物筛选
  if (personId) {
    query += ` AND person_id = ?`
    params.push(personId)
  }

  query += ` ORDER BY uploaded_at DESC`

  const rows = await db.select(query, params)
  return mapToPhotoUpload(rows)
}
```

**使用索引**: `idx_library_photos_ai_type_time` (is_ai_generated=0部分)

**预期性能**:
- 100张照片: < 5ms
- 1000张照片: < 10ms
- 10000张照片: < 50ms

---

#### GeneratedPhotoAlbum (生成照片相册 - 查询视图)

**实现方式**: 应用层筛选查询函数

**筛选器定义**:
```typescript
interface AlbumFilter {
  photoType?: 'all' | 'reference' | 'ai'  // 照片类型
  styleId?: string                         // 风格ID
  milestoneName?: string                   // 里程碑名称
  dateRange?: {
    start: number  // Unix timestamp
    end: number
  }
  personId?: string                        // 人物ID
  generationMode?: 'single' | 'multi'      // 生成模式(新增)
  limit?: number                           // 分页大小(默认50)
  offset?: number                          // 分页偏移(默认0)
}
```

**查询实现**:
```typescript
export async function queryAlbumPhotos(
  filter: AlbumFilter
): Promise<{ photos: PhotoUpload[], total: number }> {
  const db = await getDb()
  const conditions: string[] = []
  const params: any[] = []

  // 1. 基础条件:照片类型
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
  const dataQuery = `
    SELECT * FROM library_photos
    ${whereClause}
    ORDER BY uploaded_at DESC
    LIMIT ${filter.limit || 50} OFFSET ${filter.offset || 0}
  `
  const rows = await db.select(dataQuery, params)
  const photos = mapToPhotoUpload(rows)

  return { photos, total }
}
```

**使用索引**:
- 类型+时间: `idx_library_photos_ai_type_time`
- 风格筛选: `idx_library_photos_style`
- 里程碑筛选: `idx_library_photos_milestone`

**性能基准**:

| 数据规模 | 查询条件 | 预期耗时 | 目标 | 达标 |
|---------|---------|---------|------|------|
| 100张 | 类型筛选 | < 5ms | < 100ms | ✅ |
| 1000张 | 类型+风格 | < 30ms | < 100ms | ✅ |
| 10000张 | 类型+风格+日期 | < 200ms | < 1s | ✅ |

---

#### PhotoFilter (照片筛选器 - 前端状态)

**存储位置**: 前端Zustand状态 (不持久化到数据库)

**类型定义**:
```typescript
interface PhotoFilterState {
  activeFilters: AlbumFilter       // 当前激活的筛选条件
  availableStyles: StyleTemplate[] // 可选风格列表
  availableMilestones: string[]    // 可选里程碑列表
  datePresets: DatePreset[]        // 预设日期范围
  isFilterActive: boolean          // 是否有激活的筛选
}

type DatePreset =
  | 'today'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'custom'

// Zustand Store
interface AlbumStore {
  filter: PhotoFilterState
  setFilter: (filter: Partial<AlbumFilter>) => void
  clearFilter: () => void
  applyFilter: () => Promise<void>
}
```

**不持久化理由**:
1. 筛选条件是临时UI状态,每次进入相册页面重新选择
2. 避免数据库存储用户偏好的复杂性
3. 如需保存常用筛选,可后期添加"保存筛选器"功能

---

### 2.2 实体关系图(文字描述)

```
[persons] 1:N [library_photos]
  └─ 一个人物可以有多张照片(person_id外键)

[library_photos] 标识分类
  ├─ is_ai_generated = 0 → ReferencePhotoLibrary (参考照片库视图)
  └─ is_ai_generated = 1 → GeneratedPhotoAlbum (生成照片相册视图)

[generation_tasks] 1:N [library_photos]
  └─ 一个生成任务产生多张AI照片
      (通过 ai_metadata.taskId 关联,非外键)

[generation_tasks] N:M [library_photos]
  └─ 一个任务使用多张参考照片(photo_ids JSON数组)
  └─ 一张参考照片可被多个任务使用(sourcePhotoIds数组)

[style_templates] 1:N [library_photos]
  └─ 一个风格可生成多张照片
      (通过 ai_metadata.styleId 关联,非外键)

[generation_tasks].mode → GenerationMode
  └─ 任务的生成模式(single/multi)决定:
      ├─ photo_ids数组长度(1 或 2-4)
      ├─ 可选风格列表(style_templates.supported_modes筛选)
      └─ 是否需要人脸检测验证

[PhotoSelection] (前端状态)
  ├─ 关联 GenerationMode
  ├─ 包含 PhotoUpload[]
  └─ 包含 FaceValidationResult[]

[AlbumFilter] (前端状态)
  └─ 驱动 GeneratedPhotoAlbum 查询逻辑
```

---

## 3. 迁移策略

### 3.1 现有数据兼容性分析

#### 场景1: 现有用户上传的照片

**现状**:
- `library_photos`表中已有照片,字段`is_ai_generated`不存在

**迁移方案**:
```sql
-- Step 1: 添加字段(带默认值)
ALTER TABLE library_photos
ADD COLUMN is_ai_generated INTEGER NOT NULL DEFAULT 0;

-- Step 2: 确认所有现有照片都是参考照片(非AI生成)
-- 默认值0已满足需求,无需UPDATE

-- Step 3: 添加其他字段
ALTER TABLE library_photos ADD COLUMN ai_metadata TEXT;
ALTER TABLE library_photos ADD COLUMN face_count INTEGER DEFAULT 0;
ALTER TABLE library_photos ADD COLUMN face_confidence REAL;
ALTER TABLE library_photos ADD COLUMN quality_score REAL;
```

**结果**: 现有照片自动归类为"参考照片库"

---

#### 场景2: 现有生成任务

**现状**:
- `generation_tasks`表中已有任务记录,字段`mode`不存在

**迁移方案**:
```sql
-- 添加字段(默认值single)
ALTER TABLE generation_tasks
ADD COLUMN mode TEXT NOT NULL DEFAULT 'single'
CHECK (mode IN ('single', 'multi'));

-- 现有任务自动标记为单人模式(与现有行为一致)
```

**结果**: 现有任务保持功能不变,仅增加模式标识

---

#### 场景3: 现有风格模板

**现状**:
- 6个预设风格(居家暖光、森系清新等),不支持多人模式

**迁移方案**:
```sql
-- 添加字段
ALTER TABLE style_templates
ADD COLUMN supported_modes TEXT NOT NULL DEFAULT '["single"]';

ALTER TABLE style_templates
ADD COLUMN min_photos INTEGER NOT NULL DEFAULT 1;

ALTER TABLE style_templates
ADD COLUMN max_photos INTEGER NOT NULL DEFAULT 1;

ALTER TABLE style_templates
ADD COLUMN is_multi_person INTEGER NOT NULL DEFAULT 0;

-- 现有风格自动配置为单人模式(默认值已满足)
```

**未来扩展**: 产品决定支持多人后,手动UPDATE特定风格:
```sql
-- 示例:将"温馨亲子互动风"设置为多人风格
UPDATE style_templates SET
  supported_modes = '["multi"]',
  min_photos = 2,
  max_photos = 4,
  is_multi_person = 1
WHERE id = 'style_family_warmth';
```

---

### 3.2 迁移脚本

#### 完整迁移SQL

```sql
-- ============================================================
-- HomeMemo 数据库迁移脚本 v2.0
-- 功能: 支持多人照片生成模式选择 (Feature 003-2)
-- 日期: 2025-10-15
-- ============================================================

-- 1. library_photos 表扩展
-- (is_ai_generated 和 ai_metadata 已在 database.ts 中处理,此处为文档记录)

ALTER TABLE library_photos
ADD COLUMN face_count INTEGER DEFAULT 0;

ALTER TABLE library_photos
ADD COLUMN face_confidence REAL;

ALTER TABLE library_photos
ADD COLUMN quality_score REAL;

-- 2. generation_tasks 表扩展
ALTER TABLE generation_tasks
ADD COLUMN mode TEXT NOT NULL DEFAULT 'single'
CHECK (mode IN ('single', 'multi'));

-- 3. style_templates 表扩展
ALTER TABLE style_templates
ADD COLUMN supported_modes TEXT NOT NULL DEFAULT '["single"]';

ALTER TABLE style_templates
ADD COLUMN min_photos INTEGER NOT NULL DEFAULT 1
CHECK (min_photos >= 1 AND min_photos <= 4);

ALTER TABLE style_templates
ADD COLUMN max_photos INTEGER NOT NULL DEFAULT 1
CHECK (max_photos >= 1 AND max_photos <= 4);

ALTER TABLE style_templates
ADD COLUMN is_multi_person INTEGER NOT NULL DEFAULT 0
CHECK (is_multi_person IN (0, 1));

-- 4. 创建索引
-- 4.1 照片分离查询索引
CREATE INDEX IF NOT EXISTS idx_library_photos_ai_type_time
ON library_photos(is_ai_generated, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_library_photos_face_count
ON library_photos(face_count);

-- 4.2 JSON字段索引(SQLite 3.38+)
CREATE INDEX IF NOT EXISTS idx_library_photos_style
ON library_photos(json_extract(ai_metadata, '$.styleId'));

CREATE INDEX IF NOT EXISTS idx_library_photos_milestone
ON library_photos(json_extract(ai_metadata, '$.milestoneName'));

CREATE INDEX IF NOT EXISTS idx_library_photos_task
ON library_photos(json_extract(ai_metadata, '$.taskId'));

-- 4.3 生成任务索引
CREATE INDEX IF NOT EXISTS idx_generation_tasks_mode
ON generation_tasks(mode);

CREATE INDEX IF NOT EXISTS idx_generation_tasks_mode_status_time
ON generation_tasks(mode, status, created_at DESC);

-- 5. 数据验证(可选,用于测试)
-- 检查字段是否成功添加
SELECT
  COUNT(*) as total_photos,
  SUM(CASE WHEN is_ai_generated = 0 THEN 1 ELSE 0 END) as reference_photos,
  SUM(CASE WHEN is_ai_generated = 1 THEN 1 ELSE 0 END) as ai_generated_photos
FROM library_photos;

SELECT
  mode,
  COUNT(*) as task_count
FROM generation_tasks
GROUP BY mode;

-- ============================================================
-- 迁移完成
-- ============================================================
```

---

#### TypeScript迁移函数(集成到database.ts)

```typescript
/**
 * 数据库迁移版本2:多人照片生成支持
 * 在 createTables() 函数中调用
 */
async function migrateToV2(db: Database) {
  console.log('[Migration] 开始迁移到v2.0 - 多人照片生成支持')

  try {
    // 1. library_photos 扩展(is_ai_generated/ai_metadata已在主函数处理)
    await db.execute('ALTER TABLE library_photos ADD COLUMN face_count INTEGER DEFAULT 0')
    console.log('[Migration] ✓ library_photos.face_count')
  } catch (e) {
    // 字段已存在,忽略
  }

  try {
    await db.execute('ALTER TABLE library_photos ADD COLUMN face_confidence REAL')
    console.log('[Migration] ✓ library_photos.face_confidence')
  } catch (e) {}

  try {
    await db.execute('ALTER TABLE library_photos ADD COLUMN quality_score REAL')
    console.log('[Migration] ✓ library_photos.quality_score')
  } catch (e) {}

  // 2. generation_tasks 扩展
  try {
    await db.execute(`
      ALTER TABLE generation_tasks
      ADD COLUMN mode TEXT NOT NULL DEFAULT 'single'
      CHECK (mode IN ('single', 'multi'))
    `)
    console.log('[Migration] ✓ generation_tasks.mode')
  } catch (e) {}

  // 3. style_templates 扩展
  try {
    await db.execute(`ALTER TABLE style_templates ADD COLUMN supported_modes TEXT NOT NULL DEFAULT '["single"]'`)
    console.log('[Migration] ✓ style_templates.supported_modes')
  } catch (e) {}

  try {
    await db.execute(`ALTER TABLE style_templates ADD COLUMN min_photos INTEGER NOT NULL DEFAULT 1`)
    console.log('[Migration] ✓ style_templates.min_photos')
  } catch (e) {}

  try {
    await db.execute(`ALTER TABLE style_templates ADD COLUMN max_photos INTEGER NOT NULL DEFAULT 1`)
    console.log('[Migration] ✓ style_templates.max_photos')
  } catch (e) {}

  try {
    await db.execute(`ALTER TABLE style_templates ADD COLUMN is_multi_person INTEGER NOT NULL DEFAULT 0`)
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
```

---

### 3.3 回滚方案(可选)

**场景**: 如果多人功能上线后需要回滚

```sql
-- 警告:此操作会丢失多人相关数据!

-- 1. 删除多人生成的照片
DELETE FROM library_photos
WHERE json_extract(ai_metadata, '$.generationMode') = 'multi';

-- 2. 删除多人生成任务
DELETE FROM generation_tasks
WHERE mode = 'multi';

-- 3. 删除索引(可选)
DROP INDEX IF EXISTS idx_library_photos_ai_type_time;
DROP INDEX IF EXISTS idx_library_photos_face_count;
DROP INDEX IF EXISTS idx_library_photos_style;
DROP INDEX IF EXISTS idx_library_photos_milestone;
DROP INDEX IF EXISTS idx_library_photos_task;
DROP INDEX IF EXISTS idx_generation_tasks_mode;
DROP INDEX IF EXISTS idx_generation_tasks_mode_status_time;

-- 4. 删除字段(SQLite不支持DROP COLUMN,需重建表)
-- 实际生产环境建议保留字段,仅停用功能
```

**推荐**: 不执行回滚,仅在前端隐藏多人模式入口

---

## 4. 查询优化与性能分析

### 4.1 高频查询SQL

#### Q1: 参考照片库查询(生成流程选择照片)

```sql
-- 用途: 用户在生成流程中选择参考照片
-- 频率: 每次生成任务1次
-- 预期数据量: 10-1000张

EXPLAIN QUERY PLAN
SELECT * FROM library_photos
WHERE is_ai_generated = 0
ORDER BY uploaded_at DESC
LIMIT 50;

-- 执行计划:
-- SEARCH library_photos USING INDEX idx_library_photos_ai_type_time (is_ai_generated=?)
-- 性能: O(log n) + 50行扫描 ≈ 5-10ms
```

**索引命中**: `idx_library_photos_ai_type_time`
**优化建议**: 无需优化,索引覆盖查询

---

#### Q2: 生成照片相册查询(按风格+日期筛选)

```sql
-- 用途: 相册页面按风格筛选
-- 频率: 用户操作筛选器时触发
-- 预期数据量: 100-10000张

EXPLAIN QUERY PLAN
SELECT * FROM library_photos
WHERE is_ai_generated = 1
  AND json_extract(ai_metadata, '$.styleId') = 'style_warm_home'
  AND uploaded_at BETWEEN 1728000000000 AND 1729000000000
ORDER BY uploaded_at DESC
LIMIT 50;

-- 执行计划:
-- SEARCH library_photos USING INDEX idx_library_photos_ai_type_time (is_ai_generated=?)
-- SEARCH library_photos USING INDEX idx_library_photos_style (json_extract(...))
-- 性能: O(log n) + 范围扫描 ≈ 20-50ms
```

**索引命中**:
- `idx_library_photos_ai_type_time` (类型+时间)
- `idx_library_photos_style` (风格JSON索引)

**优化建议**:
- 如果查询>100ms,考虑将styleId提升为独立列
- 使用虚拟滚动减少LIMIT数量

---

#### Q3: 单人照验证(多人模式上传时)

```sql
-- 用途: 验证照片是否为单人照
-- 频率: 用户上传照片时触发
-- 预期数据量: 1张(实时查询)

-- 客户端验证,无需数据库查询
-- 验证结果存储到 face_count 字段

UPDATE library_photos
SET face_count = 1,
    face_confidence = 0.85
WHERE id = 'photo_id_123';

-- 性能: O(1) 主键查询 ≈ 1ms
```

---

#### Q4: 任务照片溯源(查看某张生成照片的源照片)

```sql
-- 用途: 用户点击生成照片,查看使用了哪些原始照片
-- 频率: 偶尔触发
-- 预期数据量: 1-4张源照片

-- Step 1: 获取源照片ID数组
SELECT json_extract(ai_metadata, '$.sourcePhotoIds') as source_ids
FROM library_photos
WHERE id = 'generated_photo_id';

-- Step 2: 查询源照片详情
SELECT * FROM library_photos
WHERE id IN (
  SELECT value FROM json_each(
    (SELECT json_extract(ai_metadata, '$.sourcePhotoIds')
     FROM library_photos
     WHERE id = 'generated_photo_id')
  )
);

-- 性能: O(1) + O(k),k为源照片数量 ≈ 2-5ms
```

**优化**: 封装为TypeScript函数,避免复杂SQL

```typescript
export async function findSourcePhotos(generatedPhotoId: string): Promise<PhotoUpload[]> {
  const db = await getDb()

  // 1. 获取生成照片的元数据
  const photo = await findPhotoById(generatedPhotoId)
  if (!photo || !photo.aiMetadata) {
    return []
  }

  // 2. 解析源照片ID数组
  const metadata = JSON.parse(photo.aiMetadata) as AIPhotoMetadata
  const sourceIds = metadata.sourcePhotoIds

  // 3. 批量查询源照片
  const placeholders = sourceIds.map(() => '?').join(',')
  const query = `SELECT * FROM library_photos WHERE id IN (${placeholders})`
  const rows = await db.select(query, sourceIds)

  return mapToPhotoUpload(rows)
}
```

---

### 4.2 性能基准与监控

#### 查询性能目标

| 查询类型 | 数据规模 | 目标耗时 | 监控阈值 | 告警条件 |
|---------|---------|---------|---------|---------|
| 参考照片库 | 1000张 | < 10ms | 50ms | > 100ms |
| 相册筛选(单条件) | 1000张 | < 30ms | 100ms | > 200ms |
| 相册筛选(多条件) | 1000张 | < 50ms | 150ms | > 300ms |
| 任务照片溯源 | 4张 | < 5ms | 10ms | > 20ms |
| 人脸检测(客户端) | 1张 | < 2s | 5s | > 10s |

#### 监控埋点建议

```typescript
// 查询性能监控装饰器
function measureQuery(queryName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = performance.now()
      try {
        const result = await originalMethod.apply(this, args)
        const duration = performance.now() - start

        // 记录查询耗时
        console.log(`[Query] ${queryName}: ${duration.toFixed(2)}ms`)

        // 告警阈值检查
        if (duration > 200) {
          console.warn(`[Query] ${queryName} 超过阈值 200ms: ${duration.toFixed(2)}ms`)
        }

        return result
      } catch (error) {
        console.error(`[Query] ${queryName} 失败:`, error)
        throw error
      }
    }

    return descriptor
  }
}

// 使用示例
class PhotoService {
  @measureQuery('findReferencePhotos')
  async findReferencePhotos(): Promise<PhotoUpload[]> {
    // 实现...
  }

  @measureQuery('queryAlbumPhotos')
  async queryAlbumPhotos(filter: AlbumFilter): Promise<PhotoUpload[]> {
    // 实现...
  }
}
```

---

### 4.3 大数据量优化策略(>10000张)

#### 优化1: 虚拟滚动

```typescript
// 使用 react-window 实现虚拟列表
import { FixedSizeGrid } from 'react-window'

function AlbumGrid({ photos }: { photos: PhotoUpload[] }) {
  return (
    <FixedSizeGrid
      columnCount={4}
      columnWidth={200}
      height={600}
      rowCount={Math.ceil(photos.length / 4)}
      rowHeight={200}
      width={800}
    >
      {({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * 4 + columnIndex
        const photo = photos[index]
        return <PhotoCard photo={photo} style={style} />
      }}
    </FixedSizeGrid>
  )
}
```

**收益**: 渲染10000张照片,实际DOM节点< 50个

---

#### 优化2: 缩略图预生成

```sql
-- 添加缩略图字段
ALTER TABLE library_photos ADD COLUMN thumbnail_path TEXT;

-- 上传照片时自动生成200x200缩略图
-- 使用 sharp 或 Canvas API
```

```typescript
async function generateThumbnail(originalPath: string): Promise<string> {
  const sharp = (await import('sharp')).default
  const thumbnailDir = await join(await appDataDir(), 'thumbnails')
  const thumbnailPath = await join(thumbnailDir, `thumb_${Date.now()}.jpg`)

  await sharp(originalPath)
    .resize(200, 200, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath)

  return thumbnailPath
}
```

**收益**: 相册加载速度提升80%(200KB vs 5MB原图)

---

#### 优化3: JSON字段提升为列

```sql
-- 当查询>500ms时执行
ALTER TABLE library_photos ADD COLUMN style_id TEXT;
ALTER TABLE library_photos ADD COLUMN milestone_name TEXT;

-- 数据迁移
UPDATE library_photos
SET style_id = json_extract(ai_metadata, '$.styleId'),
    milestone_name = json_extract(ai_metadata, '$.milestoneName')
WHERE is_ai_generated = 1;

-- 创建索引
CREATE INDEX idx_library_photos_style_id ON library_photos(style_id);
CREATE INDEX idx_library_photos_milestone ON library_photos(milestone_name);

-- 查询改写
SELECT * FROM library_photos
WHERE is_ai_generated = 1
  AND style_id = 'style_warm_home'  -- 直接列查询,无需json_extract
ORDER BY uploaded_at DESC;
```

**收益**: 查询速度提升5-10倍

---

## 5. 安全与数据完整性

### 5.1 约束检查

#### CHECK约束

```sql
-- 确保照片类型标识有效
CHECK (is_ai_generated IN (0, 1))

-- 确保生成模式有效
CHECK (mode IN ('single', 'multi'))

-- 确保照片数量在合理范围
CHECK (min_photos >= 1 AND min_photos <= 4)
CHECK (max_photos >= 1 AND max_photos <= 4)

-- 确保人脸数量非负
CHECK (face_count >= 0)

-- 确保置信度在0-1范围
CHECK (face_confidence >= 0.0 AND face_confidence <= 1.0)
```

---

#### 应用层验证

```typescript
// 插入AI照片前的验证
export async function insertAIGeneratedPhoto(
  photo: Omit<PhotoUpload, 'id'>,
  metadata: AIPhotoMetadata
): Promise<PhotoUpload> {
  // 1. 验证必须标记为AI生成
  if (!photo.isAIGenerated) {
    throw new Error('AI生成的照片必须设置 isAIGenerated = true')
  }

  // 2. 验证元数据完整性
  if (!metadata.taskId || !metadata.styleId) {
    throw new Error('AI照片元数据缺少必填字段: taskId, styleId')
  }

  // 3. 验证源照片ID数组
  if (!metadata.sourcePhotoIds || metadata.sourcePhotoIds.length === 0) {
    throw new Error('AI照片必须关联至少1张源照片')
  }

  // 4. 验证生成模式与照片数量一致
  const mode = metadata.generationMode
  if (mode === 'single' && metadata.sourcePhotoIds.length !== 1) {
    throw new Error('单人模式必须且仅使用1张源照片')
  }
  if (mode === 'multi' && (metadata.sourcePhotoIds.length < 2 || metadata.sourcePhotoIds.length > 4)) {
    throw new Error('多人模式必须使用2-4张源照片')
  }

  // 5. 序列化元数据为JSON
  photo.aiMetadata = JSON.stringify(metadata)

  // 6. 插入数据库
  return await insertLibraryPhoto(photo)
}
```

---

### 5.2 数据清理策略

#### 场景1: 删除AI照片时清理孤立元数据

```typescript
export async function deleteAIPhoto(photoId: string): Promise<void> {
  const db = await getDb()

  // 1. 删除照片记录(CASCADE会自动删除generated_images)
  await db.execute('DELETE FROM library_photos WHERE id = ?', [photoId])

  // 2. 如果任务的所有照片都被删除,清理任务记录
  // (可选:保留任务历史,仅删除照片)
}
```

---

#### 场景2: 清理失败的生成任务

```sql
-- 定期清理7天前失败的任务(保留成功任务)
DELETE FROM generation_tasks
WHERE status = 'failed'
  AND updated_at < (strftime('%s', 'now') - 7 * 86400) * 1000;
```

---

### 5.3 隐私保护(符合Constitution原则)

#### 人脸检测数据

```typescript
// 人脸检测结果不上传,仅本地存储
interface FaceValidationResult {
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
  // 不存储: 人脸坐标/特征向量
}

// 数据库仅存储统计信息
// face_count: 人脸数量
// face_confidence: 置信度
// ❌ 不存储: 人脸边界框/关键点/特征向量
```

---

#### AI元数据脱敏

```typescript
// ai_metadata 中仅存储业务关联信息
interface AIPhotoMetadata {
  taskId: string              // ✅ 业务ID
  styleId: string             // ✅ 业务ID
  sourcePhotoIds: string[]    // ✅ 业务ID
  // ❌ 不存储: 生成Prompt完整内容(包含用户描述)
  // ❌ 不存储: API响应的原始数据(可能包含敏感信息)
}
```

---

## 6. TypeScript类型定义汇总

### 6.1 核心类型

```typescript
// ============================================================
// 生成模式相关
// ============================================================

/** 生成模式枚举 */
export type GenerationMode = 'single' | 'multi'

/** 生成模式配置 */
export interface GenerationModeConfig {
  mode: GenerationMode
  displayName: string
  description: string
  minPhotos: number
  maxPhotos: number
  requiresFaceDetection: boolean
}

// ============================================================
// AI照片元数据
// ============================================================

/** AI照片元数据结构(存储在library_photos.ai_metadata JSON字段) */
export interface AIPhotoMetadata {
  taskId: string              // 生成任务ID
  styleId: string             // 风格ID
  styleName: string           // 风格名称(冗余)
  milestoneName?: string      // 里程碑名称
  similarityLevel: string     // 相似度级别(high/medium/low)
  sourcePhotoIds: string[]    // 源照片ID数组
  sequenceNumber: number      // 风格内序号(1-4)
  generatedAt: number         // 生成时间戳
  generationMode?: GenerationMode  // 生成模式
}

// ============================================================
// 照片选择与验证
// ============================================================

/** 人脸检测验证结果 */
export interface FaceValidationResult {
  photoId: string
  isValid: boolean
  faceCount: number
  confidence: number
  error?: string
  timestamp: number
}

/** 照片选择状态 */
export interface PhotoSelection {
  photos: PhotoUpload[]
  validationResults: Map<string, FaceValidationResult>
  mode: GenerationMode
  isValid: boolean
}

// ============================================================
// 相册筛选器
// ============================================================

/** 日期预设类型 */
export type DatePreset =
  | 'today'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'custom'

/** 相册筛选条件 */
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

/** 相册查询结果 */
export interface AlbumQueryResult {
  photos: PhotoUpload[]
  total: number
  hasMore: boolean
}

// ============================================================
// 扩展现有类型
// ============================================================

/** 扩展PhotoUpload类型(添加新字段) */
export interface PhotoUpload {
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
  cropX?: number
  cropY?: number
  cropWidth?: number
  cropHeight?: number
  isInLibrary: boolean

  // 新增字段
  isAIGenerated: boolean             // AI生成标识
  aiMetadata?: string                // AI元数据JSON字符串
  personId?: string
  personName?: string
  faceCount?: number                 // 人脸数量
  faceConfidence?: number            // 人脸检测置信度
  qualityScore?: number              // 综合质量评分
}

/** 扩展GenerationTask类型(添加mode字段) */
export interface GenerationTask {
  id: string
  createdAt: number
  updatedAt: number
  status: 'pending' | 'generating' | 'success' | 'failed'
  similarityLevel: 'high' | 'medium' | 'low'
  selectedStyleIds: string[]
  photoIds: string[]  // 数组长度:单人=1,多人=2-4
  errorMessage?: string
  totalImages: number
  completedImages: number

  // 新增字段
  mode: GenerationMode               // 生成模式
}

/** 扩展StyleTemplate类型(添加多人支持字段) */
export interface StyleTemplate {
  id: string
  name: string
  promptTemplate: string
  thumbnailPath?: string
  displayOrder: number
  description?: string

  // 新增字段
  supportedModes: GenerationMode[]   // 支持的模式数组
  minPhotos: number                  // 最少照片数
  maxPhotos: number                  // 最多照片数
  isMultiPerson: boolean             // 是否为多人风格
}
```

---

### 6.2 Zustand Store扩展

```typescript
/** 扩展应用Store(多人照片生成状态) */
export interface ExtendedAppStore extends AppStore {
  // 现有状态...
  uploadedPhotos: PhotoUpload[]
  selectedStyleIds: string[]

  // 新增状态
  generationMode: GenerationMode
  photoValidationResults: Map<string, FaceValidationResult>
  filteredStyleIds: string[]

  // 模式管理
  setGenerationMode: (mode: GenerationMode) => void
  switchMode: (newMode: GenerationMode) => void  // 切换模式并清空照片

  // 照片管理
  setUploadedPhotos: (photos: PhotoUpload[]) => void
  addPhoto: (photo: PhotoUpload) => Promise<void>  // 带验证
  removePhoto: (photoId: string) => void
  clearPhotos: () => void

  // 验证管理
  setPhotoValidation: (photoId: string, result: FaceValidationResult) => void
  getPhotoValidation: (photoId: string) => FaceValidationResult | undefined

  // 风格过滤
  updateFilteredStyles: () => Promise<void>
}

/** 相册筛选Store */
export interface AlbumStore {
  // 筛选状态
  filter: AlbumFilter
  photos: PhotoUpload[]
  total: number
  isLoading: boolean

  // 筛选操作
  setFilter: (filter: Partial<AlbumFilter>) => void
  clearFilter: () => void
  applyFilter: () => Promise<void>
  loadMore: () => Promise<void>

  // 元数据缓存
  availableStyles: StyleTemplate[]
  availableMilestones: string[]
  loadMetadata: () => Promise<void>
}
```

---

## 7. 实施检查清单

### Phase 0 - 数据库准备

- [x] 确认SQLite版本>= 3.38(支持JSON索引)
- [ ] 编写迁移脚本(SQL + TypeScript)
- [ ] 在开发环境执行迁移并验证
- [ ] 备份现有数据库(用户测试环境)

### Phase 1 - 核心功能

- [ ] 实现 `migrateToV2()` 迁移函数
- [ ] 更新 `insertLibraryPhoto()` 支持新字段
- [ ] 实现 `findReferencePhotos()` 查询函数
- [ ] 实现 `queryAlbumPhotos()` 筛选函数
- [ ] 实现 `insertAIGeneratedPhoto()` 验证函数
- [ ] 更新 TypeScript 类型定义

### Phase 2 - 状态管理

- [ ] 扩展 Zustand Store (generationMode相关)
- [ ] 实现 `validateSinglePersonPhoto()` 人脸检测
- [ ] 实现 `switchMode()` 模式切换逻辑
- [ ] 实现 `addPhoto()` 带验证的照片添加

### Phase 3 - 性能优化

- [ ] 创建所有索引
- [ ] 添加查询性能监控
- [ ] 实现虚拟滚动(react-window)
- [ ] 实现缩略图生成(可选)

### Phase 4 - 测试验证

- [ ] 单元测试:人脸检测验证逻辑
- [ ] 单元测试:照片分离查询(参考库/相册)
- [ ] 单元测试:相册筛选(组合条件)
- [ ] 集成测试:完整生成流程(单人/多人)
- [ ] 性能测试:1000+照片查询耗时
- [ ] 数据库完整性测试:约束检查

---

## 8. 后期优化路线图

### 优化1: 缩略图系统(预计2个月后)

**触发条件**: 相册加载时间>3秒

**实施方案**:
- 添加 `thumbnail_path` 字段
- 上传/生成时自动生成200x200缩略图
- 相册列表展示缩略图,点击查看原图

---

### 优化2: JSON字段提升(预计6个月后)

**触发条件**: 照片数量>5000张且查询>500ms

**实施方案**:
- 添加 `style_id`, `milestone_name` 独立列
- 数据迁移:从JSON提取到列
- 重建索引:使用列索引替代JSON索引

---

### 优化3: 全文搜索(未来需求)

**触发条件**: 用户需要搜索"宝宝笑脸照片"等模糊查询

**实施方案**:
- 启用SQLite FTS5扩展
- 为 `styleName`, `milestoneName` 创建全文索引
- 支持中文分词搜索

---

## 9. 总结

### 核心设计原则

1. **最小化改动**: 复用现有表结构,只添加必要字段
2. **向后兼容**: 现有数据自动兼容新schema(默认值策略)
3. **性能优先**: 索引覆盖80%高频查询场景
4. **隐私保护**: 人脸检测本地化,不存储敏感特征
5. **可扩展性**: JSON元数据支持未来字段扩展

### 技术亮点

- **单表+标识分离**: 避免双表复杂性,保持查询高效
- **JSON索引**: SQLite 3.38+特性,平衡灵活性与性能
- **组合索引**: `(is_ai_generated, uploaded_at DESC)` 覆盖核心查询
- **应用层验证**: TypeScript类型安全 + 数据库约束双重保障

### 风险控制

- **SQLite版本依赖**: Tauri内置版本>= 3.38,无兼容性风险
- **JSON查询性能**: 短期(<5000张)无问题,长期有提升列方案
- **迁移回滚**: 保留字段设计,可随时停用功能无需回滚

---

**文档版本**: v1.0
**最后更新**: 2025-10-15
**审核状态**: 待审核
**下一步**: 提交给后端开发工程师实施迁移脚本
