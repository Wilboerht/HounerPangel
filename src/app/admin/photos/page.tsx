"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, Image as ImageIcon, LogOut, Lock, X, Save, Camera, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
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

const emptyForm: Photo = {
  src: "",
  title: "",
  location: "",
  description: "",
  exif: { camera: "", lens: "", aperture: "", shutter: "", iso: "" },
};

export default function AdminPhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Photo>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const loadPhotos = () => {
    fetch("/api/photos")
      .then((res) => {
        if (res.status === 401) {
          setAuthError(true);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setPhotos(data);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const openNew = () => {
    setEditingIndex(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setForm(photos[index]);
    setShowModal(true);
  };

  const handleDelete = async (index: number) => {
    if (!confirm("确定要删除这张照片吗？")) return;
    try {
      const res = await fetch("/api/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      if (res.status === 401) {
        alert("登录已过期，请重新登录");
        return;
      }
      if (res.ok) {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
      } else {
        alert("删除失败");
      }
    } catch {
      alert("删除失败");
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "上传失败");
        return;
      }
      setForm((prev) => ({ ...prev, src: json.url }));
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cleaned = {
        ...form,
        exif: form.exif && Object.values(form.exif).some(Boolean) ? form.exif : undefined,
        description: form.description?.trim() || undefined,
      };

      if (editingIndex !== null) {
        const res = await fetch("/api/photos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index: editingIndex, data: cleaned }),
        });
        if (res.ok) {
          setPhotos((prev) => prev.map((p, i) => (i === editingIndex ? cleaned : p)));
          setShowModal(false);
        } else {
          alert("保存失败");
        }
      } else {
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleaned),
        });
        if (res.ok) {
          setPhotos((prev) => [...prev, cleaned]);
          setShowModal(false);
        } else {
          alert("保存失败");
        }
      }
    } catch {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (authError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full flex flex-col items-center gap-6 text-center">
          <div className="p-4 rounded-full bg-foreground/5">
            <Lock className="w-8 h-8 text-muted" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">需要登录</h1>
            <p className="text-sm text-muted">请先返回博客页面登录</p>
          </div>
          <Link
            href="/blog"
            className="px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            返回博客
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-5xl w-full flex flex-col gap-12">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回主页</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              博客管理
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                router.push("/blog");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </nav>

        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                摄影集管理
              </h1>
              <p className="text-lg text-muted leading-relaxed mt-2">
                管理你的摄影作品
              </p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加照片
            </button>
          </div>

          {loading ? (
            <p className="text-muted text-center py-20">加载中...</p>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl border border-border/50 overflow-hidden hover:border-foreground/20 transition-colors"
                >
                  <div className="aspect-[4/3] bg-muted/20 relative">
                    {photo.src ? (
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">{photo.title}</h3>
                    <p className="text-sm text-muted truncate">{photo.location}</p>
                    {photo.exif?.camera && (
                      <p className="text-xs text-muted/70 mt-1 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {photo.exif.camera}
                      </p>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(index)}
                      className="p-2 rounded-lg bg-background/90 backdrop-blur-sm hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
                      title="编辑"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 rounded-lg bg-background/90 backdrop-blur-sm hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-foreground/[0.01] rounded-3xl border border-dashed border-border/50">
              <div className="p-4 rounded-full bg-foreground/5 text-muted/30">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground/80">暂无照片</p>
                <p className="text-sm text-muted">点击右上角添加照片</p>
              </div>
            </div>
          )}
        </section>

        <footer className="pt-8 text-sm text-muted border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} wilboerht</p>
        </footer>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 flex items-center justify-center z-[101] p-6"
            >
              <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-2xl bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setShowModal(false)}
                    aria-label="关闭"
                    className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-8 pt-8 pb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {editingIndex !== null ? "编辑照片" : "添加照片"}
                  </h2>
                </div>

                <div className="px-8 pb-8 overflow-y-auto">
                  <form onSubmit={handleSave} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-medium text-foreground">图片</label>
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
                          dragActive
                            ? "border-accent bg-accent/5"
                            : "border-border/50 hover:border-foreground/20"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadFile(f);
                            e.currentTarget.value = "";
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {form.src ? (
                          <div className="p-3 flex items-center gap-4">
                            <img
                              src={form.src}
                              alt="preview"
                              className="w-20 h-20 object-cover rounded-lg bg-muted/20"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-medium truncate">
                                {form.src.split("/").pop()}
                              </p>
                              <p className="text-xs text-muted mt-1">点击或拖拽替换图片</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm((prev) => ({ ...prev, src: "" }));
                              }}
                              className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors z-20 relative"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-10 flex flex-col items-center justify-center text-center gap-2 px-4">
                            <div className="p-3 rounded-full bg-foreground/5 text-muted">
                              {uploading ? (
                                <span className="block w-5 h-5 border-2 border-muted/30 border-t-foreground rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}
                            </div>
                            <p className="text-sm text-foreground font-medium">
                              {uploading ? "上传中..." : "点击或拖拽上传图片"}
                            </p>
                            <p className="text-xs text-muted">支持 JPG、PNG、WebP，最大 10MB</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/50" />
                        <span className="text-xs text-muted">或填写 URL</span>
                        <div className="h-px flex-1 bg-border/50" />
                      </div>

                      <input
                        type="url"
                        required
                        value={form.src}
                        onChange={(e) => setForm({ ...form, src: e.target.value })}
                        placeholder="https://..."
                        className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">标题</label>
                        <input
                          type="text"
                          required
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="照片标题"
                          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">地点</label>
                        <input
                          type="text"
                          required
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="拍摄地点"
                          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground">描述</label>
                      <textarea
                        rows={3}
                        value={form.description || ""}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="简短描述..."
                        className="px-4 py-3 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-y"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">相机</label>
                        <input
                          type="text"
                          value={form.exif?.camera || ""}
                          onChange={(e) =>
                            setForm({ ...form, exif: { ...form.exif, camera: e.target.value } })
                          }
                          placeholder="Sony A7R IV"
                          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">镜头</label>
                        <input
                          type="text"
                          value={form.exif?.lens || ""}
                          onChange={(e) =>
                            setForm({ ...form, exif: { ...form.exif, lens: e.target.value } })
                          }
                          placeholder="35mm f/1.4"
                          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">光圈</label>
                        <input
                          type="text"
                          value={form.exif?.aperture || ""}
                          onChange={(e) =>
                            setForm({ ...form, exif: { ...form.exif, aperture: e.target.value } })
                          }
                          placeholder="f/2.8"
                          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">快门</label>
                        <input
                          type="text"
                          value={form.exif?.shutter || ""}
                          onChange={(e) =>
                            setForm({ ...form, exif: { ...form.exif, shutter: e.target.value } })
                          }
                          placeholder="1/250s"
                          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">ISO</label>
                        <input
                          type="text"
                          value={form.exif?.iso || ""}
                          onChange={(e) =>
                            setForm({ ...form, exif: { ...form.exif, iso: e.target.value } })
                          }
                          placeholder="100"
                          className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "保存中..." : "保存"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
