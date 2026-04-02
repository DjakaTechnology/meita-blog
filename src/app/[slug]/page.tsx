import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getAllSlugs, getAllPostMeta } from "@/lib/markdown";
import { getAuthorOrThrow } from "@/lib/authors";
import TableExpander from "@/components/TableExpander";
import RelatedPosts from "@/components/RelatedPosts";
import Link from "next/link";
import "@/app/blog-content.css";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://meita.ai/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: "article", url: `https://meita.ai/blog/${post.slug}`, publishedTime: post.date, tags: post.categories, ...(post.image && { images: [post.image] }) },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, ...(post.image && { images: [post.image] }) },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const author = getAuthorOrThrow(post.authorId);
  const allPosts = getAllPostMeta();
  const related = allPosts.filter((p) => p.slug !== post.slug && p.categories.some((c) => post.categories.includes(c))).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url: `https://meita.ai/blog/${post.slug}`,
    author: { "@type": "Organization", name: author.name },
    publisher: { "@type": "Organization", name: "Meita.ai", url: "https://meita.ai" },
    ...(post.image && { image: post.image }),
  };

  return (
    <article className="max-w-[680px] mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex flex-col pt-4 pb-6 border-b border-border mb-6">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
            <svg className="w-3.5 h-3.5 mr-1.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            All Articles
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold leading-snug text-foreground mb-3" style={{ fontFamily: "var(--font-sans)" }}>{post.title}</h1>
        <div className="flex items-center gap-2 text-sm">
          {author.avatarUrl && <img src={author.avatarUrl} alt={author.name} className="w-6 h-6 object-cover rounded-full" />}
          <span className="font-medium text-foreground">{author.name}</span>
          <span className="text-muted-foreground">&middot;</span>
          <time dateTime={post.date} className="text-muted-foreground">{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-muted-foreground">{post.readingTime}</span>
        </div>
      </div>
      {post.image && <img src={post.image} alt={post.title} className="w-full rounded-lg mb-8" />}
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      <TableExpander />
      <div className="border-t border-border mt-10 pt-8">
        <Link href={`/author/${author.id}`} className="flex items-start gap-4 group">
          {author.avatarUrl && (
            <img src={author.avatarUrl} alt={author.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Written by</p>
            <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{author.name}</p>
            {author.bio && <p className="text-sm text-muted-foreground mt-1">{author.bio}</p>}
          </div>
        </Link>
      </div>
      <RelatedPosts posts={related} />
    </article>
  );
}
