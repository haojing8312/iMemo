# 方案1完整实施计划

## 📊 代码结构分析

### 现有关键文件

| 文件路径 | 作用 | 当前状态 | 是否需要修改 |
|---------|------|---------|-------------|
| `src/config/styles-realistic-studio.ts` | 真实风格配置（14个） | 包含硬编码年龄描述 | ✅ 需要改造 |
| `src/config/styles.ts` | 主风格配置（旧系统） | 用于现有流程 | ⚠️ 可选集成 |
| `src/config/milestones.json` | 里程碑配置（22个） | 只有ID和元数据 | ✅ 需要扩展 |
| `src/lib/multiStyleGenerator.ts` | 多风格生成器 | 使用简单变量替换 | ✅ 需要升级 |
| `src/app/generation/milestone/page.tsx` | 里程碑选择页面 | 用户选择里程碑 | ✅ 需要传递信息 |
| `src/app/generation/style/page.tsx` | 风格选择页面 | 用户选择风格 | ✅ 需要传递信息 |
| `src/lib/styleService.ts` | 风格服务 | 加载风格配置 | ⚠️ 可能需要调整 |
| `src/lib/taskService.ts` | 任务服务 | 创建生成任务 | ⚠️ 可能需要调整 |

---

## 🎯 实施方案

### **核心思路**
1. 创建**里程碑提示词参数映射表**（新文件）
2. 创建**通用提示词生成器**（新文件）
3. 更新**风格配置**中的提示词模板（添加变量）
4. 修改**多风格生成器**（使用新的生成器）
5. **不影响**现有的页面UI和用户流程

---

## 📋 详细实施步骤

### **步骤1：创建里程碑提示词参数映射表**

**新建文件**：`src/config/milestone-prompt-params.ts`

