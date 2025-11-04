"use client";
import Image from "next/image";
import styles from "@/styles/components/home/customerReview.module.scss";
import ParallaxBackground from "@/ui/ParallaxBackground";
import Slider from "@/ui/Slider";
import { customers } from "@/data/CustomerData";
import { useState, useEffect, useMemo } from "react";
import sliderStyles from "@/styles/ui/slider.module.scss";
export default function CustomerReview() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 992);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const slides = useMemo(() => {
    const chunkSize = isMobile ? 1 : 2;
    return Array.from({ length: Math.ceil(customers.length / chunkSize) }, (_, i) =>
      customers.slice(i * chunkSize, i * chunkSize + chunkSize)
    );
  }, [isMobile]);

  return (
    <ParallaxBackground image="/images/parallax/customer.webp" height="100vh">
      <section className={styles.reviews}>
        <div className={styles.heading}>
          <span className={styles.sub}>TESTIMONIAL</span>
          <h2 className={styles.title}>CUSTOMER REVIEWS</h2>
          <p className={styles.desc}>What Our Satisfied Clients Are Saying</p>
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
                      <p className={styles.text}>{item.text}</p>
                    </div>

                    <div className={styles.user}>
                      <div className={styles.avatar}>
                        <Image src={item.avatar} alt={item.name} width={60} height={60} className={styles.image} />
                      </div>
                      <div className={styles.meta}>
                        <div className={styles.name}>{item.name}</div>
                        <div className={styles.role}>{item.role}</div>
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
