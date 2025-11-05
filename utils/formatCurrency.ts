export function formatCurrencyVND(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "0";
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0";
  }

  const hasFraction = Math.abs(numeric - Math.trunc(numeric)) > Number.EPSILON;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: hasFraction ? 3 : 0,
    maximumFractionDigits: hasFraction ? 3 : 0,
  }).format(numeric);
}

