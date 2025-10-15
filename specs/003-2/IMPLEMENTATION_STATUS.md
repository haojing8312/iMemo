# 003-2 多人照片生成功能 - 实施状态

**更新时间**: 2025-10-15
**分支**: `003-2`
**总进度**: 10/35 任务完成 (29%)

## ✅ 已完成 (Phase 1-2 + 部分 Phase 3)

### Phase 1: Setup & Infrastructure (T001-T003) ✓
- ✅ T001: 环境初始化 (Node 22.18, pnpm 10.17, Rust 1.89, Tauri 2.8.5)
- ✅ T002: face-api.js 模型文件已下载到 `public/face-models/`
- ✅ T003: 环境变量配置完成 (Seedream API)

### Phase 2: Foundational Prerequisites (T004-T006) ✓
- ✅ T004: 数据库 schema migration 完成
  - `library_photos`: 添加 `face_count`, `face_confidence`, `quality_score`, `is_ai_generated`, `ai_metadata`
  - `generation_tasks`: 添加 `mode` ('single'|'multi')
  - `style_templates`: 添加 `supported_modes`, `min_photos`, `max_photos`, `is_multi_person`
  - 新增7个索引用于性能优化
  - 文件: `src/lib/database.ts:38-210`

- ✅ T005: 核心类型定义完成
  - `GenerationMode = 'single' | 'multi'`
  - `FaceValidationResult` 接口
  - `AlbumFilter` 接口
  - `PhotoUpload`, `StyleTemplate`, `GenerationTask`, `AIPhotoMetadata` 扩展
  - 文件: `src/lib/types.ts`

- ✅ T006: Zustand store 扩展完成
  - 添加 `generationMode: GenerationMode` 状态
  - 添加 `photoValidationResults: Map<string, FaceValidationResult>` 缓存
  - 实现 `setGenerationMode`, `setPhotoValidationResult`, `clearValidationResults` actions
  - 文件: `src/lib/store.ts`

### Phase 3: US1 单人照片生成 (T007-T010 部分完成)
- ✅ T007: 生成模式配置模块
  - 创建 `GENERATION_MODES` 配置对象(single/multi)
  - 实现 `getModeConfig`, `validatePhotoCount`, `suggestMode` 工具函数
  - 文件: `src/lib/generationModeConfig.ts`

- ✅ T008: 模式选择页面 UI
  - 创建 `/generation/mode` 页面
  - 卡片式模式选择界面(单人/多人)
  - 集成 Lucide icons (User/Users)
  - 更新主页跳转流程: 主页 → 模式选择 → 照片上传
  - 文件: `src/app/generation/mode/page.tsx`, `src/app/page.tsx:63`

- ✅ T009: 风格配置支持多人标记
  - 更新 `StyleSchema` 添加 `supportedModes`, `minPhotos`, `maxPhotos`, `isMultiPerson` 字段
  - 文件: `src/lib/types/style.ts:13-16`

- ✅ T010: 风格服务支持模式筛选
  - 实现 `getStylesByMode(mode, collection)` 函数
  - 实现 `getCompatibleStylesByMode(milestoneId, mode, collection)` 函数
  - 默认规则: 未定义 `supportedModes` 的风格默认支持单人模式
  - 文件: `src/lib/styleService.ts:135-180`

---

## 🚧 待完成任务

### Phase 3: US1 单人照片生成 (T011-T012)
- ⏸️ **T011**: 修改风格选择页添加模式筛选
  - 需要修改: `src/app/generation/style/page.tsx`
  - 使用 `getCompatibleStylesByMode(milestoneId, generationMode)` 替代 `getCompatibleStyles(milestoneId)`
  - 在UI上显示当前模式(单人/多人)

- ⏸️ **T012**: 测试单人模式端到端流程
  - 手动测试流程: 主页 → 模式选择(单人) → 上传照片 → 里程碑 → 风格 → 生成
  - 验证数据库 `generation_tasks.mode = 'single'`
  - 验证 AI 照片的 `ai_metadata.generationMode = 'single'`

### Phase 4: US2 多人上传模式 (T013-T018) 🔥 **关键**
- ⏸️ **T013**: 实现 face-api.js 人脸检测服务
  - 创建 `src/lib/faceDetectionService.ts`
  - 实现 `loadFaceDetectionModels()` - 加载 TinyFaceDetector + FaceLandmark68Net
  - 实现 `validateSinglePersonPhoto(filePath): FaceValidationResult`
  - 配置: `scoreThreshold: 0.5`, `inputSize: 512`
  - 参考: `specs/003-2/contracts/photo-validation-api.md`

