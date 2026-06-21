import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  Flame,
  Radio,
  ScanSearch,
  ShieldCheck,
  Zap
} from "lucide-react";
import { liveTrades, marketTokens } from "@/data/tokens";

const appStoreUrl =
  process.env.NEXT_PUBLIC_APP_STORE_URL ??
  "https://apps.apple.com/us/app/chadwallet/id6757367474";
const playStoreUrl =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

const proofPoints = [
  {
    icon: Radio,
    value: "Live tape",
    label: "Top wallets, KOLs, launches"
  },
  {
    icon: ScanSearch,
    value: "Signal first",
    label: "Search tokens, wallets, tweets"
  },
  {
    icon: ShieldCheck,
    value: "Privy ready",
    label: "Apple and Google sign-in"
  }
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-chad-black">
      <div className="noise-layer pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:min-h-[760px] lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <div
            data-reveal
            className="mb-6 flex w-fit items-center gap-2 rounded-full border border-chad-lime/35 bg-chad-lime/10 px-4 py-2 text-sm font-black text-chad-lime"
          >
            <Flame className="h-4 w-4" />
            Solana meme coin command center
          </div>

          <h1
            data-reveal
            data-delay="90ms"
            className="text-5xl font-black leading-[0.95] text-chad-white sm:text-6xl lg:text-7xl"
          >
            ChadWallet for Solana memes.
          </h1>
          <p
            data-reveal
            data-delay="170ms"
            className="mt-6 text-2xl font-black leading-tight text-white/92 sm:text-4xl"
          >
            Follow the wallets. Catch the move. Trade before the crowd.
          </p>
          <p
            data-reveal
            data-delay="250ms"
            className="mt-5 max-w-xl text-base leading-7 text-white/62 sm:text-lg"
          >
            A social trading lobby for live wallet moves, trending launches, token
            context, and fast Solana execution.
          </p>

          <div
            data-reveal
            data-delay="330ms"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/trade/bonk"
              data-magnetic="10"
              className="magnetic inline-flex items-center justify-center gap-2 rounded-full bg-chad-lime px-6 py-4 text-sm font-black text-chad-black transition hover:bg-chad-mint"
            >
              Start trading
              <ArrowUpRight className="h-5 w-5" />
            </Link>
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noreferrer"
              data-magnetic="7"
              className="magnetic inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-6 py-4 text-sm font-black text-chad-white transition hover:border-white/30 hover:bg-white/[0.09]"
            >
              <Download className="h-5 w-5" />
              iPhone app
            </a>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              data-magnetic="7"
              className="magnetic inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.05] px-6 py-4 text-sm font-black text-chad-white transition hover:border-white/30 hover:bg-white/[0.09]"
            >
              Android
            </a>
          </div>

          <div
            data-reveal
            data-delay="410ms"
            className="mt-8 grid gap-2 sm:grid-cols-3"
          >
            {proofPoints.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.value}
                  className="premium-card flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-chad-lime">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-white">
                      {item.value}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-white/45">
                      {item.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          data-reveal
          data-delay="220ms"
          className="premium-card rounded-lg border border-white/10 bg-white/[0.035] p-3 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3">
            <div>
              <p className="text-xs font-black uppercase text-white/42">
                ChadWallet live lobby
              </p>
              <p className="mt-1 text-sm font-black text-white">
                Social signals into Solana trades
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-chad-lime/25 bg-chad-lime/10 px-3 py-1.5 text-xs font-black text-chad-lime">
              <span className="h-2 w-2 rounded-full bg-chad-lime animate-slow-pulse" />
              Live
            </div>
          </div>

          <div className="grid gap-3 pt-3 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[290px] overflow-hidden rounded-lg border border-white/10 bg-chad-ink sm:min-h-[430px] lg:min-h-[520px]">
              <div data-parallax="0.1" className="parallax-media absolute inset-0 scale-[1.03]">
                <Image
                  src="/assets/flow/buy-sell.png"
                  alt="ChadWallet buy and sell flow"
                  fill
                  sizes="(min-width: 1280px) 520px, (min-width: 1024px) 55vw, 100vw"
                  className="image-zoom object-cover object-center"
                  priority
                  loading="eager"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {marketTokens.slice(0, 4).map((token) => (
                <Link
                  href={`/trade/${token.symbol.toLowerCase()}`}
                  key={token.symbol}
                  className="premium-card rounded-md border border-white/8 bg-chad-black/70 px-3 py-2"
                >
                  <span className="block text-sm font-black text-white">
                    ${token.symbol}
                  </span>
                  <span className="text-xs font-black text-chad-lime">
                    Chad {token.score}
                  </span>
                </Link>
              ))}
            </div>

            <div className="hidden gap-3 sm:grid">
              <div className="rounded-lg border border-white/10 bg-chad-black/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-white/45">
                    Chad score
                  </span>
                  <Zap className="h-4 w-4 text-chad-yellow" />
                </div>
                <div className="space-y-2">
                  {marketTokens.slice(0, 4).map((token) => (
                    <Link
                      href={`/trade/${token.symbol.toLowerCase()}`}
                      key={token.symbol}
                      className="premium-card flex items-center justify-between rounded-md border border-white/8 bg-white/[0.04] px-3 py-3 transition hover:border-chad-lime/50 hover:bg-chad-lime hover:text-chad-black"
                    >
                      <span>
                        <span className="block font-black">${token.symbol}</span>
                        <span className="text-xs text-white/42">{token.activity}</span>
                      </span>
                      <span className="text-sm font-black">{token.score}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-chad-lime/25 bg-chad-black/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-chad-lime">
                  <Zap className="h-4 w-4" />
                  Live wallet moves
                </div>
                <div className="space-y-2">
                  {liveTrades.slice(0, 4).map((trade) => (
                    <div
                      key={trade}
                      className="premium-card rounded-md border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/74"
                    >
                      {trade}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
