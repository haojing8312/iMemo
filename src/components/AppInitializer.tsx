'use client'

import { useEffect } from 'react'
import { initializeStorage } from '@/lib/storage'
import { initDatabase } from '@/lib/database'

export function AppInitializer() {
  useEffect(() => {
    // 初始化应用存储、数据库和权限
    const init = async () => {
      try {
        await initializeStorage()
        console.log('[AppInitializer] 存储初始化完成')

        await initDatabase()
        console.log('[AppInitializer] 数据库初始化完成')
      } catch (error) {
        console.error('[AppInitializer] 应用初始化失败:', error)
      }
    }

    init()
  }, [])

  return null
}
