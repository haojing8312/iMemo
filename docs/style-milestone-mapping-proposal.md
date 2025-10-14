# 风格与里程碑动态映射方案

## 📋 问题分析

### 当前问题
现有提示词包含硬编码的年龄描述：
```
"3-4个月大婴儿"
"专业室内婴儿摄影"
```

这导致：
- ❌ 风格只能用于特定年龄段
- ❌ 无法复用于满月照、周岁照、儿童照等
- ❌ 每个年龄段都需要重复定义相同的风格

### 理想方案
风格应该是**通用的视觉风格**，可以应用于任何年龄段：
- ✅ "居家暖光温馨风" 可用于：百日照、满月照、周岁照、家庭照...
- ✅ "韩式简约风" 可用于：婴儿照、儿童照、成人照、全家福...
- ✅ 同一个风格模板，根据不同的里程碑动态生成提示词

---

## 🎯 解决方案设计

### 方案架构

```
风格配置（通用模板）
    ↓
里程碑信息（年龄段/人物类型）
    ↓
动态生成（运行时替换变量）
    ↓
最终提示词
```

---

## 📐 方案1：模板变量系统（推荐）

### 1.1 定义变量占位符

在提示词中使用多个变量：

```typescript
{
  "promptTemplate": "专业{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESCRIPTION}，{EXPRESSION_OPTIONS}。{CLOTHING_DESCRIPTION}。{PROPS_DESCRIPTION}。{LIGHTING_DESCRIPTION}。{BACKGROUND_DESCRIPTION}。{ATMOSPHERE}。{PHOTO_PARAMS}。"
}
```

### 1.2 里程碑配置映射

为每个里程碑定义变量值：

