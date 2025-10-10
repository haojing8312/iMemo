export const styleConfig = {
  "version": "3.0.0",
  "lastUpdated": "2025-10-09T00:00:00Z",
  "description": "AI时代创意风格系统 - 天马行空的艺术创作",
  "categories": [
    {
      "id": "art-masterpieces",
      "name": "艺术流派大师",
      "description": "将照片转换为世界名画风格",
      "icon": "🎨"
    },
    {
      "id": "anime-ip",
      "name": "动漫IP世界",
      "description": "变身动画角色，进入动漫世界",
      "icon": "🎬"
    },
    {
      "id": "sci-fi-future",
      "name": "科幻未来",
      "description": "探索未来世界和科技美学",
      "icon": "🚀"
    },
    {
      "id": "fantasy-magic",
      "name": "奇幻魔法",
      "description": "进入童话和魔法世界",
      "icon": "✨"
    },
    {
      "id": "trendy-creative",
      "name": "潮流创意",
      "description": "街头艺术和创意设计风格",
      "icon": "🎪"
    },
    {
      "id": "cozy-home",
      "name": "居家温馨",
      "description": "温暖的日常生活场景",
      "icon": "🏠"
    }
  ],
  "styles": [
    {
      "id": "vangogh-starry-night",
      "name": "梵高星空梦境",
      "category": "art-masterpieces",
      "description": "将人物置于梵高《星空》的漩涡星河中，温柔包裹在流动的蓝色与金色漩涡里",
      "promptTemplate": "保持[SUBJECT]面部特征不变，去除原始背景，将人物重新绘制在梵高星空风格的宇宙中。背景是深蓝色夜空，布满金黄色螺旋星云和流动的漩涡，人物被柔软的云朵包裹，周围环绕着发光的星星。采用梵高标志性的厚重笔触、旋转的线条和强烈的色彩对比。整体色调为深蓝、金黄、钴蓝。添加手绘质感，油画笔触明显。氛围：梦幻、神圣、宇宙级的温柔。比例3:4竖版。",
      "tags": ["艺术", "梦幻", "经典", "油画"],
      "exampleImage": "/styles/vangogh-starry-night.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "birthday", "wedding", "anniversary"],
      "premium": true,
      "active": true
    },
    {
      "id": "ghibli-magic-forest",
      "name": "吉卜力魔法森林",
      "category": "anime-ip",
      "description": "宫崎骏动画风格，人物在被小精灵守护的森林中，龙猫微笑守护",
      "promptTemplate": "保持[SUBJECT]面部特征，完全转换为吉卜力工作室动画风格。背景是宫崎骏式的魔法森林，参天古树、发光的蘑菇、漂浮的树种。周围有小龙猫、煤球精灵、小树精守护。色彩温暖柔和，有动画手绘的质感和线条。阳光透过树叶洒下斑驳光影，空气中飘着金色光点。氛围：治愈、魔法、纯真。比例4:3横版。",
      "tags": ["动漫", "治愈", "童话", "日系"],
      "exampleImage": "/styles/ghibli-magic-forest.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday", "family-reunion"],
      "premium": true,
      "active": true
    },
    {
      "id": "cyberpunk-neon",
      "name": "赛博朋克霓虹未来",
      "category": "sci-fi-future",
      "description": "未来科技感，霓虹灯管和数据流环绕，全息投影效果",
      "promptTemplate": "保持[SUBJECT]面部特征，将场景转换为赛博朋克未来世界。背景是深色调的未来城市夜景，蓝色和紫色的霓虹灯管、浮动的数字代码流、全息投影元素。采用赛博朋克典型配色：电光蓝、霓虹紫、洋红、深蓝黑。添加科技感UI界面元素、光线粒子效果、全息投影质感。氛围：科技、未来、希望。比例3:4竖版。",
      "tags": ["科幻", "未来", "霓虹", "酷炫"],
      "exampleImage": "/styles/cyberpunk-neon.jpg",
      "compatibleMilestones": ["birth", "coming-of-age", "college-graduation", "wedding", "career-achievement"],
      "premium": true,
      "active": true
    },
    {
      "id": "watercolor-dream",
      "name": "水彩童话梦",
      "category": "fantasy-magic",
      "description": "柔和的水彩晕染，彩虹云朵，手绘小动物围绕",
      "promptTemplate": "保持[SUBJECT]面部特征，整体转换为水彩画风格。背景是柔和的水彩晕染，有粉色、淡蓝、淡紫的彩虹云朵。周围有水彩手绘的小动物。画面有明显的水彩纸质感、颜料晕染边缘、不均匀的透明度。色彩清新柔和，大量留白。添加手绘线条、水彩飞溅效果、柔软笔触。氛围：温柔、梦幻、童话。比例3:4竖版。",
      "tags": ["水彩", "梦幻", "柔和", "童话"],
      "exampleImage": "/styles/watercolor-dream.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday"],
      "premium": false,
      "active": true
    },
    {
      "id": "disney-princess",
      "name": "迪士尼公主风",
      "category": "anime-ip",
      "description": "迪士尼经典动画风格，小动物们围绕，星星洒落，魔法氛围",
      "promptTemplate": "保持[SUBJECT]面部特征，转换为迪士尼经典动画风格。背景是梦幻的城堡花园，有盛开的玫瑰、蝴蝶飞舞、小鸟歌唱。周围有迪士尼式的可爱小动物温柔守护。魔法小精灵洒下闪亮的星尘。色彩饱和度高，有动画cel-shading质感、清晰的描边。添加闪光粒子、柔和光晕。氛围：梦幻、皇家、祝福。比例4:3横版。",
      "tags": ["迪士尼", "公主", "童话", "魔法"],
      "exampleImage": "/styles/disney-princess.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday", "wedding"],
      "premium": true,
      "active": true
    },
    {
      "id": "monet-garden",
      "name": "莫奈印象派花园",
      "category": "art-masterpieces",
      "description": "印象派画风，睡莲池塘，柔和的光影和色彩",
      "promptTemplate": "保持[SUBJECT]面部特征，整体转换为莫奈印象派油画风格。背景是莫奈《睡莲》式的池塘花园，有盛开的睡莲、垂柳、拱桥、鸢尾花。采用印象派特征：短促的色块笔触、光影变化、色彩并置、朦胧柔和的边界。色调以粉色、淡紫、柔绿、乳白为主。油画质感明显，可见笔触纹理。氛围：宁静、自然、诗意。比例4:3横版。",
      "tags": ["印象派", "莫奈", "花园", "艺术"],
      "exampleImage": "/styles/monet-garden.jpg",
      "compatibleMilestones": ["birth", "full-month", "wedding", "anniversary", "golden-anniversary", "family-reunion"],
      "premium": true,
      "active": true
    },
    {
      "id": "pixel-8bit",
      "name": "像素艺术8bit怀旧",
      "category": "trendy-creative",
      "description": "8bit像素游戏风格，变成可爱的像素角色，复古游戏场景",
      "promptTemplate": "保持[SUBJECT]面部特征的识别度，但整体转换为8bit像素艺术风格。背景是复古游戏场景，有像素云朵、像素星星、像素装饰。采用经典8bit游戏配色方案。添加像素爱心、像素音符、像素装饰元素。氛围：怀旧、可爱、游戏感。比例1:1方形。",
      "tags": ["像素", "游戏", "复古", "8bit"],
      "exampleImage": "/styles/pixel-8bit.jpg",
      "compatibleMilestones": ["birth", "100-day", "first-birthday", "kindergarten", "birthday", "coming-of-age", "wedding"],
      "premium": false,
      "active": true
    },
    {
      "id": "steampunk-mechanical",
      "name": "蒸汽朋克机械天使",
      "category": "sci-fi-future",
      "description": "维多利亚时代+机械美学，精美的蒸汽机械装置守护",
      "promptTemplate": "保持[SUBJECT]面部特征，将场景转换为蒸汽朋克风格。背景是维多利亚时代的精美实验室，有黄铜齿轮、蒸汽管道、复古仪表盘、机械翅膀。周围环绕着精致的机械装置、发条装饰。色调为暖黄铜色、深棕木色、古铜绿、米白。添加蒸汽雾气效果、齿轮转动、暖黄色灯泡光。氛围：复古、奇幻、工匠精神。比例3:4竖版。",
      "tags": ["蒸汽朋克", "机械", "复古", "奇幻"],
      "exampleImage": "/styles/steampunk-mechanical.jpg",
      "compatibleMilestones": ["birth", "coming-of-age", "college-graduation", "wedding", "career-achievement"],
      "premium": true,
      "active": true
    },
    {
      "id": "space-astronaut",
      "name": "星际宇航员探索",
      "category": "sci-fi-future",
      "description": "太空探索风格，宇宙飞船场景，星球和星云环绕",
      "promptTemplate": "保持[SUBJECT]面部特征。背景是宇宙飞船舱，有科幻感的控制面板、浮动的全息投影、窗外是壮丽的宇宙景象（五彩星云、土星环、流星、银河）。采用真实感的太空摄影色彩：深空黑、星云紫粉蓝、星球橙黄、星光白。添加微重力漂浮效果、全息光束、科幻UI元素。氛围：探索、未来、梦想启航。比例4:3横版。",
      "tags": ["太空", "宇航员", "科幻", "探索"],
      "exampleImage": "/styles/space-astronaut.jpg",
      "compatibleMilestones": ["birth", "100-day", "first-birthday", "kindergarten", "coming-of-age", "college-graduation"],
      "premium": true,
      "active": true
    },
    {
      "id": "crystal-ice-palace",
      "name": "水晶宫殿冰雪奇缘",
      "category": "fantasy-magic",
      "description": "冰雪女王风格，水晶冰雪宫殿，钻石般的光芒",
      "promptTemplate": "保持[SUBJECT]面部特征，将场景转换为冰雪奇缘式的水晶宫殿。背景是纯净的冰晶世界，有透明的水晶柱、冰雪雕刻的花朵、漂浮的雪花。周围有发光的冰精灵、雪花仙子。色调为冰蓝、水晶白、钻石闪光、淡紫。大量钻石折射光效、冰晶反射、魔法闪光粒子。氛围：纯净、梦幻、魔法。比例3:4竖版。",
      "tags": ["冰雪", "水晶", "魔法", "梦幻"],
      "exampleImage": "/styles/crystal-ice-palace.jpg",
      "compatibleMilestones": ["birth", "100-day", "first-birthday", "birthday", "wedding", "anniversary"],
      "premium": true,
      "active": true
    },
    {
      "id": "chinese-ink-fairyland",
      "name": "中国风水墨仙境",
      "category": "art-masterpieces",
      "description": "传统水墨画风格，荷花池中，仙鹤祥云环绕",
      "promptTemplate": "保持[SUBJECT]面部特征，整体转换为中国传统水墨画风格。背景是写意水墨山水，有墨竹、荷花、荷叶、水波纹、远山。周围有仙鹤、蝴蝶、锦鲤。采用水墨晕染技法、干湿浓淡变化、飞白笔触、留白艺术。色彩以墨色层次为主，点缀淡青、藕粉、朱红。添加印章、题字装饰、水墨飞溅效果。氛围：古典、祥瑞、东方美学。比例3:4竖版。",
      "tags": ["水墨", "中国风", "古典", "祥瑞"],
      "exampleImage": "/styles/chinese-ink-fairyland.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "wedding", "anniversary", "retirement", "golden-anniversary"],
      "premium": true,
      "active": true
    },
    {
      "id": "pop-art-warhol",
      "name": "波普艺术安迪沃霍尔",
      "category": "trendy-creative",
      "description": "波普艺术风格，头像重复排列，鲜艳对比色",
      "promptTemplate": "保持[SUBJECT]面部特征，转换为安迪·沃霍尔波普艺术风格。画面由4-9格组成，每格是同一头像，但采用不同的高对比度配色方案。采用波普艺术特征：平面化、强烈色块对比、丝网印刷效果、半调网点、描边简化。色彩超饱和，边缘锐利。添加波普艺术标志性元素：漫画对话框、文字、波点图案。氛围：潮流、艺术感、现代。比例1:1方形。",
      "tags": ["波普", "艺术", "潮流", "现代"],
      "exampleImage": "/styles/pop-art-warhol.jpg",
      "compatibleMilestones": ["full-month", "100-day", "first-birthday", "coming-of-age", "college-graduation", "wedding"],
      "premium": true,
      "active": true
    },
    {
      "id": "pixar-3d-animation",
      "name": "皮克斯3D动画",
      "category": "anime-ip",
      "description": "皮克斯经典3D风格，变成超可爱的3D角色，夸张可爱",
      "promptTemplate": "保持[SUBJECT]面部特征，整体转换为皮克斯3D动画角色风格。头部比例可爱化，眼睛更大更有神，皮肤有3D渲染的柔和光泽。背景是皮克斯式的温馨场景。采用皮克斯标志性的：柔和的次表面散射、可爱的卡通夸张、温暖的打光、丰富的细节。色彩鲜艳饱和。添加景深虚化、体积光。氛围：治愈、可爱、充满生命力。比例4:3横版。",
      "tags": ["皮克斯", "3D", "可爱", "动画"],
      "exampleImage": "/styles/pixar-3d-animation.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday"],
      "premium": true,
      "active": true
    },
    {
      "id": "makoto-shinkai",
      "name": "新海诚动漫光影",
      "category": "anime-ip",
      "description": "新海诚动画风格，超美光影效果，樱花树下",
      "promptTemplate": "保持[SUBJECT]面部特征，转换为新海诚动画风格。背景是超现实美丽的场景，粉色樱花飞舞，阳光透过树叶产生壮观的光束。采用新海诚标志性的：超精细的光影效果、梦幻的色彩渲染、镜头光晕、粒子特效、空气感。色调明亮清透。画面有动画手绘质感但极其精致。氛围：唯美、青春、光的艺术。比例16:9横版。",
      "tags": ["新海诚", "动漫", "光影", "唯美"],
      "exampleImage": "/styles/makoto-shinkai.jpg",
      "compatibleMilestones": ["kindergarten", "elementary-graduation", "middle-school-graduation", "high-school-graduation", "coming-of-age", "college-graduation", "wedding"],
      "premium": true,
      "active": true
    },
    {
      "id": "street-graffiti",
      "name": "涂鸦街头艺术",
      "category": "trendy-creative",
      "description": "街头涂鸦风格，色彩爆炸，成为街头艺术主角",
      "promptTemplate": "保持[SUBJECT]面部特征，将人物重新绘制为街头涂鸦艺术风格。背景是砖墙或混凝土墙，有大面积的涂鸦喷漆效果。周围是爆炸式的色彩、喷漆滴落效果、涂鸦字体、星星、爱心、皇冠图案。采用街头艺术特征：粗犷的喷漆笔触、鲜艳的荧光色、黑色描边、模板喷涂效果。添加喷漆飞溅、滴落、模糊边缘。氛围：叛逆、潮流、街头文化。比例3:4竖版。",
      "tags": ["涂鸦", "街头", "潮流", "嘻哈"],
      "exampleImage": "/styles/street-graffiti.jpg",
      "compatibleMilestones": ["kindergarten", "elementary-graduation", "middle-school-graduation", "high-school-graduation", "coming-of-age", "college-graduation"],
      "premium": false,
      "active": true
    },
    {
      "id": "hogwarts-magic",
      "name": "魔法学院霍格沃茨",
      "category": "fantasy-magic",
      "description": "哈利波特魔法世界风格，魔法书和魔杖环绕",
      "promptTemplate": "保持[SUBJECT]面部特征，将场景转换为魔法学院风格。背景是古老的魔法图书馆，有飘浮的魔法书、发光的魔杖、魔法药水瓶、漂浮的蜡烛、猫头鹰。周围环绕着金色的魔法光粒子、字母符文。采用哈利波特系列的色调：深棕木色、古铜金色、深绿、酒红、羊皮纸黄。添加魔法光效、漂浮物体、古老质感、哥特式建筑元素。氛围：魔法、古老、神秘。比例3:4竖版。",
      "tags": ["魔法", "哈利波特", "奇幻", "神秘"],
      "exampleImage": "/styles/hogwarts-magic.jpg",
      "compatibleMilestones": ["kindergarten", "elementary-graduation", "middle-school-graduation", "high-school-graduation", "coming-of-age", "college-graduation"],
      "premium": true,
      "active": true
    },
    {
      "id": "picasso-cubism",
      "name": "毕加索立体主义",
      "category": "art-masterpieces",
      "description": "立体派风格，多角度同时呈现，几何解构",
      "promptTemplate": "保持[SUBJECT]面部关键特征可识别，但整体采用毕加索立体主义风格重构。将面部从多个角度同时呈现，用几何形状解构重组。背景也是几何抽象图案。采用立体派特征：多视角并置、几何化简、色块拼贴、轮廓线条清晰。画面呈现拼贴质感、分割的平面、重叠的透明度。氛围：艺术、前卫、思考性。比例1:1方形。",
      "tags": ["毕加索", "立体派", "艺术", "前卫"],
      "exampleImage": "/styles/picasso-cubism.jpg",
      "compatibleMilestones": ["coming-of-age", "college-graduation", "wedding", "career-achievement"],
      "premium": true,
      "active": true
    },
    {
      "id": "fairy-forest-elf",
      "name": "奇幻森林精灵",
      "category": "fantasy-magic",
      "description": "魔幻森林风格，变成森林小精灵，蘑菇和萤火虫",
      "promptTemplate": "保持[SUBJECT]面部特征，将人物重新设定为森林小精灵。场景是奇幻的魔法森林深处，有巨大的发光蘑菇、悬挂的藤蔓、树洞、苔藓地面、漂浮的萤火虫、魔法蝴蝶。色调神秘梦幻：深绿、荧光蓝绿、暖黄萤火、紫罗兰。大量发光粒子、魔法光点、柔焦光晕。打光来自生物光。氛围：奇幻、神秘、精灵国度。比例3:4竖版。",
      "tags": ["精灵", "森林", "魔法", "奇幻"],
      "exampleImage": "/styles/fairy-forest-elf.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday"],
      "premium": true,
      "active": true
    },
    {
      "id": "memphis-design",
      "name": "孟菲斯设计风潮",
      "category": "trendy-creative",
      "description": "80年代孟菲斯设计风格，几何图形、鲜艳色彩、趣味构图",
      "promptTemplate": "保持[SUBJECT]面部特征，将画面转换为80年代孟菲斯设计风格。背景是大胆的几何图案组合：波浪线、锯齿、圆点、三角形、曲线、网格。周围环绕着不规则的几何图形装饰。采用孟菲斯风格特征：鲜艳的撞色、平面化设计、不对称构图、波点和条纹。画面充满趣味性和玩乐感。氛围：复古潮流、玩乐、80年代。比例1:1方形。",
      "tags": ["孟菲斯", "几何", "80年代", "潮流"],
      "exampleImage": "/styles/memphis-design.jpg",
      "compatibleMilestones": ["100-day", "first-birthday", "kindergarten", "birthday", "coming-of-age", "wedding"],
      "premium": false,
      "active": true
    },
    {
      "id": "underwater-mermaid",
      "name": "海底世界美人鱼",
      "category": "fantasy-magic",
      "description": "海底王国风格，珊瑚礁中，美人鱼和海洋生物",
      "promptTemplate": "保持[SUBJECT]面部特征，将场景转换为梦幻的海底世界。背景是五彩斑斓的珊瑚礁，有摇曳的海草、彩色珊瑚、海葵、海星。周围有可爱的海洋生物：小丑鱼、海龟、海豚、水母发光、美人鱼守护。光线从海面透下形成梦幻的水下光束。色调为：深海蓝、青绿、珊瑚粉橙、紫色、金色阳光。添加气泡、水波纹理、海水的光影折射、柔和的水下景深。氛围：梦幻、宁静、海洋奇迹。比例4:3横版。",
      "tags": ["海底", "美人鱼", "珊瑚", "梦幻"],
      "exampleImage": "/styles/underwater-mermaid.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday"],
      "premium": true,
      "active": true
    },
    {
      "id": "cozy-home-warm",
      "name": "居家暖光温馨风",
      "category": "cozy-home",
      "description": "日系居家风格，暖黄光线，毛绒玩偶陪伴，温馨生活感",
      "promptTemplate": "去除杂乱背景，保持[SUBJECT]脸部特征完全不变。背景为纯净米白色，画面留白占比60%。一束暖黄色光线从侧窗斜射，形成柔和光斑。室内居家摄影质感，突出软乎乎温馨感。可搭配毛绒玩偶、木质玩具等居家元素。添加手写体装饰文字、手绘小图案点缀。氛围：温馨、治愈、日常。比例3:4竖版。",
      "tags": ["居家", "温馨", "日系", "治愈"],
      "exampleImage": "/styles/cozy-home-warm.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "parenthood", "family-reunion"],
      "premium": false,
      "active": true
    },
    {
      "id": "forest-fresh-healing",
      "name": "森系清新治愈风",
      "category": "cozy-home",
      "description": "森系日系风格，自然光线，小清新植物元素",
      "promptTemplate": "保持[SUBJECT]脸部特征完全不变。背景为浅米色，画面留白占比55%。一束浅青色自然光透过薄纱窗户，投下细碎光影。室内森系居家摄影。添加植物元素装饰（小叶子、小草莓等刺绣或图案）。点缀手写体装饰文字配小清新图案。氛围：治愈、萌趣、森系。比例3:4竖版。",
      "tags": ["森系", "清新", "治愈", "自然"],
      "exampleImage": "/styles/forest-fresh-healing.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday"],
      "premium": false,
      "active": true
    },
    {
      "id": "vintage-film-retro",
      "name": "复古胶片风",
      "category": "cozy-home",
      "description": "复古胶片质感，暖橙色调，做旧效果，怀旧温馨",
      "promptTemplate": "保持[SUBJECT]脸部特征完全不变。背景为奶白色带轻微胶片颗粒感，画面留白占比50%。一束暖橙色光线透过窗户，投下窗框阴影。室内复古居家摄影，质感像老照片般温馨。添加复古风装饰元素、做旧纹理效果。点缀复古字体装饰文字配复古小图案。氛围：怀旧、温馨、复古。比例3:4竖版。",
      "tags": ["复古", "胶片", "怀旧", "温馨"],
      "exampleImage": "/styles/vintage-film-retro.jpg",
      "compatibleMilestones": ["full-month", "100-day", "first-birthday", "birthday", "wedding", "anniversary", "retirement"],
      "premium": false,
      "active": true
    },
    {
      "id": "dreamy-soft-fairy",
      "name": "梦幻柔光童话风",
      "category": "fantasy-magic",
      "description": "童话梦幻风格，柔光效果，闪粉细闪元素",
      "promptTemplate": "保持[SUBJECT]脸部特征完全不变。一束柔光透过纱帘，在空气中形成细碎光尘。背景为纯白色带轻微雾感，画面留白占比65%。室内梦幻摄影，氛围像童话场景。添加柔光效果、细闪元素装饰。点缀带细闪的装饰文字配手绘星星月亮。氛围：梦幻、童话、魔法。比例3:4竖版。",
      "tags": ["梦幻", "童话", "柔光", "魔法"],
      "exampleImage": "/styles/dreamy-soft-fairy.jpg",
      "compatibleMilestones": ["birth", "full-month", "100-day", "first-birthday", "kindergarten", "birthday", "wedding"],
      "premium": false,
      "active": true
    },
    {
      "id": "matisse-paper-cut",
      "name": "马蒂斯剪纸艺术",
      "category": "art-masterpieces",
      "description": "马蒂斯色彩剪纸风格，大胆的色块和曲线形状",
      "promptTemplate": "保持[SUBJECT]面部特征，将整体画面转换为马蒂斯剪纸艺术风格。周围是大胆的彩色剪纸形状：流动的曲线、有机的叶形、抽象的花朵。采用马蒂斯标志性的鲜艳纯色：钴蓝、深绿、亮黄、玫红、橙色。形状重叠产生层次感，边缘清晰利落。画面呈现手工剪纸拼贴质感、平面化、装饰性强。氛围：艺术、大胆、欢乐。比例4:3横版。",
      "tags": ["马蒂斯", "剪纸", "艺术", "色彩"],
      "exampleImage": "/styles/matisse-paper-cut.jpg",
      "compatibleMilestones": ["100-day", "first-birthday", "kindergarten", "birthday", "coming-of-age", "wedding"],
      "premium": true,
      "active": true
    },
    {
      "id": "aurora-nordic",
      "name": "极光之夜北欧风",
      "category": "fantasy-magic",
      "description": "北极光背景，冰岛风光，绚丽的绿色和紫色极光",
      "promptTemplate": "保持[SUBJECT]面部特征，将场景转换为北极光之夜。背景是深蓝色夜空，有壮观的北极光（绿色、紫色、蓝色）在空中舞动成流光溢彩的波浪和帘幕。远处可见雪山剪影、星星点点。采用真实的极光摄影色彩：荧光绿、紫罗兰、深蓝、青色。添加星空、流星、光晕效果。画面呈现长曝光的梦幻感。氛围：壮丽、神秘、自然奇迹。比例16:9横版。",
      "tags": ["极光", "北欧", "自然", "壮丽"],
      "exampleImage": "/styles/aurora-nordic.jpg",
      "compatibleMilestones": ["wedding", "anniversary", "golden-anniversary", "family-reunion"],
      "premium": true,
      "active": true
    },
    {
      "id": "ukiyo-e-japanese",
      "name": "日本浮世绘版画",
      "category": "art-masterpieces",
      "description": "江户时代浮世绘风格，传统版画技法，富士山樱花",
      "promptTemplate": "保持[SUBJECT]面部特征，整体转换为日本浮世绘版画风格。背景是经典浮世绘场景：富士山、海浪、樱花树、云纹。采用浮世绘特征：平面化色块、清晰的轮廓线、木版画质感、有限的颜色数量（蓝、红、白、黑、金）、装饰性图案（云纹、波纹）。画面构图遵循浮世绘美学。添加日文字装饰、印章效果。氛围：东方古典、禅意、艺术。比例3:4竖版。",
      "tags": ["浮世绘", "日本", "版画", "古典"],
      "exampleImage": "/styles/ukiyo-e-japanese.jpg",
      "compatibleMilestones": ["coming-of-age", "college-graduation", "wedding", "retirement", "golden-anniversary"],
      "premium": true,
      "active": true
    },
    {
      "id": "lego-block-world",
      "name": "乐高积木世界",
      "category": "trendy-creative",
      "description": "整个世界由乐高积木组成，在乐高场景中",
      "promptTemplate": "保持[SUBJECT]面部特征（面部保持真实），但身体和周围环境完全由乐高积木构成。背景是五彩缤纷的乐高积木世界。采用乐高特征：方块拼接、塑料光泽、鲜艳纯色、凸起的圆点。画面有微缩模型摄影的景深效果。色彩饱和明亮：红、黄、蓝、绿。氛围：玩乐、创意、童年。比例4:3横版。",
      "tags": ["乐高", "积木", "玩具", "创意"],
      "exampleImage": "/styles/lego-block-world.jpg",
      "compatibleMilestones": ["100-day", "first-birthday", "kindergarten", "elementary-graduation", "birthday"],
      "premium": false,
      "active": true
    },
    {
      "id": "dali-surrealism",
      "name": "达利超现实主义",
      "category": "art-masterpieces",
      "description": "达利超现实风格，梦境般的奇幻场景，融化的时钟",
      "promptTemplate": "保持[SUBJECT]面部特征，将场景转换为达利式的超现实主义梦境。背景是荒凉又梦幻的超现实空间：融化的时钟、超长的影子、扭曲的透视、漂浮的物体、不可能的建筑。采用达利绘画特征：精细的写实技法+荒诞的组合、空旷的空间、戏剧性的光影、象征性的物品。画面充满哲学性和梦的逻辑。氛围：超现实、梦境、哲思。比例4:3横版。",
      "tags": ["达利", "超现实", "梦境", "艺术"],
      "exampleImage": "/styles/dali-surrealism.jpg",
      "compatibleMilestones": ["coming-of-age", "college-graduation", "wedding", "career-achievement"],
      "premium": true,
      "active": true
    },
    {
      "id": "cel-animation-90s",
      "name": "赛璐珞动画手绘",
      "category": "anime-ip",
      "description": "90年代经典动画赛璐珞风格，手绘线条和色彩",
      "promptTemplate": "保持[SUBJECT]面部特征，转换为90年代经典赛璐珞动画风格。画面有明显的手绘动画质感：清晰的描边线条、赛璐珞cel-shading阴影、有限的阴影层次、鲜艳饱和的色彩。背景是梦幻的风格：大量闪光star、肥皂泡、花朵飞舞、丝带飘扬。色彩：粉色、淡紫、天蓝、金色、白色高光。添加手绘质感、胶片颗粒、动画帧感。氛围：梦幻、少女心、90年代怀旧。比例3:4竖版。",
      "tags": ["动画", "赛璐珞", "90年代", "怀旧"],
      "exampleImage": "/styles/cel-animation-90s.jpg",
      "compatibleMilestones": ["kindergarten", "elementary-graduation", "middle-school-graduation", "high-school-graduation", "coming-of-age"],
      "premium": false,
      "active": true
    }
  ],
  "stylePackages": [
    {
      "id": "classic-art-trio",
      "name": "经典艺术三件套",
      "description": "梵高星空 + 莫奈花园 + 水墨仙境",
      "styleIds": ["vangogh-starry-night", "monet-garden", "chinese-ink-fairyland"],
      "price": 99,
      "discount": 0.8
    },
    {
      "id": "anime-dream-combo",
      "name": "动漫梦幻组合",
      "description": "吉卜力 + 皮克斯 + 迪士尼",
      "styleIds": ["ghibli-magic-forest", "pixar-3d-animation", "disney-princess"],
      "price": 99,
      "discount": 0.8
    },
    {
      "id": "sci-fi-future-set",
      "name": "未来科幻套装",
      "description": "赛博朋克 + 太空探索 + 蒸汽朋克",
      "styleIds": ["cyberpunk-neon", "space-astronaut", "steampunk-mechanical"],
      "price": 99,
      "discount": 0.8
    },
    {
      "id": "full-experience-pack",
      "name": "全风格体验包",
      "description": "每个类别精选1种，共10张不同风格",
      "styleIds": [
        "vangogh-starry-night",
        "ghibli-magic-forest",
        "cyberpunk-neon",
        "crystal-ice-palace",
        "street-graffiti",
        "cozy-home-warm",
        "pop-art-warhol",
        "makoto-shinkai",
        "hogwarts-magic",
        "underwater-mermaid"
      ],
      "price": 199,
      "discount": 0.7
    }
  ]
}
