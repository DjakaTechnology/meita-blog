# Meita Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a statically generated Next.js blog for meita.ai with markdown content, Cloudflare R2 image hosting, search, categories, author pages, RSS, and sitemap.

**Architecture:** Next.js 15 App Router with `output: 'export'` for fully static generation. Markdown parsed at build time via unified/remark/rehype. Images uploaded to Cloudflare R2 via a build script with manifest-based caching. Served at `meita.ai/blog` via Vercel rewrites.

**Tech Stack:** Next.js 15, Tailwind CSS 4, unified/remark/rehype, gray-matter, Fuse.js, @aws-sdk/client-s3

**Spec:** `docs/superpowers/specs/2026-03-23-meita-blog-design.md`

**Public repo:** git@github.com:DjakaTechnology/meita-blog.git — never commit secrets.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:/Users/DTechnology/Project/meita-blog
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --skip-install
```

Select defaults. This creates the base scaffold.

- [ ] **Step 2: Install dependencies**

```bash
npm install unified remark-parse remark-rehype rehype-stringify rehype-raw gray-matter fuse.js reading-time @aws-sdk/client-s3
npm install -D @types/node
```

- [ ] **Step 3: Configure next.config.js for static export**

Replace `next.config.js` (or `.ts`/`.mjs` — whatever create-next-app generated) with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/blog',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Set up .gitignore**

Ensure `.gitignore` includes:

```
node_modules/
.next/
out/
.env
.env.local
.env.production
```

- [ ] **Step 5: Create .env.example**

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

- [ ] **Step 6: Set up globals.css with design system**

Replace `src/app/globals.css` with the OKLCH design tokens ported from metadata-editor. Light mode only (no `.dark` block needed since blog is always light):

```css
@import "tailwindcss";

:root {
  --radius: 0.5rem;
  --background: oklch(0.98 0.005 90);
  --foreground: oklch(0.20 0.04 265);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.20 0.04 265);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.20 0.04 265);
  --primary: oklch(0.55 0.18 260);
  --primary-foreground: oklch(0.98 0.003 248);
  --secondary: oklch(0.65 0.12 185);
  --secondary-foreground: oklch(0.98 0.003 248);
  --muted: oklch(0.96 0.007 248);
  --muted-foreground: oklch(0.55 0.04 257);
  --accent: oklch(0.96 0.007 248);
  --accent-foreground: oklch(0.20 0.04 265);
  --destructive: oklch(0.58 0.24 27);
  --destructive-foreground: oklch(0.98 0.003 248);
  --border: oklch(0.92 0.013 256);
  --input: oklch(0.92 0.013 256);
  --ring: oklch(0.55 0.18 260);
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --font-sans: 'Inter', system-ui, sans-serif;
}

@layer base {
  * {
    @apply border-border;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 256px 256px;
  }
}
```

- [ ] **Step 7: Set up root layout.tsx**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Meita Blog",
    template: "%s | Meita Blog",
  },
  description: "Tips, guides, and insights on AI metadata keywording for stock photography.",
  metadataBase: new URL("https://meita.ai"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Verify the app builds**

```bash
npm run build
```

Expected: Build succeeds, static export to `out/` directory.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind and design system"
```

---

### Task 2: Content Infrastructure

**Files:**
- Create: `content/authors.json`
- Create: `content/.image-manifest.json`
- Create: `src/lib/authors.ts`
- Create: `src/lib/markdown.ts`
- Create: `src/lib/types.ts`

- [ ] **Step 1: Create types**

Create `src/lib/types.ts`:

```ts
export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  draft: boolean;
  categories: string[];
  author: string;
  image: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  authorId: string;
  image: string;
  readingTime: string;
  content: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  authorId: string;
  image: string;
  readingTime: string;
}
```

- [ ] **Step 2: Create authors.json with initial data**

Create `content/authors.json`:

```json
[
  {
    "id": "meita",
    "name": "Meita Team",
    "avatar": "meita.webp",
    "bio": "The Meita.ai team — building AI-powered metadata tools for stock photographers."
  }
]
```

- [ ] **Step 3: Create authors.ts**

Create `src/lib/authors.ts`:

```ts
import fs from "fs";
import path from "path";
import type { Author } from "./types";
import authorsData from "../../content/authors.json";

const MANIFEST_PATH = path.join(process.cwd(), "content/.image-manifest.json");

function loadManifest(): Record<string, { r2Url: string; contentHash: string }> {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function resolveAvatarUrl(avatar: string): string {
  if (!avatar || avatar.startsWith("http")) return avatar;
  const manifest = loadManifest();
  const key = `images/avatars/${avatar}`;
  const entry = manifest[key];
  return entry ? entry.r2Url : avatar;
}

const authors: Author[] = authorsData;

export function getAuthor(id: string): (Author & { avatarUrl: string }) | undefined {
  const author = authors.find((a) => a.id === id);
  if (!author) return undefined;
  return { ...author, avatarUrl: resolveAvatarUrl(author.avatar) };
}

export function getAllAuthors(): Author[] {
  return authors;
}

export function getAuthorOrThrow(id: string): Author & { avatarUrl: string } {
  const author = getAuthor(id);
  if (!author) {
    throw new Error(`Author not found: ${id}`);
  }
  return author;
}
```

- [ ] **Step 4: Create markdown.ts**