```typescript
// src/config/milestone-prompts.ts
export const milestonePromptParams = {
  // 婴儿期
  "birth": {
    SCENE_TYPE: "新生儿",
    SUBJECT_TYPE: "新生婴儿",
    AGE_DESCRIPTION: "0-7天新生儿",
    EXPRESSION_OPTIONS: "安静熟睡/微微睁眼/小手握拳",
    CLOTHING_DESCRIPTION: "婴儿穿纯白色包裹巾或连体衣",
    DEFAULT_PROPS: "柔软毯子、简约装饰"
  },

  "full-month": {
    SCENE_TYPE: "满月纪念",
    SUBJECT_TYPE: "满月宝宝",
    AGE_DESCRIPTION: "满月（30天）宝宝",
    EXPRESSION_OPTIONS: "微笑/好奇睁眼/安静凝视",
    CLOTHING_DESCRIPTION: "婴儿穿白色/粉色连体衣或传统满月服",
    DEFAULT_PROPS: "月亮装饰、"满月快乐"文字、毛绒玩偶"
  },

  "100-day": {
    SCENE_TYPE: "百日纪念",
    SUBJECT_TYPE: "百天宝宝",
    AGE_DESCRIPTION: "3-4个月大婴儿",
    EXPRESSION_OPTIONS: "微笑/好奇睁眼/小手抓握/歪头看镜头",
    CLOTHING_DESCRIPTION: "婴儿穿白色棉质短袖+背带裤，戴可爱帽子",
    DEFAULT_PROPS: "字母木块、数字"100"、毛绒玩偶、彩色装饰"
  },

  "first-birthday": {
    SCENE_TYPE: "周岁庆典",
    SUBJECT_TYPE: "周岁宝宝",
    AGE_DESCRIPTION: "1岁宝宝",
    EXPRESSION_OPTIONS: "开心笑/拍手/好奇探索/吃蛋糕",
    CLOTHING_DESCRIPTION: "宝宝穿节日服装或连衣裙/小西装",
    DEFAULT_PROPS: "生日蛋糕、气球、数字"1"、派对装饰"
  },

  // 童年期
  "kindergarten": {
    SCENE_TYPE: "幼儿园毕业",
    SUBJECT_TYPE: "幼儿",
    AGE_DESCRIPTION: "3-6岁儿童",
    EXPRESSION_OPTIONS: "开心笑容/调皮表情/自信姿态",
    CLOTHING_DESCRIPTION: "儿童穿幼儿园毕业服或休闲服装",
    DEFAULT_PROPS: "毕业证书、玩具、书包"
  },

  "elementary-graduation": {
    SCENE_TYPE: "小学毕业",
    SUBJECT_TYPE: "小学生",
    AGE_DESCRIPTION: "11-12岁少年/少女",
    EXPRESSION_OPTIONS: "自信微笑/阳光笑容/认真表情",
    CLOTHING_DESCRIPTION: "学生穿校服或正式服装",
    DEFAULT_PROPS: "毕业证书、书本、校园元素"
  },

  "birthday": {
    SCENE_TYPE: "生日庆典",
    SUBJECT_TYPE: "儿童",
    AGE_DESCRIPTION: "根据实际年龄（1-12岁儿童）",
    EXPRESSION_OPTIONS: "开心笑/吹蜡烛/拆礼物/玩耍",
    CLOTHING_DESCRIPTION: "儿童穿派对服装或休闲服装",
    DEFAULT_PROPS: "生日蛋糕、气球、礼物、彩带"
  },

  // 青春期
  "middle-school-graduation": {
    SCENE_TYPE: "初中毕业",
    SUBJECT_TYPE: "初中生",
    AGE_DESCRIPTION: "14-15岁青少年",
    EXPRESSION_OPTIONS: "青春笑容/自信姿态/认真表情",
    CLOTHING_DESCRIPTION: "学生穿校服或正式服装",
    DEFAULT_PROPS: "毕业证书、书本、青春纪念元素"
  },

  "high-school-graduation": {
    SCENE_TYPE: "高中毕业",
    SUBJECT_TYPE: "高中生",
    AGE_DESCRIPTION: "17-18岁青年",
    EXPRESSION_OPTIONS: "成熟微笑/阳光自信/青春活力",
    CLOTHING_DESCRIPTION: "学生穿学士服或正式服装",
    DEFAULT_PROPS: "学士帽、毕业证书、校园背景"
  },

  "coming-of-age": {
    SCENE_TYPE: "成人礼",
    SUBJECT_TYPE: "成年人",
    AGE_DESCRIPTION: "18岁青年",
    EXPRESSION_OPTIONS: "成熟微笑/自信姿态/优雅表情",
    CLOTHING_DESCRIPTION: "青年穿正式礼服或传统成人礼服装",
    DEFAULT_PROPS: "成人礼道具、鲜花、纪念元素"
  },

  // 成年期
  "college-graduation": {
    SCENE_TYPE: "大学毕业",
    SUBJECT_TYPE: "大学生",
    AGE_DESCRIPTION: "22-24岁青年",
    EXPRESSION_OPTIONS: "自信微笑/欣喜表情/学术姿态",
    CLOTHING_DESCRIPTION: "学生穿学士服",
    DEFAULT_PROPS: "学士帽、学位证书、大学校园背景"
  },

  "wedding": {
    SCENE_TYPE: "婚礼纪念",
    SUBJECT_TYPE: "新人",
    AGE_DESCRIPTION: "成年新婚夫妇",
    EXPRESSION_OPTIONS: "幸福微笑/深情凝视/温柔相拥",
    CLOTHING_DESCRIPTION: "新娘穿婚纱，新郎穿礼服",
    DEFAULT_PROPS: "鲜花、婚戒、浪漫装饰"
  },

  "anniversary": {
    SCENE_TYPE: "纪念日庆祝",
    SUBJECT_TYPE: "夫妇",
    AGE_DESCRIPTION: "成年夫妇",
    EXPRESSION_OPTIONS: "温馨微笑/深情对视/手牵手",
    CLOTHING_DESCRIPTION: "夫妇穿协调的正式或休闲服装",
    DEFAULT_PROPS: "鲜花、纪念装饰、浪漫元素"
  },

  "parenthood": {
    SCENE_TYPE: "新手父母",
    SUBJECT_TYPE: "父母与婴儿",
    AGE_DESCRIPTION: "成年父母（25-35岁）与新生儿",
    EXPRESSION_OPTIONS: "温柔微笑/慈爱凝视/亲吻宝宝",
    CLOTHING_DESCRIPTION: "父母穿协调的休闲家居服装",
    DEFAULT_PROPS: "婴儿用品、温馨家居元素"
  },

  "career-achievement": {
    SCENE_TYPE: "职业成就",
    SUBJECT_TYPE: "职场人士",
    AGE_DESCRIPTION: "成年职场人士（25-60岁）",
    EXPRESSION_OPTIONS: "自信微笑/专业姿态/成熟稳重",
    CLOTHING_DESCRIPTION: "职场人士穿正式商务服装",
    DEFAULT_PROPS: "奖杯、证书、职业相关道具"
  },

  // 老年期
  "retirement": {
    SCENE_TYPE: "退休纪念",
    SUBJECT_TYPE: "退休人士",
    AGE_DESCRIPTION: "60岁以上长者",
    EXPRESSION_OPTIONS: "慈祥微笑/满足表情/从容姿态",
    CLOTHING_DESCRIPTION: "长者穿舒适的正式或休闲服装",
    DEFAULT_PROPS: "退休证书、纪念品、鲜花"
  },

  "golden-anniversary": {
    SCENE_TYPE: "金婚纪念",
    SUBJECT_TYPE: "金婚夫妇",
    AGE_DESCRIPTION: "70岁以上老年夫妇",
    EXPRESSION_OPTIONS: "慈祥微笑/手牵手/深情对视",
    CLOTHING_DESCRIPTION: "老年夫妇穿协调的正式服装",
    DEFAULT_PROPS: "金色装饰、鲜花、50周年纪念元素"
  },

  "family-reunion": {
    SCENE_TYPE: "家庭聚会",
    SUBJECT_TYPE: "多代家庭成员",
    AGE_DESCRIPTION: "全年龄段家庭成员（婴儿至老人）",
    EXPRESSION_OPTIONS: "温馨微笑/欢乐互动/亲密依偎",
    CLOTHING_DESCRIPTION: "家庭成员穿协调的休闲或节日服装",
    DEFAULT_PROPS: "家庭合影道具、节日装饰"
  }
}
```

