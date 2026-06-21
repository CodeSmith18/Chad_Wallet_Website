import Link from "next/link";
import { ArrowUpRight, CandlestickChart, CircleDollarSign, Flame, Wallet } from "lucide-react";
import { liveTrades, marketTokens } from "@/data/tokens";

const chartBars = [34, 42, 38, 56, 63, 50, 72, 66, 84, 76, 92, 88, 96, 90];

export function TerminalPreview() {
  return (
    <section id="terminal" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-chad-cyan">
              Desktop terminal preview
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
              A web trading room that feels alive before Phase 2 even lands.
            </h2>
          </div>
          <Link
            href="/trade/bonk"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-5 py-3 text-sm font-black text-chad-white transition hover:border-chad-lime/60 hover:bg-chad-lime hover:text-chad-black"
          >
            Open trading route
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="terminal-grid mt-12 grid overflow-hidden rounded-lg border border-white/12 bg-chad-black shadow-2xl lg:grid-cols-[280px_1fr_320px]">
          <aside className="border-b border-white/10 bg-white/[0.025] p-4 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black uppercase text-white/55">
                <Flame className="h-4 w-4 text-chad-lime" />
                Trending
              </div>
              <span className="rounded-full bg-chad-lime/10 px-2 py-1 text-xs font-black text-chad-lime">
                Live
              </span>
            </div>
            <div className="space-y-2">
              {marketTokens.map((token) => (
                <Link
                  href={`/trade/${token.symbol.toLowerCase()}`}
                  key={token.symbol}
                  className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.04] p-3 transition hover:border-chad-lime/50 hover:bg-chad-lime hover:text-chad-black"
                >
                  <div>
                    <div className="font-black">${token.symbol}</div>
                    <div className="text-xs text-white/45">{token.volume} vol</div>
                  </div>
                  <div className={token.change >= 0 ? "font-black text-chad-lime" : "font-black text-chad-red"}>
                    {token.change >= 0 ? "+" : ""}
                    {token.change.toFixed(1)}%
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          <main className="min-h-[620px] p-4 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-chad-lime text-lg font-black text-chad-black">
                    B
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-white">$BONK</h3>
                    <p className="text-sm text-white/45">Bonk on Solana</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-right">
                {[
                  ["Price", "$0.000024"],
                  ["24h", "+18.4%"],
                  ["Chad score", "94"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="text-xs uppercase text-white/42">{label}</div>
                    <div className="mt-1 font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black uppercase text-white/55">
                  <CandlestickChart className="h-4 w-4 text-chad-cyan" />
                  Price action
                </div>
                <span className="text-xs font-black text-chad-lime">Jupiter route ready</span>
              </div>
              <div className="flex h-64 items-end gap-2">
                {chartBars.map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className={`w-full rounded-t-sm ${
                      index % 4 === 0 ? "bg-chad-red" : "bg-chad-lime"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <h4 className="mb-3 font-black text-white">Top holders</h4>
                {["7x2Q...9pK", "Jito whale", "KOL cluster", "Fresh wallet"].map((holder, index) => (
                  <div key={holder} className="flex items-center justify-between border-t border-white/8 py-3 text-sm">
                    <span className="font-bold text-white/70">{holder}</span>
                    <span className="font-black text-white">{(8.4 - index * 1.2).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <h4 className="mb-3 font-black text-white">Live trades</h4>
                {liveTrades.slice(0, 4).map((trade) => (
                  <div key={trade} className="border-t border-white/8 py-3 text-sm font-bold text-white/70">
                    {trade}
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className="border-t border-white/10 bg-white/[0.025] p-4 lg:border-l lg:border-t-0">
            <div className="rounded-lg border border-chad-lime/25 bg-chad-lime/8 p-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase text-chad-lime">
                <CircleDollarSign className="h-4 w-4" />
                Buy / sell
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="rounded-full bg-chad-lime px-4 py-3 text-sm font-black text-chad-black">
                  Buy
                </button>
                <button className="rounded-full border border-white/14 px-4 py-3 text-sm font-black text-white">
                  Sell
                </button>
              </div>
              <div className="mt-5 rounded-md border border-white/10 bg-chad-black p-4">
                <div className="text-xs uppercase text-white/42">You pay</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-black text-white">0.50</span>
                  <span className="font-black text-white/70">SOL</span>
                </div>
              </div>
              <button className="mt-4 w-full rounded-full bg-white px-4 py-3 text-sm font-black text-chad-black">
                Sign in with Privy
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase text-white/55">
                <Wallet className="h-4 w-4 text-chad-cyan" />
                Position
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/45">Holdings</span>
                  <span className="font-black text-white">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/45">PnL</span>
                  <span className="font-black text-chad-lime">Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/45">Route</span>
                  <span className="font-black text-white">Jupiter</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
