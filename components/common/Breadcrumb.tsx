"use client";

import Link from "next/link";
import styles from "@/styles/components/common/breadcrumb.module.scss";
import { FaChevronRight } from "react-icons/fa";
import { Fragment } from "react";

export interface Crumb {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  if (!crumbs || crumbs.length === 0) return null;

  const lastIndex = crumbs.length - 1;
  const current = crumbs[lastIndex];

  return (
    <div className={styles.heroBreadcrumb}>
      <h2 className={styles.title}>{current.name}</h2>

      <div className={styles.breadcrumb}>
        {crumbs.map((crumb, index) => (
          <span key={index} className={styles.item}>
            {index < lastIndex ? (
              <Fragment>
                <Link href={crumb.href || "#"} className={styles.link}>
                  {crumb.name}
                </Link>
                <FaChevronRight className={styles.icon} />
              </Fragment>
            ) : (
              <span className={styles.current}>{crumb.name}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
