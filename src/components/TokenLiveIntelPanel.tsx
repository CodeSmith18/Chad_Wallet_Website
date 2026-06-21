"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Crown, ExternalLink, RefreshCw, Users } from "lucide-react";
import type { MarketToken } from "@/data/tokens";
import { shortAddress } from "@/lib/address";
import {
  formatCompactNumber,
  formatPercent,
  formatTokenAmount,
  formatUsd
} from "@/lib/format";

type ChartPoint = {
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  unixTime: number | null;
};

type LiveTrade = {
  side: "buy" | "sell";
  owner: string | null;
  txHash: string | null;
  source: string;
  tokenAmount: number;
  quoteAmount: number;
  valueUsd: number | null;
  tokenPrice: number | null;
  blockUnixTime: number | null;
};

type Holder = {
  rank: number;
  owner: string;
  tokenAccount: string;
  amount: number;
  sharePct: number | null;
};

type LiveIntelResponse = {
  source: {
    chart: string;
    trades: string;
    holders: string;
  };
  chart: ChartPoint[];
  trades: LiveTrade[];
  holders: Holder[];
  errors: {
    chart: string | null;
    trades: string | null;
    holders: string | null;
  };
  updatedAt: string;
};

type TokenLiveIntelPanelProps = {
  token: MarketToken;
};

function buildChartPath(points: ChartPoint[], width: number, height: number) {
  const closes = points
    .map((point) => point.close)
    .filter((value): value is number => typeof value === "number");

  if (closes.length < 2) {
    return {
      line: "",
      area: "",
      isUp: true,
      min: null,
      max: null
    };
  }

  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || max || 1;
  const xStep = width / (closes.length - 1);
  const coords = closes.map((value, index) => {
    const x = index * xStep;
    const y = height - ((value - min) / range) * (height - 16) - 8;

    return [x, y] as const;
  });
  const line = coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return {
    line,
    area,
    isUp: closes[closes.length - 1] >= closes[0],
    min,
    max
  };
}

function formatTradeTime(unixTime: number | null) {
  if (!unixTime) return "live";

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(unixTime * 1000));
}

