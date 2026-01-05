import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET /api/posts - Get all posts (including unpublished for admin)
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    try {
        const where = includeUnpublished && session?.user?.role === 'admin'
            ? {}
            : { published: true };

        const posts = await prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST /api/posts - Create a new post (admin only)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { slug, title, content, excerpt, tags, published } = body;

        if (!slug || !title || !content) {
            return NextResponse.json(
                { error: 'slug, title, and content are required' },
                { status: 400 }
            );
        }

        const post = await prisma.post.create({
            data: {
                slug,
                title,
                content,
                excerpt: excerpt || '',
                tags: JSON.stringify(tags || []),
                published: published ?? true,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error: any) {
        console.error('Error creating post:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
