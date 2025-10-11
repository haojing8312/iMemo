// AI 标识组件
// 用于在 AI 生成照片上显示视觉标识

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AIBadge({ className, size = 'md' }: AIBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1.5 text-sm',
  }

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        'bg-gradient-to-r from-purple-500 to-blue-500',
        'text-white shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      <Sparkles className={iconSizes[size]} />
      <span>AI</span>
    </div>
  )
}
