# Data Model: 百岁照生成功能

**Feature**: 百岁照生成功能
**Date**: 2025-10-08
**Input**: spec.md Key Entities + research.md Storage Design

---

## Overview

本文档定义百岁照生成功能的数据模型,包括实体定义、关系、验证规则和状态机。基于SQLite关系数据库实现,使用`sqflite`包。

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│  StyleTemplate      │
│  (预设数据,6条记录) │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────┴──────────┐         ┌──────────────────┐
│  GenerationTask     │ 1:N     │  PhotoUpload     │
│  (生成任务)         ├─────────│  (上传照片)     │
└──────────┬──────────┘         └──────────────────┘
           │
           │ 1:N
           │
┌──────────┴──────────┐
│  GeneratedImage     │
│  (生成结果)         │
└─────────────────────┘
```

---

## Entity Definitions

### 1. PhotoUpload (照片上传记录)

**Purpose**: 记录用户上传的原始照片信息,支持多次使用同一照片

**Fields**:

| Field | Type | Nullable | Description | Validation |
|-------|------|----------|-------------|------------|
| id | TEXT | No | UUID,主键 | - |
| file_path | TEXT | No | 本地文件路径 (应用沙盒目录) | 路径必须存在 |
| original_name | TEXT | Yes | 原始文件名 | - |
| width | INTEGER | No | 图片宽度(像素) | ≥512 |
| height | INTEGER | No | 图片高度(像素) | ≥512 |
| file_size | INTEGER | No | 文件大小(字节) | ≤10MB (10485760 bytes) |
| format | TEXT | No | 文件格式 | 'JPG' or 'PNG' |
| uploaded_at | INTEGER | No | 上传时间戳(Unix milliseconds) | - |
| is_cropped | INTEGER | No | 是否已裁剪 (0/1) | 0 or 1 |
| crop_ratio | TEXT | Yes | 裁剪比例 | '1:1', '3:4', or '4:3' (如果is_cropped=1) |
| crop_x | REAL | Yes | 裁剪起点X坐标(比例0-1) | 0.0 ≤ x ≤ 1.0 |
| crop_y | REAL | Yes | 裁剪起点Y坐标(比例0-1) | 0.0 ≤ y ≤ 1.0 |
| crop_width | REAL | Yes | 裁剪宽度(比例0-1) | 0.0 < w ≤ 1.0 |
| crop_height | REAL | Yes | 裁剪高度(比例0-1) | 0.0 < h ≤ 1.0 |

**SQLite Schema**:

```sql
CREATE TABLE photo_uploads (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  original_name TEXT,
  width INTEGER NOT NULL CHECK (width >= 512),
  height INTEGER NOT NULL CHECK (height >= 512),
  file_size INTEGER NOT NULL CHECK (file_size <= 10485760),
  format TEXT NOT NULL CHECK (format IN ('JPG', 'PNG')),
  uploaded_at INTEGER NOT NULL,
  is_cropped INTEGER NOT NULL DEFAULT 0 CHECK (is_cropped IN (0, 1)),
  crop_ratio TEXT CHECK (crop_ratio IN ('1:1', '3:4', '4:3')),
  crop_x REAL CHECK (crop_x >= 0.0 AND crop_x <= 1.0),
  crop_y REAL CHECK (crop_y >= 0.0 AND crop_y <= 1.0),
  crop_width REAL CHECK (crop_width > 0.0 AND crop_width <= 1.0),
  crop_height REAL CHECK (crop_height > 0.0 AND crop_height <= 1.0)
);

CREATE INDEX idx_photo_uploads_uploaded_at ON photo_uploads(uploaded_at DESC);
```

**Dart Model** (Preview):

```dart
class PhotoUpload {
  final String id;
  final String filePath;
  final String? originalName;
  final int width;
  final int height;
  final int fileSize;
  final String format; // 'JPG' or 'PNG'
  final DateTime uploadedAt;
  final bool isCropped;
  final String? cropRatio; // '1:1', '3:4', '4:3'
  final double? cropX;
  final double? cropY;
  final double? cropWidth;
  final double? cropHeight;

