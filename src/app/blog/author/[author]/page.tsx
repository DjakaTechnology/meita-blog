import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/markdown";
import { getAllAuthors, getAuthor } from "@/lib/authors";
import { paginatePosts } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export const dynamicParams = false;

export function generateStaticParams() {
  const authors = getAllAuthors();
  if (authors.length === 0) {
    return [{ author: "__placeholder" }];
  }
  return authors.map((a) => ({ author: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author: authorId } = await params;
  const author = getAuthor(authorId);
  const name = author?.name ?? authorId;
  return {
    title: `${name} — Blog`,
    description: author?.bio ?? `Posts by ${name}`,
    alternates: {
      canonical: `https://meita.ai/blog/author/${authorId}`,
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ author: string }>;
}) {
  const { author: authorId } = await params;
  const author = getAuthor(authorId);

  const allPosts = getAllPostMeta().filter((p) => p.authorId === authorId);
  const { posts, totalPages } = paginatePosts(allPosts, 1);

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      {author && (
        <div className="flex flex-col items-center text-center max-w-2xl gap-4">
          {author.avatarUrl && (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
            {author.bio && (
              <p className="text-sm text-muted-foreground">{author.bio}</p>
            )}
          </div>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            authorName={author?.name}
          />
        ))}
      </div>
      <Pagination
        currentPage={1}
        totalPages={totalPages}
        basePath={`/blog/author/${authorId}`}
      />
    </div>
  );
}
