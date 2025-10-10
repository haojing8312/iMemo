# iMemo 设计系统使用指南

欢迎使用 iMemo 设计系统！本指南将帮助你快速上手。

---

## 快速开始

### 1. 查看设计文档

根据你的需求选择对应的文档：

| 文档 | 适用场景 | 路径 |
|------|---------|------|
| **快速参考** | 开发时快速查找设计 token | `docs/design-tokens-quick-reference.md` |
| **完整文档** | 了解设计理念和详细说明 | `docs/design-system.md` |
| **组件示例** | 复制可用的组件代码 | `docs/design-system-examples.tsx` |
| **系统总结** | 了解整体概况 | `docs/design-system-summary.md` |

### 2. 开始使用

#### 方式一：使用 Tailwind 类名

```tsx
// 创建一个主要按钮
<button className="
  bg-primary-500 text-white
  px-6 py-3 rounded-md
  hover:bg-primary-600
  transition-colors
">
  点击我
</button>
```

#### 方式二：复制组件示例

从 `design-system-examples.tsx` 中复制完整的组件代码：

```tsx
import { PrimaryButton } from '@/docs/design-system-examples'

function MyPage() {
  return <PrimaryButton />
}
```

---

## 核心概念

### 设计 Token

设计 token 是设计系统的基础，定义了颜色、字体、间距等基础样式。

#### 颜色
```tsx
bg-primary-500      // 主色（蓝色）
bg-secondary-500    // 辅助色（橙色）
bg-neutral-800      // 中性色（深灰）
bg-success-500      // 成功色（绿色）
bg-warning-500      // 警告色（黄色）
bg-error-500        // 错误色（红色）
```

#### 字体
```tsx
text-display-lg     // 超大标题 (48px)
text-heading-md     // 中等标题 (24px)
text-body           // 正文 (14px)
text-caption        // 说明文字 (12px)
```

#### 间距
```tsx
gap-4    // 标准间距 (16px)
gap-6    // 组件间距 (24px)
gap-8    // 区块间距 (32px)
p-12     // 页面边距 (48px)
```

#### 圆角
```tsx
rounded      // 标准圆角 (8px)
rounded-lg   // 大圆角 (16px)
rounded-full // 完全圆形
```

#### 阴影
```tsx
shadow      // 标准阴影（用于卡片）
shadow-md   // 中等阴影（用于弹窗）
shadow-lg   // 大阴影（用于对话框）
```

---

## 常用组件模板

### 按钮

#### 主要按钮（最常用）
```tsx
<button className="
  bg-primary-500 text-white
  px-6 py-3 rounded-md
  font-medium shadow-sm
  hover:bg-primary-600 hover:shadow-md
  transition-all duration-200
">
  主要操作
</button>
```

#### 次要按钮
```tsx
<button className="
  bg-neutral-100 text-neutral-800
  px-6 py-3 rounded-md
  font-medium
  hover:bg-neutral-200
  transition-colors
">
  次要操作
</button>
```

#### AI 渐变按钮（用于 AI 功能）
```tsx
<button className="gradient-ai text-white px-6 py-3 rounded-md font-medium">
  AI 生成
</button>
```

### 卡片

#### 基础卡片（最常用）
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-heading-md text-neutral-800 mb-2">
    卡片标题
  </h3>
  <p className="text-body text-neutral-600">
    卡片内容
  </p>
</div>
```

#### 带悬停效果的卡片
```tsx
<div className="bg-white rounded-lg shadow p-6 card-hover">
  内容
</div>
```

### 输入框

#### 文本输入框
```tsx
<div className="space-y-2">
  <label className="text-body-sm font-medium text-neutral-700">
    标签
  </label>
  <input
    type="text"
    placeholder="请输入..."
    className="
      w-full px-4 py-3
      border border-neutral-300 rounded
      focus:ring-2 focus:ring-primary-500 focus:border-transparent
      transition-all
    "
  />
</div>
```

### 状态标签

```tsx
// 成功
<span className="px-3 py-1 rounded-sm bg-success-50 text-success-700 text-caption font-medium">
  已完成
</span>

// 警告
<span className="px-3 py-1 rounded-sm bg-warning-50 text-warning-700 text-caption font-medium">
  处理中
</span>

// 错误
<span className="px-3 py-1 rounded-sm bg-error-50 text-error-700 text-caption font-medium">
  失败
</span>
```

---

## 特殊效果

### AI 渐变
```tsx
// 背景渐变
<div className="gradient-ai" />

// 文字渐变
<h1 className="text-gradient-ai">AI 智能</h1>
```

### 温暖渐变
```tsx
// 背景渐变
<div className="gradient-warm" />

// 文字渐变
<h1 className="text-gradient-warm">温暖回忆</h1>
```

### 毛玻璃效果
```tsx
<div className="glass rounded-xl p-6">
  半透明毛玻璃效果
</div>
```

### 卡片悬停效果
```tsx
<div className="card-hover">
  鼠标悬停时会上移并增强阴影
</div>
```

---

## 响应式设计

### 移动优先

```tsx
// 间距：手机 16px，平板 24px，桌面 32px
<div className="p-4 md:p-6 lg:p-8">

