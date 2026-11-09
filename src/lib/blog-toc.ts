import "server-only";

import { toString as hastToString } from "hast-util-to-string";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import type { Root as HastRoot } from "hast";
import { sanitizeSchema } from "@/lib/markdown-schema";
import type { TocHeading } from "@/lib/types/blog";

const tocProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkAlert, { legacyTitle: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug);

export function getTableOfContents(content: string): TocHeading[] {
    const tree = tocProcessor.runSync(tocProcessor.parse(content)) as HastRoot;
    const headings: TocHeading[] = [];

    visit(tree, "element", (node) => {
        const depth = node.tagName === "h1" || node.tagName === "h2" ? 2 : node.tagName === "h3" ? 3 : null;
        if (depth === null) return;

        const id = node.properties?.id;
        if (typeof id !== "string") return;

        const text = hastToString(node).trim();
        if (!text) return;

        headings.push({ id, text, depth });
    });

    return headings;
}
