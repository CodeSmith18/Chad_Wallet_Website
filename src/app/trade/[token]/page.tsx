import Link from "next/link";
import { ArrowLeft, Construction, Radio, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { PrivyAuthButton } from "@/components/PrivyAuthButton";
import { TokenTape } from "@/components/TokenTape";
import { liveTrades, marketTokens } from "@/data/tokens";

type TradePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function TradePage({ params }: TradePageProps) {
  const { token } = await params;
  const symbol = decodeURIComponent(token).toUpperCase();
  const selected = marketTokens.find((item) => item.symbol === symbol) ?? marketTokens[0];

  return (
    <main className="min-h-screen bg-chad-black text-chad-white">
      <TokenTape direction="left" tone="top" />
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-black text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </Link>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          <aside className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-chad-lime">
              <Radio className="h-4 w-4" />
              Trending tokens
            </div>
            <div className="space-y-2">
              {marketTokens.map((item) => (
                <Link
                  href={`/trade/${item.symbol.toLowerCase()}`}
                  key={item.symbol}
                  className={`flex items-center justify-between rounded-md border p-3 transition ${
                    item.symbol === selected.symbol
                      ? "border-chad-lime bg-chad-lime text-chad-black"
                      : "border-white/8 bg-white/[0.04] hover:border-chad-lime/50"
                  }`}
                >
                  <span className="font-black">${item.symbol}</span>
                  <span className="font-black">
                    {item.change >= 0 ? "+" : ""}
                    {item.change.toFixed(1)}%
                  </span>
                </Link>
              ))}
            </div>
          </aside>

          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-chad-cyan">
                  Phase 2 terminal shell
                </p>
                <h1 className="mt-2 text-4xl font-black text-white">
                  ${selected.symbol} / SOL
                </h1>
                <p className="mt-2 text-white/55">
                  Real BirdEye data, TradingView charts, holders, live trades, and
                  Jupiter execution plug in here next.
                </p>
              </div>
              <div className="rounded-full border border-chad-lime/30 bg-chad-lime/10 px-4 py-2 text-sm font-black text-chad-lime">
                {selected.price} | {selected.change >= 0 ? "+" : ""}
                {selected.change.toFixed(1)}%
              </div>
            </div>

            <div className="mt-5 grid min-h-[360px] place-items-center rounded-lg border border-dashed border-white/15 bg-chad-black/60 p-8 text-center">
              <div>
                <Construction className="mx-auto h-12 w-12 text-chad-lime" />
                <h2 className="mt-4 text-2xl font-black text-white">
                  Trading engine checkpoint
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">
                  This route already opens from token banners. In Phase 2 it becomes
                  the live Jupiter swap terminal with Privy wallet signing.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <h3 className="font-black text-white">Holders preview</h3>
                {["Top wallet", "KOL cluster", "New buyer wave"].map((holder) => (
                  <div key={holder} className="border-t border-white/8 py-3 text-sm text-white/65">
                    {holder}
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <h3 className="font-black text-white">Live trades preview</h3>
                {liveTrades.slice(0, 3).map((trade) => (
                  <div key={trade} className="border-t border-white/8 py-3 text-sm text-white/65">
                    {trade}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="rounded-lg border border-chad-lime/25 bg-chad-lime/8 p-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase text-chad-lime">
                <ShieldCheck className="h-4 w-4" />
                Privy ready
              </div>
              <div className="mt-5 rounded-md border border-white/10 bg-chad-black p-4">
                <div className="text-xs uppercase text-white/42">You buy</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-black text-white">$100</span>
                  <span className="font-black text-white/70">${selected.symbol}</span>
                </div>
              </div>
              <PrivyAuthButton
                fullWidth
                ctaLabel="Sign in to trade"
                connectedLabel="Ready"
                className="mt-4 border-chad-lime/25 bg-chad-lime px-4 py-3 text-chad-black hover:bg-chad-mint hover:text-chad-black"
              />
            </div>
          </aside>
        </div>
      </section>
      <TokenTape direction="right" tone="bottom" />
    </main>
  );
}
