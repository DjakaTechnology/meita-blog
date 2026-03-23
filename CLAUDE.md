# Meita Blog

Public repository: git@github.com:DjakaTechnology/meita-blog.git

This is the blog for meita.ai, served at `meita.ai/blog` via Vercel rewrites from the main metadata-editor SvelteKit app.

## Important

- This repository is **public**. Never commit secrets, API keys, `.env` files, or credentials.
- R2 credentials and other secrets go in Vercel environment variables only.

## Tech Stack

- Next.js 15 (App Router), fully static output
- Tailwind CSS 4 (CSS-based @theme config)
- Markdown rendering via unified/remark/rehype
- Images hosted on Cloudflare R2 (uploaded at build time)
- Deployed on Vercel

## Design System

Matches the metadata-editor project (meita.ai main site):
- OKLCH color palette, light mode only
- Inter font family
- 680px max-width article pages (Medium-style)

## Content

- Markdown articles in `content/posts/`
- Author data in `content/authors.json`
- Images in `content/images/` (uploaded to R2 at build time)
- Image manifest at `content/.image-manifest.json` (committed to git for caching)
