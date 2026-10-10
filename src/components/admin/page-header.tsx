import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  // 标题右侧的小附件（如草稿徽标）
  accessory?: ReactNode;
  // 右侧操作区
  actions?: ReactNode;
}

export function PageHeader({ title, description, accessory, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {accessory}
        </div>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