### 1.3 运行时动态生成

```typescript
// src/lib/promptGenerator.ts

interface GeneratePromptParams {
  styleId: string           // 风格ID
  milestoneId: string       // 里程碑ID
  customizations?: {        // 可选的自定义覆盖
    SCENE_TYPE?: string
    SUBJECT_TYPE?: string
    AGE_DESCRIPTION?: string
    // ...更多自定义
  }
}

export function generatePrompt(params: GeneratePromptParams): string {
  const { styleId, milestoneId, customizations = {} } = params

  // 1. 获取风格模板
  const style = realisticStudioStyles.styles.find(s => s.id === styleId)
  if (!style) throw new Error(`Style not found: ${styleId}`)

  // 2. 获取里程碑参数
  const milestoneParams = milestonePromptParams[milestoneId]
  if (!milestoneParams) throw new Error(`Milestone not found: ${milestoneId}`)

  // 3. 合并自定义参数
  const finalParams = { ...milestoneParams, ...customizations }

  // 4. 替换所有变量
  let prompt = style.promptTemplate
  Object.entries(finalParams).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    prompt = prompt.replace(regex, value)
  })

  return prompt
}

// 使用示例
const prompt = generatePrompt({
  styleId: 'cozy-home-warm-light',
  milestoneId: '100-day'
})
// 输出："专业百日纪念摄影。严格保持参考图中百天宝宝的面部特征..."

const prompt2 = generatePrompt({
  styleId: 'cozy-home-warm-light',
  milestoneId: 'first-birthday'
})
// 输出："专业周岁庆典摄影。严格保持参考图中周岁宝宝的面部特征..."
```

---

## 📐 方案2：分层模板系统（更灵活）

### 2.1 将提示词拆分为多个模块

