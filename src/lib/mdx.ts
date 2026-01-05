import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

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

export function getAllPosts(): PostMeta[] {
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
        .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));

    return posts;
}

export function getPostBySlug(slug: string): Post | null {
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

export function getAllPostSlugs(): string[] {
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
