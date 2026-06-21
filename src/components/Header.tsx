import Image from "next/image";
import Link from "next/link";
import { Apple, ChevronRight, Fingerprint, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-chad-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 overflow-hidden rounded-full border border-white/15 bg-white">
            <Image
              src="/assets/logo/chad-light.png"
              alt="ChadWallet"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
          <span className="text-lg font-black text-chad-white">ChadWallet</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold text-white/65 md:flex">
          <Link className="transition hover:text-chad-white" href="#signals">
            Signals
          </Link>
          <Link className="transition hover:text-chad-white" href="#terminal">
            Terminal
          </Link>
          <Link className="transition hover:text-chad-white" href="#download">
            Download
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80 transition hover:border-white/30 hover:text-chad-white sm:flex">
            <Apple className="h-4 w-4" />
            <Fingerprint className="h-4 w-4" />
            Privy
          </button>
          <Link
            href="/trade/bonk"
            className="flex items-center gap-1 rounded-full bg-chad-lime px-4 py-2 text-sm font-black text-chad-black transition hover:bg-chad-mint"
          >
            Trade
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/[0.03] px-4 py-2 text-center text-xs font-bold text-white/55 sm:hidden">
        <span className="inline-flex items-center gap-1">
          <Zap className="h-3 w-3 text-chad-lime" />
          Apple / Google sign-in ready for Privy keys
        </span>
      </div>
    </header>
  );
}
