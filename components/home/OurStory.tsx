"use client";
import ParallaxBackground from "@/ui/ParallaxBackground";
import styles from "@/styles/components/home/ourStrory.module.scss";
import { Button } from "react-bootstrap";

export default function OurStrory() {
  return (
    <ParallaxBackground image="/images/parallax/ourstory.webp" height="70vh">

      <div className={styles.story}>
        <h2 className={styles.title}>CÂU CHUYỆN CỦA CHÚNG TÔI</h2>
        <div className={styles.line}></div>
        <p className={styles.desc}>
          Câu chuyện của chúng tôi khởi nguồn từ cam kết về chất lượng. Mỗi cây nến được đổ thủ công từ những nguyên liệu tự nhiên tinh túy, với sự tỉ mỉ trong từng chi tiết. Hướng đến phát triển bền vững, chúng tôi chọn vật liệu thân thiện với môi trường — từ sáp đậu nành đến hộp tái sử dụng — để mang đến sản phẩm tốt cho bạn và cho cả hành tinh.
        </p>
        <Button className={styles.btn}>
          <span className={styles.default}>XEM THÊM</span>
          <span className={styles.hover}>XEM THÊM</span>
        </Button>

      </div>

    </ParallaxBackground>
  );
}

