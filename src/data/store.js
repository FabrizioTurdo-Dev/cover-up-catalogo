// src/data/store.js
// Estado compartido entre el catálogo y el admin.
// Productos Cover Up Home con sistema de precios escalonados

export const INITIAL_PRODUCTS = [
  // ORGANIZADORES
  {
    id: 101, code: "THS010", name: "Caja Org. Grande c/ Visor", brand: "Cover Up", cat: "organizadores",
    basePrices: [10168, 9587, 9006], emoji: "📦", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "50 x 40 x 33 | Gris con puntitos",
  },
  {
    id: 102, code: "THS009", name: "Caja Org. Chica c/ Visor", brand: "Cover Up", cat: "organizadores",
    basePrices: [7534, 7103, 6673], emoji: "📦", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "40 x 30 x 20 | Gris con puntitos",
  },
  {
    id: 103, code: "THS006", name: "Caja Org. Grande sin Visor", brand: "Cover Up", cat: "organizadores",
    basePrices: [9693, 9140, 8586], emoji: "📦", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "50 x 40 x 33 | Gris",
  },
  {
    id: 104, code: "THS005", name: "Caja Org. Chica sin Visor", brand: "Cover Up", cat: "organizadores",
    basePrices: [7059, 6656, 6253], emoji: "📦", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "40 x 30 x 20 | Gris",
  },
  {
    id: 105, code: "THS012", name: "Caja Org. Grande Premium", brand: "Cover Up", cat: "organizadores",
    basePrices: [14119, 13312, 12505], emoji: "✨", active: true, tag: "Premium",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "50 x 40 x 33 | Gris Melange",
  },
  {
    id: 106, code: "THS014", name: "Caja Org. Transp. Grande", brand: "Cover Up", cat: "organizadores",
    basePrices: [11906, 11226, 10545], emoji: "📦", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "50 x 40 x 33 | Transparente",
  },
  {
    id: 107, code: "THS013", name: "Caja Org. Transp. Chica", brand: "Cover Up", cat: "organizadores",
    basePrices: [8376, 7898, 7419], emoji: "📦", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "40 x 30 x 20 | Transparente",
  },
  {
    id: 108, code: "THS017", name: "Bajo Cama Org. Transp. Gde", brand: "Cover Up", cat: "organizadores",
    basePrices: [21652, 20415, 19178], emoji: "🛏️", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "80 x 47 x 15 | Transparente",
  },
  {
    id: 109, code: "THS016", name: "Bajo Cama Org. Transp. Chico", brand: "Cover Up", cat: "organizadores",
    basePrices: [13223, 12468, 11712], emoji: "🛏️", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "50 x 40 x 15 | Transparente",
  },

  // CESTOS
  {
    id: 201, code: "THS026", name: "Cesto Ropa Circular", brand: "Cover Up", cat: "cestos",
    basePrices: [12275, 11573, 10872], emoji: "🧺", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "40 x 50 | Cremita",
  },
  {
    id: 202, code: "THS027", name: "Cesto Ropa Laundry", brand: "Cover Up", cat: "cestos",
    basePrices: [11695, 11027, 10359], emoji: "🧺", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "38 x 38 x 79 | Gris",
  },
  {
    id: 203, code: "THS030", name: "Cesto Ropa Rect. Chico", brand: "Cover Up", cat: "cestos",
    basePrices: [6901, 6507, 6113], emoji: "🧺", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "40 x 30 x 60 | Gris/Blanco",
  },
  {
    id: 204, code: "THS031", name: "Cesto Ropa Rect. Grande", brand: "Cover Up", cat: "cestos",
    basePrices: [7850, 7401, 6953], emoji: "🧺", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "55 x 32 x 60 | Gris/Blanco",
  },

  // ACCESORIOS
  {
    id: 301, code: "THS032", name: "Funda Mascota Auto Premium", brand: "Cover Up", cat: "mascotas",
    basePrices: [33948, 32008, 30068], emoji: "🐾", active: true, tag: "Premium",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "137 x 147 | Negro",
  },
  {
    id: 302, code: "THS427", name: "Correa Mascota Auto", brand: "Cover Up", cat: "mascotas",
    basePrices: [1731, 1627, 1558], emoji: "🐾", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "Negro",
  },
  {
    id: 303, code: "THS450", name: "Balde Plegable", brand: "Cover Up", cat: "limpieza",
    basePrices: [9746, 9189, 8632], emoji: "🪣", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "28x28x24 | Gris",
  },
  {
    id: 304, code: "THS451", name: "Balde Colador Plegable", brand: "Cover Up", cat: "limpieza",
    basePrices: [9114, 8593, 8072], emoji: "🪣", active: true, tag: "",
    tiers: [{ min: 1, max: 29 }, { min: 30, max: 119 }, { min: 120, max: Infinity }],
    details: "31x30x7 | Gris",
  },
];

export const INITIAL_ORDERS = [
  {
    id: 1001, client: "Comercio Centro", phone: "1155221100",
    date: "2025-05-14", status: "pendiente",
    items: [{ name: "Caja Org. Grande c/ Visor", code: "THS010", qty: 50 }, { name: "Cesto Ropa Laundry", code: "THS027", qty: 20 }],
    total: 618680,
  },
  {
    id: 1002, client: "Minorista Zona Sur", phone: "1144332211",
    date: "2025-05-15", status: "confirmado",
    items: [{ name: "Caja Org. Transp. Grande", code: "THS014", qty: 120 }],
    total: 1347120,
  },
];

export const SELLER_PHONE = "1154922800";

export function formatPrice(n) {
  return "$" + Number(n).toLocaleString("es-AR");
}

// Función para obtener el precio según cantidad
export function getPriceByQuantity(product, qty) {
  if (!product.basePrices || !product.tiers) return product.basePrices?.[0] || 0;
  const tierIndex = product.tiers.findIndex(t => qty >= t.min && qty <= t.max);
  return product.basePrices[tierIndex >= 0 ? tierIndex : 0];
}