  // Validation method
  bool isValid() {
    return width >= 512 &&
           height >= 512 &&
           fileSize <= 10 * 1024 * 1024 &&
           (format == 'JPG' || format == 'PNG');
  }
}
```

---

### 2. StyleTemplate (风格模板)

**Purpose**: 预设的6种生成风格,包含Prompt模板和示例图

**Fields**:

| Field | Type | Nullable | Description | Validation |
|-------|------|----------|-------------|------------|
| id | TEXT | No | 风格ID (如 'style_warm_home') | - |
| name | TEXT | No | 中文名称 (如 "居家暖光温馨风") | - |
| prompt_template | TEXT | No | AI Prompt模板 | - |
| thumbnail_path | TEXT | Yes | 示例图路径 (本地assets) | - |
| display_order | INTEGER | No | 显示顺序 (1-6) | 1 ≤ order ≤ 6 |
| description | TEXT | Yes | 风格描述 (可选) | - |

**SQLite Schema**:

```sql
CREATE TABLE style_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  prompt_template TEXT NOT NULL,
  thumbnail_path TEXT,
  display_order INTEGER NOT NULL CHECK (display_order >= 1 AND display_order <= 6),
  description TEXT
);

-- Pre-populate data (6 styles from PRD)
INSERT INTO style_templates VALUES
('style_warm_home', '居家暖光温馨风', '帮我生成图片：去除杂乱背景,保持宝宝脸部不变...', 'assets/styles/warm_home.jpg', 1, '温馨柔和的居家氛围'),
('style_fresh_nature', '森系清新治愈风', '帮我生成图片：去除冗余背景,保持宝宝脸部不变...', 'assets/styles/fresh_nature.jpg', 2, '清新自然的森系风格'),
('style_cartoon', '卡通动漫风', '帮我生成图片：去除背景,保持宝宝脸部特征,Q版卡通化处理...', 'assets/styles/cartoon.jpg', 3, 'Q版可爱的动漫风格'),
('style_vintage', '复古可爱胶片风', '帮我生成图片：去除复杂背景,保持宝宝脸部不变...', 'assets/styles/vintage.jpg', 4, '怀旧复古的胶片质感'),
('style_dreamy', '梦幻柔光童话风', '帮我生成图片：去除多余背景,保持宝宝脸部不变...', 'assets/styles/dreamy.jpg', 5, '梦幻柔美的童话场景'),
('style_festival', '节日主题风', '帮我生成图片：根据当前节日(中秋/新年等)生成对应主题...', 'assets/styles/festival.jpg', 6, '动态节日主题(春节/中秋等)');
```

**Dart Model**:

```dart
class StyleTemplate {
  final String id;
  final String name;
  final String promptTemplate;
  final String? thumbnailPath;
  final int displayOrder;
  final String? description;

  // Method to replace template variables
  String buildPrompt(Map<String, String> variables) {
    String prompt = promptTemplate;
    variables.forEach((key, value) {
      prompt = prompt.replaceAll('{$key}', value);
    });
    return prompt;
  }
}
```

---

### 3. GenerationTask (生成任务)

**Purpose**: 单次生成请求,关联上传照片和选择的风格

**Fields**:

| Field | Type | Nullable | Description | Validation |
|-------|------|----------|-------------|------------|
| id | TEXT | No | UUID,主键 | - |
| created_at | INTEGER | No | 创建时间戳 | - |
| updated_at | INTEGER | No | 最后更新时间戳 | - |
| status | TEXT | No | 任务状态 | 'pending', 'generating', 'success', 'failed' |
| similarity_level | TEXT | No | 相似度档位 | 'high', 'medium', 'low' |
| selected_style_ids | TEXT | No | 选择的风格ID列表(JSON数组) | 1-3个风格 |
| photo_ids | TEXT | No | 使用的照片ID列表(JSON数组) | 1-5张照片 |
| error_message | TEXT | Yes | 失败原因(如网络错误) | - |
| total_images | INTEGER | No | 预计生成图片总数 | style数量 × 4 |
| completed_images | INTEGER | No | 已完成图片数量 | ≤total_images |

**SQLite Schema**:

```sql
CREATE TABLE generation_tasks (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'generating', 'success', 'failed')),
  similarity_level TEXT NOT NULL DEFAULT 'medium' CHECK (similarity_level IN ('high', 'medium', 'low')),
  selected_style_ids TEXT NOT NULL,  -- JSON array: ["style_warm_home", "style_fresh_nature"]
  photo_ids TEXT NOT NULL,           -- JSON array: ["photo_uuid_1", "photo_uuid_2"]
  error_message TEXT,
  total_images INTEGER NOT NULL,
  completed_images INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_generation_tasks_created_at ON generation_tasks(created_at DESC);
