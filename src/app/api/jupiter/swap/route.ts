import { NextResponse } from "next/server";
import { SOL_DECIMALS, SOL_MINT } from "@/data/tokens";
import {
  fetchJupiterJson,
  fromAtomicAmount,
  getJupiterConfig,
  getMarketToken,
  toAtomicAmount,
  type JupiterQuoteResponse,
  type JupiterSwapResponse
} from "@/lib/jupiter";

const DEFAULT_SOL_AMOUNT = 0.001;
const MIN_SOL_AMOUNT = 0.0001;
const MAX_SOL_AMOUNT = 0.05;
const DEFAULT_SLIPPAGE_BPS = 100;
const MAX_SLIPPAGE_BPS = 300;

type SwapRequestBody = {
  symbol?: string;
  amountSol?: string | number;
  userPublicKey?: string;
  slippageBps?: string | number;
};

function parseBoundedNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = typeof value === "string" || typeof value === "number" ? Number(value) : NaN;

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(Math.max(parsed, min), max);
}

function isLikelySolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SwapRequestBody | null;
  const symbol = (body?.symbol ?? "BONK").toUpperCase();
  const token = getMarketToken(symbol);
  const userPublicKey = body?.userPublicKey?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ error: "Unsupported token" }, { status: 400 });
  }

  if (!isLikelySolanaAddress(userPublicKey)) {
    return NextResponse.json(
      { error: "A valid Solana wallet address is required" },
      { status: 400 }
    );
  }

  const amountSol = parseBoundedNumber(
    body?.amountSol,
    DEFAULT_SOL_AMOUNT,
    MIN_SOL_AMOUNT,
    MAX_SOL_AMOUNT
  );
  const slippageBps = Math.round(
    parseBoundedNumber(
      body?.slippageBps,
      DEFAULT_SLIPPAGE_BPS,
      10,
      MAX_SLIPPAGE_BPS
    )
  );
  const amount = toAtomicAmount(amountSol, SOL_DECIMALS);
  const { baseUrl, headers, tier } = getJupiterConfig();

  const quoteUrl = new URL(`${baseUrl}/swap/v1/quote`);
  quoteUrl.searchParams.set("inputMint", SOL_MINT);
  quoteUrl.searchParams.set("outputMint", token.mint);
  quoteUrl.searchParams.set("amount", amount);
  quoteUrl.searchParams.set("slippageBps", slippageBps.toString());
  quoteUrl.searchParams.set("restrictIntermediateTokens", "true");

  const quoteResult = await fetchJupiterJson<JupiterQuoteResponse>(
    quoteUrl.toString(),
    {
      headers,
      cache: "no-store"
    }
  );

  if (!quoteResult.ok) {
    return NextResponse.json(
      {
        error: "Jupiter quote request failed",
        status: quoteResult.status,
        details: quoteResult.error
      },
      { status: 502 }
    );
  }

  const swapResult = await fetchJupiterJson<JupiterSwapResponse>(
    `${baseUrl}/swap/v1/swap`,
    {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        quoteResponse: quoteResult.data,
        userPublicKey,
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1_000_000,
            priorityLevel: "veryHigh"
          }
        }
      }),
      cache: "no-store"
    }
  );

  if (!swapResult.ok) {
    return NextResponse.json(
      {
        error: "Jupiter swap transaction build failed",
        status: swapResult.status,
        details: swapResult.error
      },
      { status: 502 }
    );
  }

  const quote = quoteResult.data;

  return NextResponse.json({
    token: {
      symbol: token.symbol,
      name: token.name,
      mint: token.mint,
      decimals: token.decimals
    },
    tier,
    wallet: userPublicKey,
    amountSol,
    slippageBps,
    quote: {
      inputSymbol: "SOL",
      inputAmount: fromAtomicAmount(quote.inAmount, SOL_DECIMALS),
      outputSymbol: token.symbol,
      outputAmount: fromAtomicAmount(quote.outAmount, token.decimals),
      inAmountRaw: quote.inAmount,
      outAmountRaw: quote.outAmount,
      priceImpactPct: quote.priceImpactPct ? Number(quote.priceImpactPct) : null,
      routeHops: quote.routePlan?.length ?? 0,
      contextSlot: quote.contextSlot ?? null
    },
    transaction: {
      swapTransaction: swapResult.data.swapTransaction,
      lastValidBlockHeight: swapResult.data.lastValidBlockHeight ?? null,
      prioritizationFeeLamports: swapResult.data.prioritizationFeeLamports ?? null,
      computeUnitLimit: swapResult.data.computeUnitLimit ?? null,
      simulationError: swapResult.data.simulationError ?? null
    },
    safety: {
      minSolAmount: MIN_SOL_AMOUNT,
      maxSolAmount: MAX_SOL_AMOUNT,
      maxSlippageBps: MAX_SLIPPAGE_BPS
    },
    updatedAt: new Date().toISOString()
  });
}
