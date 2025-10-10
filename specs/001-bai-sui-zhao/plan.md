# Implementation Plan: 百岁照生成功能

**Branch**: `001-bai-sui-zhao` | **Date**: 2025-10-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-bai-sui-zhao/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

HomeMemo百岁照生成功能旨在让家长能够基于婴儿照片快速生成多风格的百岁纪念照,替代传统影楼拍摄。核心流程:用户上传1-5张照片 → 选择预设风格(6种)→ 调用云端AI生成4张/风格 → 预览并保存至本地。技术方案基于**Next.js全栈 + Tauri桌面应用**架构,集成nano banana等云端AI生图服务,所有照片和生成结果仅本地存储,确保隐私。

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 14.2 (App Router) + Tauri 2.0 (PC桌面应用)
**Primary Dependencies**:
- Desktop Framework: @tauri-apps/api ^2.0.0, @tauri-apps/cli ^2.0.0
- Image Processing: sharp ^0.33.0 (backend), react-image-crop ^11.0.0 (frontend), face-api.js ^0.22.2
- Storage: better-sqlite3 ^9.4.0 (SQLite for Node.js)
- Network: axios ^1.6.0
- UI: shadcn/ui + Tailwind CSS 3.x + Lucide React
- State: zustand ^4.5.0
**Storage**: SQLite (via better-sqlite3) for metadata + Tauri FS API (应用数据目录) for 照片/生成结果
**Testing**: Vitest (unit) + React Testing Library (component) + Playwright (E2E)
**Target Platform**: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
**Project Type**: PC Desktop Application (Tauri + Next.js)
**Performance Goals**:
- 单张生成≤30秒 (依赖nano banana API响应时间)
- 照片上传预处理≤2秒 (包括裁剪、质量检测)
- 历史记录加载≤1秒 (20条记录)
- UI交互响应≤100ms
**Constraints**:
- 本地存储≤500MB (20次历史记录上限)
- 照片质量检测在生成前完成 (避免浪费API调用)
- 网络请求支持重试和超时处理 (30秒生成超时)
- 支持离线查看历史记录 (生成需联网)
**Scale/Scope**:
- 单用户应用 (无多用户/账号系统)
- 6种预设风格模板
- 支持1-5张照片上传/次
- 每次生成4张图片/风格
- 历史记录建议保留最近20次

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Privacy-First Architecture ✅ PASS

- **Requirement**: 所有照片和生成结果仅本地存储,不上传到外部服务器
- **Compliance**: spec.md FR-001/FR-011/FR-012明确本地存储;FR-014隐私声明告知临时传输
- **Validation**: 网络仅用于AI生成API调用(临时传输),结果保存本地;历史记录存储本地数据库

### Principle II: AI-Transparent with Privacy Protection ✅ PASS

- **Requirement**: 明确告知AI服务使用,提供进度可见性,隐私保护措施
- **Compliance**:
  - FR-005明确调用云端AI服务(nano banana API)
  - FR-006显示生成进度和预计时间
  - FR-014首次使用前隐私声明(照片仅生成时传输,不存储云端)
- **Validation**: 用户明确知晓使用云端AI,同意后才能生成

### Principle III: User Experience Over Technical Complexity ✅ PASS

- **Requirement**: 面向非技术用户,预设模板,智能默认,中文UI
- **Compliance**:
  - FR-002提供6种预设风格模板(无需用户编写Prompt)
  - FR-007相似度默认"中"档
  - spec.md所有用户故事以中文家长场景描述
  - 无高级模式需求(MVP阶段)
- **Validation**: 用户无需AI知识,选择风格即可生成

### Principle IV: Graceful Degradation & Error Recovery ✅ PASS

- **Requirement**: 优雅错误处理,重试机制,进度保存
- **Compliance**:
  - FR-004生成前照片质量验证
  - FR-010支持单张重新生成(不丢失其他结果)
  - FR-015明确错误提示和重试入口
  - Edge Cases覆盖网络中断、存储不足、AI失败等场景
- **Validation**: 失败场景有明确提示和恢复路径

### Principle V: Incremental Value Delivery ✅ PASS

- **Requirement**: 独立用户故事,P1→P2→P3优先级,独立可测试
- **Compliance**:
  - P1(快速生成单风格)是完整MVP
  - P2(多风格批量、裁剪重试)增强体验但不依赖
  - P3(历史记录)便利功能
  - 每个故事有独立测试方法
