'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface BlogCardProps {
    title: string;
    excerpt: string;
    date: string;
    readingTime: string;
    slug: string;
    tags?: string[];
}

export function BlogCard({ title, excerpt, date, readingTime, slug, tags }: BlogCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="group"
        >
            <Link href={`/blog/${slug}`} className="block py-6 border-b border-border hover:border-accent transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                            {title}
                        </h2>
                        <p className="text-muted text-sm leading-relaxed line-clamp-2">
                            {excerpt}
                        </p>

                        {/* Tags */}
                        {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-muted"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="flex md:flex-col items-center md:items-end gap-2 text-xs text-muted shrink-0">
                        <time dateTime={date}>{date}</time>
                        <span className="md:hidden">·</span>
                        <span>{readingTime}</span>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
