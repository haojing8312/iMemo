// Multi-style image generator with sequential processing and graceful degradation
// Orchestrates batch generation across multiple styles with progress tracking

import { generateImages } from './api'
import type { Style } from './types/style'
import type { GenerationResult } from './types/task'
import { generatePrompt } from './promptGenerator'

export interface MultiStyleGenerationParams {
  /** Path to the uploaded photo */
  photoPath: string
  /** Array of styles to generate */
  styles: Style[]
  /** Milestone ID for dynamic prompt generation (e.g., "100-day", "wedding", "retirement") */
  milestoneId: string
  /** Number of images to generate per style (default: 4) */
  imagesPerStyle?: number
  /** Progress callback - called after each image */
  onProgress?: (current: number, total: number) => void
  /** Style completion callback - called after each style completes */
  onStyleComplete?: (styleId: string, styleName: string, results: GenerationResult[]) => void
  /** Style failure callback - called when a style fails */
  onStyleFailed?: (styleId: string, styleName: string, error: Error) => void
}

export interface MultiStyleGenerationResult {
  /** All successfully generated results */
  results: GenerationResult[]
  /** Total styles attempted */
  totalStyles: number
  /** Successfully completed styles */
  completedStyles: number
  /** Failed style IDs */
  failedStyleIds: string[]
  /** Overall success status */
  success: boolean
}

/**
 * Generate images across multiple styles sequentially
 * Implements graceful degradation - continues even if individual styles fail
 */
export async function generateMultiStyle(
  params: MultiStyleGenerationParams
): Promise<MultiStyleGenerationResult> {
  const {
    photoPath,
    styles,
    milestoneId,
    imagesPerStyle = 4,
    onProgress,
    onStyleComplete,
    onStyleFailed
  } = params

  const allResults: GenerationResult[] = []
  const failedStyleIds: string[] = []
  let completedStyles = 0

  const totalImages = styles.length * imagesPerStyle
  let completedImages = 0

  // Sequential processing - one style at a time
  for (const style of styles) {
    try {
      // Generate prompt using the new dynamic system
      const promptResult = generatePrompt({
        styleId: style.id,
        milestoneId: milestoneId
      })

      if (!promptResult.success) {
        throw new Error(promptResult.error || '提示词生成失败')
      }

      const prompt = promptResult.prompt

      console.log(`[MultiStyleGenerator] Starting style: ${style.name} (${style.id})`)
      console.log(`[MultiStyleGenerator] Milestone: ${promptResult.sceneType} (${milestoneId})`)
      console.log(`[MultiStyleGenerator] Prompt: ${prompt.substring(0, 100)}...`)

      // Generate images one by one to enable per-image progress updates
      // 逐张生成图片,每生成一张就更新进度
      const styleResults: GenerationResult[] = []

      for (let i = 0; i < imagesPerStyle; i++) {
        try {
          console.log(`[MultiStyleGenerator] Generating image ${i + 1}/${imagesPerStyle} for style: ${style.name}`)

          // 每次生成1张图片
          const resp: any = await generateImages({
            photoPath,
            prompt,
            numImages: 1,
          })

          const imageUrls: string[] = (resp?.images || []).map((img: any) => img.url)

          if (imageUrls.length > 0) {
            // Convert to GenerationResult format
            const result: GenerationResult = {
              imageId: crypto.randomUUID(),
              styleId: style.id,
              styleName: style.name,
              imageUrl: imageUrls[0],
              prompt: prompt,
              generatedAt: Date.now(),
              favorited: false,
              exported: false,
              index: i
            }

            styleResults.push(result)
            allResults.push(result)

            console.log(`[MultiStyleGenerator] ✓ Image ${i + 1}/${imagesPerStyle} generated for ${style.name}`)
          }

          // 每生成一张照片就更新进度
          completedImages++
          onProgress?.(completedImages, totalImages)

        } catch (imageError) {
          console.error(`[MultiStyleGenerator] ✗ Failed to generate image ${i + 1}/${imagesPerStyle} for ${style.name}`, imageError)
          // 单张图片失败,继续生成下一张
          completedImages++
          onProgress?.(completedImages, totalImages)
        }
      }

      completedStyles++

      // Notify style completion
      onStyleComplete?.(style.id, style.name, styleResults)

      console.log(`[MultiStyleGenerator] ✓ Completed style: ${style.name} (${styleResults.length} images)`)

    } catch (error) {
      // Graceful degradation: log error but continue
      const errorObj = error instanceof Error ? error : new Error(String(error))

      console.error(`[MultiStyleGenerator] ✗ Failed style: ${style.name}`, errorObj)

      failedStyleIds.push(style.id)

      // Notify style failure
      onStyleFailed?.(style.id, style.name, errorObj)

      // 注意: 进度更新已在内层循环中处理,这里不需要重复更新
    }
  }

  // Determine overall success
  const success = completedStyles > 0 // Success if at least ONE style succeeded

  const result: MultiStyleGenerationResult = {
    results: allResults,
    totalStyles: styles.length,
    completedStyles,
    failedStyleIds,
    success
  }

  console.log(`[MultiStyleGenerator] Generation complete:`)
  console.log(`  - Total styles: ${result.totalStyles}`)
  console.log(`  - Completed: ${result.completedStyles}`)
  console.log(`  - Failed: ${result.failedStyleIds.length}`)
  console.log(`  - Total images: ${result.results.length}`)

  return result
}

/**
 * Helper: Cancel ongoing generation
 * Note: Current implementation doesn't support cancellation mid-style
 * This is a placeholder for future enhancement
 */
export function cancelMultiStyleGeneration(): void {
  // TODO: Implement cancellation mechanism using AbortController
  console.warn('[MultiStyleGenerator] Cancellation not yet implemented')
}
