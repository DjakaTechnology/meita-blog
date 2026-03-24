import Link from "next/link";
import type { PostMeta } from "@/lib/types";

interface PostCardProps {
  post: PostMeta;
  authorName?: string;
}

export default function PostCard({ post, authorName }: PostCardProps) {
  return (
    <Link
      href={`/${post.slug}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 no-underline"
    >
      {post.image && (
        <img src={post.image} alt={post.title} className="w-full h-48 md:h-56 object-cover" />
      )}
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          {authorName && <span className="text-sm text-muted-foreground">by {authorName}</span>}
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors mb-3">{post.title}</h2>
        {post.description && <p className="text-muted-foreground leading-relaxed mb-4">{post.description}</p>}
        <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
          Read more
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
