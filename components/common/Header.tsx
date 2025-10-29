"use client";
import {  useEffect, useState } from "react";
import { Container, Nav, Navbar, Form, Button } from "react-bootstrap";
import styles from "@/styles/components/common/header.module.scss";
import { HeaderList } from "@/router/Header";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setScrolled(true);
      else setScrolled(false);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles["fixed-header"] : ""} ${pathname === "/" ? styles["home-header"] : ""} container-width`}
    >
      <Navbar expand="lg" className={styles.navbar}>
        <Container fluid className={styles.container}>
          <div className={styles["mobile-icons"]}>
            <Button
              className={styles["menu-button"]}
              onClick={() => {
                setMenuOpen(!menuOpen);
                setSearchOpen(false);
              }}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </Button>
          </div>

          <Nav className={`${styles["nav-links"]} me-auto`}>
            {HeaderList.map((item, index) => (
              <Nav.Link as={Link} key={index} href={item.link} className={styles.link}>
                {item.title}
              </Nav.Link>
            ))}
          </Nav>
          <Navbar.Brand href="/" className={styles.logo}>
            <Image
              src={isMobile ? "/images/logo_black.webp" : "/images/logo_white.webp"}
              alt="Logo"
              width={150}
              height={44}
              priority
            />
          </Navbar.Brand>

          <div className={styles["mobile-icons"]}>
            <Button
              className={styles["search-icon"]}
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMenuOpen(false);
              }}
            >
              {searchOpen ? <FaTimes /> : <FaSearch />}
            </Button>
          </div>
          <Form className={styles["search-form"]}>
            <div className={styles["search-box"]}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className={styles["search-input"]}
                name="search"
              />
              <button type="submit" className={styles["search-button"]}>
                <FaSearch />
              </button>
            </div>
          </Form>
        </Container>
      </Navbar>
      {menuOpen && (
        <div className={styles["mobile-menu"]}>
          {HeaderList.map((item, index) => (
            <a key={index} href={item.link} className={styles["mobile-link"]}>
              {item.title}
            </a>
          ))}
        </div>
      )}
      {searchOpen && (
        <div className={styles["mobile-search"]}>
          <Form className={styles["search-form-mobile"]}>
            <div className={styles["search-box"]}>
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm..."
                className={styles["mobile-input"]}
                name="search"
              />
              <Button type="submit" className={styles["mobile-search-btn"]}>
                <FaSearch />
              </Button>
            </div>
          </Form>
        </div>
      )}
    </header>
  );
}
