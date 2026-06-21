export type MarketToken = {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  price: string;
  change: number;
  volume: string;
  activity: string;
  score: number;
};

export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const SOL_DECIMALS = 9;

export const marketTokens: MarketToken[] = [
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    price: "$0.000024",
    change: 18.4,
    volume: "$42.8M",
    activity: "KOLs rotating in",
    score: 94
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    price: "$2.21",
    change: 11.6,
    volume: "$76.2M",
    activity: "Whale buy cluster",
    score: 91
  },
  {
    symbol: "POPCAT",
    name: "Popcat",
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    decimals: 9,
    price: "$0.68",
    change: 7.8,
    volume: "$31.9M",
    activity: "Volume spike",
    score: 86
  },
  {
    symbol: "MEW",
    name: "cat in a dogs world",
    mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    decimals: 5,
    price: "$0.0041",
    change: -2.9,
    volume: "$19.4M",
    activity: "Dip buyers showing",
    score: 77
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    price: "$0.91",
    change: 5.3,
    volume: "$54.7M",
    activity: "Route liquidity hot",
    score: 82
  },
  {
    symbol: "PUMP",
    name: "Pump",
    mint: "pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn",
    decimals: 6,
    price: "$0.0068",
    change: 24.2,
    volume: "$88.1M",
    activity: "New launch mania",
    score: 98
  }
];

export const liveTrades = [
  "Cupsey bought $8.2K BONK",
  "Roman trimmed $2.1K WIF",
  "Large wallet entered PUMP",
  "KOL stack detected on POPCAT",
  "MEW dip swept by 14 wallets",
  "Fresh launch hit 7x volume"
];
