import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Link href="/blog" className="text-primary underline">Go to Blog</Link>
    </div>
  );
}
