import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import ParallaxBackground from "@/ui/ParallaxBackground";
import newsData from "@/data/newsData.json";
import type { ArticleBlock, NewsItem } from "@/types/NewsType";
import styles from "@/styles/view/news-detail.module.scss";
import { Fragment } from "react";

const articles = newsData as NewsItem[];

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function renderBlock(block: ArticleBlock, index: number) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className={styles.paragraph}>
          {block.text}
        </p>
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          key={index}
          className={block.ordered ? styles.orderedList : styles.unorderedList}
        >
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case "quote":
      return (
        <figure key={index} className={styles.quote}>
          <blockquote>{block.text}</blockquote>
          {block.author && <figcaption>- {block.author}</figcaption>}
        </figure>
      );
    case "callout":
      return (
        <div key={index} className={styles.callout}>
          {block.title && <h4>{block.title}</h4>}
          <p>{block.text}</p>
        </div>
      );
    case "link": {
      const linkProps = block.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {};
      return (
        <p key={index} className={styles.linkBlock}>
          <Link href={block.href} {...linkProps}>
            {block.label}
          </Link>
        </p>
      );
    }
    case "image": {
      const width = block.width ?? 1200;
      const height = block.height ?? 800;
      const aspectRatio = `${width}/${height}`;
      const figureClass = block.fullWidth
        ? `${styles.imageBlock} ${styles.imageBlockFull}`
        : styles.imageBlock;

      return (
        <figure key={index} className={figureClass}>
          <div className={styles.imageSurface} style={{ aspectRatio }}>
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="100vw"
              quality={75}
            />
          </div>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    }
    case "divider":
      return <hr key={index} className={styles.divider} />;
    default:
      return null;
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;

  const article =
    articles.find((item) => item.slug === slug) ??
    articles.find((item) => item.legacySlugs?.includes(slug));

  if (!article) {
    notFound();
  }

  if (article.slug !== slug) {
    redirect(`/tin-tuc/${article.slug}`);
  }

  const related =
    article.relatedSlugs
      ?.map((relatedSlug) => articles.find((item) => item.slug === relatedSlug))
      .filter(
        (item): item is NewsItem => item !== undefined && item.slug !== article.slug
      ) ?? [];

  return (
    <Fragment>
      <ParallaxBackground
        image={"/images/parallax/banner-page.webp"}
        height="clamp(320px, 58vh, 480px)"
      >
        <Breadcrumb
          crumbs={[
            { name: "Trang chủ", href: "/" },
            { name: "Tin tức", href: "/tin-tuc" },
            { name: article.title },
          ]}
        />
      </ParallaxBackground>

      <section className={styles.articleWrapper}>
        <div className="container-width">
          <div className={styles.layout}>
            <article className={styles.article}>
              <header className={styles.articleHeader}>
                <span className={styles.category}>{article.category}</span>
                <h1>{article.title}</h1>
                {article.heroCaption && (
                  <p className={styles.subtitle}>{article.heroCaption}</p>
                )}
                <div className={styles.meta}>
                  <span>{dateFormatter.format(new Date(article.publishedAt))}</span>
                  <span className={styles.dot} />
                  <span>{article.author}</span>
                  <span className={styles.dot} />
                  <span>{article.readingTime}</span>
                </div>
              </header>

              {article.sections.map((section) => {
                const HeadingTag = section.level === 3 ? "h3" : "h2";
                return (
                  <section key={section.id} id={section.id} className={styles.section}>
                    <HeadingTag>{section.title}</HeadingTag>
                    {section.summary && (
                      <p className={styles.sectionSummary}>{section.summary}</p>
                    )}
                    {section.blocks.map((block, index) => renderBlock(block, index))}
                  </section>
                );
              })}
            </article>

            {article.tableOfContents && article.tableOfContents.length > 0 && (
              <aside className={styles.toc}>
                <div className={styles.tocContainer}>
                  <span className={styles.tocLabel}>Mục lục</span>
                  <nav>
                    <ul>
                      {article.tableOfContents.map((item) => (
                        <li
                          key={item.id}
                          className={
                            item.level === 3 ? styles.tocItemSub : styles.tocItem
                          }
                        >
                          <a href={`#${item.id}`}>{item.label}</a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </aside>
            )}
          </div>

          {related.length > 0 && (
            <div className={styles.related}>
              <h2>Bài viết liên quan</h2>
              <ul className={styles.relatedGrid}>
                {related.map((item) => (
                  <li key={item.slug} className={styles.relatedCard}>
                    <Link href={`/tin-tuc/${item.slug}`}>
                      <div className={styles.relatedThumb}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1024px) 260px, 45vw"
                        />
                      </div>
                      <div className={styles.relatedBody}>
                        <span className={styles.relatedMeta}>
                          {dateFormatter.format(new Date(item.publishedAt))}
                        </span>
                        <h3>{item.title}</h3>
                        <p>{item.excerpt}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </Fragment>
  );
}


