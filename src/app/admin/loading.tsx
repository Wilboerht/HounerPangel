export default function AdminLoading() {
  return (
    <div
      className="flex flex-col gap-6 motion-safe:animate-pulse"
      aria-busy="true"
      aria-label="加载中"
    >
      <div className="flex flex-col gap-2">
        <div className="h-6 w-28 rounded bg-foreground/10" />
        <div className="h-4 w-52 rounded bg-foreground/[0.06]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-border/50 bg-foreground/[0.03]"
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-lg border border-border/50 bg-foreground/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}
