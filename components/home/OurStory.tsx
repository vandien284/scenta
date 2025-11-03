"use client";
import ParallaxBackground from "@/ui/ParallaxBackground";
import styles from "@/styles/components/home/ourStrory.module.scss";
import { Button } from "react-bootstrap";

export default function OurStrory() {
  return (
    <ParallaxBackground image="/images/parallax/ourstory.webp" height="60vh">

      <div className={styles.story}>
        <h2 className={styles.title}>CÂU CHUYỆN CỦA CHÚNG TÔI</h2>
        <div className={styles.line}></div>
        <p className={styles.desc}>
          Câu chuyện của chúng tôi bắt đầu từ cam kết về chất lượng.
          Chúng tôi chỉ sử dụng những nguyên liệu tự nhiên tinh túy nhất, đảm bảo rằng mỗi cây nến đều được đổ thủ công với sự tỉ mỉ và chăm chút trong từng chi tiết.
          Với tinh thần hướng đến phát triển bền vững, chúng tôi ưu tiên lựa chọn các vật liệu thân thiện với môi trường — từ sáp đậu nành đến hộp đựng có thể tái sử dụng — để mang đến những sản phẩm tốt cho bạn và cho cả hành tinh.
        </p>
        <Button className={styles.btn}>
          <span className={styles.default}>XEM THÊM</span>
          <span className={styles.hover}>XEM THÊM</span>
        </Button>

      </div>

    </ParallaxBackground>
  );
}

