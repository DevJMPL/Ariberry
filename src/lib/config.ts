// Datos de la tienda. Si algo cambia (número, zona de entrega), edítalo aquí.
export const STORE = {
  name: "Ariberry",
  tagline: "Cosas bonitas y útiles para tu casa",
  // Número de WhatsApp en formato internacional, solo dígitos: 52 + 10 dígitos.
  whatsapp: "522205756236",
  whatsappDisplay: "220 575 6236",
  deliveryZone: "Ixmiquilpan, Hgo.",
  deliveryNote:
    "Entregamos en punto medio dentro de la zona de Ixmiquilpan. Al pedir por WhatsApp acordamos el lugar y la hora.",
  // Con este número de piezas o menos se muestra "Últimas piezas".
  lowStockThreshold: 3,
} as const;

export const BUCKET = "product-images";

export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
