"use client";
import Tabs from "@/ui/Tabs";
import { TabProductDetail } from "@/data/TabsData";
import styles from "@/styles/components/san-pham/infoTabs.module.scss";
import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
export default function InfoTabs() {
    const [activeTab, setActiveTab] = useState(1);
    const [animate, setAnimate] = useState(false);
    const handleTabChange = useCallback((id: number) => {
        setAnimate(true);
        setActiveTab(id);
        setTimeout(() => setAnimate(false), 600);
    }, []);
    return (
        <section className={styles.infoTabs}>
            <Tabs tabs={TabProductDetail} onChange={handleTabChange} />
            <div className={styles.tabsContent}>
                {activeTab === 1 && (
                    <div className={`${styles.tabPane} ${animate ? styles.fadeInUp : ""}`}>
                        <div className={styles.wrapper}>
                            <div className={styles.textContent}>
                                <p className={styles.intro}>
                                    Mỗi sản phẩm được tạo nên từ sự tỉ mỉ trong từng chi tiết. Chúng tôi tin rằng ánh sáng,
                                    mùi hương và chất liệu đều góp phần tạo nên cảm xúc thư giãn, giúp không gian sống trở
                                    nên ấm áp và tinh tế hơn.
                                </p>

                                <h3 className={styles.heading}>Đặc điểm nổi bật</h3>
                                <p>
                                    Với thiết kế thanh lịch, sản phẩm phù hợp với nhiều phong cách trang trí — từ hiện đại,
                                    tối giản đến cổ điển. Được chế tác từ những nguyên liệu an toàn, thân thiện với môi
                                    trường và bền bỉ theo thời gian.
                                </p>

                                <ul className={styles.featureList}>
                                    <li>Thiết kế tinh tế – phù hợp mọi không gian từ phòng khách đến phòng ngủ.</li>
                                    <li>Chất liệu cao cấp – an toàn, thân thiện và bền bỉ.</li>
                                    <li>Mùi hương dịu nhẹ – mang lại cảm giác thư giãn, dễ chịu.</li>
                                    <li>Dễ sử dụng và vệ sinh – tiện lợi cho cuộc sống hằng ngày.</li>
                                    <li>Đóng gói sang trọng – thích hợp làm quà tặng cho người thân, bạn bè.</li>
                                </ul>

                                <p>
                                    Mỗi chi tiết đều được chăm chút tỉ mỉ nhằm mang lại trải nghiệm hoàn hảo nhất cho người
                                    dùng. Chúng tôi mong rằng sản phẩm sẽ không chỉ là vật dụng, mà còn là một phần cảm xúc
                                    trong không gian sống của bạn.
                                </p>

                                <h3 className={styles.heading}>Chất lượng sản phẩm vượt trội</h3>
                                <p>
                                    Được sản xuất với quy trình nghiêm ngặt và nguyên liệu được tuyển chọn kỹ càng, sản phẩm
                                    không chỉ mang lại vẻ đẹp thẩm mỹ mà còn đảm bảo độ bền và an toàn tối đa khi sử dụng.
                                </p>
                            </div>

                            <div className={styles.imageWrapper}>
                                <Image
                                    src="/images/product-info/1.webp"
                                    alt="Chi tiết sản phẩm"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    fill
                                />
                            </div>
                        </div>
                        <div className={styles.featureGrid}>
                            <div className={styles.featureItem}>
                                <div className={styles.featuredImage}>
                                    <Image
                                        src="/images/product-info/2.webp"
                                        alt="Thông tin sản phẩm"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        fill
                                    />
                                </div>


                                <h4>Thông tin sản phẩm</h4>
                                <p>
                                    Thiết kế hài hòa, phù hợp với nhiều mục đích sử dụng khác nhau. Mỗi sản phẩm đều được tối
                                    ưu để mang lại sự tiện dụng và thoải mái nhất cho người dùng.
                                </p>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featuredImage}>
                                    <Image
                                        src="/images/product-info/3.webp"
                                        alt="Chất liệu và gia công"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        fill
                                    />

                                </div>

                                <h4>Chất liệu & Gia công</h4>
                                <p>
                                    Sử dụng chất liệu cao cấp và quy trình sản xuất thủ công tỉ mỉ, mang lại độ bền cao và vẻ
                                    ngoài tinh tế, sang trọng.
                                </p>
                            </div>

                            <div className={styles.featureItem}>
                                <div className={styles.featuredImage}>
                                    <Image
                                        src="/images/product-info/4.webp"
                                        alt="Hướng dẫn sử dụng"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        fill
                                    />
                                </div>


                                <h4>Hướng dẫn sử dụng</h4>
                                <p>
                                    Dễ dàng sử dụng trong nhiều không gian khác nhau. Hãy đặt sản phẩm trên bề mặt phẳng,
                                    tránh gió mạnh và xa tầm tay trẻ em.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 2 && (
                    <div className={`${styles.tabPane} ${animate ? styles.fadeInUp : ""}`}>

                        <div className={styles.shippingWrapper}>
                            <p>
                                Với mọi đơn hàng có giá trị trên <strong>2.500.000₫</strong>, chúng tôi miễn phí vận chuyển
                                toàn quốc.
                            </p>
                            <p>
                                Đơn hàng được chấp nhận đổi trả trong vòng <strong>10 ngày</strong> kể từ ngày nhận hàng
                                (hoặc theo mã vận đơn) đối với sản phẩm chưa qua sử dụng và còn nguyên tem mác.
                            </p>
                            <p>
                                Quý khách vui lòng liên hệ với chúng tôi qua email trước khi tiến hành hoàn trả sản phẩm
                                để được hướng dẫn chi tiết.
                            </p>
                            <p>
                                Trong trường hợp khác, phí vận chuyển tiêu chuẩn sẽ được áp dụng. Vui lòng xem thêm chi tiết
                                trong phần{" "}
                                <Link href="/chinh-sach/van-chuyen" className={styles.link}>
                                    Điều khoản & Chính sách giao hàng
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}