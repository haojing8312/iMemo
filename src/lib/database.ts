/**
 * 数据库初始化和管理
 * 使用 Tauri SQL Plugin (@tauri-apps/plugin-sql)
 */

import Database from '@tauri-apps/plugin-sql'
import type {
  PhotoUpload,
  StyleTemplate,
  GenerationTask,
  GeneratedImage,
  Person,
} from './types'

let db: Database | null = null

/**
 * 初始化数据库连接并创建表结构
 */
export async function initDatabase(): Promise<Database> {
  if (db) return db

  // 使用 SQLite,数据库文件自动保存到 Tauri 应用数据目录
  db = await Database.load('sqlite:homememo.db')

  // 创建表结构
  await createTables(db)
  await insertPresetStyles(db)

  console.log('[Database] 数据库初始化完成')
  return db
}

/**
 * 创建数据库表结构
 */
async function createTables(db: Database) {
  // 先尝试为已存在的表添加新列（数据迁移 - T004: 003-2 多人照片生成）
  try {
    await db.execute('ALTER TABLE library_photos ADD COLUMN is_ai_generated INTEGER NOT NULL DEFAULT 0 CHECK (is_ai_generated IN (0, 1))')
    console.log('[Database] 已添加 is_ai_generated 列')
  } catch (error) {
    // 列已存在或表不存在，忽略错误
  }

  try {
    await db.execute('ALTER TABLE library_photos ADD COLUMN ai_metadata TEXT')
    console.log('[Database] 已添加 ai_metadata 列')
  } catch (error) {
    // 列已存在或表不存在，忽略错误
  }

  // 为 generation_tasks 表添加 mode 字段（003-2）
  try {
    await db.execute("ALTER TABLE generation_tasks ADD COLUMN mode TEXT NOT NULL DEFAULT 'single' CHECK (mode IN ('single', 'multi'))")
    console.log('[Database Migration 003-2] 已添加 generation_tasks.mode 列')
  } catch (error) {
    // 列已存在，忽略错误
  }

  // 为 style_templates 表添加多人模式支持字段（003-2）
  try {
    await db.execute('ALTER TABLE style_templates ADD COLUMN supported_modes TEXT')
    console.log('[Database Migration 003-2] 已添加 style_templates.supported_modes 列')
  } catch (error) {
    // 列已存在，忽略错误
  }

  try {
    await db.execute('ALTER TABLE style_templates ADD COLUMN min_photos INTEGER DEFAULT 1')
    console.log('[Database Migration 003-2] 已添加 style_templates.min_photos 列')
  } catch (error) {
    // 列已存在，忽略错误
  }

  try {
    await db.execute('ALTER TABLE style_templates ADD COLUMN max_photos INTEGER DEFAULT 1')
    console.log('[Database Migration 003-2] 已添加 style_templates.max_photos 列')
  } catch (error) {
    // 列已存在，忽略错误
  }

  try {
    await db.execute('ALTER TABLE style_templates ADD COLUMN is_multi_person INTEGER DEFAULT 0')
    console.log('[Database Migration 003-2] 已添加 style_templates.is_multi_person 列')
  } catch (error) {
    // 列已存在，忽略错误
  }

  // 人物档案表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS persons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_path TEXT,
      photo_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `)

  // 照片库表 (扩展原有 photo_uploads)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS library_photos (
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
      crop_height REAL CHECK (crop_height > 0.0 AND crop_height <= 1.0),
      is_in_library INTEGER NOT NULL DEFAULT 1,
      is_ai_generated INTEGER NOT NULL DEFAULT 0 CHECK (is_ai_generated IN (0, 1)),
      ai_metadata TEXT,
      person_id TEXT,
      person_name TEXT,
      face_count INTEGER DEFAULT 0,
      face_confidence REAL,
      quality_score REAL,
      FOREIGN KEY(person_id) REFERENCES persons(id) ON DELETE SET NULL
    );
  `)

  // AI 生成照片元数据表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ai_photo_metadata (
      photo_id TEXT PRIMARY KEY,
      source_photo_ids TEXT NOT NULL,
      style_id TEXT NOT NULL,
      generation_prompt TEXT,
      similarity_level TEXT CHECK (similarity_level IN ('high', 'medium', 'low')),
      task_id TEXT,
      FOREIGN KEY(photo_id) REFERENCES library_photos(id) ON DELETE CASCADE,
      FOREIGN KEY(style_id) REFERENCES style_templates(id)
    );
  `)

  // 风格模板表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS style_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      prompt_template TEXT NOT NULL,
      thumbnail_path TEXT,
      display_order INTEGER NOT NULL CHECK (display_order >= 1 AND display_order <= 6),
      description TEXT
    );
  `)

  // 生成任务表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS generation_tasks (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'generating', 'success', 'failed')),
      similarity_level TEXT NOT NULL DEFAULT 'medium' CHECK (similarity_level IN ('high', 'medium', 'low')),
      selected_style_ids TEXT NOT NULL,
      photo_ids TEXT NOT NULL,
      error_message TEXT,
      total_images INTEGER NOT NULL,
      completed_images INTEGER NOT NULL DEFAULT 0
    );
  `)

  // 生成的图片表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS generated_images (
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
  `)

  // 创建索引
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_library_photos_uploaded_at ON library_photos(uploaded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_library_photos_person ON library_photos(person_id);
    CREATE INDEX IF NOT EXISTS idx_generation_tasks_created_at ON generation_tasks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_generation_tasks_status ON generation_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_generated_images_task_id ON generated_images(task_id);
    CREATE INDEX IF NOT EXISTS idx_generated_images_style_id ON generated_images(style_id, sequence_num);
    CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_task_style_seq ON generated_images(task_id, style_id, sequence_num);
  `)

  // 创建 003-2 新索引
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_library_photos_ai_type_time ON library_photos(is_ai_generated, uploaded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_library_photos_face_count ON library_photos(face_count);
    CREATE INDEX IF NOT EXISTS idx_generation_tasks_mode ON generation_tasks(mode);
  `)

  console.log('[Database Migration 003-2] 索引创建完成')

  console.log('[Database] 表结构创建完成')
}

