'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loadSettings, saveSettings, type AppSettings } from '@/lib/storage'
import { open } from '@tauri-apps/plugin-dialog'
import { FolderOpen } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({})
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [dataRootDir, setDataRootDir] = useState('')
  const [actualStoragePath, setActualStoragePath] = useState('')

  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    setApiKey(s.seedreamApiKey || '')
    setBaseUrl(s.seedreamBaseUrl || '')
    setDataRootDir(s.dataRootDir || '')

    // 获取实际存储路径
    const loadActualPath = async () => {
      if (s.dataRootDir) {
        setActualStoragePath(s.dataRootDir)
      } else {
        // 如果未设置,显示默认路径
        const { appDataDir } = await import('@tauri-apps/api/path')
        const defaultPath = await appDataDir()
        setActualStoragePath(defaultPath)
      }
    }
    loadActualPath()
  }, [])

  const handleSave = async () => {
    await saveSettings({ seedreamApiKey: apiKey.trim(), seedreamBaseUrl: baseUrl.trim(), dataRootDir: dataRootDir.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)

    // 更新实际存储路径显示
    if (dataRootDir.trim()) {
      setActualStoragePath(dataRootDir.trim())
    } else {
      const { appDataDir } = await import('@tauri-apps/api/path')
      const defaultPath = await appDataDir()
      setActualStoragePath(defaultPath)
    }
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

  const handleOpenStorageFolder = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const path = actualStoragePath ? `${actualStoragePath}/HomeMemo` : actualStoragePath
      await invoke('plugin:shell|open', { path })
    } catch (e) {
      console.error('打开文件夹失败:', e)
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
              <p className="text-xs text-muted-foreground mt-1">用于保存生成图片、照片等数据</p>
            </div>

            {/* 当前存储位置显示 */}
            {actualStoragePath && (
              <div className="bg-muted/50 p-3 rounded-md border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">当前存储位置</p>
                    <p className="text-sm font-mono text-foreground break-all">
                      {actualStoragePath}/HomeMemo
                    </p>
                    {!dataRootDir && (
                      <p className="text-xs text-muted-foreground mt-1">（默认应用数据目录）</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenStorageFolder}
                    className="flex-shrink-0"
                  >
                    <FolderOpen className="h-4 w-4 mr-1" />
                    打开
                  </Button>
                </div>
              </div>
            )}

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


