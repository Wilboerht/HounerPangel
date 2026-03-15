import { TravelPlan } from "@/types/travel";

export const beijingPlan: TravelPlan = {
  title: "北京3日精简计划",
  icon: "🏛️",
  slug: "beijing",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "北京3日行程：故宫、长城、天坛、烤鸭。",
  budget: [
    { name: "往返交通", range: "800-1600元", note: "直达北京南站或大兴/首都机场" },
    { name: "市内交通", range: "150-250元", note: "地铁为主" },
    { name: "住宿", range: "800-1500元", note: "2晚住宿，选在二环内" },
    { name: "餐饮费用", range: "800-1200元", note: "烤鸭、炸酱面、小吃" },
    { name: "门票支出", range: "200-400元", note: "故宫、长城、天坛等" },
  ],
  itinerary: [
    {
      day: 1,
      title: "天安门 + 故宫 + 景山",
      tocTitle: "故宫 · 皇城",
      route: "天安门广场 → 故宫博物院 → 景山公园 → 王府井",
      events: [
        { time: "08:30 - 10:00", content: "天安门广场：瞻仰纪念碑，打卡红墙绿瓦下的庄严轴线", type: "location" },
        { time: "10:00 - 15:30", content: "故宫博物院：深度漫步六百年皇宫，探访三大殿与东西六宫（需提前7天预约）", type: "location" },
        { time: "15:30 - 17:00", content: "景山公园：登上万春亭，俯瞰紫禁城全景及北京城市中轴线", type: "location" },
        { time: "18:00 - 20:30", content: "晚餐：王府井或东单周边", type: "food" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "慕田峪长城 + 鸟巢/水立方",
      tocTitle: "长城 · 奥运",
      route: "慕田峪长城 → 奥运塔 → 鸟巢 → 水立方",
      events: [
        { time: "08:00 - 13:30", content: "慕田峪长城：人少风景好，乘坐缆车往返", type: "location" },
        { time: "14:00 - 15:30", content: "午餐：长城脚下特色农家院，尝试怀柔红鳟鱼", type: "food" },
        { time: "16:30 - 18:30", content: "奥林匹克公园：打卡鸟巢、水立方及玲珑塔夜景", type: "location" },
        { time: "19:00 - 21:00", content: "晚餐：北边商业区美食", type: "food" },
      ],
      daySummary: "预计花费：约700元"
    },
    {
      day: 3,
      title: "天坛 + 颐和园/前门 + 返程",
      tocTitle: "天坛 · 归途",
      route: "天坛公园 → 颐和园（可选） → 前门大街 → 返程",
      events: [
        { time: "08:30 - 10:30", content: "天坛公园：参观祈年殿，感受祭天文化的神秘", type: "location" },
        { time: "11:00 - 14:00", content: "颐和园（可选）：感受皇家园林之气派；或前往前门大街漫步，品尝北京烤鸭", type: "location" },
        { time: "14:30 - 16:30", content: "返程", type: "transport" },
      ],
      daySummary: "预计花费：约400元"
    },
  ],
  attractions: [
    { name: "故宫博物院", location: "东城区", description: "明清两代皇家宫殿，世界上保存最完整的木质结构古建筑群" },
    { name: "慕田峪长城", location: "怀柔区", description: "明代长城的精华所在，以雄伟、奇巧著称，植被覆盖率极高" },
    { name: "颐和园", location: "海淀区", description: "中国现存规模最大、保存最完整的皇家园林" },
    { name: "中国国家博物馆", location: "东城区", description: "中华文化的顶级殿堂，收藏有大量国宝级文物" },
    { name: "天坛公园", location: "东城区", description: "明清皇室祭天祈谷的场所，其祈年殿是帝都的标志性建筑" },
  ],
  foods: [
    { type: "老北京烤鸭", name: "四季民福/全聚德", location: "全城连锁", price: "200元", rowSpan: 2 },
    { type: "老北京烤鸭", name: "大董烤鸭", location: "东城区", price: "350元" },
    { type: "老北京涮肉", name: "聚宝源/东来顺", location: "牛街/东城区", price: "150元", rowSpan: 2 },
    { type: "老北京涮肉", name: "聚隆居", location: "西城区", price: "120元" },
    { type: "传统小吃", name: "姚记炒肝", location: "鼓楼", price: "40元", rowSpan: 3 },
    { type: "传统小吃", name: "尹三豆汁", location: "天坛北门", price: "15元" },
    { type: "传统小吃", name: "方砖厂69号炸酱面", location: "南锣鼓巷", price: "35元" },
    { type: "宫廷点心", name: "富华斋/稻香村", location: "东城区", price: "80元" },
  ],
  summary: {
    total: "4200元",
    note: "基于3日精简游方案核算，含往返交通及二环内住宿。",
    details: [
      { label: "往返大交通", value: "1400元", icon: "Train" },
      { label: "市内交通", value: "200元", icon: "MapPin" },
      { label: "2晚住宿", value: "1500元", icon: "Calendar" },
      { label: "门票预订", value: "300元", icon: "Ticket" },
      { label: "餐饮美食", value: "600元", icon: "Utensils" },
      { label: "机动金", value: "200元", icon: "Wallet" },
    ]
  }
};
