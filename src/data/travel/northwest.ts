import { TravelPlan } from "@/types/travel";

export const northwestPlan: TravelPlan = {
  title: "西北9日环线旅行计划",
  icon: "🐫",
  slug: "northwest",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "西宁、青海湖、柴达木、敦煌、嘉峪关、张掖9日深度大环线。",
  budget: [
    { name: "往返交通", range: "2500-4500元", note: "大交通费用，建议西宁进出" },
    { name: "租车/包车", range: "4000-6000元", note: "9日环线用车费用，含油费及路桥费" },
    { name: "住宿费用", range: "3000-5000元", note: "9晚住宿（含到达当晚），提升酒店标准" },
    { name: "餐饮费用", range: "2000-3000元", note: "全程西北特色餐饮费" },
    { name: "门票/体验", range: "1200-1800元", note: "莫高窟、青海湖、丹霞、关城、盐湖等" },
  ],
  itinerary: [
    {
      day: 1,
      title: "塔尔寺 → 青海湖",
      tocTitle: "塔尔寺 · 湖边",
      route: "办理取车 → 塔尔寺 → 拉脊山 → 青海湖 (二郎剑) → 黑马河",
      events: [
        { time: "00:00 - 08:30", content: "前晚 23:40 抵宁，酒店休息", type: "stay" },
        { time: "09:00 - 10:00", content: "办理取车手续", type: "transport" },
        { time: "10:30 - 13:00", content: "塔尔寺：藏传佛教格鲁派六大寺院之一", type: "location" },
        { time: "13:00 - 14:00", content: "午餐：湟源或路边简餐", type: "food" },
        { time: "15:30 - 18:30", content: "青海湖二郎剑景区及漫步湖畔", type: "location" },
        { time: "19:00 - 20:30", content: "前往黑马河入住，看湖边落日", type: "stay" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "黑马河 → 茶卡盐湖 → 大柴旦",
      tocTitle: "盐湖 · 戈壁",
      route: "黑马河日出 → 茶卡盐湖 → 德小高速 → 大柴旦",
      events: [
        { time: "06:30 - 07:30", content: "黑马河日出", type: "location" },
        { time: "09:30 - 12:30", content: "茶卡盐湖：天空之镜摄影", type: "location" },
        { time: "13:00 - 18:00", content: "驱车前往大柴旦，穿越柴达木盆地", type: "transport" },
        { time: "19:00 - 20:30", content: "晚餐：大柴旦镇牛羊肉火锅", type: "food" },
      ],
      daySummary: "预计花费：约700元"
    },
    {
      day: 3,
      title: "大柴旦翡翠湖 → 敦煌",
      tocTitle: "翡翠湖 · 敦煌",
      route: "翡翠湖 → 最美公路 → 阿克塞 → 敦煌",
      events: [
        { time: "08:30 - 11:00", content: "翡翠湖：欣赏各色盐池景观", type: "location" },
        { time: "11:30 - 16:30", content: "翻越当金山，经过阿克塞石油小镇", type: "transport" },
        { time: "17:00 - 20:00", content: "抵达敦煌，入住并前往沙州夜市", type: "location" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 4,
      title: "敦煌 · 莫高窟深度游",
      tocTitle: "莫高窟",
      route: "数字展示中心 → 实体洞窟 → 敦煌博物馆",
      events: [
        { time: "08:30 - 13:30", content: "莫高窟：看数字展+实体洞窟（提前预约）", type: "location" },
        { time: "14:00 - 15:30", content: "午餐：驴肉黄面", type: "food" },
        { time: "16:00 - 18:00", content: "敦煌博物馆", type: "location" },
        { time: "20:00 - 21:30", content: "观看《又见敦煌》演出（可选）", type: "location" },
      ],
      daySummary: "预计花费：约1200元"
    },
    {
      day: 5,
      title: "敦煌 · 鸣沙山月牙泉",
      tocTitle: "鸣沙山 · 休闲",
      route: "全天敦煌休闲 → 鸣沙山月牙泉",
      events: [
        { time: "09:00 - 15:00", content: "上午休整或选购特产", type: "stay" },
        { time: "15:30 - 20:30", content: "鸣沙山月牙泉：看日落、滑沙", type: "location" },
        { time: "21:00 - 22:30", content: "晚餐：胡羊焖饼", type: "food" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 6,
      title: "敦煌 → 玉门关 → 雅丹魔鬼城",
      tocTitle: "雅丹 · 戈壁",
      route: "敦煌 → 玉门关 → 汉长城遗迹 → 雅丹魔鬼城",
      events: [
        { time: "10:00 - 12:30", content: "玉门关：凭吊古丝路遗迹", type: "location" },
        { time: "12:30 - 13:30", content: "午餐：景区简餐", type: "food" },
        { time: "15:30 - 19:30", content: "雅丹魔鬼城：看落日，体验风蚀地貌震撼", type: "location" },
        { time: "20:00 - 21:30", content: "返回敦煌", type: "transport" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 7,
      title: "敦煌 → 嘉峪关 → 酒泉",
      tocTitle: "雄关 · 酒泉",
      route: "敦煌 → 嘉峪关关城 → 酒泉",
      events: [
        { time: "08:30 - 12:30", content: "驱车前往嘉峪关", type: "transport" },
        { time: "13:30 - 16:30", content: "嘉峪关关城：天下第一雄关", type: "location" },
        { time: "17:00 - 18:30", content: "酒泉：参观西汉酒泉胜迹", type: "location" },
        { time: "19:00 - 20:30", content: "晚餐：嘉峪关/酒泉烤肉", type: "food" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 8,
      title: "酒泉 → 张掖七彩丹霞",
      tocTitle: "丹霞 · 奇观",
      route: "酒泉 → 张掖 → 七彩丹霞景区",
      events: [
        { time: "09:00 - 12:00", content: "前往张掖", type: "transport" },
        { time: "12:30 - 13:30", content: "午餐：张掖卷子鸡", type: "food" },
        { time: "15:30 - 19:30", content: "七彩丹霞：看落日", type: "location" },
        { time: "20:00 - 21:30", content: "入住张掖", type: "stay" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 9,
      title: "张掖 → 马蹄寺 → 返程",
      tocTitle: "马蹄寺 · 归途",
      route: "马蹄寺 → 西宁/兰州返程",
      events: [
        { time: "08:30 - 12:00", content: "马蹄寺：石窟艺术与民族风情", type: "location" },
        { time: "13:00 - 16:00", content: "返回西宁或兰州机场", type: "transport" },
        { time: "17:00 - 19:00", content: "返程", type: "transport" },
      ],
      daySummary: "预计花费：约400元"
    },
  ],
  attractions: [
    { name: "莫高窟", location: "敦煌市", description: "世界文化遗产，佛教艺术宝库，需提前实名预约" },
    { name: "青海湖", location: "青海省", description: "中国最大咸水湖，7-8月有大片油菜花" },
    { name: "七彩丹霞", location: "张掖市", description: "窗棂式及宫殿式丹霞地霞，落日下色彩最亮丽" },
    { name: "雅丹魔鬼城", location: "敦煌市", description: "独特风蚀地貌，日落时分极具神秘色彩" },
    { name: "嘉峪关", location: "嘉峪关市", description: "明代长城西端起点，保存最完整的雄关" },
  ],
  foods: [
    { type: "西宁/祁连", name: "炕锅羊排", location: "西宁", price: "120元" },
    { type: "敦煌名菜", name: "驴肉黄面", location: "敦煌", price: "60元" },
    { type: "张掖特色", name: "卷子鸡", location: "张掖", price: "100元" },
    { type: "嘉峪关烤肉", name: "小猪羊肉串", location: "嘉峪关", price: "80元" },
  ],
  summary: {
    total: "15000元",
    note: "基于9日深度大环线核算，包含高标准租车/包车费用、景区门票及精品酒店住宿。",
    details: [
      { label: "往返大交通", value: "3500元", icon: "Train" },
      { label: "租车用车", value: "5000元", icon: "MapPin" },
      { label: "9晚住宿", value: "3500元", icon: "Calendar" },
      { label: "门票体验", value: "1500元", icon: "Ticket" },
      { label: "全程餐饮", value: "2000元", icon: "Utensils" },
      { label: "机动备金", value: "500元", icon: "Wallet" },
    ]
  }
};
