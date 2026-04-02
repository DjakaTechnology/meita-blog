import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts } from "@/lib/pagination";
import PostList from "@/components/PostList";

interface PageProps {
  params: Promise<{ num: string }>;
}

export async function generateStaticParams() {
  const allPosts = getAllPostMeta();
  const { totalPages } = paginatePosts(allPosts, 1);
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    num: String(i + 2),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { num } = await params;
  return {
    title: `Blog — Page ${num}`,
    alternates: { canonical: `https://meita.ai/blog/page/${num}` },
  };
}

export default async function PaginatedPage({ params }: PageProps) {
  const { num } = await params;
  const page = parseInt(num, 10);
  if (isNaN(page) || page < 2) return notFound();

  const allPosts = getAllPostMeta();
  const { posts, totalPages } = paginatePosts(allPosts, page);

  if (page > totalPages) return notFound();

  const categories = getAllCategories();

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-sm text-muted-foreground">Latest insights and updates from our team</p>
      </div>
      <PostList initialPosts={posts} allCategories={categories} totalPages={totalPages} currentPage={page} />
    </div>
  );
}
