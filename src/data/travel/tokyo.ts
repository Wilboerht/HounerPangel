import { TravelPlan } from "@/types/travel";

export const tokyoPlan: TravelPlan = {
  title: "东京3日旅行计划",
  icon: "🗼",
  slug: "tokyo",
  countryCode: "JP",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "东京3日深度游：涵盖涩谷、新宿、浅草寺、秋叶原及地道日式拉面与寿司体验。",
  budget: [
    { name: "往返交通", range: "2000-4000元", note: "国际航班飞往成田或羽田机场" },
    { name: "市内交通", range: "300-500元", note: "利用东京地铁/JR，建议购买西瓜卡或地铁周游券" },
    { name: "住宿", range: "2000-4000元", note: "3晚住宿，建议选在新宿或上野附近" },
    { name: "餐饮费用", range: "1500-2500元", note: "拉面、寿司、居酒屋、甜点" },
    { name: "门票支出", range: "400-800元", note: "Shibuya Sky、美术馆、寺庙观光" },
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
      title: "筑地市场 + 台场 + 归途",
      tocTitle: "海鲜 · 湾区",
      route: "筑地场外市场 → 丰洲团队实验室 → 台场海滨公园 → 返程",
      events: [
        { time: "08:00 - 10:30", content: "筑地场外市场：享用最鲜甜的海鲜丼与玉子烧早餐", type: "food" },
        { time: "11:00 - 13:30", content: "teamLab Planets：体验沉浸式数字艺术的无限魅力", type: "location" },
        { time: "14:00 - 16:30", content: "台场：观赏彩虹大桥、巨型高达模型，漫步海滨公园", type: "location" },
        { time: "17:00 - 18:30", content: "整理行囊，准备前往机场结束东京之行", type: "transport" },
      ],
      daySummary: "预计花费：约600元（在海风与科技感中画下圆满句号）"
    },
  ],
  attractions: [
    { name: "浅草寺", location: "台东区", description: "东京最古老的寺庙，江户时代的下町文化象征" },
    { name: "涩谷十字路口", location: "涩谷区", description: "世界著名的地标，展现了高度发达的现代都市风貌" },
    { name: "明治神宫", location: "涩谷区", description: "奉祀明治天皇和昭宪皇太后的神社，是东京的核心大绿洲" },
    { name: "东京铁塔", location: "港区", description: "东京的象征，经典的红色铁塔设计，极具怀旧与浪漫感" },
  ],
  foods: [
    { type: "日式拉面", name: "一兰拉面", location: "全城连锁", price: "60元", rowSpan: 2 },
    { type: "日式拉面", name: "AFURI (阿夫利)", location: "原宿/新宿", price: "80元" },
    { type: "高级寿司", name: "寿司大", location: "丰洲市场", price: "200元", rowSpan: 2 },
    { type: "高级寿司", name: "美登利", location: "涩谷/银座", price: "150元" },
    { type: "特色快餐", name: "松屋/吉野家", location: "全城连锁", price: "30元" },
  ],
  summary: {
    total: "8500元",
    note: "基于3日深度游方案核算，含国际交通概算、精品住宿及高品质体验餐饮。",
    details: [
      { label: "国际大交通", value: "3000元", icon: "Train" },
      { label: "市内交通", value: "400元", icon: "MapPin" },
      { label: "3晚住宿", value: "3000元", icon: "Calendar" },
      { label: "门票/体验", value: "600元", icon: "Ticket" },
      { label: "餐饮美食", value: "1200元", icon: "Utensils" },
      { label: "机动购礼", value: "300元", icon: "Wallet" },
    ]
  }
};
