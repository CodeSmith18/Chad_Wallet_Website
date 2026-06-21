import { NextResponse } from "next/server";
import { getSolanaRpcUrl, solanaRpcRequest } from "@/lib/solanaRpc";

type SolanaVersion = {
  "feature-set": number;
  "solana-core": string;
};

export async function GET() {
  if (!getSolanaRpcUrl()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing SOLANA_RPC_URL"
      },
      { status: 500 }
    );
  }

  try {
    const [version, slot] = await Promise.all([
      solanaRpcRequest<SolanaVersion>("getVersion"),
      solanaRpcRequest<number>("getSlot", [{ commitment: "confirmed" }])
    ]);

    return NextResponse.json({
      ok: true,
      provider: "Solana RPC",
      version: version["solana-core"],
      slot,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Solana RPC failed"
      },
      { status: 502 }
    );
  }
}
