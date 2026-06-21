"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, RefreshCw, Route, SatelliteDish, TrendingUp } from "lucide-react";
import type { MarketToken } from "@/data/tokens";
import { formatImpact, formatPercent, formatTokenAmount, formatUsd } from "@/lib/format";

type JupiterMarketResponse = {
  token: {
    symbol: string;
    name: string;
    mint: string;
    decimals: number;
  };
  source: string;
  price: {
    usd: number | null;
    change24h: number | null;
    solUsd: number | null;
    blockId: number | null;
  };
  quote: {
    inputSymbol: string;
    inputAmount: number;
    outputSymbol: string;
    outputAmount: number;
    priceImpactPct: number | null;
    routeHops: number;
    contextSlot: number | null;
    timeTaken: number | null;
  };
  updatedAt: string;
};

type JupiterMarketPanelProps = {
  token: MarketToken;
};

function StatCard({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "blue";
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase text-white/42">{label}</p>
      <p
        className={`mt-2 text-2xl font-black ${
          tone === "green"
            ? "text-chad-lime"
            : tone === "blue"
              ? "text-chad-cyan"
              : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function JupiterMarketPanel({ token }: JupiterMarketPanelProps) {
  const [data, setData] = useState<JupiterMarketResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshId, setRefreshId] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadMarket() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/jupiter/market?symbol=${encodeURIComponent(token.symbol)}&amountSol=0.1`
        );
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.error ?? "Jupiter request failed");
        }

        if (isMounted) {
          setData(json as JupiterMarketResponse);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load Jupiter quote"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMarket();

    return () => {
      isMounted = false;
    };
  }, [refreshId, token.symbol]);

  const updatedLabel = useMemo(() => {
    if (!data?.updatedAt) return "Waiting for Jupiter";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(data.updatedAt));
  }, [data?.updatedAt]);

  return (
    <div className="premium-card rounded-lg border border-chad-lime/18 bg-[radial-gradient(circle_at_20%_0%,rgba(37,245,138,0.15),transparent_32%),rgba(255,255,255,0.035)] p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-chad-lime/20 bg-chad-lime/10 px-3 py-1 text-xs font-black uppercase text-chad-lime">
            <SatelliteDish className="h-3.5 w-3.5" />
            Jupiter live quote
          </div>
          <h2 className="mt-4 text-3xl font-black text-white">
            Buy {token.symbol} with SOL
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
            Route depth, expected output, and price impact update before the wallet
            signs anything.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshId((current) => current + 1)}
          disabled={isLoading}
          className="magnetic inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-sm font-black text-white transition hover:border-chad-lime/40 hover:bg-chad-lime/10 disabled:cursor-wait disabled:opacity-55"
          data-magnetic="6"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-lg border border-chad-red/35 bg-chad-red/10 p-4 text-sm font-bold text-chad-red">
          {error}. Refresh in a moment.
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={`${token.symbol} price`}
          value={isLoading && !data ? "Loading..." : formatUsd(data?.price.usd)}
          tone="green"
        />
        <StatCard
          label="24h move"
          value={
            isLoading && !data
              ? "Loading..."
              : data?.price.change24h === null
                ? "Jupiter n/a"
                : formatPercent(data?.price.change24h)
          }
        />
        <StatCard
          label="SOL price"
          value={isLoading && !data ? "Loading..." : formatUsd(data?.price.solUsd)}
          tone="blue"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <div className="rounded-lg border border-white/10 bg-chad-black/70 p-5">
          <p className="text-xs font-black uppercase text-white/42">You pay</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <span className="text-4xl font-black text-white">0.1</span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-black text-white/72">
              SOL
            </span>
          </div>
        </div>

        <div className="grid place-items-center">
          <div className="rounded-full border border-chad-lime/25 bg-chad-lime/12 p-3 text-chad-lime">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-lg border border-chad-lime/25 bg-chad-lime/10 p-5">
          <p className="text-xs font-black uppercase text-chad-lime/70">You receive</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <span className="text-4xl font-black text-chad-lime">
              {isLoading && !data
                ? "..."
                : formatTokenAmount(data?.quote.outputAmount, 2)}
            </span>
            <span className="rounded-full border border-chad-lime/20 bg-chad-black/55 px-3 py-1 text-sm font-black text-chad-lime">
              {token.symbol}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <Route className="h-5 w-5 text-chad-lime" />
          <div>
            <p className="text-xs font-black uppercase text-white/42">Route hops</p>
            <p className="font-black text-white">{data?.quote.routeHops ?? "--"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <TrendingUp className="h-5 w-5 text-chad-cyan" />
          <div>
            <p className="text-xs font-black uppercase text-white/42">Price impact</p>
            <p className="font-black text-white">
              {data?.quote.priceImpactPct === null
                ? "--"
                : formatImpact(data?.quote.priceImpactPct)}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xs font-black uppercase text-white/42">Updated</p>
          <p className="truncate font-black text-white">{updatedLabel}</p>
          <p className="mt-1 truncate text-xs font-bold text-white/38">
            {data?.source ?? "Jupiter free tier"}
          </p>
        </div>
      </div>
    </div>
  );
}
