import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const prisma = new PrismaClient();

async function migrateMDXToDB() {
    const contentDir = path.join(process.cwd(), 'content/blog');

    if (!fs.existsSync(contentDir)) {
        console.log('No content/blog directory found. Nothing to migrate.');
        return;
    }

    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));

    console.log(`Found ${files.length} MDX files to migrate...`);

    for (const file of files) {
        const filePath = path.join(contentDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        const slug = file.replace(/\.mdx$/, '');

        try {
            // Check if post already exists
            const existing = await prisma.post.findUnique({
                where: { slug },
            });

            if (existing) {
                console.log(`⏭️  Skipping ${slug} (already exists)`);
                continue;
            }

            // Create post
            await prisma.post.create({
                data: {
                    slug,
                    title: data.title || 'Untitled',
                    content,
                    excerpt: data.excerpt || '',
                    tags: JSON.stringify(data.tags || []),
                    published: true,
                    createdAt: data.date ? new Date(data.date) : new Date(),
                },
            });

            console.log(`✅ Migrated: ${slug}`);
        } catch (error) {
            console.error(`❌ Error migrating ${slug}:`, error);
        }
    }

    console.log('Migration complete!');
}

migrateMDXToDB()
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
