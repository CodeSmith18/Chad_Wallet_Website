import { marketTokens } from "@/data/tokens";

const JUPITER_PRO_BASE_URL = "https://api.jup.ag";
const JUPITER_LITE_BASE_URL = "https://lite-api.jup.ag";

export type JupiterPriceResponse = Record<
  string,
  {
    usdPrice?: number;
    price?: number;
    decimals?: number;
    blockId?: number;
    priceChange24h?: number;
  }
>;

export type JupiterQuoteResponse = {
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

export type JupiterSwapResponse = {
  swapTransaction: string;
  lastValidBlockHeight?: number;
  prioritizationFeeLamports?: number;
  computeUnitLimit?: number;
  prioritizationType?: unknown;
  dynamicSlippageReport?: unknown;
  simulationError?: unknown;
};

export function getMarketToken(symbol: string) {
  return marketTokens.find((item) => item.symbol === symbol.toUpperCase());
}

export function getJupiterConfig() {
  const apiKey = process.env.JUPITER_API_KEY?.trim();
  const headers: Record<string, string> = {
    accept: "application/json"
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  return {
    baseUrl: apiKey ? JUPITER_PRO_BASE_URL : JUPITER_LITE_BASE_URL,
    headers,
    tier: apiKey ? "Jupiter Pro free tier" : "Jupiter Lite"
  };
}

export function toAtomicAmount(value: number, decimals: number) {
  return Math.round(value * 10 ** decimals).toString();
}

export function fromAtomicAmount(amount: string, decimals: number) {
  return Number(amount) / 10 ** decimals;
}

type JupiterFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export async function fetchJupiterJson<T>(url: string, init: JupiterFetchInit) {
  const response = await fetch(url, init);
  const text = await response.text();

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      error: text.slice(0, 320)
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
      error: "Jupiter returned invalid JSON"
    };
  }
}