/**
 * 插入预设风格模板
 */
async function insertPresetStyles(db: Database) {
  const result = await db.select<Array<{ count: number }>>('SELECT COUNT(*) as count FROM style_templates')
  const count = result[0]?.count || 0

  if (count > 0) {
    console.log('[Database] 风格模板已存在,跳过插入')
    return
  }

  const styles = [
    {
      id: 'style_warm_home',
      name: '居家暖光温馨风',
      prompt: `帮我生成图片：去除杂乱背景,保持宝宝脸部不变,生成4张不同表情动作写真。
宝宝戴棕色兔耳毛绒帽,穿白色短袖+棕色灯芯绒背带裤,脚踩棕色袜子,
手持彩色字母木块,身旁摆放超大棕色LABUBU风格毛绒玩偶。
一束暖黄色光线从左侧窗户斜射,背景为纯净米白色,画面留白占比60%,
室内居家摄影质感,比例3:4,保留原人物比例。`,
      thumbnail: '/styles/warm_home.svg',
      order: 1,
      description: '温馨柔和的居家氛围',
    },
    {
      id: 'style_fresh_nature',
      name: '森系清新治愈风',
      prompt: `帮我生成图片：去除冗余背景,保持宝宝脸部不变,生成4张不同角度写真。
宝宝穿米白色棉麻连衣裙+编织草帽,手持棉花糖风格白色干花束,
坐在原木色编织篮中,周围散落尤加利叶+满天星+干枯芦苇。
自然光从右上方洒下,背景为雾霾蓝渐变纯色,占比70%,
日系小清新摄影风格,比例3:4,突出治愈感。`,
      thumbnail: '/styles/fresh_nature.svg',
      order: 2,
      description: '清新自然的森系风格',
    },
    {
      id: 'style_cartoon',
      name: '卡通动漫风',
      prompt: `帮我生成图片：去除背景,保持宝宝脸部特征,Q版卡通化处理,生成4张不同动作。
宝宝头戴粉色蝴蝶结发箍,穿粉蓝拼色背带裙,手持魔法棒道具,
Q版比例(头身比1:2),眼睛放大1.3倍,腮红圆形粉色,
背景为糖果色渐变(粉+蓝+黄),添加星星+爱心装饰元素,
二次元插画风格,比例3:4,可爱萌系路线。`,
      thumbnail: '/styles/cartoon.svg',
      order: 3,
      description: 'Q版可爱的动漫风格',
    },
    {
      id: 'style_vintage',
      name: '复古可爱胶片风',
      prompt: `帮我生成图片：去除复杂背景,保持宝宝脸部不变,生成4张胶片质感写真。
宝宝穿奶油色针织开衫+格子背心裙,戴贝雷帽,手持复古相机道具,
坐在皮质沙发角落,旁边摆放黑胶唱片+老式收音机。
整体色调:暖橙调+颗粒感,四周添加黑色胶片边框,
80年代胶片摄影风格,比例3:4,怀旧温暖氛围。`,
      thumbnail: '/styles/vintage.svg',
      order: 4,
      description: '怀旧复古的胶片质感',
    },
    {
      id: 'style_dreamy',
      name: '梦幻柔光童话风',
      prompt: `帮我生成图片：去除多余背景,保持宝宝脸部不变,生成4张童话场景写真。
宝宝穿淡紫色纱裙+小皇冠头饰,手持蒲公英/泡泡机,
坐在云朵造型软垫上,周围漂浮羽毛+小星星+透明泡泡。
柔光从顶部打下,背景为紫粉渐变梦幻色,添加光斑效果,
童话绘本插画风格,比例3:4,梦幻柔美路线。`,
      thumbnail: '/styles/dreamy.svg',
      order: 5,
      description: '梦幻柔美的童话场景',
    },
    {
      id: 'style_festival',
      name: '节日主题风',
      prompt: `帮我生成图片：根据当前节日(中秋/新年等)生成对应主题,保持宝宝脸部不变,生成4张节日写真。
【春节】宝宝穿红色唐装/拜年服,手持红包/福字,背景为中国红+金色元素。
【中秋】宝宝穿汉服,手持兔子灯笼,背景为月亮+云朵+桂花树。
【圣诞】宝宝穿红白圣诞装+小鹿发箍,背景为圣诞树+礼物盒+雪花。
节日氛围浓郁,色彩鲜艳,比例3:4,喜庆欢乐风格。`,
      thumbnail: '/styles/festival.svg',
      order: 6,
      description: '动态节日主题(春节/中秋等)',
    },
  ]

  for (const style of styles) {
    await db.execute(
      `INSERT INTO style_templates (id, name, prompt_template, thumbnail_path, display_order, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [style.id, style.name, style.prompt, style.thumbnail, style.order, style.description]
    )
  }

  console.log('[Database] 预设风格模板插入完成')
}

/**
 * 获取数据库实例
 */
export async function getDb(): Promise<Database> {
  if (!db) {
    return await initDatabase()
  }
  return db
}

// =============================================================================
// 人物档案 CRUD
// =============================================================================

export async function insertPerson(person: Omit<Person, 'id' | 'createdAt'>): Promise<Person> {
  const db = await getDb()
  const id = crypto.randomUUID()
  const now = Date.now()

  await db.execute(
    `INSERT INTO persons (id, name, avatar_path, photo_count, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, person.name, person.avatarPath || null, person.photoCount || 0, now]
  )

  return { id, createdAt: now, ...person }
}

export async function findAllPersons(): Promise<Person[]> {
  const db = await getDb()
  const rows = await db.select<Array<{
    id: string
    name: string
    avatar_path: string | null
    photo_count: number
    created_at: number
  }>>('SELECT * FROM persons ORDER BY created_at DESC')

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    avatarPath: row.avatar_path || undefined,
    photoCount: row.photo_count,
    createdAt: row.created_at,
  }))
}

