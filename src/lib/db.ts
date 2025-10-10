// SQLite database initialization and CRUD operations
// Uses better-sqlite3 for synchronous operations

import Database from 'better-sqlite3'
import { appDataDir, join } from '@tauri-apps/api/path'
import type {
  PhotoUpload,
  StyleTemplate,
  GenerationTask,
  GeneratedImage,
} from './types'

let db: Database.Database | null = null

/**
 * Initialize database connection and create schema
 */
export async function initDatabase(): Promise<Database.Database> {
  if (db) return db

  // Get Tauri app data directory
  const appData = await appDataDir()
  const dbPath = await join(appData, 'homememo.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL') // Performance optimization

  // Create tables in order (respecting foreign keys)
  createTables(db)
  insertPresetStyles(db)

  return db
}

/**
 * Create database schema (T013)
 */
function createTables(db: Database.Database) {
  // Style Templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS style_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      prompt_template TEXT NOT NULL,
      thumbnail_path TEXT,
      display_order INTEGER NOT NULL CHECK (display_order >= 1 AND display_order <= 6),
      description TEXT
    );
  `)

  // Photo Uploads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS photo_uploads (
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
  `)

  // Generation Tasks table
  db.exec(`
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

  // Generated Images table
  db.exec(`
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

  // Create indexes (T014)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_photo_uploads_uploaded_at ON photo_uploads(uploaded_at DESC);
    CREATE INDEX IF NOT EXISTS idx_generation_tasks_created_at ON generation_tasks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_generation_tasks_status ON generation_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_generated_images_task_id ON generated_images(task_id);
    CREATE INDEX IF NOT EXISTS idx_generated_images_style_id ON generated_images(style_id, sequence_num);
    CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_task_style_seq ON generated_images(task_id, style_id, sequence_num);
  `)
}

/**
 * Insert 6 preset style templates (T015)
 */
function insertPresetStyles(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as count FROM style_templates').get() as { count: number }

  if (count.count > 0) {
    return // Already populated
  }

  const insert = db.prepare(`
    INSERT INTO style_templates (id, name, prompt_template, thumbnail_path, display_order, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

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
    insert.run(
      style.id,
      style.name,
      style.prompt,
      style.thumbnail,
      style.order,
      style.description
    )
  }
}

/**
 * Get database instance (must call initDatabase first)
 */
export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

// =============================================================================
// PhotoUpload CRUD (T026)
// =============================================================================

export function insertPhotoUpload(photo: Omit<PhotoUpload, 'id'>): PhotoUpload {
  const db = getDb()
  const id = crypto.randomUUID()

  const insert = db.prepare(`
    INSERT INTO photo_uploads (
      id, file_path, original_name, width, height, file_size, format,
      uploaded_at, is_cropped, crop_ratio, crop_x, crop_y, crop_width, crop_height
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insert.run(
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
    photo.cropHeight || null
  )

  return { id, ...photo }
}

export function findPhotoById(id: string): PhotoUpload | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM photo_uploads WHERE id = ?').get(id) as any

  if (!row) return null

  return {
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
  }
}

export function deletePhotoUpload(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM photo_uploads WHERE id = ?').run(id)
}

// =============================================================================
// StyleTemplate queries (T029)
// =============================================================================

export function findAllStyles(): StyleTemplate[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM style_templates ORDER BY display_order').all() as any[]

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    promptTemplate: row.prompt_template,
    thumbnailPath: row.thumbnail_path,
    displayOrder: row.display_order,
    description: row.description,
  }))
}

export function findStyleById(id: string): StyleTemplate | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM style_templates WHERE id = ?').get(id) as any

  if (!row) return null

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
// GenerationTask CRUD (T027)
// =============================================================================

export function insertGenerationTask(task: Omit<GenerationTask, 'id' | 'createdAt' | 'updatedAt'>): GenerationTask {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = Date.now()

  const insert = db.prepare(`
    INSERT INTO generation_tasks (
      id, created_at, updated_at, status, similarity_level,
      selected_style_ids, photo_ids, error_message,
      total_images, completed_images
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insert.run(
    id,
    now,
    now,
    task.status,
    task.similarityLevel,
    JSON.stringify(task.selectedStyleIds),
    JSON.stringify(task.photoIds),
    task.errorMessage || null,
    task.totalImages,
    task.completedImages
  )

  return {
    id,
    createdAt: now,
    updatedAt: now,
    ...task,
  }
}

export function updateTaskStatus(id: string, status: TaskStatus, errorMessage?: string): void {
  const db = getDb()
  const now = Date.now()

  db.prepare(`
    UPDATE generation_tasks
    SET status = ?, updated_at = ?, error_message = ?
    WHERE id = ?
  `).run(status, now, errorMessage || null, id)
}

export function updateTaskProgress(id: string, completedImages: number): void {
  const db = getDb()
  const now = Date.now()

  db.prepare(`
    UPDATE generation_tasks
    SET completed_images = ?, updated_at = ?
    WHERE id = ?
  `).run(completedImages, now, id)
}

export function findTaskById(id: string): GenerationTask | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM generation_tasks WHERE id = ?').get(id) as any

  if (!row) return null

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

export function deleteTask(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM generation_tasks WHERE id = ?').run(id)
}

// =============================================================================
// GeneratedImage CRUD (T028)
// =============================================================================

export function insertGeneratedImage(image: Omit<GeneratedImage, 'id' | 'createdAt'>): GeneratedImage {
  const db = getDb()
  const id = crypto.randomUUID()
  const now = Date.now()

  const insert = db.prepare(`
    INSERT INTO generated_images (
      id, task_id, style_id, sequence_num, file_path, file_size,
      width, height, created_at, is_saved_to_album, album_save_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insert.run(
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
    image.albumSavePath || null
  )

  return {
    id,
    createdAt: now,
    ...image,
  }
}

export function findImagesByTaskId(taskId: string): GeneratedImage[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT * FROM generated_images
    WHERE task_id = ?
    ORDER BY style_id, sequence_num
  `).all(taskId) as any[]

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

export function updateImageSaveStatus(id: string, albumSavePath: string): void {
  const db = getDb()
  db.prepare(`
    UPDATE generated_images
    SET is_saved_to_album = 1, album_save_path = ?
    WHERE id = ?
  `).run(albumSavePath, id)
}

export function deleteGeneratedImage(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM generated_images WHERE id = ?').run(id)
}
