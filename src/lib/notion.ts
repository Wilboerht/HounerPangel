import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// 初始化 Notion 客户端
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

// 拦截 Notion 的空行（空段落），强制转换成 <br/> 标签，
// 这样就能保留你在 Notion 里敲回车产生的连续空白行，不会被 Markdown 折叠了。
n2m.setCustomTransformer("paragraph", async (block: any) => {
    if (!block.paragraph?.rich_text || block.paragraph.rich_text.length === 0) {
        return "<br/>";
    }
    return false; // 返回 false 让插件使用默认解析方式渲染有文字的段落
});

export const getPublishedPosts = async () => {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
        console.warn("Missing Notion environment variables");
        return [];
    }

    try {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "Published",
                checkbox: {
                    equals: true,
                },
            },
            sorts: [
                {
                    property: "Date",
                    direction: "descending",
                },
            ],
        });

        const rawPosts = response.results.map((post: any) => {
            return {
                id: post.id,
                title: post.properties.Name?.title[0]?.plain_text || "Untitled",
                slug: post.properties.Slug?.rich_text[0]?.plain_text || post.id,
                date: post.properties.Date?.date?.start || "",
                excerpt: post.properties.Excerpt?.rich_text[0]?.plain_text || "",
                seriesName: post.properties.Series?.select?.name || null,
            };
        });

        const seriesMap = new Map();
        rawPosts.forEach((post: any) => {
            if (post.seriesName) {
                if (!seriesMap.has(post.seriesName)) {
                    seriesMap.set(post.seriesName, []);
                }
                seriesMap.get(post.seriesName).push(post);
            }
        });

        rawPosts.forEach((post: any) => {
            if (post.seriesName) {
                const group = seriesMap.get(post.seriesName);
                const sortedGroup = [...group].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const index = sortedGroup.findIndex((p) => p.id === post.id);
                
                post.series = {
                    name: post.seriesName,
                    current: index + 1,
                    total: sortedGroup.length,
                    items: sortedGroup.map((p, i) => ({
                        slug: p.slug,
                        title: p.title,
                        index: i + 1,
                    })),
                };
            } else {
                post.series = null;
            }
            delete post.seriesName;
        });

        return rawPosts;
    } catch (error) {
        console.error("Error fetching Notion posts:", error);
        return [];
    }
};

export const getPublishedResearch = async () => {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_RESEARCH_DATABASE_ID) {
        console.warn("Missing Notion environment variables for Research");
        return [];
    }

    try {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_RESEARCH_DATABASE_ID,
            filter: {
                property: "Published",
                checkbox: {
                    equals: true,
                },
            },
            sorts: [
                {
                    property: "Date",
                    direction: "descending",
                },
            ],
        });

        return response.results.map((item: any) => {
            return {
                id: item.id,
                title: item.properties.Name?.title[0]?.plain_text || "Untitled Research",
                slug: item.properties.Slug?.rich_text[0]?.plain_text || item.id,
                date: item.properties.Date?.date?.start || "",
                abstract: item.properties.Abstract?.rich_text[0]?.plain_text || "No abstract provided.",
                tags: item.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
            };
        });
    } catch (error) {
        console.error("Error fetching Notion research items:", error);
        return [];
    }
};

export const getSingleResearch = async (slug: string) => {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_RESEARCH_DATABASE_ID) {
        return null;
    }

    const decodedSlug = decodeURIComponent(slug);

    try {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_RESEARCH_DATABASE_ID,
            filter: {
                property: "Slug",
                rich_text: {
                    equals: decodedSlug,
                },
            },
        });

        if (!response.results.length) {
            return null;
        }

        const item: any = response.results[0];
        const mdblocks = await n2m.pageToMarkdown(item.id);
        const mdString = n2m.toMarkdownString(mdblocks);

        return {
            id: item.id,
            title: item.properties.Name?.title[0]?.plain_text || "Untitled",
            slug: item.properties.Slug?.rich_text[0]?.plain_text || item.id,
            date: item.properties.Date?.date?.start || "",
            abstract: item.properties.Abstract?.rich_text[0]?.plain_text || "",
            tags: item.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
            content: mdString.parent,
        };
    } catch (error) {
        console.error("Error fetching single research item:", error);
        return null;
    }
};

