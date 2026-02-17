export function formatMoney(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
  opts?: Intl.NumberFormatOptions,
): string {
  const num =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : 0;

  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
      ...opts,
    }).format(Number.isFinite(num) ? num : 0);
  } catch {
    return `${code} ${Number.isFinite(num) ? num.toFixed(0) : "0"}`;
  }
}