CREATE INDEX idx_generation_tasks_status ON generation_tasks(status);
```

**State Machine**:

```
┌─────────┐  start generation   ┌────────────┐
│ pending ├─────────────────────→│ generating │
└─────────┘                      └──────┬─────┘
                                        │
                          ┌─────────────┴────────────┐
                          │                          │
                      success                     failure
                          │                          │
                          ↓                          ↓
                    ┌──────────┐              ┌────────┐
                    │ success  │              │ failed │
                    └──────────┘              └────────┘
                                                   │
                                                retry
                                                   │
                                                   ↓
                                              ┌─────────┐
                                              │ pending │
                                              └─────────┘
```

**Dart Model**:

```dart
enum TaskStatus { pending, generating, success, failed }
enum SimilarityLevel { high, medium, low }

class GenerationTask {
  final String id;
  final DateTime createdAt;
  DateTime updatedAt;
  TaskStatus status;
  final SimilarityLevel similarityLevel;
  final List<String> selectedStyleIds;
  final List<String> photoIds;
  String? errorMessage;
  final int totalImages;
  int completedImages;

  // Calculate progress percentage
  double get progress => completedImages / totalImages;

  // Check if task is complete
  bool get isComplete => status == TaskStatus.success || status == TaskStatus.failed;
}
```

---

### 4. GeneratedImage (生成结果)

**Purpose**: AI生成的单张照片记录

**Fields**:

| Field | Type | Nullable | Description | Validation |
|-------|------|----------|-------------|------------|
| id | TEXT | No | UUID,主键 | - |
| task_id | TEXT | No | 所属任务ID (外键) | 引用generation_tasks.id |
| style_id | TEXT | No | 使用的风格ID | 引用style_templates.id |
| sequence_num | INTEGER | No | 同一风格内的序号 (1-4) | 1 ≤ seq ≤ 4 |
| file_path | TEXT | No | 生成图片本地路径 | - |
| file_size | INTEGER | No | 文件大小(字节) | - |
| width | INTEGER | Yes | 图片宽度(像素) | - |
| height | INTEGER | Yes | 图片高度(像素) | - |
| created_at | INTEGER | No | 生成时间戳 | - |
| is_saved_to_album | INTEGER | No | 是否已保存到相册 (0/1) | 0 or 1 |
| album_save_path | TEXT | Yes | 相册保存路径(如已保存) | - |

**SQLite Schema**:

```sql
CREATE TABLE generated_images (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  style_id TEXT NOT NULL,
  sequence_num INTEGER NOT NULL CHECK (sequence_num >= 1 AND sequence_num <= 4),
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at INTEGER NOT NULL,
  is_saved_to_album INTEGER NOT NULL DEFAULT 0 CHECK (is_saved_to_album IN (0, 1)),
  album_save_path TEXT,
  FOREIGN KEY(task_id) REFERENCES generation_tasks(id) ON DELETE CASCADE,
  FOREIGN KEY(style_id) REFERENCES style_templates(id)
);

CREATE INDEX idx_generated_images_task_id ON generated_images(task_id);
CREATE INDEX idx_generated_images_style_id ON generated_images(style_id, sequence_num);
CREATE INDEX idx_generated_images_created_at ON generated_images(created_at DESC);

-- Unique constraint: 同一task+style组合下sequence_num不重复
CREATE UNIQUE INDEX idx_task_style_seq ON generated_images(task_id, style_id, sequence_num);
```

**File Naming Convention**:

```
本地文件路径格式: {app_documents_dir}/generated/{task_id}/{style_id}_{sequence_num}.jpg
示例: /data/user/0/com.homememo/files/generated/task_abc123/style_warm_home_1.jpg

相册保存文件名格式: {YYYYMMDD}-{style_name}-{sequence_num}.jpg
示例: 20251008-暖光温馨-1.jpg
```

**Dart Model**:

```dart
class GeneratedImage {
  final String id;
  final String taskId;
  final String styleId;
  final int sequenceNum;
  final String filePath;
  final int fileSize;
  final int? width;
  final int? height;
  final DateTime createdAt;
  bool isSavedToAlbum;
  String? albumSavePath;

  // Generate album filename
  String generateAlbumFilename(String styleName) {
    final dateStr = DateFormat('yyyyMMdd').format(createdAt);
    return '$dateStr-$styleName-$sequenceNum.jpg';
  }
}
```

---

## Validation Rules Summary

### Photo Upload Validation

```dart
class PhotoValidator {
  static const int MIN_RESOLUTION = 512;
  static const int MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  static const List<String> ALLOWED_FORMATS = ['JPG', 'PNG'];

