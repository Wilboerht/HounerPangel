export interface Photo {
  src: string;
  title: string;
  location: string;
  description?: string;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutter?: string;
    iso?: string;
  };
}

export const PHOTOS: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=1200&q=85",
    title: "城市霓虹",
    location: "东京，日本",
    description: "雨夜中的涩谷街头，霓虹灯倒映在湿漉漉的地面上。",
    exif: { camera: "Sony A7R IV", lens: "35mm f/1.4", aperture: "f/2.8", shutter: "1/60s", iso: "800" },
  },
  {
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=85",
    title: "光影交错",
    location: "柏林，德国",
    description: "博物馆岛上的午后阳光穿过柱廊，在地面投下几何阴影。",
    exif: { camera: "Leica Q2", lens: "28mm f/1.7", aperture: "f/5.6", shutter: "1/250s", iso: "100" },
  },
  {
    src: "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=1200&q=85",
    title: "静谧时刻",
    location: "京都，日本",
    description: "清晨的竹林小径，只有风穿过竹叶的沙沙声。",
    exif: { camera: "Fujifilm X-T4", lens: "23mm f/1.4", aperture: "f/4", shutter: "1/125s", iso: "200" },
  },
  {
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=85",
    title: "自然之境",
    location: "冰岛",
    description: "清晨的薄雾笼罩着黑沙滩，海浪在玄武岩柱间穿梭。",
    exif: { camera: "Sony A7R IV", lens: "16-35mm f/2.8", aperture: "f/11", shutter: "1/8s", iso: "50" },
  },
  {
    src: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1200&q=85",
    title: "旅行记忆",
    location: "摩洛哥",
    description: "撒哈拉沙漠的边缘，驼队在金色沙丘上留下长长的影子。",
    exif: { camera: "Canon R5", lens: "70-200mm f/2.8", aperture: "f/8", shutter: "1/500s", iso: "100" },
  },
  {
    src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1200&q=85",
    title: "建筑线条",
    location: "巴塞罗那，西班牙",
    description: "高迪的建筑细节，曲线与色彩的完美融合。",
    exif: { camera: "Leica Q2", lens: "28mm f/1.7", aperture: "f/4", shutter: "1/320s", iso: "100" },
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85",
    title: "山间晨曦",
    location: "瑞士阿尔卑斯",
    description: "日出时分的雪山，第一缕阳光照亮峰顶。",
    exif: { camera: "Sony A7R IV", lens: "24-70mm f/2.8", aperture: "f/8", shutter: "1/200s", iso: "100" },
  },
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=85",
    title: "星空之下",
    location: "新西兰",
    description: "蒂卡普湖畔的银河，牧羊人教堂静静伫立。",
    exif: { camera: "Nikon Z7 II", lens: "14-24mm f/2.8", aperture: "f/2.8", shutter: "20s", iso: "3200" },
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85",
    title: "峡谷回声",
    location: "美国大峡谷",
    description: "夕阳将峡谷岩壁染成金红色，大自然的鬼斧神工。",
    exif: { camera: "Canon R5", lens: "16-35mm f/2.8", aperture: "f/11", shutter: "1/30s", iso: "100" },
  },
];
