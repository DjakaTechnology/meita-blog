"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex flex-row items-center justify-between px-4 py-2">
        <Link href="https://meita.ai" className="flex items-center">
          <img src="/blog/logo.svg" alt="Meita.ai logo" className="w-10 h-10" />
          <span className="text-lg font-bold -ml-2">Meita.ai</span>
        </Link>
        <nav className="md:flex flex-row gap-2 items-center justify-center hidden">
          <Link href="https://meita.ai/en-us/pricing" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors">Pricing</Link>
          <Link href="https://meita.ai/token" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors">Token</Link>
          <Link href="https://meita.ai/download" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors">Download</Link>
          <div className="relative group">
            <button className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors flex items-center gap-1">
              Tools
              <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50">
              <div className="flex flex-col rounded-lg border border-border bg-card shadow-lg py-1 min-w-[180px]">
                <Link href="https://meita.ai/remove-bg" className="text-left px-4 py-2 text-sm hover:bg-muted transition-colors">Remove BG</Link>
                <Link href="https://meita.ai/en-us/demo/" className="text-left px-4 py-2 text-sm hover:bg-muted transition-colors">Try Demo</Link>
              </div>
            </div>
          </div>
          <Link href="/" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors text-primary">Blog</Link>
        </nav>
        <button className="md:hidden inline p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-2">
          <Link href="https://meita.ai/en-us/pricing" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link href="https://meita.ai/token" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Token</Link>
          <Link href="https://meita.ai/download" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Download</Link>
          <Link href="https://meita.ai/remove-bg" className="px-4 py-2 text-sm rounded-md hover:bg-muted" onClick={() => setMenuOpen(false)}>Remove BG</Link>
          <Link href="/" className="px-4 py-2 text-sm rounded-md hover:bg-muted text-primary" onClick={() => setMenuOpen(false)}>Blog</Link>
        </div>
      )}
    </div>
  );
}