```typescript
// src/config/prompt-modules.ts

export const promptModules = {
  // 基础结构
  base: {
    prefix: "专业{SCENE_TYPE}摄影。",
    faceKeeping: "严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，",
    ageAndExpression: "{AGE_DESCRIPTION}，{EXPRESSION_OPTIONS}。",
    suffix: "{PHOTO_PARAMS}。{ATMOSPHERE}。比例{ASPECT_RATIO}。"
  },

  // 服装模块（可选）
  clothing: {
    babyBasic: "婴儿穿白色棉质短袖+背带裤，戴可爱帽子，脚踩袜子。",
    babyFormal: "婴儿穿节日礼服或传统服装。",
    childCasual: "儿童穿休闲服装。",
    childFormal: "儿童穿正式服装或校服。",
    adultCasual: "穿协调的休闲服装。",
    adultFormal: "穿正式商务服装或礼服。"
  },

  // 道具模块（可选）
  props: {
    baby100Day: "手持彩色字母木块，身旁摆放超大毛绒玩偶，点缀数字"100"装饰。",
    babyBirthday: "周围有生日蛋糕、气球、派对装饰。",
    graduation: "手持毕业证书，周围有学士帽、书本等装饰。",
    wedding: "周围有鲜花、婚戒等浪漫装饰。",
    minimal: "无多余道具，保持简约。"
  },

  // 光线模块（风格特定）
  lighting: {
    warmIndoor: "一束暖黄色自然光从左侧窗户以45度角斜射，在衣角、道具上形成柔和光斑和温暖阴影。",
    softDiffused: "柔和均匀的漫射光，无明显阴影，光线均匀覆盖。",
    dramaticSide: "侧光营造戏剧性光影，形成明显的明暗对比。",
    naturalWindow: "自然窗光从侧面照射，柔和漫射，略微过曝，营造朦胧柔和氛围。"
  },

  // 背景模块（风格特定）
  background: {
    warmBeige: "背景为纯净米白色（#F5F5DC），画面留白占比60%，营造呼吸感。",
    pureWhite: "背景为纯白色（#FFFFFF），大量留白占比70%。",
    minimalistGray: "背景为浅灰色无缝背景布，完全平整无纹理。",
    vintageBrown: "背景为奶白色（#FFF8DC），带轻微胶片颗粒感纹理。"
  }
}
```

### 2.2 组合模块生成提示词

```typescript
// src/lib/modularPromptGenerator.ts

interface ModularPromptParams {
  milestoneId: string
  styleModules: {
    lighting: keyof typeof promptModules.lighting
    background: keyof typeof promptModules.background
    clothing?: keyof typeof promptModules.clothing
    props?: keyof typeof promptModules.props
  }
  photoParams: string
  atmosphere: string
  aspectRatio: string
}

export function generateModularPrompt(params: ModularPromptParams): string {
  const milestone = milestonePromptParams[params.milestoneId]
  const modules = promptModules

  // 组装提示词
  const parts = [
    modules.base.prefix
      .replace('{SCENE_TYPE}', milestone.SCENE_TYPE),

    modules.base.faceKeeping
      .replace('{SUBJECT_TYPE}', milestone.SUBJECT_TYPE),

    modules.base.ageAndExpression
      .replace('{AGE_DESCRIPTION}', milestone.AGE_DESCRIPTION)
      .replace('{EXPRESSION_OPTIONS}', milestone.EXPRESSION_OPTIONS),

    params.styleModules.clothing
      ? modules.clothing[params.styleModules.clothing]
      : milestone.CLOTHING_DESCRIPTION,

    params.styleModules.props
      ? modules.props[params.styleModules.props]
      : milestone.DEFAULT_PROPS,

    modules.lighting[params.styleModules.lighting],
    modules.background[params.styleModules.background],

    modules.base.suffix
      .replace('{PHOTO_PARAMS}', params.photoParams)
      .replace('{ATMOSPHERE}', params.atmosphere)
      .replace('{ASPECT_RATIO}', params.aspectRatio)
  ]

  return parts.join(' ')
}
```

---

## 📐 方案3：简化版（最小改动）

### 3.1 只替换关键变量

保持现有提示词结构，只替换最少必要的变量：

```typescript
// 原提示词
"专业室内婴儿摄影。严格保持参考图中婴儿的面部特征、肤色、五官比例完全一致，3-4个月大婴儿，自然表情..."

// 改为
"专业{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，{EXPRESSION}..."
```

### 3.2 简化的映射表

