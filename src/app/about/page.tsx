import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About',
    description: 'Learn more about me.',
};

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-20">
            <header className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-4">About</h1>
            </header>

            <article className="prose">
                <p>
                    Hi! I&apos;m a passionate software developer who loves building modern web applications.
                    I focus on creating clean, efficient, and user-friendly experiences.
                </p>

                <h2>What I Do</h2>
                <p>
                    I specialize in full-stack web development with a focus on:
                </p>
                <ul>
                    <li><strong>Frontend:</strong> React, Next.js, TypeScript, Tailwind CSS</li>
                    <li><strong>Backend:</strong> Node.js, Python, databases</li>
                    <li><strong>DevOps:</strong> Git, CI/CD, cloud platforms</li>
                </ul>

                <h2>Get in Touch</h2>
                <p>
                    Feel free to reach out if you want to collaborate or just say hello!
                </p>
                <ul>
                    <li>
                        <Link href="https://github.com/Wilboerht" target="_blank" rel="noopener noreferrer">
                            GitHub
                        </Link>
                    </li>
                    <li>
                        <Link href="https://twitter.com/wilboerht" target="_blank" rel="noopener noreferrer">
                            Twitter
                        </Link>
                    </li>
                    <li>
                        <Link href="mailto:hello@example.com">
                            Email
                        </Link>
                    </li>
                </ul>
            </article>
        </div>
    );
}
