import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// 初始化 Notion 客户端
const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export const getPublishedPosts = async () => {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
        console.warn("Missing Notion environment variables");
        return [];
    }

    try {
        const response = await (notion.databases as any).query({
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

        return response.results.map((post: any) => {
            return {
                id: post.id,
                title: post.properties.Name?.title[0]?.plain_text || "Untitled",
                slug: post.properties.Slug?.rich_text[0]?.plain_text || post.id,
                date: post.properties.Date?.date?.start || "",
                excerpt: post.properties.Excerpt?.rich_text[0]?.plain_text || "",
                series: post.properties.Series?.select?.name 
                    ? { 
                        name: post.properties.Series.select.name, 
                        current: 1, 
                        total: 1,
                        items: [{ slug: post.properties.Slug?.rich_text[0]?.plain_text || post.id, title: post.properties.Name?.title[0]?.plain_text || "Untitled", index: 1 }]
                      } 
                    : null,
            };
        });
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
        const response = await (notion.databases as any).query({
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

export const getSinglePost = async (slug: string) => {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
        return null;
    }

    try {
        const response = await (notion.databases as any).query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: {
                property: "Slug",
                rich_text: {
                    equals: slug,
                },
            },
        });

        if (!response.results.length) {
            return null;
        }

        const post: any = response.results[0];
        const mdblocks = await n2m.pageToMarkdown(post.id);
        const mdString = n2m.toMarkdownString(mdblocks);

        return {
            id: post.id,
            title: post.properties.Name?.title[0]?.plain_text || "Untitled",
            slug: post.properties.Slug?.rich_text[0]?.plain_text || post.id,
            date: post.properties.Date?.date?.start || "",
            readTime: "5 min read", // Mocked for now, can be calculated based on word count
            excerpt: post.properties.Excerpt?.rich_text[0]?.plain_text || "",
            series: post.properties.Series?.select?.name 
                    ? { 
                        name: post.properties.Series.select.name, 
                        current: 1, 
                        total: 1,
                        items: [{ slug: post.properties.Slug?.rich_text[0]?.plain_text || post.id, title: post.properties.Name?.title[0]?.plain_text || "Untitled", index: 1 }]
                      } 
                    : null,
            content: mdString.parent, // Markdown 正文
        };
    } catch (error) {
        console.error("Error fetching Notion post:", error);
        return null;
    }
};