```typescript
export const simpleMilestoneMapping = {
  "birth": { SCENE_TYPE: "新生儿", SUBJECT_TYPE: "新生婴儿", AGE_DESC: "0-7天新生儿", EXPRESSION: "安静熟睡/微微睁眼" },
  "full-month": { SCENE_TYPE: "满月纪念", SUBJECT_TYPE: "满月宝宝", AGE_DESC: "满月宝宝", EXPRESSION: "微笑/好奇睁眼" },
  "100-day": { SCENE_TYPE: "百日纪念", SUBJECT_TYPE: "百天宝宝", AGE_DESC: "3-4个月大婴儿", EXPRESSION: "微笑/好奇/小手抓握" },
  "first-birthday": { SCENE_TYPE: "周岁庆典", SUBJECT_TYPE: "周岁宝宝", AGE_DESC: "1岁宝宝", EXPRESSION: "开心笑/拍手" },
  "kindergarten": { SCENE_TYPE: "幼儿园毕业", SUBJECT_TYPE: "幼儿", AGE_DESC: "3-6岁儿童", EXPRESSION: "开心笑容/调皮表情" },
  "elementary-graduation": { SCENE_TYPE: "小学毕业", SUBJECT_TYPE: "小学生", AGE_DESC: "11-12岁少年/少女", EXPRESSION: "自信微笑" },
  "wedding": { SCENE_TYPE: "婚礼纪念", SUBJECT_TYPE: "新人", AGE_DESC: "成年新婚夫妇", EXPRESSION: "幸福微笑/深情凝视" },
  // ... 更多映射
}
```

---

## 📊 方案对比

| 特性 | 方案1：完整变量系统 | 方案2：分层模块系统 | 方案3：简化版 |
|-----|------------------|------------------|------------|
| **灵活性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **实现复杂度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **维护成本** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **可读性** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **扩展性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## ✅ 推荐方案：方案1 + 渐进优化

### 第一阶段：最小改动（立即实施）
1. 采用**方案3**，只替换 4 个核心变量
2. 更新现有 14 个风格的提示词
3. 创建简化的里程碑映射表

### 第二阶段：完善系统（1-2周后）
1. 扩展为**方案1**的完整变量系统
2. 为所有 22 个里程碑创建完整映射
3. 添加自定义覆盖功能

### 第三阶段：高级功能（未来）
1. 引入**方案2**的模块化系统
2. 支持风格混合
3. AI 智能提示词生成

---

## 🚀 实施步骤

### Step 1: 更新风格配置
```typescript
// 修改 src/config/styles-realistic-studio.ts
{
  "promptTemplate": "专业{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，{EXPRESSION}。..."
}
```

### Step 2: 创建里程碑映射
```typescript
// 新建 src/config/milestone-prompt-params.ts
export const milestonePromptParams = { ... }
```

### Step 3: 实现生成器
```typescript
// 新建 src/lib/promptGenerator.ts
export function generatePrompt(params) { ... }
```

### Step 4: 集成到现有流程
```typescript
// 修改 src/lib/imageGenerators/seedream.ts
const prompt = generatePrompt({
  styleId: userSelectedStyleId,
  milestoneId: userSelectedMilestoneId
})
```

---

## 📝 示例对比

### 使用前（硬编码）
```
居家暖光温馨风 → 只能用于百日照
```

### 使用后（动态映射）
```
居家暖光温馨风 + 百日照 → "专业百日纪念摄影。严格保持参考图中百天宝宝..."
居家暖光温馨风 + 满月照 → "专业满月纪念摄影。严格保持参考图中满月宝宝..."
居家暖光温馨风 + 周岁照 → "专业周岁庆典摄影。严格保持参考图中周岁宝宝..."
居家暖光温馨风 + 婚礼照 → "专业婚礼纪念摄影。严格保持参考图中新人..."
```

---

## 🎯 预期收益

1. **代码复用** - 14 个风格 × 22 个里程碑 = 308 种组合，只需维护 14 个模板
2. **灵活扩展** - 新增里程碑或风格时，无需重复工作
3. **用户体验** - 任何风格都可用于任何里程碑
4. **维护成本** - 集中管理，易于优化和迭代

---

**创建者**: Claude
**日期**: 2025-10-14
**状态**: 提案设计
