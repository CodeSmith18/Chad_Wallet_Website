import { NextResponse } from "next/server";
import { SOL_DECIMALS, SOL_MINT } from "@/data/tokens";
import {
  fetchJupiterJson,
  fromAtomicAmount,
  getJupiterConfig,
  getMarketToken,
  toAtomicAmount,
  type JupiterPriceResponse,
  type JupiterQuoteResponse
} from "@/lib/jupiter";

const DEFAULT_SOL_AMOUNT = 0.1;
const MAX_SOL_AMOUNT = 5;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "BONK").toUpperCase();
  const token = getMarketToken(symbol);

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
  const { baseUrl, headers, tier } = getJupiterConfig();

  const priceUrl = `${baseUrl}/price/v3?ids=${encodeURIComponent(
    `${SOL_MINT},${token.mint}`
  )}`;
  const priceResult = await fetchJupiterJson<JupiterPriceResponse>(priceUrl, {
    headers,
    next: {
      revalidate: 30
    }
  });

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
    {
      headers,
      next: {
        revalidate: 30
      }
    }
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
      tier,
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
