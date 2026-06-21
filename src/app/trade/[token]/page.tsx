import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";
import { Header } from "@/components/Header";
import { JupiterMarketPanel } from "@/components/JupiterMarketPanel";
import { SolanaAccountPanel } from "@/components/SolanaAccountPanel";
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
                  Phase 2 terminal
                </p>
                <h1 className="mt-2 text-4xl font-black text-white">
                  ${selected.symbol} / SOL
                </h1>
                <p className="mt-2 text-white/55">
                  Live Jupiter price and quote data are online. Swap signing is
                  the next checkpoint.
                </p>
              </div>
              <div className="rounded-full border border-chad-lime/30 bg-chad-lime/10 px-4 py-2 text-sm font-black text-chad-lime">
                {selected.price} | {selected.change >= 0 ? "+" : ""}
                {selected.change.toFixed(1)}%
              </div>
            </div>

            <div className="mt-5">
              <JupiterMarketPanel token={selected} />
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
            <SolanaAccountPanel token={selected} />
          </aside>
        </div>
      </section>
      <TokenTape direction="right" tone="bottom" />
    </main>
  );
}
