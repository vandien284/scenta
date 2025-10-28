"use client";
import { useState } from "react";
import { Nav } from "react-bootstrap";
import styles from "@/styles/ui/tabs.module.scss";

interface TabItem {
  id: number;
  title: string;
}

interface TabsProps {
  tabs: TabItem[] | TabItem;
  onChange?: (id: number) => void;
}

export default function Tabs({ tabs, onChange }: TabsProps) {
  const normalizedTabs: TabItem[] = Array.isArray(tabs) ? tabs : [tabs];

  const [activeId, setActiveId] = useState<number>(
    normalizedTabs[0]?.id ?? 0
  );

  const handleSelect = (id: number) => {
    if (normalizedTabs.length <= 1) return;
    setActiveId(id);
    onChange?.(id);
  };

  return (
    <Nav className={styles.tabs} justify>
      {normalizedTabs.map((tab) => (
        <Nav.Item key={tab.id} className={styles["nav-item"]}>
          <Nav.Link
            className={`${styles["nav-link"]} ${tab.id === activeId ? styles.active : ""}`}
            onClick={() => handleSelect(tab.id)}
          >
            {tab.title}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
}
