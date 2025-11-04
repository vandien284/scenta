import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import ParallaxBackground from "@/ui/ParallaxBackground";
import newsData from "@/data/newsData.json";
import type { NewsItem } from "@/types/NewsType";
import styles from "@/styles/view/news.module.scss";

const newsItems = newsData as NewsItem[];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "2-digit",
  year: "numeric",
});

const NewsPage = () => {
  return (
    <Fragment>
      <ParallaxBackground image="/images/parallax/banner-page.webp" height="50vh">
        <Breadcrumb
          crumbs={[
            { name: "Trang chủ", href: "/" },
            { name: "Tin tức" },
          ]}
        />
      </ParallaxBackground>

      <section className={styles.newsSection}>
        <div className="container-width">
          <div className={styles.sectionHeader}>
            <span className={styles.subtitle}>Stories & Inspiration</span>
            <h1 className={styles.title}>Tin tức</h1>
            <p className={styles.description}>
              Khám phá những câu chuyện đằng sau các mùi hương, bí quyết chăm sóc nến và xu hướng
              trang trí mới nhất từ Scenta.
            </p>
          </div>

          <ul className={styles.newsGrid}>
            {newsItems.map((item) => (
              <li key={item.id} className={styles.newsCard}>
                <article>
                  <div className={styles.thumbnail}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 320px, (min-width: 768px) 45vw, 100vw"
                    />
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.meta}>
                      <span className={styles.category}>{item.category}</span>
                      <span className={styles.dot} />
                      <span>{dateFormatter.format(new Date(item.publishedAt))}</span>
                      <span className={styles.dot} />
                      <span>{item.readingTime}</span>
                    </div>

                    <h2 className={styles.cardTitle}>
                      <Link href={`/tin-tuc/${item.slug}`}>{item.title}</Link>
                    </h2>

                    <p className={styles.excerpt}>{item.excerpt}</p>

                    <div className={styles.footer}>
                      <span className={styles.author}>Bởi {item.author}</span>
                      <Link href={`/tin-tuc/${item.slug}`} className={styles.readMore}>
                        Đọc tiếp
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Fragment>
  );
};

export default NewsPage;
