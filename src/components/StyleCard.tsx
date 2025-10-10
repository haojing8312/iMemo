'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import type { StyleTemplate } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StyleCardProps {
  style: StyleTemplate
  selected: boolean
  onSelect: () => void
}

export function StyleCard({ style, selected, onSelect }: StyleCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        selected && 'ring-2 ring-primary shadow-lg'
      )}
      onClick={onSelect}
    >
      {/* 选中指示器 */}
      {selected && (
        <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* 风格缩略图 */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
        {style.thumbnailPath ? (
          <img
            src={style.thumbnailPath}
            alt={style.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-4xl">🎨</p>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{style.name}</CardTitle>
        {style.description && (
          <CardDescription className="text-sm">
            {style.description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}
