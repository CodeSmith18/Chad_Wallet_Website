import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Radio,
  ScanSearch,
  Sparkles,
  UsersRound,
  WalletCards
} from "lucide-react";

const workflowItems = [
  {
    title: "Discover",
    body: "Trending launches and meme flows surface as compact signals instead of a noisy feed.",
    icon: Radio
  },
  {
    title: "Follow wallets",
    body: "KOL and wallet movement is framed like social activity with trade intent attached.",
    icon: UsersRound
  },
  {
    title: "Inspect token",
    body: "Price, holders, trades, and context sit together before the user commits.",
    icon: ScanSearch
  },
  {
    title: "Manage position",
    body: "Portfolio and deposit flows stay visible after the first buy.",
    icon: WalletCards
  }
];

const reelItems = [
  {
    title: "Launch from a tweet",
    image: "/assets/flow/launch.png",
    tone: "Tweet to token"
  },
  {
    title: "Track KOL traders",
    image: "/assets/flow/kol.png",
    tone: "Wallet intelligence"
  },
  {
    title: "Manage assets",
    image: "/assets/flow/portfolio.png",
    tone: "Position clarity"
  }
];

export function ProductGallery() {
  return (
    <section className="overflow-hidden border-b border-white/10 bg-chad-black py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-reveal
          className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
        >
          <div>
            <p className="text-sm font-black uppercase text-chad-yellow">
              Product in motion
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
              Less screenshot wall. More signal flow.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-white/58 lg:ml-auto">
            ChadWallet should feel like a live market lobby: one strong product
            moment, crisp workflow cards, and calm motion that guides the eye.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article
            data-reveal
            data-parallax="0.14"
            className="premium-card relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]"
          >
            <div className="parallax-media absolute inset-0 scale-[1.04]">
              <Image
                src="/assets/flow/memecoin.png"
                alt="ChadWallet meme coin discovery flow"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="image-zoom object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-chad-black via-chad-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-chad-lime/30 bg-chad-black/65 px-3 py-2 text-xs font-black uppercase text-chad-lime backdrop-blur-xl">
                <Sparkles className="h-4 w-4" />
                Scroll story
              </div>
              <h3 className="max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
                Catch the signal while it still looks early.
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/62">
                One focused product frame carries the section, while the workflow
                steps explain how ChadWallet turns discovery into execution.
              </p>
            </div>
          </article>

          <div className="grid gap-3">
            {workflowItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  data-reveal
                  data-delay={`${120 + index * 90}ms`}
                  key={item.title}
                  className="premium-card rounded-lg border border-white/10 bg-white/[0.035] p-5"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chad-lime text-chad-black">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_0.8fr]">
          {reelItems.map((item, index) => (
            <article
              data-reveal
              data-delay={`${index * 110}ms`}
              key={item.title}
              className="premium-card overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]"
            >
              <div className="relative h-56 overflow-hidden bg-chad-ink">
                <Image
                  src={item.image}
                  alt={`ChadWallet ${item.title}`}
                  fill
                  sizes="(min-width: 1024px) 24vw, 100vw"
                  className="image-zoom object-cover object-top"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-black uppercase text-chad-lime">
                  {item.tone}
                </p>
                <h3 className="mt-1 text-lg font-black text-white">{item.title}</h3>
              </div>
            </article>
          ))}

          <Link
            data-reveal
            data-delay="340ms"
            data-magnetic="10"
            href="/trade/bonk"
            className="magnetic premium-card flex min-h-[220px] flex-col justify-between rounded-lg border border-chad-lime/40 bg-chad-lime p-5 text-chad-black"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-chad-black text-chad-lime">
              <BadgeDollarSign className="h-5 w-5" />
            </span>
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
