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
    posts.push({ slug: file.replace(/\.md$/, ""), title: data.title, description: data.description, date: data.date, categories: data.categories || [] });
  }
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items = posts.map((post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>https://meita.ai/blog/${post.slug}</link>
      <guid>https://meita.ai/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.categories.map((c) => `<category>${c}</category>`).join("\n      ")}
    </item>`).join("\n");

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
