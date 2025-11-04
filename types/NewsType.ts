export type ArticleBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      ordered?: boolean;
      items: string[];
    }
  | {
      type: "quote";
      text: string;
      author?: string;
    }
  | {
      type: "callout";
      title?: string;
      text: string;
    }
  | {
      type: "link";
      label: string;
      href: string;
      external?: boolean;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      width?: number;
      height?: number;
      fullWidth?: boolean;
    }
  | {
      type: "divider";
    };

export interface ArticleSection {
  id: string;
  title: string;
  level: 2 | 3 | 4;
  summary?: string;
  blocks: ArticleBlock[];
}

export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3 | 4;
}

export interface NewsItem {
  id: number;
  slug: string;
  legacySlugs?: string[];
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  image: string;
  category: string;
  author: string;
  heroImage?: string;
  heroCaption?: string;
  tableOfContents?: TocItem[];
  sections: ArticleSection[];
  relatedSlugs?: string[];
}
