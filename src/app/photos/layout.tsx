import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "摄影集 - Hank Wong's Web",
  description: "Hank Wong 的摄影作品集，记录旅途中的风景与瞬间。",
};

export default function PhotosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
