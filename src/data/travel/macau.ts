import { TravelPlan } from "@/types/travel";

export const macauPlan: TravelPlan = {
  title: "澳门2日旅行计划",
  icon: "🇲🇴",
  slug: "macau",
  subtitle: "2026.12.22 - 2026.12.23",
  description: "澳门2日深度游：涵盖大三巴牌坊、妈阁庙、官也街美食及金光大道璀璨夜景体验。",
  budget: [
    { name: "往返交通", range: "200-500元", note: "从香港乘喷射飞航/金光飞航或经珠海口岸入澳" },
    { name: "市内交通", range: "50-100元", note: "善用发财车（酒店免费穿梭巴士）及公交车，基本无需打车" },
    { name: "住宿", range: "800-1500元", note: "1晚住宿，建议选在氹仔路氹城或半岛核心区" },
    { name: "餐饮费用", range: "600-1000元", note: "葡国鸡、葡挞、猪扒包、水蟹粥及各类地道小吃" },
    { name: "预备资金", range: "300元+", note: "用于购买伴手礼（手信）及应急" },
  ],
  itinerary: [
    {
      day: 1,
      title: "澳门半岛 + 大三巴 + 渔人码头",
      tocTitle: "半岛 · 老城",
      route: "抵达澳门 → 大三巴牌坊 → 恋爱巷 → 议事亭前地 → 渔人码头",
      events: [
        { time: "10:30 - 11:30", content: "抵达澳门（外港码头或关闸口岸），寄存行李并前往老城区", type: "transport" },
        { time: "11:30 - 13:00", content: "大三巴牌坊 & 恋爱巷：打卡澳门地标，感受历史建筑与现代浪漫的碰撞", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：议事亭前地周边地道小吃（如番茄屋葡国菜）", type: "food" },
        { time: "14:30 - 16:30", content: "玫瑰圣母堂 & 议事亭前地：在南欧风情的广场中漫步漫游", type: "location" },
        { time: "17:00 - 19:00", content: "渔人码头：在仿罗马竞技场建筑中捕捉绝美日落影像", type: "location" },
        { time: "19:30 - 21:00", content: "晚餐：半岛区老铺（如义顺牛奶公司）或地道粤菜", type: "food" },
      ],
      daySummary: "预计花费：约1200元（沉浸在澳门老城的历史底蕴中）"
    },
    {
      day: 2,
      title: "氹仔 + 官也街 + 金光大道",
      tocTitle: "氹仔 · 奢华",
      route: "官也街 → 龙环葡韵 → 路氹金光大道 (威尼斯人/伦敦人) → 返程",
      events: [
        { time: "09:30 - 11:30", content: "官也街：疯狂试吃手信，品尝莫义记榴莲雪糕与诚昌饭店水蟹粥", type: "location" },
        { time: "11:30 - 12:30", content: "午餐：大利来记猪扒包（下午茶亦可）", type: "food" },
        { time: "13:00 - 14:30", content: "龙环葡韵：在薄荷绿色的建筑前感受土生葡人的昔日生活", type: "location" },
        { time: "15:00 - 18:00", content: "路氹金光大道：巡礼威尼斯人（运河）、伦敦人（大本钟）、巴黎人（铁塔）", type: "location" },
        { time: "18:30 - 19:30", content: "晚餐：在大型综合度假村内享受国际化饕餮大餐", type: "food" },
        { time: "20:00 - 21:00", content: "前往码头或口岸，结束完美的深港澳联游", type: "transport" },
      ],
      daySummary: "预计花费：约1000元（体验澳门现代奢华与地道烟火的完美融合）"
    },
  ],
  attractions: [
    { name: "大三巴牌坊", location: "澳门半岛", description: "澳门最著名的地标，圣保禄大教堂遗址，中西合璧的艺术杰作" },
    { name: "伦敦人大本钟", location: "路氹城", description: "1:1还原伦敦地标，是目前澳门最热门的摄影打卡位" },
    { name: "官也街", location: "氹仔", description: "著名的美食与手信一条街，聚集了大量网红老字号" },
    { name: "渔人码头", location: "澳门半岛", description: "复刻古罗马风情的文化区，非常适合人像拍摄" },
    { name: "威尼斯人运河", location: "路氹城", description: "室内运河与贡多拉体验，仿佛置身水城意境" },
  ],
  foods: [
    { type: "经典葡挞", name: "马嘉烈葡挞", location: "澳门半岛", price: "12元", rowSpan: 2 },
    { type: "经典葡挞", name: "安德鲁饼店", location: "路环/官也街店", price: "12元" },
    { type: "特色猪扒包", name: "大利来记", location: "官也街", price: "55元", rowSpan: 2 },
    { type: "特色猪扒包", name: "老记粥面", location: "筷子基", price: "45元" },
    { type: "地道小吃", name: "莫义记大菜糕", location: "官也街", price: "40元", rowSpan: 3 },
    { type: "地道小吃", name: "义顺牛奶公司", location: "议事亭前地", price: "35元" },
    { type: "地道小吃", name: "潘威记甜点", location: "老城区", price: "30元" },
    { type: "名家葡国菜", name: "番茄屋", location: "大三巴附近", price: "150元" },
    { type: "奢华自助", name: "上葡京/自助山", location: "路氹城", price: "500元" },
  ],
  summary: {
    total: "3500元",
    note: "基于2日深度游方案核算，含一晚高标准酒店及高频次美食补给。",
    details: [
      { label: "往返交通", value: "400元", icon: "Train" },
      { label: "市内交通", value: "80元", icon: "MapPin" },
      { label: "1晚住宿", value: "1000元", icon: "Calendar" },
      { label: "景点体验", value: "200元", icon: "Ticket" },
      { label: "餐饮美食", value: "1200元", icon: "Utensils" },
      { label: "手信机动", value: "620元", icon: "Wallet" },
    ]
  }
};