Create `src/lib/markdown.ts`:

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";
import type { Post, PostMeta, PostFrontmatter } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const MANIFEST_PATH = path.join(process.cwd(), "content/.image-manifest.json");

function loadManifest(): Record<string, { r2Url: string; contentHash: string }> {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function rewriteImageUrls(html: string, slug: string): string {
  const manifest = loadManifest();
  // Rewrite relative image paths to R2 URLs
  return html.replace(
    /src="(images\/[^"]+)"/g,
    (match, relativePath) => {
      const manifestKey = `images/${slug}/${path.basename(relativePath)}`;
      // Try multiple key formats
      const entry = manifest[relativePath] || manifest[manifestKey];
      if (entry) {
        return `src="${entry.r2Url}"`;
      }
      return match;
    }
  );
}

function rewriteCrossLinks(html: string): string {
  // Rewrite ./other-article-slug links to /blog/other-article-slug
  return html.replace(
    /href="\.\/([^"]+)"/g,
    (_, slug) => `href="/blog/${slug}"`
  );
}

async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);
  return String(result);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  if (frontmatter.draft) return undefined;

  let html = await renderMarkdown(content);
  html = rewriteImageUrls(html, slug);
  html = rewriteCrossLinks(html);

  const stats = readingTime(content);
  const manifest = loadManifest();

  // Resolve hero image
  let heroImage = frontmatter.image || "";
  if (heroImage && !heroImage.startsWith("http")) {
    const heroKey = `images/${slug}/${heroImage}`;
    const entry = manifest[heroKey];
    if (entry) heroImage = entry.r2Url;
  }

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    categories: frontmatter.categories || [],
    authorId: frontmatter.author,
    image: heroImage,
    readingTime: stats.text,
    content: html,
  };
}

export function getAllPostMeta(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const manifest = loadManifest();

  const posts: PostMeta[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as PostFrontmatter;

    if (frontmatter.draft) continue;

    const slug = file.replace(/\.md$/, "");
    const stats = readingTime(content);

    let heroImage = frontmatter.image || "";
    if (heroImage && !heroImage.startsWith("http")) {
      const heroKey = `images/${slug}/${heroImage}`;
      const entry = manifest[heroKey];
      if (entry) heroImage = entry.r2Url;
    }

    posts.push({
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      categories: frontmatter.categories || [],
      authorId: frontmatter.author,
      image: heroImage,
      readingTime: stats.text,
    });
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllCategories(): string[] {
  const posts = getAllPostMeta();
  const categories = new Set<string>();
  for (const post of posts) {
    for (const cat of post.categories) {
      categories.add(cat);
    }
  }
  return Array.from(categories).sort();
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
```

- [ ] **Step 5: Create empty image manifest**

Create `content/.image-manifest.json`:

```json
{}
```

- [ ] **Step 6: Create content/posts directory**

```bash
mkdir -p content/posts content/images/avatars
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 8: Commit**

```bash
git add content/authors.json content/.image-manifest.json src/lib/types.ts src/lib/authors.ts src/lib/markdown.ts
git commit -m "feat: add content infrastructure (markdown parser, authors, types)"
```

---

### Task 3: Blog List Page & PostCard Component

**Files:**
- Create: `src/components/PostCard.tsx`
- Create: `src/components/Pagination.tsx`
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/layout.tsx`
- Create: `src/app/blog/page/[page]/page.tsx`
- Create: `src/lib/pagination.ts`

- [ ] **Step 1: Create pagination helper**

Create `src/lib/pagination.ts`:

```ts
import type { PostMeta } from "./types";

export const POSTS_PER_PAGE = 10;

export function paginatePosts(
  posts: PostMeta[],
  page: number
): { posts: PostMeta[]; totalPages: number } {
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  return {
    posts: posts.slice(start, start + POSTS_PER_PAGE),
    totalPages,
  };
}
```

- [ ] **Step 2: Create PostCard component**

Create `src/components/PostCard.tsx`:

```tsx
import Link from "next/link";
import type { PostMeta } from "@/lib/types";
import type { Author } from "@/lib/types";

interface PostCardProps {
  post: PostMeta;
  authorName?: string;
}

export default function PostCard({ post, authorName }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 no-underline"
    >
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 md:h-56 object-cover"
        />
      )}
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {authorName && (
            <span className="text-sm text-muted-foreground">
              by {authorName}
            </span>
          )}
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
          {post.title}
        </h2>
        {post.description && (
          <p className="text-muted-foreground leading-relaxed mb-4">
            {post.description}
          </p>
        )}
        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
          Read more
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Create Pagination component**

Create `src/components/Pagination.tsx`:

```tsx
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "/blog",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function getPageUrl(page: number): string {
    if (page === 1) return basePath;
    return `${basePath}/page/${page}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Previous
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
```

- [ ] **Step 4: Create blog layout**

Note: This layout imports Header and Footer from Task 4. Create placeholder components first, or complete Task 4 before this step.

Create `src/app/blog/layout.tsx`:

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Create blog list page (page 1)**

Create `src/app/blog/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import PostList from "@/components/PostList";

export const metadata: Metadata = {
  title: "Stock Photography AI Keywording Blog",
  description:
    "Tips, guides, and insights on AI metadata keywording for stock photography.",
  alternates: { canonical: "https://meita.ai/blog" },
  openGraph: {
    title: "Stock Photography AI Keywording Blog — Meita.ai",
    description:
      "Tips, guides, and insights on AI metadata keywording for stock photography.",
    type: "website",
    url: "https://meita.ai/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Photography AI Keywording Blog — Meita.ai",
    description:
      "Tips, guides, and insights on AI metadata keywording for stock photography.",
  },
};

export default function BlogPage() {
  const allPosts = getAllPostMeta();
  const categories = getAllCategories();
  const { posts, totalPages } = paginatePosts(allPosts, 1);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-sm text-muted-foreground">
          Latest insights and updates from our team
        </p>
      </div>

      <PostList
        initialPosts={posts}
        allCategories={categories}
        totalPages={totalPages}
        currentPage={1}
      />
    </div>
  );
}
```

- [ ] **Step 6: Create paginated blog list page**

Create `src/app/blog/page/[page]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostList from "@/components/PostList";

export function generateStaticParams() {
  const allPosts = getAllPostMeta();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  })).filter((p) => p.page !== "1"); // page 1 is /blog
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Blog — Page ${page}`,
    alternates: { canonical: `https://meita.ai/blog/page/${page}` },
  };
}

