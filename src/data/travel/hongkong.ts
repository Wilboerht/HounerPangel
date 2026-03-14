import { TravelPlan } from "@/types/travel";

export const hongkongPlan: TravelPlan = {
  title: "香港2日旅行计划",
  icon: "🚋",
  slug: "hongkong",
  subtitle: "2026.12.20 - 2026.12.21",
  description: "【最高优先级：金融开卡】2日极速刷点指南。核心任务：丝滑开立 ZA Bank（众安）与 HSBC（汇丰）。必备：身份证、通行证、通关小票、出入境记录PDF（移民局小程序下载）、手机开启漫游及常用手机号。全程 App 操作，无需分行面谈。",
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
      title: "九龙全景线 + App 极速开卡",
      tocTitle: "开卡 · 九龙刷点",
      route: "福田口岸 → 尖沙咀 → 开立 ZA/HSBC → 维港 → 中环 (徒步)",
      events: [
        { time: "09:00 - 10:30", content: "福田口岸过关，乘东铁线直达尖沙咀，期间微信搜“移民局12367”下载出入境记录 PDF", type: "transport" },
        { time: "10:30 - 12:00", content: "最高优先级：在尖沙咀连本地网络，通过 App 提交 ZA Bank 与 HSBC One 开户申请（无需面谈）", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：澳洲牛奶公司（极速翻台）或华星冰室", type: "food" },
        { time: "13:30 - 15:30", content: "旺角巡礼：金鱼街、花墟、通菜街（港味浓缩）", type: "location" },
        { time: "16:00 - 17:30", content: "星光大道、尖沙咀钟楼，拍摄维港日落", type: "location" },
        { time: "17:30 - 19:00", content: "漫步：从维港沿海边步行至中环（约1-2公里），感受港岛天际线", type: "location" },
        { time: "19:30 - 21:00", content: "晚餐：中环/庙街大牌档 + 佳佳甜品宵夜", type: "food" },
      ],
      daySummary: "预计花费：约1300元（提示：App 审核通常秒过，HSBC 需 NFC 扫描通行证）"
    },
    {
      day: 2,
      title: "港岛深度刷点 + 山顶巅峰",
      tocTitle: "港岛刷点 · 山顶",
      route: "中环 → 叮叮车 → 坚尼地城 → 鲗鱼涌 → 山顶 → 返程",
      events: [
        { time: "08:30 - 10:00", content: "早餐：上环莲香居（传统早茶），期间检查银行 App 审核状态", type: "food" },
        { time: "10:00 - 11:30", content: "中环核心：大馆、半山扶梯、壁画街快速出片", type: "location" },
        { time: "11:30 - 13:00", content: "坚尼地城海景 + 鲗鱼涌“怪兽大楼”极速打卡", type: "location" },
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
    { type: "地道烧味", name: "甘牌烧鹅", location: "湾仔", price: "150元", rowSpan: 2 },
    { type: "地道烧味", name: "再兴烧腊", location: "湾仔", price: "80元" },
    { type: "宵夜甜品", name: "佳佳甜品", location: "佐敦", price: "40元" },
    { type: "街头小吃", name: "十八座狗仔粉", location: "佐敦/旺角", price: "40元", rowSpan: 2 },
    { type: "街头小吃", name: "妈咪鸡蛋仔", location: "尖沙咀", price: "30元" },
  ],
  bankTasks: [
    {
      bank: "ZA Bank (众安银行) - 极速秒过",
      steps: [
        "抵达香港境内后连网，打开 APP 选择立即开户",
        "拍摄身份证并进行人脸识别",
        "填写内地地址（用于收实体卡）",
        "微信搜‘移民局12367’下载出入境记录 PDF 并上传",
        "设置用户名密码，审核秒过"
      ],
      docs: [
        "中国居民身份证",
        "港澳通行证",
        "出入境记录 PDF (不得改名)",
        "内地储蓄卡及预留手机号"
      ]
    },
    {
      bank: "HSBC (汇丰银行) - One 账户",
      steps: [
        "身处地区选‘香港’，是否有香港证件选‘否’",
        "拍摄港澳通行证并进行人脸识别（建议纯色背景）",
        "使用手机 NFC 功能扫描通行证芯片",
        "上传移民局生成的出入境记录 PDF 原始文件",
        "填写英文地址（建议使用 AI 优化地址翻译）",
        "审核通过后立即注册手机银行并申请蓝狮子 Mastercard"
      ],
      docs: [
        "港澳通行证 (需有效签注)",
        "出入境记录 PDF",
        "内地有效住址证明 (若身份证不符)",
        "常用电子邮箱 (接收电子账单)"
      ]
    }
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
