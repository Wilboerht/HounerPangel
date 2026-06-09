import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 415 });
    }

    // Ensure bucket exists (public)
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === "photos");
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket("photos", {
        public: true,
        fileSizeLimit: maxSize.toString(),
        allowedMimeTypes: ["image/*"],
      });
      if (createError) {
        console.error("Failed to create bucket:", createError);
        return NextResponse.json({ error: "Storage bucket unavailable" }, { status: 500 });
      }
    }

    const ext = file.name.split(".").pop() || "jpg";
    const base = file.name.replace(/\.[^/.]+$/, "");
    const name = `${Date.now()}-${sanitizeFileName(base || "image")}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(name, file, { contentType: file.type });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(name);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
