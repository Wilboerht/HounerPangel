import { BlogPost } from "@/lib/types/blog";

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: "building-in-public",
        title: "Building in Public",
        excerpt: "Why I choose to share my work openly, and what I've learned from the process of creating transparently.",
        date: "2025-03-15",
        tags: ["Thoughts", "Process"],
        content: `## Building in Public

I've always believed that the best way to learn is by doing — and the best way to do is by sharing.

### Why Transparent?

When you build in public, you invite feedback early. You discover blind spots. You connect with people who are on similar journeys.

### What I've Learned

- **Consistency beats perfection.** Shipping something small regularly is better than shipping nothing while chasing perfection.
- **Community is everything.** The people you meet along the way become collaborators, friends, and sometimes co-founders.
- **Document the process.** Your future self will thank you, and others will find value in your struggles.

Building in public isn't about vanity metrics. It's about accountability, learning, and contribution.`
    },
    {
        slug: "travel-and-code",
        title: "Travel and Code",
        excerpt: "How traveling shapes the way I think about software, design, and problem-solving.",
        date: "2025-02-28",
        tags: ["Travel", "Reflection"],
        content: `## Travel and Code

There's a surprising overlap between exploring a new city and debugging a complex system.

### Pattern Recognition

When you arrive in a foreign place, your brain works overtime to find patterns. Which streets are safe? Where's the best food? How does the subway work?

Coding is the same. You look at a codebase, find the patterns, and navigate accordingly.

### Embracing Uncertainty

Travel teaches you to be comfortable with not knowing. You miss a train, you take the next one. A restaurant is closed, you find another.

In software, requirements change. Systems break. Being adaptable is the only constant skill.`
    },
    {
        slug: "minimalist-design-notes",
        title: "Minimalist Design Notes",
        excerpt: "A few principles I follow when designing interfaces that feel effortless.",
        date: "2025-01-10",
        tags: ["Design", "UI"],
        content: `## Minimalist Design Notes

Less is more. But less is also harder.

### Principles

1. **Every element must earn its place.** If it doesn't serve a purpose, remove it.
2. **Whitespace is active.** It's not empty space — it's breathing room for the content.
3. **Typography is the interface.** Good type hierarchy does 80% of the visual work.
4. **Color with intention.** One accent color is usually enough.

### In Practice

I start with content, then structure, then visual polish. Never the other way around.`
    },
    {
        slug: "on-becoming-a-super-individual",
        title: "On Becoming a Super Individual",
        excerpt: "Thoughts on the intersection of technical skills, creativity, and independence.",
        date: "2024-12-05",
        tags: ["Career", "Philosophy"],
        content: `## On Becoming a Super Individual

The idea of a "super individual" isn't about being superhuman. It's about being self-sufficient across multiple domains.

### The Stack

- **Technical depth.** You need one area where you can go deeper than most.
- **Breadth.** You need to understand enough of adjacent fields to collaborate effectively.
- **Execution.** Ideas are cheap. Shipping is the differentiator.

### The Journey

It's not a destination. It's a continuous process of learning, building, and sharing.

The goal isn't to do everything alone. It's to be valuable enough that you can choose who you work with.`
    },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
    return BLOG_POSTS.map((post) => post.slug);
}
