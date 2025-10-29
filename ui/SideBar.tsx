"use client";
import { ReactNode } from "react";
import styles from "@/styles/ui/sideBar.module.scss";

interface UILeftSidebarProps {
    children: ReactNode;
}

export default function UISideBar({ children }: UILeftSidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.content}>{children}</div>
        </aside>
    );
}