```typescript
/**
 * 里程碑提示词参数映射表
 * 为每个里程碑定义生成提示词所需的动态参数
 */

export interface MilestonePromptParams {
  /** 场景类型（如"百日纪念"、"周岁庆典"） */
  SCENE_TYPE: string
  /** 主体类型（如"百天宝宝"、"周岁宝宝"） */
  SUBJECT_TYPE: string
  /** 年龄描述（如"3-4个月大婴儿"、"1岁宝宝"） */
  AGE_DESC: string
  /** 表情选项（如"微笑/好奇睁眼/小手抓握"） */
  EXPRESSION: string
  /** 服装描述 */
  CLOTHING?: string
  /** 道具描述 */
  PROPS?: string
}

export const milestonePromptParams: Record<string, MilestonePromptParams> = {
  // ========== 婴儿期（0-1岁）==========
  "birth": {
    SCENE_TYPE: "新生儿",
    SUBJECT_TYPE: "新生婴儿",
    AGE_DESC: "0-7天新生儿",
    EXPRESSION: "安静熟睡/微微睁眼/小手握拳",
    CLOTHING: "婴儿穿纯白色包裹巾或连体衣",
    PROPS: "柔软毯子、简约装饰"
  },

  "full-month": {
    SCENE_TYPE: "满月纪念",
    SUBJECT_TYPE: "满月宝宝",
    AGE_DESC: "满月（30天）宝宝",
    EXPRESSION: "微笑/好奇睁眼/安静凝视",
    CLOTHING: "婴儿穿白色/粉色连体衣或传统满月服",
    PROPS: "月亮装饰、"满月快乐"文字、毛绒玩偶"
  },

  "100-day": {
    SCENE_TYPE: "百日纪念",
    SUBJECT_TYPE: "百天宝宝",
    AGE_DESC: "3-4个月大婴儿",
    EXPRESSION: "微笑/好奇睁眼/小手抓握/歪头看镜头",
    CLOTHING: "婴儿穿白色棉质短袖+背带裤，戴可爱帽子，脚踩袜子",
    PROPS: "手持彩色字母木块，身旁摆放超大毛绒玩偶，点缀数字"100"装饰"
  },

  "first-birthday": {
    SCENE_TYPE: "周岁庆典",
    SUBJECT_TYPE: "周岁宝宝",
    AGE_DESC: "1岁宝宝",
    EXPRESSION: "开心笑/拍手/好奇探索",
    CLOTHING: "宝宝穿节日服装或连衣裙/小西装",
    PROPS: "生日蛋糕、彩色气球、数字"1"装饰、派对装饰"
  },

  // ========== 童年期（1-12岁）==========
  "kindergarten": {
    SCENE_TYPE: "幼儿园毕业",
    SUBJECT_TYPE: "幼儿",
    AGE_DESC: "3-6岁儿童",
    EXPRESSION: "开心笑容/调皮表情/自信姿态",
    CLOTHING: "儿童穿幼儿园毕业服或休闲服装",
    PROPS: "毕业证书、玩具、书包"
  },

  "elementary-graduation": {
    SCENE_TYPE: "小学毕业",
    SUBJECT_TYPE: "小学生",
    AGE_DESC: "11-12岁少年/少女",
    EXPRESSION: "自信微笑/阳光笑容/认真表情",
    CLOTHING: "学生穿校服或正式服装",
    PROPS: "毕业证书、书本、校园元素"
  },

  "birthday": {
    SCENE_TYPE: "生日庆典",
    SUBJECT_TYPE: "儿童",
    AGE_DESC: "1-12岁儿童（根据实际年龄）",
    EXPRESSION: "开心笑/吹蜡烛/拆礼物/玩耍",
    CLOTHING: "儿童穿派对服装或休闲服装",
    PROPS: "生日蛋糕、气球、礼物、彩带"
  },

  // ========== 青春期（12-18岁）==========
  "middle-school-graduation": {
    SCENE_TYPE: "初中毕业",
    SUBJECT_TYPE: "初中生",
    AGE_DESC: "14-15岁青少年",
    EXPRESSION: "青春笑容/自信姿态/认真表情",
    CLOTHING: "学生穿校服或正式服装",
    PROPS: "毕业证书、书本、青春纪念元素"
  },

  "high-school-graduation": {
    SCENE_TYPE: "高中毕业",
    SUBJECT_TYPE: "高中生",
    AGE_DESC: "17-18岁青年",
    EXPRESSION: "成熟微笑/阳光自信/青春活力",
    CLOTHING: "学生穿学士服或正式服装",
    PROPS: "学士帽、毕业证书、校园背景"
  },

  "coming-of-age": {
    SCENE_TYPE: "成人礼",
    SUBJECT_TYPE: "成年人",
    AGE_DESC: "18岁青年",
    EXPRESSION: "成熟微笑/自信姿态/优雅表情",
    CLOTHING: "青年穿正式礼服或传统成人礼服装",
    PROPS: "成人礼道具、鲜花、纪念元素"
  },

  // ========== 成年期（18-60岁）==========
  "college-graduation": {
    SCENE_TYPE: "大学毕业",
    SUBJECT_TYPE: "大学生",
    AGE_DESC: "22-24岁青年",
    EXPRESSION: "自信微笑/欣喜表情/学术姿态",
    CLOTHING: "学生穿学士服",
    PROPS: "学士帽、学位证书、大学校园背景"
  },

  "wedding": {
    SCENE_TYPE: "婚礼纪念",
    SUBJECT_TYPE: "新人",
    AGE_DESC: "成年新婚夫妇",
    EXPRESSION: "幸福微笑/深情凝视/温柔相拥",
    CLOTHING: "新娘穿婚纱，新郎穿礼服",
    PROPS: "鲜花、婚戒、浪漫装饰"
  },

  "anniversary": {
    SCENE_TYPE: "纪念日庆祝",
    SUBJECT_TYPE: "夫妇",
    AGE_DESC: "成年夫妇",
    EXPRESSION: "温馨微笑/深情对视/手牵手",
    CLOTHING: "夫妇穿协调的正式或休闲服装",
    PROPS: "鲜花、纪念装饰、浪漫元素"
  },

  "parenthood": {
    SCENE_TYPE: "新手父母",
    SUBJECT_TYPE: "父母与婴儿",
    AGE_DESC: "成年父母（25-35岁）与新生儿",
    EXPRESSION: "温柔微笑/慈爱凝视/亲吻宝宝",
    CLOTHING: "父母穿协调的休闲家居服装",
    PROPS: "婴儿用品、温馨家居元素"
  },

  "career-achievement": {
    SCENE_TYPE: "职业成就",
    SUBJECT_TYPE: "职场人士",
    AGE_DESC: "成年职场人士（25-60岁）",
    EXPRESSION: "自信微笑/专业姿态/成熟稳重",
    CLOTHING: "职场人士穿正式商务服装",
    PROPS: "奖杯、证书、职业相关道具"
  },

  // ========== 老年期（60岁以上）==========
  "retirement": {
    SCENE_TYPE: "退休纪念",
    SUBJECT_TYPE: "退休人士",
    AGE_DESC: "60岁以上长者",
    EXPRESSION: "慈祥微笑/满足表情/从容姿态",
    CLOTHING: "长者穿舒适的正式或休闲服装",
    PROPS: "退休证书、纪念品、鲜花"
  },

  "golden-anniversary": {
    SCENE_TYPE: "金婚纪念",
    SUBJECT_TYPE: "金婚夫妇",
    AGE_DESC: "70岁以上老年夫妇",
    EXPRESSION: "慈祥微笑/手牵手/深情对视",
    CLOTHING: "老年夫妇穿协调的正式服装",
    PROPS: "金色装饰、鲜花、50周年纪念元素"
  },

  "family-reunion": {
    SCENE_TYPE: "家庭聚会",
    SUBJECT_TYPE: "多代家庭成员",
    AGE_DESC: "全年龄段家庭成员（婴儿至老人）",
    EXPRESSION: "温馨微笑/欢乐互动/亲密依偎",
    CLOTHING: "家庭成员穿协调的休闲或节日服装",
    PROPS: "家庭合影道具、节日装饰"
  }
}

/**
 * 获取里程碑的提示词参数
 * @param milestoneId 里程碑ID
 * @returns 提示词参数对象，如果不存在则返回默认参数
 */
export function getMilestonePromptParams(milestoneId: string): MilestonePromptParams {
  const params = milestonePromptParams[milestoneId]

  if (!params) {
    console.warn(`[MilestonePromptParams] 未找到里程碑 ${milestoneId} 的参数配置，使用默认参数`)
    return {
      SCENE_TYPE: "纪念",
      SUBJECT_TYPE: "人物",
      AGE_DESC: "不同年龄段人物",
      EXPRESSION: "自然表情",
      CLOTHING: "穿着得体服装",
      PROPS: "搭配合适道具"
    }
  }

  return params
}
```

