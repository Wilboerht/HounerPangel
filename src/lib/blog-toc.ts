import "server-only";

import { toHtml } from "hast-util-to-html";
import { toString as hastToString } from "hast-util-to-string";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { remarkAlert } from "remark-github-blockquote-alert";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { SKIP, visit } from "unist-util-visit";
import type { Element, ElementContent, Root as HastRoot } from "hast";
import { sanitizeSchema } from "@/lib/markdown-schema";
import type { TocHeading } from "@/lib/types/blog";

function hasClassName(node: Element, name: string): boolean {
    const className = node.properties?.className;
    return Array.isArray(className) ? className.includes(name) : className === name;
}

function isKatexElement(node: Element): boolean {
    return node.tagName === "span" && hasClassName(node, "katex");
}

function containsKatex(node: Element): boolean {
    return node.children.some(
        (child) => child.type === "element" && (isKatexElement(child) || containsKatex(child))
    );
}

function serializeLabel(node: ElementContent): string {
    if (node.type === "text") return toHtml(node);
    if (node.type !== "element") return "";
    if (isKatexElement(node)) return toHtml(node);
    if (containsKatex(node)) return node.children.map(serializeLabel).join("");
    return toHtml({ type: "text", value: hastToString(node) });
}

const tocProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkAlert, { legacyTitle: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeKatex);

export function getTableOfContents(content: string): TocHeading[] {
    const tree = tocProcessor.runSync(tocProcessor.parse(content)) as HastRoot;
    const headings: TocHeading[] = [];

    visit(tree, "element", (node) => {
        if (node.tagName === "details" || node.tagName === "blockquote") return SKIP;
        if (node.tagName === "div" && hasClassName(node, "markdown-alert")) return SKIP;

        const depth = node.tagName === "h1" || node.tagName === "h2" ? 2 : node.tagName === "h3" ? 3 : null;
        if (depth === null) return;

        const id = node.properties?.id;
        if (typeof id !== "string") return;

        const text = hastToString(node).replace(/\s+/g, " ").replace(/\u200b/g, "").trim();
        if (!text) return;

        const html = node.children.map(serializeLabel).join("");
        headings.push({ id, text, depth, html });
    });

    return headings;
}
