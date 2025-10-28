"use client";
import { Fragment } from "react";
import { Col, Card } from "react-bootstrap";
import Image from "next/image";
import styles from "@/styles/ui/product.module.scss";
import { ProductType } from "@/types/ProductType";


interface ProductProps {
    data: ProductType;
}

export default function Product({ data }: ProductProps) {
    return (
        <Fragment>
            <Col md={3} sm={6} xs={12} key={data.id} className="mb-4 opacity-0 visibility-hidden">
                <Card className={styles.card}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src={data.image}
                            alt={data.name}
                            width={300}
                            height={300}
                            className={styles.productImage}
                        />
                    </div>
                    <Card.Body className="text-center">
                        <Card.Title className={styles.name}>{data.name}</Card.Title>
                        <Card.Text>
                            <span className={styles.price}>${data.price.toFixed(2)}</span>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Col>
        </Fragment>
    );
}

