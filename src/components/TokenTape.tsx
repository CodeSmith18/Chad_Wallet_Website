import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Radio } from "lucide-react";
import { marketTokens } from "@/data/tokens";

type TokenTapeProps = {
  direction?: "left" | "right";
  tone?: "top" | "bottom";
};

export function TokenTape({ direction = "left", tone = "top" }: TokenTapeProps) {
  const repeated = [...marketTokens, ...marketTokens, ...marketTokens];

  return (
    <div
      className={`ticker-mask w-full overflow-hidden border-y ${
        tone === "top"
          ? "border-white/10 bg-chad-black/95"
          : "border-chad-lime/20 bg-chad-ink/95"
      }`}
    >
      <div
        className={`ticker-track flex w-max gap-3 py-3 ${
          direction === "left" ? "animate-tape-left" : "animate-tape-right"
        }`}
      >
        {repeated.map((token, index) => {
          const positive = token.change >= 0;

          return (
            <Link
              href={`/trade/${token.symbol.toLowerCase()}`}
              key={`${token.symbol}-${index}`}
              className="group flex min-w-max items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-chad-white transition hover:border-chad-lime/60 hover:bg-chad-lime hover:text-chad-black"
            >
              <span className="flex items-center gap-2 font-black">
                <Radio className="h-3.5 w-3.5 text-chad-lime transition group-hover:text-chad-black" />
                ${token.symbol}
              </span>
              <span className="text-white/60 transition group-hover:text-chad-black/70">
                {token.price}
              </span>
              <span
                className={`flex items-center gap-1 font-bold ${
                  positive ? "text-chad-lime" : "text-chad-red"
                } transition group-hover:text-chad-black`}
              >
                {positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(token.change).toFixed(1)}%
              </span>
              <span className="hidden text-white/45 transition group-hover:text-chad-black/60 md:inline">
                {token.activity}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
