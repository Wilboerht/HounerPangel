import { TravelPlan } from "@/types/travel";

export const guangzhouPlan: TravelPlan = {
  title: "广州3日计划",
  icon: "🍜",
  slug: "guangzhou",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "广州3日：新城地标、西关老街、美食体验。",
  budget: [
    { name: "往返交通", range: "800-1500元", note: "高铁直达广州南站或民航抵达白云机场" },
    { name: "市内交通", range: "100-200元", note: "地铁为主，体验APM线与珠江渡轮" },
    { name: "住宿", range: "800-1600元", note: "2晚住宿，选在越秀或天河区" },
    { name: "餐饮费用", range: "800-1200元", note: "早茶、烧鹅、老火靓汤、宵夜甜品" },
    { name: "门票/娱乐", range: "300-500元", note: "包含珠江夜游、广州塔等" },
  ],
  itinerary: [
    {
      day: 1,
      title: "珠江新城 + 广州塔",
      tocTitle: "新城 · 广州塔",
      route: "抵达广州 → 珠江新城 → 花城广场 → 广州塔 → 珠江夜游",
      events: [
        { time: "14:00 - 15:30", content: "入住天河区酒店", type: "transport" },
        { time: "16:00 - 18:00", content: "花城广场、拍摄广州塔", type: "location" },
        { time: "18:00 - 19:30", content: "晚餐：炳胜品味或陶陶居", type: "food" },
        { time: "20:00 - 21:30", content: "珠江夜游", type: "location" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "西关 + 永庆坊 + 沙面",
      tocTitle: "西关 · 老城",
      route: "泮溪酒家 → 荔枝湾涌 → 永庆坊 → 沙面岛",
      events: [
        { time: "09:00 - 11:00", content: "早茶：泮溪酒家", type: "food" },
        { time: "11:00 - 13:00", content: "荔枝湾涌", type: "location" },
        { time: "13:30 - 16:00", content: "永庆坊：打卡李小龙祖居与非遗馆", type: "location" },
        { time: "16:30 - 18:30", content: "沙面岛", type: "location" },
        { time: "19:00 - 20:30", content: "晚餐：上下九", type: "food" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 3,
      title: "陈家祠 + 越秀公园 + 省博",
      tocTitle: "陈家祠 · 省博",
      route: "陈家祠 → 越秀公园 → 广东省博物馆 → 返程",
      events: [
        { time: "09:00 - 10:30", content: "陈家祠", type: "location" },
        { time: "11:00 - 13:00", content: "越秀公园：五羊石雕、古城墙", type: "location" },
        { time: "13:30 - 16:00", content: "广东省博物馆", type: "location" },
        { time: "16:30 - 18:00", content: "返程", type: "transport" },
      ],
      daySummary: "预计花费：约400元"
    },
  ],
  attractions: [
    { name: "广州塔", location: "海珠区", description: "昵称“小蛮腰”，中国第一高塔，全城制高点" },
    { name: "陈家祠", location: "荔湾区", description: "岭南建筑艺术的明珠，装饰艺术极其精美" },
    { name: "永庆坊", location: "荔湾区", description: "广州最美骑楼街，传统文化与现代商业的完美跨界" },
    { name: "沙面", location: "荔湾区", description: "清末租界，汇集了多国建筑风格，极具复古氛围" },
    { name: "东山口", location: "越秀区", description: "红砖洋房建筑群，广州当下的‘潮人’聚集地" },
  ],
  foods: [
    { type: "经典早茶", name: "泮溪酒家", location: "荔湾区", price: "120元", rowSpan: 3 },
    { type: "经典早茶", name: "点都德", location: "全城连锁", price: "100元" },
    { type: "经典早茶", name: "陶陶居", location: "第十甫路", price: "130元" },
    { type: "烧腊精品", name: "炳胜品味", location: "珠江新城", price: "200元" },
    { type: "啫啫煲", name: "惠食佳", location: "越秀区", price: "150元" },
    { type: "甜品老铺", name: "南信牛奶甜品", location: "上下九", price: "40元", rowSpan: 2 },
    { type: "甜品老铺", name: "百花甜品", location: "文明路", price: "30元" },
    { type: "传统小吃", name: "珍珍小食店", location: "西华路", price: "40元", rowSpan: 2 },
    { type: "传统小吃", name: "源记肠粉", location: "华贵路", price: "25元" },
  ],
  summary: {
    total: "4200元",
    note: "基于3日行程核算，含往返交通及市区住宿。",
    details: [
      { label: "往返大交通", value: "1200元", icon: "Train" },
      { label: "市内交通", value: "150元", icon: "MapPin" },
      { label: "2晚住宿", value: "1400元", icon: "Calendar" },
      { label: "门票/娱乐", value: "400元", icon: "Ticket" },
      { label: "餐饮美食", value: "900元", icon: "Utensils" },
      { label: "机动金", value: "150元", icon: "Wallet" },
    ]
  }
};
