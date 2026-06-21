import { NextResponse } from "next/server";
import { solanaRpcRequest } from "@/lib/solanaRpc";

type SendRequestBody = {
  signedTransactionBase64?: string;
};

function isValidBase64(value: string) {
  return value.length > 64 && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SendRequestBody | null;
  const signedTransactionBase64 = body?.signedTransactionBase64?.trim() ?? "";

  if (!isValidBase64(signedTransactionBase64)) {
    return NextResponse.json(
      { error: "A signed base64 Solana transaction is required" },
      { status: 400 }
    );
  }

  try {
    const signature = await solanaRpcRequest<string>("sendTransaction", [
      signedTransactionBase64,
      {
        encoding: "base64",
        maxRetries: 3,
        preflightCommitment: "confirmed",
        skipPreflight: false
      }
    ]);

    return NextResponse.json({
      signature,
      explorerUrl: `https://solscan.io/tx/${signature}`,
      submittedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Solana transaction broadcast failed",
        details: error instanceof Error ? error.message : "Unknown RPC error"
      },
      { status: 502 }
    );
  }
}
