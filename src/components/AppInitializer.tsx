'use client'

import { useEffect } from 'react'
import { initializeStorage } from '@/lib/storage'
import { initDatabase } from '@/lib/database'
import { loadFaceDetectionModels } from '@/lib/faceDetectionService'

export function AppInitializer() {
  useEffect(() => {
    // 初始化应用存储、数据库和权限
    const init = async () => {
      try {
        await initializeStorage()
        console.log('[AppInitializer] 存储初始化完成')

        await initDatabase()
        console.log('[AppInitializer] 数据库初始化完成')

        // T015: 加载人脸检测模型 (003-2)
        loadFaceDetectionModels().catch(error => {
          console.error('[AppInitializer] 人脸检测模型加载失败:', error)
          // 不阻塞应用启动,模型加载失败时会在使用时重试
        })
      } catch (error) {
        console.error('[AppInitializer] 应用初始化失败:', error)
      }
    }

    init()
  }, [])

  return null
}
