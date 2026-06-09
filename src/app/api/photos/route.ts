import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getAllPhotos, createPhoto, updatePhoto, deletePhoto } from "@/lib/supabase";
import { photoSchema, photoUpdateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const photos = await getAllPhotos();
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = photoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, created_at, updated_at, ...rest } = parsed.data;
    const photo = await createPhoto(rest);
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Failed to create photo:", error);
    return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = photoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { id, ...data } = parsed.data;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const photo = await updatePhoto(id, data);
    return NextResponse.json(photo);
  } catch (error) {
    console.error("Failed to update photo:", error);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deletePhoto(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