export default async function PaginatedBlogPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
  const allPosts = getAllPostMeta();
  const categories = getAllCategories();
  const { posts, totalPages } = paginatePosts(allPosts, page);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-sm text-muted-foreground">
          Latest insights and updates from our team
        </p>
      </div>

      <PostList
        initialPosts={posts}
        allCategories={categories}
        totalPages={totalPages}
        currentPage={page}
      />
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/PostCard.tsx src/components/Pagination.tsx src/app/blog/ src/lib/pagination.ts
git commit -m "feat: add blog list page with pagination and PostCard"
```

---

### Task 4: Header & Footer Components

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Footer.tsx`

- [ ] **Step 1: Create Header component**

Create `src/components/Header.tsx` — port from metadata-editor's Svelte Header. Simplified for the blog (no auth, no currency selector, no theme toggle, no i18n):

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex flex-row items-center justify-between px-4 py-2">
        <Link href="https://meita.ai" className="flex items-center">
          <img src="/blog/logo.svg" alt="Meita.ai logo" className="w-10 h-10" />
          <span className="text-lg font-bold -ml-2">Meita.ai</span>
        </Link>
        <nav className="md:flex flex-row gap-2 items-center justify-center hidden">
          <Link
            href="https://meita.ai/en-us/pricing"
            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="https://meita.ai/token"
            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            Token
          </Link>
          <Link
            href="https://meita.ai/download"
            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
          >
            Download
          </Link>
          <div className="relative group">
            <button className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors flex items-center gap-1">
              Tools
              <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50">
              <div className="flex flex-col rounded-lg border border-border bg-card shadow-lg py-1 min-w-[180px]">
                <Link href="https://meita.ai/remove-bg" className="text-left px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Remove BG
                </Link>
                <Link href="https://meita.ai/en-us/demo/" className="text-left px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Try Demo
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/blog"
            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors text-primary"
          >
            Blog
          </Link>
        </nav>
        <button
          className="md:hidden inline p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-2">
          <Link href="https://meita.ai/en-us/pricing" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link href="https://meita.ai/token" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Token</Link>
          <Link href="https://meita.ai/download" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Download</Link>
          <Link href="https://meita.ai/remove-bg" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Remove BG</Link>
          <Link href="/blog" className="px-4 py-2 text-sm rounded-md hover:bg-muted text-primary" onClick={() => setMenuOpen(false)}>Blog</Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create Footer component**

Create `src/components/Footer.tsx`:

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 py-8 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <Link href="https://meita.ai" className="flex items-center">
            <img src="/blog/logo.svg" alt="Meita.ai logo" className="w-14 h-14" />
            <span className="text-lg font-bold text-zinc-50 -ml-2">Meita</span>
          </Link>
          <p className="opacity-70 text-sm">
            AI-powered metadata keywording tool for stock photographers.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-zinc-50">Product</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="https://meita.ai/download" className="hover:text-zinc-50 transition-colors">Download</Link>
            <Link href="https://meita.ai/en-us/pricing" className="hover:text-zinc-50 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-zinc-50 transition-colors">Blog</Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-zinc-50">Resources</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="https://meita.ai/en-us/demo/" className="hover:text-zinc-50 transition-colors">Try Demo</Link>
            <Link href="https://meita.ai/en-us/ai-keywording-tool/" className="hover:text-zinc-50 transition-colors">AI Keywording Tool</Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-zinc-50">Social</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <a href="https://www.facebook.com/profile.php?id=61571478001198" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-50 transition-colors">Facebook Page</a>
            <a href="https://www.facebook.com/groups/meita.ai" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-50 transition-colors">Facebook Group</a>
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-zinc-700 text-center text-sm opacity-60">
        <p>&copy; {new Date().getFullYear()} Meita.ai. All rights reserved.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Add logo.svg to public folder**

Copy the Meita logo from metadata-editor into `public/logo.svg`. If the file is not available, create a placeholder:

```bash
cp "C:/Users/DTechnology/Project/metadata-editor/static/logo.svg" "C:/Users/DTechnology/Project/meita-blog/public/logo.svg" 2>/dev/null || echo "Copy logo manually"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx src/components/Footer.tsx public/logo.svg
git commit -m "feat: add Header and Footer components matching meita.ai design"
```

---

