import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const grotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Remora · The chatbot that sticks with you",
  description:
    "Remora is the Walrus Sessions 8 chatbot that remembers you. It stores what you tell it on Walrus and recalls it between visits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${grotesk.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
