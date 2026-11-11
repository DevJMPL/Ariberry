import { BUCKET, STORE } from "./config";

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatMXN(value: number) {
  return mxn.format(value);
}

export function imageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export type StockStatus = "agotado" | "ultimas" | "unica" | "disponible";

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "agotado";
  if (stock === 1) return "unica";
  if (stock <= STORE.lowStockThreshold) return "ultimas";
  return "disponible";
}

export function stockText(stock: number) {
  const s = stockStatus(stock);
  if (s === "agotado") return "Agotado";
  if (s === "unica") return "Pieza única";
  return `${stock} disponibles`;
}

/** Ganancia en pesos y porcentaje sobre el precio de compra. */
export function profit(cost: number, price: number) {
  const amount = price - cost;
  const percent = cost > 0 ? (amount / cost) * 100 : null;
  return { amount, percent };
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
