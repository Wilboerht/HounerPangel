'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Timeline } from '@/components/Timeline';

const journeyItems = [
  {
    title: 'Software Developer',
    subtitle: 'Building modern web applications',
    date: 'Present',
    description: 'Full-stack development with Next.js, React, and Node.js',
  },
  {
    title: 'University',
    subtitle: 'Computer Science',
    date: '2020 - 2024',
  },
];

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/Wilboerht' },
  { name: 'Twitter', href: 'https://twitter.com/wilboerht' },
  { name: 'Email', href: 'mailto:hello@example.com' },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Hi, I&apos;m <span className="text-accent">Hank Wang</span>
        </h1>
        <p className="text-lg text-muted leading-relaxed max-w-2xl mb-8">
          Passionate software developer. Always eager to learn & create more.
          Building modern web applications with clean code and thoughtful design.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-foreground transition-colors 
                         px-4 py-2 border border-border rounded-full hover:border-accent"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Journey Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-20"
      >
        <h2 className="text-2xl font-semibold mb-8">Journey</h2>
        <Timeline items={journeyItems} />
      </motion.section>

      {/* Featured Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Featured</h2>
          <Link href="/blog" className="text-sm text-muted hover:text-foreground transition-colors">
            View all →
          </Link>
        </div>

        {/* Featured Posts placeholder */}
        <div className="grid gap-4">
          <Link
            href="/blog"
            className="block p-6 border border-border rounded-xl hover:border-accent transition-colors group"
          >
            <h3 className="font-medium mb-2 group-hover:text-accent transition-colors">
              Welcome to my blog
            </h3>
            <p className="text-sm text-muted">
              This is where I share my thoughts on software development, design, and more.
            </p>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
