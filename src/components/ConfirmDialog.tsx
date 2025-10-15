/**
 * 确认对话框组件
 * 用于需要用户确认的操作,提供比 window.confirm 更好的用户体验
 */

'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  details?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  onCancel?: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  details,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="text-base font-medium text-foreground">{message}</p>
            {details && (
              <p className="text-sm text-muted-foreground">{details}</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
