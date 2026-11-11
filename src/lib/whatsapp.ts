import { STORE } from "./config";

export function whatsappLink(message: string) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}
