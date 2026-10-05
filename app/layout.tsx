import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "block",
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
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
    <html lang="en" className={`${inter.variable} ${serif.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('anim');setTimeout(function(){document.documentElement.classList.remove('anim')},2800)}`,
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
