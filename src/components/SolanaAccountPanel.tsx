"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, ShieldCheck, WalletCards, Wifi } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import type { MarketToken } from "@/data/tokens";
import { shortAddress } from "@/lib/address";
import { formatTokenAmount } from "@/lib/format";
import { PrivyAuthButton } from "@/components/PrivyAuthButton";

type AccountResponse = {
  address: string;
  solBalance: number;
  tokenBalance: number | null;
  tokenAccounts: number;
  slot: number;
  checkedAt: string;
};

type HealthResponse = {
  ok: boolean;
  version?: string;
  slot?: number;
  checkedAt?: string;
  error?: string;
};

type SolanaAccountPanelProps = {
  token: MarketToken;
};

function getSolanaWalletAddress(
  user: ReturnType<typeof usePrivy>["user"]
): string | undefined {
  const solanaWallet = user?.linkedAccounts.find(
    (account) =>
      account.type === "wallet" &&
      "chainType" in account &&
      account.chainType === "solana"
  );

  if (solanaWallet && "address" in solanaWallet) {
    return solanaWallet.address;
  }

  return user?.wallet?.chainType === "solana" ? user.wallet.address : undefined;
}

function BalanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/8 py-3">
      <span className="text-sm font-bold text-white/52">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

export function SolanaAccountPanel({ token }: SolanaAccountPanelProps) {
  const { authenticated, ready, user } = usePrivy();
  const walletAddress = getSolanaWalletAddress(user);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshId, setRefreshId] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadRpcState() {
      setIsLoading(true);
      setError(null);

      try {
        const healthPromise = fetch("/api/solana/health").then((response) =>
          response.json()
        ) as Promise<HealthResponse>;

        const accountPromise = walletAddress
          ? fetch(
              `/api/solana/account?address=${encodeURIComponent(
                walletAddress
              )}&tokenMint=${encodeURIComponent(token.mint)}`
            ).then(async (response) => {
              const json = await response.json();

              if (!response.ok) {
                throw new Error(json?.error ?? "Account lookup failed");
              }

              return json as AccountResponse;
            })
          : Promise.resolve(null);

        const [healthResult, accountResult] = await Promise.all([
          healthPromise,
          accountPromise
        ]);

        if (!healthResult.ok) {
          throw new Error(healthResult.error ?? "RPC health check failed");
        }

        if (isMounted) {
          setHealth(healthResult);
          setAccount(accountResult);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error ? loadError.message : "Solana RPC failed"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRpcState();

    return () => {
      isMounted = false;
    };
  }, [refreshId, token.mint, walletAddress]);

  const updatedLabel = useMemo(() => {
    const timestamp = account?.checkedAt ?? health?.checkedAt;

    if (!timestamp) return "Waiting";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(timestamp));
  }, [account?.checkedAt, health?.checkedAt]);

  return (
    <div className="rounded-lg border border-chad-lime/25 bg-chad-lime/8 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black uppercase text-chad-lime">
          <ShieldCheck className="h-4 w-4" />
          Wallet station
        </div>
        <button
          type="button"
          onClick={() => setRefreshId((current) => current + 1)}
          disabled={isLoading}
          className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/70 transition hover:border-chad-lime/35 hover:text-chad-lime disabled:opacity-50"
          aria-label="Refresh wallet balances"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-chad-black p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-white/42">
          <Wifi className="h-3.5 w-3.5 text-chad-cyan" />
          Helius RPC
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-sm font-black text-white">
            {error ? "Needs attention" : health?.version ? "Online" : "Checking"}
          </span>
          <span className="text-xs font-bold text-white/42">Slot {health?.slot ?? "--"}</span>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-chad-black p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-white/42">
          <WalletCards className="h-3.5 w-3.5 text-chad-lime" />
          Connected wallet
        </div>

        {ready && authenticated && walletAddress ? (
          <>
            <p className="mt-2 break-all text-sm font-black text-white">
              {shortAddress(walletAddress)}
            </p>
            <div className="mt-3">
              <BalanceRow
                label="SOL balance"
                value={
                  account
                    ? `${formatTokenAmount(account.solBalance, 4)} SOL`
                    : isLoading
                      ? "Loading..."
                      : "--"
                }
              />
              <BalanceRow
                label={`${token.symbol} balance`}
                value={
                  account?.tokenBalance !== null && typeof account?.tokenBalance === "number"
                    ? `${formatTokenAmount(account.tokenBalance, 4)} ${token.symbol}`
                    : isLoading
                      ? "Loading..."
                      : `0 ${token.symbol}`
                }
              />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm leading-6 text-white/55">
            Sign in to create or connect a Solana wallet before execution.
          </p>
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-chad-red/35 bg-chad-red/10 p-3 text-xs font-bold text-chad-red">
          {error}
        </div>
      ) : null}

      <div className="mt-5 rounded-md border border-white/10 bg-chad-black p-4">
        <div className="text-xs uppercase text-white/42">Prepared quote</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-black text-white">0.1 SOL</span>
          <span className="font-black text-white/70">${token.symbol}</span>
        </div>
      </div>

      <PrivyAuthButton
        fullWidth
        ctaLabel="Sign in to trade"
        connectedLabel="Ready"
        className="mt-4 border-chad-lime/25 bg-chad-lime px-4 py-3 text-chad-black hover:bg-chad-mint hover:text-chad-black"
      />

      <p className="mt-3 text-center text-[11px] font-bold uppercase text-white/35">
        Checked {updatedLabel}
      </p>
    </div>
  );
}
