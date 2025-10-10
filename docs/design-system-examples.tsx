/**
 * iMemo 设计系统 - 组件示例
 *
 * 此文件展示了如何使用 iMemo 设计系统创建常用组件
 * 这些示例可以直接复制到你的项目中使用
 */

import React from 'react'
import { Heart, Upload, Settings, Check, X, AlertCircle, Info } from 'lucide-react'

// ==========================================
// 按钮组件示例
// ==========================================

/**
 * 主要按钮 - 用于最重要的操作
 */
export function PrimaryButton() {
  return (
    <button className="
      bg-primary-500 text-white
      px-6 py-3 rounded-md
      font-medium shadow-sm
      hover:bg-primary-600 hover:shadow-md
      active:bg-primary-700
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
    ">
      开始使用
    </button>
  )
}

/**
 * 次要按钮 - 用于次要操作
 */
export function SecondaryButton() {
  return (
    <button className="
      bg-neutral-100 text-neutral-800
      px-6 py-3 rounded-md
      font-medium
      hover:bg-neutral-200
      active:bg-neutral-300
      focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors duration-200
    ">
      了解更多
    </button>
  )
}

/**
 * AI 渐变按钮 - 用于 AI 相关功能
 */
export function AIButton() {
  return (
    <button className="
      gradient-ai text-white
      px-6 py-3 rounded-md
      font-medium shadow-ai
      hover:shadow-xl
      active:scale-95
      focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
    ">
      <span className="flex items-center gap-2">
        <Upload className="w-5 h-5" />
        AI 生成照片
      </span>
    </button>
  )
}

/**
 * 温暖渐变按钮 - 用于情感化操作（收藏、喜欢等）
 */
export function WarmButton() {
  return (
    <button className="
      gradient-warm text-white
      px-6 py-3 rounded-md
      font-medium shadow-secondary
      hover:shadow-xl
      active:scale-95
      focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
      transition-all duration-200
    ">
      <span className="flex items-center gap-2">
        <Heart className="w-5 h-5" />
        收藏
      </span>
    </button>
  )
}

/**
 * 幽灵按钮 - 用于不太重要的操作
 */
export function GhostButton() {
  return (
    <button className="
      text-primary-500
      px-6 py-3 rounded-md
      font-medium
      hover:bg-primary-50
      active:bg-primary-100
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      transition-colors duration-200
    ">
      取消
    </button>
  )
}

/**
 * 图标按钮 - 纯图标按钮
 */
export function IconButton() {
  return (
    <button className="
      p-2 rounded-full
      text-neutral-600
      hover:bg-neutral-100 hover:text-neutral-800
      active:bg-neutral-200
      focus:outline-none focus:ring-2 focus:ring-primary-500
      transition-colors duration-200
    ">
      <Settings className="w-6 h-6" />
    </button>
  )
}

// ==========================================
// 卡片组件示例
// ==========================================

/**
 * 基础卡片
 */
export function BasicCard() {
  return (
    <div className="
      bg-white rounded-lg shadow p-6
      hover:shadow-md
      transition-shadow duration-200
    ">
      <h3 className="text-heading-md text-neutral-800 mb-2">
        卡片标题
      </h3>
      <p className="text-body text-neutral-600">
        这是卡片的描述内容，通常包含简短的说明文字。
      </p>
    </div>
  )
}

/**
 * 带悬停效果的卡片
 */
export function HoverCard() {
  return (
    <div className="
      bg-white rounded-lg shadow p-6
      card-hover
    ">
      <h3 className="text-heading-md text-neutral-800 mb-2">
        悬停卡片
      </h3>
      <p className="text-body text-neutral-600">
        鼠标悬停时会上移并增强阴影。
      </p>
    </div>
  )
}

/**
 * 毛玻璃卡片
 */
