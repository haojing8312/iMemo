/**
 * 生成模式选择页面 (T008 - 003-2)
 * 用户选择单人/多人照片生成模式
 * 流程: 主页 -> 里程碑选择 -> **模式选择** -> 照片上传 -> 风格选择 -> 生成
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { getAllModes, getModeConfig } from '@/lib/generationModeConfig'
import type { GenerationMode } from '@/lib/types'
import { User, Users, ArrowLeft } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'

// Icon 映射
const ICON_MAP = {
  User,
  Users,
}

export default function ModeSelectionPage() {
  const router = useRouter()
  const { generationMode, setGenerationMode, selectedMilestone, uploadedPhotos, setUploadedPhotos } = useAppStore()

  const modes = getAllModes()
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState<GenerationMode | null>(null)

  // T028: 模式切换确认处理
  const handleSelectMode = (mode: GenerationMode) => {
    // 如果选择的是当前模式,直接跳转
    if (mode === generationMode) {
      router.push('/generation/select-photo')
      return
    }

    // 如果已有上传照片,显示确认对话框
    if (uploadedPhotos.length > 0) {
      setPendingMode(mode)
      setConfirmDialogOpen(true)
      return
    }

    // 直接切换模式并跳转
    setGenerationMode(mode)
    router.push('/generation/select-photo')
  }

  // T031: 确认切换模式
  const handleConfirmModeSwitch = () => {
    if (!pendingMode) return

    // 清空照片并切换模式
    setUploadedPhotos([])
    setGenerationMode(pendingMode)
    router.push('/generation/select-photo')
  }

  // 取消切换
  const handleCancelModeSwitch = () => {
    setPendingMode(null)
  }

  const handleBack = () => {
    router.push('/generation/milestone')
  }

  return (
    <>
      {/* T031: 自定义确认对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="切换生成模式"
        message={pendingMode ? `切换到${getModeConfig(pendingMode).name}将清空已上传的 ${uploadedPhotos.length} 张照片` : ''}
        details="这个操作无法撤销,请确认是否继续?"
        confirmText="确认切换"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleConfirmModeSwitch}
        onCancel={handleCancelModeSwitch}
      />

      <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>
        <h1 className="text-lg font-semibold text-gray-900">选择生成模式</h1>
        <div className="w-20" /> {/* 占位,保持标题居中 */}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* 场景提示 */}
        {selectedMilestone && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              已选择场景: <span className="font-semibold">{selectedMilestone.name}</span>
            </p>
          </div>
        )}

        {/* 模式卡片列表 */}
        <div className="space-y-4">
          {modes.map((mode) => {
            const Icon = ICON_MAP[mode.icon as keyof typeof ICON_MAP]
            const isSelected = generationMode === mode.id

            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={`
                  w-full p-6 rounded-xl border-2 text-left transition-all
                  ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* 图标 */}
                  <div
                    className={`
                      p-3 rounded-full
                      ${isSelected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}
                    `}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {mode.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{mode.description}</p>

                    {/* 上传提示 */}
                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                      <p className="text-xs text-gray-700">{mode.uploadHint}</p>
                    </div>

                    {/* 适用场景标签 */}
                    <div className="flex flex-wrap gap-2">
                      {mode.useCases.map((useCase) => (
                        <span
                          key={useCase}
                          className={`
                            px-2 py-1 text-xs rounded-full
                            ${
                              isSelected
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-gray-100 text-gray-600'
                            }
                          `}
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 选中标识 */}
                  {isSelected && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 提示: 选择模式后将跳转到照片上传页面,请按照提示要求上传照片
          </p>
        </div>
      </div>
    </div>
    </>
  )
}