export function TokenLiveIntelPanel({ token }: TokenLiveIntelPanelProps) {
  const [data, setData] = useState<LiveIntelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshId, setRefreshId] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadIntel() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/trade/live?symbol=${encodeURIComponent(token.symbol)}`
        );
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.error ?? "Live market intel failed");
        }

        if (isMounted) {
          setData(json as LiveIntelResponse);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Live intel failed");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadIntel();

    return () => {
      isMounted = false;
    };
  }, [refreshId, token.symbol]);

  const chartMeta = useMemo(
    () => buildChartPath(data?.chart ?? [], 720, 220),
    [data?.chart]
  );
  const lastPoint = data?.chart[data.chart.length - 1];
  const firstPoint = data?.chart.find((point) => typeof point.close === "number");
  const movePct =
    firstPoint?.close && lastPoint?.close
      ? ((lastPoint.close - firstPoint.close) / firstPoint.close) * 100
      : null;
  const totalVolume = data?.chart.reduce((sum, point) => sum + (point.volume ?? 0), 0) ?? null;
  const updatedLabel = data?.updatedAt
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date(data.updatedAt))
    : "Waiting";

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-chad-cyan">
              <Activity className="h-4 w-4" />
              Live token chart
            </div>
            <h3 className="mt-2 text-2xl font-black text-white">
              {token.symbol} price action
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setRefreshId((current) => current + 1)}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/70 transition hover:border-chad-lime/35 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-chad-red/35 bg-chad-red/10 p-3 text-xs font-bold text-chad-red">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-chad-black/70 p-3">
            <p className="text-xs font-black uppercase text-white/40">Last price</p>
            <p className="mt-1 text-xl font-black text-chad-lime">
              {isLoading && !data ? "Loading..." : formatUsd(lastPoint?.close)}
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-chad-black/70 p-3">
            <p className="text-xs font-black uppercase text-white/40">24h line</p>
            <p className="mt-1 text-xl font-black text-white">{formatPercent(movePct)}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-chad-black/70 p-3">
            <p className="text-xs font-black uppercase text-white/40">Chart volume</p>
            <p className="mt-1 text-xl font-black text-chad-cyan">
              {formatCompactNumber(totalVolume)}
            </p>
          </div>
        </div>

        <div className="mt-4 h-64 rounded-lg border border-white/10 bg-chad-black/70 p-4">
          {chartMeta.line ? (
            <svg
              viewBox="0 0 720 220"
              className="h-full w-full overflow-visible"
              role="img"
              aria-label={`${token.symbol} 24 hour price chart`}
            >
              <defs>
                <linearGradient id={`chart-fill-${token.symbol}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={chartMeta.isUp ? "#25F58A" : "#FF4D6D"} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={chartMeta.isUp ? "#25F58A" : "#FF4D6D"} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chartMeta.area} fill={`url(#chart-fill-${token.symbol})`} />
              <path
                d={chartMeta.line}
                fill="none"
                stroke={chartMeta.isUp ? "#25F58A" : "#FF4D6D"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            </svg>
          ) : (
            <div className="grid h-full place-items-center text-sm font-bold text-white/45">
              {isLoading ? "Loading BirdEye candles..." : "Chart unavailable on this tier"}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white/35">
          <span>{data?.source.chart ?? "BirdEye OHLCV"}</span>
          <span>Updated {updatedLabel}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="inline-flex items-center gap-2 font-black text-white">
              <Crown className="h-4 w-4 text-chad-lime" />
              Top holders
            </h3>
            <span className="text-xs font-bold text-white/35">
              {data?.source.holders ?? "Helius RPC"}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {(data?.holders ?? []).slice(0, 6).map((holder) => (
              <a
                key={holder.tokenAccount}
                href={`https://solscan.io/account/${holder.owner}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-md border border-white/8 bg-chad-black/55 p-3 transition hover:border-chad-lime/30"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">
                    #{holder.rank} {shortAddress(holder.owner)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/40">
                    {formatCompactNumber(holder.amount)} {token.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-chad-lime">
                    {holder.sharePct === null ? "--" : `${holder.sharePct.toFixed(2)}%`}
                  </p>
                  <ExternalLink className="ml-auto mt-1 h-3.5 w-3.5 text-white/25" />
                </div>
              </a>
            ))}
            {!isLoading && !data?.holders.length ? (
              <div className="rounded-md border border-white/8 bg-chad-black/55 p-3 text-sm font-bold text-white/45">
                Holders unavailable right now.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="inline-flex items-center gap-2 font-black text-white">
              <Users className="h-4 w-4 text-chad-cyan" />
              Live trades
            </h3>
            <span className="text-xs font-bold text-white/35">
              {data?.source.trades ?? "BirdEye swaps"}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {(data?.trades ?? []).slice(0, 6).map((trade) => (
              <a
                key={trade.txHash ?? `${trade.owner}-${trade.blockUnixTime}`}
                href={trade.txHash ? `https://solscan.io/tx/${trade.txHash}` : "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-md border border-white/8 bg-chad-black/55 p-3 transition hover:border-chad-cyan/30"
              >
                <div className="min-w-0">
                  <p
                    className={`text-sm font-black ${
                      trade.side === "buy" ? "text-chad-lime" : "text-chad-red"
                    }`}
                  >
                    {trade.side === "buy" ? "Bought" : "Sold"}{" "}
                    {formatCompactNumber(trade.tokenAmount)} {token.symbol}
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/40">
                    {trade.owner ? shortAddress(trade.owner) : "Fresh wallet"} via {trade.source}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">
                    {formatUsd(trade.valueUsd)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/35">
                    {formatTradeTime(trade.blockUnixTime)}
                  </p>
                </div>
              </a>
            ))}
            {!isLoading && !data?.trades.length ? (
              <div className="rounded-md border border-white/8 bg-chad-black/55 p-3 text-sm font-bold text-white/45">
                Trades unavailable on the current BirdEye tier.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
