// src/data/store.js
// Utilidades compartidas entre catálogo y admin

export const SELLER_PHONE = "1154922800";

export function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

export function getPriceByQuantity(product, qty) {
  if (!product.basePrices || !product.tiers) return product.basePrices?.[0] || 0;
  const tierIndex = product.tiers.findIndex(t => qty >= t.min && qty <= t.max);
  return product.basePrices[tierIndex >= 0 ? tierIndex : 0];
}