- ⏸️ **T014**: 修改上传页面集成人脸检测
  - 修改 `src/app/generation/select-photo/page.tsx` 或 `src/app/upload/page.tsx`
  - 在照片上传后调用 `validateSinglePersonPhoto()`
  - 根据 `generationMode` 决定是否启用验证
  - 单人模式: 只允许包含1个人脸的照片
  - 多人模式: 允许包含≥1个人脸的照片
  - UI显示验证结果(✓通过 / ✗不符合要求 + 错误信息)

- ⏸️ **T015**: 应用启动时加载人脸检测模型
  - 在 `src/app/layout.tsx` 或主入口调用 `loadFaceDetectionModels()`
  - 添加加载状态和错误处理

- ⏸️ **T016**: 修改任务服务支持多人模式
  - 修改 `src/lib/taskService.ts` 的 `createTask()` 函数
  - 在创建任务时保存 `mode` 字段到数据库
  - 修改 `insertGenerationTask()` 调用传递 `mode` 参数

- ⏸️ **T017**: 修改 Seedream API 支持多图数组 🔥 **高风险**
  - 修改 API 调用代码(可能在 `src/lib/seedreamService.ts` 或类似文件)
  - 单人模式: 传递 `image_base64: [base64_1, base64_2, ...]` (多张同一人照片)
  - 多人模式: 传递 `image_base64: [person1_base64, person2_base64, ...]` (每人一张)
  - **风险**: Seedream 4.0 API 是否真正支持多图数组需要测试
  - **Fallback**: 如果不支持,需要实现图片拼接方案

- ⏸️ **T018**: 测试多人上传端到端流程
  - 测试流程: 模式选择(多人) → 上传2-6张照片 → 人脸检测验证 → 生成
  - 验证数据库 `mode = 'multi'`

### Phase 5: US3 多人库选模式 (T019-T022)
- ⏸️ **T019**: 实现参考照片库查询
  - 创建 `findReferencePhotos(filter: AlbumFilter): PhotoUpload[]`
  - 支持按 `photoType='original'`, `faceCount≥1`, `dateRange` 筛选

- ⏸️ **T020**: 创建照片库选择器组件
  - 创建 `src/components/PhotoLibrarySelector.tsx`
  - 网格展示照片,支持多选
  - 显示人脸检测结果(人脸数、置信度)

- ⏸️ **T021**: 在上传页添加"从库选择"入口
  - 修改上传页,添加 Tab 或按钮切换 "上传新照片" / "从照片库选择"
  - 调用 `PhotoLibrarySelector` 组件

- ⏸️ **T022**: 测试库选模式端到端流程

### Phase 6: US4 照片库分离 (T023-T027)
- ⏸️ **T023**: 实现 AI 照片保存服务
  - 创建 `saveGeneratedPhotoToLibrary(imageData, metadata)` 函数
  - 设置 `is_ai_generated=1`, 填充 `ai_metadata` JSON字段

- ⏸️ **T024**: 实现生成照片相册查询
  - 创建 `findGeneratedPhotos(filter: AlbumFilter): PhotoUpload[]`
  - 支持按 `styleId`, `milestoneName`, `generationMode` 筛选

- ⏸️ **T025**: 实现源照片溯源
  - 创建 `findSourcePhotos(aiPhotoId): PhotoUpload[]`
  - 从 `ai_metadata.sourcePhotoIds` 读取并查询

- ⏸️ **T026**: 创建生成照片相册页面
  - 创建 `/library/ai-generated` 页面
  - 筛选器: 风格、里程碑、模式
  - 点击照片显示详情+源照片

- ⏸️ **T027**: 测试照片分离和筛选

### Phase 7: US5 模式切换 (T028-T030)
- ⏸️ **T028**: 添加模式切换确认对话框
  - 在模式选择页,如果已有上传照片,切换模式时弹出确认框
  - 提示: "切换模式将清空已上传照片,确认继续?"

- ⏸️ **T029**: 添加返回按钮重新选择照片
  - 在风格选择页添加"返回"按钮
  - 允许用户返回上传页重新选择照片

- ⏸️ **T030**: 测试模式切换流程

### Phase 8: Polish & Integration (T031-T035)
- ⏸️ **T031**: 完整端到端测试(所有用户故事)
- ⏸️ **T032**: 查询性能优化(利用新创建的索引)
- ⏸️ **T033**: 错误处理和用户提示完善
- ⏸️ **T034**: 更新文档和代码注释
- ⏸️ **T035**: UI/UX 优化和打磨

---

## 📊 代码统计

### 新增文件
1. `src/lib/generationModeConfig.ts` (104行) - 模式配置模块
2. `src/app/generation/mode/page.tsx` (163行) - 模式选择页面
3. `specs/003-2/IMPLEMENTATION_STATUS.md` (本文件)

