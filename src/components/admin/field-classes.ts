// 管理端表单控件的统一外观：边框、圆角、字号、占位符和焦点边框保持一致。
// 焦点可见性由 globals.css 的 :focus-visible 规则统一提供。
export const fieldBase =
  "w-full rounded-lg border border-foreground/20 bg-foreground/[0.03] text-sm text-foreground placeholder:text-muted/80 transition-colors focus:border-accent";

export const fieldClass = `${fieldBase} px-3 py-2`;

export const fieldSearchClass = `${fieldBase} py-2 pl-10 pr-12`;

export const fieldLabelClass = "text-sm font-medium text-foreground";
