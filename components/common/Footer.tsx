"use client";
import { FaInstagram, FaEnvelope, FaFacebook, FaTiktok } from "react-icons/fa";
import styles from "@/styles/components/common/footer.module.scss";
import Image from "next/image";
import { Button, Form } from "react-bootstrap";
import { SiShopee } from "react-icons/si";
import { ScrollReveal } from "@/ui/ScrollReveal";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container-width">
        <div className={styles.top}>
          <ScrollReveal delay={0} direction="up" once={true}>
            <div className={styles.colBrand}>
              <div className={styles.logo}>
                <Image
                  src="/images/logo_black.webp"
                  alt="Logo Scenta"
                  width={150}
                  height={44}
                  priority
                />
              </div>
              <p className={styles.text}>
                Scenta mang đến trải nghiệm thư giãn và tinh tế thông qua những sản phẩm nến thơm, 
                xà phòng và hương thơm thủ công cao cấp.
              </p>
              <ul className={styles.contact}>
                <li>Địa chỉ: 123 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM</li>
                <li>Email: hello@scenta.vn</li>
                <li>Điện thoại: (+84) 1800 6868</li>
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} direction="up" once={true}>
            <div className={styles.infoServicesWrapper}>
              <div className={styles.col}>
                <h4 className={styles.heading}>THÔNG TIN</h4>
                <ul>
                  <li>Dịch vụ khách hàng</li>
                  <li>Câu hỏi thường gặp</li>
                  <li>Tra cứu đơn hàng</li>
                  <li>Liên hệ</li>
                  <li>Sự kiện</li>
                  <li>Sản phẩm nổi bật</li>
                </ul>
              </div>

              <div className={styles.col}>
                <h4 className={styles.heading}>CHÍNH SÁCH</h4>
                <ul>
                  <li>Sơ đồ trang</li>
                  <li>Chính sách bảo mật</li>
                  <li>Tài khoản của bạn</li>
                  <li>Tìm kiếm nâng cao</li>
                  <li>Điều khoản & Điều kiện</li>
                  <li>Liên hệ</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3} direction="up" once={true}>
            <div className={styles.colNews}>
              <h4 className={styles.heading}>BẢN TIN ƯU ĐÃI</h4>
              <p className={styles.text}>
                Tham gia cùng hơn 40.000 khách hàng để nhận ưu đãi và cập nhật mới nhất từ Scenta.
              </p>

              <div className={styles.subscribe}>
                <Form.Control
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn…"
                  className={styles.input}
                />
                <Button variant="dark" className={styles.btn}>
                  <FaEnvelope />
                </Button>
              </div>

              <div className={styles.socials}>
                <Button className={styles.socialIcon} aria-label="Shopee">
                  <SiShopee />
                </Button>
                <Button className={styles.socialIcon} aria-label="Facebook">
                  <FaFacebook />
                </Button>
                <Button className={styles.socialIcon} aria-label="Tiktok">
                  <FaTiktok />
                </Button>
                <Button className={styles.socialIcon} aria-label="Instagram">
                  <FaInstagram />
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1} direction="up" once={true}>
          <div className={styles.bottom}>
            <p>
              © Bản quyền 2024 | <span>Scenta</span> thuộc quyền sở hữu của{" "}
              <strong>Scenta Việt Nam</strong>. Thiết kế và phát triển bởi{" "}
              <a href="#">Scenta Studio</a>.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