---

### **步骤2：创建通用提示词生成器**

**新建文件**：`src/lib/promptGenerator.ts`

```typescript
/**
 * 通用提示词生成器
 * 根据风格ID和里程碑ID动态生成完整的提示词
 */

import { realisticStudioStyles, type RealisticStudioStyle } from '@/config/styles-realistic-studio'
import { getMilestonePromptParams, type MilestonePromptParams } from '@/config/milestone-prompt-params'

export interface GeneratePromptParams {
  /** 风格ID */
  styleId: string
  /** 里程碑ID */
  milestoneId: string
  /** 可选的自定义覆盖参数 */
  customizations?: Partial<MilestonePromptParams>
}

export interface GeneratePromptResult {
  /** 生成的最终提示词 */
  prompt: string
  /** 使用的风格信息 */
  style: RealisticStudioStyle
  /** 使用的里程碑参数 */
  milestoneParams: MilestonePromptParams
  /** 替换的变量映射（用于调试） */
  replacements: Record<string, string>
}

/**
 * 生成完整的提示词
 * @param params 生成参数
 * @returns 生成结果
 * @throws 如果风格或里程碑不存在
 */
export function generatePrompt(params: GeneratePromptParams): GeneratePromptResult {
  const { styleId, milestoneId, customizations = {} } = params

  // 1. 获取风格配置
  const style = realisticStudioStyles.styles.find(s => s.id === styleId)
  if (!style) {
    throw new Error(`[PromptGenerator] 风格不存在: ${styleId}`)
  }

  // 2. 获取里程碑参数
  const milestoneParams = getMilestonePromptParams(milestoneId)

  // 3. 合并自定义参数
  const finalParams = { ...milestoneParams, ...customizations }

  // 4. 替换提示词模板中的所有变量
  let prompt = style.promptTemplate
  const replacements: Record<string, string> = {}

  // 替换所有可能的变量
  const variableMapping: Record<string, string> = {
    '{SCENE_TYPE}': finalParams.SCENE_TYPE || '',
    '{SUBJECT_TYPE}': finalParams.SUBJECT_TYPE || '',
    '{AGE_DESC}': finalParams.AGE_DESC || '',
    '{EXPRESSION}': finalParams.EXPRESSION || '',
    '{CLOTHING}': finalParams.CLOTHING || '',
    '{PROPS}': finalParams.PROPS || ''
  }

  Object.entries(variableMapping).forEach(([variable, value]) => {
    if (prompt.includes(variable)) {
      prompt = prompt.replace(new RegExp(escapeRegExp(variable), 'g'), value)
      replacements[variable] = value
    }
  })

  console.log('[PromptGenerator] 生成提示词:', {
    styleId,
    styleName: style.name,
    milestoneId,
    replacements
  })

  return {
    prompt,
    style,
    milestoneParams: finalParams,
    replacements
  }
}

/**
 * 批量生成提示词（用于多风格生成）
 * @param styleIds 风格ID数组
 * @param milestoneId 里程碑ID
 * @returns 生成结果数组
 */
export function generateMultiplePrompts(
  styleIds: string[],
  milestoneId: string,
  customizations?: Partial<MilestonePromptParams>
): GeneratePromptResult[] {
  return styleIds.map(styleId => {
    try {
      return generatePrompt({ styleId, milestoneId, customizations })
    } catch (error) {
      console.error(`[PromptGenerator] 生成提示词失败:`, { styleId, milestoneId, error })
      throw error
    }
  })
}

/**
 * 辅助函数：转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 验证提示词模板是否包含有效变量
 * @param template 提示词模板
 * @returns 包含的变量列表
 */
export function validatePromptTemplate(template: string): string[] {
  const variables = [
    'SCENE_TYPE',
    'SUBJECT_TYPE',
    'AGE_DESC',
    'EXPRESSION',
    'CLOTHING',
    'PROPS'
  ]

  return variables.filter(v => template.includes(`{${v}}`))
}
```