### Task 5: Article Page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `src/app/blog/blog-content.css`
- Create: `src/components/TableExpander.tsx`
- Create: `src/components/RelatedPosts.tsx`

- [ ] **Step 1: Create blog-content.css**

Create `src/app/blog/blog-content.css` — ported from metadata-editor's `blog.postcss`:

```css
/* Blog typography — uses theme CSS variables */
.blog-content {
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.blog-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.375;
  color: var(--foreground);
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
  font-family: var(--font-sans);
}

.blog-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.375;
  color: var(--foreground);
  margin-bottom: 0.75rem;
  margin-top: 2rem;
  font-family: var(--font-sans);
}

.blog-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.375;
  color: var(--foreground);
  margin-bottom: 0.5rem;
  margin-top: 1.5rem;
  font-family: var(--font-sans);
}

.blog-content h4 {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.375;
  color: var(--foreground);
  margin-bottom: 0.25rem;
  margin-top: 0.75rem;
  font-family: var(--font-sans);
}

.blog-content p {
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 1.25rem;
  color: var(--foreground);
}

.blog-content a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s;
}

.blog-content a:hover {
  color: oklch(0.55 0.18 260 / 0.8);
  text-decoration: underline;
}

.blog-content ul,
.blog-content ol {
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 1.25rem;
  margin-left: 1.5rem;
  color: var(--foreground);
}

.blog-content ul { list-style-type: disc; }
.blog-content ol { list-style-type: decimal; }

.blog-content li {
  margin-bottom: 0.5rem;
}

.blog-content strong,
.blog-content b {
  font-weight: 600;
  color: var(--foreground);
}

.blog-content blockquote {
  font-size: 1rem;
  font-style: italic;
  line-height: 1.625;
  color: var(--muted-foreground);
  background: var(--muted);
  margin: 1rem 0;
  padding: 0.75rem 1.25rem;
  border-left: 4px solid var(--primary);
}

.blog-content code {
  font-size: 0.875rem;
  font-family: monospace;
  background: var(--muted);
  color: var(--destructive);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.blog-content pre {
  font-size: 0.875rem;
  font-family: monospace;
  line-height: 1.625;
  background: var(--muted);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.blog-content img {
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
  margin: 2rem 0;
}

.blog-content figure {
  margin: 2rem 0;
}

.blog-content figure img {
  margin: 0;
}

.blog-content figcaption {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  text-align: center;
  margin-top: 0.5rem;
  font-style: italic;
}

.blog-content table {
  font-size: 0.875rem;
  border-collapse: collapse;
  margin: 1.5rem -2rem;
  width: calc(100% + 4rem);
  overflow-x: auto;
  display: block;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}

.blog-content th,
.blog-content td {
  text-align: left;
  border: 1px solid var(--border);
  padding: 0.75rem 1.25rem;
  white-space: nowrap;
  vertical-align: top;
}

.blog-content th {
  font-weight: 600;
  background: var(--muted);
  vertical-align: middle;
}

.blog-content td:last-child,
.blog-content th:last-child {
  white-space: normal;
  min-width: 180px;
}

.blog-content td:first-child {
  font-weight: 600;
}

.blog-content hr {
  margin: 1rem 0;
  border: none;
  background: var(--border);
  height: 1px;
}

@media (max-width: 768px) {
  .blog-content h1 { font-size: 1.25rem; }
  .blog-content h2 { font-size: 1.125rem; }
  .blog-content h3 { font-size: 1rem; }
  .blog-content p,
  .blog-content ul,
  .blog-content ol { font-size: 0.875rem; }
  .blog-content blockquote { font-size: 0.875rem; }
}
```

- [ ] **Step 2: Create TableExpander component**

Create `src/components/TableExpander.tsx`:

```tsx
"use client";

import { useEffect, useState, useRef } from "react";

export default function TableExpander() {
  const [open, setOpen] = useState(false);
  const [tableHtml, setTableHtml] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const blogContent = document.querySelector(".blog-content");
    if (!blogContent) return;

    const tables = blogContent.querySelectorAll("table");
    tables.forEach((table) => {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";

      const btn = document.createElement("button");
      btn.className = "table-expand-btn";
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg> Expand`;
      btn.onclick = () => {
        const clone = table.cloneNode(true) as HTMLElement;
        clone.style.display = "table";
        clone.style.width = "100%";
        clone.style.margin = "0";
        setTableHtml(clone.outerHTML);
        setOpen(true);
      };

      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
      wrapper.appendChild(btn);
    });
  }, []);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  return (
    <>
      <style>{`
        .table-expand-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--muted-foreground);
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          padding: 0.35rem 0.625rem;
          cursor: pointer;
          margin-top: 0.5rem;
          margin-left: auto;
          width: fit-content;
          transition: color 0.15s, border-color 0.15s;
        }
        .table-expand-btn:hover {
          color: var(--foreground);
          border-color: var(--foreground);
        }
      `}</style>
      <dialog
        ref={dialogRef}
        className="fixed inset-0 w-[95vw] max-h-[80vh] overflow-auto rounded-lg border border-border bg-card p-6 backdrop:bg-black/50"
        onClick={(e) => { if (e.target === dialogRef.current) setOpen(false); }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Table View</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div
          className="blog-content overflow-auto"
          dangerouslySetInnerHTML={{ __html: tableHtml }}
        />
      </dialog>
    </>
  );
}
```

- [ ] **Step 3: Create RelatedPosts component**

Create `src/components/RelatedPosts.tsx`:

```tsx
import Link from "next/link";
import type { PostMeta } from "@/lib/types";

