'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface ProjectCardProps {
    title: string;
    description: string;
    href: string;
    image?: string;
    tags?: string[];
}

export function ProjectCard({ title, description, href, image, tags }: ProjectCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Link
                href={href}
                className="block group bg-background border border-border rounded-xl overflow-hidden 
                   hover:border-border-hover hover:shadow-lg transition-all duration-300"
            >
                {/* Image */}
                {image && (
                    <div className="aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden">
                        <Image
                            src={image}
                            alt={title}
                            width={800}
                            height={450}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
                        {title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed mb-4">
                        {description}
                    </p>

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-muted"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
