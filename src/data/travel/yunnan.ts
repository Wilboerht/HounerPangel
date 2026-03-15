import { TravelPlan } from "@/types/travel";

export const yunnanPlan: TravelPlan = {
  title: "云南12日旅行计划",
  icon: "🍃",
  slug: "yunnan",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "西双版纳、大理、丽江、玉龙雪山12日连线。",
  budget: [
    { name: "往返交通", range: "2000-3500元", note: "大交通费用，建议版纳进，丽江出" },
    { name: "省内交通", range: "800-1200元", note: "高铁为主，当地打车/拼车" },
    { name: "住宿费用", range: "2500-4000元", note: "11晚住宿，选在古城或交通便利处" },
    { name: "餐饮费用", range: "1800-3000元", note: "菌火锅、过桥米线、傣味、烧烤" },
    { name: "门票支出", range: "1000-1500元", note: "玉龙雪山、植物园、野象谷等" },
  ],
  itinerary: [
    {
      day: 1,
      title: "抵达版纳 + 告庄西双景",
      tocTitle: "版纳 · 入住",
      route: "抵达版纳 → 酒店入住 → 告庄夜市",
      events: [
        { time: "14:00 - 16:00", content: "抵达告庄并入住酒店", type: "transport" },
        { time: "18:30 - 21:30", content: "告庄西双景：星光夜市预览，了解物价", type: "location" },
        { time: "21:30 - 22:30", content: "晚餐：傣味烧烤", type: "food" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "中科院植物园",
      tocTitle: "植物园",
      route: "告庄 → 中科院西双版纳热带植物园",
      events: [
        { time: "09:00 - 16:00", content: "中科院植物园：游览西区及部分东区（游览车往返）", type: "location" },
        { time: "18:00 - 19:30", content: "晚餐：版纳本地菜", type: "food" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 3,
      title: "野象谷 + 曼听公园",
      tocTitle: "野象 · 曼听",
      route: "告庄 → 野象谷 → 曼听公园 → 总佛寺",
      events: [
        { time: "09:00 - 12:30", content: "野象谷：索道俯瞰或栈道漫步", type: "location" },
        { time: "14:00 - 16:30", content: "曼听公园、总佛寺：拍摄建筑与热带园林", type: "location" },
        { time: "19:00 - 20:30", content: "看澜沧江夜景", type: "location" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 4,
      title: "版纳休整 + 澜沧江",
      tocTitle: "版纳 · 澜沧江",
      route: "傣族园或般若寺 → 澜沧江江畔",
      events: [
        { time: "10:00 - 14:00", content: "般若寺或当地集市", type: "location" },
        { time: "16:00 - 18:30", content: "澜沧江江边码头漫步", type: "location" },
        { time: "19:00 - 21:00", content: "告庄西双景深度回访", type: "location" },
      ],
      daySummary: "预计花费：约400元"
    },
    {
      day: 5,
      title: "版纳 → 大理",
      tocTitle: "版纳 · 大理",
      route: "西双版纳站 → 高铁 → 大理站 → 大理古城",
      events: [
        { time: "09:00 - 13:30", content: "乘高铁前往大理（约4.5小时）", type: "transport" },
        { time: "14:30 - 16:00", content: "入住大理古城民宿", type: "stay" },
        { time: "16:30 - 18:30", content: "大理古城漫步", type: "location" },
        { time: "19:00 - 20:30", content: "晚餐：白族酸辣鱼", type: "food" },
      ],
      daySummary: "预计花费：约800元"
    },
    {
      day: 6,
      title: "磻溪村 + 喜洲古镇",
      tocTitle: "洱海 · 环湖",
      route: "磻溪村 S 弯 → 喜洲古镇 → 周城扎染",
      events: [
        { time: "08:30 - 10:30", content: "磻溪村 S 弯：看海、拍照", type: "location" },
        { time: "11:00 - 13:00", content: "喜洲古镇", type: "location" },
        { time: "13:30 - 14:30", content: "午餐：喜洲粑粑", type: "food" },
        { time: "15:00 - 17:30", content: "周城：了解扎染制作", type: "location" },
      ],
      daySummary: "预计花费：约400元"
    },
    {
      day: 7,
      title: "苍山索道 + 寂照庵",
      tocTitle: "苍山 · 寂照庵",
      route: "苍山感通索道 → 寂照庵 → 洱海边",
      events: [
        { time: "09:00 - 12:00", content: "苍山感通索道", type: "location" },
        { time: "12:00 - 13:00", content: "寂照庵：斋饭", type: "food" },
        { time: "15:00 - 18:00", content: "龙龛码头或才村漫步", type: "location" },
      ],
      daySummary: "预计花费：约300元"
    },
    {
      day: 8,
      title: "大理 → 丽江",
      tocTitle: "大理 · 丽江",
      route: "大理站 → 高铁 → 丽江站 → 丽江古城",
      events: [
        { time: "10:00 - 11:30", content: "高铁前往丽江（约1.5小时）", type: "transport" },
        { time: "12:30 - 14:00", content: "入住丽江古城（大研古镇）", type: "stay" },
        { time: "15:00 - 18:00", content: "丽江古城、木府、万古楼", type: "location" },
        { time: "19:00 - 20:30", content: "晚餐：腊排骨火锅", type: "food" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 9,
      title: "玉龙雪山深度游",
      tocTitle: "玉龙雪山",
      route: "丽江古城 → 冰川大索道 → 蓝月谷",
      events: [
        { time: "07:30 - 12:30", content: "玉龙雪山：大索道登顶（需提前预订索道票）", type: "location" },
        { time: "13:00 - 15:30", content: "蓝月谷：步行观赏雪山下湖泊", type: "location" },
        { time: "17:00 - 18:30", content: "返回古城", type: "transport" },
      ],
      daySummary: "预计花费：约800元"
    },
    {
      day: 10,
      title: "束河古镇 + 白沙古镇",
      tocTitle: "束河 · 白沙",
      route: "束河古镇 → 白沙古镇 → 白沙壁画",
      events: [
        { time: "09:00 - 12:00", content: "束河古镇：相比大研更安静的古城", type: "location" },
        { time: "13:30 - 16:30", content: "白沙古镇：看白沙壁画，拍摄雪山作为背景的街道", type: "location" },
        { time: "18:00 - 19:30", content: "晚餐：野生菌火锅", type: "food" },
      ],
      daySummary: "预计花费：约400元"
    },
    {
      day: 11,
      title: "拉市海或丽江闲逛",
      tocTitle: "丽江 · 慢生活",
      route: "拉市海或就在丽江古城喝茶闲逛",
      events: [
        { time: "10:00 - 14:00", content: "拉市海：观鸟或漫步", type: "location" },
        { time: "15:00 - 18:00", content: "丽江古城咖啡馆、买特产", type: "location" },
      ],
      daySummary: "预计花费：约400元"
    },
    {
      day: 12,
      title: "返程",
      tocTitle: "丽江 · 归途",
      route: "丽江三义机场 → 返程",
      events: [
        { time: "09:00 - 11:00", content: "前往机场返程", type: "transport" },
      ],
      daySummary: "预计花费：约200元"
    },
  ],
  attractions: [
    { name: "中科院植物园", location: "西双版纳", description: "亚洲面积最大、植物多样性最丰富的植物园" },
    { name: "告庄西双景", location: "西双版纳", description: "星光夜市所在地，版纳的地标性商业中心" },
    { name: "洱海", location: "大理", description: "云南第二大淡水湖，S弯路段是核心看点" },
    { name: "玉龙雪山", location: "丽江", description: "北半球最近赤道的雪山，冰川大索道可登顶" },
    { name: "蓝月谷", location: "丽江", description: "雪山脚下的蓝色湖泊，背景即为玉龙雪山" },
  ],
  foods: [
    { type: "傣味特色", name: "傣味烧烤", location: "版纳", price: "80元" },
    { type: "大理风味", name: "酸辣鱼", location: "大理", price: "100元" },
    { type: "丽江特色", name: "腊排骨", location: "丽江", price: "120元" },
    { type: "菌类大餐", name: "野生菌火锅", location: "全省", price: "200元" },
  ],
  summary: {
    total: "8000元",
    note: "基于12日深度慢游核算，含版纳进、丽江出大交通及省内高铁费用。",
    details: [
      { label: "往返大交通", value: "2000元", icon: "Train" },
      { label: "省内用车/票", value: "1000元", icon: "MapPin" },
      { label: "11晚住宿", value: "2200元", icon: "Calendar" },
      { label: "门票支出", value: "1200元", icon: "Ticket" },
      { label: "餐饮美食", value: "1500元", icon: "Utensils" },
      { label: "机动金", value: "100元", icon: "Wallet" },
    ]
  }
};
