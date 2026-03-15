import { TravelPlan } from "@/types/travel";

export const daliPlan: TravelPlan = {
  title: "大理3日计划",
  icon: "🌊",
  slug: "dali",
  subtitle: "20xx.xx.xx - 20xx.xx.xx",
  description: "大理3日：大理古城、洱海骑行、苍山索道。",
  budget: [
    { name: "往返交通", range: "800-1500元", note: "飞抵或高铁抵达大理站" },
    { name: "市内交通", range: "150-300元", note: "环湖建议租车或租小电驴" },
    { name: "住宿", range: "800-1600元", note: "2晚住宿，建议选在古城内或海边" },
    { name: "餐饮费用", range: "600-1000元", note: "白族酸辣鱼、喜洲粑粑、野生菌" },
    { name: "门票/游玩", range: "200-400元", note: "苍山索道、洱海游船等" },
  ],
  itinerary: [
    {
      day: 1,
      title: "抵达大理 + 大理古城",
      tocTitle: "古城 · 入住",
      route: "抵达大理 → 入住古城民宿 → 大理古城漫步 → 晚餐",
      events: [
        { time: "14:00 - 15:30", content: "抵达大理，入住古城附近精品民宿", type: "transport" },
        { time: "16:00 - 18:30", content: "漫步大理古城：参观五华楼、红龙井，在洋人街感受文艺气息", type: "location" },
        { time: "19:00 - 20:30", content: "晚餐：品尝白族酸辣鱼或当地老牌私房菜", type: "food" },
        { time: "21:00 - 22:00", content: "夜游古城", type: "location" },
      ],
      daySummary: "预计花费：约600元"
    },
    {
      day: 2,
      title: "磻溪村 + 喜洲古镇 + 洱海环湖",
      tocTitle: "洱海 · 环湖",
      route: "磻溪村 S 弯 → 喜洲古镇 → 海舌公园 → 洱海骑行",
      events: [
        { time: "08:30 - 10:30", content: "磻溪村 S 弯：清晨骑行/漫步，拍摄洱海 S 型海岸线", type: "location" },
        { time: "11:00 - 13:30", content: "喜洲古镇：看白族民居建筑，品尝刚出炉的喜洲粑粑", type: "location" },
        { time: "13:30 - 14:30", content: "午餐：喜洲古镇内的特色私房菜", type: "food" },
        { time: "15:00 - 18:00", content: "继续环海东路或西路，随走随停，拍摄洱海深处倒影", type: "location" },
        { time: "18:30 - 20:00", content: "晚餐：海边看日落", type: "food" },
      ],
      daySummary: "预计花费：约500元"
    },
    {
      day: 3,
      title: "苍山索道 + 双廊古镇 + 返程",
      tocTitle: "苍山 · 归途",
      route: "感通索道 → 寂照庵 → 双廊海景 → 返程",
      events: [
        { time: "08:30 - 11:30", content: "感通索道 + 寂照庵", type: "location" },
        { time: "12:00 - 14:30", content: "双廊古镇", type: "food" },
        { time: "15:00 - 16:30", content: "返程", type: "transport" },
      ],
      daySummary: "预计花费：约400元"
    },
  ],
  attractions: [
    { name: "大理古城", location: "古城区", description: "南诏大理国的都城，具有完整的城墙与悠远的历史氛围" },
    { name: "洱海 S 弯", location: "磻溪村", description: "大理最火的网红打卡点，骑行拍照的最佳位置" },
    { name: "喜洲古镇", location: "洱海西岸", description: "典型的白族民居聚集地，拥有浓郁的农耕文化底蕴" },
    { name: "苍山", location: "古城西侧", description: "大理的脊梁，云绕山间，俯瞰洱海及全城的绝佳点" },
    { name: "崇圣寺三塔", location: "古城北侧", description: "大理的标志性建筑，展示了古大理文化的辉煌" },
  ],
  foods: [
    { type: "白族特色", name: "酸辣鱼", location: "古城/双廊", price: "120元", rowSpan: 2 },
    { type: "白族特色", name: "生皮", location: "古城周边", price: "80元" },
    { type: "地道小吃", name: "喜洲粑粑", location: "喜洲古镇", price: "15元", rowSpan: 3 },
    { type: "地道小吃", name: "大理乳扇", location: "古城内", price: "10元" },
    { type: "地道小吃", name: "饵块", location: "路边摊", price: "5元" },
    { type: "季节鲜货", name: "野生菌火锅", location: "古城内", price: "220元" },
    { type: "精品餐厅", name: "寂照庵斋饭", location: "苍山脚下", price: "20元" },
    { type: "下午茶", name: "洱海虾/咖啡", location: "海边咖啡馆", price: "60元" },
  ],
  summary: {
    total: "4000元",
    note: "基于3日行程核算，含往返交通及民宿住宿。",
    details: [
      { label: "往返大交通", value: "1200元", icon: "Train" },
      { label: "市内用车", value: "200元", icon: "MapPin" },
      { label: "2晚住宿", value: "1400元", icon: "Calendar" },
      { label: "门票/游玩", value: "300元", icon: "Ticket" },
      { label: "餐饮美食", value: "700元", icon: "Utensils" },
      { label: "机动金", value: "200元", icon: "Wallet" },
    ]
  }
};
