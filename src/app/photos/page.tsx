import Link from "next/link";
import { Aperture } from "lucide-react";
import type { Metadata } from "next";
import PhotosClient, { Photo } from "./PhotosClient";

const PHOTOS: Photo[] = [
  {
    src: "/images/photos/hongkong.jpg",
    title: "香港街景",
    location: "香港",
    date: "2024",
    aspectRatio: "3/2",
    category: "城市",
  },
  {
    src: "/images/photos/tokyo.jpg",
    title: "东京夜雨",
    location: "日本东京",
    date: "2024",
    aspectRatio: "2/3",
    category: "城市",
  },
  {
    src: "/images/photos/kyoto.jpg",
    title: "京都红叶",
    location: "日本京都",
    date: "2023",
    aspectRatio: "3/2",
    category: "自然",
  },
  {
    src: "/images/photos/shanghai.jpg",
    title: "外滩黄昏",
    location: "上海",
    date: "2024",
    aspectRatio: "2/3",
    category: "城市",
  },
  {
    src: "/images/photos/mountain.jpg",
    title: "山间晨雾",
    location: "四川",
    date: "2023",
    aspectRatio: "3/2",
    category: "自然",
  },
  {
    src: "/images/photos/sea.jpg",
    title: "海边日落",
    location: "厦门",
    date: "2024",
    aspectRatio: "2/3",
    category: "自然",
  },
];

export const metadata: Metadata = {
  title: "相册 - Hank Wong's Web",
  description: "Hank Wong 的摄影作品集，记录旅途中的风景与瞬间。",
};

export default function PhotosPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-11">
        {/* Header — Camarts style */}
        <header className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-5 group">
            <Aperture className="w-14 h-14 text-foreground stroke-[1.5]" />
            <div className="flex flex-col">
              <span className="text-[26px] font-semibold tracking-wide leading-none text-foreground">
                HANK WONG
              </span>
              <span className="text-xs tracking-[0.25em] text-muted uppercase leading-none mt-2">
                Photos
              </span>
            </div>
          </Link>

          {/* Right: Nav */}
          <nav className="hidden sm:flex items-center">
            <Link
              href="/me"
              className="text-sm py-2.5 px-3.5 text-[#505050] hover:text-foreground transition-colors duration-200"
            >
              关于
            </Link>
            <Link
              href="/projects"
              className="text-sm py-2.5 px-3.5 text-[#505050] hover:text-foreground transition-colors duration-200"
            >
              项目
            </Link>
            <Link
              href="/design"
              className="text-sm py-2.5 px-3.5 text-[#505050] hover:text-foreground transition-colors duration-200"
            >
              设计
            </Link>
            <Link
              href="/"
              className="text-sm py-2.5 px-3.5 text-[#505050] hover:text-foreground transition-colors duration-200"
            >
              主页
            </Link>
          </nav>
        </header>

        {/* Content */}
        <section>
          <PhotosClient photos={PHOTOS} />
        </section>

        {/* Footer */}
        <footer className="pt-6 text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} wilboerht</p>
        </footer>
      </div>
    </main>
  );
}
