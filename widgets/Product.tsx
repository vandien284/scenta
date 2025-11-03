"use client";

import { Fragment, useState } from "react";
import { Col, Card } from "react-bootstrap";
import Image from "next/image";
import styles from "@/styles/widgets/product.module.scss";
import { ProductType } from "@/types/ProductType";
import Link from "next/link";
import { useCart } from "@/components/common/CartProvider";

interface ProductProps {
  data: ProductType;
}

export default function Product({ data }: ProductProps) {
  const { addItem, isUpdating } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const available = Math.max(data.quantity - data.sold, 0);
  const isOutOfStock = available <= 0;

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
                    {isAdding ? "Adding..." : "Add to cart"}
                  </button>
                )}
              </div>
            </div>
            <Card.Body className="text-center">
              <Card.Title className={styles.name}>{data.name}</Card.Title>
              <Card.Text>
                <span className={styles.price}>${data.price.toFixed(2)}</span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Link>
      </Col>
    </Fragment>
  );
}
