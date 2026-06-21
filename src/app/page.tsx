import { DownloadBand } from "@/components/DownloadBand";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MotionLayer } from "@/components/MotionLayer";
import { ProductGallery } from "@/components/ProductGallery";
import { SignalFlow } from "@/components/SignalFlow";
import { TerminalPreview } from "@/components/TerminalPreview";
import { TokenTape } from "@/components/TokenTape";

export default function Home() {
  return (
    <main className="min-h-screen bg-chad-black text-chad-white">
      <MotionLayer />
      <TokenTape direction="left" tone="top" />
      <Header />
      <Hero />
      <SignalFlow />
      <ProductGallery />
      <TerminalPreview />
      <DownloadBand />
      <TokenTape direction="right" tone="bottom" />
      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-white/45">
        <span className="font-black text-white">ChadWallet</span> is the Solana
        meme trading lobby for wallet watchers, launch hunters, and fast movers.
      </footer>
    </main>
  );
}
