import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { getAuthor } from "@/lib/authors";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";


export function generateStaticParams() {
  const categories = getAllCategories();
  const allPosts = getAllPostMeta();
  const params: { category: string; page: string }[] = [];

  for (const cat of categories) {
    const filtered = allPosts.filter((p) => p.categories.includes(cat));
    const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    for (let i = 2; i <= totalPages; i++) {
      params.push({ category: encodeURIComponent(cat), page: String(i) });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}): Promise<Metadata> {
  const { category: rawCategory, page } = await params;
  const category = decodeURIComponent(rawCategory);
  return {
    title: `${category} — Page ${page} — Blog`,
    alternates: {
      canonical: `https://meita.ai/blog/category/${encodeURIComponent(category)}/page/${page}`,
    },
  };
}

export default async function PaginatedCategoryPage({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}) {
  const { category: rawCategory, page: pageStr } = await params;
  const category = decodeURIComponent(rawCategory);
  const page = parseInt(pageStr, 10);

  const allPosts = getAllPostMeta().filter((p) =>
    p.categories.includes(category)
  );
  const { posts, totalPages } = paginatePosts(allPosts, page);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">{category}</h1>
        <p className="text-sm text-muted-foreground">
          Posts in the {category} category — Page {page}
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {posts.map((post) => {
          const author = getAuthor(post.authorId);
          return (
            <PostCard
              key={post.slug}
              post={post}
              authorName={author?.name}
            />
          );
        })}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/category/${encodeURIComponent(category)}`}
      />
    </div>
  );
}
