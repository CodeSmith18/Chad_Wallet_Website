import { NextResponse } from "next/server";
import { getMarketToken } from "@/lib/jupiter";
import { solanaRpcRequest } from "@/lib/solanaRpc";

const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

type BirdEyeOhlcvResponse = {
  data?: {
    items?: Array<{
      o?: number;
      h?: number;
      l?: number;
      c?: number;
      v?: number;
      unixTime?: number;
    }>;
  };
  success?: boolean;
  message?: string;
};

type BirdEyeTxsResponse = {
  data?: {
    items?: Array<{
      base?: BirdEyeTxLeg;
      quote?: BirdEyeTxLeg;
      from?: BirdEyeTxLeg;
      to?: BirdEyeTxLeg;
      basePrice?: number;
      quotePrice?: number;
      tokenPrice?: number;
      txHash?: string;
      source?: string;
      blockUnixTime?: number;
      owner?: string;
      side?: "buy" | "sell";
    }>;
  };
  success?: boolean;
  message?: string;
};

type BirdEyeTxLeg = {
  symbol?: string;
  address?: string;
  uiAmount?: number;
  price?: number;
  uiChangeAmount?: number;
};

type TokenLargestAccountsResult = {
  value: Array<{
    address: string;
    amount: string;
    decimals: number;
    uiAmount?: number | null;
    uiAmountString?: string;
  }>;
};

type TokenSupplyResult = {
  value: {
    amount: string;
    decimals: number;
    uiAmount?: number | null;
    uiAmountString?: string;
  };
};

type ParsedAccountResult = {
  value: Array<{
    data?: {
      parsed?: {
        info?: {
          owner?: string;
        };
      };
    };
  } | null>;
};

type BirdEyeFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

function getBirdEyeHeaders() {
  const apiKey = process.env.BIRDEYE_API_KEY?.trim();

  if (!apiKey) return null;

  return {
    accept: "application/json",
    "x-chain": "solana",
    "X-API-KEY": apiKey
  };
}

