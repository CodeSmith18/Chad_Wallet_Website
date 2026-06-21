"use client";

import { PrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const privyAppId =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cmqnwug1o00vt0bl57p0crdnd";
const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID?.trim();

const loginMethods: PrivyClientConfig["loginMethods"] =
  process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN === "true"
    ? ["google", "apple", "email"]
    : ["google", "email"];

const privyConfig: PrivyClientConfig = {
  solana: {
    rpcs: {
      "solana:mainnet": {
        rpc: createSolanaRpc("https://api.mainnet-beta.solana.com"),
        rpcSubscriptions: createSolanaRpcSubscriptions(
          "wss://api.mainnet-beta.solana.com"
        ),
        blockExplorerUrl: "https://solscan.io"
      }
    }
  },
  appearance: {
    theme: "dark",
    accentColor: "#1CFF89",
    logo: "/assets/logo/chad-light.png",
    landingHeader: "Enter ChadWallet",
    loginMessage: "Follow wallets, catch Solana memes, and trade with intent.",
    showWalletLoginFirst: false,
    walletChainType: "solana-only"
  },
  loginMethods,
  embeddedWallets: {
    solana: {
      createOnLogin: "users-without-wallets"
    }
  }
};

export function PrivyRoot({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      {...(privyClientId ? { clientId: privyClientId } : {})}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  );
}
