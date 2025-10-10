# iMemo 设计系统文档

> **版本**: 1.0.0
> **最后更新**: 2025-10-10
> **状态**: 正式发布

---

## 目录

1. [设计理念](#设计理念)
2. [色彩系统](#色彩系统)
3. [字体系统](#字体系统)
4. [间距系统](#间距系统)
5. [圆角系统](#圆角系统)
6. [阴影系统](#阴影系统)
7. [组件示例](#组件示例)
8. [使用指南](#使用指南)

---

## 设计理念

### 品牌定位
**"有爱的智能记忆守护者"**

iMemo 设计系统围绕三个核心理念：

1. **温暖可信** - 柔和的色彩、圆润的圆角，营造家庭般的温馨感
2. **科技智能** - 渐变色、流动感，体现 AI 的未来感
3. **隐私安全** - 克制的配色、清晰的层次，传递可信赖的专业感

### 设计原则

#### 1. 用户优先
- 清晰的信息层次
- 易于理解的交互
- 流畅的操作体验

#### 2. 情感化设计
- 温暖的色彩搭配
- 友好的文案提示
- 愉悦的动画反馈

#### 3. 无障碍性
- WCAG 2.1 AA 级对比度
- 键盘可访问
- 屏幕阅读器友好

#### 4. 一致性
- 统一的视觉语言
- 标准化的组件
- 可预测的行为

---

## 色彩系统

### 主色系统（Primary）

**温暖智能蓝** - 科技感与温度的平衡

```css
/* Tailwind 使用 */
bg-primary-500  /* 主色 #3366FF */
text-primary-500
border-primary-500
hover:bg-primary-600
```

| 色阶 | Hex | 使用场景 |
|-----|-----|----------|
| 50 | `#F0F4FF` | 浅背景、悬停态 |
| 100 | `#E0E9FF` | 次要背景 |
| 200 | `#C2D6FF` | 辅助背景 |
| 300 | `#8FAFFF` | 禁用态、边框 |
| 400 | `#5C88FF` | 次要元素 |
| **500** | **`#3366FF`** | **主要按钮、链接** ⭐ |
| 600 | `#2952CC` | 悬停态 |
| 700 | `#1F3D99` | 按压态 |
| 800 | `#162966` | 深色文字 |
| 900 | `#0C1633` | 深色背景 |

### 辅助色系统（Secondary）

**温暖橙** - 增加情感温度

```css
/* Tailwind 使用 */
bg-secondary-500  /* #FF9133 */
text-secondary-500
```

| 色阶 | Hex | 使用场景 |
|-----|-----|----------|
| **500** | **`#FF9133`** | **次要按钮、强调** ⭐ |
| 600 | `#E67A1F` | 悬停态 |

### 中性色系统（Neutral）

**优雅灰系** - 保持克制和专业

```css
/* Tailwind 使用 */
bg-neutral-50    /* 页面背景 */
bg-neutral-100   /* 卡片背景 */
text-neutral-800 /* 主要文字 */
text-neutral-600 /* 次要文字 */
text-neutral-500 /* 辅助文字 */
```

| 色阶 | Hex | 使用场景 |
|-----|-----|----------|
| 50 | `#FAFBFC` | 页面背景 |
| 100 | `#F4F6F8` | 卡片背景 |
| 200 | `#E8ECEF` | 禁用背景 |
| 300 | `#D1D9E0` | 边框、分割线 |
| 400 | `#B3BFC9` | 占位符 |
| 500 | `#8596A3` | 辅助文字 |
| 600 | `#5E6C7A` | 次要文字 |
| 700 | `#3D4852` | 正文文字 |
| **800** | **`#232A31`** | **标题文字** ⭐ |
| 900 | `#0F1419` | 深色背景 |

### 语义色系统

#### 成功色（Success）
```css
bg-success-500  /* #10B981 */
text-success-600
```

#### 警告色（Warning）
```css
bg-warning-500  /* #F59E0B */
text-warning-600
```

#### 错误色（Error）
```css
bg-error-500    /* #EF4444 */
text-error-600
```

#### 信息色（Info）
```css
bg-info-500     /* #06B6D4 */
text-info-600
```

### 特殊渐变色

#### AI 渐变（用于 AI 功能）
```tsx
// Tailwind 方式
className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"

// CSS 类方式
className="gradient-ai"
```

#### 温暖渐变（用于情感化场景）
```tsx
className="bg-gradient-to-r from-[#FF9133] to-[#FF6B9D]"
// 或
className="gradient-warm"
```

#### 渐变文字
```tsx
className="text-gradient-ai"     // AI 渐变文字
className="text-gradient-warm"   // 温暖渐变文字
```

---

## 字体系统

### 字体家族

```tsx
// 默认中文字体
className="font-sans"
// PingFang SC, Noto Sans SC, Microsoft YaHei, Hiragino Sans GB

// 英文/展示字体
className="font-display"
// Inter, SF Pro Display, -apple-system

// 等宽字体（代码、数据）
className="font-mono"
// JetBrains Mono, Fira Code, Consolas
```

### 字体大小与层级

#### 标题层级

```tsx
// 超大标题 - 欢迎页、大标题
<h1 className="text-display-lg">欢迎使用 iMemo</h1>
// 48px / 700 / -0.02em

// 大标题 - 页面主标题
<h2 className="text-display-md">我的相册</h2>
// 36px / 700 / -0.01em

// 主要标题 - 区块标题
<h3 className="text-heading-lg">最近上传</h3>
// 30px / 600 / -0.01em

// 中等标题 - 卡片标题
<h4 className="text-heading-md">家庭回忆</h4>
// 24px / 600 / 0

// 小标题
<h5 className="text-heading-sm">相册设置</h5>
// 20px / 600 / 0

// 最小标题
<h6 className="text-heading-xs">基本信息</h6>
// 18px / 600 / 0
```

#### 正文层级

```tsx
// 大正文 - 重要信息
<p className="text-body-lg">欢迎回来！今天是美好的一天。</p>
// 16px / 400 / 0

// 标准正文 - 常规内容
<p className="text-body">这是一段标准的正文内容。</p>
// 14px / 400 / 0

// 小正文 - 辅助信息
<p className="text-body-sm">这是辅助性的文字说明。</p>
// 13px / 400 / 0

// 说明文字 - 标签、提示
<span className="text-caption">上传于 2025-10-10</span>
// 12px / 400 / 0.01em

// 上标文字 - 小标签
<span className="text-overline">NEW</span>
// 11px / 500 / 0.08em
```

### 字重建议

```tsx
className="font-light"      // 300 - 装饰性文字
className="font-normal"     // 400 - 正文
className="font-medium"     // 500 - 强调、按钮
className="font-semibold"   // 600 - 小标题
className="font-bold"       // 700 - 大标题、品牌
```

---

## 间距系统

### 基础间距（基于 4px）

```tsx
// 极小间距 - 图标与文字
className="gap-1"  // 4px

// 最小间距 - 紧凑布局
className="gap-2"  // 8px

// 小间距 - 按钮内边距
className="p-3"    // 12px

// 标准间距 - 卡片内边距 ⭐
className="p-4"    // 16px

// 中等间距
className="gap-5"  // 20px

// 中大间距 - 组件间距
className="gap-6"  // 24px

// 大间距 - 区块间距
className="gap-8"  // 32px

// 特大间距
className="gap-10" // 40px

// 超大间距 - 页面边距
className="p-12"   // 48px

// 巨大间距 - 分隔区域
className="gap-16" // 64px
```

### 布局间距建议

```tsx
// 页面容器
<div className="p-12 md:p-16 lg:p-24">

// 内容区块
<section className="space-y-8">

// 卡片组
<div className="grid gap-6">

// 表单元素
<div className="space-y-4">

// 按钮组
<div className="flex gap-3">
```

---

## 圆角系统

### 圆角值

```tsx
// 无圆角 - 表格、分割线
className="rounded-none"

// 小圆角 - 标签、徽章
className="rounded-sm"    // 4px

// 标准圆角 - 按钮、输入框、卡片 ⭐
className="rounded"       // 8px

// 中等圆角 - 对话框
className="rounded-md"    // 12px

// 大圆角 - 大卡片、面板
className="rounded-lg"    // 16px

// 超大圆角 - 特殊卡片
className="rounded-xl"    // 20px

// 巨大圆角 - 主要面板
className="rounded-2xl"   // 24px

// 完全圆形 - 头像、图标按钮
className="rounded-full"  // 9999px
```

### 组件圆角建议

| 组件 | 推荐类名 | 圆角值 |
|-----|---------|--------|
| 小按钮 | `rounded` | 8px |
| 中按钮 | `rounded-md` | 12px |
| 大按钮 | `rounded-md` | 12px |
| 输入框 | `rounded` | 8px |
| 卡片 | `rounded-lg` | 16px |
| 对话框 | `rounded-xl` | 20px |
| 图片容器 | `rounded-lg` | 16px |
| 头像 | `rounded-full` | 完全圆形 |
| 标签 | `rounded-sm` | 4px |

---

## 阴影系统

### 阴影层级

```tsx
// 无阴影
className="shadow-none"

// 微小阴影 - 标签、徽章
className="shadow-xs"

// 小阴影 - 输入框、按钮悬停
className="shadow-sm"

// 标准阴影 - 卡片 ⭐
className="shadow"

// 中等阴影 - 弹出菜单
className="shadow-md"

// 大阴影 - 对话框
className="shadow-lg"

// 超大阴影 - 模态框
className="shadow-xl"
```

### 特殊阴影

```tsx
// 主色阴影 - 主要按钮
className="shadow-primary"

// 辅助色阴影
className="shadow-secondary"

// AI 阴影 - AI 功能
className="shadow-ai"

// 内阴影
className="shadow-inner"

// 焦点内阴影
className="shadow-inner-focus"
```

---

## 组件示例

### 按钮组件

#### 主要按钮
```tsx
<button className="
  bg-primary-500
  text-white
  px-6 py-3
  rounded-md
  font-medium
  shadow-sm
  hover:bg-primary-600
  hover:shadow-md
  active:bg-primary-700
  transition-all
  duration-200
">
  开始使用
</button>
```

#### 次要按钮
```tsx
<button className="
  bg-neutral-100
  text-neutral-800
  px-6 py-3
  rounded-md
  font-medium
  hover:bg-neutral-200
  transition-colors
">
  了解更多
</button>
```

#### AI 渐变按钮
```tsx
<button className="
  gradient-ai
  text-white
  px-6 py-3
  rounded-md
  font-medium
  shadow-ai
  hover:shadow-xl
  transition-all
  duration-200
">
  AI 生成照片
</button>
```

### 卡片组件

```tsx
<div className="
  bg-white
  rounded-lg
  shadow
  p-6
  card-hover
">
  <h3 className="text-heading-md text-neutral-800 mb-2">
    卡片标题
  </h3>
  <p className="text-body text-neutral-600">
    这是卡片的描述内容，通常包含简短的说明文字。
  </p>
</div>
```

### 输入框组件

```tsx
<div className="space-y-2">
  <label className="text-body-sm font-medium text-neutral-700">
    相册名称
  </label>
  <input
    type="text"
    placeholder="请输入相册名称"
    className="
      w-full
      px-4 py-3
      bg-white
      border border-neutral-300
      rounded
      text-body
      placeholder:text-neutral-400
      focus:outline-none
      focus:ring-2
      focus:ring-primary-500
      focus:border-transparent
      transition-all
    "
  />
</div>
```

### 状态标签

```tsx
// 成功状态
<span className="
  inline-flex items-center
  px-3 py-1
  bg-success-50
  text-success-700
  text-caption
  font-medium
  rounded-sm
">
  已完成
</span>

// 警告状态
<span className="
  inline-flex items-center
  px-3 py-1
  bg-warning-50
  text-warning-700
  text-caption
  font-medium
  rounded-sm
">
  处理中
</span>

// 错误状态
<span className="
  inline-flex items-center
  px-3 py-1
  bg-error-50
  text-error-700
  text-caption
  font-medium
  rounded-sm
">
  失败
</span>
```

### 毛玻璃卡片

```tsx
<div className="
  glass
  rounded-xl
  p-6
  shadow-lg
">
  <h3 className="text-heading-md mb-2">
    毛玻璃效果卡片
  </h3>
  <p className="text-body text-neutral-600">
    适用于叠加在图片或背景上的内容。
  </p>
</div>
```

---

## 使用指南

### 1. 颜色使用建议

#### 主色（Primary Blue）
- ✅ 主要操作按钮
- ✅ 重要链接
- ✅ 选中状态
- ✅ 焦点状态
- ❌ 大面积背景（过于刺眼）

#### 辅助色（Orange）
- ✅ 次要按钮
- ✅ 强调元素
- ✅ 情感化场景（如"爱心"、"收藏"）
- ✅ 与主色搭配使用
- ❌ 单独大量使用

#### 中性色（Neutral）
- ✅ 文字内容
- ✅ 边框和分割线
- ✅ 背景色
- ✅ 禁用状态

### 2. 对比度检查

确保文字与背景的对比度符合 WCAG 2.1 AA 标准：

| 文字类型 | 最小对比度 | 推荐搭配 |
|---------|-----------|---------|
| 正文文字 | 4.5:1 | `text-neutral-800` on `bg-neutral-50` |
| 大文字（18px+） | 3:1 | `text-neutral-700` on `bg-white` |
| UI 组件 | 3:1 | `border-neutral-300` |

### 3. 响应式设计

```tsx
// 响应式间距
<div className="p-4 md:p-6 lg:p-8">

// 响应式字号
<h1 className="text-heading-md md:text-heading-lg lg:text-display-md">

// 响应式布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### 4. 深色模式

```tsx
// 背景色
<div className="bg-neutral-50 dark:bg-neutral-900">

// 文字颜色
<p className="text-neutral-800 dark:text-neutral-100">

// 边框
<div className="border-neutral-300 dark:border-neutral-700">

// 卡片
<div className="bg-white dark:bg-neutral-800">
```

### 5. 动画和过渡

```tsx
// 颜色过渡
className="transition-colors duration-200"

// 完整过渡
className="transition-all duration-200"

// 慢速过渡
className="transition-all duration-slow"

// 快速过渡
className="transition-all duration-fast"

// 内置动画
className="animate-fade-in"
className="animate-slide-in-up"
className="animate-scale-in"
```

### 6. 无障碍建议

```tsx
// 焦点可见性
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500">

// 键盘导航
<a href="#" className="focus-visible:outline-2 focus-visible:outline-primary-500">

// 语义化 HTML
<button type="button" aria-label="关闭对话框">

// 颜色不是唯一指示
<span className="text-error-600" aria-label="错误：">❌ 上传失败</span>
```

---

## 设计资源

### Figma 组件库
_（待补充）_

### 图标系统
使用 `lucide-react` 图标库，保持 24px 基础尺寸。

```tsx
import { Heart, Upload, Settings } from 'lucide-react'

<Heart className="w-5 h-5" />  // 20px
<Upload className="w-6 h-6" /> // 24px（标准）
<Settings className="w-8 h-8" /> // 32px
```

### 插图风格
- 温暖柔和的色调
- 圆润的形状
- 简洁的线条
- 亲和的人物形象

---

## 版本历史

### v1.0.0 (2025-10-10)
- 初始版本发布
- 定义完整的色彩、字体、间距系统
- 提供 Tailwind CSS 配置
- 添加组件示例和使用指南

---

## 反馈与贡献

如有设计系统相关的问题或建议，请联系设计团队或提交 Issue。

---

**Made with ❤️ by iMemo Design Team**
