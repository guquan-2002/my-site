import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import rehypeMermaidBlocks from './build/markdown/mermaid-blocks.mjs';
import remarkContentRules from './build/markdown/content-rules.mjs';
import { siteConfig } from './site.config.mjs';

export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkContentRules],
      rehypePlugins: [
        [rehypeKatex, { output: 'htmlAndMathml' }],
        rehypeMermaidBlocks,
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
