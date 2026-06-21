import { NextResponse } from "next/server";
import { LAMPORTS_PER_SOL, solanaRpcRequest } from "@/lib/solanaRpc";

type GetBalanceResult = {
  context: {
    slot: number;
  };
  value: number;
};

type TokenAccount = {
  account: {
    data: {
      parsed: {
        info: {
          tokenAmount: {
            amount: string;
            decimals: number;
            uiAmount: number | null;
            uiAmountString: string;
          };
        };
      };
    };
  };
};

type GetTokenAccountsResult = {
  context: {
    slot: number;
  };
  value: TokenAccount[];
};

function isLikelySolanaAddress(value: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim() ?? "";
  const tokenMint = searchParams.get("tokenMint")?.trim() ?? "";

  if (!isLikelySolanaAddress(address)) {
    return NextResponse.json(
      {
        error: "Invalid wallet address"
      },
      { status: 400 }
    );
  }

  if (tokenMint && !isLikelySolanaAddress(tokenMint)) {
    return NextResponse.json(
      {
        error: "Invalid token mint"
      },
      { status: 400 }
    );
  }

  try {
    const balancePromise = solanaRpcRequest<GetBalanceResult>("getBalance", [
      address,
      { commitment: "confirmed" }
    ]);

    const tokenAccountsPromise = tokenMint
      ? solanaRpcRequest<GetTokenAccountsResult>("getTokenAccountsByOwner", [
          address,
          { mint: tokenMint },
          {
            encoding: "jsonParsed",
            commitment: "confirmed"
          }
        ])
      : Promise.resolve(null);

    const [balance, tokenAccounts] = await Promise.all([
      balancePromise,
      tokenAccountsPromise
    ]);

    const tokenBalance =
      tokenAccounts?.value.reduce((sum, item) => {
        const amountString =
          item.account.data.parsed.info.tokenAmount.uiAmountString ?? "0";

        return sum + Number(amountString);
      }, 0) ?? null;

    return NextResponse.json({
      address,
      solBalance: balance.value / LAMPORTS_PER_SOL,
      lamports: balance.value,
      tokenMint: tokenMint || null,
      tokenBalance,
      tokenAccounts: tokenAccounts?.value.length ?? 0,
      slot: tokenAccounts?.context.slot ?? balance.context.slot,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Solana account lookup failed"
      },
      { status: 502 }
    );
  }
}
