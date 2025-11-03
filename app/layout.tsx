import type { Metadata } from "next";
import {   Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "@/styles/globals.scss";
import CartProvider from "@/components/common/CartProvider";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  variable: "--font-playfair-display",
});


export const metadata: Metadata = {
  title: "Scenta - Cửa hàng trang trí nội thất",
  description: "Nâng tầm không gian sống của bạn với bộ sưu tập trang trí nhà cao cấp của Scenta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${beVietnamPro.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