export async function updatePersonPhotoCount(personId: string, count: number): Promise<void> {
  const db = await getDb()
  await db.execute('UPDATE persons SET photo_count = ? WHERE id = ?', [count, personId])
}

export async function deletePerson(id: string): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM persons WHERE id = ?', [id])
}

// =============================================================================
// 照片库 CRUD
// =============================================================================

export async function insertLibraryPhoto(photo: Omit<PhotoUpload, 'id'>): Promise<PhotoUpload> {
  const db = await getDb()
  const id = crypto.randomUUID()

  await db.execute(
    `INSERT INTO library_photos (
      id, file_path, original_name, width, height, file_size, format,
      uploaded_at, is_cropped, crop_ratio, crop_x, crop_y, crop_width, crop_height,
      is_in_library, is_ai_generated, ai_metadata,
      person_id, person_name, face_count, face_confidence, quality_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      photo.filePath,
      photo.originalName || null,
      photo.width,
      photo.height,
      photo.fileSize,
      photo.format,
      photo.uploadedAt,
      photo.isCropped ? 1 : 0,
      photo.cropRatio || null,
      photo.cropX || null,
      photo.cropY || null,
      photo.cropWidth || null,
      photo.cropHeight || null,
      photo.isInLibrary ? 1 : 0,
      photo.isAIGenerated ? 1 : 0,
      photo.aiMetadata ? JSON.stringify(photo.aiMetadata) : null,
      photo.personId || null,
      photo.personName || null,
      photo.faceCount || 0,
      photo.faceConfidence || null,
      photo.qualityScore || null,
    ]
  )

  return { id, ...photo }
}

export async function findAllLibraryPhotos(): Promise<PhotoUpload[]> {
  const db = await getDb()
  const rows = await db.select<Array<any>>('SELECT * FROM library_photos ORDER BY uploaded_at DESC')

  return rows.map(row => ({
    id: row.id,
    filePath: row.file_path,
    originalName: row.original_name,
    width: row.width,
    height: row.height,
    fileSize: row.file_size,
    format: row.format,
    uploadedAt: row.uploaded_at,
    isCropped: row.is_cropped === 1,
    cropRatio: row.crop_ratio,
    cropX: row.crop_x,
    cropY: row.crop_y,
    cropWidth: row.crop_width,
    cropHeight: row.crop_height,
    isInLibrary: row.is_in_library === 1,
    isAIGenerated: row.is_ai_generated === 1,
    aiMetadata: row.ai_metadata ? JSON.parse(row.ai_metadata) : undefined,
    personId: row.person_id,
    personName: row.person_name,
    faceCount: row.face_count,
    faceConfidence: row.face_confidence,
    qualityScore: row.quality_score,
  }))
}

export async function findPhotosByPersonId(personId: string): Promise<PhotoUpload[]> {
  const db = await getDb()
  const rows = await db.select<Array<any>>(
    'SELECT * FROM library_photos WHERE person_id = ? ORDER BY uploaded_at DESC',
    [personId]
  )

  return rows.map(row => ({
    id: row.id,
    filePath: row.file_path,
    originalName: row.original_name,
    width: row.width,
    height: row.height,
    fileSize: row.file_size,
    format: row.format,
    uploadedAt: row.uploaded_at,
    isCropped: row.is_cropped === 1,
    cropRatio: row.crop_ratio,
    cropX: row.crop_x,
    cropY: row.crop_y,
    cropWidth: row.crop_width,
    cropHeight: row.crop_height,
    isInLibrary: row.is_in_library === 1,
    isAIGenerated: row.is_ai_generated === 1,
    aiMetadata: row.ai_metadata ? JSON.parse(row.ai_metadata) : undefined,
    personId: row.person_id,
    personName: row.person_name,
    faceCount: row.face_count,
    faceConfidence: row.face_confidence,
    qualityScore: row.quality_score,
  }))
}

export async function deleteLibraryPhoto(id: string): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM library_photos WHERE id = ?', [id])
}

// =============================================================================
// AI 照片元数据 CRUD
// =============================================================================

export async function insertAIPhotoMetadata(metadata: {
  photoId: string
  sourcePhotoIds: string[]
  styleId: string
  generationPrompt?: string
  similarityLevel?: string
  taskId?: string
}): Promise<void> {
  const db = await getDb()
  await db.execute(
    `INSERT INTO ai_photo_metadata (photo_id, source_photo_ids, style_id, generation_prompt, similarity_level, task_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      metadata.photoId,
      JSON.stringify(metadata.sourcePhotoIds),
      metadata.styleId,
      metadata.generationPrompt || null,
      metadata.similarityLevel || null,
      metadata.taskId || null,
    ]
  )
}

