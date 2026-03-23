import type { PostMeta } from "./types";

export const POSTS_PER_PAGE = 10;

export function paginatePosts(
  posts: PostMeta[],
  page: number
): { posts: PostMeta[]; totalPages: number } {
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  return {
    posts: posts.slice(start, start + POSTS_PER_PAGE),
    totalPages,
  };
}
