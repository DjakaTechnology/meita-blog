import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/markdown";
import { paginatePosts } from "@/lib/pagination";
import { getAuthor } from "@/lib/authors";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export const metadata: Metadata = {
  title: "Stock Photography AI Keywording Blog",
  description: "Tips, guides, and insights on AI metadata keywording for stock photography.",
  alternates: { canonical: "https://meita.ai/blog" },
  openGraph: {
    title: "Stock Photography AI Keywording Blog — Meita.ai",
    description: "Tips, guides, and insights on AI metadata keywording for stock photography.",
    type: "website",
    url: "https://meita.ai/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Photography AI Keywording Blog — Meita.ai",
    description: "Tips, guides, and insights on AI metadata keywording for stock photography.",
  },
};

export default function BlogPage() {
  const allPosts = getAllPostMeta();
  const { posts, totalPages } = paginatePosts(allPosts, 1);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-sm text-muted-foreground">Latest insights and updates from our team</p>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 w-full max-w-4xl">
          {posts.map((post) => {
            const author = getAuthor(post.authorId);
            return <PostCard key={post.slug} post={post} authorName={author?.name} />;
          })}
        </div>
      )}
      <Pagination currentPage={1} totalPages={totalPages} />
    </div>
  );
}
