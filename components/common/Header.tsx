"use client";
import { useEffect, useState } from "react";
import { Container, Nav, Navbar, Form, Button } from "react-bootstrap";
import styles from "@/styles/components/common/header.module.scss";
import { HeaderList } from "@/router/Header";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/components/common/CartProvider";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const cartCount = cart?.totalQuantity ?? 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
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

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const searchQuery = (formData.get("search") as string)?.trim();

    if (!searchQuery) return;

    router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery)}`);

    form.reset();
  };

  const handleCartNavigate = () => {
    router.push("/gio-hang");
    setMenuOpen(false);
    setSearchOpen(false);
  };

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
            <button className={styles.cartIconButton} onClick={handleCartNavigate}>
              <FiShoppingBag />
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>
          </div>

          <Navbar.Brand as={Link} href="/" className={styles.logo}>
            <Image
              src={isMobile ? "/images/logo_black.webp" : "/images/logo_white.webp"}
              alt="Logo"
              width={150}
              height={44}
              priority
            />
          </Navbar.Brand>

          <Nav className={`${styles["nav-links"]} me-auto`}>
            {HeaderList.map((item, index) => (
              <Nav.Link as={Link} key={index} href={item.link} className={styles.link}>
                {item.title}
              </Nav.Link>
            ))}
          </Nav>

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
          <div className={styles.searchCartGroup}>
            <Form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className={styles.searchInput}
                  name="search"
                />
                <button type="submit" className={styles.searchButton}>
                  <FaSearch />
                </button>
              </div>
            </Form>

            <button className={styles.cartButton} onClick={handleCartNavigate}>
              <FiShoppingBag />
              {cartCount > 0 && <span className={styles.cartCount}>{cartCount}</span>}
            </button>
          </div>

        </Container>
      </Navbar>
      {menuOpen && (
        <div className={styles["mobile-menu"]}>
          {HeaderList.map((item, index) => (
            <Link key={index} href={item.link} className={styles["mobile-link"]}>
              {item.title}
            </Link>
          ))}
        </div>
      )}
      {searchOpen && (
        <div className={styles["mobile-search"]}>
          <Form onSubmit={handleSearchSubmit} className={styles["search-form-mobile"]}>
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
