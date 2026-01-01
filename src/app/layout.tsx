import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSPR Capital",
  description: "Overcollateralized stablecoin protocol on Casper Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased`}
        style={{ fontFamily: "'Google Sans', sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