export default function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-lg border border-border p-4 hover:border-primary/40 hover:shadow-md transition-all no-underline"
          >
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create article page**

Create `src/app/blog/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getAllSlugs, getAllPostMeta } from "@/lib/markdown";
import { getAuthorOrThrow } from "@/lib/authors";
import TableExpander from "@/components/TableExpander";
import RelatedPosts from "@/components/RelatedPosts";
import Link from "next/link";
import "@/app/blog/blog-content.css";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://meita.ai/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://meita.ai/blog/${post.slug}`,
      publishedTime: post.date,
      tags: post.categories,
      ...(post.image && { images: [post.image] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.image && { images: [post.image] }),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const author = getAuthorOrThrow(post.authorId);

  // Related posts: same category, exclude current, max 3
  const allPosts = getAllPostMeta();
  const related = allPosts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        p.categories.some((c) => post.categories.includes(c))
    )
    .slice(0, 3);

  return (
    <article className="max-w-[680px] mx-auto px-4 py-8">
      <div className="flex flex-col pt-4 pb-6 border-b border-border mb-6">
        <div className="mb-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            <svg
              className="w-3.5 h-3.5 mr-1.5 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            All Articles
          </Link>
        </div>

        <h1
          className="text-2xl md:text-3xl font-bold leading-snug text-foreground mb-3"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-sm">
          {author.avatar && (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-6 h-6 object-cover rounded-full"
            />
          )}
          <span className="font-medium text-foreground">{author.name}</span>
          <span className="text-muted-foreground">&middot;</span>
          <time dateTime={post.date} className="text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-muted-foreground">{post.readingTime}</span>
        </div>
      </div>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full rounded-lg mb-8"
        />
      )}

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <TableExpander />

      <RelatedPosts posts={related} />
    </article>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/blog/blog-content.css src/app/blog/\[slug\]/ src/components/TableExpander.tsx src/components/RelatedPosts.tsx
git commit -m "feat: add article page with typography, table expander, and related posts"
```

---

### Task 6: Search & Category Filter (Client-Side)

**Files:**
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/CategoryFilter.tsx`
- Create: `src/components/PostList.tsx`
- Create: `scripts/generate-search-index.mjs`

- [ ] **Step 1: Create SearchBar component**

Create `src/components/SearchBar.tsx`:

```tsx
"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search articles..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
```

- [ ] **Step 2: Create CategoryFilter component**

Create `src/components/CategoryFilter.tsx`:

```tsx
"use client";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          selected === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat === selected ? null : cat)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            selected === cat
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create PostList client component**

Create `src/components/PostList.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import type { PostMeta } from "@/lib/types";
import PostCard from "./PostCard";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";

interface PostListProps {
  initialPosts: PostMeta[];
  allCategories: string[];
  totalPages: number;
  currentPage: number;
  basePath?: string;
}

interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  authorId: string;
  image: string;
  readingTime: string;
}

