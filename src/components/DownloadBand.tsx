import Image from "next/image";
import { Apple, Play, ShieldCheck } from "lucide-react";

const appStoreUrl =
  process.env.NEXT_PUBLIC_APP_STORE_URL ??
  "https://apps.apple.com/us/app/chadwallet/id6757367474";
const playStoreUrl =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

export function DownloadBand() {
  return (
    <section id="download" className="border-y border-white/10 bg-chad-white text-chad-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-chad-black px-4 py-2 text-sm font-black text-chad-lime">
            <ShieldCheck className="h-4 w-4" />
            Mobile app already live
          </div>
          <h2 className="text-4xl font-black leading-tight sm:text-6xl">
            Keep the ChadWallet tape in your pocket.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-black/64 sm:text-lg">
            Discover tokens, follow traders, search wallets, launch into memes, and manage
            your Solana portfolio from the app.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-chad-black px-6 py-4 text-sm font-black text-white transition hover:bg-chad-ink"
            >
              <Apple className="h-5 w-5" />
              Download for iPhone
            </a>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-4 text-sm font-black text-chad-black transition hover:border-black/35"
            >
              <Play className="h-5 w-5" />
              Get it on Android
            </a>
          </div>
        </div>

        <div className="relative min-h-[500px] overflow-hidden rounded-lg bg-chad-black">
          <Image
            src="/assets/app-store/portfolio.png"
            alt="ChadWallet portfolio"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </section>
  );
}
