# Meita Blog — Design Spec

## Overview

A statically generated blog for meita.ai, deployed as a separate Next.js project and served at `meita.ai/blog` via Vercel rewrites. Content is authored in markdown, images are hosted on Cloudflare R2, and the design system matches the existing metadata-editor application.

## Tech Stack

- **Framework**: Next.js 15 (App Router), fully static output (`output: 'export'` with `generateStaticParams` on all dynamic routes)
- **Styling**: Tailwind CSS 4 (CSS-based `@theme` configuration, no JS config file)
- **Markdown**: `unified` + `remark` + `rehype` pipeline for plain markdown rendering, `gray-matter` for frontmatter parsing
- **Search**: Fuse.js (client-side, index baked into static JSON at build time)
- **Image hosting**: Cloudflare R2 (S3-compatible, via `@aws-sdk/client-s3`)
- **Deployment**: Vercel (static)

## Project Structure

```
meita-blog/
├── content/
│   ├── posts/                    # Markdown articles (*.md)
│   ├── authors.json              # Canonical author data (id, name, avatar, bio)
│   └── images/                   # Images (uploaded to R2 at build time)
│       ├── [article-slug]/
│       │   └── *.webp
│       └── avatars/
│           └── *.webp
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (Inter font, light mode only)
│   │   ├── globals.css           # Tailwind @theme + OKLCH design tokens
│   │   ├── sitemap.ts            # Static sitemap generation
│   │   ├── not-found.tsx         # Custom 404 page
│   │   └── blog/
│   │       ├── page.tsx          # Blog list (page 1)
│   │       ├── page/
│   │       │   └── [page]/
│   │       │       └── page.tsx  # Paginated blog list
│   │       ├── [slug]/
│   │       │   └── page.tsx      # Article page (680px max-width)
│   │       ├── category/
│   │       │   └── [category]/
│   │       │       ├── page.tsx  # Category filtered list (page 1)
│   │       │       └── page/
│   │       │           └── [page]/
│   │       │               └── page.tsx  # Paginated category list
│   │       ├── author/
│   │       │   └── [author]/
│   │       │       ├── page.tsx  # Author profile (page 1)
│   │       │       └── page/
│   │       │           └── [page]/
│   │       │               └── page.tsx  # Paginated author posts
│   │       └── rss.xml/
│   │           └── route.ts      # RSS feed (static GET handler)
│   ├── lib/
│   │   ├── markdown.ts           # Parse markdown + frontmatter, remark/rehype pipeline
│   │   ├── r2.ts                 # R2 URL rewriting using manifest
│   │   ├── authors.ts            # Load and query author data
│   │   └── search.ts             # Fuse.js search index generation
│   └── components/
│       ├── Header.tsx            # Matching metadata-editor header
│       ├── Footer.tsx            # Matching metadata-editor footer
│       ├── PostCard.tsx          # Blog list card
│       ├── PostList.tsx          # Client component: search + filter + post grid
│       ├── Pagination.tsx
│       ├── SearchBar.tsx         # Client component
│       ├── CategoryFilter.tsx    # Client component
│       └── TableExpander.tsx     # Responsive table expand dialog
├── scripts/
│   ├── upload-images.mjs        # Build-time R2 upload with caching
│   └── generate-search-index.mjs # Build-time Fuse.js index generation
├── content/.image-manifest.json  # Git-committed manifest for R2 cache
├── next.config.js
└── package.json
```

## Content Model

### Author Data (`content/authors.json`)

Canonical author data stored in a single file, referenced by ID in post frontmatter:

```json
[
  {
    "id": "john-doe",
    "name": "John Doe",
    "avatar": "john-doe.webp",
    "bio": "Short author bio"
  }
]
```

- `id` is the URL slug used in `/blog/author/[author]`
- `avatar` references a file in `content/images/avatars/`
- Single source of truth — updating an author's bio updates it everywhere

### Frontmatter Schema

```yaml
---
title: "Article Title"
description: "SEO description for meta tags and Open Graph"
date: "2026-02-15T10:00:00+07:00"
draft: false
categories:
  - "Keyword Strategy"
author: "john-doe"
image: "cover-image.webp"
---
```

- `draft: true` articles are excluded from the build
- `author` is a string ID referencing `authors.json`
- `image` is relative to the article's image directory; rewritten to R2 URL at build
- In-content image references (`![alt](images/...)`) rewritten to R2 URLs via a remark plugin
- Cross-links between articles use format `[text](./other-article-slug)` and are rewritten to `/blog/other-article-slug` via a remark plugin. Build fails if the target article does not exist.
- Posts sorted newest-first by `date`

## Image Pipeline & R2 Integration

### Build-time flow

1. `scripts/upload-images.mjs` runs before `next build`
2. Scans `content/images/` for all files
3. Computes content hash (SHA-256) for each file
4. Checks against `content/.image-manifest.json` (committed to git):
   - **Skip** if same path + same hash (unchanged image)
   - **Upload** if hash differs (changed) or path is new
   - **Remove entry** if local file was deleted
5. Uploads to R2 at path: `blog/images/[slug]/[hash]-[filename].webp`
6. Updates manifest with new/changed entries
7. During markdown parsing, remark plugin rewrites image references using the manifest

### Manifest format

```json
{
  "images/article-slug/image.webp": {
    "r2Url": "https://assets.meita.ai/blog/images/article-slug/abc123-image.webp",
    "contentHash": "sha256-abc123..."
  }
}
```

Note: Since this is committed to git, content writers working on different articles will modify different keys, minimizing merge conflicts. In practice, only one manifest entry changes per image edit.

### R2 Configuration

