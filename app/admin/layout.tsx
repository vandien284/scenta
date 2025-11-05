"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/components/admin/layout.module.scss";
import { ReactNode } from "react";
import { FiBarChart2, FiPackage, FiShoppingCart, FiHome } from "react-icons/fi";

const NAV_ITEMS = [
  {
    label: "Tổng quan",
    icon: <FiBarChart2 />,
    href: "/admin",
  },
  {
    label: "Sản phẩm",
    icon: <FiPackage />,
    href: "/admin/products",
  },
  {
    label: "Đơn hàng",
    icon: <FiShoppingCart />,
    href: "/admin/orders",
  },
  {
    label: "Trang chủ",
    icon: <FiHome />,
    href: "/",
    external: true,
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.logo}>
          Scenta Admin
        </Link>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <Link key={item.href} href={item.href} className={styles.navItem}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          )}
        </nav>
      </aside>
      <div className={styles.main}>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
