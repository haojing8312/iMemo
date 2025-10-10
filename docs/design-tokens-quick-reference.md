# iMemo 设计系统 - 快速参考

> 开发时的速查表

---

## 色彩快速参考

### 常用颜色组合

```tsx
// 主要按钮
bg-primary-500 text-white hover:bg-primary-600

// 次要按钮
bg-neutral-100 text-neutral-800 hover:bg-neutral-200

// 文字颜色（浅色模式）
text-neutral-800  // 主标题
text-neutral-700  // 正文
text-neutral-600  // 次要文字
text-neutral-500  // 辅助文字
text-neutral-400  // 占位符

// 边框和分割线
border-neutral-300

// 背景色
bg-neutral-50     // 页面背景
bg-white          // 卡片背景
bg-neutral-100    // 次要背景
```

### 语义色

```tsx
// 成功
bg-success-500 text-success-600 border-success-300

// 警告
bg-warning-500 text-warning-600 border-warning-300

// 错误
bg-error-500 text-error-600 border-error-300

// 信息
bg-info-500 text-info-600 border-info-300
```

---

## 字体快速参考

### 标题

```tsx
text-display-lg      // 48px - 欢迎页
text-display-md      // 36px - 页面主标题
text-heading-lg      // 30px - 区块标题
text-heading-md      // 24px - 卡片标题 ⭐
text-heading-sm      // 20px - 小标题
text-heading-xs      // 18px - 最小标题
```

### 正文

```tsx
text-body-lg         // 16px - 重要正文
text-body            // 14px - 标准正文 ⭐
text-body-sm         // 13px - 辅助文字
text-caption         // 12px - 说明文字
text-overline        // 11px - 上标
```

### 字重

```tsx
font-normal          // 400 - 正文
font-medium          // 500 - 按钮、强调
font-semibold        // 600 - 小标题
font-bold            // 700 - 大标题
```

---

## 间距快速参考

### 常用间距

```tsx
gap-1    // 4px  - 图标与文字
gap-2    // 8px  - 紧凑布局
gap-3    // 12px - 按钮内边距
gap-4    // 16px - 标准间距 ⭐
gap-6    // 24px - 组件间距
gap-8    // 32px - 区块间距
gap-12   // 48px - 页面边距
```

### 布局模板

```tsx
// 页面容器
<div className="p-8 md:p-12 lg:p-16">

// 卡片
<div className="p-4 md:p-6">

// 表单
<div className="space-y-4">

// 按钮组
<div className="flex gap-3">

// 网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 圆角快速参考

```tsx
rounded-sm     // 4px  - 标签
rounded        // 8px  - 按钮、输入框 ⭐
rounded-md     // 12px - 中等卡片
rounded-lg     // 16px - 大卡片 ⭐
rounded-xl     // 20px - 对话框
rounded-2xl    // 24px - 主要面板
rounded-full   // 圆形 - 头像
```

---

## 阴影快速参考

```tsx
shadow-sm      // 小阴影 - 按钮悬停
shadow         // 标准阴影 - 卡片 ⭐
shadow-md      // 中等阴影 - 下拉菜单
shadow-lg      // 大阴影 - 对话框
shadow-xl      // 超大阴影 - 模态框

shadow-primary // 主色阴影
shadow-ai      // AI 阴影
```

---

## 常用组件模板

### 主要按钮

```tsx
<button className="
  bg-primary-500 text-white
  px-6 py-3 rounded-md
  font-medium shadow-sm
  hover:bg-primary-600 hover:shadow-md
  transition-all duration-200
">
  按钮文字
</button>
```

### 卡片

```tsx
<div className="
  bg-white rounded-lg shadow p-6
  hover:shadow-md transition-shadow
">
  内容
</div>
```

### 输入框

```tsx
<input className="
  w-full px-4 py-3
  border border-neutral-300 rounded
  focus:ring-2 focus:ring-primary-500 focus:border-transparent
  transition-all
" />
```

### 标签

```tsx
<span className="
  inline-flex items-center
  px-3 py-1 rounded-sm
  bg-primary-50 text-primary-700
  text-caption font-medium
">
  标签
</span>
```

---

## 响应式断点

```tsx
sm:   // 640px
md:   // 768px
lg:   // 1024px
xl:   // 1280px
2xl:  // 1536px
```

### 常用响应式模式

```tsx
// 移动优先间距
<div className="p-4 md:p-6 lg:p-8">

// 响应式网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 响应式文字大小
<h1 className="text-heading-md md:text-heading-lg lg:text-display-md">

// 响应式显示/隐藏
<div className="hidden md:block">
```

---

## 深色模式

```tsx
// 背景
bg-white dark:bg-neutral-900

// 文字
text-neutral-800 dark:text-neutral-100

// 边框
border-neutral-300 dark:border-neutral-700

// 卡片
bg-neutral-50 dark:bg-neutral-800
```

---

## 过渡动画

```tsx
// 颜色过渡
transition-colors duration-200

// 完整过渡
transition-all duration-200

// 悬停缩放
hover:scale-105 transition-transform

// 内置动画
animate-fade-in
animate-slide-in-up
animate-scale-in
```

---

## 无障碍

```tsx
// 焦点环
focus:ring-2 focus:ring-primary-500

// 可见焦点
focus-visible:outline-2 focus-visible:outline-primary-500

// ARIA 标签
<button aria-label="关闭">

// 键盘导航
tabIndex={0}
```

---

## 特殊效果

### AI 渐变

```tsx
className="gradient-ai"
// 或
className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
```

### 温暖渐变

```tsx
className="gradient-warm"
// 或
className="bg-gradient-to-r from-[#FF9133] to-[#FF6B9D]"
```

### 渐变文字

```tsx
className="text-gradient-ai"
className="text-gradient-warm"
```

### 毛玻璃

```tsx
className="glass"
// 背景模糊 + 半透明
```

### 卡片悬停

```tsx
className="card-hover"
// 悬停时上移 + 阴影增强
```

---

## 图标尺寸

```tsx
import { Icon } from 'lucide-react'

<Icon className="w-4 h-4" />  // 16px - 小图标
<Icon className="w-5 h-5" />  // 20px - 中图标
<Icon className="w-6 h-6" />  // 24px - 标准图标 ⭐
<Icon className="w-8 h-8" />  // 32px - 大图标
```

---

## 常见问题速查

### Q: 页面主背景用什么颜色？
```tsx
bg-neutral-50
```

### Q: 卡片背景用什么颜色？
```tsx
bg-white
```

### Q: 主要文字用什么颜色？
```tsx
text-neutral-800
```

### Q: 标准间距是多少？
```tsx
gap-4  // 16px
p-4    // 16px
```

### Q: 标准圆角是多少？
```tsx
rounded    // 8px  - 小组件
rounded-lg // 16px - 卡片
```

### Q: 标准阴影是多少？
```tsx
shadow     // 卡片默认阴影
```

### Q: 主要按钮样式？
```tsx
bg-primary-500 text-white px-6 py-3 rounded-md
```

### Q: 如何实现悬停效果？
```tsx
hover:bg-primary-600 transition-colors duration-200
```

---

**提示**: 将此文件添加到浏览器书签，开发时快速查阅！
