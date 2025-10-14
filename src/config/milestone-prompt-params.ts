/**
 * 里程碑提示词参数映射表
 * 为每个里程碑定义生成提示词所需的动态参数
 *
 * 创建日期: 2025-10-14
 * 版本: 1.0.0
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
  /** 服装描述（可选，用于替换模板中的服装部分） */
  CLOTHING?: string
  /** 道具描述（可选，用于替换模板中的道具部分） */
  PROPS?: string
}

/**
 * 全部22个里程碑的参数映射
 * 覆盖从出生到老年期的完整生命周期
 */
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
    PROPS: "月亮装饰、\"满月快乐\"文字、毛绒玩偶"
  },

  "100-day": {
    SCENE_TYPE: "百日纪念",
    SUBJECT_TYPE: "百天宝宝",
    AGE_DESC: "3-4个月大婴儿",
    EXPRESSION: "微笑/好奇睁眼/小手抓握/歪头看镜头",
    CLOTHING: "婴儿穿白色棉质短袖+背带裤，戴可爱帽子，脚踩袜子",
    PROPS: "手持彩色字母木块，身旁摆放超大毛绒玩偶，点缀数字\"100\"装饰"
  },

  "first-birthday": {
    SCENE_TYPE: "周岁庆典",
    SUBJECT_TYPE: "周岁宝宝",
    AGE_DESC: "1岁宝宝",
    EXPRESSION: "开心笑/拍手/好奇探索",
    CLOTHING: "宝宝穿节日服装或连衣裙/小西装",
    PROPS: "生日蛋糕、彩色气球、数字\"1\"装饰、派对装饰"
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

  "middle-school-graduation": {
    SCENE_TYPE: "初中毕业",
    SUBJECT_TYPE: "初中生",
    AGE_DESC: "14-15岁青少年",
    EXPRESSION: "青春笑容/自信姿态/认真表情",
    CLOTHING: "学生穿校服或正式服装",
    PROPS: "毕业证书、书本、青春纪念元素"
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
    console.warn(`[MilestonePromptParams] 未找到里程碑 "${milestoneId}" 的参数配置，使用默认参数`)

    // 返回通用默认参数
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

/**
 * 获取所有已定义的里程碑ID列表
 * @returns 里程碑ID数组
 */
export function getAllMilestoneIds(): string[] {
  return Object.keys(milestonePromptParams)
}

/**
 * 检查里程碑ID是否已定义参数
 * @param milestoneId 里程碑ID
 * @returns 是否已定义
 */
export function hasMilestoneParams(milestoneId: string): boolean {
  return milestoneId in milestonePromptParams
}
