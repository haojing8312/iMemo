# Technical Research: 百岁照生成功能

**Feature**: 百岁照生成功能
**Date**: 2025-10-08 (Updated for PC Desktop)
**Purpose**: 解决Implementation Plan中的所有NEEDS CLARIFICATION项
**Platform**: PC桌面应用 (Windows/Mac/Linux)

---

## 1. Platform & Technology Stack Decision

### Decision

**Next.js 14 (App Router) + TypeScript 5.x + Tauri 2.0** (PC桌面全栈应用)

### Rationale

1. **Next.js 14优势**:
   - 全栈框架,前后端统一技术栈(TypeScript)
   - App Router提供现代化路由和Server Actions
   - 内置图片优化(next/image)
   - React Server Components减少客户端bundle
   - 丰富的生态系统(图片处理、UI组件库)

2. **Tauri 2.0优势**:
   - **轻量级**: 打包体积~10MB(vs Electron 50MB+)
   - **高性能**: Rust后端,系统级API调用快
   - **安全性**: allowList权限控制,比Electron更安全
   - **跨平台**: 单一代码库支持Windows/Mac/Linux
   - **Web技术**: 使用系统WebView,无需打包Chromium

3. **TypeScript 5.x**:
   - 类型安全,减少运行时错误
   - 更好的IDE支持(VS Code智能提示)
   - 与Next.js深度集成
   - 前后端类型共享

### Alternatives Considered

| 方案 | 优势 | 劣势 | 为何未选择 |
|------|------|------|------------|
| Electron + Next.js | 成熟度高,社区资源多 | 打包体积大(>50MB),内存占用高 | 用户体验差(启动慢,占内存) |
| Flutter Desktop | 原生性能好 | Web技术栈不通用,学习成本高 | 团队熟悉度低,生态不如Next.js |
| Pure Web App (SPA) | 部署简单 | 无法访问本地文件系统,隐私保护弱 | 不符合Constitution(本地存储要求) |

### Implementation Notes

- **Target Platforms**: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
- **开发工具**: VS Code with Tauri + Next.js extensions
- **打包工具**: Tauri CLI
- **最小系统要求**: 4GB RAM, 500MB磁盘空间

---

## 2. Next.js Setup & Architecture

### Decision

- **Next.js Version**: 14.2+ (App Router)
- **Rendering Strategy**: Hybrid (SSR for dynamic + Static for assets)
- **API Layer**: Next.js Server Actions + API Routes
- **State Management**: React Context + Zustand (轻量级)

### Rationale

1. **App Router**: 相比Pages Router更现代,支持Streaming SSR和Partial Prerendering
2. **Server Actions**: 类型安全的RPC调用,无需手写fetch
3. **Hybrid Rendering**: 照片列表SSR(动态),风格模板Static(预渲染)
4. **Zustand**: 比Redux轻量,比Context性能好,适合桌面应用状态管理

### Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // 静态导出,供Tauri加载
  images: {
    unoptimized: true, // Tauri不支持next/image优化
  },
  typescript: {
    strict: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 支持照片上传
    },
  },
};

export default nextConfig;
```

### Alternatives Considered

| 方案 | 优势 | 劣势 | 为何未选择 |
|------|------|------|------------|
| Pages Router | 稳定性好,资料多 | 不支持Server Actions,路由能力弱 | App Router是未来方向 |
| Redux | 功能强大,DevTools好用 | 代码量大,桌面应用过度设计 | Zustand足够轻量 |
| Remix | 性能好,嵌套路由强 | 生态不如Next.js,Tauri集成案例少 | Next.js更成熟 |

---

## 3. Storage Solution

### Decision

**better-sqlite3** (同步SQLite库 for Node.js)

### Rationale

1. **性能**: 比异步SQLite快2-3倍(无异步开销)
2. **简单**: 同步API,代码更直观
3. **可靠**: 久经考验,npm周下载200万+
4. **桌面友好**: 直接写入本地文件,无跨域限制
5. **类型安全**: 结合TypeScript定义schema

### Schema Design (与移动版一致)

```sql
-- 4个核心表(与data-model.md保持一致)
CREATE TABLE style_templates (...);
CREATE TABLE photo_uploads (...);
CREATE TABLE generation_tasks (...);
CREATE TABLE generated_images (...);
```

### Alternatives Considered

| 方案 | 优势 | 劣势 | 为何未选择 |
|------|------|------|------------|
| IndexedDB | 浏览器原生,无依赖 | 异步API复杂,查询能力弱 | 桌面应用应该用更强大的数据库 |
| LowDB (JSON) | 极简,零配置 | 不支持复杂查询,大数据性能差 | 20条历史记录已接近极限 |
| PostgreSQL | 功能强大 | 需要独立进程,桌面应用过重 | SQLite足够 |

### Implementation Notes

```typescript
// lib/db.ts
import Database from 'better-sqlite3';
import { join } from 'path';
import { app } from '@tauri-apps/api';

