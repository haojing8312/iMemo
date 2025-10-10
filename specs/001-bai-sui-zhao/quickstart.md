# Quickstart Guide: 百岁照生成功能 (Next.js + Tauri)

**Feature**: 百岁照生成功能
**Target Audience**: 开发者 (Next.js + TypeScript + Tauri)
**Last Updated**: 2025-10-08
**Platform**: PC Desktop (Windows/Mac/Linux)

---

## Prerequisites

### Development Environment

- **Node.js**: 18.17+ or 20.x (LTS recommended)
- **pnpm**: 8.x+ (推荐) or npm 9.x+ or yarn 1.22+
- **Rust**: 1.70+ (for Tauri)
- **IDE**: VS Code with extensions:
  - Tauri
  - Rust Analyzer
  - ESLint
  - Tailwind CSS IntelliSense
- **Target Platforms**:
  - Windows: Windows 10+ with Visual Studio Build Tools
  - macOS: macOS 11+ with Xcode Command Line Tools
  - Linux: Ubuntu 20.04+ with build-essential

### System Requirements

- **Development Machine**:
  - 8GB RAM minimum, 16GB recommended
  - 10GB free disk space
  - C++ build tools installed

### Account Setup

1. **Nano Banana API**:
   - Register at `https://nanobanana.ai/signup` (假设)
   - Create API key in developer dashboard
   - Note your API key (will be stored in `.env.local`)

2. **Verify Tools Installation**:

```bash
# Check Node.js
node --version  # Should be 18.17+

# Check pnpm (or use npm/yarn)
pnpm --version  # Should be 8.x+

# Check Rust
rustc --version  # Should be 1.70+
cargo --version

# Check Tauri CLI (will install later)
```

---

## Project Setup (45 minutes)

### Step 1: Create Next.js Project

```bash
# Navigate to repository root
cd /path/to/HomeMemo

# Create Next.js 14 project with TypeScript
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Answer prompts:
# ✔ Would you like to use ESLint? … Yes
# ✔ Would you like to use Tailwind CSS? … Yes
# ✔ Would you like to use `src/` directory? … Yes
# ✔ Would you like to use App Router? … Yes
# ✔ Would you like to customize the default import alias? … No
```

### Step 2: Add Tauri to Next.js

```bash
# Install Tauri CLI
pnpm add -D @tauri-apps/cli

# Initialize Tauri (creates src-tauri/ directory)
pnpm tauri init

# Answer prompts:
# ✔ What is your app name? … HomeMemo
# ✔ What should the window title be? … HomeMemo - 百岁照生成
# ✔ Where are your web assets located? … out
# ✔ What is the url of your dev server? … http://localhost:3000
# ✔ What is your frontend dev command? … pnpm dev
# ✔ What is your frontend build command? … pnpm build
```

### Step 3: Configure Next.js for Tauri

Edit `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Static export for Tauri
  images: {
    unoptimized: true, // Tauri doesn't support next/image optimization
  },
  typescript: {
    strict: true,
  },
  // Remove trailing slashes
  trailingSlash: false,
};

export default nextConfig;
```

Edit `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "tauri": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Step 4: Install Dependencies

```bash
# Core dependencies
pnpm add @tauri-apps/api axios better-sqlite3 sharp zustand

# UI dependencies
pnpm add @radix-ui/react-dialog @radix-ui/react-progress lucide-react class-variance-authority clsx tailwind-merge

# Image processing
pnpm add react-image-crop face-api.js

# Dev dependencies
pnpm add -D @types/better-sqlite3 @types/node vitest @testing-library/react @testing-library/jest-dom @playwright/test autoprefixer postcss
```

### Step 5: Setup shadcn/ui

```bash
# Initialize shadcn/ui
pnpm dlx shadcn-ui@latest init

# Answer prompts:
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Slate
# ✔ Would you like to use CSS variables for colors? › Yes

