"use client";
import { useState } from "react";
import { Button, Image } from "react-bootstrap";
import styles from "@/styles/components/san-pham/productDetail.module.scss";
import { ProductType } from "@/types/ProductType";

export interface ProductDetailProps {
    product: ProductType
}


export default function ProductDetail(props: ProductDetailProps) {
    const { product } = props;
    const [selectedImage, setSelectedImage] = useState(product.images[0]);

    const thumbnails = product.images;

    return (
        <section className={styles.productDetail}>
            <div className={styles.container}>
                <div className={styles.imageSection}>
                    <div className={styles.mainImage}>
                        <Image src={selectedImage} alt={product.name} />
                    </div>
                    <div className={styles.thumbnailList}>
                        {thumbnails.map((img, i) => (
                            <div
                                key={i}
                                className={`${styles.thumb} ${selectedImage === img ? styles.active : ""
                                    }`}
                                onClick={() => setSelectedImage(img)}
                            >
                                <Image src={img} alt={`thumb-${i}`} fluid />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h1 className={styles.title}>{product.name}</h1>

                    {/* <div className={styles.reviewStars}>
                        <span className={styles.stars}>★★★★★</span>
                        <span className={styles.noReview}>No reviews</span>
                    </div> */}

                    <div className={styles.priceRow}>
                        <span className={styles.salePrice}>${product.price}</span>
                        {/* <span className={styles.oldPrice}>$80.00</span> */}
                        {/* <span className={styles.saveTag}>SAVE 12%</span> */}
                    </div>

                    <p className={styles.desc}>
                        Thiết kế tối giản, đẹp mắt của ngọn nến có tông màu trung tính,
                        cho phép nó kết hợp hoàn hảo với mọi phong cách trang trí, từ hiện đại đến mộc mạc.
                        Lọ thủy tinh mờ tạo thêm ánh sáng dịu nhẹ, trang nhã cho không gian của bạn đồng thời nhân đôi
                        như một điểm nhấn tuyệt đẹp.
                    </p>

                    <div className={styles.buttonGroup}>
                        <Button className={styles.buyNow}>
                            <span className={styles.default}>Mua ngay</span>
                            <span className={styles.hover}>Mua ngay</span>
                        </Button>
                    </div>

                    <div className={styles.deliveryInfo}>
                        <p>
                            Thời gian giao hàng ước tính: <b>12–26 ngày</b> (Quốc tế),
                            <b> 3–6 ngày</b> (Hoa Kỳ).
                        </p>
                        <p>
                            Trả hàng trong vòng <b>45 ngày</b> kể từ ngày mua. Thuế và phí không hoàn lại.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
