'use client'

import { useEffect } from 'react'
import { initializeStorage } from '@/lib/storage'

export function AppInitializer() {
  useEffect(() => {
    // 初始化应用存储和权限
    initializeStorage().catch(error => {
      console.error('应用初始化失败:', error)
    })
  }, [])

  return null
}
