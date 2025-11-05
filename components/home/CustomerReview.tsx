"use client";
import Image from "next/image";
import styles from "@/styles/components/home/customerReview.module.scss";
import ParallaxBackground from "@/ui/ParallaxBackground";
import Slider from "@/ui/Slider";
import { useState, useEffect, useMemo } from "react";
import sliderStyles from "@/styles/ui/slider.module.scss";
import { ReviewType } from "@/types/ReviewType";

export default function CustomerReview() {
  const [isMobile, setIsMobile] = useState(false);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 992);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/reviews?limit=12", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        const data = (await response.json()) as { reviews?: ReviewType[] };
        if (isMounted) {
          setReviews(data.reviews ?? []);
        }
      } catch (error) {
        console.error("[CustomerReview] Unable to load reviews:", error);
        if (isMounted) {
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const slides = useMemo(() => {
    if (!reviews.length) {
      return [];
    }
    const chunkSize = isMobile ? 1 : 2;
    return Array.from({ length: Math.ceil(reviews.length / chunkSize) }, (_, i) =>
      reviews.slice(i * chunkSize, i * chunkSize + chunkSize)
    );
  }, [isMobile, reviews]);

  return (
    <ParallaxBackground image="/images/parallax/customer.webp" height="100vh">
      <section className={styles.reviews}>
        <div className={styles.heading}>
          {/* <span className={styles.sub}>ĐÁNH GIÁ</span> */}
          <h2 className={styles.title}>ĐÁNH GIÁ TỪ KHÁCH HÀNG</h2>
          <p className={styles.desc}>Khách hàng của chúng tôi đang nói gì</p>
        </div>

        <Slider options={{
          loop: false,
          align: "start",
          axis: "x",
          containScroll: "trimSnaps",
          skipSnaps: true,
          dragFree: true,
        }}
          delay={4000}
          showDots={false}
          showNav={false}
          >
          {!isLoading && slides.length === 0 ? (
            <div className={sliderStyles.embla__slide}>
              <div className={styles.cards}>
                <div className={styles.item}>
                  <div className={styles.card}>
                    <p className={styles.text}>Hiện chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {slides.map((group, idx) => (
            <div key={idx} className={sliderStyles.embla__slide}>
              <div className={styles.cards}>
                {group.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.card}>
                      <div className={styles.quote}>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="45" height="35" viewBox="0 0 40 35" fill="#008263">
                          <path d="M0 0H40V35H0V0Z" fill="url(#pattern0)"></path>
                          <defs>
                            <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                              <use xlinkHref="#image0_4_3" transform="scale(0.025 0.0285714)"></use>
                            </pattern>
                            <image id="image0_4_3" width="40" height="35" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAjCAYAAADmOUiuAAACcElEQVRYCa1Y0XHDIAxlhI7QETpCRugIDrj/3aCAB0g3SDdoN+gIGcEjZAT3BK4jgywQtu5yl8Tm8ZCehECpFrPdkxrMr7LmtWV4ccygPxR8ms2bb+XNFD/6vRmHGgjEFuz+Qr3C/7cCMJOy3Qs/QPAUIrKQM5NyvRWMViq4HQP4/jjv2e5ZeXNfCDrzKSNnu9MyOJK8ygCYtyO58YGvR+Zt4hEFAIlylLn+hsjdFcwnMm/Q6oLuhADMbKmmxbLx+vJYXYtwGXJWdytsKF0iSwG8VBvMbJlspJGhALzumCllj8BbuCLIS0oCIHY/wzfTnTQyWWil7mfIxcjMu9CyGwkiQ4X2UO8lkRHr2pvrShugk6OaAioyMF+10e4XVnVmtrSehsVL9vI0s47c0rLEAP1JkiPfa6OQbX9ifFL3iNI1LN6dBQ0B7T1op/bvubT2BNomtRdKwDH6o7Qn0h+VuVF/99DaO23lHcYc/S3vAX6IWn9RIC/WcKMYiSWF9L+gmquY6ICPBwsOhT/S5WwrObaJjsq+1bf52zgUySk/LEEmSUHA4zUk5YufSeOD2Fb2lkmXezfQbhmH8iTqquv1lwOVaqQ7fzUSRDWybYWRbKnQtkcH8OcSt4ug+WGrQ30G59EBXsH2hBg8xNmeECOC69Zb4lFX8KDX780aBMcFa8806Eb4mwVIIsmC8btLdKAZaA0z7OEl82kHze4mSIv4gNYSitpTWJMXqT7Rmfqa5cyt5LjVc5ED9Li938ONEtYB9V186zRTjSQft1cUNuiuKBu47wve1Og+Ro8KiJV2jpXbiB8wOWAPBl8WjQrq5Qb2H4lJgwZzJi4DAAAAAElFTkSuQmCC"></image>
                          </defs>
                        </svg>
                      </div>
                      <p className={styles.text}>{item.content}</p>
                    </div>

                    <div className={styles.user}>
                      <div className={styles.avatar}>
                        <Image
                          src={item.avatar ?? "/images/customer/avatar-1.webp"}
                          alt={item.reviewerName}
                          width={60}
                          height={60}
                          className={styles.image}
                        />
                      </div>
                      <div className={styles.meta}>
                        <div className={styles.name}>
                          {item.reviewerName} – {item.productName}
                        </div>
                        <div className={styles.rating}>Đánh giá: {item.rating}/5</div>
                        {item.role ? <div className={styles.role}>{item.role}</div> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </Slider>

      </section>
    </ParallaxBackground>
  );
}
