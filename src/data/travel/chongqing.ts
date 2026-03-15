import { TravelPlan } from "@/types/travel";

export const chongqingPlan: TravelPlan = {
  title: "重庆3日旅行计划",
  icon: "🌶️",
  slug: "chongqing",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "重庆3日行程：洪崖洞、解放碑、李子坝穿楼、火锅体验。",
  budget: [
    { name: "往返交通", range: "800-1500元", note: "大交通费用，飞抵江北机场或高铁至重庆北站" },
    { name: "市内交通", range: "100-180元", note: "轨道交通为主，部分路段打车/网约车（坡多步行累）" },
    { name: "住宿", range: "900-1800元", note: "2晚住宿，选在解放碑或观音桥附近" },
    { name: "餐饮费用", range: "800-1200元", note: "火锅、重大小面、江湖菜及各类街头小吃" },
    { name: "门票/娱乐", range: "200-400元", note: "长江索道、两江游轮等费用" },
  ],
  itinerary: [
    {
      day: 1,
      title: "解放碑 + 洪崖洞 + 十八梯",
      tocTitle: "解放碑 · 洪崖洞",
      route: "抵达重庆 → 解放碑 → 十八梯 → 魁星楼 → 洪崖洞",
      events: [
        { time: "14:00 - 15:30", content: "抵达并入住解放碑附近酒店", type: "transport" },
        { time: "16:00 - 17:30", content: "十八梯", type: "location" },
        { time: "17:30 - 19:00", content: "晚餐：火锅", type: "food" },
        { time: "19:30 - 21:00", content: "魁星楼及洪崖洞", type: "location" },
        { time: "21:30 - 22:30", content: "千厮门大桥", type: "location" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "李子坝 + 鹅岭二厂 + 磁器口",
      tocTitle: "穿楼 · 二厂",
      route: "李子坝 → 鹅岭二厂 → 磁器口古镇 → 观音桥",
      events: [
        { time: "09:30 - 10:30", content: "李子坝：拍摄单轨穿楼", type: "location" },
        { time: "11:00 - 13:30", content: "鹅岭二厂", type: "location" },
        { time: "13:30 - 14:30", content: "午餐：江湖菜", type: "food" },
        { time: "15:00 - 18:00", content: "磁器口古镇", type: "location" },
        { time: "19:00 - 21:00", content: "观音桥步行街", type: "location" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 3,
      title: "长江索道 + 弹子石老街 + 返程",
      tocTitle: "索道 · 老街",
      route: "长江索道 → 龙门浩老街 → 弹子石老街 → 返程",
      events: [
        { time: "09:00 - 10:30", content: "长江索道", type: "location" },
        { time: "11:00 - 13:00", content: "龙门浩老街", type: "location" },
        { time: "13:00 - 14:30", content: "午餐：南滨路", type: "food" },
        { time: "15:00 - 16:30", content: "弹子石老街", type: "location" },
        { time: "17:00 - 18:30", content: "返程", type: "transport" },
      ],
      daySummary: "预计花费：约400元"
    },
  ],
  attractions: [
    { name: "洪崖洞", location: "渝中区", description: "依山而建的吊脚楼群，夜晚华灯初上时极具魔幻感" },
    { name: "李子坝轻轨", location: "渝中区", description: "著名的单轨穿楼景观，重庆奇幻地形的最佳见证" },
    { name: "长江索道", location: "南岸区/渝中区", description: "山城的城市名片，横跨长江的“空中公交”" },
    { name: "鹅岭二厂", location: "渝中区", description: "工业遗迹改造的文创园区，可俯瞰两江交汇" },
    { name: "解放碑", location: "渝中区", description: "重庆的商业精神核心，周边聚集了各大顶级购物中心" },
  ],
  foods: [
    { type: "麻辣火锅", name: "佩姐老火锅", location: "解放碑", price: "150元", rowSpan: 2 },
    { type: "麻辣火锅", name: "周师兄大刀腰片", location: "解放碑", price: "180元" },
    { type: "重庆小面", name: "花市豌杂面", location: "写字楼附近", price: "25元", rowSpan: 2 },
    { type: "重庆小面", name: "十八梯眼镜面", location: "渝中区", price: "30元" },
    { type: "江湖菜", name: "杨记隆府", location: "解放碑/观音桥", price: "120元", rowSpan: 2 },
    { type: "江湖菜", name: "山城羊肉馆", location: "解放碑", price: "80元" },
    { type: "街头名小吃", name: "好又来酸辣粉", location: "解放碑", price: "20元" },
    { type: "甜点冷饮", name: "只卖红糖冰粉", location: "磁器口/九街", price: "15元" },
  ],
  summary: {
    total: "4800元",
    note: "基于3日行程核算，含往返交通及渝中区住宿。",
    details: [
      { label: "往返大交通", value: "1200元", icon: "Train" },
      { label: "市内交通", value: "180元", icon: "MapPin" },
      { label: "2晚住宿", value: "1500元", icon: "Calendar" },
      { label: "门票支出", value: "300元", icon: "Ticket" },
      { label: "餐饮美食", value: "1200元", icon: "Utensils" },
      { label: "机动金", value: "420元", icon: "Wallet" },
    ]
  }
};
