import { NextResponse } from "next/server";
import { cleanupOrphanedMedia } from "@/app/actions/maintenance";

/**
 * CRON API Route for Media Cleanup
 * Triggered via: POST /api/cron/cleanup-media
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: Request) {
    // 1. Optional Security Check
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Run Cleanup
    const result = await cleanupOrphanedMedia();

    if (result.success) {
        return NextResponse.json({ 
            message: "Cleanup completed successfully", 
            deletedCount: result.deleted,
            files: result.files 
        });
    } else {
        return NextResponse.json({ 
            error: "Cleanup failed", 
            details: result.error 
        }, { status: 500 });
    }
}

// Support GET for testing (optional, remove in production if desired)
export async function GET(req: Request) {
    return POST(req);
}
