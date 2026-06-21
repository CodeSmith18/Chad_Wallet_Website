export const LAMPORTS_PER_SOL = 1_000_000_000;

type SolanaRpcEnvelope<T> = {
  jsonrpc: "2.0";
  id: string;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};

export function getSolanaRpcUrl() {
  return (
    process.env.SOLANA_RPC_URL?.trim() ||
    process.env.ALCHEMY_SOLANA_RPC_URL?.trim() ||
    ""
  );
}

export async function solanaRpcRequest<T>(method: string, params: unknown[] = []) {
  const rpcUrl = getSolanaRpcUrl();

  if (!rpcUrl) {
    throw new Error("Missing SOLANA_RPC_URL");
  }

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: method,
      method,
      params
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Solana RPC HTTP ${response.status}`);
  }

  const json = (await response.json()) as SolanaRpcEnvelope<T>;

  if (json.error) {
    throw new Error(json.error.message);
  }

  if (typeof json.result === "undefined") {
    throw new Error("Solana RPC returned no result");
  }

  return json.result;
}
