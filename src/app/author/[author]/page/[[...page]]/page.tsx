import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/markdown";
import { getAllAuthors, getAuthor } from "@/lib/authors";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";


export function generateStaticParams() {
  const authors = getAllAuthors();
  const allPosts = getAllPostMeta();
  const params: { author: string; page?: string[] }[] = [];

  for (const a of authors) {
    const filtered = allPosts.filter((p) => p.authorId === a.id);
    const totalPages = Math.ceil(Math.max(1, filtered.length) / POSTS_PER_PAGE);

    // Add base page (no page param)
    params.push({ author: a.id });

    // Add pagination pages
    for (let i = 2; i <= totalPages; i++) {
      params.push({ author: a.id, page: [String(i)] });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string; page?: string[] }>;
}): Promise<Metadata> {
  const { author: authorId, page } = await params;
  const author = getAuthor(authorId);
  const name = author?.name ?? authorId;
  const pageNum = page?.[0] ?? "1";
  return {
    title: page ? `${name} — Page ${pageNum} — Blog` : `${name} — Blog`,
    description: author?.bio ?? `Posts by ${name}`,
    alternates: {
      canonical: page ? `https://meita.ai/blog/author/${authorId}/page/${pageNum}` : `https://meita.ai/blog/author/${authorId}`,
    },
  };
}

export default async function PaginatedAuthorPage({
  params,
}: {
  params: Promise<{ author: string; page?: string[] }>;
}) {
  const { author: authorId, page: pageArray } = await params;
  const page = pageArray ? parseInt(pageArray[0], 10) : 1;
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
                {author.bio}{page > 1 ? ` — Page ${page}` : ""}
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
