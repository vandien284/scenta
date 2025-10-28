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
  title: "Scenta - Decor Home Shop",
  description: "Your one-stop shop for premium home decor",
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
