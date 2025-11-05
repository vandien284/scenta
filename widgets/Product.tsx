"use client";

import { Fragment, useState } from "react";
import { Col, Card } from "react-bootstrap";
import Image from "next/image";
import styles from "@/styles/widgets/product.module.scss";
import { ProductType } from "@/types/ProductType";
import Link from "next/link";
import { useCart } from "@/components/common/CartProvider";
import { useFavorites } from "@/components/common/FavoritesProvider";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { formatCurrencyVND } from "@/utils/formatCurrency";

interface ProductProps {
  data: ProductType;
}

export default function Product({ data }: ProductProps) {
  const { addItem, isUpdating } = useCart();
  const { toggleFavorite, isFavorite, isUpdating: favoriteUpdating } = useFavorites();
  const [isAdding, setIsAdding] = useState(false);
  const available = Math.max(data.quantity - data.sold, 0);
  const isOutOfStock = available <= 0;
  const salePercent = Math.max(0, Math.min(100, data.sale ?? 0));
  const hasSale = salePercent > 0;
  const discountedValue = hasSale ? data.price * (1 - salePercent / 100) : data.price;
  const formattedDiscounted = formatCurrencyVND(discountedValue);
  const formattedOriginal = formatCurrencyVND(data.price);

  const handleAddToCart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(data.id, 1);
    } catch (error) {
      console.error("[Product] add to cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await toggleFavorite(data.id);
    } catch (error) {
      console.error("[Product] toggle favorite error:", error);
    }
  };

  const favoriteActive = isFavorite(data.id);

  return (
    <Fragment>
      <Col md={3} sm={6} xs={12} key={data.id} className="mb-4 opacity-0 visibility-hidden">
        <Link href={`/san-pham/${data.url}`}>
          <Card className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={data.images[0]}
                alt={data.name}
                width={300}
                height={300}
                className={styles.productImage}
              />
              {hasSale ? (
                <span className={styles.saleBadge}>-{salePercent}%</span>
              ) : null}
              <button
                className={`${styles.favoriteButton} ${favoriteActive ? styles.favoriteActive : ""}`}
                onClick={handleToggleFavorite}
                aria-label={favoriteActive ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
                disabled={favoriteUpdating}
              >
                {favoriteActive ? <FaHeart /> : <FaRegHeart />}
              </button>
              <div
                className={`${styles.actionsOverlay} ${isOutOfStock ? styles.overlayVisible : ""}`}
              >
                {isOutOfStock ? (
                  <span className={styles.outOfStockTag}>Out of stock</span>
                ) : (
                  <button
                    className={styles.addButton}
                    onClick={handleAddToCart}
                    disabled={isAdding || isUpdating}
                  >
                    {isAdding ? "Thêm..." : "Thêm vào giỏ hàng"}
                  </button>
                )}
              </div>
            </div>
            <Card.Body className="text-center">
              <Card.Title className={styles.name}>{data.name}</Card.Title>
              <Card.Text className={styles.priceWrapper}>
                {hasSale ? (
                  <>
                    <span className={styles.salePrice}>{formattedDiscounted} VND</span>
                    <span className={styles.originalPrice}>{formattedOriginal} VND</span>
                  </>
                ) : (
                  <span className={styles.regularPrice}>{formattedDiscounted}</span>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Link>
      </Col>
    </Fragment>
  );
}
