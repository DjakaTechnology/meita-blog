import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function Pagination({ currentPage, totalPages, basePath = "/blog" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function getPageUrl(page: number): string {
    if (page === 1) return basePath;
    return `${basePath}/page/${page}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      {currentPage > 1 && (
        <Link href={getPageUrl(currentPage - 1)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Previous</Link>
      )}
      {pages.map((page) => (
        <Link key={page} href={getPageUrl(page)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${page === currentPage ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>{page}</Link>
      ))}
      {currentPage < totalPages && (
        <Link href={getPageUrl(currentPage + 1)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Next</Link>
      )}
    </nav>
  );
}
