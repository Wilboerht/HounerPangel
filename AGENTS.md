# 项目约定

## 管理端（/admin）UI 约定

- **页面边距只由 `AdminShell` 提供**（`max-w-5xl` 居中；桌面端顶距 `calc(1.5rem+safe-area)`，与侧边栏"管理面板"标题顶对齐），页面组件不要再自加页面级边距或外层 `min-h-dvh` 容器。
- **间距层级**：区块之间 `gap-6`；卡片网格 `gap-4`；卡片内部 `gap-3`；控件之间 `gap-2`。不要自创中间值（gap-5、py-2.5 等）。
- **共享组件**：卡片用 `DashboardCard`，页头用 `PageHeader`，徽标用 `Badge`，图标按钮用 `IconButton`（36px 触控区，`aria-label` 必填）。新样式先扩展这些组件，不要在页面里复制字面量。
- **safe-area**：必须用 calc 加法写法，如 `pt-[calc(1.5rem+env(safe-area-inset-top,0px))]`。（原 `.pt-safe`/`.pb-safe`/`.pl-safe`/`.pr-safe` unlayered 工具类已删除，不要再引入。）
- **新增导航板块**：只需在 `admin-shell.tsx` 的 `NAV_SECTIONS` 对应分类的 `items` 里追加一项（新分类则追加一个 section）；新页面自动获得鉴权（layout 统一校验会话，未登录原地渲染登录表单）。
