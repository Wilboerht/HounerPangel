import { TravelPlan } from "@/types/travel";

export const guangzhouPlan: TravelPlan = {
  title: "广州4日美食人文旅行计划",
  icon: "🍜",
  slug: "guangzhou",
  subtitle: "2027.04.01 - 2027.04.04",
  description: "沉浸式体验食在广州与岭南文化。从珠江新城的摩天大楼到西关大屋的石板路，在烟火气中感受广府韵味。",
  budget: [
    { name: "往返交通", range: "800-1500元", note: "高铁直达广州南站或民航抵达白云机场" },
    { name: "市内交通", range: "150-250元", note: "地铁为主，体验APM线与珠江渡轮" },
    { name: "住宿", range: "1200-2400元", note: "3晚住宿，建议选在越秀或天河区核心地段" },
    { name: "餐饮费用", range: "1000-1500元", note: "早茶、烧鹅、老火靓汤、宵夜甜品" },
    { name: "门票/娱乐", range: "400-600元", note: "包含珠江夜游、小蛮腰观光等" },
  ],
  itinerary: [
    {
      day: 1,
      title: "云端羊城 · 珠江逐影",
      tocTitle: "新城 · 塔影",
      route: "抵达广州 → 珠江新城 → 花城广场 → 广州塔 → 珠江夜游",
      events: [
        { time: "14:00 - 15:30", content: "抵达广州并入住天河区酒店，初步感受 CBD 活力", type: "transport" },
        { time: "16:00 - 18:00", content: "花城广场漫步，在“城市客厅”拍摄广州塔（小蛮腰）全景", type: "location" },
        { time: "18:00 - 19:30", content: "晚餐：炳胜品味或陶陶居（体验精致粤菜）", type: "food" },
        { time: "20:00 - 21:30", content: "珠江夜游：乘船穿越横跨珠江的数座大桥，纵览迷人夜色", type: "location" },
      ],
      daySummary: "预计花费：约600元（初识现代广州的璀璨）"
    },
    {
      day: 2,
      title: "西关风情 · 广式早茶",
      tocTitle: "西关 · 老城",
      route: "泮溪酒家 → 荔枝湾涌 → 永庆坊 → 沙面岛",
      events: [
        { time: "09:00 - 11:00", content: "早茶：泮溪酒家（园林式酒家，体验地道‘一盅两件’）", type: "food" },
        { time: "11:00 - 13:00", content: "漫步荔枝湾涌，感受西关大屋与岭南水乡建筑风情", type: "location" },
        { time: "13:30 - 16:00", content: "永庆坊：老旧街区改造的典范，打卡李小龙祖居与非遗馆", type: "location" },
        { time: "16:30 - 18:30", content: "沙面岛：漫步欧式建筑群，感受闹市中的异国宁静", type: "location" },
        { time: "19:00 - 20:30", content: "晚餐：上下九老街寻找地道牛杂、竹升面等街头美食", type: "food" },
      ],
      daySummary: "预计花费：约500元（回味百年广府的慢生活）"
    },
    {
      day: 3,
      title: "历史回响 · 绿野漫步",
      tocTitle: "古迹 · 园林",
      route: "陈家祠 → 越秀公园 → 中山纪念堂 → 东山口",
      events: [
        { time: "09:00 - 11:00", content: "陈家祠（广东民间工艺博物馆）：领略岭南建筑‘七绝’工艺", type: "location" },
        { time: "11:30 - 13:30", content: "午餐：惠食佳（纪录片《舌尖》推荐的啫啫煲）", type: "food" },
        { time: "14:00 - 16:30", content: "越秀公园：看五羊石雕，探访古城墙残垣", type: "location" },
        { time: "17:00 - 19:30", content: "东山口：漫步‘新河浦’红砖洋房，探访潮流主理人店", type: "location" },
      ],
      daySummary: "预计花费：约450元（穿梭在古迹与现代文艺之间）"
    },
    {
      day: 4,
      title: "城市博物 · 闲逛返程",
      tocTitle: "博物 · 归途",
      route: "广东省博物馆 → 海心沙 → 返程",
      events: [
        { time: "09:30 - 12:00", content: "广东省博物馆：深度了解岭南历史脉络与自然资源", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：正佳广场周边，体验广州年轻人的餐饮节奏", type: "food" },
        { time: "14:00 - 15:30", content: "海心沙亚运公园最后留影，购买伴手礼（鸡仔饼等）", type: "location" },
        { time: "16:00 - 17:30", content: "前往火车站/机场，结束愉快的广州之旅", type: "transport" },
      ],
      daySummary: "预计花费：约300元（带走广式手信与温润记忆）"
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
    total: "5500元",
    note: "基于4日深度体验方案核算，含往返大交通及市区精品酒店住宿。",
    details: [
      { label: "往返大交通", value: "1200元", icon: "Train" },
      { label: "市内交通", value: "200元", icon: "MapPin" },
      { label: "3晚住宿", value: "1800元", icon: "Calendar" },
      { label: "门票娱乐", value: "500元", icon: "Ticket" },
      { label: "餐饮美食", value: "1500元", icon: "Utensils" },
      { label: "机动金", value: "300元", icon: "Wallet" },
    ]
  }
};
