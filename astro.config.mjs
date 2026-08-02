import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import gravatarSync from './scripts/gravatar-integration.mjs';
import rehypeMermaidClient from './scripts/rehype-mermaid-client.mjs';
import remarkContentRules from './scripts/remark-content-rules.mjs';

export default defineConfig({
  site: 'https://guquan2002.top',
  output: 'static',
  trailingSlash: 'always',
  integrations: [gravatarSync(), react(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkContentRules],
      rehypePlugins: [
        [rehypeKatex, { output: 'htmlAndMathml' }],
        rehypeMermaidClient,
      ],
      remarkRehype: {
        footnoteLabel: '脚注',
        footnoteBackLabel: '返回正文',
      },
    }),
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
