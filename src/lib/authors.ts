import fs from "fs";
import path from "path";
import type { Author } from "./types";
import authorsData from "../../content/authors.json";

const MANIFEST_PATH = path.join(process.cwd(), "content/.image-manifest.json");

function loadManifest(): Record<string, { r2Url: string; contentHash: string }> {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function resolveAvatarUrl(avatar: string): string {
  if (!avatar || avatar.startsWith("http")) return avatar;
  const manifest = loadManifest();
  const key = `images/avatars/${avatar}`;
  const entry = manifest[key];
  return entry ? entry.r2Url : avatar;
}

const authors: Author[] = authorsData;

export function getAuthor(id: string): (Author & { avatarUrl: string }) | undefined {
  const author = authors.find((a) => a.id === id);
  if (!author) return undefined;
  return { ...author, avatarUrl: resolveAvatarUrl(author.avatar) };
}

export function getAllAuthors(): Author[] {
  return authors;
}

export function getAuthorOrThrow(id: string): Author & { avatarUrl: string } {
  const author = getAuthor(id);
  if (!author) {
    throw new Error(`Author not found: ${id}`);
  }
  return author;
}