async function fetchBirdEye<T>(path: string, init: BirdEyeFetchInit = {}) {
  const headers = getBirdEyeHeaders();

  if (!headers) {
    return {
      ok: false as const,
      status: 401,
      error: "Missing BIRDEYE_API_KEY"
    };
  }

  const response = await fetch(`${BIRDEYE_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...init.headers
    }
  });
  const text = await response.text();

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      error: text.slice(0, 280)
    };
  }

  try {
    return {
      ok: true as const,
      data: JSON.parse(text) as T
    };
  } catch {
    return {
      ok: false as const,
      status: response.status,
      error: "BirdEye returned invalid JSON"
    };
  }
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);

  return null;
}

function shortSource(value?: string) {
  if (!value) return "DEX";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function loadHolders(tokenMint: string) {
  const [largestAccounts, tokenSupply] = await Promise.all([
    solanaRpcRequest<TokenLargestAccountsResult>("getTokenLargestAccounts", [tokenMint]),
    solanaRpcRequest<TokenSupplyResult>("getTokenSupply", [tokenMint])
  ]);
  const accounts = largestAccounts.value.slice(0, 8);
  const accountDetails = accounts.length
    ? await solanaRpcRequest<ParsedAccountResult>("getMultipleAccounts", [
        accounts.map((account) => account.address),
        {
          encoding: "jsonParsed"
        }
      ])
    : { value: [] };
  const supply = toNumber(tokenSupply.value.uiAmountString) ?? tokenSupply.value.uiAmount ?? 0;

  return accounts.map((account, index) => {
    const amount = toNumber(account.uiAmountString) ?? account.uiAmount ?? 0;
    const owner = accountDetails.value[index]?.data?.parsed?.info?.owner ?? account.address;

    return {
      rank: index + 1,
      owner,
      tokenAccount: account.address,
      amount,
      sharePct: supply > 0 ? (amount / supply) * 100 : null
    };
  });
}

function normalizeTrade(
  item: NonNullable<NonNullable<BirdEyeTxsResponse["data"]>["items"]>[number],
  tokenMint: string
) {
  const tokenLeg = item.base?.address === tokenMint ? item.base : item.to;
  const quoteLeg = item.quote ?? item.from;
  const tokenAmount = Math.abs(tokenLeg?.uiAmount ?? tokenLeg?.uiChangeAmount ?? 0);
  const quoteAmount = Math.abs(quoteLeg?.uiAmount ?? quoteLeg?.uiChangeAmount ?? 0);
  const tokenPrice = item.tokenPrice ?? item.basePrice ?? tokenLeg?.price ?? null;
  const valueUsd =
    quoteLeg?.price && quoteAmount
      ? quoteAmount * quoteLeg.price
      : tokenPrice && tokenAmount
        ? tokenPrice * tokenAmount
        : null;
  const side =
    item.side ??
    ((item.base?.uiChangeAmount ?? 0) >= 0 ? ("buy" as const) : ("sell" as const));

  return {
    side,
    owner: item.owner ?? null,
    txHash: item.txHash ?? null,
    source: shortSource(item.source),
    tokenAmount,
    quoteAmount,
    valueUsd,
    tokenPrice,
    blockUnixTime: item.blockUnixTime ?? null
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "BONK").toUpperCase();
  const token = getMarketToken(symbol);

  if (!token) {
    return NextResponse.json({ error: "Unsupported token" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const ohlcvUrl = `/defi/ohlcv?address=${encodeURIComponent(
    token.mint
  )}&type=15m&time_from=${now - 86_400}&time_to=${now}`;
  const txsUrl = `/defi/txs/token?address=${encodeURIComponent(
    token.mint
  )}&offset=0&limit=12&tx_type=swap&sort_type=desc&ui_amount_mode=scaled`;

  const [ohlcvResult, tradesResult, holdersResult] = await Promise.allSettled([
    fetchBirdEye<BirdEyeOhlcvResponse>(ohlcvUrl, {
      next: {
        revalidate: 30
      }
    }),
    fetchBirdEye<BirdEyeTxsResponse>(txsUrl, {
      next: {
        revalidate: 15
      }
    }),
    loadHolders(token.mint)
  ]);

  const ohlcv =
    ohlcvResult.status === "fulfilled" && ohlcvResult.value.ok
      ? ohlcvResult.value.data.data?.items ?? []
      : [];
  const trades =
    tradesResult.status === "fulfilled" && tradesResult.value.ok
      ? tradesResult.value.data.data?.items ?? []
      : [];
  const holders = holdersResult.status === "fulfilled" ? holdersResult.value : [];

  return NextResponse.json(
    {
      token: {
        symbol: token.symbol,
        name: token.name,
        mint: token.mint
      },
      source: {
        chart: ohlcv.length ? "BirdEye OHLCV" : "Unavailable",
        trades: trades.length ? "BirdEye swaps" : "Unavailable",
        holders: holders.length ? "Helius RPC" : "Unavailable"
      },
      chart: ohlcv.map((item) => ({
        open: item.o ?? null,
        high: item.h ?? null,
        low: item.l ?? null,
        close: item.c ?? null,
        volume: item.v ?? null,
        unixTime: item.unixTime ?? null
      })),
      trades: trades.map((item) => normalizeTrade(item, token.mint)),
      holders,
      errors: {
        chart:
          ohlcvResult.status === "fulfilled" && !ohlcvResult.value.ok
            ? ohlcvResult.value.error
            : null,
        trades:
          tradesResult.status === "fulfilled" && !tradesResult.value.ok
            ? tradesResult.value.error
            : null,
        holders:
          holdersResult.status === "rejected"
            ? holdersResult.reason instanceof Error
              ? holdersResult.reason.message
              : "Holder lookup failed"
            : null
      },
      updatedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45"
      }
    }
  );
}
