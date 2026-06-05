import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const contentStatus = z.enum(['evergreen', 'active', 'archived', 'draft']).default('active');
const projectStatus = z.enum(['idea', 'prototype', 'active', 'maintained', 'paused', 'archived']);
const difficulty = z.enum(['beginner', 'intermediate', 'advanced']).optional();

const baseContentSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  series: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  readingTime: z.string().optional(),
  coverImage: z.string().optional(),
  status: contentStatus,
  difficulty,
  technology: z.array(z.string()).default([]),
  relatedContent: z.array(z.string()).default([]),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: baseContentSchema.extend({
    type: z.enum(['article', 'essay', 'note']).default('article'),
  }),
});

const tutorials = defineCollection({
  loader: glob({ base: './src/content/tutorials', pattern: '**/*.{md,mdx}' }),
  schema: baseContentSchema.extend({
    prerequisites: z.array(z.string()).default([]),
    outcomes: z.array(z.string()).default([]),
  }),
});

const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.{md,mdx}' }),
  schema: baseContentSchema.extend({
    researchArea: z.string(),
    confidence: z.enum(['low', 'medium', 'high']).default('medium'),
    sources: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: projectStatus,
    featured: z.boolean().default(false),
    repository: z.string().url().optional(),
    demo: z.string().url().optional(),
    techStack: z.array(z.string()).default([]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    category: z.enum(['web', 'ai', 'data', 'education', 'islamic-tech', 'tooling', 'research']),
    screenshots: z.array(z.string()).default([]),
    architectureDiagram: z.string().optional(),
    relatedArticles: z.array(reference('blog')).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: baseContentSchema.extend({
    noteType: z.enum(['permanent', 'concept', 'research', 'reference', 'moc', 'topic-hub']),
    connections: z.array(z.string()).default([]),
    aliases: z.array(z.string()).default([]),
  }),
});

const labs = defineCollection({
  loader: glob({ base: './src/content/labs', pattern: '**/*.{md,mdx}' }),
  schema: baseContentSchema.extend({
    labType: z.enum(['ai-experiment', 'llm-demo', 'visualization', 'prototype', 'learning-tool', 'data-exploration']),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    embedComponent: z.string().optional(),
  }),
});

const bookmarks = defineCollection({
  loader: glob({ base: './src/content/bookmarks', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    source: z.string().optional(),
    status: z.enum(['unread', 'reading', 'saved', 'archived']).default('saved'),
    draft: z.boolean().default(false),
  }),
});

const reading = defineCollection({
  loader: glob({ base: './src/content/reading', pattern: '**/*.{md,mdx}' }),
  schema: baseContentSchema.extend({
    author: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    rating: z.number().min(1).max(5).optional(),
  }),
});

const changelog = defineCollection({
  loader: glob({ base: './src/content/changelog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    version: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
  tutorials,
  research,
  projects,
  notes,
  labs,
  bookmarks,
  reading,
  changelog,
};
