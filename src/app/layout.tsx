import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "SSK Pragati Pratishthana, Bengaluru",
  description: "Staff matrimonial records desk",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [{ url: "/ssk-logo.jpg", type: "image/jpeg" }],
    apple: [{ url: "/ssk-logo.jpg", type: "image/jpeg" }],
    shortcut: "/ssk-logo.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full dark`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
