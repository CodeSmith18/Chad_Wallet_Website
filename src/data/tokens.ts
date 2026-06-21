export type MarketToken = {
  symbol: string;
  name: string;
  price: string;
  change: number;
  volume: string;
  activity: string;
  score: number;
};

export const marketTokens: MarketToken[] = [
  {
    symbol: "BONK",
    name: "Bonk",
    price: "$0.000024",
    change: 18.4,
    volume: "$42.8M",
    activity: "KOLs rotating in",
    score: 94
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    price: "$2.21",
    change: 11.6,
    volume: "$76.2M",
    activity: "Whale buy cluster",
    score: 91
  },
  {
    symbol: "POPCAT",
    name: "Popcat",
    price: "$0.68",
    change: 7.8,
    volume: "$31.9M",
    activity: "Volume spike",
    score: 86
  },
  {
    symbol: "MEW",
    name: "cat in a dogs world",
    price: "$0.0041",
    change: -2.9,
    volume: "$19.4M",
    activity: "Dip buyers showing",
    score: 77
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    price: "$0.91",
    change: 5.3,
    volume: "$54.7M",
    activity: "Route liquidity hot",
    score: 82
  },
  {
    symbol: "PUMP",
    name: "Pump",
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
