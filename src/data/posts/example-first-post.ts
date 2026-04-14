import { Post } from "@/types/content";

export const exampleFirstPost: Post = {
  id: "example-first-post",
  slug: "example-first-post",
  title: "这是一篇示例博客文章",
  date: new Date().toISOString().split("T")[0],
  excerpt: "这是第一篇博客文章的摘要，在这里可以简要描述文章内容。",
  readTime: "5 min read",
  series: null,
  content: `# 这是一篇示例博客文章

你可以直接在代码中编辑博客内容。每篇博客文章都是一个 TypeScript 文件。

## 格式说明

- 在 \`src/data/posts/\` 目录下创建新文件
- 导出一个 \`Post\` 对象
- 在 \`index.ts\` 中引入并添加到列表

## 支持的功能

- Markdown 格式
- 代码高亮
- 数学公式（KaTeX）
- 链接、列表等

这样做的好处是：
1. 不需要后端管理系统
2. 版本控制友好
3. 部署简单快速
`,
};
