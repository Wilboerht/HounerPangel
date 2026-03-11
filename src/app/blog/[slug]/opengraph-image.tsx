import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Blog Post - wilboerht';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    // Resolve the params promise (Next.js 15+ standard)
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // In a real application, you would fetch your post title here
    // const post = await getPost(slug);
    // const title = post?.title;
    
    // For now, we decode and format the slug to create a beautiful fallback title
    const title = decodeURIComponent(slug)
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a', // Dark theme background
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #222 2%, transparent 0%), radial-gradient(circle at 75px 75px, #222 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                    padding: '80px',
                    fontFamily: 'Inter, "San Francisco", "Helvetica Neue", sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(20, 20, 20, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '32px',
                        padding: '60px 80px',
                        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4)',
                    }}
                >
                    {/* Top category/author info */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '50px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                fontWeight: 'bold',
                                fontSize: '24px',
                                marginRight: '16px',
                            }}
                        >
                            W
                        </div>
                        <span style={{ fontSize: '28px', color: '#a1a1aa', fontWeight: 500 }}>
                            wilboerht blog
                        </span>
                    </div>

                    {/* Title - large and bold */}
                    <div
                        style={{
                            fontSize: '68px',
                            fontStyle: 'normal',
                            fontWeight: 800,
                            color: '#ffffff',
                            lineHeight: 1.25,
                            marginBottom: '40px',
                            letterSpacing: '-0.03em',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            overflow: 'hidden',
                        }}
                    >
                        {title}
                    </div>

                    {/* Bottom tag line */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: 'auto',
                            width: '100%',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ fontSize: '26px', fontWeight: 400, color: '#71717a' }}>
                            Resonating with the inner self.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px', borderRadius: '100px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <span style={{ fontSize: '20px', color: '#ffffff', fontWeight: 600 }}>Read Article</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
