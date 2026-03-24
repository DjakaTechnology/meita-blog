import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/markdown";
import { getAllAuthors, getAuthor } from "@/lib/authors";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";


export function generateStaticParams() {
  const authors = getAllAuthors();
  const allPosts = getAllPostMeta();
  const params: { author: string; page: string }[] = [];

  for (const a of authors) {
    const filtered = allPosts.filter((p) => p.authorId === a.id);
    const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    for (let i = 2; i <= totalPages; i++) {
      params.push({ author: a.id, page: String(i) });
    }
  }

  if (params.length === 0) {
    return [];
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string; page: string }>;
}): Promise<Metadata> {
  const { author: authorId, page } = await params;
  const author = getAuthor(authorId);
  const name = author?.name ?? authorId;
  return {
    title: `${name} — Page ${page} — Blog`,
    description: author?.bio ?? `Posts by ${name}`,
    alternates: {
      canonical: `https://meita.ai/blog/author/${authorId}/page/${page}`,
    },
  };
}

export default async function PaginatedAuthorPage({
  params,
}: {
  params: Promise<{ author: string; page: string }>;
}) {
  const { author: authorId, page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
  const author = getAuthor(authorId);

  const allPosts = getAllPostMeta().filter((p) => p.authorId === authorId);
  const { posts, totalPages } = paginatePosts(allPosts, page);

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
              <p className="text-sm text-muted-foreground">
                {author.bio} — Page {page}
              </p>
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
        currentPage={page}
        totalPages={totalPages}
        basePath={`/author/${authorId}`}
      />
    </div>
  );
}
