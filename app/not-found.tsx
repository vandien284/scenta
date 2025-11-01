import PagesLayout from "@/app/(pages)/layout";
import Link from "next/link";
import styles from "@/styles/view/not-found.module.scss";

export async function generateMetadata() {
  return {
    title: "Trang không tìm thấy | Scenta",
    description: "Rất tiếc, trang bạn đang tìm kiếm không tồn tại.",
  };
}

export default function NotFound() {
  return (
    <PagesLayout>
      <div className={styles.notFoundWrapper}>
        <div className="container-width">
          <div className={styles.notFoundContent}>
            <h1 className={styles.title}>Ồ! Không tìm thấy trang đó.</h1>
            <p className={styles.desc}>
              Có vẻ như không tìm thấy gì ở vị trí này. Bạn có thể thử tìm kiếm xem sao?
            </p>
            <Link href="/" className={styles.btn}>
              <span className={styles.default}>VỀ TRANG CHỦ</span>
              <span className={styles.hover}>VỀ TRANG CHỦ</span>
            </Link>
          </div>

        </div>

      </div>
    </PagesLayout>
  );
}
