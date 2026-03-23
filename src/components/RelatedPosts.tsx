import Link from "next/link";
import type { PostMeta } from "@/lib/types";

export default function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;
  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block rounded-lg border border-border p-4 hover:border-primary/40 hover:shadow-md transition-all no-underline">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