const dbPath = await app.appDataDir(); // Tauri提供的应用数据目录
const db = new Database(join(dbPath, 'homememo.db'));

db.pragma('journal_mode = WAL'); // 性能优化
```

---

## 4. Image Processing

### Decision

**Frontend**: react-image-crop (裁剪UI) + face-api.js (人脸检测)
**Backend**: Sharp (Node.js图片处理)

### Rationale

1. **react-image-crop**:
   - React组件,集成简单
   - 支持1:1/3:4/4:3比例裁剪(符合FR-003)
   - 触摸+鼠标双支持

2. **face-api.js**:
   - TensorFlow.js模型,浏览器端运行
   - 检测人脸位置、数量(符合FR-004质量验证)
   - 无需后端调用,隐私保护

3. **Sharp**:
   - 最快的Node.js图片处理库(libvips)
   - 格式转换(HEIC→JPG)、分辨率检测
   - 在Tauri Rust层调用(通过Node.js bridge)

### Alternatives Considered

| 方案 | 优势 | 劣势 | 为何未选择 |
|------|------|------|------------|
| Cropper.js | 功能强大 | 不是React组件,集成复杂 | react-image-crop更现代 |
| Jimp | 纯JS实现 | 性能远低于Sharp(10x慢) | 桌面应用应该用原生库 |
| OpenCV.js | 功能最全 | 体积大(>8MB),加载慢 | face-api.js足够 |

### Implementation Notes

```typescript
// 前端:人脸检测
import * as faceapi from 'face-api.js';

const detectFaces = async (imageElement: HTMLImageElement) => {
  const detections = await faceapi.detectAllFaces(imageElement);
  return detections.length > 0; // 至少检测到1张脸
};

// 后端:图片处理(Tauri Command)
#[tauri::command]
async fn resize_image(path: String) -> Result<Vec<u8>, String> {
  // 使用Sharp处理
}
```

---

## 5. AI API Integration

### Decision

**axios 1.6+** (HTTP client) + **Tauri HTTP Plugin**

### Rationale

1. **axios**:
   - Promise-based,async/await友好
   - 拦截器支持进度监听(符合FR-006)
   - 自动错误重试(符合Principle IV)
   - TypeScript类型定义完善

2. **Tauri HTTP Plugin**:
   - 绕过浏览器CORS限制
   - 更安全(不暴露API key到前端)
   - 支持文件上传(multipart/form-data)

### Implementation

```typescript
// lib/api.ts
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.nanobanana.ai/v1',
  timeout: 40000,
  headers: { 'Authorization': `Bearer ${process.env.NANO_BANANA_API_KEY}` },
});

// 进度监听
client.interceptors.request.use(config => {
  config.onUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    console.log(`Upload: ${percentCompleted}%`);
  };
  return config;
});

// 错误重试(最多3次)
client.interceptors.response.use(null, async (error) => {
  const config = error.config;
  if (!config || !config.retry) config.retry = 0;

  if (config.retry >= 3) return Promise.reject(error);

  config.retry += 1;
  await new Promise(resolve => setTimeout(resolve, 2000)); // 延迟2秒
  return client(config);
});
```

### Alternatives Considered

| 方案 | 优势 | 劣势 | 为何未选择 |
|------|------|------|------------|
| Fetch API | 原生,无依赖 | 无拦截器,进度监听复杂 | 功能不如axios |
| SWR/TanStack Query | 缓存机制好 | 针对GET请求优化,POST(生成)不适用 | axios更直接 |

---

## 6. Desktop Features (Tauri-Specific)

### Decision

- **文件选择**: Tauri Dialog API
- **文件系统**: Tauri FS API (读写应用数据目录)
- **系统托盘**: 可选(后续P4功能)
- **自动更新**: Tauri Updater (生产环境)

### Implementation

```typescript
// Tauri文件选择
import { open } from '@tauri-apps/api/dialog';

const selectedFiles = await open({
  multiple: true,
  filters: [{
    name: 'Image',
    extensions: ['jpg', 'jpeg', 'png']
  }]
});

// Tauri文件系统
import { appDataDir, join } from '@tauri-apps/api/path';
import { writeBinaryFile } from '@tauri-apps/api/fs';

