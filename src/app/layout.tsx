import type { Metadata } from "next";
import { Outfit, Space_Mono, Oxanium } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SYNEX // Cybernetic Exoskeleton",
  description: "Interactive disassembly of the SYNEX grade-5 titanium alloy exoskeleton mask.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceMono.variable} ${oxanium.variable} antialiased`}
    >
      <body className="flex flex-col bg-black">{children}</body>
    </html>
  );
}
