"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Route,
  Send,
  ShieldCheck,
  WalletCards,
  Wifi,
  Zap
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSignTransaction,
  useWallets,
  type ConnectedStandardSolanaWallet
} from "@privy-io/react-auth/solana";
import type { MarketToken } from "@/data/tokens";
import { shortAddress } from "@/lib/address";
import { formatImpact, formatTokenAmount } from "@/lib/format";
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

type SwapBuildResponse = {
  tier: string;
  amountSol: number;
  slippageBps: number;
  quote: {
    inputAmount: number;
    outputAmount: number;
    priceImpactPct: number | null;
    routeHops: number;
    contextSlot: number | null;
  };
  transaction: {
    swapTransaction: string;
    lastValidBlockHeight: number | null;
    prioritizationFeeLamports: number | null;
    computeUnitLimit: number | null;
    simulationError: unknown | null;
  };
  updatedAt: string;
};

type SendResponse = {
  signature: string;
  explorerUrl: string;
  submittedAt: string;
};

type SolanaAccountPanelProps = {
  token: MarketToken;
};

type SwapStatus = "idle" | "reviewing" | "ready" | "signing" | "sending" | "success" | "error";
const SWAP_FEE_BUFFER_SOL = 0.0035;

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

function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function getMatchingWallet(
  wallets: ConnectedStandardSolanaWallet[],
  address?: string
) {
  if (!address) return wallets[0];

  return wallets.find((wallet) => wallet.address === address) ?? wallets[0];
}

function getSimulationMessage(error: unknown) {
  if (!error) return null;

  const rawMessage =
    typeof error === "string" ? error : JSON.stringify(error).slice(0, 220);
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes("attempt to debit") ||
    normalized.includes("no record of a prior credit")
  ) {
    return "This wallet is not funded on-chain yet. Deposit SOL, refresh balances, then review the route again.";
  }

  if (normalized.includes("insufficient") || normalized.includes("custom program error: 0x1")) {
    return "Not enough SOL for the swap amount plus network fees. Lower the amount or add SOL first.";
  }

  return `Jupiter simulation blocked this route: ${rawMessage}`;
}

function BalanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/8 py-3">
      <span className="text-sm font-bold text-white/52">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function QuickAmountButton({
  value,
  active,
  onClick
}: {
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
        active
          ? "border-chad-lime bg-chad-lime text-chad-black"
          : "border-white/10 bg-white/[0.04] text-white/58 hover:border-chad-lime/35 hover:text-white"
      }`}
    >
      {value}
    </button>
  );
}

export function SolanaAccountPanel({ token }: SolanaAccountPanelProps) {
  const { authenticated, ready, user } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const walletAddress = getSolanaWalletAddress(user);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshId, setRefreshId] = useState(0);
  const [amountSol, setAmountSol] = useState("0.001");
  const [swap, setSwap] = useState<SwapBuildResponse | null>(null);
  const [swapStatus, setSwapStatus] = useState<SwapStatus>("idle");
  const [swapError, setSwapError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<SendResponse | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

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

  useEffect(() => {
    setSwap(null);
    setSwapError(null);
    setTxResult(null);
    setSwapStatus("idle");
  }, [token.symbol]);

  const updatedLabel = useMemo(() => {
    const timestamp = account?.checkedAt ?? health?.checkedAt;

    if (!timestamp) return "Waiting";

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date(timestamp));
  }, [account?.checkedAt, health?.checkedAt]);

  const numericAmount = Number(amountSol);
  const isAmountValid =
    Number.isFinite(numericAmount) && numericAmount >= 0.0001 && numericAmount <= 0.05;
  const isSwapBusy =
    swapStatus === "reviewing" || swapStatus === "signing" || swapStatus === "sending";
  const canReview =
    ready && authenticated && Boolean(walletAddress) && isAmountValid && !isSwapBusy;
  const requiredSol = isAmountValid ? numericAmount + SWAP_FEE_BUFFER_SOL : null;
  const hasInsufficientSol =
    typeof account?.solBalance === "number" &&
    requiredSol !== null &&
    account.solBalance < requiredSol;
  const fundingMessage =
    hasInsufficientSol && requiredSol !== null
      ? `Add about ${formatTokenAmount(requiredSol, 4)} SOL before sending. Current balance is ${formatTokenAmount(
          account?.solBalance,
          4
        )} SOL.`
      : null;
  const simulationMessage = getSimulationMessage(swap?.transaction.simulationError);
  const swapBlockerMessage = fundingMessage ?? simulationMessage;
  const canExecute =
    swapStatus === "ready" &&
    Boolean(swap) &&
    walletsReady &&
    wallets.length > 0 &&
    !isSwapBusy &&
    !swapBlockerMessage;

  function resetSwapTicket(nextAmount: string) {
    setAmountSol(nextAmount);
    setSwap(null);
    setSwapError(null);
    setTxResult(null);
    setSwapStatus("idle");
  }

  async function handleCopyAddress() {
    if (!walletAddress) return;

    await navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    window.setTimeout(() => setCopiedAddress(false), 1800);
  }

  async function handleReviewSwap() {
    if (!walletAddress) {
      setSwapError("Connect a Solana wallet first.");
      return;
    }

    if (!isAmountValid) {
      setSwapError("Use an amount between 0.0001 and 0.05 SOL.");
      return;
    }

    setSwapStatus("reviewing");
    setSwapError(null);
    setTxResult(null);

    try {
      const response = await fetch("/api/jupiter/swap", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          symbol: token.symbol,
          amountSol: numericAmount,
          userPublicKey: walletAddress,
          slippageBps: 100
        })
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.details ?? json?.error ?? "Could not prepare swap");
      }

      setSwap(json as SwapBuildResponse);
      setSwapStatus("ready");
    } catch (reviewError) {
      setSwapStatus("error");
      setSwapError(
        reviewError instanceof Error ? reviewError.message : "Jupiter swap build failed"
      );
    }
  }

  async function handleExecuteSwap() {
    if (!swap) {
      setSwapError("Review a route before signing.");
      return;
    }

    if (swapBlockerMessage) {
      setSwapError(swapBlockerMessage);
      return;
    }

    const wallet = getMatchingWallet(wallets, walletAddress);

    if (!wallet) {
      setSwapError("No Solana signer is available in Privy yet.");
      setSwapStatus("error");
      return;
    }

    try {
      setSwapStatus("signing");
      setSwapError(null);

      const { signedTransaction } = await signTransaction({
        transaction: base64ToUint8Array(swap.transaction.swapTransaction),
        wallet,
        chain: "solana:mainnet"
      });

      setSwapStatus("sending");

      const response = await fetch("/api/solana/send", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          signedTransactionBase64: uint8ArrayToBase64(signedTransaction)
        })
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.details ?? json?.error ?? "Solana broadcast failed");
      }

      setTxResult(json as SendResponse);
      setSwapStatus("success");
      setRefreshId((current) => current + 1);
    } catch (executeError) {
      setSwapStatus("error");
      setSwapError(
        executeError instanceof Error ? executeError.message : "Swap execution failed"
      );
    }
  }

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
          <span className="text-xs font-bold text-white/42">
            Slot {health?.slot ?? "--"}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-chad-black p-4">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-white/42">
          <WalletCards className="h-3.5 w-3.5 text-chad-lime" />
          Connected wallet
        </div>

        {ready && authenticated && walletAddress ? (
          <>
            <p className="mt-2 text-xs font-black uppercase text-white/35">
              Deposit SOL on Solana only
            </p>
            <p className="mt-2 break-all rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs font-black leading-5 text-white">
              {walletAddress}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyAddress}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-chad-lime/25 bg-chad-lime/10 px-3 py-2 text-xs font-black text-chad-lime transition hover:bg-chad-lime/15"
              >
                {copiedAddress ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedAddress ? "Copied" : "Copy address"}
              </button>
              <a
                href={`https://solscan.io/account/${walletAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/70 transition hover:border-chad-cyan/30 hover:text-chad-cyan"
              >
                Solscan
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-white/42">
              <Zap className="h-3.5 w-3.5 text-chad-lime" />
              Live swap ticket
            </div>
            <p className="mt-1 text-xs font-bold text-white/38">
              Review first. Privy signs only after you confirm.
            </p>
          </div>
          <span className="rounded-full border border-chad-lime/20 bg-chad-lime/10 px-2.5 py-1 text-[10px] font-black uppercase text-chad-lime">
            Free route
          </span>
        </div>

        <label className="mt-4 block text-xs font-black uppercase text-white/42">
          You pay
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          <input
            value={amountSol}
            onChange={(event) => resetSwapTicket(event.target.value)}
            inputMode="decimal"
            className="min-w-0 flex-1 bg-transparent text-2xl font-black text-white outline-none placeholder:text-white/25"
            placeholder="0.001"
          />
          <span className="rounded-full border border-white/10 bg-chad-black px-3 py-1 text-xs font-black text-white/70">
            SOL
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["0.001", "0.005", "0.01"].map((value) => (
            <QuickAmountButton
              key={value}
              value={value}
              active={amountSol === value}
              onClick={() => resetSwapTicket(value)}
            />
          ))}
        </div>
        {!isAmountValid ? (
          <p className="mt-2 text-xs font-bold text-chad-red">
            Amount must stay between 0.0001 and 0.05 SOL.
          </p>
        ) : null}

        <div className="mt-4 rounded-md border border-white/10 bg-white/[0.035] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase text-white/42">Receive</span>
            <span className="text-xs font-bold text-white/35">{swap?.tier ?? "Jupiter"}</span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <span className="text-2xl font-black text-chad-lime">
              {swap ? formatTokenAmount(swap.quote.outputAmount, 3) : "--"}
            </span>
            <span className="font-black text-white/70">{token.symbol}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-white/45">
            <span className="inline-flex items-center gap-1">
              <Route className="h-3.5 w-3.5 text-chad-cyan" />
              {swap ? `${swap.quote.routeHops} hops` : "No route yet"}
            </span>
            <span className="text-right">
              Impact {swap ? formatImpact(swap.quote.priceImpactPct) : "--"}
            </span>
          </div>
        </div>

        {swapBlockerMessage ? (
          <div className="mt-3 rounded-md border border-chad-red/35 bg-chad-red/10 p-3 text-xs font-bold text-chad-red">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
            {swapBlockerMessage}
          </div>
        ) : null}

        {swapError ? (
          <div className="mt-3 rounded-md border border-chad-red/35 bg-chad-red/10 p-3 text-xs font-bold text-chad-red">
            {swapError}
          </div>
        ) : null}

        {txResult ? (
          <a
            href={txResult.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-between gap-3 rounded-md border border-chad-lime/35 bg-chad-lime/10 p-3 text-xs font-black text-chad-lime transition hover:bg-chad-lime/15"
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Sent {shortAddress(txResult.signature)}
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={handleReviewSwap}
            disabled={!canReview}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white transition hover:border-chad-lime/35 hover:bg-chad-lime/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {swapStatus === "reviewing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Route className="h-4 w-4" />
            )}
            Review route
          </button>
          <button
            type="button"
            onClick={handleExecuteSwap}
            disabled={!canExecute}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-chad-lime px-4 py-3 text-sm font-black text-chad-black transition hover:bg-chad-mint disabled:cursor-not-allowed disabled:opacity-45"
          >
            {swapStatus === "signing" || swapStatus === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {swapStatus === "signing"
              ? "Open Privy"
              : swapStatus === "sending"
                ? "Broadcasting"
                : "Sign + send"}
          </button>
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