export async function findAIPhotoMetadata(photoId: string) {
  const db = await getDb()
  const rows = await db.select<Array<{
    photo_id: string
    source_photo_ids: string
    style_id: string
    generation_prompt: string | null
    similarity_level: string | null
    task_id: string | null
  }>>('SELECT * FROM ai_photo_metadata WHERE photo_id = ?', [photoId])

  if (rows.length === 0) return null

  const row = rows[0]
  return {
    photoId: row.photo_id,
    sourcePhotoIds: JSON.parse(row.source_photo_ids) as string[],
    styleId: row.style_id,
    generationPrompt: row.generation_prompt,
    similarityLevel: row.similarity_level,
    taskId: row.task_id,
  }
}

// =============================================================================
// 风格模板查询
// =============================================================================

export async function findAllStyles(): Promise<StyleTemplate[]> {
  const db = await getDb()
  const rows = await db.select<Array<any>>('SELECT * FROM style_templates ORDER BY display_order')

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    promptTemplate: row.prompt_template,
    thumbnailPath: row.thumbnail_path,
    displayOrder: row.display_order,
    description: row.description,
  }))
}

export async function findStyleById(id: string): Promise<StyleTemplate | null> {
  const db = await getDb()
  const rows = await db.select<Array<any>>('SELECT * FROM style_templates WHERE id = ?', [id])

  if (rows.length === 0) return null

  const row = rows[0]
  return {
    id: row.id,
    name: row.name,
    promptTemplate: row.prompt_template,
    thumbnailPath: row.thumbnail_path,
    displayOrder: row.display_order,
    description: row.description,
  }
}

