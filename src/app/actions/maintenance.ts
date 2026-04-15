export type CleanupResult = {
    success: boolean;
    deleted: number;
    files: string[];
    error?: string;
};

/**
 * Cleanup orphaned media files.
 *
 * Current implementation is a safe no-op to keep the cron route stable
 * when storage cleanup strategy is not configured yet.
 */
export async function cleanupOrphanedMedia(): Promise<CleanupResult> {
    return {
        success: true,
        deleted: 0,
        files: [],
    };
}
