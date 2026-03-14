import { TravelPlan } from "@/types/travel";

export const datongPlan: TravelPlan = {
  title: "大同3日旅行计划",
  icon: "🗿",
  slug: "datong",
  subtitle: "2026.08.10 - 2026.08.12",
  description: "大同3日深度游：涵盖云冈石窟、悬空寺、华严寺及地道大同刀削面体验。",
  budget: [
    { name: "往返交通", range: "400-800元", note: "大交通费用，建议高铁抵达大同南站或飞抵大同机场" },
    { name: "市内交通", range: "100-200元", note: "打车或网约车性价比较高，部分远郊景点建议包车或租车" },
    { name: "住宿", range: "600-1200元", note: "2晚住宿，建议选在古城内或平城区核心地带" },
    { name: "餐饮费用", range: "400-800元", note: "大同刀削面、羊杂、什锦火锅及地道黄米面炸糕" },
    { name: "门票支出", range: "300-500元", note: "云冈石窟、悬空寺、个别寺庙及城墙观光费用" },
  ],
  itinerary: [
    {
      day: 1,
      title: "云冈石窟 + 大同市博物馆",
      tocTitle: "石窟 · 博物",
      route: "抵达大同 → 云冈石窟 → 大同市博物馆 → 古城墙",
      events: [
        { time: "09:00 - 13:00", content: "云冈石窟：深度游览北魏石窟艺术宝库，重点看第5、6、20窟", type: "location" },
        { time: "13:30 - 14:30", content: "午餐：品尝地道大同刀削面（如二板或任记）", type: "food" },
        { time: "15:00 - 17:00", content: "大同市博物馆：领略北魏都城的霸气与多元文化的缩影", type: "location" },
        { time: "17:30 - 19:30", content: "漫步大同古城墙：建议骑行或徒步，在落日余晖下看古城风貌", type: "location" },
        { time: "20:00 - 21:00", content: "晚餐：怀旧风味的什锦铜火锅或大同土菜", type: "food" },
      ],
      daySummary: "预计花费：约600元（跨越时空与北魏工匠‘对话’）"
    },
    {
      day: 2,
      title: "悬空寺 + 北岳恒山",
      tocTitle: "悬空 · 恒山",
      route: "悬空寺 → 恒山风景区 → 返回市内",
      events: [
        { time: "08:00 - 10:30", content: "驱车前往浑源县，登临“世界建筑奇迹”——悬空寺（需提前预约，限流严重）", type: "location" },
        { time: "11:00 - 15:30", content: "北岳恒山：攀登或索道上下，感受五岳之一的险峻与道教文化", type: "location" },
        { time: "16:00 - 17:00", content: "下山后品尝地道的浑源凉粉", type: "food" },
        { time: "18:30 - 20:30", content: "返回大同市内，晚餐享受地道的‘羊蝎子’火锅", type: "food" },
      ],
      daySummary: "预计花费：约500元（体验‘挂在峭壁上的信仰’）"
    },
    {
      day: 3,
      title: "华严寺 + 善化寺 + 鼓楼",
      tocTitle: "古寺 · 漫步",
      route: "华严寺 → 善化寺 → 九龙壁 → 鼓楼广场 → 返程",
      events: [
        { time: "09:00 - 11:30", content: "华严寺：参观国内现存规模最大、保存最完好的辽金建筑群", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：凤临阁（百年老饼铺，体验烧麦与特色菜）", type: "food" },
        { time: "14:00 - 15:30", content: "善化寺：探访国内唯一保存完好的辽金原构大雄宝殿", type: "location" },
        { time: "15:30 - 16:30", content: "九龙壁：打卡中国现存规模最大的琉璃影壁", type: "location" },
        { time: "17:00 - 18:30", content: "前往大同南站/机场，结束精彩的北魏故都之旅", type: "transport" },
      ],
      daySummary: "预计花费：约400元（在辽金木构的震撼中归途）"
    },
  ],
  attractions: [
    { name: "云冈石窟", location: "平城区西郊", description: "中国四大石窟之一，展示了北魏皇室造像的巅峰艺术" },
    { name: "悬空寺", location: "浑源县", description: "集奇、悬、巧于一体，是世界上现存唯一的佛道儒三教合一寺庙" },
    { name: "华严寺", location: "平城区", description: "辽金文化缩影，其薄伽教藏殿内的合掌露齿菩萨像极具艺术价值" },
    { name: "大同古城墙", location: "平城区", description: "规模宏大的明代土筑城墙外包青砖，是城市独特的风景线" },
    { name: "北岳恒山", location: "浑源县", description: "五岳中的“北岳”，以绝塞险峻著称" },
  ],
  foods: [
    { type: "大同刀削面", name: "二板/任记/东方", location: "平城区", price: "15元", rowSpan: 3 },
    { type: "大同刀削面", name: "老大同", location: "古城内", price: "18元" },
    { type: "大同刀削面", name: "小南街面馆", location: "古城内", price: "20元" },
    { type: "特色早点", name: "贺老人羊杂", location: "平城区", price: "30元", rowSpan: 2 },
    { type: "特色早点", name: "魏都炸糕", location: "古城内", price: "10元" },
    { type: "怀旧火锅", name: "凯鸽什锦火锅", location: "平城区", price: "100元" },
    { type: "精美烧麦", name: "凤临阁", location: "华严寺旁", price: "120元" },
    { type: "地道小吃", name: "浑源凉粉", location: "浑源县/市内", price: "15元" },
  ],
  summary: {
    total: "3200元",
    note: "基于3日深度方案核算，含往返交通及古城内精品民宿/酒店住宿。",
    details: [
      { label: "往返大交通", value: "800元", icon: "Train" },
      { label: "市内/包车", value: "200元", icon: "MapPin" },
      { label: "2晚住宿", value: "1000元", icon: "Calendar" },
      { label: "景点门票", value: "400元", icon: "Ticket" },
      { label: "餐饮美食", value: "600元", icon: "Utensils" },
      { label: "机动金", value: "200元", icon: "Wallet" },
    ]
  }
};
