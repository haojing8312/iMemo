/**
 * 检查缺少的预览图
 */

import { existsSync } from 'fs'
import { join } from 'path'
import { styleConfig } from '../src/config/styles'

const OUTPUT_DIR = join(process.cwd(), 'public/styles')

console.log('🔍 检查缺少的预览图...\n')

const missingStyles = styleConfig.styles.filter(style => {
  const imagePath = join(OUTPUT_DIR, `${style.id}.jpg`)
  return !existsSync(imagePath)
})

if (missingStyles.length === 0) {
  console.log('✅ 所有风格的预览图都已生成!')
} else {
  console.log(`❌ 还缺少 ${missingStyles.length} 个风格的预览图:\n`)
  missingStyles.forEach(style => {
    console.log(`  • ${style.name} (${style.id})`)
  })
}

console.log(`\n📊 统计:`)
console.log(`  总风格数: ${styleConfig.styles.length}`)
console.log(`  已生成: ${styleConfig.styles.length - missingStyles.length}`)
console.log(`  缺失: ${missingStyles.length}`)
