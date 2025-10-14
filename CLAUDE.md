# HomeMemo Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-08

## Language Preference

**IMPORTANT**: Always respond in Chinese (中文) when communicating with the user. Code, technical terms, file paths, and command examples should remain in English, but all explanations, descriptions, and conversational text must be in Chinese.

## Active Technologies

- Electron / Tauri (desktop application framework)
- AI Image Generation (local model integration)
- JavaScript/TypeScript (application development)

## Project Structure

```
src/
  ├── main/           # 主进程（后端逻辑）
  ├── renderer/       # 渲染进程（前端界面）
  ├── preload/        # 预加载脚本
  └── utils/          # 共享工具函数
public/               # 静态资源
tests/                # 测试文件
docs/                 # 文档
```

## Commands

```bash
# 开发模式服務啓動命令
pnpm tauri dev

# 构建生产版本
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

## Code Style

- JavaScript/TypeScript: Follow Airbnb style guide
- Use ESLint and Prettier for code formatting
- Prefer functional programming patterns
- Use async/await over promises
- Add JSDoc comments for public APIs
- **All code comments must be in Chinese (所有代码注释必须使用中文)**

## Recent Changes

- bainian-photo-generation: Added AI-powered baby photo generation feature with local-first privacy

## Privacy & Security Principles

- All user photos and generated images are stored locally only
- No network upload of user data
- No telemetry or tracking
- Explicit user consent for any data operations

## Performance Requirements

- Single image generation: ≤ 30 seconds
- UI response time: < 100ms
- Application startup: < 3 seconds
- Memory usage: < 500MB during idle

<!-- MANUAL ADDITIONS START -->
<!-- Add your custom guidelines here -->
<!-- MANUAL ADDITIONS END -->
