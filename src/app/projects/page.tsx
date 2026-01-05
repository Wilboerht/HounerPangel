import { ProjectCard } from '@/components/ProjectCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Projects',
    description: 'A collection of projects I have worked on.',
};

const projects = [
    {
        title: 'Personal Blog',
        description: 'A minimal and elegant blog built with Next.js 14, MDX, and Tailwind CSS. Features dark mode, comments, and responsive design.',
        href: 'https://github.com/Wilboerht/Sysbase',
        tags: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    },
    {
        title: 'Project Two',
        description: 'Description of your second project. Replace this with your actual project details.',
        href: '#',
        tags: ['React', 'Node.js'],
    },
];

export default function ProjectsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <header className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Projects</h1>
                <p className="text-muted">
                    A collection of projects I have worked on.
                </p>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.title}
                        title={project.title}
                        description={project.description}
                        href={project.href}
                        tags={project.tags}
                    />
                ))}
            </div>
        </div>
    );
}
