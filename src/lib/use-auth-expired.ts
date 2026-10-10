import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

// 管理端请求返回 401 时的统一处理：提示后让服务端重新校验会话并渲染登录表单
export function useAuthExpired() {
  const router = useRouter();
  const toast = useToast();
  return useCallback(() => {
    toast.error("登录已过期，请重新登录");
    router.refresh();
  }, [router, toast]);
}