---

### **步骤3：更新风格配置模板**

**修改文件**：`src/config/styles-realistic-studio.ts`

需要更新 14 个风格的 `promptTemplate`，添加变量占位符。

**示例更新（以居家暖光温馨风为例）**：

```typescript
// 原提示词
"专业室内婴儿摄影。严格保持参考图中婴儿的面部特征、肤色、五官比例完全一致，3-4个月大婴儿，自然表情（微笑/好奇睁眼/小手抓握/歪头看镜头）。婴儿穿白色棉质短袖+棕色灯芯绒背带裤，戴棕色兔耳毛绒帽，脚踩棕色袜子。..."

// 更新后（添加变量）
"专业{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，{EXPRESSION}。{CLOTHING}。{PROPS}。一束暖黄色自然光从左侧窗户以45度角斜射，在衣角、道具上形成柔和光斑和温暖阴影。背景为纯净米白色（#F5F5DC），非纯白，画面留白占比60%，营造呼吸感。室内居家摄影质感，突出软乎乎童真感。摄影参数：光圈f/2.8，柔和景深虚化，自然色温3500K。比例3:4竖版构图，人物居中偏下。保留原人物真实比例，写实摄影风格，如同专业影楼作品。"
```

**需要替换的部分**：
1. `"专业室内婴儿摄影"` → `"专业{SCENE_TYPE}摄影"`
2. `"婴儿"` → `"{SUBJECT_TYPE}"`
3. `"3-4个月大婴儿"` → `"{AGE_DESC}"`
4. `"自然表情（微笑/好奇睁眼/小手抓握/歪头看镜头）"` → `"{EXPRESSION}"`
5. `"婴儿穿白色棉质短袖+棕色灯芯绒背带裤，戴棕色兔耳毛绒帽，脚踩棕色袜子"` → `"{CLOTHING}"`
6. `"手持彩色字母木块（A/B/C随机），身旁摆放超大棕色LABUBU风格毛绒玩偶"` → `"{PROPS}"`

