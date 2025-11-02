import Breadcrumb from "@/components/common/Breadcrumb";
import ParallaxBackground from "@/ui/ParallaxBackground";
import styles from "@/styles/view/about.module.scss";
import Image from "next/image";
import { Fragment } from "react";
import { Button } from "react-bootstrap";

const AboutPage = () => {
    return (
        <Fragment>
            <ParallaxBackground image="/images/parallax/banner-page.webp" height="40vh">
                <Breadcrumb crumbs={[{ name: "Trang chủ", href: "/" }, { name: "Giới thiệu" }]} />
            </ParallaxBackground>

            <section className={styles.aboutPage}>
                <div className="container-width">
                    <div className={styles.aboutContent}>
                        <div className={styles.textBlock}>
                            <h2>Độc Đáo & Hoàn Hảo — Chúng Tôi Là Một Thương Hiệu Tuyệt Vời</h2>
                            <p>
                                Chúng tôi là đội ngũ sáng tạo chuyên về thiết kế và sản xuất các sản phẩm nến thơm, xà phòng,
                                và phụ kiện trang trí cao cấp. Mỗi sản phẩm đều được làm thủ công tỉ mỉ,
                                mang phong cách thanh lịch và tinh tế, giúp tạo nên không gian ấm áp và thư giãn.
                            </p>
                            <p>
                                Với sự kết hợp giữa nghệ thuật và cảm xúc, chúng tôi không chỉ tạo ra sản phẩm,
                                mà còn mang đến trải nghiệm – nơi hương thơm, ánh sáng và cảm xúc hòa quyện cùng nhau.
                            </p>
                            <Button className={styles.btn}>
                                <span className={styles.default}>KHÁM PHÁ THÊM</span>
                                <span className={styles.hover}>KHÁM PHÁ THÊM</span>
                            </Button>
                        </div>

                        <div className={styles.imageBlock}>
                            <Image
                                src="/images/about/4.webp"
                                alt="Hình ảnh nến thơm"
                                fill
                                quality={75}
                                sizes="100vw"
                                className={styles.aboutImage}
                            />
                        </div>
                    </div>
                    <div className={styles.teamContent}>
                        <div className={styles.teamHeader}>
                            <h2>Gặp Gỡ Đội Ngũ Của Chúng Tôi</h2>
                            <p>
                                Chúng tôi là những con người đầy đam mê và sáng tạo, luôn nỗ lực mang đến
                                sản phẩm và trải nghiệm tốt nhất cho khách hàng.
                            </p>
                        </div>
                        <div className={styles.teamGrid}>
                            <div className={styles.memberCard}>
                                <div className={styles.memberImage}>
                                    <Image
                                        src="/images/about/avatar_01.jpg"
                                        alt="Adrian Stone"
                                        fill
                                        quality={75}
                                        sizes="100vw"

                                    />
                                </div>
                                <h4>Saga Norén</h4>
                                <span>Nhà Thiết Kế</span>
                            </div>

                            <div className={styles.memberCard}>
                                <div className={styles.memberImage}>
                                    <Image
                                        src="/images/about/avatar_02.jpg"
                                        alt="Adrian Stone"
                                        fill
                                        quality={75}
                                        sizes="100vw"

                                    />
                                </div>
                                <h4>Karen David</h4>
                                <span>Giám Đốc Sáng Tạo</span>
                            </div>

                            <div className={styles.memberCard}>
                                <div className={styles.memberImage}>
                                    <Image
                                        src="/images/about/avatar_03.jpg"
                                        alt="Adrian Stone"
                                        fill
                                        quality={75}
                                        sizes="100vw"

                                    />
                                </div>
                                <h4>Adrian Stone</h4>
                                <span>Nhà Nhiếp Ảnh</span>
                            </div>

                            <div className={styles.memberCard}>
                                <div className={styles.memberImage}>
                                    <Image
                                        src="/images/about/avatar_04.jpg"
                                        alt="Adrian Stone"
                                        fill
                                        quality={75}
                                        sizes="100vw"

                                    />
                                </div>

                                <h4>Adrian Stone</h4>
                                <span>Nhà Nhiếp Ảnh</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.storeSection}>
                        <div className={styles.storeHeader}>
                            <h2>Cửa Hàng Trên Toàn Thế Giới</h2>
                            <p>
                                Chúng tôi tự hào mang đến những sản phẩm nến thơm và vật dụng trang trí cao cấp,
                                được phân phối tại nhiều quốc gia. Mỗi không gian trưng bày đều thể hiện tinh thần sáng tạo
                                và giá trị thẩm mỹ riêng biệt của thương hiệu.
                            </p>
                        </div>

                        <div className={styles.storeGrid}>
                            <div className={`${styles.storeItem} ${styles.large}`}>
                                <Image
                                    src="/images/about/1.jpg"
                                    alt="Cửa hàng 1"
                                    fill
                                    className={styles.storeImage}
                                    quality={75}
                                    sizes="100vw"
                                />
                            </div>

                            <div className={styles.storeColumn}>
                                <div className={styles.storeItem}>
                                    <Image
                                        src="/images/about/2.webp"
                                        alt="Cửa hàng 2"
                                        fill
                                        className={styles.storeImage}
                                        quality={75}
                                        sizes="100vw"
                                    />
                                </div>
                                <div className={styles.storeItem}>
                                    <Image
                                        src="/images/about/3.webp"
                                        alt="Cửa hàng 3"
                                        fill
                                        className={styles.storeImage}
                                        quality={75}
                                        sizes="100vw"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </Fragment>
    );
};

export default AboutPage;
