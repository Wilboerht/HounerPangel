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
];
