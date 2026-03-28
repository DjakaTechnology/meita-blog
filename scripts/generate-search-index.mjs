import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content");
const OUTPUT_PATH = path.join(process.cwd(), "public/search-index.json");
const MANIFEST_PATH = path.join(process.cwd(), "content/.image-manifest.json");

function isPublished(dateString) {
  return new Date(dateString) <= new Date();
}

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
    if (data.draft || !isPublished(data.date)) continue;
    const slug = file.replace(/\.md$/, "");
    const stats = readingTime(content);
    const firstImageMatch = content.match(/!\[[^\]]*\]\((images\/[^)]+)\)/);
    let heroImage = data.image || (firstImageMatch ? firstImageMatch[1] : "") || "";
    if (heroImage && !heroImage.startsWith("http")) {
      const dirName = heroImage.replace(/^images\//, "").split("/")[0];
      const fileName = path.basename(heroImage);
      const entry = manifest[heroImage] || manifest[`images/${slug}/${fileName}`];
      if (entry) {
        heroImage = entry.r2Url;
      } else {
        heroImage = `/blog/content-images/${heroImage.replace(/^images\//, "")}`;
      }
    }
    posts.push({ slug, title: data.title, description: data.description, date: data.date, categories: data.categories || [], authorId: data.author, image: heroImage, readingTime: stats.text });
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(posts));
  console.log(`Search index generated: ${posts.length} posts`);
}

main();
