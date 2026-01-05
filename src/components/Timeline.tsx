'use client';

import { motion } from 'framer-motion';

interface TimelineItem {
    title: string;
    subtitle?: string;
    date: string;
    description?: string;
}

interface TimelineProps {
    items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
    return (
        <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-8">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="relative pl-8"
                    >
                        {/* Dot */}
                        <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-background border-2 border-accent" />

                        {/* Content */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                <h3 className="font-semibold">{item.title}</h3>
                                <span className="text-sm text-muted">{item.date}</span>
                            </div>
                            {item.subtitle && (
                                <p className="text-sm text-muted mb-1">{item.subtitle}</p>
                            )}
                            {item.description && (
                                <p className="text-sm text-muted mt-2">{item.description}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