export default function PostList({
  initialPosts,
  allCategories,
  totalPages,
  currentPage,
  basePath = "/blog",
}: PostListProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PostMeta[] | null>(null);
  const [allPosts, setAllPosts] = useState<SearchIndexEntry[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchIndexEntry> | null>(null);

  const isFiltering = query.length > 0 || selectedCategory !== null;

  // Lazy-load search index on first interaction
  const loadSearchIndex = useCallback(async () => {
    if (allPosts) return;
    try {
      const res = await fetch("/blog/search-index.json");
      const data: SearchIndexEntry[] = await res.json();
      setAllPosts(data);
      setFuse(
        new Fuse(data, {
          keys: ["title", "description", "categories"],
          threshold: 0.3,
        })
      );
    } catch (err) {
      console.error("Failed to load search index:", err);
    }
  }, [allPosts]);

  useEffect(() => {
    if (!isFiltering || allPosts) return;
    loadSearchIndex();
  }, [isFiltering, allPosts, loadSearchIndex]);

  useEffect(() => {
    if (!allPosts) return;

    let results = allPosts;

    if (query && fuse) {
      results = fuse.search(query).map((r) => r.item);
    }

    if (selectedCategory) {
      results = results.filter((p) =>
        p.categories.includes(selectedCategory)
      );
    }

    setSearchResults(results as PostMeta[]);
  }, [query, selectedCategory, allPosts, fuse]);

  const displayPosts = isFiltering ? (searchResults || []) : initialPosts;

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4">
        <SearchBar
          value={query}
          onChange={(v) => {
            setQuery(v);
            if (v.length > 0) loadSearchIndex();
          }}
        />
        <CategoryFilter
          categories={allCategories}
          selected={selectedCategory}
          onSelect={(cat) => {
            setSelectedCategory(cat);
            if (cat) loadSearchIndex();
          }}
        />
      </div>

      {displayPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {displayPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {!isFiltering && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create search index generation script**

Create `scripts/generate-search-index.mjs`:

```js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUTPUT_PATH = path.join(process.cwd(), "public/search-index.json");
const MANIFEST_PATH = path.join(process.cwd(), "content/.image-manifest.json");

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, "[]");
    console.log("No posts found. Created empty search index.");
    return;
  }

  const manifest = loadManifest();
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    if (data.draft) continue;

    const slug = file.replace(/\.md$/, "");
    const stats = readingTime(content);

    let heroImage = data.image || "";
    if (heroImage && !heroImage.startsWith("http")) {
      const heroKey = `images/${slug}/${heroImage}`;
      const entry = manifest[heroKey];
      if (entry) heroImage = entry.r2Url;
    }

    posts.push({
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      categories: data.categories || [],
      authorId: data.author,
      image: heroImage,
      readingTime: stats.text,
    });
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(posts));
  console.log(`Search index generated: ${posts.length} posts`);
}

main();
```

- [ ] **Step 5: Add public/ to .gitignore for generated files**

Add to `.gitignore`:

```
public/search-index.json
```

- [ ] **Step 6: Commit**

```bash
git add src/components/SearchBar.tsx src/components/CategoryFilter.tsx src/components/PostList.tsx scripts/generate-search-index.mjs
git commit -m "feat: add client-side search and category filtering with Fuse.js"
```

---

### Task 7: Category & Author Pages

**Files:**
- Create: `src/app/blog/category/[category]/page.tsx`
- Create: `src/app/blog/category/[category]/page/[page]/page.tsx`
- Create: `src/app/blog/author/[author]/page.tsx`
- Create: `src/app/blog/author/[author]/page/[page]/page.tsx`

- [ ] **Step 1: Create category page (page 1)**

Create `src/app/blog/category/[category]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export function generateStaticParams() {
  return getAllCategories().map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  return {
    title: `${category} Articles`,
    description: `Blog posts about ${category}`,
    alternates: {
      canonical: `https://meita.ai/blog/category/${rawCategory}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const allPosts = getAllPostMeta().filter((p) =>
    p.categories.includes(category)
  );
  const { posts, totalPages } = paginatePosts(allPosts, 1);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">{category}</h1>
        <p className="text-sm text-muted-foreground">
          {allPosts.length} article{allPosts.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-6 w-full max-w-4xl">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={1}
        totalPages={totalPages}
        basePath={`/blog/category/${rawCategory}`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create paginated category page**

Create `src/app/blog/category/[category]/page/[page]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export function generateStaticParams() {
  const categories = getAllCategories();
  const params: { category: string; page: string }[] = [];

  for (const category of categories) {
    const posts = getAllPostMeta().filter((p) =>
      p.categories.includes(category)
    );
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    for (let i = 2; i <= totalPages; i++) {
      params.push({
        category: encodeURIComponent(category),
        page: String(i),
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}): Promise<Metadata> {
  const { category: rawCategory, page } = await params;
  const category = decodeURIComponent(rawCategory);
  return {
    title: `${category} — Page ${page}`,
    alternates: {
      canonical: `https://meita.ai/blog/category/${rawCategory}/page/${page}`,
    },
  };
}

export default async function PaginatedCategoryPage({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}) {
  const { category: rawCategory, page: pageStr } = await params;
  const category = decodeURIComponent(rawCategory);
  const page = parseInt(pageStr, 10);
  const allPosts = getAllPostMeta().filter((p) =>
    p.categories.includes(category)
  );
  const { posts, totalPages } = paginatePosts(allPosts, page);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">{category}</h1>
      </div>
      <div className="grid gap-6 w-full max-w-4xl">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/blog/category/${rawCategory}`}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create author page (page 1)**

Create `src/app/blog/author/[author]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostMeta } from "@/lib/markdown";
import { getAllAuthors, getAuthor } from "@/lib/authors";
import { paginatePosts } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ author: author.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author: authorId } = await params;
  const author = getAuthor(authorId);
  if (!author) return {};

  return {
    title: `Articles by ${author.name}`,
    description: author.bio,
    alternates: {
      canonical: `https://meita.ai/blog/author/${authorId}`,
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ author: string }>;
}) {
  const { author: authorId } = await params;
  const author = getAuthor(authorId);
  if (!author) notFound();

  const allPosts = getAllPostMeta().filter(
    (p) => p.authorId === authorId
  );
  const { posts, totalPages } = paginatePosts(allPosts, 1);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl flex flex-col items-center gap-3">
        {author.avatar && (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <h1 className="text-3xl font-bold">{author.name}</h1>
        <p className="text-sm text-muted-foreground">{author.bio}</p>
        <p className="text-sm text-muted-foreground">
          {allPosts.length} article{allPosts.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-6 w-full max-w-4xl">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={1}
        totalPages={totalPages}
        basePath={`/blog/author/${authorId}`}
      />
    </div>
  );
}
```

- [ ] **Step 4: Create paginated author page**

Create `src/app/blog/author/[author]/page/[page]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostMeta } from "@/lib/markdown";
import { getAllAuthors, getAuthor } from "@/lib/authors";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export function generateStaticParams() {
  const authors = getAllAuthors();
  const params: { author: string; page: string }[] = [];

  for (const author of authors) {
    const posts = getAllPostMeta().filter((p) => p.authorId === author.id);
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    for (let i = 2; i <= totalPages; i++) {
      params.push({ author: author.id, page: String(i) });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string; page: string }>;
}): Promise<Metadata> {
  const { author: authorId, page } = await params;
  const author = getAuthor(authorId);
  if (!author) return {};

  return {
    title: `Articles by ${author.name} — Page ${page}`,
  };
}

export default async function PaginatedAuthorPage({
  params,
}: {
  params: Promise<{ author: string; page: string }>;
}) {
  const { author: authorId, page: pageStr } = await params;
  const author = getAuthor(authorId);
  if (!author) notFound();

  const page = parseInt(pageStr, 10);
  const allPosts = getAllPostMeta().filter(
    (p) => p.authorId === authorId
  );
  const { posts, totalPages } = paginatePosts(allPosts, page);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold">{author.name}</h1>
      </div>
      <div className="grid gap-6 w-full max-w-4xl">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/blog/author/${authorId}`}
      />
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/blog/category/ src/app/blog/author/
git commit -m "feat: add category and author pages with pagination"
```

---

### Task 8: RSS Feed, Sitemap & 404

**Files:**
- Create: `scripts/generate-rss.mjs`
- Create: `scripts/generate-sitemap.mjs`
- Create: `src/app/not-found.tsx`

Note: RSS and sitemap are generated as static files during the build step (not route handlers) because `output: 'export'` has limited route handler support.

- [ ] **Step 1: Create RSS feed build script**

Create `scripts/generate-rss.mjs`:

```js
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUTPUT_PATH = path.join(process.cwd(), "public/rss.xml");

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log("No posts found. Skipping RSS generation.");
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data } = matter(raw);
    if (data.draft) continue;
    posts.push({
      slug: file.replace(/\.md$/, ""),
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      categories: data.categories || [],
    });
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = posts
    .map((post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>https://meita.ai/blog/${post.slug}</link>
      <guid>https://meita.ai/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.categories.map((c) => `<category>${c}</category>`).join("\n      ")}
    </item>`)
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Meita Blog</title>
    <description>Tips, guides, and insights on AI metadata keywording for stock photography.</description>
    <link>https://meita.ai/blog</link>
    <atom:link href="https://meita.ai/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, rss);
  console.log(`RSS feed generated: ${posts.length} posts`);
}

main();
```

- [ ] **Step 2: Create sitemap build script**

Create `scripts/generate-sitemap.mjs`:

```js
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const AUTHORS_PATH = path.join(process.cwd(), "content/authors.json");
const OUTPUT_PATH = path.join(process.cwd(), "public/sitemap.xml");

function main() {
  const urls = [];

  // Blog index
  urls.push({ loc: "https://meita.ai/blog", changefreq: "daily", priority: "1.0" });

  // Posts
  const categories = new Set();
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      if (data.draft) continue;
      const slug = file.replace(/\.md$/, "");
      urls.push({
        loc: `https://meita.ai/blog/${slug}`,
        lastmod: new Date(data.date).toISOString().split("T")[0],
        changefreq: "monthly",
        priority: "0.8",
      });
      (data.categories || []).forEach((c) => categories.add(c));
    }
  }

  // Categories
  for (const cat of categories) {
    urls.push({
      loc: `https://meita.ai/blog/category/${encodeURIComponent(cat)}`,
      changefreq: "weekly",
      priority: "0.5",
    });
  }

  // Authors
  if (fs.existsSync(AUTHORS_PATH)) {
    const authors = JSON.parse(fs.readFileSync(AUTHORS_PATH, "utf-8"));
    for (const author of authors) {
      urls.push({
        loc: `https://meita.ai/blog/author/${author.id}`,
        changefreq: "weekly",
        priority: "0.5",
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log(`Sitemap generated: ${urls.length} URLs`);
}

main();
```

- [ ] **Step 3: Remove sitemap.ts from app directory**

Delete `src/app/sitemap.ts` if it was created. The sitemap is now a static file generated by the build script.

- [ ] **Step 4: Update build command in package.json**

```json
{
  "build": "node scripts/upload-images.mjs && node scripts/generate-search-index.mjs && node scripts/generate-rss.mjs && node scripts/generate-sitemap.mjs && next build"
}
```

- [ ] **Step 5: Add generated files to .gitignore**

Add to `.gitignore`:

```
public/rss.xml
public/sitemap.xml
```

- [ ] **Step 6: Create 404 page**

Create `src/app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/blog"
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Back to Blog
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-rss.mjs scripts/generate-sitemap.mjs src/app/not-found.tsx
git commit -m "feat: add RSS feed, sitemap, and 404 page"
```

---

### Task 9: R2 Image Upload Script

**Files:**
- Create: `scripts/upload-images.mjs`

- [ ] **Step 1: Create the upload script**

Create `scripts/upload-images.mjs`:

```js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const IMAGES_DIR = path.join(process.cwd(), "content/images");
const MANIFEST_PATH = path.join(process.cwd(), "content/.image-manifest.json");

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g., https://assets.meita.ai

function getS3Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn("R2 credentials not set. Skipping image upload.");
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

function computeHashFromBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12);
}

function getAllImages() {
  if (!fs.existsSync(IMAGES_DIR)) return [];

  const images = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(webp|png|jpg|jpeg|gif|svg)$/i.test(entry.name)) {
        const relativePath = path.relative(
          path.join(process.cwd(), "content"),
          fullPath
        ).replace(/\\/g, "/");
        images.push({ fullPath, relativePath });
      }
    }
  }
  walk(IMAGES_DIR);
  return images;
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