export function GlassCard() {
  return (
    <div className="
      glass rounded-xl p-6 shadow-lg
    ">
      <h3 className="text-heading-md mb-2">
        毛玻璃卡片
      </h3>
      <p className="text-body text-neutral-600">
        适用于叠加在图片或背景上的内容。
      </p>
    </div>
  )
}

/**
 * 图片卡片
 */
export function ImageCard() {
  return (
    <div className="
      bg-white rounded-lg shadow overflow-hidden
      hover:shadow-lg
      transition-shadow duration-200
    ">
      <div className="aspect-video bg-neutral-200">
        {/* 图片占位 */}
      </div>
      <div className="p-4">
        <h3 className="text-heading-sm text-neutral-800 mb-1">
          照片标题
        </h3>
        <p className="text-caption text-neutral-500">
          2025-10-10
        </p>
      </div>
    </div>
  )
}

// ==========================================
// 输入组件示例
// ==========================================

/**
 * 文本输入框
 */
export function TextInput() {
  return (
    <div className="space-y-2">
      <label className="text-body-sm font-medium text-neutral-700">
        相册名称
      </label>
      <input
        type="text"
        placeholder="请输入相册名称"
        className="
          w-full px-4 py-3
          bg-white border border-neutral-300 rounded
          text-body placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          transition-all duration-200
        "
      />
    </div>
  )
}

/**
 * 文本域
 */
export function TextArea() {
  return (
    <div className="space-y-2">
      <label className="text-body-sm font-medium text-neutral-700">
        描述
      </label>
      <textarea
        rows={4}
        placeholder="请输入描述信息"
        className="
          w-full px-4 py-3
          bg-white border border-neutral-300 rounded
          text-body placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          resize-none
          transition-all duration-200
        "
      />
    </div>
  )
}

/**
 * 搜索输入框
 */
export function SearchInput() {
  return (
    <div className="relative">
      <input
        type="search"
        placeholder="搜索照片..."
        className="
          w-full pl-10 pr-4 py-3
          bg-neutral-50 border border-neutral-300 rounded-full
          text-body placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
          transition-all duration-200
        "
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  )
}

// ==========================================
// 状态标签示例
// ==========================================

/**
 * 成功标签
 */
export function SuccessBadge() {
  return (
    <span className="
      inline-flex items-center gap-1
      px-3 py-1 rounded-sm
      bg-success-50 text-success-700
      text-caption font-medium
    ">
      <Check className="w-3 h-3" />
      已完成
    </span>
  )
}

/**
 * 警告标签
 */
export function WarningBadge() {
  return (
    <span className="
      inline-flex items-center gap-1
      px-3 py-1 rounded-sm
      bg-warning-50 text-warning-700
      text-caption font-medium
    ">
      <AlertCircle className="w-3 h-3" />
      处理中
    </span>
  )
}

/**
 * 错误标签
 */
export function ErrorBadge() {
  return (
    <span className="
      inline-flex items-center gap-1
      px-3 py-1 rounded-sm
      bg-error-50 text-error-700
      text-caption font-medium
    ">
      <X className="w-3 h-3" />
      失败
    </span>
  )
}

/**
 * 信息标签
 */
export function InfoBadge() {
  return (
    <span className="
      inline-flex items-center gap-1
      px-3 py-1 rounded-sm
      bg-info-50 text-info-700
      text-caption font-medium
    ">
      <Info className="w-3 h-3" />
      新功能
    </span>
  )
}

/**
 * AI 标签（带渐变）
 */
export function AIBadge() {
  return (
    <span className="
      inline-flex items-center gap-1
      px-3 py-1 rounded-sm
      gradient-ai text-white
      text-caption font-medium
    ">
      AI
    </span>
  )
}

// ==========================================
// 通知/提示框示例
// ==========================================

/**
 * 成功提示
 */
export function SuccessAlert() {
  return (
    <div className="
      flex items-start gap-3
      p-4 rounded-lg
      bg-success-50 border border-success-200
    ">
      <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-body-sm font-medium text-success-800 mb-1">
          操作成功
        </h4>
        <p className="text-body-sm text-success-700">
          您的更改已成功保存。
        </p>
      </div>
    </div>
  )
}

