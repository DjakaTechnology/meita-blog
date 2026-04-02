import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPostMeta } from "@/lib/markdown";
import { getAllAuthors, getAuthor } from "@/lib/authors";
import { paginatePosts } from "@/lib/pagination";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

interface PageProps {
  params: Promise<{ author: string; page: string }>;
}

export function generateStaticParams() {
  const authors = getAllAuthors();
  const allPosts = getAllPostMeta();
  const results: { author: string; page: string }[] = [];

  for (const a of authors) {
    const authorPosts = allPosts.filter((p) => p.authorId === a.id);
    const { totalPages } = paginatePosts(authorPosts, 1);
    for (let i = 2; i <= totalPages; i++) {
      results.push({ author: a.id, page: String(i) });
    }
  }
  return results;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { author: authorId, page } = await params;
  const author = getAuthor(authorId);
  const name = author?.name ?? authorId;
  return {
    title: `${name} — Page ${page} — Blog`,
    alternates: { canonical: `https://meita.ai/blog/author/${authorId}/page/${page}` },
  };
}

export default async function AuthorPaginatedPage({ params }: PageProps) {
  const { author: authorId, page: pageStr } = await params;
  const page = parseInt(pageStr, 10);
  if (isNaN(page) || page < 2) return notFound();

  const author = getAuthor(authorId);
  const allPosts = getAllPostMeta().filter((p) => p.authorId === authorId);
  const { posts, totalPages } = paginatePosts(allPosts, page);

  if (page > totalPages) return notFound();

  return (
    <div className="flex flex-col items-center py-8 px-4 gap-6">
      {author && (
        <div className="flex flex-col items-center text-center max-w-2xl gap-4">
          {author.avatarUrl && (
            <img src={author.avatarUrl} alt={author.name} className="w-24 h-24 rounded-full object-cover" />
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
            {author.bio && <p className="text-sm text-muted-foreground">{author.bio}</p>}
          </div>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} authorName={author?.name} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} basePath={`/author/${authorId}`} />
    </div>
  );
}
