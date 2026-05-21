// src/data/store.js
// Estado compartido entre el catálogo y el admin.
// En producción esto se reemplaza por llamadas a Supabase/API.

export const INITIAL_PRODUCTS = [
  {
    id: 1, name: "Runner Pro", brand: "Nike", cat: "adulto",
    price: 12500, tag: "Nuevo", active: true, emoji: "👟",
    stock: { 38: 5, 39: 3, 40: 8, 41: 2, 42: 0 },
    image: null,
  },
  {
    id: 2, name: "Air Step", brand: "Adidas", cat: "adulto",
    price: 14200, tag: "Más vendido", active: true, emoji: "👟",
    stock: { 37: 4, 38: 6, 39: 10, 40: 3, 41: 1, 42: 0, 43: 2 },
    image: null,
  },
  {
    id: 3, name: "Furyosa", brand: "Puma", cat: "adulto",
    price: 11800, tag: "", active: true, emoji: "👠",
    stock: { 37: 2, 38: 0, 44: 5, 45: 3 },
    image: null,
  },
  {
    id: 4, name: "Classic Low", brand: "Vans", cat: "adulto",
    price: 9900, tag: "", active: true, emoji: "👞",
    stock: { 40: 3, 41: 5, 42: 2, 43: 0, 44: 1, 45: 4 },
    image: null,
  },
  {
    id: 5, name: "Sandalia Beach", brand: "Reef", cat: "adulto",
    price: 8900, tag: "Verano", active: true, emoji: "👡",
    stock: { 36: 6, 37: 4, 38: 2, 39: 0, 40: 3 },
    image: null,
  },
  {
    id: 6, name: "Mini Sport", brand: "Nike", cat: "nino",
    price: 7500, tag: "Nuevo", active: true, emoji: "👟",
    stock: { 28: 4, 29: 6, 30: 2, 31: 0, 32: 3 },
    image: null,
  },
  {
    id: 7, name: "Kiddo Flash", brand: "Adidas", cat: "nino",
    price: 6800, tag: "", active: true, emoji: "⚡",
    stock: { 25: 3, 26: 5, 27: 4, 28: 2, 29: 0, 30: 1 },
    image: null,
  },
  {
    id: 8, name: "Jr Velcro", brand: "Puma", cat: "nino",
    price: 8200, tag: "Oferta", active: true, emoji: "🎨",
    stock: { 31: 2, 32: 4, 33: 6, 34: 1, 35: 0 },
    image: null,
  },
];

export const INITIAL_ORDERS = [
  {
    id: 101, client: "Laura Méndez", phone: "1155221100",
    date: "2025-05-14", status: "pendiente",
    items: [{ name: "Runner Pro", size: 40, qty: 2 }, { name: "Air Step", size: 38, qty: 1 }],
    total: 39200,
  },
  {
    id: 102, client: "Martín García", phone: "1144332211",
    date: "2025-05-15", status: "confirmado",
    items: [{ name: "Furyosa", size: 37, qty: 3 }],
    total: 35400,
  },
  {
    id: 103, client: "Sofía López", phone: "1166554433",
    date: "2025-05-16", status: "pendiente",
    items: [{ name: "Mini Sport", size: 30, qty: 4 }],
    total: 30000,
  },
];

export const SELLER_PHONE = "5491100000000";

export const ALL_SIZES_ADULTO = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
export const ALL_SIZES_NINO   = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

export function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}
