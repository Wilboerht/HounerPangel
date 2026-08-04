import hljs from "highlight.js";

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
                    className="border-l-2 border-accent/40 pl-4 py-1 text-muted italic"
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
                } else {
                    highlighted = hljs.highlightAuto(code).value;
                }
            } catch {
                highlighted = code;
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
            const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/i);
            const allowedDomains = [
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
            const isAllowed = srcMatch
                ? allowedDomains.some((d) => {
                      try {
                          const url = new URL(srcMatch[1]);
                          return url.hostname === d;
                      } catch {
                          return false;
                      }
                  })
                : false;

            if (isAllowed) {
                elements.push(
                    <div key={`iframe-${elements.length}`} className="my-4">
                        <div dangerouslySetInnerHTML={{ __html: iframeHtml }} />
                    </div>
                );
            } else {
                elements.push(
                    <pre key={`iframe-${elements.length}`} className="rounded-xl bg-foreground/5 p-4 overflow-x-auto text-sm text-muted">
                        <code>{iframeHtml}</code>
                    </pre>
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
                <hr key={`hr-${elements.length}`} className="border-border my-6" />
            );
            continue;
        }

        if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <h1 key={index} className="text-2xl font-bold tracking-tight text-foreground mt-12 mb-4">
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
                <h2 key={index} className="text-xl font-semibold tracking-tight text-foreground mt-10 mb-3">
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
                <h3 key={index} className="text-lg font-semibold tracking-tight text-foreground mt-8 mb-2">
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
                    <div key={`tbl-${index}`} className="overflow-x-auto my-4">
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
            const [, imgAlt, imgUrl] = imageMatch;
            const isVideo = /\.(mp4|webm|mov|avi|mkv)($|\?)/i.test(imgUrl);
            elements.push(
                isVideo ? (
                    <figure key={`vid-${index}`} className="my-4">
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
                    <figure key={`img-${index}`} className="my-4">
                        <img
                            src={imgUrl}
                            alt={imgAlt || ""}
                            className="rounded-xl w-full"
                            loading="lazy"
                        />
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

        const standaloneLinkMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (standaloneLinkMatch) {
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
