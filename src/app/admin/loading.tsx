export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="加载中">
      <div className="h-6 w-28 rounded bg-foreground/10" />
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-border/50 bg-foreground/[0.03]" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-border/50 bg-foreground/[0.03]" />
    </div>
  );
}