/**
 * 错误提示
 */
export function ErrorAlert() {
  return (
    <div className="
      flex items-start gap-3
      p-4 rounded-lg
      bg-error-50 border border-error-200
    ">
      <X className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-body-sm font-medium text-error-800 mb-1">
          操作失败
        </h4>
        <p className="text-body-sm text-error-700">
          无法保存更改，请稍后重试。
        </p>
      </div>
    </div>
  )
}

/**
 * 警告提示
 */
export function WarningAlert() {
  return (
    <div className="
      flex items-start gap-3
      p-4 rounded-lg
      bg-warning-50 border border-warning-200
    ">
      <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-body-sm font-medium text-warning-800 mb-1">
          注意
        </h4>
        <p className="text-body-sm text-warning-700">
          此操作可能需要一些时间，请耐心等待。
        </p>
      </div>
    </div>
  )
}

/**
 * 信息提示
 */
export function InfoAlert() {
  return (
    <div className="
      flex items-start gap-3
      p-4 rounded-lg
      bg-info-50 border border-info-200
    ">
      <Info className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-body-sm font-medium text-info-800 mb-1">
          提示
        </h4>
        <p className="text-body-sm text-info-700">
          您可以使用 AI 功能生成更多创意照片。
        </p>
      </div>
    </div>
  )
}

// ==========================================
// 页面布局示例
// ==========================================

/**
 * 完整页面布局示例
 */
export function PageLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 头部导航 */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-heading-md font-bold text-gradient-ai">
              iMemo
            </h1>
            <nav className="flex items-center gap-4">
              <IconButton />
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 页面标题 */}
          <div>
            <h2 className="text-display-md text-neutral-800 mb-2">
              我的相册
            </h2>
            <p className="text-body text-neutral-600">
              管理您的珍贵回忆
            </p>
          </div>

          {/* 卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImageCard />
            <ImageCard />
            <ImageCard />
          </div>
        </div>
      </main>
    </div>
  )
}

// ==========================================
// 表单布局示例
// ==========================================

/**
 * 表单布局示例
 */
export function FormLayout() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-heading-lg text-neutral-800 mb-6">
          创建新相册
        </h2>

        <form className="space-y-6">
          <TextInput />
          <TextArea />

          <div className="flex gap-3 justify-end pt-4">
            <GhostButton />
            <PrimaryButton />
          </div>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// 特色功能卡片
// ==========================================

/**
 * AI 功能展示卡片
 */
export function AIFeatureCard() {
  return (
    <div className="
      relative overflow-hidden
      bg-white rounded-2xl shadow-xl p-8
    ">
      {/* 渐变背景装饰 */}
      <div className="absolute top-0 right-0 w-64 h-64 gradient-ai opacity-10 blur-3xl" />

      <div className="relative z-10">
        <AIBadge />
        <h3 className="text-heading-lg text-neutral-800 mt-4 mb-2">
          AI 智能生成
        </h3>
        <p className="text-body text-neutral-600 mb-6">
          使用最新的 AI 技术，为您生成独特的艺术照片。
        </p>
        <AIButton />
      </div>
    </div>
  )
}

// ==========================================
// 导出所有组件
// ==========================================

export default {
  // 按钮
  PrimaryButton,
  SecondaryButton,
  AIButton,
  WarmButton,
  GhostButton,
  IconButton,

  // 卡片
  BasicCard,
  HoverCard,
  GlassCard,
  ImageCard,

  // 输入
  TextInput,
  TextArea,
  SearchInput,

  // 标签
  SuccessBadge,
  WarningBadge,
  ErrorBadge,
  InfoBadge,
  AIBadge,

  // 提示
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,

  // 布局
  PageLayout,
  FormLayout,
  AIFeatureCard,
}