export const getSinglePost = async (slug: string) => {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
        return null;
    }

    const decodedSlug = decodeURIComponent(slug);

    try {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "Slug",
                rich_text: {
                    equals: decodedSlug,
                },
            },
        });

        if (!response.results.length) {
            return null;
        }

        const post: any = response.results[0];
        const mdblocks = await n2m.pageToMarkdown(post.id);
        const mdString = n2m.toMarkdownString(mdblocks);

        let series = null;
        const seriesName = post.properties.Series?.select?.name;
        if (seriesName) {
            const seriesResponse = await notion.databases.query({
                database_id: process.env.NOTION_DATABASE_ID,
                filter: {
                    and: [
                        { property: "Published", checkbox: { equals: true } },
                        { property: "Series", select: { equals: seriesName } }
                    ]
                },
                sorts: [{ property: "Date", direction: "ascending" }]
            });
            const items = seriesResponse.results.map((p: any, i: number) => ({
                slug: p.properties.Slug?.rich_text[0]?.plain_text || p.id,
                title: p.properties.Name?.title[0]?.plain_text || "Untitled",
                index: i + 1
            }));
            const currentItem = items.find((item) => item.slug === (post.properties.Slug?.rich_text[0]?.plain_text || post.id));
            series = {
                name: seriesName,
                current: currentItem ? currentItem.index : 1,
                total: items.length,
                items
            };
        }

        return {
            id: post.id,
            title: post.properties.Name?.title[0]?.plain_text || "Untitled",
            slug: post.properties.Slug?.rich_text[0]?.plain_text || post.id,
            date: post.properties.Date?.date?.start || "",
            readTime: "5 min read",
            views: post.properties.Views?.number || 0,
            excerpt: post.properties.Excerpt?.rich_text[0]?.plain_text || "",
            series: series,
            content: mdString.parent,
        };
    } catch (error) {
        console.error("Error fetching Notion post:", error);
        return null;
    }
};

export const incrementViews = async (pageId: string) => {
    try {
        const page = await notion.pages.retrieve({ page_id: pageId });
        const currentViews = (page as any).properties?.Views?.number || 0;

        await notion.pages.update({
            page_id: pageId,
            properties: {
                Views: {
                    number: currentViews + 1,
                },
            },
        });
        return currentViews + 1;
    } catch (error) {
        console.error("Error incrementing views:", error);
        return null;
    }
};

export const submitFeedback = async (articleTitle: string, userMessage: string) => {
    if (!process.env.NOTION_FEEDBACK_DATABASE_ID) return null;

    try {
        const response = await notion.pages.create({
            parent: { database_id: process.env.NOTION_FEEDBACK_DATABASE_ID },
            properties: {
                "Title": {
                    title: [{ text: { content: `Feedback on: ${articleTitle}` } }]
                },
                "Message": {
                    rich_text: [{ text: { content: userMessage } }]
                },
                "Date": {
                    date: { start: new Date().toISOString() }
                }
            }
        });
        return response;
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return null;
    }
};

export const getComments = async (pageId: string) => {
    try {
        const response = await notion.comments.list({ block_id: pageId });
        return response.results.map((comment: any) => ({
            id: comment.id,
            text: comment.rich_text[0]?.plain_text || "",
            created_time: comment.created_time,
            author: comment.created_by?.name || "Reader",
        }));
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
};

export const addComment = async (pageId: string, text: string) => {
    try {
        const response = await notion.comments.create({
            parent: { page_id: pageId },
            rich_text: [{ text: { content: text } }]
        });
        return response;
    } catch (error) {
        console.error("Error adding comment:", error);
        return null;
    }
};