async function main() {
  const client = getS3Client();
  const manifest = loadManifest();
  const images = getAllImages();

  if (images.length === 0) {
    console.log("No images found to upload.");
    return;
  }

  let uploaded = 0;
  let skipped = 0;
  let removed = 0;

  // Track which manifest keys are still valid
  const validKeys = new Set();

  for (const { fullPath, relativePath } of images) {
    const fileBuffer = fs.readFileSync(fullPath);
    const contentHash = computeHashFromBuffer(fileBuffer);
    const existing = manifest[relativePath];

    validKeys.add(relativePath);

    // Skip if hash matches
    if (existing && existing.contentHash === contentHash) {
      skipped++;
      continue;
    }

    if (!client) {
      // No R2 credentials — store local path as URL for dev
      manifest[relativePath] = {
        r2Url: `/${relativePath}`,
        contentHash,
      };
      skipped++;
      continue;
    }

    // Upload to R2
    const fileName = path.basename(fullPath);
    const dirName = path.dirname(relativePath).replace(/^images\//, "");
    const r2Key = `blog/images/${dirName}/${contentHash}-${fileName}`;

    try {
      await client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: r2Key,
          Body: fileBuffer,
          ContentType: getMimeType(fullPath),
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      manifest[relativePath] = {
        r2Url: `${R2_PUBLIC_URL}/${r2Key}`,
        contentHash,
      };
      uploaded++;
      console.log(`Uploaded: ${relativePath}`);
    } catch (err) {
      console.error(`Failed to upload ${relativePath}:`, err.message);
    }
  }

  // Remove manifest entries for deleted files
  for (const key of Object.keys(manifest)) {
    if (!validKeys.has(key)) {
      delete manifest[key];
      removed++;
    }
  }

  saveManifest(manifest);
  console.log(
    `Done: ${uploaded} uploaded, ${skipped} skipped, ${removed} removed`
  );
}

main().catch(console.error);
```

- [ ] **Step 2: Update package.json build script**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "build": "node scripts/upload-images.mjs && node scripts/generate-search-index.mjs && node scripts/generate-rss.mjs && node scripts/generate-sitemap.mjs && next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/upload-images.mjs
git commit -m "feat: add R2 image upload script with manifest caching"
```

---

### Task 10: Import Test Content & Verify Build

**Files:**
- Copy markdown files from test docs to `content/posts/`
- Copy images from test docs to `content/images/`

- [ ] **Step 1: Update frontmatter format in test articles**

The test articles use `categories: - "Category Name"` but no `author` or `image` field matching our schema. Write a small script or manually add the missing fields to each markdown file's frontmatter:

- Add `author: "meita"` to each article
- Add `image: ""` (or a valid image filename) to each article

First, copy the markdown files:

```bash
cp "C:/Users/DTechnology/Downloads/Raita test docs/meita/"*.md content/posts/
```

Then copy images:

```bash
cp -r "C:/Users/DTechnology/Downloads/Raita test docs/meita/images/"* content/images/
```

- [ ] **Step 2: Add `author` field to all markdown frontmatter**

For each `.md` file in `content/posts/`, add `author: "meita"` and `image: ""` before the closing `---` in the frontmatter. Use a Node.js script since sed is unreliable for this:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const dir = 'content/posts';
fs.readdirSync(dir).filter(f => f.endsWith('.md')).forEach(f => {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf-8');
  // Find the second --- (closing frontmatter delimiter)
  const first = content.indexOf('---');
  const second = content.indexOf('---', first + 3);
  if (second > 0) {
    const before = content.slice(0, second);
    const after = content.slice(second);
    // Only add if not already present
    if (!before.includes('author:')) {
      content = before + 'author: \"meita\"\nimage: \"\"\n' + after;
      fs.writeFileSync(fp, content);
      console.log('Updated:', f);
    }
  }
});
"
```

Verify a file looks correct after the transformation — the frontmatter should have `title`, `description`, `date`, `draft`, `categories`, `author`, `image`.

- [ ] **Step 3: Run the build**

```bash
npm run build
```

Expected: Build succeeds. Static pages generated in `out/` directory. Check that:
- `/blog/index.html` exists
- `/blog/[slug]/index.html` exists for each article
- `/blog/rss.xml` exists
- `/blog/sitemap.xml` exists

- [ ] **Step 4: Test locally**

```bash
npx serve out
```

Open `http://localhost:3000/blog` and verify:
- Blog list shows articles
- Clicking an article shows the content
- Search works
- Category pills filter
- Pagination appears if >10 posts
- RSS feed renders XML
- 404 page shows for invalid URLs

- [ ] **Step 5: Commit content**

```bash
git add content/posts/ content/images/
git commit -m "feat: import initial blog content (15 articles)"
```

---

### Task 11: Final Polish & Deploy Prep

**Files:**
- Modify: `next.config.js` (verify config)
- Update: `package.json` (verify scripts)

- [ ] **Step 1: Add Vercel rewrite to metadata-editor**

In the metadata-editor project's `vercel.json`, add (or note for the user to add):

```json
{
  "rewrites": [
    { "source": "/blog/:path*", "destination": "https://meita-blog.vercel.app/blog/:path*" }
  ]
}
```

This is done in the **other** project (metadata-editor), not this one.

- [ ] **Step 2: Verify all pages export static params**

Run build one more time and check for any SSR-only pages:

```bash
npm run build 2>&1 | grep -i "error\|warning"
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final polish for deployment"
```

- [ ] **Step 4: Push to remote**

```bash
git push -u origin master
```

Then deploy via Vercel dashboard by connecting the `DjakaTechnology/meita-blog` repository. Set environment variables for R2 in Vercel project settings.
