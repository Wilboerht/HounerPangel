import { TravelPlan } from "@/types/travel";

export const yangzhouPlan: TravelPlan = {
  title: "扬州2日旅行计划",
  icon: "🍵",
  slug: "yangzhou",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "扬州2日深度游：涵盖瘦西湖、大明寺、东关街及地道扬州早茶体验。",
  budget: [
    { name: "往返交通", range: "200-500元", note: "高铁直达扬州东站" },
    { name: "市内交通", range: "50-100元", note: "公交与打车，老城区内可步行" },
    { name: "住宿", range: "600-1200元", note: "1晚住宿，选在文昌阁或东关街" },
    { name: "餐饮费用", range: "500-800元", note: "早茶、淮扬菜" },
    { name: "门票支出", range: "200-300元", note: "瘦西湖、个园、何园等" },
  ],
  itinerary: [
    {
      day: 1,
      title: "瘦西湖 + 大明寺 + 东关街",
      tocTitle: "瘦西湖 · 老街",
      route: "抵达扬州 → 瘦西湖 → 大明寺 → 观音山 → 东关街",
      events: [
        { time: "09:00 - 12:30", content: "瘦西湖：漫步五亭桥、二十四桥，感受‘园林之盛’", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：趣园或扬州宴（地道淮扬菜）", type: "food" },
        { time: "14:30 - 16:30", content: "大明寺 & 鉴真纪念堂：登上栖灵塔俯瞰扬州城全景", type: "location" },
        { time: "17:00 - 19:30", content: "东关街：逛古街巷，品尝各类传统小吃及选购伴手礼", type: "location" },
        { time: "20:00 - 21:30", content: "晚餐：蒋家桥饺面店（体验平价老字号的烟火气）", type: "food" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "地道早茶 + 个园 + 何园",
      tocTitle: "早茶 · 园林",
      route: "早茶体验 → 个园 → 彩衣街 → 何园 → 返程",
      events: [
        { time: "07:30 - 09:30", content: "早茶：冶春或富春茶社（体验‘早上皮包水’的扬州慢生活）", type: "food" },
        { time: "10:00 - 11:30", content: "个园：欣赏中国四大名园之一，尤以‘四季假山’著称", type: "location" },
        { time: "12:00 - 13:00", content: "午餐：彩衣街寻觅民间地道风味", type: "food" },
        { time: "13:30 - 15:30", content: "何园：探访‘晚清第一园’，漫步其独特的复道回廊", type: "location" },
        { time: "16:00 - 17:30", content: "在文昌阁转盘最后留影，前往车站返程", type: "transport" },
      ],
      daySummary: "预计花费：约500元"
    },
  ],
  attractions: [
    { name: "瘦西湖", location: "邗江区", description: "扬州最具代表性的核心景点，湖上园林的艺术巅峰" },
    { name: "大明寺", location: "邗江区", description: "鉴真大和尚曾在此传法，是扬州的历史文化高地" },
    { name: "个园", location: "广陵区", description: "中国四大名园之一，展示了中国古代造园艺术的高度" },
    { name: "何园", location: "广陵区", description: "中西合璧的建筑风格，其复道回廊被誉为‘中国立交桥雏形’" },
    { name: "东关街", location: "广陵区", description: "保存完好的古城街巷，是感受扬州历史底蕴的最佳去处" },
  ],
  foods: [
    { type: "传统名早茶", name: "趣园茶社", location: "瘦西湖旁", price: "150元", rowSpan: 3 },
    { type: "传统名早茶", name: "冶春茶社", location: "御河路", price: "100元" },
    { type: "传统名早茶", name: "富春茶社", location: "国庆路", price: "90元" },
    { type: "淮扬经典", name: "扬州宴", location: "瘦西湖路", price: "200元", rowSpan: 2 },
    { type: "淮扬经典", name: "狮子楼", location: "文昌阁", price: "150元" },
    { type: "平价老字号", name: "蒋家桥饺面", location: "全城连锁", price: "30元", rowSpan: 2 },
    { type: "平价老字号", name: "丁氏酥脆饼", location: "东关街", price: "15元" },
    { type: "扬州必吃", name: "扬州炒饭", location: "各大家菜馆", price: "60元" },
  ],
  summary: {
    total: "3200元",
    note: "基于2日精华方案核算，含往返大交通及老城区核心酒店住宿。",
    details: [
      { label: "往返大交通", value: "500元", icon: "Train" },
      { label: "市内交通", value: "100元", icon: "MapPin" },
      { label: "1晚住宿", value: "800元", icon: "Calendar" },
      { label: "门票支出", value: "300元", icon: "Ticket" },
      { label: "餐饮美食", value: "800元", icon: "Utensils" },
      { label: "机动金", value: "700元", icon: "Wallet" },
    ]
  }
};
