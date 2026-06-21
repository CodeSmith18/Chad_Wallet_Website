import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Download, Flame, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { liveTrades, marketTokens } from "@/data/tokens";

const appStoreUrl =
  process.env.NEXT_PUBLIC_APP_STORE_URL ??
  "https://apps.apple.com/us/app/chadwallet/id6757367474";
const playStoreUrl =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100vh-112px)] overflow-hidden">
      <div className="noise-layer pointer-events-none absolute inset-0 opacity-30" />
      <video
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden h-full w-[58%] object-cover opacity-18 mix-blend-screen lg:block"
        src="/assets/video/chadwallet.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-chad-lime/35 bg-chad-lime/10 px-4 py-2 text-sm font-black text-chad-lime shadow-glow">
            <Flame className="h-4 w-4" />
            Solana meme coin command center
          </div>

          <h1 className="text-6xl font-black leading-[0.92] text-chad-white sm:text-7xl lg:text-8xl">
            ChadWallet
          </h1>
          <p className="mt-6 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
            Trade with the wallets everyone else watches.
          </p>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/64 sm:text-lg">
            Catch Solana memes as they move, follow top wallets in real time, and turn
            market noise into a fast buy or sell.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/trade/bonk"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-chad-lime px-6 py-4 text-sm font-black text-chad-black transition hover:bg-chad-mint"
            >
              Start trading
              <ArrowUpRight className="h-5 w-5" />
            </Link>
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-6 py-4 text-sm font-black text-chad-white transition hover:border-white/30 hover:bg-white/[0.09]"
            >
              <Download className="h-5 w-5" />
              iPhone app
            </a>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-6 py-4 text-sm font-black text-chad-white transition hover:border-white/30 hover:bg-white/[0.09]"
            >
              Android
            </a>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["24/7", "live tape"],
              ["1-click", "token jump"],
              ["Privy", "Apple + Google"]
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="text-2xl font-black text-chad-white">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase text-white/45">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[620px] items-center justify-center">
          <div className="relative h-[640px] w-full max-w-[560px]">
            <div className="phone-shadow absolute left-1/2 top-1/2 z-20 w-[285px] -translate-x-1/2 -translate-y-1/2 animate-floaty overflow-hidden rounded-[2.2rem] border border-white/20 bg-chad-black p-2">
              <Image
                src="/assets/app-store/discover.png"
                alt="ChadWallet social trading feed"
                width={640}
                height={1320}
                className="h-auto w-full rounded-[1.8rem]"
                priority
              />
            </div>

            <div className="absolute left-0 top-16 z-10 w-56 rounded-lg border border-white/12 bg-chad-ink/90 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white/45">
                  Chad score
                </span>
                <Sparkles className="h-4 w-4 text-chad-yellow" />
              </div>
              {marketTokens.slice(0, 3).map((token) => (
                <Link
                  href={`/trade/${token.symbol.toLowerCase()}`}
                  key={token.symbol}
                  className="mb-2 flex items-center justify-between rounded-md bg-white/[0.04] p-3 transition hover:bg-chad-lime hover:text-chad-black"
                >
                  <span className="font-black">${token.symbol}</span>
                  <span className="text-sm font-black">{token.score}</span>
                </Link>
              ))}
            </div>

            <div className="absolute bottom-16 right-0 z-30 w-64 rounded-lg border border-chad-lime/25 bg-chad-black/90 p-4 shadow-glow backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-chad-lime">
                <Zap className="h-4 w-4" />
                Live wallet moves
              </div>
              <div className="space-y-2">
                {liveTrades.slice(0, 4).map((trade) => (
                  <div
                    key={trade}
                    className="rounded-md border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/78"
                  >
                    {trade}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-4 left-8 z-10 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/72 backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4 text-chad-lime" />
              Solana native
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
