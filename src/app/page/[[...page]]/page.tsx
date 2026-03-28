import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostList from "@/components/PostList";


export function generateStaticParams() {
  const allPosts = getAllPostMeta();
  const totalPages = Math.ceil(Math.max(1, allPosts.length) / POSTS_PER_PAGE);

  // Generate pagination routes for all pages
  return Array.from({ length: totalPages }, (_, i) => ({
    page: i === 0 ? undefined : [String(i + 1)],
  })).filter(p => p.page !== undefined);
}

export async function generateMetadata({ params }: { params: Promise<{ page?: string[] }> }): Promise<Metadata> {
  const { page } = await params;
  const pageNum = page?.[0] ?? "1";
  return {
    title: page ? `Blog — Page ${pageNum}` : "Blog",
    alternates: { canonical: page ? `https://meita.ai/blog/page/${pageNum}` : "https://meita.ai/blog" },
  };
}

export default async function PaginatedBlogPage({ params }: { params: Promise<{ page?: string[] }> }) {
  const { page: pageArray } = await params;
  const page = pageArray ? parseInt(pageArray[0], 10) : 1;
  const allPosts = getAllPostMeta();
  const { posts, totalPages } = paginatePosts(allPosts, page);
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
