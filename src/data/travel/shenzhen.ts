import { TravelPlan } from "@/types/travel";

export const shenzhenPlan: TravelPlan = {
  title: "深圳2-3日旅游计划（配套香港）",
  icon: "🌲",
  slug: "shenzhen",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "深港行程衔接。1-2日看城市，3日备战香港。重点是核验资料和休息。",
  budget: [
    { name: "往返交通", range: "600-1200元", note: "大交通费用，根据出发地浮动" },
    { name: "市内交通", range: "120-200元", note: "地铁为主，使用微信/支付宝乘车码" },
    { name: "住宿", range: "1000-2000元", note: "2-3晚住宿，选在福田或南山" },
    { name: "餐饮", range: "600-1200元", note: "椰子鸡、粤式早茶、深港风味宵夜" },
    { name: "门票/机动", range: "400元+", note: "包含平安中心观光、备用机动资金" },
  ],
  itinerary: [
    {
      day: 1,
      title: "福田 CBD + 莲花山",
      tocTitle: "CBD · 莲花山",
      route: "抵达深圳 → 莲花山 → 平安金融中心 → 深业上城",
      events: [
        { time: "14:00 - 15:30", content: "抵达深圳，入住福田 CBD 附近酒店", type: "transport" },
        { time: "16:00 - 17:30", content: "莲花山公园：瞻仰伟人雕像，俯瞰中轴线全景", type: "location" },
        { time: "17:30 - 19:30", content: "登上平安金融中心（PAFC）观光层，在云端远眺香港界面", type: "location" },
        { time: "20:00 - 21:30", content: "晚餐：润园四季椰子鸡，感受深圳代表性美食", type: "food" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "南山 + 深圳湾 + 海上世界",
      tocTitle: "南山 · 滨海",
      route: "南头古城 → 万象天地 → 深圳湾公园 → 海上世界",
      events: [
        { time: "09:30 - 11:30", content: "南头古城：在1700年历史的古迹中感受创意艺术与老街活力", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：万象天地（网红餐饮集中地，如陈鹏鹏鹅肉店）", type: "food" },
        { time: "14:30 - 17:00", content: "深圳湾公园：漫步/骑行（冬日观鸟佳处，隔海相望香港）", type: "location" },
        { time: "17:30 - 20:30", content: "海上世界：欣赏音乐喷泉，享受异国风情夜宴", type: "location" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 3,
      title: "华强北 + 资料核验",
      tocTitle: "华强北 · 资料",
      route: "华强北 → 资料核验 → 移师口岸",
      events: [
        { time: "10:00 - 12:30", content: "华强北步行街：选购数码配件", type: "location" },
        { time: "13:00 - 14:30", content: "东门午餐：地道街头小吃或腊味煲仔饭", type: "food" },
        { time: "15:00 - 17:00", content: "【最高优先级】回酒店核验香港办卡资料，确保 PDF 已下载且网络顺畅", type: "location" },
        { time: "18:00 - 20:00", content: "移师福田口岸附近住宿，为次日过关做最后物理准备", type: "transport" },
        { time: "21:00 - 22:00", content: "休息，早睡准备过关", type: "location" },
      ],
      daySummary: "预计花费：约400元"
    },
  ],
  attractions: [
    { name: "平安金融中心", location: "福田", description: "深圳地标，云端观景台可直视香港群山" },
    { name: "深圳湾公园", location: "南山", description: "长达13公里的海岸线，深圳最美滨海走廊" },
    { name: "南头古城", location: "南山", description: "深港历史之根，岭南文化与现代艺术的交会点" },
    { name: "华强北", location: "福田", description: "世界级电子市场，感受硬核深圳的供应链魅力" },
  ],
  foods: [
    { type: "深圳必吃", name: "润园四季椰子鸡", location: "全城连锁", price: "150元" },
    { type: "粤派烧腊", name: "陈鹏鹏鹅肉店", location: "万象天地", price: "120元" },
    { type: "地道早茶", name: "蘩楼", location: "福田/南山", price: "100元", rowSpan: 2 },
    { type: "地道早茶", name: "点都德", location: "全城连锁", price: "100元" },
    { type: "宵夜解压", name: "辉记炭烧海鲜", location: "南山", price: "180元" },
  ],
  summary: {
    total: "4500元",
    note: "基于3日程行程核算。",
    details: [
      { label: "往返大交通", value: "1000元", icon: "Train" },
      { label: "公共交通", value: "200元", icon: "MapPin" },
      { label: "3晚酒店", value: "1800元", icon: "Calendar" },
      { label: "门票/观光", value: "400元", icon: "Ticket" },
      { label: "餐饮/茶饮", value: "900元", icon: "Utensils" },
      { label: "机动金", value: "200元", icon: "Wallet" },
    ]
  }
};
