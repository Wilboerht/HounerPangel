// 管理端全局 dirty 状态：编辑表单（useDirtyGuard）写入，AdminShell 侧边栏导航读取。
// useDirtyGuard 只能拦 popstate/beforeunload，拦不住 Next <Link> 的 SPA 跳转，
// 所以导航守卫需要一个表单与布局之间的共享通道。模块级单例即可——同一时刻只有一个表单在编辑。
let dirty = false;
const listeners = new Set<() => void>();

export function isAdminDirty(): boolean {
  return dirty;
}

export function setAdminDirty(value: boolean): void {
  if (dirty === value) return;
  dirty = value;
  listeners.forEach((listener) => listener());
}

export function subscribeAdminDirty(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
