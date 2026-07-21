import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  // Allow build to succeed even when Google Fonts is unreachable
  fallback: ["system-ui", "Arial", "sans-serif"],
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Dashboard PLTS & Bank Sampah | DEB Kembara",
  description:
    "Platform monitoring energi surya dan pengelolaan konversi bank sampah. Pantau daya PLTS real-time, tabungan CO₂, dan estimasi saldo bank sampah Anda.",
  keywords: ["PLTS", "Bank Sampah", "Energi Surya", "Solar Panel", "Dashboard", "KKN-T 40 Kemambang"],
  authors: [{ name: "KKN-T 40 Kemambang — DEB Kembara" }],
  openGraph: {
    title: "Dashboard PLTS & Bank Sampah | DEB Kembara",
    description: "Monitoring energi surya dan bank sampah terintegrasi oleh KKN-T 40 Kemambang",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9FA]">{children}</body>
    </html>
  );
}
