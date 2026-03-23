"use client";

import { useState, useEffect, useCallback } from "react";
import Fuse from "fuse.js";
import type { PostMeta } from "@/lib/types";
import PostCard from "./PostCard";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";

interface PostListProps {
  initialPosts: PostMeta[];
  allCategories: string[];
  totalPages: number;
  currentPage: number;
  basePath?: string;
}

interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  authorId: string;
  image: string;
  readingTime: string;
}

export default function PostList({ initialPosts, allCategories, totalPages, currentPage, basePath = "/blog" }: PostListProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PostMeta[] | null>(null);
  const [allPosts, setAllPosts] = useState<SearchIndexEntry[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<SearchIndexEntry> | null>(null);

  const isFiltering = query.length > 0 || selectedCategory !== null;

  const loadSearchIndex = useCallback(async () => {
    if (allPosts) return;
    try {
      const res = await fetch("/blog/search-index.json");
      const data: SearchIndexEntry[] = await res.json();
      setAllPosts(data);
      setFuse(new Fuse(data, { keys: ["title", "description", "categories"], threshold: 0.3 }));
    } catch (err) {
      console.error("Failed to load search index:", err);
    }
  }, [allPosts]);

  useEffect(() => {
    if (!isFiltering || allPosts) return;
    loadSearchIndex();
  }, [isFiltering, allPosts, loadSearchIndex]);

  useEffect(() => {
    if (!allPosts) return;
    let results = allPosts;
    if (query && fuse) {
      results = fuse.search(query).map((r) => r.item);
    }
    if (selectedCategory) {
      results = results.filter((p) => p.categories.includes(selectedCategory));
    }
    setSearchResults(results as PostMeta[]);
  }, [query, selectedCategory, allPosts, fuse]);

  const displayPosts = isFiltering ? (searchResults || []) : initialPosts;

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4">
        <SearchBar value={query} onChange={(v) => { setQuery(v); if (v.length > 0) loadSearchIndex(); }} />
        <CategoryFilter categories={allCategories} selected={selectedCategory} onSelect={(cat) => { setSelectedCategory(cat); if (cat) loadSearchIndex(); }} />
      </div>
      {displayPosts.length === 0 ? (
        <div className="text-center py-12"><p className="text-muted-foreground">No articles found.</p></div>
      ) : (
        <div className="grid gap-6">{displayPosts.map((post) => (<PostCard key={post.slug} post={post} />))}</div>
      )}
      {!isFiltering && <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />}
    </div>
  );
}
