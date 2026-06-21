export function formatUsd(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";

  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(value);
  }

  if (value >= 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 4
    }).format(value);
  }

  return `$${value.toPrecision(4)}`;
}

export function formatTokenAmount(value?: number | null, maximumFractionDigits = 4) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits
  }).format(value);
}

export function formatCompactNumber(value?: number | null, maximumFractionDigits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    notation: "compact"
  }).format(value);
}

export function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatImpact(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";

  return `${Math.abs(value).toFixed(2)}%`;
}
