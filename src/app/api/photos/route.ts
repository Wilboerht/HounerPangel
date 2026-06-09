import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { checkAuth } from "@/lib/auth";

const photosPath = join(process.cwd(), "src", "data", "photos.json");

async function readPhotos(): Promise<unknown[]> {
  const data = await readFile(photosPath, "utf-8");
  return JSON.parse(data);
}

async function writePhotos(photos: unknown[]): Promise<void> {
  await writeFile(photosPath, JSON.stringify(photos, null, 2) + "\n", "utf-8");
}

export async function GET() {
  try {
    const photos = await readPhotos();
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
    const photos = await readPhotos();
    photos.push(body);
    await writePhotos(photos);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to create photo:", error);
    return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const { index, data } = await request.json();
    const photos = await readPhotos();
    if (typeof index !== "number" || index < 0 || index >= photos.length) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }
    photos[index] = data;
    await writePhotos(photos);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update photo:", error);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  try {
    const { index } = await request.json();
    const photos = await readPhotos();
    if (typeof index !== "number" || index < 0 || index >= photos.length) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }
    photos.splice(index, 1);
    await writePhotos(photos);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
