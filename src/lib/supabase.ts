import { createClient } from "@supabase/supabase-js";
import { Post, Research, Comment, Series, SeriesItem } from "@/types/content";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 动态计算文章阅读时长
 */
const calculateReadingTime = (content: string): string => {
    if (!content) return "1 min read";
    const cleanContent = content.replace(/[#*`~[\]()]/g, '');
    const chineseChars = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = cleanContent
        .replace(/[\u4e00-\u9fa5]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length;
    const totalWords = chineseChars + englishWords;
    const minutes = Math.ceil(totalWords / 300);
    return `${Math.max(1, minutes)} min read`;
};

export const getPublishedPosts = async (): Promise<Post[]> => {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching Supabase posts:", error);
        return [];
    }

    // 处理 Series 逻辑
    const seriesMap = new Map<string, any[]>();
    posts.forEach((post) => {
        if (post.series_name) {
            if (!seriesMap.has(post.series_name)) {
                seriesMap.set(post.series_name, []);
            }
            seriesMap.get(post.series_name)?.push(post);
        }
    });

    return posts.map((post) => {
        let processedPost: Post = {
            id: post.id,
            title: post.title,
            slug: post.slug,
            date: post.date,
            excerpt: post.excerpt || "",
            views: post.views,
            series: null
        };

        if (post.series_name) {
            const group = seriesMap.get(post.series_name) || [];
            const sortedGroup = [...group].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const index = sortedGroup.findIndex((p) => p.id === post.id);
            
            processedPost.series = {
                name: post.series_name,
                current: index + 1,
                total: sortedGroup.length,
                items: sortedGroup.map((p, i) => ({
                    slug: p.slug,
                    title: p.title,
                    index: i + 1,
                })),
            };
        }
        return processedPost;
    });
};

export const getPublishedResearch = async (): Promise<Research[]> => {
    const { data, error } = await supabase
        .from('research')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching Supabase research:", error);
        return [];
    }

    return data.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        date: item.date,
        abstract: item.abstract || "",
        tags: item.tags || [],
        views: item.views,
    }));
};

export const getSinglePost = async (slug: string): Promise<Post | null> => {
    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !post) return null;

    let series = null;
    if (post.series_name) {
        const { data: seriesItems } = await supabase
            .from('posts')
            .select('slug, title, date')
            .eq('series_name', post.series_name)
            .eq('published', true)
            .order('date', { ascending: true });

        if (seriesItems) {
            const index = seriesItems.findIndex(item => item.slug === post.slug);
            series = {
                name: post.series_name,
                current: index + 1,
                total: seriesItems.length,
                items: seriesItems.map((item, i) => ({
                    slug: item.slug,
                    title: item.title,
                    index: i + 1
                }))
            };
        }
    }

    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        date: post.date,
        excerpt: post.excerpt || "",
        content: post.content,
        views: post.views,
        readTime: calculateReadingTime(post.content),
        series
    };
};

export const getSingleResearch = async (slug: string): Promise<Research | null> => {
    const { data: item, error } = await supabase
        .from('research')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !item) return null;

    return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        date: item.date,
        abstract: item.abstract || "",
        tags: item.tags || [],
        content: item.content,
        views: item.views,
        readTime: calculateReadingTime(item.content)
    };
};

export const incrementViews = async (slug: string, type: 'posts' | 'research') => {
    try {
        const { error } = await supabase.rpc('increment_views', { 
            target_slug: slug,
            table_name: type
        });
        if (error) throw error;
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
};

export const submitFeedback = async (articleTitle: string, userMessage: string) => {
    const { data, error } = await supabase
        .from('feedbacks')
        .insert([{ article_title: articleTitle, message: userMessage }]);
    
    if (error) {
        console.error("Error submitting feedback:", error);
        return null;
    }
    return data;
};

export const getComments = async (pageId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error);
        return [];
    }

    return data.map(c => ({
        id: c.id,
        text: c.text,
        created_time: c.created_at,
        author: c.author,
        email: c.email
    }));
};

export const addComment = async (pageId: string, text: string, nickname?: string, email?: string) => {
    const { data, error } = await supabase
        .from('comments')
        .insert([{ 
            page_id: pageId, 
            text, 
            author: nickname || "Reader", 
            email 
        }]);

    if (error) {
        console.error("Error adding comment:", error);
        return null;
    }
    return data;
};
