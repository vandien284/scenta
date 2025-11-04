const VIETNAM_KEYWORDS = ["viet nam", "vietnam", "việt nam", "vn"];

export const SHIPPING_FEES = {
  vietnam: 30_000,
  international: 50_000,
} as const;

export function normalizeCountry(country?: string) {
  return country?.trim().toLowerCase() ?? "";
}

export function calculateShippingFee(country?: string) {
  const normalized = normalizeCountry(country);
  if (!normalized) {
    return SHIPPING_FEES.international;
  }

  const isVietnam = VIETNAM_KEYWORDS.some((keyword) => normalized.includes(keyword));
  return isVietnam ? SHIPPING_FEES.vietnam : SHIPPING_FEES.international;
}
