import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { prisma } from './db';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface PostMeta {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    readingTime: string;
}

export interface Post extends PostMeta {
    content: string;
}

// Ensure directory exists
function ensurePostsDirectory() {
    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory, { recursive: true });
    }
}

// Get posts from database
async function getPostsFromDB(): Promise<PostMeta[]> {
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
        });

        return posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            date: formatDate(post.createdAt),
            excerpt: post.excerpt,
            tags: JSON.parse(post.tags || '[]'),
            readingTime: readingTime(post.content).text,
        }));
    } catch (error) {
        console.error('Error fetching posts from database:', error);
        return [];
    }
}

// Get posts from MDX files (fallback)
function getPostsFromFiles(): PostMeta[] {
    ensurePostsDirectory();

    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map((fileName) => {
            const slug = fileName.replace(/\.mdx$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            return {
                slug,
                title: data.title || 'Untitled',
                date: data.date ? formatDate(data.date) : '',
                excerpt: data.excerpt || '',
                tags: data.tags || [],
                readingTime: readingTime(content).text,
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
}

export async function getAllPosts(): Promise<PostMeta[]> {
    // Try database first, fallback to files
    const dbPosts = await getPostsFromDB();
    if (dbPosts.length > 0) {
        return dbPosts;
    }
    return getPostsFromFiles();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    // Try database first
    try {
        const post = await prisma.post.findUnique({
            where: { slug, published: true },
        });

        if (post) {
            return {
                slug: post.slug,
                title: post.title,
                date: formatDate(post.createdAt),
                excerpt: post.excerpt,
                tags: JSON.parse(post.tags || '[]'),
                readingTime: readingTime(post.content).text,
                content: post.content,
            };
        }
    } catch (error) {
        console.error('Error fetching post from database:', error);
    }

    // Fallback to file system
    ensurePostsDirectory();
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
        slug,
        title: data.title || 'Untitled',
        date: data.date ? formatDate(data.date) : '',
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        readingTime: readingTime(content).text,
        content,
    };
}

export async function getAllPostSlugs(): Promise<string[]> {
    // Get from database
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            select: { slug: true },
        });

        if (posts.length > 0) {
            return posts.map((p) => p.slug);
        }
    } catch (error) {
        console.error('Error fetching slugs from database:', error);
    }

    // Fallback to files
    ensurePostsDirectory();
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map((fileName) => fileName.replace(/\.mdx$/, ''));
}

function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