- Bucket served via custom domain (e.g., `assets.meita.ai`)
- Environment variables: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- Uses `@aws-sdk/client-s3` (R2 is S3-compatible)

### Build command

```json
{
  "build": "node scripts/upload-images.mjs && node scripts/generate-search-index.mjs && next build"
}
```

## Search & Filtering Interaction Model

Search and category filtering are **client-side** and operate on a **pre-built static JSON index** containing all posts' metadata (title, description, categories, author, date, slug, image URL). This index is generated at build time by `scripts/generate-search-index.mjs` and placed in `public/search-index.json`.

### Interaction flow

1. **Default state** (`/blog` or `/blog/page/[n]`): Server-rendered static pages with 10 posts each, pagination links at bottom.
2. **User starts typing in search** or **clicks a category pill**: A client component (`PostList`) takes over, loads the full `search-index.json` (lazy-loaded on first interaction), and displays filtered/searched results **without pagination** (all matching results shown, since the full dataset is small — tens to low hundreds of posts).
3. **User clears search/filter**: Returns to the server-rendered paginated view.

Category pills on the blog list page filter **client-side** in-place. The static `/blog/category/[category]` pages exist for **SEO and direct linking** (e.g., sharing a link to all "Keyword Strategy" articles). Both paths reach the same content.

### Index size

With ~50-100 posts, the search index JSON is estimated at 30-50 KB (title + description + categories + slug + image URL per post). This is acceptable for client-side loading.

## Pages & Features

All pages are **statically generated** at build time. No SSR, no ISR, no server functions.

### Blog List (`/blog` and `/blog/page/[n]`)

- Grid of PostCards (rounded-xl, border, hover shadow, image h-48)
- Search bar at top (Fuse.js, client-side, lazy-loads `search-index.json` on first interaction)
- Category filter pills below search (client-side filtering)
- 10 posts per page in default (non-search) mode
- Pagination component at bottom (hidden during active search/filter)
- Sorted newest-first

### Article Page (`/blog/[slug]`)

- 680px max-width content area (Medium-style)
- Hero image at top
- Title, author (avatar + name), date, estimated reading time below hero
- Rendered markdown with typography matching metadata-editor:
  - h1: 2xl bold, h2: 1.5rem 700, h3: 1.25rem 600
  - Body: 1.125rem, line-height 1.8
  - Blockquotes: italic, 4px primary left border, muted bg
  - Code: font-mono, destructive color on muted bg
  - Tables: horizontal scroll on mobile, TableExpander for full-screen view
- "Related posts" section at bottom (same category, max 3)

### Category Page (`/blog/category/[category]` and `.../page/[n]`)

- Same layout as blog list, filtered to one category
- Category name as page title
- 10 posts per page with pagination

### Author Page (`/blog/author/[author]` and `.../page/[n]`)

- Author avatar, name, bio at top (from `authors.json`)
- Grid of their posts below
- 10 posts per page with pagination

### RSS Feed (`/blog/rss.xml`)

- Static GET route handler generating RSS 2.0 XML at build time
- Includes title, description, date, link for each published post

### Sitemap (`/sitemap.xml`)

- Next.js built-in `sitemap.ts`
- Entries for all blog posts, category pages, author pages

### 404 Page

- Custom `not-found.tsx` styled with the blog design system
- "Back to blog" link

## SEO & Metadata

Each page exports Next.js `metadata` (or `generateMetadata` for dynamic routes):

- **Title**: `{post.title} | Meita Blog` (or `Meita Blog` for list pages)
- **Description**: From frontmatter `description`
- **Open Graph**: `og:title`, `og:description`, `og:image` (hero image R2 URL), `og:type: article`
- **Twitter Card**: `twitter:card: summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
- **Canonical URL**: `https://meita.ai/blog/[slug]` (the proxied URL, not the direct Vercel URL)
- **Article metadata**: `article:published_time`, `article:author`, `article:tag` (categories)

## Design System

Light mode only — no dark mode toggle.

### Colors (OKLCH)

| Token | Value |
|---|---|
| Background | `oklch(0.98 0.005 90)` — warm paper white |
| Foreground | `oklch(0.20 0.04 265)` — dark navy |
| Primary | `oklch(0.55 0.18 260)` — wintry blue |
| Secondary | `oklch(0.65 0.12 185)` — cyan/teal |
| Muted | `oklch(0.96 0.007 248)` — light accent |
| Destructive | `oklch(0.58 0.24 27)` — red (inline code) |
| Border | `oklch(0.90 0.01 260)` |

### Typography

- Font: Inter (400, 500, 600, 700) from Google Fonts
- Paper texture background via SVG fractal noise (3% opacity)

### Components

- **Header**: Sticky, `bg-background/80` backdrop-blur, logo, nav links (Pricing, Token, Download, Tools dropdown, Login)
- **Footer**: Dark `bg-zinc-900`, 4-column grid (Branding, Product, Resources, Social)
- **PostCard**: Rounded-xl, border, hover shadow, image preview, date/author/title/excerpt, "Read more" arrow
- **Buttons**: Rounded-md, hover scale-down (0.97), active scale (0.95)
- **Radius**: 0.5rem base

## Deployment & Routing

### meita-blog Vercel project

- Separate Vercel project, static output (`output: 'export'`)
- `basePath: '/blog'` in `next.config.js` — all internal links, asset paths, and the search index JSON are resolved relative to this base path
- R2 credentials as Vercel environment variables
- Rebuilds on push to main touching `content/` or `src/`

### metadata-editor rewrite

Add to existing `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/blog/:path*", "destination": "https://meita-blog.vercel.app/blog/:path*" }
  ]
}
```

Users visit `meita.ai/blog/...` → Vercel proxies transparently to the blog deployment.
