import { TravelPlan } from "@/types/travel";

export const kyotoPlan: TravelPlan = {
  title: "京都2日旅行计划",
  icon: "⛩️",
  slug: "kyoto",
  countryCode: "JP",
  subtitle: "2027.06.04 - 2027.06.05",
  description: "京都2日古都行：涵盖金阁寺、清水寺、伏见稻荷大社及地道京料理与抹茶体验。",
  budget: [
    { name: "城际交通", range: "300-600元", note: "从东京乘新干线或从大阪抵达" },
    { name: "市内交通", range: "100-200元", note: "京都巴士、地铁或打车" },
    { name: "住宿", range: "1200-2400元", note: "2晚住宿，建议选在京都站或河原町附近" },
    { name: "餐饮费用", range: "800-1500元", note: "怀石料理、汤豆腐、抹茶甜点" },
    { name: "门票支出", range: "200-400元", note: "各大寺院及神社门票" },
  ],
  itinerary: [
    {
      day: 1,
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
      daySummary: "预计花费：约1000元（沉溺于京都的千年古意中）"
    },
    {
      day: 2,
      title: "伏见稻荷大社 + 金阁寺 + 岚山",
      tocTitle: "金阁 · 岚山",
      route: "伏见稻荷大社 → 金阁寺 → 岚山竹林小径 → 渡月桥",
      events: [
        { time: "08:00 - 10:00", content: "伏见稻荷大社：穿越连绵不绝的千本鸟居，祈求五谷丰登", type: "location" },
        { time: "11:00 - 12:30", content: "金阁寺：欣赏在阳光下熠熠生辉的金色舍利殿及其倒影", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：岚山手打荞麦面", type: "food" },
        { time: "14:30 - 16:30", content: "岚山竹林小径：步入幽静的绿色通道，静听竹浪沙沙声", type: "location" },
        { time: "17:00 - 18:30", content: "渡月桥：在如诗如画的山水间静享落日余晖", type: "location" },
      ],
      daySummary: "预计花费：约800元（在古建筑与自然奇观中寻找宁静）"
    },
  ],
  attractions: [
    { name: "清水寺", location: "东山区", description: "京都最著名的寺院，其全木质支架的结构令人惊叹" },
    { name: "千本鸟居", location: "伏见稻荷大社", description: "成千上万座红色的鸟居构成了通往山顶的神奇隧道" },
    { name: "岚山", location: "右京区", description: "以竹林和红叶闻名的风景名胜，是京都放松身心的绝佳去处" },
  ],
  foods: [
    { type: "京式拉面", name: "天下一品", location: "全城连锁", price: "70元" },
    { type: "抹茶甜点", name: "都路里", location: "祗园", price: "60元", rowSpan: 2 },
    { type: "抹茶甜点", name: "中村藤吉", location: "京都站", price: "50元" },
    { type: "汤豆腐", name: "奥丹", location: "清水寺附近", price: "250元" },
  ],
  summary: {
    total: "4200元",
    note: "基于2日深度方案核算，含城际交通及高标准京都民宿住宿。",
    details: [
      { label: "城际交通", value: "500元", icon: "Train" },
      { label: "市内交通", value: "200元", icon: "MapPin" },
      { label: "2晚住宿", value: "2000元", icon: "Calendar" },
      { label: "门票开支", value: "300元", icon: "Ticket" },
      { label: "餐饮美食", value: "1000元", icon: "Utensils" },
      { label: "机动特产", value: "200元", icon: "Wallet" },
    ]
  }
};