// 网格：手机 1 列，平板 2 列，桌面 3 列
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 字号：手机 24px，平板 30px，桌面 36px
<h1 className="text-heading-md md:text-heading-lg lg:text-display-md">
```

### 断点

```
sm:   640px   手机（横屏）
md:   768px   平板
lg:   1024px  桌面
xl:   1280px  大屏
2xl:  1536px  超大屏
```

---

## 深色模式

### 基础用法

```tsx
<div className="bg-white dark:bg-neutral-900">
  <h1 className="text-neutral-800 dark:text-neutral-100">
    自动适配深色模式
  </h1>
</div>
```

### 常用组合

```tsx
// 背景
bg-white dark:bg-neutral-900
bg-neutral-50 dark:bg-neutral-800

// 文字
text-neutral-800 dark:text-neutral-100
text-neutral-600 dark:text-neutral-300

// 边框
border-neutral-300 dark:border-neutral-700
```

---

## 无障碍建议

### 焦点状态
```tsx
<button className="
  focus:outline-none
  focus:ring-2
  focus:ring-primary-500
  focus:ring-offset-2
">
  可访问的按钮
</button>
```

### 语义化 HTML
```tsx
// ✅ 正确：使用语义化标签
<button type="button">按钮</button>
<nav>导航</nav>
<main>主要内容</main>

// ❌ 错误：过度使用 div
<div onclick="...">按钮</div>
```

### ARIA 标签
```tsx
<button aria-label="关闭对话框">
  <X className="w-5 h-5" />
</button>

<input
  type="text"
  aria-describedby="email-help"
/>
<p id="email-help" className="text-caption">
  请输入有效的邮箱地址
</p>
```

---

## 最佳实践

### ✅ 推荐做法

```tsx
// 1. 使用设计 token，而不是硬编码颜色
<div className="bg-primary-500">  // ✅
<div className="bg-[#3366FF]">   // ❌

// 2. 使用标准间距
<div className="gap-4">  // ✅ 16px
<div className="gap-[17px]">  // ❌ 非标准

// 3. 使用语义化颜色
<button className="bg-error-500">删除</button>  // ✅
<button className="bg-red-500">删除</button>    // ❌

// 4. 保持一致的圆角
<div className="rounded-lg">  // ✅
<div className="rounded-[13px]">  // ❌ 非标准

// 5. 使用标准阴影
<div className="shadow">  // ✅
<div className="shadow-[0_2px_8px_rgba(0,0,0,0.1)]">  // ❌
```

### ❌ 避免做法

```tsx
// 1. 避免使用任意值（除非必要）
<div className="p-[17px]">  // ❌
<div className="p-4">       // ✅

// 2. 避免内联样式
<div style={{ color: '#333' }}>  // ❌
<div className="text-neutral-800">  // ✅

// 3. 避免过度使用 !important
<div className="!bg-red-500">  // ❌
<div className="bg-error-500">  // ✅
```

---

## 常见问题

### Q: 如何选择合适的颜色？

**A**: 根据场景选择：
- 主要操作 → `primary-500`（蓝色）
- 次要操作 → `neutral-100`（浅灰）
- 成功提示 → `success-500`（绿色）
- 警告提示 → `warning-500`（黄色）
- 错误提示 → `error-500`（红色）
- AI 功能 → `gradient-ai`（渐变）

### Q: 如何选择合适的字号？

**A**: 根据内容层级：
- 页面主标题 → `text-display-md`（36px）
- 区块标题 → `text-heading-lg`（30px）
- 卡片标题 → `text-heading-md`（24px）
- 正文内容 → `text-body`（14px）
- 说明文字 → `text-caption`（12px）

### Q: 如何选择合适的间距？

**A**: 根据元素关系：
- 图标与文字 → `gap-1`（4px）
- 紧凑布局 → `gap-2`（8px）
- 标准间距 → `gap-4`（16px）⭐ 最常用
- 组件间距 → `gap-6`（24px）
- 区块间距 → `gap-8`（32px）

### Q: 如何确保无障碍性？

**A**: 三个关键点：
1. **对比度**: 使用推荐的颜色组合（如 `text-neutral-800` on `bg-white`）
2. **焦点状态**: 添加 `focus:ring-2 focus:ring-primary-500`
3. **语义化**: 使用正确的 HTML 标签和 ARIA 属性

### Q: 如何测试深色模式？

**A**: 两种方式：
1. 在浏览器 DevTools 中切换主题
2. 在代码中添加 `dark` 类到 `<html>` 或 `<body>` 标签

---

## 开发工具推荐

### VS Code 扩展
- **Tailwind CSS IntelliSense**: 自动补全 Tailwind 类名
- **PostCSS Language Support**: PostCSS 语法高亮
- **Prettier**: 代码格式化

### 浏览器扩展
- **React DevTools**: 调试 React 组件
- **Accessibility Insights**: 无障碍检查

---

## 获取帮助

### 文档
- 快速参考: `docs/design-tokens-quick-reference.md`
- 完整文档: `docs/design-system.md`
- 组件示例: `docs/design-system-examples.tsx`

### 联系方式
如有问题或建议，请联系设计团队或提交 Issue。

---

**Happy Coding! 🎨**

Made with ❤️ by iMemo Design Team
