import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET /api/comments?postSlug=xxx - Get all comments for a post
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
        return NextResponse.json({ error: 'postSlug is required' }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: {
                postSlug,
                parentId: null, // Only get top-level comments
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        replies: {
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { content, postSlug, parentId } = body;

        if (!content || !postSlug) {
            return NextResponse.json({ error: 'content and postSlug are required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postSlug,
                authorId: session.user.id,
                parentId: parentId || null,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