# Add commonly used components
pnpm dlx shadcn-ui@latest add button card dialog progress input label
```

### Step 6: Configure Tauri

Edit `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devPath": "http://localhost:3000",
    "distDir": "../out"
  },
  "package": {
    "productName": "HomeMemo",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "exists": true,
        "createDir": true,
        "scope": ["$APPDATA/*"]
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "http": {
        "all": false,
        "request": true,
        "scope": ["https://api.nanobanana.ai/*"]
      },
      "path": {
        "all": true
      }
    },
    "windows": [
      {
        "title": "HomeMemo - 百岁照生成",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

### Step 7: Setup Environment Variables

Create `.env.local`:

```bash
NANO_BANANA_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_NAME=HomeMemo
```

Add to `.gitignore`:

```
.env.local
```

### Step 8: Configure TypeScript

Edit `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Implementation Workflow (P1 MVP - Week 1-4)

### Week 1: Core Setup & Database Layer

#### Day 1-2: Project Structure

```bash
# Create directory structure
mkdir -p src/app/{upload,generation/{style,progress,result},history}
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p tests/{unit,component,e2e}
mkdir -p public/styles
```

#### Day 3-4: Database Setup

Create `src/lib/db.ts`:

```typescript
import Database from 'better-sqlite3';
import { join } from 'path';
import { appDataDir } from '@tauri-apps/api/path';

let db: Database.Database | null = null;

export async function initDatabase() {
  if (db) return db;

  const appData = await appDataDir();
  const dbPath = join(appData, 'homememo.db');

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // Performance optimization

  // Create tables (from data-model.md)
  db.exec(`
    CREATE TABLE IF NOT EXISTS style_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      prompt_template TEXT NOT NULL,
      thumbnail_path TEXT,
      display_order INTEGER NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS photo_uploads (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      original_name TEXT,
      width INTEGER NOT NULL CHECK (width >= 512),
      height INTEGER NOT NULL CHECK (height >= 512),
      file_size INTEGER NOT NULL CHECK (file_size <= 10485760),
      format TEXT NOT NULL CHECK (format IN ('JPG', 'PNG')),
      uploaded_at INTEGER NOT NULL,
      is_cropped INTEGER NOT NULL DEFAULT 0,
      crop_ratio TEXT,
      crop_x REAL,
      crop_y REAL,
      crop_width REAL,
      crop_height REAL
    );

    CREATE TABLE IF NOT EXISTS generation_tasks (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'generating', 'success', 'failed')),
      similarity_level TEXT NOT NULL DEFAULT 'medium',
      selected_style_ids TEXT NOT NULL,
      photo_ids TEXT NOT NULL,
      error_message TEXT,
      total_images INTEGER NOT NULL,
      completed_images INTEGER NOT NULL DEFAULT 0
    );

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
      is_saved_to_album INTEGER NOT NULL DEFAULT 0,
      album_save_path TEXT,
      FOREIGN KEY(task_id) REFERENCES generation_tasks(id) ON DELETE CASCADE,
      FOREIGN KEY(style_id) REFERENCES style_templates(id)
    );

    CREATE INDEX IF NOT EXISTS idx_generation_tasks_created_at ON generation_tasks(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_generated_images_task_id ON generated_images(task_id);
  `);

  // Insert preset styles
  const styles = [
    {
      id: 'style_warm_home',
      name: '居家暖光温馨风',
      prompt_template: '帮我生成图片：去除杂乱背景,保持宝宝脸部不变...',
      display_order: 1,
      description: '温馨柔和的居家氛围'
    },
    // ... other 5 styles from PRD
  ];

  const insertStyle = db.prepare(`
    INSERT OR IGNORE INTO style_templates (id, name, prompt_template, display_order, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const style of styles) {
    insertStyle.run(style.id, style.name, style.prompt_template, style.display_order, style.description);
  }

  return db;
}

export function getDatabase() {
  if (!db) throw new Error('Database not initialized');
  return db;
}
```

#### Day 5-7: TypeScript Types & API Client

Create `src/lib/types.ts`:

```typescript
export interface PhotoUpload {
  id: string;
  filePath: string;
  originalName?: string;
  width: number;
  height: number;
  fileSize: number;
  format: 'JPG' | 'PNG';
  uploadedAt: number;
  isCropped: boolean;
  cropRatio?: '1:1' | '3:4' | '4:3';
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

export interface StyleTemplate {
  id: string;
  name: string;
  promptTemplate: string;
  thumbnailPath?: string;
  displayOrder: number;
  description?: string;
}

export interface GenerationTask {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: 'pending' | 'generating' | 'success' | 'failed';
  similarityLevel: 'high' | 'medium' | 'low';
  selectedStyleIds: string[];
  photoIds: string[];
  errorMessage?: string;
  totalImages: number;
  completedImages: number;
}

export interface GeneratedImage {
  id: string;
  taskId: string;
  styleId: string;
  sequenceNum: number;
  filePath: string;
  fileSize: number;
  width?: number;
  height?: number;
  createdAt: number;
  isSavedToAlbum: boolean;
  albumSavePath?: string;
}
```

Create `src/lib/api.ts`:

```typescript
import axios, { AxiosProgressEvent } from 'axios';

const client = axios.create({
  baseURL: 'https://api.nanobanana.ai/v1',
  timeout: 40000,
  headers: {
    'Authorization': `Bearer ${process.env.NANO_BANANA_API_KEY}`
  }
});

// Progress monitoring
client.interceptors.request.use(config => {
  if (config.onUploadProgress) {
    config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
      console.log(`Upload progress: ${percentCompleted}%`);
    };
  }
  return config;
});

// Auto retry (max 3 times)
client.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    if (!config || !config.retry) config.retry = 0;

    if (config.retry >= 3) return Promise.reject(error);

    config.retry += 1;
    await new Promise(resolve => setTimeout(resolve, 2000));
    return client(config);
  }
);

export async function generateImages(params: {
  photoPath: string;
  prompt: string;
  similarity?: string;
  onProgress?: (percent: number) => void;
}): Promise<{ taskId: string; images: string[] }> {
  const formData = new FormData();
  // Implementation details in contracts/nano_banana_api.md

  const response = await client.post('/generate', formData);
  return response.data;
}
```

### Week 2-3: UI Screens (P1 User Stories)

#### Upload Screen: `src/app/upload/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const router = useRouter();

  const handleSelectPhotos = async () => {
    const selected = await open({
      multiple: true,
      filters: [{
        name: 'Image',
        extensions: ['jpg', 'jpeg', 'png']
      }]
    });

    if (Array.isArray(selected)) {
      setSelectedPhotos(selected.slice(0, 5)); // Max 5 photos
    }
  };

  const handleNext = () => {
    if (selectedPhotos.length > 0) {
      router.push('/generation/style');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">上传宝宝照片</h1>

      <Card className="p-6 mb-6">
        <Button onClick={handleSelectPhotos} size="lg">
          选择照片 (最多5张)
        </Button>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {selectedPhotos.map((photo, index) => (
            <img key={index} src={photo} alt={`Photo ${index + 1}`} className="rounded-lg" />
          ))}
        </div>
      </Card>

      <Button onClick={handleNext} disabled={selectedPhotos.length === 0}>
        下一步：选择风格
      </Button>
    </div>
  );
}
```

#### Style Selection: `src/app/generation/style/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { getDatabase } from '@/lib/db';
import { StyleTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function StyleSelectionPage() {
  const [styles, setStyles] = useState<StyleTemplate[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>('');

  useEffect(() => {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM style_templates ORDER BY display_order').all() as any[];
    setStyles(rows);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">选择生成风格</h1>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {styles.map(style => (
          <Card
            key={style.id}
            className={`p-4 cursor-pointer ${selectedStyleId === style.id ? 'border-blue-500' : ''}`}
            onClick={() => setSelectedStyleId(style.id)}
          >
            <h3 className="text-xl font-semibold">{style.name}</h3>
            <p className="text-sm text-gray-600">{style.description}</p>
          </Card>
        ))}
      </div>

      <Button onClick={() => router.push('/generation/progress')} disabled={!selectedStyleId}>
        开始生成
      </Button>
    </div>
  );
}
```

### Week 4: Testing & Polish

#### Unit Tests: `tests/unit/db.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { initDatabase, getDatabase } from '@/lib/db';

describe('Database', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('should have 6 preset styles', () => {
    const db = getDatabase();
    const count = db.prepare('SELECT COUNT(*) as count FROM style_templates').get() as any;
    expect(count.count).toBe(6);
  });

  it('should insert and retrieve photo upload', () => {
    const db = getDatabase();
    const photoId = 'test_photo_1';

    db.prepare(`
      INSERT INTO photo_uploads (id, file_path, width, height, file_size, format, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(photoId, '/test/path.jpg', 1024, 768, 1000000, 'JPG', Date.now());

    const photo = db.prepare('SELECT * FROM photo_uploads WHERE id = ?').get(photoId);
    expect(photo).toBeDefined();
  });
});
```

Run tests:

```bash
pnpm vitest
```

---

## Running the App

### Development Mode

```bash
# Start Next.js dev server + Tauri window
pnpm tauri

# This will:
# 1. Start Next.js dev server on http://localhost:3000
# 2. Open Tauri window loading the Next.js app
# 3. Enable hot reload for both frontend and Tauri
```

### Build Production

```bash
# Build Next.js static export
pnpm build

# Build Tauri app (creates installer)
pnpm tauri:build

# Output locations:
# Windows: src-tauri/target/release/bundle/msi/HomeMemo_1.0.0_x64.msi
# macOS: src-tauri/target/release/bundle/dmg/HomeMemo_1.0.0_x64.dmg
# Linux: src-tauri/target/release/bundle/deb/homememo_1.0.0_amd64.deb
```

---

## Troubleshooting

### Common Issues

**Issue**: `Tauri command not found`
```bash
# Fix: Install Tauri CLI
pnpm add -D @tauri-apps/cli
```

**Issue**: `better-sqlite3 binary not found`
```bash
# Fix: Rebuild native module
pnpm rebuild better-sqlite3
```

**Issue**: `CORS error when calling nano banana API`
```bash
# Fix: Use Tauri HTTP plugin (already configured in tauri.conf.json allowlist)
```

**Issue**: `Window too small on startup`
```bash
# Fix: Edit src-tauri/tauri.conf.json → tauri.windows[0].width/height
```

---

## Performance Benchmarks (P1 MVP)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| App Startup | <2s | Time from click to window shown |
| Photo Upload | <2s | Tauri file dialog + validation |
| AI Generation | <30s | Nano banana API response time |
| History Load | <1s | SQLite query + render |
| Bundle Size | <15MB | Final installer size |

---

## Next Steps

After P1 MVP is complete:

1. **P2 Features** (Week 5-7):
   - Multi-style batch generation
   - Photo cropping with react-image-crop
   - Single image regeneration

2. **P3 Features** (Week 8):
   - History detail screen
   - Delete history with file cleanup

3. **Production Readiness**:
   - Error tracking (Sentry)
   - Auto-updater (Tauri Updater)
   - Code signing (Windows/Mac)

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3)
- [axios Documentation](https://axios-http.com/)

---

**Estimated Time to P1 MVP**: 4 weeks (1 developer)
**Estimated Time to Full Feature Set**: 8 weeks

**Questions?** Refer to `plan.md`, `research.md`, and `data-model.md` for detailed specifications.
