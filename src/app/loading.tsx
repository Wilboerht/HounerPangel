export default function Loading() {
    return (
        <main className="min-h-dvh flex items-center justify-center">
            <div className="flex flex-col items-center gap-3" role="status">
                <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                <p className="text-sm text-muted" aria-live="polite">加载中...</p>
            </div>
        </main>
    );
}
