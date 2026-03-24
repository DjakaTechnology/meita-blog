import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 py-8 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <Link href="https://meita.ai" className="flex items-center">
            <img src="/blog/logo.svg" alt="Meita.ai logo" className="w-14 h-14" />
            <span className="text-lg font-bold text-zinc-50 -ml-2">Meita</span>
          </Link>
          <p className="opacity-70 text-sm">AI-powered metadata keywording tool for stock photographers.</p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-zinc-50">Product</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="https://meita.ai/download" className="hover:text-zinc-50 transition-colors">Download</Link>
            <Link href="https://meita.ai/en-us/pricing" className="hover:text-zinc-50 transition-colors">Pricing</Link>
            <Link href="/" className="hover:text-zinc-50 transition-colors">Blog</Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-zinc-50">Resources</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="https://meita.ai/en-us/demo/" className="hover:text-zinc-50 transition-colors">Try Demo</Link>
            <Link href="https://meita.ai/en-us/ai-keywording-tool/" className="hover:text-zinc-50 transition-colors">AI Keywording Tool</Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-zinc-50">Social</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <a href="https://www.facebook.com/profile.php?id=61571478001198" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-50 transition-colors">Facebook Page</a>
            <a href="https://www.facebook.com/groups/meita.ai" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-50 transition-colors">Facebook Group</a>
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-zinc-700 text-center text-sm opacity-60">
        <p>&copy; {new Date().getFullYear()} Meita.ai. All rights reserved.</p>
      </div>
    </footer>
  );
}
