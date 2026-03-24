import type { Metadata } from "next";
import { getAllPostMeta, getAllCategories } from "@/lib/markdown";
import { getAuthor } from "@/lib/authors";
import { paginatePosts } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";


export function generateStaticParams() {
  const categories = getAllCategories();
  if (categories.length === 0) {
    return [];
  }
  return categories.map((cat) => ({ category: encodeURIComponent(cat) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  return {
    title: `${category} — Blog`,
    alternates: {
      canonical: `https://meita.ai/blog/category/${encodeURIComponent(category)}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);

  const allPosts = getAllPostMeta().filter((p) =>
    p.categories.includes(category)
  );
  const { posts, totalPages } = paginatePosts(allPosts, 1);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">{category}</h1>
        <p className="text-sm text-muted-foreground">
          Posts in the {category} category
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
        currentPage={1}
        totalPages={totalPages}
        basePath={`/category/${encodeURIComponent(category)}`}
      />
    </div>
  );
}
