'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Shield, CheckCircle } from 'lucide-react'

const PRIVACY_ACCEPTED_KEY = 'homememo_privacy_accepted'

interface PrivacyDialogProps {
  onAccept: () => void
}

export function PrivacyDialog({ onAccept }: PrivacyDialogProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 检查是否已经同意过隐私声明
    const hasAccepted = localStorage.getItem(PRIVACY_ACCEPTED_KEY)
    if (!hasAccepted) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    // 保存同意状态
    localStorage.setItem(PRIVACY_ACCEPTED_KEY, 'true')
    setIsVisible(false)
    onAccept()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>隐私保护声明</CardTitle>
          </div>
          <CardDescription>
            请仔细阅读以下隐私保护条款
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">
              我们如何保护您的隐私:
            </h3>
            <div className="space-y-2 text-sm text-blue-900">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>本地存储:</strong> 所有照片和生成结果仅保存在您的设备本地,不会上传到我们的服务器
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>临时传输:</strong> 照片仅在生成时临时传输到nano banana AI服务,用于生成百岁照
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>即时删除:</strong> nano banana承诺在生成完成后24小时内删除所有传输的照片
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>不会存储:</strong> 您的照片不会永久存储在云端服务器上
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>完全控制:</strong> 您可以随时删除本地存储的照片和历史记录
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">
              云端AI服务说明:
            </h3>
            <p className="text-sm text-amber-900">
              本应用使用 <strong>nano banana</strong> 云端AI服务进行图片生成。在生成过程中,您上传的照片和选择的风格参数将临时传输到该服务进行处理。
              nano banana遵守严格的隐私政策,不会将您的照片用于其他用途。
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              点击"我同意"即表示您已阅读并同意上述隐私保护条款。
              您可以随时在设置中撤销同意并清除所有本地数据。
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => window.close()}>
            不同意并退出
          </Button>
          <Button onClick={handleAccept}>
            我同意
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * 检查是否已同意隐私声明
 */
export function hasAcceptedPrivacy(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PRIVACY_ACCEPTED_KEY) === 'true'
}

/**
 * 重置隐私同意状态 (用于测试或用户撤销)
 */
export function resetPrivacyConsent(): void {
  localStorage.removeItem(PRIVACY_ACCEPTED_KEY)
}
