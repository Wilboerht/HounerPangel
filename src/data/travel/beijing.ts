import { TravelPlan } from "@/types/travel";

export const beijingPlan: TravelPlan = {
  title: "北京5日旅行计划",
  icon: "🏛️",
  slug: "beijing",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "北京5日深度游：涵盖故宫、长城、颐和园、天坛及地道北京烤鸭与涮肉体验。",
  budget: [
    { name: "往返交通", range: "800-1600元", note: "大交通费用，建议高铁抵达北京南站或飞抵大兴/首都机场" },
    { name: "市内交通", range: "150-250元", note: "地铁为主，北京地铁网络极其发达，覆盖所有核心景点" },
    { name: "住宿", range: "1500-3000元", note: "4晚住宿，建议选在二环内（东单、西单、前门）方便出行" },
    { name: "餐饮费用", range: "1200-2000元", note: "北京烤鸭、老北京涮肉、炸酱面及各类宫廷点心" },
    { name: "门票支出", range: "300-500元", note: "故宫（提前预订）、长城、颐和园等门票" },
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
        { time: "18:00 - 20:30", content: "晚餐：王府井或东单周边地道老北京美食", type: "food" },
      ],
      daySummary: "预计花费：约600元（体验帝都心脏的厚重历史）"
    },
    {
      day: 2,
      title: "慕田峪长城 + 鸟巢/水立方",
      tocTitle: "长城 · 奥运",
      route: "慕田峪长城 → 奥运塔 → 鸟巢 → 水立方",
      events: [
        { time: "08:00 - 13:30", content: "慕田峪长城：相比八达岭人更少、风景更秀丽，建议乘坐缆车往返", type: "location" },
        { time: "14:00 - 15:30", content: "午餐：长城脚下特色农家院，尝试怀柔红鳟鱼", type: "food" },
        { time: "16:30 - 18:30", content: "奥林匹克公园：打卡鸟巢、水立方及玲珑塔夜景", type: "location" },
        { time: "19:00 - 21:00", content: "晚餐：北边商业区（如新土城）美食体验", type: "food" },
      ],
      daySummary: "预计花费：约700元（跨越千年的宏大巡礼）"
    },
    {
      day: 3,
      title: "颐和园 + 圆明园 + 清北校园",
      tocTitle: "园林 · 学府",
      route: "颐和园 → 圆明园 → 清华/北大周边",
      events: [
        { time: "09:00 - 12:30", content: "颐和园：漫步长廊，乘船游览昆明湖，感受皇家园林之首的气派", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：中关村或海淀区高校周边美食", type: "food" },
        { time: "14:30 - 16:30", content: "圆明园：参观大水法遗迹，了解‘万园之园’的沧桑历史", type: "location" },
        { time: "17:00 - 18:30", content: "清华/北大：校园外围打卡，感受顶级学府的人文学氛", type: "location" },
      ],
      daySummary: "预计花费：约500元（沉浸在宁静的园林与书香之中）"
    },
    {
      day: 4,
      title: "天坛 + 国家博物馆 + 前门大街",
      tocTitle: "天坛 · 前门",
      route: "天坛公园 → 中国国家博物馆 → 前门大街 → 大栅栏",
      events: [
        { time: "09:00 - 11:30", content: "天坛公园：参观祈年殿、回音壁，感受祭天文化的神秘", type: "location" },
        { time: "13:00 - 16:00", content: "中国国家博物馆：深度参观《古代中国》展，看尽华夏珍宝（需预约）", type: "location" },
        { time: "16:30 - 19:30", content: "前门大街/大栅栏：逛老字号商店，体验老北京的市井繁华", type: "location" },
        { time: "20:00 - 21:30", content: "晚餐：前门周边北京烤鸭（如全聚德或四季民福）", type: "food" },
      ],
      daySummary: "预计花费：约700元（纵贯古今的京城记忆）"
    },
    {
      day: 5,
      title: "798艺术区 + 三里屯 + 返程",
      tocTitle: "艺术 · 摩登",
      route: "798艺术区 → 三里屯 Taikoo Li → 返程",
      events: [
        { time: "10:00 - 12:30", content: "798艺术区：在旧工厂改造的艺术空间中感受现代先锋艺术", type: "location" },
        { time: "13:00 - 15:30", content: "三里屯 Taikoo Li：时尚icon聚集地，完成最后的时尚打卡与购礼", type: "location" },
        { time: "16:30 - 18:00", content: "整理行李，前往机场或火车站，结束北京之旅", type: "transport" },
      ],
      daySummary: "预计花费：约400元（感受现代北京的灵动与速度）"
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
    total: "6800元",
    note: "基于5日深度游方案核算，含往返大交通及二环内核心酒店住宿。",
    details: [
      { label: "往返大交通", value: "1400元", icon: "Train" },
      { label: "市内交通", value: "250元", icon: "MapPin" },
      { label: "4晚住宿", value: "2600元", icon: "Calendar" },
      { label: "门票预订", value: "400元", icon: "Ticket" },
      { label: "餐饮美食", value: "1800元", icon: "Utensils" },
      { label: "机动金", value: "350元", icon: "Wallet" },
    ]
  }
};
