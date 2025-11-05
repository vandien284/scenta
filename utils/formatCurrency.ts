export function formatCurrencyVND(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "0";
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0";
  }

  const sign = numeric < 0 ? "-" : "";
  const rounded = Math.abs(numeric);
  const fixed = rounded.toFixed(3);
  const [integerPart, fractionPart] = fixed.split(".");

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (fractionPart === "000") {
    return `${sign}${formattedInteger}`;
  }

  return `${sign}${formattedInteger},${fractionPart}`;
}
