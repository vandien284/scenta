import Image from "next/image";
import styles from "@/styles/view/contact.module.scss";
import { Fragment } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { FaRegEnvelopeOpen } from "react-icons/fa";

const ContactPage = () => {
    return (
        <Fragment>
            <section className={styles.mapSection}>
                <div className={styles.mapContainer}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44339.40858381403!2d106.70803917428506!3d10.804643907719623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293dceb22197%3A0x755bb0f39a48d4a6!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBHaWFvIFRow7RuZyBW4bqtbiBU4bqjaSBUaMOgbmggUGjhu5EgSOG7kyBDaMOtIE1pbmggLSBDxqEgc-G7nyAx!5e0!3m2!1svi!2s!4v1762081538213!5m2!1svi!2s"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </section>

            <section className={styles.contactSection}>
                <div className="container-width">
                    <div className={styles.contactContent}>

                        <div className={styles.infoBlock}>
                            <h2>Liên Hệ Với Chúng Tôi</h2>
                            <p>
                                Nếu bạn muốn biết thêm thông tin về chính sách hoặc sản phẩm,
                                vui lòng liên hệ với chúng tôi qua các kênh bên dưới. Đội ngũ hỗ trợ
                                sẽ phản hồi sớm nhất có thể trong giờ làm việc.
                            </p>

                            <div className={styles.infoItem}>
                                <FaMapMarkerAlt />
                                <div>
                                    <h5>Địa chỉ</h5>
                                    <p>123 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <FaPhoneAlt />
                                <div>
                                    <h5>Điện thoại</h5>
                                    <p>(+84) 1800 68 68</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <FaEnvelope />
                                <div>
                                    <h5>Email</h5>
                                    <p>hello@domain.com</p>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <FaClock />
                                <div>
                                    <h5>Giờ làm việc</h5>
                                    <p>Thứ Hai – Thứ Sáu: 09:30 – 17:30</p>
                                    <p>Thứ Bảy & Chủ Nhật: 10:00 – 15:00</p>
                                </div>
                            </div>
                        </div>


                        <div className={styles.formBlock}>
                            <h2>Gửi Tin Nhắn Cho Chúng Tôi</h2>
                            <form>
                                <input type="text" placeholder="Họ và tên..." required />
                                <input type="email" placeholder="Email của bạn..." required />
                                <textarea rows={10} placeholder="Nội dung tin nhắn..." required></textarea>
                                <Button type="submit" className={styles.btn}>
                                    <span className={styles.default}>GỬI NGAY</span>
                                    <span className={styles.hover}>GỬI NGAY</span>
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.newsletterSection}>
                <div className="container-width">
                    <div className={styles.newsletterContent}>
                        <div className={styles.newsLeft}>
                            <FaRegEnvelopeOpen className={styles.mailIcon} />
                            <div className={styles.textBlock}>
                                <h4>ĐĂNG KÝ</h4>
                                <h4>NHẬN BẢN TIN</h4>
                            </div>
                        </div>
                        <div className={styles.divider}></div>

                        <div className={styles.newsCenter}>
                            <p>
                                Đăng ký để nhận bản tin hàng tuần và cập nhật những thông tin mới nhất từ chúng tôi.
                            </p>
                        </div>

                        <form className={styles.newsForm}>
                            <input type="email" placeholder="Nhập địa chỉ email của bạn..." required />

                            <Button type="submit" className={styles.btn}>
                                <span className={styles.default}>ĐĂNG KÝ</span>
                                <span className={styles.hover}>ĐĂNG KÝ</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </section>


        </Fragment>
    );
};

export default ContactPage;
