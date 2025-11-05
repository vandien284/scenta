"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Image } from "react-bootstrap";
import styles from "@/styles/components/san-pham/productDetail.module.scss";
import { ProductType } from "@/types/ProductType";
import { useCart } from "@/components/common/CartProvider";
import { useFavorites } from "@/components/common/FavoritesProvider";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { formatCurrencyVND } from "@/utils/formatCurrency";

export interface ProductDetailProps {
  product: ProductType;
}

const SELECTED_STORAGE_KEY = "checkoutSelectedProductIds";
const DEFAULT_COUNTRY = "Việt Nam";

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, updateItem, isUpdating } = useCart();
  const { toggleFavorite, isFavorite, isUpdating: favoriteUpdating } = useFavorites();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  const salePercent = Math.max(0, Math.min(100, product.sale ?? 0));
  const hasSale = salePercent > 0;
  const originalPrice = product.price;
  const discountedPrice = hasSale ? originalPrice * (1 - salePercent / 100) : originalPrice;
  const formattedDiscountedPrice = formatCurrencyVND(discountedPrice);
  const formattedOriginalPrice = formatCurrencyVND(originalPrice);

  const available = useMemo(
    () => Math.max(product.quantity - product.sold, 0),
    [product.quantity, product.sold]
  );
  const isOutOfStock = available <= 0;

  const [quantity, setQuantity] = useState(isOutOfStock ? 0 : 1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const thumbnails = product.images;

  const favoriteActive = isFavorite(product.id);

  const handleToggleFavorite = async () => {
    if (favoriteUpdating) return;
    try {
      await toggleFavorite(product.id);
    } catch (error) {
      console.error("[ProductDetail] toggle favorite error:", error);
    }
  };

  const clampQuantity = (value: number) => {
    if (isOutOfStock) return 0;
    return Math.min(Math.max(1, value), available);
  };

  const descriptionHtml = useMemo(() => {
    if (product.description?.trim()) {
      return product.description;
    }
    return "<strong>Mô tả:</strong> Được rót bằng tay với hương thơm nhẹ nhàng, hoàn hảo để nâng tầm mọi không gian sống.";
  }, [product.description]);

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

  const handleBuyNow = async () => {
    if (isOutOfStock || quantity <= 0 || isBuying) return;
    setIsBuying(true);
    try {
      await updateItem(product.id, quantity);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("checkoutCountry", DEFAULT_COUNTRY);
        window.localStorage.setItem(
          SELECTED_STORAGE_KEY,
          JSON.stringify([product.id])
        );
      }
      router.push("/thanh-toan");
    } catch (error) {
      console.error("[ProductDetail] buy now error:", error);
    } finally {
      setIsBuying(false);
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
            {thumbnails.map((img, index) => (
              <div
                key={index}
                className={`${styles.thumb} ${selectedImage === img ? styles.active : ""}`}
                onClick={() => setSelectedImage(img)}
              >
                <Image src={img} alt={`thumb-${index}`} fluid />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.headingRow}>
            <div className={styles.headingTitle}>
              <h1 className={styles.title}>{product.name}</h1>
              <button
                type="button"
                className={`${styles.favoriteButton} ${favoriteActive ? styles.favoriteActive : ""}`}
                onClick={handleToggleFavorite}
                aria-label={favoriteActive ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
                disabled={favoriteUpdating}
              >
                {favoriteActive ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
            {isOutOfStock ? (
              <span className={styles.outOfStockBadge}>Hết hàng</span>
            ) : (
              <span className={styles.inStockBadge}>Còn hàng: {available}</span>
            )}
          </div>

          <div className={styles.priceRow}>
            <span className={styles.salePrice}>{formattedDiscountedPrice}</span>
            {hasSale ? (
              <>
                <span className={styles.originalPrice}>{formattedOriginalPrice}</span>
                <span className={styles.saleTag}>-{salePercent}%</span>
              </>
            ) : null}
          </div>

          <div className={styles.stockMeta}>
            <span>
              Đã bán: <strong>{product.sold}</strong>
            </span>
          </div>

          <div
            className={styles.desc}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />

          <div className={styles.actionsWrapper}>
            <div className={styles.quantitySelector}>
              <button onClick={handleDecrease} disabled={isOutOfStock || quantity <= 1}>
                -
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
                <span className={styles.default}>
                  {isOutOfStock ? "Hết hàng" : isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                </span>
                <span className={styles.hover}>
                  {isOutOfStock ? "Hết hàng" : isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                </span>
              </Button>

              <Button
                className={styles.buyNow}
                onClick={handleBuyNow}
                disabled={isOutOfStock || isBuying || isUpdating}
              >
                <span className={styles.default}>
                  {isOutOfStock ? "Hết hàng" : isBuying ? "Đang xử lý..." : "Mua ngay"}
                </span>
                <span className={styles.hover}>
                  {isOutOfStock ? "Hết hàng" : isBuying ? "Đang xử lý..." : "Mua ngay"}
                </span>
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
