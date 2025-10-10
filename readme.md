# iMemo

> **有爱（AI）的记忆** - 您的智能家庭相册管家

iMemo 是一个注重隐私保护的 AI 原生相册应用，致力于为个人和家庭提供智能化的照片管理和创意生成服务。所有数据本地存储，绝不上传云端，让您的珍贵记忆安全无忧。

[![License: Dual](https://img.shields.io/badge/License-Community%20%26%20Commercial-blue.svg)](./LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-blue.svg)](https://tauri.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

## ✨ 产品愿景

### 🎯 第一阶段：AI 艺术照生成（当前版本）
- ✅ 基于 SeeDream 4.0 超强图生图 AI 模型
- ✅ 参考个人照片，自动生成人生各阶段艺术照
- ✅ 支持多种艺术风格（婚纱照、百日照、周岁照等）
- ✅ 节省照相馆成本，随时随地创作奇幻照片
- ✅ 100% 本地处理，保护隐私安全

### 🎯 第二阶段：智能相册管理（规划中）
- 📋 家庭成员照片分类管理
- 📋 批量导入照片一键分类
- 📋 AI 自动打标（人物、场景、时间、地点）
- 📋 智能搜索与筛选
- 📋 旅行相册自动整理

### 🎯 第三阶段：创意内容生成（未来计划）
- 📋 自动生成影集（Photo Book）
- 📋 AI 视频剪辑与配乐
- 📋 智能故事叙述
- 📋 节日祝福卡片生成
- 📋 家庭成长记录可视化

## 🚀 核心特性

### 当前功能（v0.1.0）

- **🎨 多风格艺术照生成**
  - 支持婚纱照、百日照、周岁照、毕业照等 20+ 种风格
  - 每种风格生成 4 张高质量图片
  - 实时进度显示，支持部分成功

- **🔒 隐私保护优先**
  - 所有照片本地存储，绝不上传
  - AI 处理在本地或指定 API 完成
  - 用户完全掌控数据

- **⚡ 智能重试机制**
  - 自动重试失败任务（指数退避）
  - 部分失败不影响成功图片展示
  - 友好的错误提示和恢复建议

- **💾 灵活导出**
  - 快速下载到本地
  - 保存到系统相册
  - 批量导出收藏项

- **❤️ 收藏管理**
  - 一键收藏喜欢的照片
  - 按风格分类浏览
  - 独立的收藏夹视图

## 🛠️ 技术栈

- **前端框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **桌面框架**: [Tauri 2.x](https://tauri.app/)
- **UI 组件**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs/)
- **AI 模型**: [SeeDream 4.0](https://www.volcengine.com/docs/6791/1308296) (BytePlus)
- **语言**: TypeScript + Rust
- **构建工具**: pnpm + Vite

## 📦 安装使用

### 系统要求

- Windows 10/11, macOS 10.15+, 或 Linux
- 4GB+ RAM（推荐 8GB）
- 2GB+ 可用磁盘空间

### 开发环境

1. **克隆仓库**
```bash
git clone https://github.com/yourusername/imemo.git
cd imemo
```

2. **安装依赖**
```bash
pnpm install
```

3. **启动开发服务器**
```bash
pnpm tauri dev
```

应用启动后，首次使用前请在设置页面配置 SeeDream API Key。

### 生产构建

```bash
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/`

## 📖 使用指南

### 0. 首次配置（必需）
- 启动应用后，点击右上角"设置"图标
- 在设置页面输入您的 SeeDream API Key
- API Key 将安全保存在本地，不会上传到任何服务器
- 获取 API Key: [火山引擎 - SeeDream API](https://www.volcengine.com/docs/6791/1308296)

### 1. 上传照片
- 点击"上传照片"选择个人照片
- 支持 JPG、PNG 格式
- 建议使用清晰的正面照片

### 2. 选择人生阶段
- 选择要生成的纪念照类型（如"结婚"、"百日照"）
- 每个阶段包含多种精选艺术风格

### 3. 挑选风格
- 浏览风格预览图
- 可选择 1-10 种风格同时生成
- 每种风格生成 4 张图片

### 4. AI 生成
- 实时查看生成进度
- 支持部分成功（即使某些图片失败，成功的也会展示）
- 自动重试失败任务

### 5. 查看结果
- 按风格分类浏览生成的图片
- 收藏喜欢的照片
- 下载或保存到系统相册

## 🔐 隐私承诺

iMemo 将隐私保护作为核心设计原则：

- ✅ **本地存储**: 所有照片和生成结果仅保存在您的设备
- ✅ **无遥测**: 不收集任何用户行为数据
- ✅ **透明 API**: AI 生成通过用户配置的 API 完成，可自建服务
- ✅ **开源**: 代码完全开源，接受社区审计

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 开发规范

请参考 [CLAUDE.md](./CLAUDE.md) 了解详细的开发指南：

- 所有注释和用户交流使用中文
- 代码风格遵循 ESLint + Prettier
- 提交信息遵循 Conventional Commits
- 优先使用函数式编程范式

## 🗺️ 路线图

- [x] ✅ **v0.1.0** - AI 艺术照生成核心功能
  - [x] SeeDream 4.0 集成
  - [x] 多风格批量生成
  - [x] 收藏与导出功能
  - [x] 重试机制与部分成功支持

- [ ] 🚧 **v0.2.0** - 智能相册管理
  - [ ] 照片批量导入
  - [ ] 人脸识别与自动分类
  - [ ] 场景标签自动生成
  - [ ] 智能搜索引擎

- [ ] 📅 **v0.3.0** - 创意内容生成
  - [ ] 影集自动排版
  - [ ] 视频剪辑与配乐
  - [ ] 节日卡片生成

- [ ] 📅 **v1.0.0** - 正式版
  - [ ] 移动端支持（iOS/Android）
  - [ ] 云同步（可选）
  - [ ] 家庭共享功能

## 📄 许可证

iMemo 采用 **双重许可模式**：

- **🆓 社区许可证（Community License）**: 个人用户永久免费使用所有功能
- **💼 商业许可证（Commercial License）**: 企业/团队部署、代码修改、商业集成需购买

**个人用户（免费）可以：**
- ✅ 永久免费使用所有标准功能
- ✅ 生成的内容可用于个人或商业项目
- ✅ 无需购买许可证

**企业/组织用户需要商业许可证：**
- 🏢 团队部署（多用户同时使用）
- 🔧 源代码修改或二次开发
- 📦 嵌入到您的商业产品中
- 🛡️ 需要官方技术支持和质保

详细信息请查看 [LICENSE](LICENSE) 文件。

**商业许可咨询**: haojing8312@gmail.com

## 💬 联系方式

- 问题反馈: [GitHub Issues](https://github.com/yourusername/imemo/issues)
- 功能建议: [GitHub Discussions](https://github.com/yourusername/imemo/discussions)

---

**iMemo** - 用 AI 守护每一个珍贵瞬间 ❤️
