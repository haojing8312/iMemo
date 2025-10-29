/**
 * 真实影楼拍摄风格配置
 * 专注于还原专业影楼的真实拍摄效果
 * 适用于百日照、周岁照等婴儿里程碑摄影
 *
 * 创建日期: 2025-10-14
 * 版本: 1.0.0
 */

export const realisticStudioStyles = {
  "version": "1.1.0",
  "lastUpdated": "2025-10-14T01:00:00Z",
  "description": "真实影楼拍摄风格 - 还原专业摄影师作品",
  "categories": [
    {
      "id": "cozy-home-realistic",
      "name": "居家温馨系列",
      "description": "温暖的家庭氛围，自然光线，真实生活质感",
      "icon": "🏠"
    },
    {
      "id": "studio-style",
      "name": "风格摄影系列",
      "description": "专业影楼风格，主流审美，高级质感",
      "icon": "🎨"
    },
    {
      "id": "family-interaction",
      "name": "家庭互动系列",
      "description": "捕捉家庭成员间的真实情感连接",
      "icon": "👨‍👩‍👧‍👦"
    },
    {
      "id": "creative-theme",
      "name": "创意主题系列",
      "description": "趣味创意，童话梦幻，独特记忆",
      "icon": "🧸"
    }
  ],
  "styles": [
    // ========== 居家温馨系列 ==========
    {
      "id": "cozy-home-warm-light",
      "name": "居家暖光温馨风",
      "category": "cozy-home-realistic",
      "description": "暖黄光线从窗户斜射，米白色背景，毛绒玩偶陪伴，室内居家摄影质感",
      "promptTemplate": "专业室内{SCENE_TYPE}摄影。去除杂乱背景，严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，自然表情（{EXPRESSION}）。{CLOTHING}。{PROPS}。一束暖黄色自然光从左侧窗户以45度角斜射，在人物衣角、道具上形成柔和光斑和温暖阴影。背景为纯净米白色（#F5F5DC），非纯白，画面留白占比60%，营造呼吸感。室内居家摄影质感，突出温馨感。点缀手写体装饰文字（浅棕色#D2B48C），搭配手绘小太阳、小云朵图案。摄影参数：光圈f/2.8，柔和景深虚化，自然色温3500K。比例3:4竖版构图，人物居中偏下。保留原人物真实比例，写实摄影风格，如同专业影楼作品。",
      "tags": ["居家", "温馨", "暖光", "真实摄影"],
      "exampleImage": "/styles/realistic-cozy-warm.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday"],
      "supportedModes": ["single", "multi"],
      "premium": false,
      "active": true
    },
    {
      "id": "forest-fresh-healing",
      "name": "森系清新治愈风",
      "category": "cozy-home-realistic",
      "description": "浅青色自然光，植物元素装饰，森系日系氛围",
      "promptTemplate": "专业森系室内{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，自然表情（{EXPRESSION}）。{CLOTHING}。{PROPS}。一束浅青色自然光透过带薄纱的窗户，在地面投下细碎光影和叶子影子。背景为浅米色（#FAF0E6），近白色但更柔和，画面留白占比55%。室内森系居家摄影，添加少量植物元素装饰（小叶子、小草莓图案）。氛围治愈萌趣。点缀手写体'Sweet 100 Days'装饰文字（浅绿色#90EE90），文字旁画小树叶、小草莓。摄影参数：光圈f/2.0，柔焦边缘，自然色温4500K，轻微提亮。比例3:4竖版。保留原人物真实比例，写实摄影风格。",
      "tags": ["森系", "清新", "治愈", "自然"],
      "exampleImage": "/styles/realistic-forest-fresh.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten"],
      "supportedModes": ["single", "multi"],
      "premium": false,
      "active": true
    },
    {
      "id": "vintage-film-retro",
      "name": "复古胶片风",
      "category": "cozy-home-realistic",
      "description": "暖橙色光，胶片颗粒感，复古怀旧温馨",
      "promptTemplate": "专业复古胶片风{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，自然表情（{EXPRESSION}）。{CLOTHING}。{PROPS}。一束暖橙色光线透过木质窗框窗户，在墙面投下清晰的窗框阴影和格子图案。背景为奶白色（#FFF8DC），带轻微胶片颗粒感纹理，画面留白占比50%。室内复古居家摄影，质感像80年代老照片般温馨。点缀复古衬线字体'Joyful 100 Days'装饰文字（深棕色#8B4513），文字旁画复古小相机、小气球图案。摄影后期：添加柯达胶片颗粒效果、轻微暗角、色温偏暖3200K、略微褪色处理。比例3:4竖版。保留原人物真实比例，复古胶片摄影风格。",
      "tags": ["复古", "胶片", "怀旧", "温馨"],
      "exampleImage": "/styles/realistic-vintage-film.jpg",
      "compatibleMilestones": ["full-month", "100-day", "first-birthday", "birthday"],
      "supportedModes": ["single", "multi"],
      "premium": false,
      "active": true
    },
    {
      "id": "dreamy-soft-fairy-light",
      "name": "梦幻柔光童话风",
      "category": "cozy-home-realistic",
      "description": "浅紫色柔光，细闪元素，童话梦幻场景",
      "promptTemplate": "专业梦幻柔光{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，自然表情（{EXPRESSION}）。{CLOTHING}。{PROPS}。一束浅紫色柔光透过带纱帘的窗户，在空气中形成可见的细碎光尘和漂浮粒子效果。背景为纯白色（#FFFFFF）带轻微雾感和高光溢出，画面留白占比65%，营造空灵感。室内梦幻居家摄影，氛围像童话场景。点缀带细闪的'Magical 100 Days'装饰文字（浅紫色#E6E6FA配金色闪光），文字旁画手绘星星、小月亮。摄影后期：柔焦滤镜、高光提亮+20、添加星光闪烁特效、柔和光晕。比例3:4竖版。保留原人物真实比例，梦幻写实摄影风格。",
      "tags": ["梦幻", "柔光", "童话", "仙气"],
      "exampleImage": "/styles/realistic-dreamy-fairy.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday"],
      "supportedModes": ["single", "multi"],
      "premium": false,
      "active": true
    },

    // ========== 风格摄影系列 ==========
    {
      "id": "korean-minimalist",
      "name": "韩式简约风",
      "category": "studio-style",
      "description": "极简干净，中性色调，高级感十足",
      "promptTemplate": "专业韩式简约{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，平静安详表情（{EXPRESSION}）。{CLOTHING}。{PROPS}。背景为纯色无缝背景布：浅灰色、米白色或淡粉色（#FFF0F5），完全平整无纹理。顶部柔光箱提供均匀柔和的漫射光，无明显阴影，光线均匀覆盖，色温5500K中性白。画面极简构图，留白占比70%，{SUBJECT_TYPE}占据画面中心偏下1/3处。摄影参数：光圈f/4.0保持清晰，ISO 100，无虚化背景，整体锐利。色彩处理：低饱和度，高级灰调，统一色调。氛围：清爽、现代、极简主义、高级感。比例3:4竖版，严格对称构图。专业影楼韩式摄影风格，写实无滤镜。",
      "tags": ["韩式", "简约", "极简", "高级"],
      "exampleImage": "/styles/realistic-korean-minimalist.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday"],
      "supportedModes": ["single"],
      "premium": true,
      "active": true
    },
    {
      "id": "japanese-fresh-clean",
      "name": "日系小清新风",
      "category": "studio-style",
      "description": "略微过曝，低饱和度，柔焦温柔",
      "promptTemplate": "专业日系小清新{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，温柔表情（{EXPRESSION}）。{CLOTHING}。{PROPS}。背景为纯白色（#FFFFFF）或极浅米色（#FFFAF0），大量留白占比70%。自然窗光从侧面照射，柔和漫射，略微过曝+15%，营造朦胧柔和氛围。色温4800K偏暖。摄影参数：光圈f/1.8，浅景深，边缘柔焦虚化。后期处理：降低饱和度-20%，降低对比度-15%，提高曝光+10%，添加淡淡的乳白色雾感覆层。色调偏向淡粉、米白、奶油色、浅蓝。氛围：温柔、治愈、文艺、小清新。比例3:4竖版。日系杂志摄影风格，写实柔焦。",
      "tags": ["日系", "小清新", "柔焦", "治愈"],
      "exampleImage": "/styles/realistic-japanese-fresh.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday"],
      "supportedModes": ["single"],
      "premium": true,
      "active": true
    },
    {
      "id": "european-vintage-classic",
      "name": "欧美复古风",
      "category": "studio-style",
      "description": "温暖色调，经典摆拍，高级质感",
      "promptTemplate": "专业欧美复古{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，经典姿势（{EXPRESSION}）。{CLOTHING}。{PROPS}。背景：深棕色木质背景板、复古花纹墙纸、或深绿色天鹅绒布料。光线为经典伦勃朗光：主光源从45度角照射，形成明显的三角光区，保留适度阴影增加立体感。色温3200K温暖调。摄影参数：光圈f/2.8，中度景深虚化。色调处理：深棕#8B4513、暖橙#FF8C00、奶油黄#FFE4B5、橄榄绿#6B8E23、古铜色。略微降低高光，增加阴影细节，营造经典胶片质感。氛围：经典、永恒、复古、高级。比例4:3横版，经典构图。欧美影楼摄影风格，写实光影。",
      "tags": ["欧美", "复古", "经典", "高级"],
      "exampleImage": "/styles/realistic-european-vintage.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday"],
      "supportedModes": ["single"],
      "premium": true,
      "active": true
    },
    {
      "id": "milk-bath-flowers",
      "name": "牛奶浴鲜花风",
      "category": "studio-style",
      "description": "乳白液体，漂浮鲜花，俯拍视角",
      "promptTemplate": "专业牛奶浴{SCENE_TYPE}摄影，俯拍视角。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，安静表情（{EXPRESSION}）。{SUBJECT_TYPE}平躺在圆形白色浴盆中（直径80cm），盆内装有乳白色液体（牛奶与温水混合，呈现乳白色#FFFEF0），液体刚好覆盖{SUBJECT_TYPE}身体至肩部，头部露出水面。{PROPS}。相机正上方90度俯拍，{SUBJECT_TYPE}脸部居中。柔和顶光，光线均匀，无阴影。色调：乳白、粉色#FFB6C1、淡紫#E6E6FA、浅黄#FFFACD。摄影参数：光圈f/4.0保持清晰，俯拍稳定，ISO 200。后期：轻微提亮，柔化肤色，增强花朵色彩饱和度+10%。安全提示：确保温水温度适宜26-28°C，花朵无害无刺，拍摄时间控制在5-10分钟。氛围：梦幻、唯美、仙气、治愈。比例1:1方形或4:3横版。2025年爆款影楼风格，写实摄影。",
      "tags": ["牛奶浴", "鲜花", "俯拍", "梦幻"],
      "exampleImage": "/styles/realistic-milk-bath.jpg",
      "compatibleMilestones": ["full-month", "100-day"],
      "supportedModes": ["single"],
      "premium": true,
      "active": true
    },

    // ========== 家庭互动系列 ==========
    {
      "id": "warm-family-interaction",
      "name": "温馨亲子互动风",
      "category": "family-interaction",
      "description": "父母与宝宝互动，捕捉真实情感连接",
      "promptTemplate": "专业家庭亲子互动{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}。场景：温馨家庭环境，父母与{SUBJECT_TYPE}自然互动。姿势选项：{EXPRESSION}。{CLOTHING}。{PROPS}。背景：简约家居环境，米色沙发、白色床铺、或纯色背景墙（浅灰#E8E8E8）。自然窗光从侧面照射，柔和温暖，色温4000K。捕捉真实情感瞬间：父母的微笑、凝视{SUBJECT_TYPE}的眼神、{SUBJECT_TYPE}回应父母的表情、手部接触的温柔瞬间。摄影参数：光圈f/2.8，中度景深保持三人清晰，背景柔和虚化。色调：温暖米色调，皮肤自然红润。氛围：温馨、爱意、连接、幸福。构图：三人视觉三角形构图或紧密特写。比例4:3横版。生活方式纪实摄影风格，写实自然。",
      "tags": ["亲子", "家庭", "互动", "温馨"],
      "exampleImage": "/styles/realistic-family-warm.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday"],
      "supportedModes": ["multi"],
      "premium": false,
      "active": true
    },
    {
      "id": "three-generation-family",
      "name": "三代同堂温馨风",
      "category": "family-interaction",
      "description": "祖孙三代，家族传承，温暖幸福",
      "promptTemplate": "专业三代同堂家庭{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}。成员：{SUBJECT_TYPE}+父母（30-35岁）+祖父母（60-65岁），共5-6人。场景：温馨客厅或家庭环境，围坐在米色/灰色大沙发上，或围成半圆站立/坐姿。{SUBJECT_TYPE}居于画面中心，由妈妈或奶奶抱着，其他家庭成员围绕在旁，自然互动（{EXPRESSION}）。{CLOTHING}。背景：简约家居环境，木质家具、绿植点缀，或纯色墙面。自然光+辅助柔光灯，光线均匀覆盖所有人，色温4200K自然暖色。摄影参数：光圈f/5.6保持景深，所有人脸清晰。构图：横向排列或扇形围绕构图，{SUBJECT_TYPE}居中偏下。色调：温暖和谐，皮肤自然。氛围：家族传承、温暖、幸福、多代连接。比例4:3横版或16:9横版。家庭纪实摄影风格，写实自然光。",
      "tags": ["三代", "家庭", "传承", "温暖"],
      "exampleImage": "/styles/realistic-three-generation.jpg",
      "compatibleMilestones": ["full-month", "100-day", "first-birthday"],
      "supportedModes": ["multi"],
      "premium": false,
      "active": true
    },

    // ========== 创意主题系列 ==========
    {
      "id": "animal-theme-cute",
      "name": "动物主题萌趣风",
      "category": "creative-theme",
      "description": "小动物造型，可爱萌趣，童真自然",
      "promptTemplate": "专业动物主题{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}。主题：小兔子/小熊/小鹿/小狮子（四选一）。{CLOTHING}。{PROPS}。背景：根据动物主题设定（兔子：草地绿色背景#90EE90+人造草皮；熊：森林棕色背景#8B7355+木桩道具；鹿：秋季森林黄褐色背景#D2B48C+树叶；狮子：非洲草原金黄色背景#F0E68C）。自然柔和光线，色温5000K中性自然。摄影参数：光圈f/2.8，柔和景深虚化背景。色调：自然色彩，根据主题调整（棕色、绿色、米色为主）。氛围：可爱、萌趣、自然、童真。构图：{SUBJECT_TYPE}与玩偶互动，或{SUBJECT_TYPE}独立特写。比例3:4竖版。儿童创意摄影风格，写实可爱。",
      "tags": ["动物", "萌趣", "可爱", "主题"],
      "exampleImage": "/styles/realistic-animal-theme.jpg",
      "compatibleMilestones": ["full-month", "100-day", "first-birthday"],
      "supportedModes": ["single", "multi"],
      "premium": false,
      "active": true
    },
    {
      "id": "starry-night-dream",
      "name": "星空梦境风",
      "category": "creative-theme",
      "description": "深蓝星空，月亮星星，夜空梦幻",
      "promptTemplate": "专业星空梦境{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}，安静表情（{EXPRESSION}）。{CLOTHING}。{PROPS}。背景：深蓝色夜空背景布（#191970），点缀发光的星星贴纸或投影星空效果。光线：柔和蓝色调灯光色温7000K冷色调+暖黄色星星灯串3000K点缀，营造夜空氛围但保持{SUBJECT_TYPE}肤色自然。摄影参数：光圈f/2.0，星星灯串形成梦幻光斑虚化效果。色调：深蓝#191970、金色星光#FFD700、乳白云朵#FFFEF0。后期添加：星星闪烁光效、柔和光晕、轻微雾感。氛围：梦幻、宁静、夜空、童话。构图：{SUBJECT_TYPE}居中，星星和月亮环绕。比例3:4竖版。创意梦幻摄影风格，写实合成。",
      "tags": ["星空", "梦境", "夜晚", "梦幻"],
      "exampleImage": "/styles/realistic-starry-night.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day"],
      "supportedModes": ["single", "multi"],
      "premium": true,
      "active": true
    },
    {
      "id": "fairy-tale-story",
      "name": "童话故事风",
      "category": "creative-theme",
      "description": "经典童话场景，想象力，梦幻童趣",
      "promptTemplate": "专业童话故事主题{SCENE_TYPE}摄影。严格保持参考图中{SUBJECT_TYPE}的面部特征、肤色、五官比例完全一致，{AGE_DESC}。主题：小王子/爱丽丝梦游仙境/小熊维尼（三选一）。{CLOTHING}。{PROPS}。光线：柔和童话风光线，根据主题调整色温（小王子冷色调6000K，爱丽丝中性5500K，维尼暖色调4000K）。摄影参数：光圈f/2.8，道具虚化。色调根据主题调整。氛围：童话、梦幻、童趣、想象力。比例4:3横版。创意主题摄影，写实童话风。",
      "tags": ["童话", "故事", "创意", "梦幻"],
      "exampleImage": "/styles/realistic-fairy-tale.jpg",
      "compatibleMilestones": ["100-day", "first-birthday"],
      "supportedModes": ["single", "multi"],
      "premium": true,
      "active": true
    }
  ]
}

// 导出类型定义
export type RealisticStudioStyle = typeof realisticStudioStyles.styles[0]
export type RealisticStudioCategory = typeof realisticStudioStyles.categories[0]
