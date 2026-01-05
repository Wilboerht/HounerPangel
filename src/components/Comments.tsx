'use client';

import { useTheme } from 'next-themes';
import Giscus from '@giscus/react';
import { useEffect, useState } from 'react';

export function Comments() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        );
    }

    return (
        <div className="mt-12 pt-8 border-t border-border">
            <h2 className="font-semibold text-lg mb-6">Comments</h2>
            <Giscus
                id="comments"
                repo="Wilboerht/Sysbase"
                repoId=""
                category="General"
                categoryId=""
                mapping="pathname"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={theme === 'dark' ? 'dark' : 'light'}
                lang="en"
                loading="lazy"
            />
        </div>
    );
}
