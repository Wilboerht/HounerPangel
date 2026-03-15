import { TravelPlan } from "@/types/travel";

export const kumamotoPlan: TravelPlan = {
  title: "熊本1日旅行计划",
  icon: "🐻",
  slug: "kumamoto",
  countryCode: "JP",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "熊本1日深度游：探访日本三大名城之一的熊本城，体验水前寺成趣园，品尝地道马肉料理与熊本拉面。",
  budget: [
    { name: "城际交通", range: "200-500元", note: "从福冈或鹿儿岛乘新干线抵达" },
    { name: "市内交通", range: "50-100元", note: "利用熊本市电（有轨电车），氛围感十足" },
    { name: "餐饮费用", range: "400-800元", note: "马刺身、熊本拉面、芥末莲藕" },
    { name: "门票支出", range: "100-200元", note: "熊本城天守阁及水前寺园林" },
  ],
  itinerary: [
    {
      day: 1,
      title: "熊本城 + 水前寺成趣园 + 熊本熊办公室",
      tocTitle: "名城 · 萌友",
      route: "熊本站 → 熊本城 → 樱之马场 城彩苑 → 水前寺成趣园 → 熊本熊广场",
      events: [
        { time: "09:30 - 12:00", content: "熊本城：参观经过修复后的天守阁，感受“不落名城”的雄伟与坚韧", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：樱之马场 城彩苑，品尝熊本特色拉面或即食马肉小吃", type: "food" },
        { time: "14:00 - 16:00", content: "水前寺成趣园：漫步复刻东海道五十三次的桃山式池泉回游园林", type: "location" },
        { time: "16:30 - 18:00", content: "熊本熊广场：前往部长的办公室，运气好能偶遇熊本熊部长的元气表演", type: "location" },
        { time: "18:30 - 20:30", content: "晚餐：地道 Basashi（马刺身）高级料理或黑亭拉面", type: "food" },
      ],
      daySummary: "预计花费：约600元（在古朴名城与软萌部长之间穿梭）"
    }
  ],
  attractions: [
    { name: "熊本城", location: "中央区", description: "日本三大名城之一，其高大的石垣“武者返”极具建筑艺术价值" },
    { name: "水前寺成趣园", location: "中央区", description: "国家级名胜，是一座体现中国陶渊明诗境的精致园林" },
    { name: "樱之马场 城彩苑", location: "熊本城下", description: "复原江户时代城下町风格的商业区，聚集大量地道手信与美食" },
  ],
  foods: [
    { type: "传统料理", name: "马刺身 (Basashi)", location: "市内老铺", price: "300元", rowSpan: 2 },
    { type: "传统料理", name: "芥末莲藕", location: "城彩苑", price: "50元" },
    { type: "熊本拉面", name: "黑亭", location: "二本木", price: "70元", rowSpan: 2 },
    { type: "熊本拉面", name: "味千拉面总店", location: "县厅口", price: "60元" },
  ],
  summary: {
    total: "1700元",
    note: "基于1日高品质深度游方案核算，含往返福冈的新干线概算。",
    details: [
      { label: "往返交通", value: "500元", icon: "Train" },
      { label: "市内交通", value: "80元", icon: "MapPin" },
      { label: "门票/导览", value: "150元", icon: "Ticket" },
      { label: "顶级餐饮", value: "700元", icon: "Utensils" },
      { label: "萌物周边", value: "270元", icon: "Wallet" },
    ]
  }
};
