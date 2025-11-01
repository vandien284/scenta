"use client";
import { FaInstagram, FaEnvelope, FaFacebook, FaTiktok } from "react-icons/fa";
import styles from "@/styles/components/common/footer.module.scss";
import Image from "next/image";
import { Button, Form } from "react-bootstrap";
import { SiShopee } from "react-icons/si";
import { ScrollReveal } from "@/ui/ScrollReveal";
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container-width">
        <div className={styles.top}>
          <ScrollReveal delay={0} direction="up" once={true}>
            <div className={styles.colBrand}>
              <div className={styles.logo}>
                <Image
                  src="/images/logo_black.webp"
                  alt="Logo"
                  width={150}
                  height={44}
                  priority
                /></div>
              <p className={styles.text}>
                Praesent nec nisl a purus blandit viverra. Pellentesque habitant morbi tristique
                senectus.
              </p>
              <ul className={styles.contact}>
                <li>Address: 1234 Heaven Stress, USA.</li>
                <li>Email: hello@domain.com</li>
                <li>Fax: (+100) 123 456 7890</li>
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1} direction="up" once={true}>
            <div className={styles.infoServicesWrapper}>
              <div className={styles.col}>
                <h4 className={styles.heading}>INFO</h4>
                <ul>
                  <li>Custom Service</li>
                  <li>F.A.Q.’s</li>
                  <li>Ordering Tracking</li>
                  <li>Contact Us</li>
                  <li>Events</li>
                  <li>Popular</li>
                </ul>
              </div>
              <div className={styles.col}>
                <h4 className={styles.heading}>SERVICES</h4>
                <ul>
                  <li>Sitemap</li>
                  <li>Privacy Policy</li>
                  <li>Your Account</li>
                  <li>Advanced Search</li>
                  <li>Term & Condition</li>
                  <li>Contact Us</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.3} direction="up" once={true}>

            <div className={styles.colNews}>
              <h4 className={styles.heading}>NEWSLETTERS</h4>
              <p className={styles.text}>
                Join 40.00+ Subscribers and get a new discount coupon
              </p>

              <div className={styles.subscribe}>
                <Form.Control
                  type="email"
                  placeholder="Your email address…"
                  className={styles.input}
                />
                <Button variant="dark" className={styles.btn}>
                  <FaEnvelope />
                </Button>
              </div>
              <div className={styles.socials}>
                <Button className={styles.socialIcon}>
                  <SiShopee />
                </Button>
                <Button className={styles.socialIcon}>
                  <FaFacebook />
                </Button>
                <Button className={styles.socialIcon}>
                  <FaTiktok />
                </Button>
                <Button className={styles.socialIcon}>
                  <FaInstagram />
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={0.1} direction="up" once={true}>
          <div className={styles.bottom}>
            <p>
              © Copyright 2024 | <span>Scenta</span> By <strong>Scenta</strong>. Powered by{" "}
              <a href="#">Scenta</a>.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