### 修改文件
1. `src/lib/database.ts` - 添加迁移代码(+68行)
2. `src/lib/types.ts` - 添加新类型(+50行)
3. `src/lib/store.ts` - 扩展store(+15行)
4. `src/lib/types/style.ts` - 扩展StyleSchema(+5行)
5. `src/lib/styleService.ts` - 添加模式筛选函数(+46行)
6. `src/app/page.tsx` - 更新跳转链接(1行)

### 数据库变更
- 新增9个字段
- 新增7个索引
- 全部采用 `ALTER TABLE` 保证向后兼容

---

## 🔥 关键待办事项 (优先级排序)

1. **T013-T014: 人脸检测集成** (Phase 4核心)
   - 这是多人模式的基础功能
   - 需要确保 face-api.js 正确加载和运行
   - 预计工作量: 4-6小时

2. **T017: Seedream API 多图支持** (高风险)
   - 需要测试 API 是否真正支持 `image_base64: string[]` 数组
   - 如果不支持,需要实现图片拼接 Fallback 方案
   - 预计工作量: 6-8小时(含测试和Fallback)

3. **T023-T024: 照片库分离逻辑** (Phase 6核心)
   - 实现 AI 照片的保存和查询
   - 确保 `is_ai_generated` 和 `ai_metadata` 正确填充
   - 预计工作量: 3-4小时

4. **T011-T012: US1 单人流程收尾** (MVP必需)
   - 确保单人模式端到端可用
   - 这是测试多人模式的基准
   - 预计工作量: 2-3小时

5. **T031-T035: 测试和打磨** (最后阶段)
   - 端到端测试所有用户故事
   - 性能优化和错误处理
   - 预计工作量: 6-8小时

**总预计剩余工作量**: 21-29小时

---

## 🧪 测试检查清单

### 单人模式测试 (US1)
- [ ] 主页 → 模式选择 → 选择"单人模式"
- [ ] 上传1-10张照片
- [ ] (未来实现)每张照片人脸检测显示"✓ 1人"
- [ ] 选择里程碑
- [ ] 选择风格(只显示支持单人模式的风格)
- [ ] 开始生成
- [ ] 验证数据库 `generation_tasks.mode = 'single'`
- [ ] 验证生成照片 `ai_metadata.generationMode = 'single'`

### 多人上传测试 (US2)
- [ ] 模式选择 → 选择"多人模式"
- [ ] 上传2-6张照片
- [ ] 每张照片人脸检测显示人脸数(≥1)
- [ ] 如果上传单人照显示"✓ 1人",多人照显示"✓ 2人"等
- [ ] 选择里程碑
- [ ] 选择风格(只显示支持多人模式的风格)
- [ ] 生成合照
- [ ] 验证 `mode = 'multi'`

### 多人库选测试 (US3)
- [ ] 在照片库添加多张照片
- [ ] 上传页选择"从照片库选择"
- [ ] 选择2-6张照片
- [ ] 继续生成流程

### 照片库分离测试 (US4)
- [ ] 打开照片库
- [ ] 筛选"原始照片"只显示用户上传的照片
- [ ] 筛选"AI生成"只显示生成的照片
- [ ] 点击AI照片查看源照片
- [ ] 按风格筛选生成照片
- [ ] 按生成模式筛选(单人/多人)

### 模式切换测试 (US5)
- [ ] 在模式选择页选择"单人",上传照片
- [ ] 返回模式选择页,切换到"多人"
- [ ] 显示确认对话框: "切换模式将清空已上传照片"
- [ ] 确认后照片列表清空
- [ ] 上传新照片继续流程

---

## 📝 技术债务和改进建议

### 短期 (下一个迭代)
1. **错误边界**: 为 face-api.js 加载失败添加 fallback UI
2. **性能监控**: 记录人脸检测耗时,如果 >2秒 显示 loading
3. **缓存策略**: face-api.js 模型文件缓存到 IndexedDB
4. **Seedream API Fallback**: 如果多图数组不支持,实现图片拼接

### 中期 (v0.3.0)
1. **批量人脸检测**: 使用 Web Worker 并行处理多张照片
2. **照片质量评分**: 实现 `quality_score` 计算逻辑(模糊度、亮度等)
3. **智能照片推荐**: 根据人脸置信度推荐最佳照片
4. **模式自动推荐**: 根据上传照片数量自动建议模式

### 长期 (v0.4.0+)
1. **高级人脸识别**: 集成人脸聚类,自动识别同一人物
2. **照片去重**: 检测重复或相似照片
3. **离线支持**: face-api.js 模型打包到应用,无需下载

---

## 🎯 下一步行动

**立即开始**: T011 - 修改风格选择页添加模式筛选
**文件**: `src/app/generation/style/page.tsx`
**预计时间**: 30分钟
**完成标准**: 风格列表根据当前 `generationMode` 动态筛选
