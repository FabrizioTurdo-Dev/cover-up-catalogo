// src/data/store.js
// Utilidades compartidas entre catálogo y admin

export const SELLER_PHONE = "1154922800";

export function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

export function getTierIndexForQuantity(product, qty) {
  if (!product.tiers) return 0;
  const idx = product.tiers.findIndex(t => qty >= t.min && qty <= t.max);
  return idx >= 0 ? idx : 0;
}

export function getPriceByQuantity(product, qty) {
  if (!product.basePrices || !product.tiers) return product.basePrices?.[0] || 0;
  const tierIndex = getTierIndexForQuantity(product, qty);
  return product.basePrices[tierIndex];
}

export function getGlobalTierIndex(totalQty, tiers) {
  if (!tiers || tiers.length === 0) return 0;
  const idx = tiers.findIndex(t => totalQty >= t.min && totalQty <= t.max);
  return idx >= 0 ? idx : 0;
}

export const DEFAULT_TIERS = [
  { min: 30, max: 119 },
  { min: 120, max: 499 },
  { min: 500, max: 9999 },
];
