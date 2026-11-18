// Display helpers (kept out of calculations.ts so the engine stays unit-agnostic).

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** ₦9,786,500 */
export const formatNaira = (n: number): string => naira.format(Math.round(n));

/** Locale number with fixed decimals, e.g. fmt(9640) -> "9,640", fmt(9.64, 2) -> "9.64" */
export const fmt = (n: number, decimals = 0): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
