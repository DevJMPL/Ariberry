"use client";

import type { CatalogProduct } from "@/lib/catalog";
import { STORE } from "@/lib/config";
import { formatMXN } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { useCart } from "../cart/cart-context";
import { BagIcon, CheckIcon, WhatsAppIcon } from "../icons";

export function ProductActions({ product }: { product: CatalogProduct }) {
  const cart = useCart();
  const soldOut = product.stock <= 0;
  const inCart = cart.has(product.id);

  function askOnWhatsApp() {
    const url = `${window.location.origin}/p/${product.slug}`;
    const message = soldOut
      ? `Hola ${STORE.name}, vi que se agotó ${product.name}. ¿Volverá a haber? ${url}`
      : `Hola, me interesa ${product.name} de ${formatMXN(product.price)}. ${url}`;
    window.open(whatsappLink(message), "_blank", "noopener");
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
      <div className="mx-auto flex max-w-6xl gap-2.5">
        {!soldOut && (
          <button
            type="button"
            onClick={() =>
              inCart
                ? cart.open()
                : cart.add({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] ?? null,
                    maxQty: product.stock,
                  })
            }
            className={`flex h-14 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 font-semibold transition-colors ${
              inCart ? "border-leaf text-leaf" : "border-ink text-ink active:bg-ink active:text-white"
            }`}
          >
            {inCart ? <CheckIcon width={20} /> : <BagIcon width={20} />}
            {inCart ? "En tu pedido" : "Agregar"}
          </button>
        )}
        <button
          type="button"
          onClick={askOnWhatsApp}
          className="flex h-14 flex-[1.6] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-leaf px-4 font-semibold text-white transition-colors active:bg-leaf-deep"
        >
          <WhatsAppIcon />
          {soldOut ? "Preguntar" : "Pedir por WhatsApp"}
        </button>
      </div>
    </div>
  );
}
