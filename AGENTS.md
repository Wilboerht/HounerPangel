# 项目约定

## 管理端（/admin）UI 约定

- **页面边距只由 `AdminShell` 提供**（`px-4 py-6 sm:px-6 lg:px-8 lg:py-8` + `max-w-5xl` 居中），页面组件不要再自加页面级边距或外层 `min-h-dvh` 容器。
- **间距层级**：区块之间 `gap-6`；卡片网格 `gap-4`；卡片内部 `gap-3`；控件之间 `gap-2`。不要自创中间值（gap-5、py-2.5 等）。
- **共享组件**：卡片用 `DashboardCard`，页头用 `PageHeader`，徽标用 `Badge`，图标按钮用 `IconButton`（36px 触控区，`aria-label` 必填）。新样式先扩展这些组件，不要在页面里复制字面量。
- **safe-area**：必须用 calc 加法写法，如 `pt-[calc(1.5rem+env(safe-area-inset-top,0px))]`。禁止把 `.pt-safe`/`.pb-safe`/`.pl-safe`/`.pr-safe` 与同方向的 Tailwind padding 写在同一元素上——这几个类是 unlayered CSS，会覆盖 Tailwind 工具类。
- **新增导航板块**：只需在 `admin-shell.tsx` 的 `NAV_ITEMS` 数组追加一项；新页面自动获得鉴权（layout 统一校验会话，未登录原地渲染登录表单）。
