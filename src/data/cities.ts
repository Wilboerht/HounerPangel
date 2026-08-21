export interface City {
    /** 城市名 */
    name: string;
    /** [经度, 纬度] */
    coordinates: [number, number];
    /** 足迹状态：visited 已到访（默认），planned 计划前往 */
    status?: "visited" | "planned";
    /** 到访时间，如 "2024-05" */
    visitDate?: string;
    /** 一句话备注 */
    note?: string;
}

export const cities: City[] = [
    { name: "上海", coordinates: [121.4737, 31.2304] },
    { name: "苏州", coordinates: [120.5853, 31.2989] },
    { name: "太仓", coordinates: [121.1296, 31.4597] },
    { name: "无锡", coordinates: [120.3119, 31.4912] },
    { name: "镇江", coordinates: [119.4258, 32.1878] },
    { name: "常州", coordinates: [119.9741, 31.8113] },
    { name: "扬州", coordinates: [119.4129, 32.3942] },
    { name: "杭州", coordinates: [120.1551, 30.2741] },
    { name: "湖州", coordinates: [120.0868, 30.8944] },
    { name: "嘉兴", coordinates: [120.7555, 30.7461] },
    { name: "绍兴", coordinates: [120.5802, 30.0303] },
    { name: "诸暨", coordinates: [120.2469, 29.7086] },
    { name: "宁波", coordinates: [121.5503, 29.8746] },
    { name: "慈溪", coordinates: [121.2665, 30.1696] },
    { name: "舟山", coordinates: [122.2072, 29.9853] },
    { name: "南昌", coordinates: [115.8582, 28.6829] },
    { name: "九江", coordinates: [116.0019, 29.7051] },
    { name: "共青城", coordinates: [115.8057, 29.2479] },
    { name: "抚州", coordinates: [116.3582, 27.9492] },
    { name: "上饶", coordinates: [117.9713, 28.4549] },
    { name: "鹰潭", coordinates: [117.0692, 28.2602] },
    { name: "井冈山", coordinates: [114.2892, 26.7480] },
    { name: "武汉", coordinates: [114.3055, 30.5928] },
    { name: "香港", coordinates: [114.1694, 22.3193], status: "planned" },
    { name: "南京", coordinates: [118.7969, 32.0603], status: "planned" },
    { name: "景德镇", coordinates: [117.1784, 29.2688], status: "planned" },
    { name: "深圳", coordinates: [114.0579, 22.5431], status: "planned" },
    { name: "南通", coordinates: [120.8943, 31.9802], status: "planned" },
    { name: "首尔", coordinates: [126.9780, 37.5665], status: "planned" },
    { name: "金华", coordinates: [119.6475, 29.0790], status: "planned" },
    { name: "澳门", coordinates: [113.5439, 22.1987], status: "planned" },
    { name: "台州", coordinates: [121.4208, 28.6564], status: "planned" },
    { name: "福州", coordinates: [119.2965, 26.0745], status: "planned" },
    { name: "厦门", coordinates: [118.0894, 24.4798], status: "planned" },
    { name: "金门", coordinates: [118.3171, 24.4365], status: "planned" },
    { name: "广州", coordinates: [113.2644, 23.1291], status: "planned" },
    { name: "大同", coordinates: [113.3001, 40.0768], status: "planned" },
    { name: "西安", coordinates: [108.9398, 34.3416], status: "planned" },
    { name: "重庆", coordinates: [106.5516, 29.5630], status: "planned" },
    { name: "成都", coordinates: [104.0665, 30.5723], status: "planned" },
    { name: "长沙", coordinates: [112.9388, 28.2282], status: "planned" },
    { name: "南宁", coordinates: [108.3669, 22.8170], status: "planned" },
    { name: "北海", coordinates: [109.1199, 21.4811], status: "planned" },
    { name: "大理", coordinates: [100.2676, 25.6065], status: "planned" },
    { name: "海口", coordinates: [110.1983, 20.0440], status: "planned" },
    { name: "拉萨", coordinates: [91.1119, 29.6625], status: "planned" },
    { name: "玉门关", coordinates: [93.8639, 40.3535], status: "planned" },
    { name: "西宁", coordinates: [101.7782, 36.6171], status: "planned" },
    { name: "东京", coordinates: [139.6917, 35.6895], status: "planned" },
    { name: "神奈川", coordinates: [139.6380, 35.4437], status: "planned" },
    { name: "奈良", coordinates: [135.8048, 34.6851], status: "planned" },
    { name: "冲绳", coordinates: [127.6792, 26.2124], status: "planned" },
    { name: "镰仓", coordinates: [139.5467, 35.3192], status: "planned" },
    { name: "大阪", coordinates: [135.5023, 34.6937], status: "planned" },
    { name: "箱根", coordinates: [139.1061, 35.2324], status: "planned" },
    { name: "新加坡", coordinates: [103.8198, 1.3521], status: "planned" },
    { name: "吉隆坡", coordinates: [101.6869, 3.1390], status: "planned" },
];
