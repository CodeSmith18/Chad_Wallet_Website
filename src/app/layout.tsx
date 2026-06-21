import type { Metadata } from "next";
import { PrivyRoot } from "@/components/PrivyRoot";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chadwallet.app"),
  title: "ChadWallet | Solana Meme Trading",
  description:
    "Discover trending Solana memes, track top wallets, and trade before the crowd catches up.",
  openGraph: {
    title: "ChadWallet | Solana Meme Trading",
    description:
      "Discover trending Solana memes, track top wallets, and trade before the crowd catches up.",
    images: ["/assets/app-store/discover.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <PrivyRoot>{children}</PrivyRoot>
      </body>
    </html>
  );
}