  static ValidationResult validate(PhotoUpload photo) {
    if (photo.width < MIN_RESOLUTION || photo.height < MIN_RESOLUTION) {
      return ValidationResult.error('照片分辨率不足,需≥512x512');
    }
    if (photo.fileSize > MAX_FILE_SIZE) {
      return ValidationResult.error('照片大小超过10MB限制');
    }
    if (!ALLOWED_FORMATS.contains(photo.format)) {
      return ValidationResult.error('仅支持JPG和PNG格式');
    }
    // TODO: Add blur detection using google_ml_kit
    // TODO: Add face detection using google_ml_kit
    return ValidationResult.success();
  }
}
```

### Generation Task Validation

```dart
class TaskValidator {
  static const int MIN_PHOTOS = 1;
  static const int MAX_PHOTOS = 5;
  static const int MIN_STYLES = 1;
  static const int MAX_STYLES = 3;

  static ValidationResult validate(GenerationTask task) {
    if (task.photoIds.length < MIN_PHOTOS || task.photoIds.length > MAX_PHOTOS) {
      return ValidationResult.error('请上传1-5张照片');
    }
    if (task.selectedStyleIds.length < MIN_STYLES || task.selectedStyleIds.length > MAX_STYLES) {
      return ValidationResult.error('请选择1-3种风格');
    }
    return ValidationResult.success();
  }
}
```

---

## Data Migration Strategy

### Version 1.0.0 (Initial Schema)

```dart
class DatabaseHelper {
  static const int DATABASE_VERSION = 1;
  static const String DATABASE_NAME = 'homememo.db';

  Future<void> onCreate(Database db, int version) async {
    // Create tables in order (respecting foreign keys)
    await db.execute(CREATE_STYLE_TEMPLATES_TABLE);
    await db.execute(CREATE_PHOTO_UPLOADS_TABLE);
    await db.execute(CREATE_GENERATION_TASKS_TABLE);
    await db.execute(CREATE_GENERATED_IMAGES_TABLE);

    // Insert preset style templates
    await _insertPresetStyles(db);
  }

  Future<void> onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Future schema upgrades
    if (oldVersion < 2) {
      // Example: Add new column in v2
      // await db.execute('ALTER TABLE generation_tasks ADD COLUMN retry_count INTEGER DEFAULT 0');
    }
  }
}
```

---

## Storage Estimates

Based on 20 generation tasks (history limit):

| Data Type | Avg Size | Count | Total |
|-----------|----------|-------|-------|
| Uploaded Photos (原图) | 2MB | 100张 (20任务×平均5张) | 200MB |
| Generated Images (结果) | 1MB | 480张 (20任务×平均2风格×4张/风格) | 480MB |
| Database Metadata | 1KB/record | ~700条记录 | <1MB |
| **Total** | - | - | **~681MB** |

**Note**: 超过500MB目标,建议实现自动清理机制:
- 选项1: 限制历史记录为15次(而非20次)
- 选项2: 生成图片压缩至500KB (牺牲质量)
- 选项3: 用户手动清理时提示"建议保留最近10次记录"

---

## Query Patterns (Performance Optimized)

### 1. Load History List (SC-007: ≤1秒)

```sql
-- Query for history screen
SELECT
  t.id,
  t.created_at,
  t.status,
  t.selected_style_ids,
  COUNT(g.id) as total_generated,
  GROUP_CONCAT(g.file_path) as sample_thumbnails
FROM generation_tasks t
LEFT JOIN generated_images g ON t.id = g.task_id
WHERE t.status IN ('success', 'failed')
GROUP BY t.id
ORDER BY t.created_at DESC
LIMIT 20;
```

**Indexes Used**: `idx_generation_tasks_created_at`, `idx_generated_images_task_id`

### 2. Load Task Details

```sql
-- Query for single task with all generated images
SELECT
  g.*,
  s.name as style_name
FROM generated_images g
JOIN style_templates s ON g.style_id = s.id
WHERE g.task_id = ?
ORDER BY g.style_id, g.sequence_num;
```

### 3. Cleanup Old History

```sql
-- Delete tasks older than 30 days (cascade deletes generated_images)
DELETE FROM generation_tasks
WHERE created_at < ?
  AND id NOT IN (
    SELECT id FROM generation_tasks
    ORDER BY created_at DESC
    LIMIT 15  -- Keep at least 15 most recent
  );
```

---

## Next Steps

1. ✅ Implement Dart models matching schema
2. → Define nano banana API contracts (Phase 1 next)
3. → Create database migration scripts
4. → Implement validation logic
5. → Add unit tests for models and validators
