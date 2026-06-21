import { NextResponse } from "next/server";
import { marketTokens, SOL_DECIMALS, SOL_MINT } from "@/data/tokens";

const JUPITER_PRO_BASE_URL = "https://api.jup.ag";
const JUPITER_LITE_BASE_URL = "https://lite-api.jup.ag";
const DEFAULT_SOL_AMOUNT = 0.1;
const MAX_SOL_AMOUNT = 5;

type JupiterPriceResponse = Record<
  string,
  {
    usdPrice?: number;
    price?: number;
    decimals?: number;
    blockId?: number;
    priceChange24h?: number;
  }
>;

type JupiterQuoteResponse = {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold?: string;
  swapMode?: string;
  slippageBps?: number;
  priceImpactPct?: string;
  routePlan?: Array<unknown>;
  contextSlot?: number;
  timeTaken?: number;
};

function getJupiterHeaders() {
  const apiKey = process.env.JUPITER_API_KEY?.trim();
  const headers: Record<string, string> = {
    accept: "application/json"
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  return {
    baseUrl: apiKey ? JUPITER_PRO_BASE_URL : JUPITER_LITE_BASE_URL,
    headers
  };
}

function toAtomicAmount(value: number, decimals: number) {
  return Math.round(value * 10 ** decimals).toString();
}

function fromAtomicAmount(amount: string, decimals: number) {
  return Number(amount) / 10 ** decimals;
}

async function fetchJupiterJson<T>(url: string, headers: HeadersInit) {
  const response = await fetch(url, {
    headers,
    next: {
      revalidate: 30
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

  return {
    ok: true as const,
    data: JSON.parse(text) as T
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "BONK").toUpperCase();
  const token = marketTokens.find((item) => item.symbol === symbol);

  if (!token) {
    return NextResponse.json(
      {
        error: "Unsupported token"
      },
      { status: 400 }
    );
  }

  const requestedSol = Number(searchParams.get("amountSol") ?? DEFAULT_SOL_AMOUNT);
  const amountSol =
    Number.isFinite(requestedSol) && requestedSol > 0
      ? Math.min(requestedSol, MAX_SOL_AMOUNT)
      : DEFAULT_SOL_AMOUNT;
  const amount = toAtomicAmount(amountSol, SOL_DECIMALS);
  const { baseUrl, headers } = getJupiterHeaders();

  const priceUrl = `${baseUrl}/price/v3?ids=${encodeURIComponent(
    `${SOL_MINT},${token.mint}`
  )}`;
  const priceResult = await fetchJupiterJson<JupiterPriceResponse>(priceUrl, headers);

  if (!priceResult.ok) {
    return NextResponse.json(
      {
        error: "Jupiter price request failed",
        status: priceResult.status,
        details: priceResult.error
      },
      { status: 502 }
    );
  }

  const quoteUrl = new URL(`${baseUrl}/swap/v1/quote`);
  quoteUrl.searchParams.set("inputMint", SOL_MINT);
  quoteUrl.searchParams.set("outputMint", token.mint);
  quoteUrl.searchParams.set("amount", amount);
  quoteUrl.searchParams.set("slippageBps", "100");
  quoteUrl.searchParams.set("restrictIntermediateTokens", "true");

  const quoteResult = await fetchJupiterJson<JupiterQuoteResponse>(
    quoteUrl.toString(),
    headers
  );

  if (!quoteResult.ok) {
    return NextResponse.json(
      {
        error: "Jupiter quote request failed",
        status: quoteResult.status,
        details: quoteResult.error,
        price: priceResult.data[token.mint] ?? null,
        solPrice: priceResult.data[SOL_MINT] ?? null
      },
      { status: 502 }
    );
  }

  const quote = quoteResult.data;
  const outputAmount = fromAtomicAmount(quote.outAmount, token.decimals);
  const inputAmount = fromAtomicAmount(quote.inAmount, SOL_DECIMALS);
  const solPrice = priceResult.data[SOL_MINT]?.usdPrice ?? null;
  const tokenPrice = priceResult.data[token.mint]?.usdPrice ?? null;

  return NextResponse.json(
    {
      token: {
        symbol: token.symbol,
        name: token.name,
        mint: token.mint,
        decimals: token.decimals
      },
      source: "Jupiter",
      price: {
        usd: tokenPrice,
        change24h: priceResult.data[token.mint]?.priceChange24h ?? null,
        solUsd: solPrice,
        blockId: priceResult.data[token.mint]?.blockId ?? null
      },
      quote: {
        inputSymbol: "SOL",
        inputAmount,
        outputSymbol: token.symbol,
        outputAmount,
        outAmountRaw: quote.outAmount,
        inAmountRaw: quote.inAmount,
        priceImpactPct: quote.priceImpactPct ? Number(quote.priceImpactPct) : null,
        routeHops: quote.routePlan?.length ?? 0,
        contextSlot: quote.contextSlot ?? null,
        timeTaken: quote.timeTaken ?? null
      },
      updatedAt: new Date().toISOString()
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
      }
    }
  );
}