---

### **步骤4：升级多风格生成器**

**修改文件**：`src/lib/multiStyleGenerator.ts`

```typescript
// 修改前（第 65-68 行）
const prompt = style.promptTemplate
  .replace('[SUBJECT]', 'the person')
  .replace('[MILESTONE_NAME]', milestoneName)

// 修改后
import { generatePrompt } from './promptGenerator'

// ... 在循环中
for (const style of styles) {
  try {
    // 使用新的提示词生成器
    const { prompt } = generatePrompt({
      styleId: style.id,
      milestoneId: params.milestoneId  // 需要在函数参数中添加 milestoneId
    })

    console.log(`[MultiStyleGenerator] Starting style: ${style.name} (${style.id})`)
    console.log(`[MultiStyleGenerator] Generated prompt: ${prompt}`)

    // ... 其余代码保持不变
  }
}
```

**需要修改的接口**：

```typescript
// 原接口
export interface MultiStyleGenerationParams {
  photoPath: string
  styles: Style[]
  milestoneName: string  // 改为 milestoneId
  imagesPerStyle?: number
  onProgress?: (current: number, total: number) => void
  onStyleComplete?: (styleId: string, styleName: string, results: GenerationResult[]) => void
  onStyleFailed?: (styleId: string, styleName: string, error: Error) => void
}

// 更新后
export interface MultiStyleGenerationParams {
  photoPath: string
  styles: Style[]
  milestoneId: string      // 改为 milestoneId
  milestoneName: string    // 保留用于显示
  imagesPerStyle?: number
  onProgress?: (current: number, total: number) => void
  onStyleComplete?: (styleId: string, styleName: string, results: GenerationResult[]) => void
  onStyleFailed?: (styleId: string, styleName: string, error: Error) => void
}
```

---

### **步骤5：更新任务服务（传递里程碑ID）**

**修改文件**：`src/lib/taskService.ts`

确保在调用 `generateMultiStyle` 时传递 `milestoneId`。

可能需要修改的地方（查找 `generateMultiStyle` 调用）：

```typescript
// 修改前
await generateMultiStyle({
  photoPath,
  styles,
  milestoneName: task.milestoneName,
  // ...
})

// 修改后
await generateMultiStyle({
  photoPath,
  styles,
  milestoneId: task.milestoneId,      // 添加
  milestoneName: task.milestoneName,  // 保留
  // ...
})
```

---

### **步骤6：确保页面正确传递里程碑ID**

**检查文件**：`src/app/generation/milestone/page.tsx` 和 `src/app/generation/style/page.tsx`

确认这些页面在创建任务时传递了 `milestoneId`（已存在，无需修改）。

---

## 🔧 需要创建/修改的文件清单

| # | 操作 | 文件路径 | 说明 |
|---|-----|---------|------|
| 1 | ✨ 新建 | `src/config/milestone-prompt-params.ts` | 里程碑参数映射表 |
| 2 | ✨ 新建 | `src/lib/promptGenerator.ts` | 通用提示词生成器 |
| 3 | ✏️ 修改 | `src/config/styles-realistic-studio.ts` | 14个风格添加变量（批量替换） |
| 4 | ✏️ 修改 | `src/lib/multiStyleGenerator.ts` | 使用新生成器，调整接口 |
| 5 | ✏️ 修改 | `src/lib/taskService.ts` | 确保传递 milestoneId（可能无需修改） |

---

## 🤖 Agent分工建议

### Agent 1: TypeScript专家
**负责**：
- 创建 `milestone-prompt-params.ts`（类型定义+数据）
- 创建 `promptGenerator.ts`（核心逻辑）

