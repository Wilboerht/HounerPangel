import { Research } from "@/types/content";

export const exampleResearch: Research = {
  id: "example-research",
  slug: "example-research",
  title: "示例研究文章",
  date: new Date().toISOString().split("T")[0],
  abstract: "这是一篇示例研究文章，展示如何在代码中编写研究内容。",
  tags: ["示例", "研究", "静态"],
  readTime: "8 min read",
  content: `# 示例研究文章

这是一篇研究性的文章。

## 特点

- 包含 abstract（摘要）
- 可以添加多个 tags（标签）
- 支持完整的 Markdown 语法
- 易于版本管理和协作

## 如何添加新的研究文章

1. 在 \`src/data/research/\` 目录下创建新文件
2. 导出一个 \`Research\` 对象
3. 在 \`index.ts\` 中引入并添加到列表

这样既保持了代码的纯净，又能够轻松管理内容。
`,
};
