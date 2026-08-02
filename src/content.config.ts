import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/notes',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string().trim().min(1),
    date: z.coerce.date(),
    summary: z.string().trim().min(1).optional(),
  }),
});

export const collections = { notes };