### Agent 2: 数据处理专家
**负责**：
- 批量更新 `styles-realistic-studio.ts` 中的 14 个提示词模板
- 使用正则替换确保一致性

### Agent 3: 集成测试专家
**负责**：
- 修改 `multiStyleGenerator.ts` 集成新生成器
- 编写单元测试确保正确性
- 验证整个流程

---

## ✅ 验证步骤

### 1. 单元测试

```typescript
// test/promptGenerator.test.ts
import { generatePrompt } from '@/lib/promptGenerator'

test('生成百日照提示词', () => {
  const result = generatePrompt({
    styleId: 'cozy-home-warm-light',
    milestoneId: '100-day'
  })

  expect(result.prompt).toContain('百日纪念')
  expect(result.prompt).toContain('百天宝宝')
  expect(result.prompt).toContain('3-4个月大婴儿')
  expect(result.replacements['{SCENE_TYPE}']).toBe('百日纪念')
})

test('生成周岁照提示词', () => {
  const result = generatePrompt({
    styleId: 'cozy-home-warm-light',
    milestoneId: 'first-birthday'
  })

  expect(result.prompt).toContain('周岁庆典')
  expect(result.prompt).toContain('周岁宝宝')
  expect(result.prompt).toContain('1岁宝宝')
})
```

### 2. 集成测试

手动测试流程：
1. 上传照片 → 选择"百日照" → 选择"居家暖光温馨风" → 生成
2. 检查生成的提示词是否包含"百日纪念"、"百天宝宝"
3. 重复测试其他里程碑（满月、周岁、婚礼等）

### 3. 日志验证

在浏览器控制台查看日志：
```
[PromptGenerator] 生成提示词: {
  styleId: "cozy-home-warm-light",
  styleName: "居家暖光温馨风",
  milestoneId: "100-day",
  replacements: {
    "{SCENE_TYPE}": "百日纪念",
    "{SUBJECT_TYPE}": "百天宝宝",
    ...
  }
}
```

---

## ⚠️ 潜在风险和缓解措施

### 风险1：变量未正确替换
**缓解**：
- 在 `promptGenerator.ts` 中添加调试日志
- 编写单元测试覆盖所有变量

### 风险2：旧代码兼容性
**缓解**：
- 保留旧的 `styles.ts` 不变
- 新风格系统独立运行
- 渐进式迁移

### 风险3：里程碑参数缺失
**缓解**：
- 在 `getMilestonePromptParams` 中提供默认值
- 添加警告日志

---

## 📈 预期效果

### 改造前
- ❌ 14个风格 × 1个年龄段 = 14种组合
- ❌ 每新增1个年龄段需要复制14个风格

### 改造后
- ✅ 14个风格 × 22个里程碑 = 308种组合
- ✅ 新增里程碑只需添加1个参数配置
- ✅ 新增风格只需添加1个模板
- ✅ 代码复用率提升 95%

---

## 📝 实施时间估算

| 步骤 | 预估时间 | 负责人 |
|-----|---------|--------|
| 创建里程碑参数表 | 30分钟 | Agent 1 |
| 创建提示词生成器 | 20分钟 | Agent 1 |
| 更新14个风格模板 | 20分钟 | Agent 2 |
| 修改多风格生成器 | 15分钟 | Agent 3 |
| 编写单元测试 | 15分钟 | Agent 3 |
| 集成测试验证 | 20分钟 | 人工 |
| **总计** | **2小时** | - |

---

## ❓ 待确认问题

1. **是否需要立即支持全部22个里程碑？**
   - 方案A：先实现常用的8-10个，其他渐进添加
   - 方案B：一次性完成全部22个

2. **是否需要在UI上显示动态生成的提示词供用户预览？**
   - 可以在风格选择页面添加"查看提示词"按钮

3. **旧风格系统（styles.ts）如何处理？**
   - 方案A：暂时保留，逐步迁移
   - 方案B：直接废弃，全部使用新系统

4. **是否需要支持用户自定义覆盖参数？**
   - 例如：用户可以手动修改年龄描述

---

**状态**：等待用户确认
**下一步**：确认后立即开始实施
