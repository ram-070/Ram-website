import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const projectsDirectory = path.join(process.cwd(), "src/content/projects");
export const notesDirectory = path.join(process.cwd(), "src/content/notes");

export interface ContentFile {
  slug: string;
  content: string;
  data: {
    title: string;
    description?: string;
    date?: string;
    tags?: string[];
    image?: string;
    [key: string]: unknown;
  };
}

export function getAllContentFiles(directory: string): ContentFile[] {
  const files = fs.readdirSync(directory);

  return files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.(mdx|md)$/, "");
      const fullPath = path.join(directory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        content,
        data: data as ContentFile["data"],
      };
    });
}

export function getContentFile(directory: string, slug: string): ContentFile | null {
  try {
    const fullPath = path.join(directory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      content,
      data: data as ContentFile["data"],
    };
  } catch {
    return null;
  }
}
