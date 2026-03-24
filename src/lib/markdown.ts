import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
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

function resolveImageUrl(
  relativePath: string,
  slug: string,
  manifest: Record<string, { r2Url: string; contentHash: string }>
): string {
  const manifestKey = `images/${slug}/${path.basename(relativePath)}`;
  const entry = manifest[relativePath] || manifest[manifestKey];
  if (entry) return entry.r2Url;
  return `/blog/content-images/${relativePath.replace(/^images\//, "")}`;
}

function extractFirstImage(markdown: string): string | null {
  const match = markdown.match(/!\[[^\]]*\]\((images\/[^)]+)\)/);
  return match ? match[1] : null;
}

function rewriteImageUrls(html: string, slug: string): string {
  const manifest = loadManifest();
  return html.replace(
    /src="(images\/[^"]+)"/g,
    (match, relativePath) => {
      const manifestKey = `images/${slug}/${path.basename(relativePath)}`;
      const entry = manifest[relativePath] || manifest[manifestKey];
      if (entry) {
        return `src="${entry.r2Url}"`;
      }
      // Fallback: serve from public/content-images/ for dev
      return `src="/blog/content-images/${relativePath.replace(/^images\//, '')}"`;
    }
  );
}

function rewriteCrossLinks(html: string): string {
  return html.replace(
    /href="\.\/([^"]+)"/g,
    (_, slug) => `href="/blog/${slug}"`
  );
}

async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
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

  const firstBodyImage = extractFirstImage(content);
  let heroImage = frontmatter.image || firstBodyImage || "";
  if (heroImage && !heroImage.startsWith("http")) {
    heroImage = resolveImageUrl(heroImage, slug, manifest);
  }

  // Remove the first image from body content when it's promoted to hero
  if (heroImage && firstBodyImage && !frontmatter.image) {
    html = html.replace(/<p>\s*<img[^>]*>\s*<\/p>/, "");
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

    let heroImage = frontmatter.image || extractFirstImage(content) || "";
    if (heroImage && !heroImage.startsWith("http")) {
      heroImage = resolveImageUrl(heroImage, slug, manifest);
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
