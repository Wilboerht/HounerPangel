import { TravelPlan } from "@/types/travel";

export const japanFullPlan: TravelPlan = {
  title: "日本8日完整旅行计划",
  icon: "🗼",
  slug: "full-itinerary",
  countryCode: "JP",
  subtitle: "东京 + 京都 + 大阪 + 熊本",
  description: "日本8日环线：从东京都市风情到京都古都韵味，再到大阪美食天堂，最后探访熊本名城，一次尽览日本多面魅力。",
  budget: [
    { name: "国际往返", range: "3000-5000元", note: "往返机票（成田/羽田机场）" },
    { name: "城际交通", range: "1500-2500元", note: "新干线通票或单次购票，含近铁及市电" },
    { name: "市内交通", range: "500-800元", note: "各城市地铁、巴士及出租车" },
    { name: "住宿", range: "5500-9000元", note: "8晚中档酒店或民宿（含2-3星级选项）" },
    { name: "餐饮费用", range: "3000-5000元", note: "混合高端用餐与街头美食体验" },
    { name: "门票及体验", range: "1200-1800元", note: "寺庙、景点门票及特色体验" },
  ],
  itinerary: [
    {
      day: 1,
      title: "浅草寺 + 秋叶原 + 银座",
      tocTitle: "浅草 · 秋叶原",
      route: "抵达东京 → 浅草寺 → 仲见世通 → 秋叶原 → 银座",
      events: [
        { time: "10:00 - 12:30", content: "浅草寺：漫步雷门，拍摄巨型红灯笼，祈求好运", type: "location" },
        { time: "12:30 - 13:30", content: "午餐：浅草附近百年老店（如浅草今半寿喜烧）", type: "food" },
        { time: "14:00 - 17:00", content: "秋叶原：电器街巡礼，感受二次元圣地的独特氛围", type: "location" },
        { time: "17:30 - 19:30", content: "银座：在高档商业区闲逛，欣赏世界一流的建筑与橱窗", type: "location" },
        { time: "20:00 - 21:30", content: "晚餐：地道江戸前寿司体验", type: "food" },
      ],
      daySummary: "预计花费：约800元（感受下町传统与现代奢华的交织）"
    },
    {
      day: 2,
      title: "明治神宫 + 涩谷 + 新宿",
      tocTitle: "涩谷 · 潮流",
      route: "明治神宫 → 表参道 → 涩谷十字路口 → 新宿夜景",
      events: [
        { time: "09:00 - 11:30", content: "明治神宫：在森林环抱的绿洲中洗涤心灵", type: "location" },
        { time: "11:30 - 13:30", content: "表参道/原宿：打卡潮流名店，体验原宿特色小吃", type: "location" },
        { time: "14:00 - 17:00", content: "涩谷：打卡忠犬八公像，体验世界最繁忙的十字路口，登上 Shibuya Sky 俯瞰全城", type: "location" },
        { time: "18:00 - 20:00", content: "新宿：探索 Omoide Yokocho 居酒屋小巷，感受烟火气", type: "food" },
        { time: "20:30 - 22:00", content: "东京都厅：免费欣赏绝美城市夜景", type: "location" },
      ],
      daySummary: "预计花费：约1000元（沉浸在东京独有的都市节奏中）"
    },
    {
      day: 3,
      title: "筑地市场 + 台场 + 归途京都",
      tocTitle: "海鲜 · 湾区",
      route: "筑地场外市场 → 丰洲团队实验室 → 台场海滨公园 → 东京站 → 新干线赴京都",
      events: [
        { time: "08:00 - 10:30", content: "筑地场外市场：享用最鲜甜的海鲜丼与玉子烧早餐", type: "food" },
        { time: "11:00 - 13:30", content: "teamLab Planets：体验沉浸式数字艺术的无限魅力", type: "location" },
        { time: "14:00 - 16:30", content: "台场：观赏彩虹大桥、巨型高达模型，漫步海滨公园", type: "location" },
        { time: "17:00 - 18:30", content: "整理行囊，前往东京站登上新干线", type: "transport" },
        { time: "19:00 - 20:30", content: "乘新干线赴京都（约2小时15分），沿途体验日本高铁便当", type: "transport" },
      ],
      daySummary: "预计花费：约2000元（含新干线车票及东京最后的精彩）"
    },
    {
      day: 4,
      title: "清水寺 + 二年坂三年坂 + 祗园",
      tocTitle: "清水 · 祗园",
      route: "京都站 → 清水寺 → 二年坂三年坂 → 八坂神社 → 祗园花见小路",
      events: [
        { time: "09:00 - 11:30", content: "清水寺：站在清水大舞台，俯瞰京都四季变换的绝美景色", type: "location" },
        { time: "11:30 - 13:30", content: "午餐：品尝京都特色汤豆腐料理", type: "food" },
        { time: "14:00 - 16:30", content: "漫步二年坂三年坂，选购精美的小礼品和品尝抹茶冰淇淋", type: "location" },
        { time: "17:00 - 19:00", content: "祗园花见小路：探寻艺伎的踪迹，感受浓厚的传统氛围", type: "location" },
        { time: "19:30 - 21:00", content: "晚餐：河原町附近体验京料理（需预约）", type: "food" },
      ],
      daySummary: "预计花费：约1000元"
    },
    {
      day: 5,
      title: "伏见稻荷大社 + 金阁寺 + 岚山",
      tocTitle: "金阁 · 岚山",
      route: "伏见稻荷大社 → 金阁寺 → 岚山竹林小径 → 渡月桥 → 新干线赴大阪",
      events: [
        { time: "08:00 - 10:00", content: "伏见稻荷大社：穿越连绵不绝的千本鸟居，祈求五谷丰登", type: "location" },
        { time: "11:00 - 12:30", content: "金阁寺：欣赏在阳光下熠熠生辉的金色舍利殿及其倒影", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：岚山手打荞麦面", type: "food" },
        { time: "14:30 - 16:30", content: "岚山竹林小径：步入幽静的绿色通道，静听竹浪沙沙声", type: "location" },
        { time: "17:00 - 18:30", content: "渡月桥：在如诗如画的山水间静享落日余晖", type: "location" },
        { time: "19:00 - 20:30", content: "乘新干线赴大阪（约75分钟）", type: "transport" },
      ],
      daySummary: "预计花费：约1800元（含新干线及京都最后风景）"
    },
    {
      day: 6,
      title: "大阪城 + 心斋桥 + 道顿堀",
      tocTitle: "大阪城 · 美食",
      route: "抵达大阪 → 大阪城公园 → 心斋桥 → 道顿堀夜景",
      events: [
        { time: "10:00 - 12:30", content: "大阪城天守阁：登上这座历史地标，俯瞰现代与古老的交汇", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：品尝地道的大阪烧（推荐黑门市场附近）", type: "food" },
        { time: "14:30 - 17:30", content: "心斋桥：在这里尽情享受购物的乐趣，感受关西商业活力", type: "location" },
        { time: "18:00 - 21:00", content: "道顿堀：与格力高看板合影，开启美食扫街模式（章鱼烧、炸串等）", type: "food" },
      ],
      daySummary: "预计花费：约1000元"
    },
    {
      day: 7,
      title: "黑门市场 + 通天阁 + 梅田蓝天大厦 + 前往熊本",
      tocTitle: "黑门 · 展望",
      route: "黑门市场 → 日本桥 → 通天阁 → 梅田蓝天大厦 → 新干线赴熊本",
      events: [
        { time: "09:00 - 11:30", content: "黑门市场：在'大阪人的胃'享用刺身、海鲜串烧等豪华早餐", type: "food" },
        { time: "12:00 - 13:30", content: "日本桥：电器与动漫的世界，大阪的'秋叶原'", type: "location" },
        { time: "14:00 - 16:30", content: "新世界 & 通天阁：感受怀旧的大阪氛围，打卡法善寺小巷", type: "location" },
        { time: "17:00 - 18:00", content: "晚餐：精选河豚料理或特色的炸串大餐", type: "food" },
        { time: "18:30 - 20:00", content: "乘新干线赴熊本（约3小时50分钟，含转车）", type: "transport" },
      ],
      daySummary: "预计花费：约2000元（含新干线及大阪最后的美食）"
    },
    {
      day: 8,
      title: "熊本城 + 水前寺成趣园 + 熊本熊 + 返程",
      tocTitle: "名城 · 萌友",
      route: "熊本站 → 熊本城 → 樱之马场 城彩苑 → 水前寺成趣园 → 熊本熊广场 → 返程",
      events: [
        { time: "09:30 - 12:00", content: "熊本城：参观经过修复后的天守阁，感受'不落名城'的雄伟与坚韧", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：樱之马场 城彩苑，品尝熊本特色拉面或即食马肉小吃", type: "food" },
        { time: "14:00 - 16:00", content: "水前寺成趣园：漫步复刻东海道五十三次的桃山式池泉回游园林", type: "location" },
        { time: "16:30 - 18:00", content: "熊本熊广场：前往部长的办公室，运气好能偶遇熊本熊部长的元气表演", type: "location" },
        { time: "18:30 - 20:30", content: "晚餐：地道 Basashi（马刺身）高级料理或黑亭拉面", type: "food" },
        { time: "21:00 - 22:30", content: "前往熊本机场或乘新干线返回福冈，启程返回", type: "transport" },
      ],
      daySummary: "预计花费：约800元（圆满结束日本之行）"
    },
  ],
  attractions: [
    { name: "浅草寺", location: "东京台东区", description: "东京最古老的寺庙，江户时代的下町文化象征" },
    { name: "涩谷十字路口", location: "东京涩谷区", description: "世界著名的地标，展现了高度发达的现代都市风貌" },
    { name: "清水寺", location: "京都东山区", description: "京都最著名的寺院，其全木质支架的结构令人惊叹" },
    { name: "千本鸟居", location: "京都伏见稻荷大社", description: "成千上万座红色的鸟居构成了通往山顶的神奇隧道" },
    { name: "岚山竹林", location: "京都右京区", description: "以竹林和红叶闻名的风景名胜，是京都放松身心的绝佳去处" },
    { name: "大阪城天守阁", location: "大阪中央区", description: "丰臣秀吉修建的历史名城，是大阪的象征" },
    { name: "道顿堀", location: "大阪中央区", description: "著名的美食街与夜市，充满活力和烟火气" },
    { name: "熊本城", location: "熊本中央区", description: "日本三大名城之一，其高大的石垣'武者返'极具建筑艺术价值" },
  ],
  foods: [
    { type: "日本拉面", name: "一兰拉面", location: "东京全城连锁", price: "60元" },
    { type: "高级寿司", name: "寿司大", location: "东京丰洲市场", price: "200元" },
    { type: "京式拉面", name: "天下一品", location: "京都全城连锁", price: "70元" },
    { type: "汤豆腐", name: "奥丹", location: "京都清水寺附近", price: "250元" },
    { type: "抹茶甜点", name: "都路里", location: "京都祗园", price: "60元" },
    { type: "大阪烧", name: "千房", location: "大阪道顿堀", price: "80元" },
    { type: "章鱼烧", name: "本家大章鱼", location: "大阪道顿堀", price: "30元" },
    { type: "熊本拉面", name: "黑亭", location: "熊本二本木", price: "70元" },
    { type: "传统料理", name: "马刺身 Basashi", location: "熊本各老铺", price: "300元" },
  ],
  summary: {
    total: "16000-25000元",
    note: "基于8日深度环线方案核算，涵盖国际机票、新干线通票、高品质住宿与精品餐饮体验。根据季节与住宿等级会有浮动。",
    details: [
      { label: "国际交通", value: "4000元", icon: "Train" },
      { label: "城际交通", value: "2000元", icon: "MapPin" },
      { label: "8晚住宿", value: "7000元", icon: "Calendar" },
      { label: "门票/体验", value: "1500元", icon: "Ticket" },
      { label: "餐饮美食", value: "4000元", icon: "Utensils" },
      { label: "机动购礼", value: "500元", icon: "Wallet" },
    ]
  }
};
