// Multi-style image generator with sequential processing and graceful degradation
// Orchestrates batch generation across multiple styles with progress tracking

import { generateImages } from './api'
import type { Style } from './types/style'
import type { GenerationResult } from './types/task'

export interface MultiStyleGenerationParams {
  /** Path to the uploaded photo */
  photoPath: string
  /** Array of styles to generate */
  styles: Style[]
  /** Milestone name for context (e.g., "结婚", "百日照") */
  milestoneName: string
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
    milestoneName,
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
      // Build prompt by replacing template placeholders
      const prompt = style.promptTemplate
        .replace('[SUBJECT]', 'the person')
        .replace('[MILESTONE_NAME]', milestoneName)

      console.log(`[MultiStyleGenerator] Starting style: ${style.name} (${style.id})`)
      console.log(`[MultiStyleGenerator] Prompt: ${prompt}`)

      // Generate images for this style (using existing API)
      // NOTE: API expects an object param; extract urls from response.images
      const resp: any = await generateImages({
        photoPath,
        prompt,
        numImages: imagesPerStyle,
      })
      const imageUrls: string[] = (resp?.images || []).map((img: any) => img.url)

      // 检查是否部分成功
      if (resp.partialSuccess) {
        console.log(`[MultiStyleGenerator] ⚠️ Partial success for style: ${style.name}`)
        console.log(`  - Success: ${resp.successCount}/${imagesPerStyle} images`)
        console.log(`  - Failed: ${resp.failCount} images`)
      }

      // Convert to GenerationResult format
      const styleResults: GenerationResult[] = imageUrls.map((url, index) => ({
        imageId: crypto.randomUUID(),
        styleId: style.id,
        styleName: style.name,
        imageUrl: url,
        prompt: prompt,
        generatedAt: Date.now(),
        favorited: false,
        exported: false,
        index
      }))

      allResults.push(...styleResults)
      completedStyles++

      // Update progress
      completedImages += imagesPerStyle
      onProgress?.(completedImages, totalImages)

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

      // Still update progress (count failed images as "completed" for progress bar)
      completedImages += imagesPerStyle
      onProgress?.(completedImages, totalImages)
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
