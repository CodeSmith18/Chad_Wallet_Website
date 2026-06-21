import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Radio, ScanSearch, UsersRound, WalletCards } from "lucide-react";

const galleryItems = [
  {
    title: "Discover",
    body: "Trending launches, meme flows, and search built around Solana velocity.",
    image: "/assets/app-store/launch.png",
    icon: Radio
  },
  {
    title: "Trader feed",
    body: "KOL moves and wallet activity presented like a social market feed.",
    image: "/assets/app-store/x.png",
    icon: UsersRound
  },
  {
    title: "Token detail",
    body: "Token context, price movement, and trade intent without leaving the moment.",
    image: "/assets/app-store/token.png",
    icon: ScanSearch
  },
  {
    title: "Portfolio",
    body: "Positions and flows stay visible after the trade is done.",
    image: "/assets/app-store/deposit.png",
    icon: WalletCards
  }
];

const flowImages = [
  "/assets/flow/memecoin.png",
  "/assets/flow/launch.png",
  "/assets/flow/kol.png",
  "/assets/flow/portfolio.png",
  "/assets/flow/relaunch.png"
];

export function ProductGallery() {
  return (
    <section className="overflow-hidden border-b border-white/10 bg-chad-black py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase text-chad-yellow">
              Real app energy
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
              Screens that prove the product is already in motion.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-white/58 lg:ml-auto">
            The landing page leans on ChadWallet's shipped mobile surfaces: launch
            discovery, social feeds, token views, portfolio flow, and Solana-native
            trading moments.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] transition hover:border-chad-lime/50"
              >
                <div className="relative h-[360px] overflow-hidden bg-chad-ink">
                  <Image
                    src={item.image}
                    alt={`ChadWallet ${item.title}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-chad-lime text-chad-black">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm leading-6 text-white/55">{item.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-3">
          {flowImages.map((src, index) => (
            <div
              key={src}
              className="relative h-72 min-w-[210px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] sm:h-80 sm:min-w-[240px]"
            >
              <Image
                src={src}
                alt={`ChadWallet flow ${index + 1}`}
                fill
                sizes="240px"
                className="object-cover object-top"
              />
            </div>
          ))}
          <Link
            href="/trade/bonk"
            className="flex h-72 min-w-[210px] flex-col justify-between rounded-lg border border-chad-lime/40 bg-chad-lime p-5 text-chad-black sm:h-80 sm:min-w-[240px]"
          >
            <span className="text-sm font-black uppercase">Next stop</span>
            <span className="text-3xl font-black leading-tight">
              Open the web trading lobby.
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-black">
              Trade BONK
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
