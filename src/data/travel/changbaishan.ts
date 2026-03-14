import { TravelPlan } from "@/types/travel";

export const changbaishanPlan: TravelPlan = {
  title: "长白山3日旅行计划",
  icon: "🏔️",
  slug: "changbaishan",
  subtitle: "2026.07.15 - 2026.07.17",
  description: "长白山3日深度游：涵盖北坡天池、西坡大峡谷、高山花园及地道延边/东北特色美食体验。",
  budget: [
    { name: "往返交通", range: "800-1600元", note: "大交通费用，建议飞抵长白山机场或高铁至延吉/二道白河" },
    { name: "市内交通", range: "200-400元", note: "包含景区接驳车、倒站车及必要的包车/租车费用" },
    { name: "住宿", range: "1200-2400元", note: "2晚住宿，建议选在二道白河镇或万达/鲁能度假区" },
    { name: "餐饮费用", range: "600-1000元", note: "铁锅炖、参鸡汤、冷面及韩式烤肉等" },
    { name: "门票支出", range: "400-600元", note: "北坡/西坡门票、环保车及天池倒站车费用" },
  ],
  itinerary: [
    {
      day: 1,
      title: "北坡景区 + 长白瀑布 + 温泉",
      tocTitle: "北坡 · 天池",
      route: "二道白河 → 长白山北景区 → 聚龙泉 → 瀑布 → 温泉",
      events: [
        { time: "08:00 - 11:30", content: "长白山北景区：乘坐倒站车直达主峰，观赏震撼的天池景观", type: "location" },
        { time: "11:30 - 13:00", content: "午餐：景区内便餐或下山后品尝热气腾腾的铁锅炖", type: "food" },
        { time: "13:30 - 16:30", content: "游览长白瀑布、小天池、绿渊潭，近距离感受火山地质遗迹", type: "location" },
        { time: "17:00 - 19:30", content: "聚龙泉温泉：在 forest 中体验地道的长白山火山温泉", type: "location" },
        { time: "20:00 - 21:30", content: "晚餐：二道白河镇品尝朝族风味烧烤或冷面", type: "food" },
      ],
      daySummary: "预计花费：约600元（体验长白山最经典的壮丽景观）"
    },
    {
      day: 2,
      title: "西坡景区 + 大峡谷 + 高山花园",
      tocTitle: "西坡 · 峡谷",
      route: "二道白河 → 长白山西景区 → 大峡谷 → 王池",
      events: [
        { time: "08:30 - 12:00", content: "长白山西景区：攀登1442级台阶至主峰，从另一角度平视天池", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：特色韩式料理（如拌饭、打糕）", type: "food" },
        { time: "14:00 - 16:30", content: "长白山大峡谷：观赏火山爆发形成的 V 型峡谷与怪石林立", type: "location" },
        { time: "16:30 - 18:00", content: "高山花园（季节性）：夏季可观赏漫山遍野的珍稀野生花卉", type: "location" },
        { time: "19:00 - 20:30", content: "晚餐：品尝滋补的参鸡汤，舒缓登山疲劳", type: "food" },
      ],
      daySummary: "预计花费：约500元（感受原始森林与垂直植被带的奇观）"
    },
    {
      day: 3,
      title: "二道白河漫步 + 森林公园 + 返程",
      tocTitle: "慢活 · 归途",
      route: "美人松公园 → 森林氧吧 → 选购特产 → 返程",
      events: [
        { time: "09:00 - 11:30", content: "二道白河小镇漫步：参观美人松公园、空中廊桥", type: "location" },
        { time: "12:00 - 13:30", content: "午餐：最后的东北大乱炖或朝族特色拼盘", type: "food" },
        { time: "14:00 - 15:30", content: "前往特产市场选购蓝莓干、黑木耳或人参制品", type: "location" },
        { time: "16:00 - 17:30", content: "前往长白山机场或车站，结束北国秘境之旅", type: "transport" },
      ],
      daySummary: "预计花费：约400元（在森林氧吧的宁静中归家）"
    },
  ],
  attractions: [
    { name: "长白山天池", location: "主峰", description: "火山口形成的天然湖泊，以‘神秘、圣洁、变幻莫测’著称" },
    { name: "长白瀑布", location: "北景区", description: "天池唯一的出水口，东北地区最大的高山飞瀑" },
    { name: "长白山大峡谷", location: "西景区", description: "火山碎屑流侵蚀形成的奇特峡谷地貌，壮阔异常" },
    { name: "美人松公园", location: "二道白河", description: "长白山特有的珍稀松树林，形态优美极具观赏价值" },
    { name: "高山花园", location: "西景区", description: "每年7月左右，漫山遍野开满野生花卉的极美景观" },
  ],
  foods: [
    { type: "铁锅炖系列", name: "农村大土灶", location: "二道白河", price: "120元", rowSpan: 2 },
    { type: "铁锅炖系列", name: "靠山屯铁锅炖", location: "全省连锁", price: "100元" },
    { type: "韩式/朝族风味", name: "家传参鸡汤", location: "二道白河", price: "80元", rowSpan: 3 },
    { type: "韩式/朝族风味", name: "顺姬冷面", location: "延吉/二道白河", price: "35元" },
    { type: "韩式/朝族风味", name: "丰茂串城", location: "延边老牌", price: "90元" },
    { type: "东北特色", name: "锅包肉/地三鲜", location: "各类东北菜馆", price: "60元" },
    { type: "山野鲜货", name: "野山菌火锅", location: "度假区内", price: "180元" },
  ],
  summary: {
    total: "4200元",
    note: "基于3日高品质夏季避暑/冬季滑雪方案核算，含往返交通及度假区精品酒店住宿。",
    details: [
      { label: "往返大交通", value: "1200元", icon: "Train" },
      { label: "景区/包车", value: "400元", icon: "MapPin" },
      { label: "2晚酒店", value: "1600元", icon: "Calendar" },
      { label: "门票/导站", value: "500元", icon: "Ticket" },
      { label: "餐饮/补给", value: "800元", icon: "Utensils" },
      { label: "机动特产", value: "300元", icon: "Wallet" },
    ]
  }
};
