import hljs from "highlight.js/lib/core";
import Image from "next/image";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import sql from "highlight.js/lib/languages/sql";
import yaml from "highlight.js/lib/languages/yaml";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import diff from "highlight.js/lib/languages/diff";
import markdownLang from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("diff", diff);
hljs.registerLanguage("markdown", markdownLang);
hljs.registerLanguage("plaintext", plaintext);

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// 链接协议白名单：仅允许 https?://、mailto:、以及 / 或 # 开头的相对路径
function isSafeLinkUrl(url: string): boolean {
    const trimmed = url.trim();
    return /^(https?:\/\/|mailto:|\/|#)/i.test(trimmed);
}

// 图片/视频地址白名单：仅允许 http(s) 或相对路径
function isSafeMediaUrl(url: string): boolean {
    const trimmed = url.trim();
    return /^(https?:\/\/|\/|#)/i.test(trimmed);
}

const IFRAME_ALLOWED_DOMAINS = [
    "embed.music.apple.com",
    "open.spotify.com",
    "bandcamp.com",
    "www.youtube.com",
    "youtube.com",
    "player.bilibili.com",
    "music.163.com",
    "y.qq.com",
    "platform.twitter.com",
    "twitter.com",
    "x.com",
    "www.instagram.com",
    "instagram.com",
];

// 校验 iframe src 域名白名单，通过则返回干净的 src，否则返回 null
function getAllowedIframeSrc(html: string): string | null {
    const srcMatch = html.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) return null;
    try {
        const url = new URL(srcMatch[1]);
        if (url.protocol !== "https:") return null;
        return IFRAME_ALLOWED_DOMAINS.some((d) => url.hostname === d) ? srcMatch[1] : null;
    } catch {
        return null;
    }
}

function findNextSpecial(s: string): number {
    for (let i = 0; i < s.length; i++) {
        if ("`[]*_~()".includes(s[i])) return i;
    }
    return -1;
}

function renderInline(text: string): React.ReactNode {
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        const codeMatch = remaining.match(/^`([^`]+)`/);
        if (codeMatch) {
            tokens.push(
                <code key={key++} className="px-1.5 py-0.5 rounded-md bg-foreground/10 text-foreground text-sm font-mono">
                    {codeMatch[1]}
                </code>
            );
            remaining = remaining.slice(codeMatch[0].length);
            continue;
        }

        const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
            if (isSafeLinkUrl(linkMatch[2])) {
                tokens.push(
                    <a
                        key={key++}
                        href={linkMatch[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline underline-offset-2"
                    >
                        {renderInline(linkMatch[1])}
                    </a>
                );
            } else {
                // 不允许的协议渲染为纯文本
                tokens.push(<span key={key++}>{linkMatch[1]}</span>);
            }
            remaining = remaining.slice(linkMatch[0].length);
            continue;
        }

        const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
            tokens.push(
                <strong key={key++} className="font-semibold text-foreground">
                    {renderInline(boldMatch[1])}
                </strong>
            );
            remaining = remaining.slice(boldMatch[0].length);
            continue;
        }

        const italicMatch = remaining.match(/^(\*)([^*]+)(\*)/);
        if (italicMatch && italicMatch[1] === italicMatch[3]) {
            tokens.push(
                <em key={key++} className="italic text-foreground/90">
                    {renderInline(italicMatch[2])}
                </em>
            );
            remaining = remaining.slice(italicMatch[0].length);
            continue;
        }

        const underscoreMatch = remaining.match(/^(_)([^_]+)(_)/);
        if (underscoreMatch) {
            tokens.push(
                <em key={key++} className="italic text-foreground/90">
                    {renderInline(underscoreMatch[2])}
                </em>
            );
            remaining = remaining.slice(underscoreMatch[0].length);
            continue;
        }

        const strikeMatch = remaining.match(/^~~([^~]+)~~/);
        if (strikeMatch) {
            tokens.push(
                <del key={key++} className="line-through text-muted">
                    {renderInline(strikeMatch[1])}
                </del>
            );
            remaining = remaining.slice(strikeMatch[0].length);
            continue;
        }

        const nextSpecial = findNextSpecial(remaining);
        if (nextSpecial === -1) {
            tokens.push(<span key={key++}>{remaining}</span>);
            break;
        }
        if (nextSpecial > 0) {
            tokens.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
            remaining = remaining.slice(nextSpecial);
            continue;
        }

        tokens.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
    }

    return tokens;
}

export function renderMarkdown(content: string): React.ReactNode {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let inCodeBlock = false;
    let inQuote = false;
    let inIframe = false;
    let codeLines: string[] = [];
    let codeLanguage = "";
    let iframeLines: string[] = [];
    let unorderedItems: React.ReactNode[] = [];
    let orderedItems: React.ReactNode[] = [];
    let quoteLines: string[] = [];

    const flushUnordered = () => {
        if (inUnorderedList && unorderedItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
                    {unorderedItems}
                </ul>
            );
            unorderedItems = [];
            inUnorderedList = false;
        }
    };

    const flushOrdered = () => {
        if (inOrderedList && orderedItems.length > 0) {
            elements.push(
                <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-2 text-muted leading-relaxed">
                    {orderedItems}
                </ol>
            );
            orderedItems = [];
            inOrderedList = false;
        }
    };

    const flushQuote = () => {
        if (inQuote && quoteLines.length > 0) {
            elements.push(
                <blockquote
                    key={`bq-${elements.length}`}
                    className="border-l-2 border-accent/40"
                >
                    {quoteLines.map((q, i) => (
                        <p key={i} className="leading-relaxed">
                            {renderInline(q)}
                        </p>
                    ))}
                </blockquote>
            );
            quoteLines = [];
            inQuote = false;
        }
    };

    const flushCodeBlock = () => {
        if (inCodeBlock && codeLines.length > 0) {
            const code = codeLines.join("\n");
            let highlighted: string;
            try {
                if (codeLanguage && hljs.getLanguage(codeLanguage)) {
                    highlighted = hljs.highlight(code, { language: codeLanguage }).value;
                } else if (codeLanguage) {
                    // 未注册语言按转义后的纯文本渲染
                    highlighted = escapeHtml(code);
                } else {
                    highlighted = hljs.highlightAuto(code).value;
                }
            } catch {
                highlighted = escapeHtml(code);
            }
            elements.push(
                <pre
                    key={`pre-${elements.length}`}
                    className="rounded-xl bg-foreground/5 p-3 sm:p-4 overflow-x-auto"
                >
                    <code
                        className="text-sm font-mono leading-relaxed hljs"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                </pre>
            );
            codeLines = [];
            codeLanguage = "";
            inCodeBlock = false;
        }
    };

    const flushIframe = () => {
        if (inIframe && iframeLines.length > 0) {
            const iframeHtml = iframeLines.join("\n").trim();
            const safeSrc = getAllowedIframeSrc(iframeHtml);

            if (safeSrc) {
                // 校验通过后重建一个干净的 iframe，剥离所有事件属性和其他内容
                elements.push(
                    <div key={`iframe-${elements.length}`} className="iframe-wrapper">
                        <iframe
                            src={safeSrc}
                            className="w-full aspect-video rounded-xl border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            title="嵌入内容"
                        />
                    </div>
                );
            } else {
                // 校验失败的 iframe 按普通文本段落渲染
                elements.push(
                    <p key={`iframe-${elements.length}`} className="text-muted leading-relaxed">
                        {iframeHtml}
                    </p>
                );
            }
            iframeLines = [];
            inIframe = false;
        }
    };

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            if (!inCodeBlock) {
                flushUnordered();
                flushOrdered();
                flushQuote();
                codeLanguage = trimmed.replace("```", "").trim();
                inCodeBlock = true;
            } else {
                flushCodeBlock();
            }
            continue;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            continue;
        }

        if (trimmed.toLowerCase().startsWith("<iframe")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            inIframe = true;
            iframeLines.push(line);
            // 单行写法立即 flush，避免吞掉后续正文
            if (trimmed.toLowerCase().includes("</iframe>")) {
                flushIframe();
            }
            continue;
        }
        if (inIframe) {
            iframeLines.push(line);
            if (trimmed.toLowerCase().includes("</iframe>")) {
                flushIframe();
            }
            continue;
        }

        if (/^(---+|___+|\*\*\*+)$/.test(trimmed)) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <hr key={`hr-${elements.length}`} className="border-border" />
            );
            continue;
        }

        if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <h1 key={index} className="text-2xl font-bold tracking-tight text-foreground">
                    {renderInline(trimmed.replace("# ", ""))}
                </h1>
            );
            continue;
        }

        if (trimmed.startsWith("## ")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <h2 key={index} className="text-xl font-semibold tracking-tight text-foreground">
                    {renderInline(trimmed.replace("## ", ""))}
                </h2>
            );
            continue;
        }

        if (trimmed.startsWith("### ")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <h3 key={index} className="text-lg font-semibold tracking-tight text-foreground">
                    {renderInline(trimmed.replace("### ", ""))}
                </h3>
            );
            continue;
        }

        if (trimmed.startsWith("> ")) {
            flushUnordered();
            flushOrdered();
            if (!inQuote) inQuote = true;
            quoteLines.push(trimmed.replace("> ", ""));
            continue;
        } else if (inQuote && trimmed.length === 0) {
            flushQuote();
            continue;
        }

        if (trimmed.startsWith("- ")) {
            flushOrdered();
            flushQuote();
            if (!inUnorderedList) inUnorderedList = true;
            unorderedItems.push(
                <li key={index}>{renderInline(trimmed.replace("- ", ""))}</li>
            );
            continue;
        }

        if (trimmed.match(/^\d+\.\s/)) {
            flushUnordered();
            flushQuote();
            if (!inOrderedList) inOrderedList = true;
            orderedItems.push(
                <li key={index}>{renderInline(trimmed.replace(/^\d+\.\s/, ""))}</li>
            );
            continue;
        }

        if (trimmed.startsWith("|")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            const headerCells = trimmed.split("|").filter(c => c.trim()).map(c => c.trim());
            const nextLine = index + 1 < lines.length ? lines[index + 1].trim() : "";
            const isSeparator = /^\|[\s\-:|]+\|$/.test(nextLine);
            if (isSeparator && headerCells.length > 0) {
                index++; // consume separator
                const bodyRows: string[][] = [];
                while (index + 1 < lines.length) {
                    const nextTrimmed = lines[index + 1].trim();
                    if (!nextTrimmed.startsWith("|")) break;
                    bodyRows.push(nextTrimmed.split("|").filter(c => c.trim()).map(c => c.trim()));
                    index++;
                }
                elements.push(
                    <div key={`tbl-${index}`} className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    {headerCells.map((cell, ci) => (
                                        <th key={ci} className="px-3 py-2 text-left font-semibold text-foreground">
                                            {cell}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bodyRows.map((row, ri) => (
                                    <tr key={ri} className="border-b border-border/50">
                                        {row.map((cell, ci) => (
                                            <td key={ci} className="px-3 py-2 text-muted">
                                                {renderInline(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            } else {
                elements.push(
                    <p key={index} className="text-muted leading-relaxed">
                        {renderInline(trimmed)}
                    </p>
                );
            }
            continue;
        }

        if (trimmed.length === 0) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            continue;
        }

        flushUnordered();
        flushOrdered();
        flushQuote();

        const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imageMatch) {
            const [, imgAlt, imgSrcRaw] = imageMatch;
            // 支持可选的 =WxH 尺寸标注（上传时自动写入），用于预留宽高比防止 CLS
            const sizeMatch = imgSrcRaw.match(/^(\S+)\s+=(\d+)x(\d+)$/);
            const imgUrl = sizeMatch ? sizeMatch[1] : imgSrcRaw;
            const imgWidth = sizeMatch ? parseInt(sizeMatch[2], 10) : undefined;
            const imgHeight = sizeMatch ? parseInt(sizeMatch[3], 10) : undefined;
            if (isSafeMediaUrl(imgUrl)) {
            const isVideo = /\.(mp4|webm|mov|avi|mkv)($|\?)/i.test(imgUrl);
            // 只有配置了 remotePatterns 的 Supabase 存储图才走 next/image 优化，外链图用裸 img
            const useNextImage = !isVideo && imgWidth !== undefined && imgHeight !== undefined
                && imgUrl.includes(".supabase.co/");
            elements.push(
                isVideo ? (
                    <figure key={`vid-${index}`} className="">
                        <video
                            src={imgUrl}
                            controls
                            className="rounded-xl w-full"
                            preload="metadata"
                        >
                            您的浏览器不支持视频播放。
                        </video>
                        {imgAlt && (
                            <figcaption className="text-sm text-muted text-center mt-2">
                                {imgAlt}
                            </figcaption>
                        )}
                    </figure>
                ) : (
                    <figure key={`img-${index}`} className="">
                        {useNextImage ? (
                            <Image
                                src={imgUrl}
                                alt={imgAlt || ""}
                                width={imgWidth}
                                height={imgHeight}
                                sizes="(max-width: 768px) 100vw, 672px"
                                className="rounded-xl block mx-auto max-w-full h-auto"
                            />
                        ) : (
                            /* 未知尺寸的外链图：不拉伸小图，保持原始尺寸居中 */
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={imgUrl}
                                alt={imgAlt || ""}
                                className="rounded-xl block mx-auto max-w-full"
                                loading="lazy"
                            />
                        )}
                        {imgAlt && (
                            <figcaption className="text-sm text-muted text-center mt-2">
                                {imgAlt}
                            </figcaption>
                        )}
                    </figure>
                )
            );
            continue;
            }
        }

        const standaloneLinkMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (standaloneLinkMatch && isSafeLinkUrl(standaloneLinkMatch[2])) {
            const [, cardText, cardUrl] = standaloneLinkMatch;
            elements.push(
                <a
                    key={`card-${index}`}
                    href={cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 rounded-2xl border border-border bg-card/50 hover:border-accent/40 hover:bg-card hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground tracking-wide">
                            {cardText}
                        </span>
                        <svg
                            className="w-4 h-4 text-muted group-hover:text-accent transition-colors"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </div>
                    <p className="text-sm text-muted leading-relaxed mt-1 truncate">
                        {cardUrl}
                    </p>
                </a>
            );
            continue;
        }

        elements.push(
            <p key={index} className="text-muted leading-relaxed">
                {renderInline(trimmed)}
            </p>
        );
    }

    flushUnordered();
    flushOrdered();
    flushQuote();
    flushCodeBlock();
    flushIframe();
    return elements;
}
