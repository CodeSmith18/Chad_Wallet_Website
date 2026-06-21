import Image from "next/image";
import { Activity, ArrowRight, BadgeDollarSign, Eye } from "lucide-react";

const steps = [
  {
    icon: Eye,
    title: "Watch the wallets",
    body: "Track what top Solana traders and KOLs are buying before the feed gets loud.",
    image: "/assets/app-store/kol.png"
  },
  {
    icon: Activity,
    title: "Read the tape",
    body: "Spot volume spikes, fresh launches, and market pressure from one live surface.",
    image: "/assets/app-store/search.png"
  },
  {
    icon: BadgeDollarSign,
    title: "Send the trade",
    body: "Jump from signal to token terminal without losing the moment.",
    image: "/assets/flow/buy-sell.png"
  }
];

export function SignalFlow() {
  return (
    <section id="signals" className="border-y border-white/10 bg-white/[0.025] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase text-chad-lime">
            From signal to swap
          </p>
          <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
            Built for the moment between spotting alpha and watching it run.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="relative overflow-hidden rounded-lg border border-white/10 bg-chad-ink"
              >
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-chad-lime text-chad-black">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-black text-white">{step.title}</span>
                  </div>
                  {index < steps.length - 1 ? (
                    <ArrowRight className="hidden h-5 w-5 text-white/35 lg:block" />
                  ) : null}
                </div>
                <div className="grid min-h-[420px] grid-rows-[auto_1fr] gap-5 p-5">
                  <p className="text-sm leading-6 text-white/60">{step.body}</p>
                  <div className="relative min-h-[300px] overflow-hidden rounded-md bg-chad-black">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
