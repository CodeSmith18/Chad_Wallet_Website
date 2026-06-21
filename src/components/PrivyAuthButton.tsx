"use client";

import { Fingerprint, LoaderCircle, LogOut, Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

type PrivyAuthButtonProps = {
  className?: string;
  connectedLabel?: string;
  ctaLabel?: string;
  fullWidth?: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function PrivyAuthButton({
  className,
  connectedLabel = "Wallet live",
  ctaLabel = "Sign in with Privy",
  fullWidth = false
}: PrivyAuthButtonProps) {
  const { authenticated, connectOrCreateWallet, login, logout, ready, user } =
    usePrivy();

  const solanaWallet = user?.linkedAccounts.find(
    (account) =>
      account.type === "wallet" &&
      "chainType" in account &&
      account.chainType === "solana"
  );

  const walletAddress =
    solanaWallet && "address" in solanaWallet
      ? solanaWallet.address
      : user?.wallet?.address;

  const handleClick = async () => {
    if (!ready) return;

    if (!authenticated) {
      login();
      return;
    }

    if (!walletAddress) {
      connectOrCreateWallet();
      return;
    }

    await logout();
  };

  const label = !ready
    ? "Loading Privy"
    : !authenticated
      ? ctaLabel
      : walletAddress
        ? connectedLabel
          ? `${connectedLabel} ${shortAddress(walletAddress)}`
          : shortAddress(walletAddress)
        : "Create Solana wallet";

  const Icon = !ready
    ? LoaderCircle
    : !authenticated
      ? Fingerprint
      : walletAddress
        ? LogOut
        : Wallet;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready}
      title={authenticated && walletAddress ? "Sign out" : undefined}
      className={cx(
        "magnetic inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/82 transition duration-300 hover:border-chad-lime/45 hover:bg-chad-lime/10 hover:text-chad-white disabled:cursor-wait disabled:opacity-60",
        fullWidth && "w-full",
        className
      )}
      data-magnetic="6"
    >
      <Icon className={cx("h-4 w-4", !ready && "animate-spin")} />
      <span>{label}</span>
    </button>
  );
}
