export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  draft: boolean;
  categories: string[];
  author: string;
  image: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  authorId: string;
  image: string;
  readingTime: string;
  content: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  authorId: string;
  image: string;
  readingTime: string;
}
