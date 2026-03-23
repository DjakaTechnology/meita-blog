import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts } from "@/lib/pagination";
import PostList from "@/components/PostList";

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
  const categories = getAllCategories();

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-sm text-muted-foreground">Latest insights and updates from our team</p>
      </div>
      <PostList initialPosts={posts} allCategories={categories} totalPages={totalPages} currentPage={1} />
    </div>
  );
}
