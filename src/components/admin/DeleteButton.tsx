"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deletePostAction, deleteResearchAction } from "@/app/actions/admin";

interface DeleteButtonProps {
    id: string;
    slug: string;
    type: "posts" | "research";
}

export function DeleteButton({ id, slug, type }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm("确定要删除这篇文章吗？相关媒体素材也将被永久清理。")) return;
        
        setIsDeleting(true);
        const action = type === "posts" ? deletePostAction : deleteResearchAction;
        const result = await action(id, slug);

        if (result?.error) {
            alert("删除失败: " + result.error);
            setIsDeleting(false);
        }
        // Success will trigger revalidatePath and the list will update automatically
    }

    return (
        <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
            title="删除"
        >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    );
}
