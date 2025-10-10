'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

interface ErrorDialogProps {
  error: string
  onRetry?: () => void
  onClose?: () => void
}

export function ErrorDialog({ error, onRetry, onClose }: ErrorDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>操作失败</CardTitle>
          </div>
          <CardDescription>请查看错误信息并重试</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry}>重试</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