- **Validation**: P1实现后即可发布,P2/P3可独立迭代

### Privacy & Security Standards ✅ PASS

- **Sandboxed file access**: 移动应用沙盒机制天然满足
- **Secure deletion**: FR-013/FR-016支持删除历史和缓存
- **No personal telemetry**: 无分析需求,符合
- **Clear retention policies**: FR-014隐私声明覆盖

### Quality & Performance Standards ✅ PASS

- **Generation Time ≤30s**: SC-002明确目标
- **Failure Rate <5%**: SC-004目标95%成功率
- **Photo Quality Validation**: FR-004和Edge Cases明确
- **Resource Limits**: SC-010限制≤500MB,符合<2GB要求

**GATE STATUS: PASS** - 无宪章违规,可进入Phase 0研究

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Structure Decision**: Next.js 14 + Tauri 2.0 Desktop Application

```
HomeMemo/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router (Next.js 14)
│   │   ├── layout.tsx            # Root layout (中文字体配置)
│   │   ├── page.tsx              # 首页 (入口)
│   │   │
│   │   ├── upload/
│   │   │   └── page.tsx          # P1: 照片上传页面
│   │   │
│   │   ├── generation/
│   │   │   ├── style/
│   │   │   │   └── page.tsx      # P1: 风格选择
│   │   │   ├── progress/
│   │   │   │   └── page.tsx      # P1: 生成进度(轮询状态)
│   │   │   └── result/
│   │   │       └── page.tsx      # P1: 结果预览+保存
│   │   │
│   │   └── history/
│   │       └── page.tsx          # P3: 历史记录列表
│   │
│   ├── components/               # React组件
│   │   ├── ui/                   # shadcn/ui组件 (button, card, dialog等)
│   │   ├── PhotoCropper.tsx      # P2: react-image-crop封装
│   │   ├── StyleCard.tsx         # 风格卡片组件
│   │   ├── ProgressBar.tsx       # 生成进度条
│   │   └── ErrorDialog.tsx       # 错误提示对话框
│   │
│   ├── lib/                      # 业务逻辑层 (TypeScript)
│   │   ├── db.ts                 # better-sqlite3封装 (CRUD)
│   │   ├── api.ts                # nano banana axios client
│   │   ├── image.ts              # Sharp图片处理 + face-api.js
│   │   ├── validators.ts         # 照片质量验证逻辑
│   │   ├── store.ts              # Zustand状态管理
│   │   └── types.ts              # TypeScript类型定义
│   │
│   └── styles/
│       └── globals.css           # Tailwind CSS全局样式
│
├── src-tauri/                    # Tauri后端 (Rust)
│   ├── src/
│   │   ├── main.rs               # Tauri应用入口
│   │   ├── commands.rs           # 自定义Tauri命令
│   │   │                         # (文件系统操作、Sharp调用)
│   │   └── lib.rs
│   │
│   ├── Cargo.toml                # Rust依赖配置
│   ├── tauri.conf.json           # Tauri应用配置
│   │                             # (窗口大小、权限allowList)
│   └── icons/                    # 应用图标 (Windows/Mac/Linux)
│
├── public/
│   ├── styles/                   # 风格模板缩略图
│   │   ├── warm_home.jpg
│   │   ├── fresh_nature.jpg
│   │   ├── cartoon.jpg
│   │   ├── vintage.jpg
│   │   ├── dreamy.jpg
│   │   └── festival.jpg
│   └── face-models/              # face-api.js模型文件
│
├── tests/
│   ├── unit/
│   │   ├── db.test.ts            # SQLite CRUD测试
│   │   └── validators.test.ts    # 验证逻辑测试
│   ├── component/
│   │   └── StyleCard.test.tsx    # React组件测试
│   └── e2e/
│       └── user-stories/
│           ├── p1-generation.spec.ts  # Playwright E2E
│           └── p2-crop.spec.ts
│
├── next.config.ts                # Next.js配置 (output: 'export')
├── tailwind.config.ts            # Tailwind CSS配置
├── tsconfig.json                 # TypeScript配置 (strict mode)
├── package.json                  # npm依赖
├── .env.local                    # 环境变量 (API keys, gitignored)
└── README.md
```

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
