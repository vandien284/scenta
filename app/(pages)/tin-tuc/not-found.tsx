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
    <div className={styles.notFoundWrapper}>
      <div className="container-width">
        <div className={styles.notFoundContent}>
          <h1 className={styles.title}>Bài viết không tồn tại</h1>
          <p className={styles.desc}>
            Rất tiếc, bài viết bạn đang tìm kiếm không có trong bộ sưu tập.
          </p>
          <Link href="/tin-tuc" className={styles.btn}>
            <span className={styles.default}>VỀ TIN TỨC</span>
            <span className={styles.hover}>VỀ TIN TỨC</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
