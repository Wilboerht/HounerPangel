import { TravelPlan } from "@/types/travel";

export const hongkongPlan: TravelPlan = {
  title: "香港2日旅行计划",
  icon: "🚋",
  slug: "hongkong",
  subtitle: "2026.12.20 - 2026.12.21",
  description: "针对高强度刷点设计的2日行程，极大化利用交通工具，覆盖九龙、港岛核心地标与网红摄影位。",
  budget: [
    { name: "往返交通", range: "800-1500元", note: "高铁或飞机往返" },
    { name: "市内交通", range: "150-200元", note: "全程八达通：港铁、天星小轮、叮叮车及巴士，绝不打车" },
    { name: "住宿", range: "600-1200元", note: "建议住旺角或尖沙咀，方便深夜扫街" },
    { name: "门票费用", range: "200-300元", note: "山顶缆车快线及少量景点门票" },
    { name: "餐饮美食", range: "600-1000元", note: "路边摊与茶餐厅无缝切换" },
    { name: "机动/购物", range: "500元+", note: "为体力补给和最后的扫货预留" },
  ],
  itinerary: [
    {
      day: 1,
      title: "九龙全景线：网红点连路刷",
      tocTitle: "九龙 · 极速刷点",
      route: "深圳口岸 → 东铁线 → 旺角 → 油麻地 → 尖沙咀 → 维港夜色",
      events: [
        { time: "10:30 - 11:30", content: "通过深圳口岸（福田/罗湖）抵港，乘东铁线直达旺角", type: "transport" },
        { time: "11:30 - 13:00", content: "旺角巡礼：金鱼街、花墟、通菜街（快速开启刷点模式）", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：佐敦 - 澳洲牛奶公司（极速翻台体验）", type: "food" },
        { time: "14:00 - 15:30", content: "油麻地：天后庙、百老汇电影中心（港片氛围感）", type: "location" },
        { time: "15:30 - 17:30", content: "西九文化区：M+、故宫文化博物馆（建筑外围快速出片）", type: "location" },
        { time: "17:30 - 19:30", content: "尖沙咀：K11 Musea、钟楼、星光大道（赏日落）", type: "location" },
        { time: "20:00 - 20:30", content: "幻彩咏香江 + 天星小轮（过海至中环转一圈返航）", type: "transport" },
        { time: "21:00 - 22:30", content: "晚餐：庙街大牌档 + 佳佳甜品（宵夜档）", type: "food" },
      ],
      daySummary: "预计花费：约1300元（含特种兵高强度补给）"
    },
    {
      day: 2,
      title: "港岛纵贯线：从旧城到山顶",
      tocTitle: "港岛 · 巅峰合影",
      route: "上环 → 中环 → 坚尼地城 → 鲗鱼涌 → 山顶 → 返程",
      events: [
        { time: "08:30 - 09:30", content: "早餐：上环莲香居（体验推车早茶的速度与激情）", type: "food" },
        { time: "09:30 - 11:00", content: "中环环线：大馆、半山扶梯、壁画街、文武庙", type: "location" },
        { time: "11:00 - 12:00", content: "港铁直达 坚尼地城：% Arabica 门前拍海景、最西端落日点（反向刷）", type: "location" },
        { time: "12:00 - 13:00", content: "午餐：湾仔/中环极速烧味（甘牌烧鹅或强记）", type: "food" },
        { time: "13:30 - 14:30", content: "港铁直达 鲗鱼涌：“怪兽大楼”（益昌大厦）震撼压迫感摄影", type: "location" },
        { time: "15:00 - 17:30", content: "山顶缆车（提前购票）：凌霄阁俯瞰全港，快速往返", type: "location" },
        { time: "17:30 - 19:30", content: "铜锣湾最后扫货：SOGO / 时代广场（精准买入）", type: "location" },
        { time: "20:00 - 20:30", content: "抵达西九龙站，完成特种兵挑战，返程", type: "transport" },
      ],
      daySummary: "预计花费：约1000元"
    },
  ],
  attractions: [
    { name: "旺角/金鱼街", location: "九龙", description: "电影质感场景，适合快速街拍" },
    { name: "坚尼地城", location: "港岛西", description: "近年最火临海机位，出片率极高" },
    { name: "怪兽大楼", location: "鲗鱼涌", description: "极致的城市压迫感，变形金刚取景地" },
    { name: "山顶凌霄阁", location: "太平山", description: "2天行程中唯一的高空全景俯瞰点" },
    { name: "星光大道", location: "尖沙咀", description: "维港标准照的最佳拍摄地" },
  ],
  foods: [
    { type: "极速茶餐", name: "澳洲牛奶公司", location: "佐敦", price: "50元" },
    { type: "传统早茶", name: "莲香居", location: "上环", price: "120元" },
    { type: "地道烧味", name: "甘牌/再兴/强记", location: "港岛", price: "100元" },
    { type: "宵夜甜品", name: "佳佳甜品", location: "佐敦", price: "40元" },
    { type: "街头小吃", name: "鸡蛋仔/咖喱鱼蛋", location: "全港", price: "30元" },
  ],
  summary: {
    total: "4000元",
    note: "针对全程无尿点的极速刷点行程核算，含往返交通、市区核心住宿及高频高效补给",
    details: [
      { label: "往返交通", value: "1200元", icon: "Train" },
      { label: "公共交通", value: "200元", icon: "Train" },
      { label: "核心住宿", value: "1000元", icon: "Calendar" },
      { label: "景点门票", value: "300元", icon: "Ticket" },
      { label: "高频餐饮", value: "800元", icon: "Utensils" },
      { label: "最后备金", value: "500元", icon: "Wallet" },
    ]
  }
};
