import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKYLUX Airways — Commercial Flights & Private Jet Charters",
  description: "Book commercial flights and private jet charters across 200+ destinations worldwide. One platform, extraordinary service.",
  keywords: "airline booking, private jet, commercial flights, luxury travel, SKYLUX Airways",
  openGraph: {
    title: "SKYLUX Airways",
    description: "Where every journey becomes an experience",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
