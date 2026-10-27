// @ts-check
import { defineConfig } from 'astro/config';

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

import { unified } from '@astrojs/markdown-remark';

import rehypeSlug from 'rehype-slug';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';

function computeFileMtimes(base, prefix) {
  const map = {};
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(md|mdx)$/.test(entry.name)) {
        map[prefix + relative(base, full).replace(/\\/g, '/')] = statSync(full).mtime.toISOString();
      }
    }
  };
  walk(base);
  return map;
}

const noteMtimes = computeFileMtimes('src/content/notes', 'src/content/notes/');

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-dev-runtime',
        'react/jsx-runtime',
        'react-dom/server',
        'react-dom/server.edge'
      ]
    },
    define: {
      'import.meta.env.NOTE_MTIMES': JSON.stringify(noteMtimes)
    }
  },

  markdown: {
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            content: { type: 'text', value: '#' },
            properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 }
          }
        ]
      ]
    })
  },

  integrations: [mdx(), react()],
  adapter: cloudflare()
});
