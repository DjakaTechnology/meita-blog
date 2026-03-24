import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostList from "@/components/PostList";


export function generateStaticParams() {
  const allPosts = getAllPostMeta();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const params = Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  })).filter((p) => p.page !== "1");

  // Next.js static export requires at least one param; return page "2" as fallback
  if (params.length === 0) {
    return [];
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Blog — Page ${page}`,
    alternates: { canonical: `https://meita.ai/blog/page/${page}` },
  };
}

export default async function PaginatedBlogPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
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
