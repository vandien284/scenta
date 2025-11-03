"use client";

import { useMemo, useState } from "react";
import { Button, Image } from "react-bootstrap";
import styles from "@/styles/components/san-pham/productDetail.module.scss";
import { ProductType } from "@/types/ProductType";
import { useCart } from "@/components/common/CartProvider";

export interface ProductDetailProps {
  product: ProductType;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, isUpdating } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  const available = useMemo(
    () => Math.max(product.quantity - product.sold, 0),
    [product.quantity, product.sold]
  );
  const isOutOfStock = available <= 0;

  const [quantity, setQuantity] = useState(isOutOfStock ? 0 : 1);
  const [isAdding, setIsAdding] = useState(false);

  const thumbnails = product.images;

  const clampQuantity = (value: number) => {
    if (isOutOfStock) return 0;
    return Math.min(Math.max(1, value), available);
  };

  const handleIncrease = () => {
    setQuantity((prev) => clampQuantity(prev + 1));
  };

  const handleDecrease = () => {
    setQuantity((prev) => clampQuantity(prev - 1));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || quantity <= 0 || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
    } catch (error) {
      console.error("[ProductDetail] add to cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

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
                className={`${styles.thumb} ${selectedImage === img ? styles.active : ""}`}
                onClick={() => setSelectedImage(img)}
              >
                <Image src={img} alt={`thumb-${i}`} fluid />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.headingRow}>
            <h1 className={styles.title}>{product.name}</h1>
            {isOutOfStock ? (
              <span className={styles.outOfStockBadge}>Hết hàng</span>
            ) : (
              <span className={styles.inStockBadge}>Còn hàng: {available}</span>
            )}
          </div>

          <div className={styles.priceRow}>
            <span className={styles.salePrice}>${product.price.toFixed(2)}</span>
          </div>

          <div className={styles.stockMeta}>
            <span>Đã bán: <strong>{product.sold}</strong></span>
            {/* <span>Tổng hàng tồn: <strong>{product.quantity}</strong></span> */}
          </div>

          <p className={styles.desc}>
            {product.description ??
              "Được rót bằng tay với hương thơm nhẹ nhàng, hoàn hảo để nâng tầm mọi không gian sống."}
          </p>

          <div className={styles.actionsWrapper}>
            <div className={styles.quantitySelector}>
              <button onClick={handleDecrease} disabled={isOutOfStock || quantity <= 1}>
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, "");
                  const nextQuantity = digits ? Number(digits) : 0;
                  setQuantity(clampQuantity(nextQuantity));
                }}
                disabled={isOutOfStock}
              />
              <button onClick={handleIncrease} disabled={isOutOfStock || quantity >= available}>
                +
              </button>
            </div>

            <div className={styles.buttonGroup}>
              <Button
                className={styles.addToCart}
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding || isUpdating}
              >
                <span className={styles.default}>{isOutOfStock ? "Hết hàng" : isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}</span>
                <span className={styles.hover}>{isOutOfStock ? "Hết hàng" : isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}</span>

              </Button>

              <Button className={styles.buyNow}>
                <span className={styles.default}>Mua ngay</span>
                <span className={styles.hover}>Mua ngay</span>
              </Button>
            </div>
          </div>

          <div className={styles.deliveryInfo}>
            <p>
              Thời gian giao hàng dự kiến: <b>12-16 ngày</b> trên toàn thế giới, <b>3-5 ngày</b> trong nước.
            </p>
            <p>
              Chấp nhận trả hàng trong vòng <b>45 ngày</b> kể từ ngày mua. Thuế và phí không hoàn lại.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
