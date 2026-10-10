import { useEffect, useRef, useState } from "react";

interface DraftRestoreOptions<T> {
  // 确认恢复：把草稿灌进表单（字段映射和表单重挂载方式由调用方决定）
  apply: (draft: T) => void;
  // 放弃恢复：删除草稿（确认恢复时保留，表单会继续自动保存覆盖）
  discard: () => void;
}

// 后台新建/编辑页共用的"检测到本地草稿，是否恢复"对话框状态机：
// 确认只走 apply，取消只走 discard，调用方无需再区分两种关闭路径
export function useDraftRestore<T>(options: DraftRestoreOptions<T>) {
  const [draftPrompt, setDraftPrompt] = useState<T | null>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const confirmRestore = () => {
    if (!draftPrompt) return;
    optionsRef.current.apply(draftPrompt);
    setDraftPrompt(null);
  };

  const cancelRestore = () => {
    if (!draftPrompt) return;
    optionsRef.current.discard();
    setDraftPrompt(null);
  };

  return { draftPrompt, setDraftPrompt, confirmRestore, cancelRestore };
}
