import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUTPUT_PATH = path.join(process.cwd(), "public/search-index.json");
const MANIFEST_PATH = path.join(process.cwd(), "content/.image-manifest.json");

function loadManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")); } catch { return {}; }
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
    posts.push({ slug, title: data.title, description: data.description, date: data.date, categories: data.categories || [], authorId: data.author, image: heroImage, readingTime: stats.text });
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(posts));
  console.log(`Search index generated: ${posts.length} posts`);
}

main();
