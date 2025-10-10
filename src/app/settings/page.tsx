'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loadSettings, saveSettings, type AppSettings } from '@/lib/storage'
import { open } from '@tauri-apps/plugin-dialog'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({})
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [dataRootDir, setDataRootDir] = useState('')

  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    setApiKey(s.seedreamApiKey || '')
    setBaseUrl(s.seedreamBaseUrl || '')
    setDataRootDir(s.dataRootDir || '')
  }, [])

  const handleSave = () => {
    saveSettings({ seedreamApiKey: apiKey.trim(), seedreamBaseUrl: baseUrl.trim(), dataRootDir: dataRootDir.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handlePickDir = async () => {
    try {
      const dir = await open({ directory: true, multiple: false })
      if (typeof dir === 'string') {
        setDataRootDir(dir)
      }
    } catch (e) {
      console.error('选择目录失败:', e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>系统设置</CardTitle>
            <CardDescription>配置 SeeDream 接口所需参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SeeDream API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="请输入 API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SeeDream Base URL（可选）</label>
              <Input
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="https://ark.cn-beijing.volces.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">数据存储目录</label>
              <div className="flex gap-2">
                <Input
                  value={dataRootDir}
                  onChange={e => setDataRootDir(e.target.value)}
                  placeholder="未设置时默认使用应用数据目录"
                />
                <Button variant="secondary" onClick={handlePickDir}>选择</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">用于保存生成图片等数据</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave}>保存</Button>
              {saved && <span className="text-sm text-green-600">已保存</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