const appData = await appDataDir();
const savePath = await join(appData, 'photos', 'photo.jpg');
await writeBinaryFile(savePath, photoData);
```

### Rationale

- **原生对话框**: 用户体验比Web file input好
- **沙盒访问**: 符合Constitution Privacy原则
- **自动更新**: 后续可无缝推送新版本

---

## 7. UI Framework & Styling

### Decision

- **UI组件库**: shadcn/ui (基于Radix UI + Tailwind CSS)
- **CSS方案**: Tailwind CSS 3.x
- **图标**: Lucide React
- **字体**: 思源黑体(Noto Sans SC) for 中文

### Rationale

1. **shadcn/ui**:
   - Copy-paste组件,无npm依赖
   - 完全可定制,符合品牌设计
   - Accessibility好,符合WCAG标准
   - TypeScript原生支持

2. **Tailwind CSS**:
   - Utility-first,开发速度快
   - 打包体积小(PurgeCSS自动移除未用样式)
   - 暗色模式支持(后续功能)

### Implementation Notes

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog progress
```

---

## 8. Testing Framework

### Decision

- **Unit Tests**: Vitest (比Jest快5-10x)
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright (Tauri官方推荐)
- **Type Checking**: TypeScript strict mode

### Rationale

1. **Vitest**: Vite原生,与Next.js兼容,速度快
2. **Playwright**: 支持Tauri桌面应用E2E测试
3. **TypeScript strict**: 编译时捕获大量错误

### Example

```typescript
// tests/storage.test.ts
import { describe, it, expect } from 'vitest';
import { saveTask, getRecentTasks } from '@/lib/db';

describe('StorageService', () => {
  it('should save and retrieve tasks', async () => {
    const task = { id: 'task_123', ... };
    await saveTask(task);
    const tasks = await getRecentTasks();
    expect(tasks[0].id).toBe('task_123');
  });
});
```

---

## 9. Resolved Clarifications Summary

| Original Question | Decision | Source |
|-------------------|----------|--------|
| Language/Version | TypeScript 5.x + Next.js 14 + Tauri 2.0 | Research §1 |
| Primary Dependencies | axios, better-sqlite3, sharp, react-image-crop, face-api.js | Research §4-5 |
| Storage | SQLite via better-sqlite3 | Research §3 |
| Testing | Vitest + React Testing Library + Playwright | Research §8 |
| Target Platform | Windows 10+, macOS 11+, Linux | Research §1 |
| Project Type | PC Desktop Application (Tauri) | Research §1 |

---

## 10. Technology Stack Summary

```json
// package.json (simplified)
{
  "name": "homememo",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "tauri": "tauri dev",
    "tauri:build": "tauri build"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tauri-apps/api": "^2.0.0",
    "axios": "^1.6.0",
    "better-sqlite3": "^9.4.0",
    "sharp": "^0.33.0",
    "react-image-crop": "^11.0.0",
    "face-api.js": "^0.22.2",
    "zustand": "^4.5.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.41.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Estimated Bundle Size**: ~15MB (vs Flutter ~25MB, vs Electron ~60MB)

---

## 11. Project Structure (Next.js + Tauri)

```
HomeMemo/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 首页
│   │   ├── upload/
│   │   │   └── page.tsx          # P1: 照片上传
│   │   ├── generation/
│   │   │   ├── style/page.tsx    # P1: 风格选择
│   │   │   ├── progress/page.tsx # P1: 生成进度
│   │   │   └── result/page.tsx   # P1: 结果预览
│   │   └── history/
│   │       └── page.tsx          # P3: 历史记录
│   │
│   ├── components/               # React组件
│   │   ├── ui/                   # shadcn/ui组件
│   │   ├── PhotoCropper.tsx      # P2: 裁剪组件
│   │   ├── StyleCard.tsx
│   │   └── ProgressBar.tsx
│   │
│   ├── lib/                      # 业务逻辑
│   │   ├── db.ts                 # better-sqlite3封装
│   │   ├── api.ts                # nano banana API
│   │   ├── image.ts              # Sharp图片处理
│   │   └── validators.ts         # 质量检测
│   │
│   └── styles/
│       └── globals.css           # Tailwind CSS
│
├── src-tauri/                    # Tauri后端(Rust)
│   ├── src/
│   │   ├── main.rs               # Tauri入口
│   │   └── commands.rs           # 自定义命令(文件系统操作)
│   ├── Cargo.toml
│   └── tauri.conf.json           # Tauri配置
│
├── public/
│   └── styles/                   # 风格模板缩略图
│
├── tests/
│   ├── unit/
│   ├── component/
│   └── e2e/
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 12. Next Steps for Phase 1

With all clarifications resolved:

1. ✅ Update `plan.md` Technical Context with Next.js stack
2. → Update `data-model.md` (SQLite schema保持不变)
3. → Update `contracts/nano_banana_api.md` (axios实现)
4. → Generate `quickstart.md` with Next.js + Tauri setup
5. → Update agent context

**Phase 0 Complete (Next.js版)** - Ready for Phase 1 Design
