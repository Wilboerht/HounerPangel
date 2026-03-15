import { TravelPlan } from "@/types/travel";

export const osakaPlan: TravelPlan = {
  title: "大阪2日旅行计划",
  icon: "🐙",
  slug: "osaka",
  countryCode: "JP",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "大阪2日吃货行：涵盖心斋桥、道顿堀、大阪城、通天阁及地道大阪烧与章鱼烧体验。",
  budget: [
    { name: "城际交通", range: "100-300元", note: "从京都或东京抵达" },
    { name: "市内交通", range: "100-200元", note: "地铁网络，购买大阪周游券" },
    { name: "住宿", range: "1200-2400元", note: "2晚住宿，选在难波或梅田附近" },
    { name: "餐饮费用", range: "1000-2000元", note: "道顿堀各种美食横扫" },
    { name: "门票支出", range: "300-600元", note: "大阪城、梅田蓝天大厦等（含大阪周游券景点）" },
  ],
  itinerary: [
    {
      day: 1,
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
      day: 2,
      title: "黑门市场 + 通天阁 + 梅田蓝天大厦",
      tocTitle: "黑门 · 展望",
      route: "黑门市场 → 日本桥 → 通天阁 → 梅田蓝天大厦夜景",
      events: [
        { time: "09:00 - 11:30", content: "黑门市场：在‘大阪人的胃’享用刺身、海鲜串烧等豪华早餐", type: "food" },
        { time: "12:00 - 13:30", content: "日本桥：电器与动漫的世界，大阪的‘秋叶原’", type: "location" },
        { time: "14:00 - 16:30", content: "新世界 & 通天阁：感受怀旧的大阪氛围，打卡法善寺小巷", type: "location" },
        { time: "18:00 - 19:30", content: "晚餐：精选河豚料理或特色的炸串大餐", type: "food" },
        { time: "20:00 - 21:30", content: "梅田蓝天大厦：在空中庭院展望台俯瞰全城璀璨夜景", type: "location" },
      ],
      daySummary: "预计花费：约1200元"
    },
  ],
  attractions: [
    { name: "大阪城天守阁", location: "中央区", description: "丰臣秀吉修建的历史名城，是大阪的象征" },
    { name: "道顿堀", location: "中央区", description: "著名的美食街与夜市，充满活力和烟火气" },
    { name: "梅田蓝天大厦", location: "北区", description: "极具未来感的建筑，提供360度全景展望" },
  ],
  foods: [
    { type: "大阪烧", name: "千房", location: "道顿堀", price: "80元", rowSpan: 2 },
    { type: "大阪烧", name: "美津", location: "难波", price: "100元" },
    { type: "章鱼烧", name: "本家大章鱼", location: "道顿堀", price: "30元" },
    { type: "炸串", name: "元祖串炸", location: "新世界", price: "90元" },
  ],
  summary: {
    total: "4500元",
    note: "基于2日吃货方案核算，含城际交通及梅田附近高品质住宿。",
    details: [
      { label: "城际交通", value: "300元", icon: "Train" },
      { label: "市内交通", value: "200元", icon: "MapPin" },
      { label: "2晚住宿", value: "2000元", icon: "Calendar" },
      { label: "门票娱乐", value: "500元", icon: "Ticket" },
      { label: "餐饮美食", value: "1200元", icon: "Utensils" },
      { label: "机动零散", value: "300元", icon: "Wallet" },
    ]
  }
};