// =============================================================================
// 生成任务 CRUD
// =============================================================================

export async function insertGenerationTask(
  task: Omit<GenerationTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GenerationTask> {
  const db = await getDb()
  const id = crypto.randomUUID()
  const now = Date.now()

  await db.execute(
    `INSERT INTO generation_tasks (
      id, created_at, updated_at, status, similarity_level,
      selected_style_ids, photo_ids, error_message,
      total_images, completed_images
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      now,
      now,
      task.status,
      task.similarityLevel,
      JSON.stringify(task.selectedStyleIds),
      JSON.stringify(task.photoIds),
      task.errorMessage || null,
      task.totalImages,
      task.completedImages,
    ]
  )

  return {
    id,
    createdAt: now,
    updatedAt: now,
    ...task,
  }
}

export async function updateTaskStatus(
  id: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const db = await getDb()
  const now = Date.now()
  await db.execute(
    'UPDATE generation_tasks SET status = ?, updated_at = ?, error_message = ? WHERE id = ?',
    [status, now, errorMessage || null, id]
  )
}

export async function findTaskById(id: string): Promise<GenerationTask | null> {
  const db = await getDb()
  const rows = await db.select<Array<any>>('SELECT * FROM generation_tasks WHERE id = ?', [id])

  if (rows.length === 0) return null

  const row = rows[0]
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    similarityLevel: row.similarity_level,
    selectedStyleIds: JSON.parse(row.selected_style_ids),
    photoIds: JSON.parse(row.photo_ids),
    errorMessage: row.error_message,
    totalImages: row.total_images,
    completedImages: row.completed_images,
  }
}

// =============================================================================
// 生成图片 CRUD
// =============================================================================

export async function insertGeneratedImage(
  image: Omit<GeneratedImage, 'id' | 'createdAt'>
): Promise<GeneratedImage> {
  const db = await getDb()
  const id = crypto.randomUUID()
  const now = Date.now()

  await db.execute(
    `INSERT INTO generated_images (
      id, task_id, style_id, sequence_num, file_path, file_size,
      width, height, created_at, is_saved_to_album, album_save_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      image.taskId,
      image.styleId,
      image.sequenceNum,
      image.filePath,
      image.fileSize,
      image.width || null,
      image.height || null,
      now,
      image.isSavedToAlbum ? 1 : 0,
      image.albumSavePath || null,
    ]
  )

  return {
    id,
    createdAt: now,
    ...image,
  }
}

export async function findImagesByTaskId(taskId: string): Promise<GeneratedImage[]> {
  const db = await getDb()
  const rows = await db.select<Array<any>>(
    'SELECT * FROM generated_images WHERE task_id = ? ORDER BY style_id, sequence_num',
    [taskId]
  )

  return rows.map(row => ({
    id: row.id,
    taskId: row.task_id,
    styleId: row.style_id,
    sequenceNum: row.sequence_num,
    filePath: row.file_path,
    fileSize: row.file_size,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    isSavedToAlbum: row.is_saved_to_album === 1,
    albumSavePath: row.album_save_path,
  }))
}
