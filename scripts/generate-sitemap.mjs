import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content");
const AUTHORS_PATH = path.join(process.cwd(), "content/authors.json");
const OUTPUT_PATH = path.join(process.cwd(), "public/sitemap.xml");

function main() {
  const urls = [];
  urls.push({ loc: "https://meita.ai/blog", changefreq: "daily", priority: "1.0" });

  const categories = new Set();
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      if (data.draft) continue;
      const slug = file.replace(/\.md$/, "");
      urls.push({ loc: `https://meita.ai/blog/${slug}`, lastmod: new Date(data.date).toISOString().split("T")[0], changefreq: "monthly", priority: "0.8" });
      (data.categories || []).forEach((c) => categories.add(c));
    }
  }
  for (const cat of categories) {
    urls.push({ loc: `https://meita.ai/blog/category/${encodeURIComponent(cat)}`, changefreq: "weekly", priority: "0.5" });
  }
  if (fs.existsSync(AUTHORS_PATH)) {
    const authors = JSON.parse(fs.readFileSync(AUTHORS_PATH, "utf-8"));
    for (const author of authors) {
      urls.push({ loc: `https://meita.ai/blog/author/${author.id}`, changefreq: "weekly", priority: "0.5" });
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
