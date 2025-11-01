import type { Metadata } from "next";
import {  Jost, Cinzel } from "next/font/google";
import "@/styles/globals.scss";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"]
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"]
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
    <html lang="en" className={`${jost.variable} ${cinzel.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
