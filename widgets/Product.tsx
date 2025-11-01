"use client";
import { Fragment } from "react";
import { Col, Card } from "react-bootstrap";
import Image from "next/image";
import styles from "@/styles/widgets/product.module.scss";
import { ProductType } from "@/types/ProductType";
import Link from "next/link";

interface ProductProps {
    data: ProductType;
}

export default function Product({ data }: ProductProps) {
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

