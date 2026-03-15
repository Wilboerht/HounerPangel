import { TravelPlan } from "@/types/travel";

export const chengduPlan: TravelPlan = {
  title: "成都3日计划",
  icon: "🐼",
  slug: "chengdu",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "成都3日：大熊猫基地、武侯祠、宽窄巷子、川味美食。",
  budget: [
    { name: "往返交通", range: "1000-1800元", note: "大交通费用，提前预订天府或双流机场航班" },
    { name: "市内交通", range: "80-150元", note: "地铁极其便利，打车性价比较高" },
    { name: "住宿", range: "800-1600元", note: "2晚住宿，选在春熙路或太古里附近" },
    { name: "餐饮费用", range: "800-1200元", note: "火锅、串串、川菜及名小吃" },
    { name: "门票/娱乐", range: "200-400元", note: "熊猫基地、武侯祠等门票" },
  ],
  itinerary: [
    {
      day: 1,
      title: "熊猫基地 + 宽窄巷子",
      tocTitle: "熊猫 · 宽窄",
      route: "抵达成都 → 熊猫基地 → 宽窄巷子 → 锦江夜游",
      events: [
        { time: "08:30 - 12:00", content: "熊猫基地：清晨出发，看熊猫吃竹子", type: "location" },
        { time: "12:30 - 14:00", content: "午餐：宽窄巷子周边川菜（如成都吃客）", type: "food" },
        { time: "14:30 - 17:00", content: "漫步宽窄巷子：感受清代古街道与现代创意的交融", type: "location" },
        { time: "18:00 - 19:30", content: "晚餐：地道成都火锅，体验麻辣鲜香", type: "food" },
        { time: "20:00 - 21:30", content: "锦江夜游", type: "location" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "武侯祠 + 锦里 + 人民公园",
      tocTitle: "三国 · 采耳",
      route: "武侯祠 → 锦里 → 人民公园 → 琴台路",
      events: [
        { time: "09:00 - 11:30", content: "武侯祠：探访三国文化遗迹，过红墙夹道", type: "location" },
        { time: "11:30 - 13:00", content: "锦里漫步：品尝各色非遗小吃，感受民俗魅力", type: "location" },
        { time: "13:30 - 16:30", content: "人民公园鹤鸣茶社：像成都人一样喝茶、采耳、发呆", type: "location" },
        { time: "17:00 - 19:00", content: "晚餐：体验成都串串香，辣而不燥", type: "food" },
        { time: "19:30 - 21:00", content: "川剧表演", type: "location" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 3,
      title: "太古里 + 金沙遗址 + 返程",
      tocTitle: "文化 · 归途",
      route: "太古里/IFS → 金沙遗址博物馆 → 返程",
      events: [
        { time: "10:00 - 12:30", content: "远洋太古里 & IFS：打卡爬墙熊猫，看现代商业与古刹共生", type: "location" },
        { time: "13:00 - 15:30", content: "金沙遗址博物馆：目睹‘太阳神鸟’，穿越回古蜀时代", type: "location" },
        { time: "16:00 - 18:00", content: "返程", type: "transport" },
      ],
      daySummary: "预计花费：约400元"
    },
  ],
  attractions: [
    { name: "大熊猫基地", location: "成华区", description: "近距离观察国宝的最佳地点，早晨游览体验最佳" },
    { name: "武侯祠/锦里", location: "武侯区", description: "三国圣地与民俗老街的完美组合" },
    { name: "远洋太古里", location: "锦江区", description: "将历史建筑与高端商业完美融合的开放式街区" },
    { name: "杜甫草堂", location: "青羊区", description: "诗圣杜甫在成都的遗迹，清幽雅致的古园林" },
    { name: "金沙遗址", location: "青羊区", description: "古蜀文明的巅峰展示，可见绝美的太阳神鸟金饰" },
  ],
  foods: [
    { type: "麻辣火锅", name: "蜀九香/蜀大侠", location: "全城连锁", price: "180元", rowSpan: 2 },
    { type: "麻辣火锅", name: "园里火锅", location: "高新区/天河路", price: "220元" },
    { type: "地道串串", name: "马路边边", location: "致民路", price: "100元", rowSpan: 2 },
    { type: "地道串串", name: "五娘串串", location: "望平街", price: "90元" },
    { type: "名优小吃", name: "龙抄手/钟水饺", location: "春熙路总店", price: "50元", rowSpan: 3 },
    { type: "名优小吃", name: "贺记蛋烘糕", location: "文庙街", price: "20元" },
    { type: "名优小吃", name: "严太婆锅盔", location: "人民中路", price: "15元" },
    { type: "地道川菜", name: "成都吃客", location: "致民路", price: "120元" },
    { type: "盖碗名茶", name: "鹤鸣茶社", location: "人民公园", price: "30元" },
  ],
  summary: {
    total: "4500元",
    note: "基于3日行程核算，含往返交通及市中心住宿。",
    details: [
      { label: "往返大交通", value: "1500元", icon: "Train" },
      { label: "市内交通", value: "150元", icon: "MapPin" },
      { label: "2晚住宿", value: "1400元", icon: "Calendar" },
      { label: "门票支出", value: "300元", icon: "Ticket" },
      { label: "餐饮美食", value: "900元", icon: "Utensils" },
      { label: "机动金", value: "250元", icon: "Wallet" },
    ]
  }
};
