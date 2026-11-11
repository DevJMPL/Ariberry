"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect } from "react";
import { STORE } from "@/lib/config";
import { formatMXN, imageUrl } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { CloseIcon, MinusIcon, PinIcon, PlusIcon, TrashIcon, WhatsAppIcon } from "../icons";
import { useCart } from "./cart-context";

export function CartDrawer() {
  const cart = useCart();
  const drag = useDragControls();

  // Cerrar con la tecla Escape y evitar que la página de atrás se desplace.
  useEffect(() => {
    if (!cart.isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [cart]);

  function sendOrder() {
    const origin = window.location.origin;
    const lines = cart.items.map(
      (i) =>
        `• ${i.name}${i.qty > 1 ? ` (x${i.qty})` : ""}: ${formatMXN(i.price * i.qty)}\n  ${origin}/p/${i.slug}`,
    );
    const message = [
      `Hola ${STORE.name}, me interesa:`,
      "",
      ...lines,
      "",
      `Total: ${formatMXN(cart.total)}`,
      "¿Dónde y cuándo podemos vernos para la entrega?",
    ].join("\n");
    window.open(whatsappLink(message), "_blank", "noopener");
  }

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Tu pedido">
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-ink/40"
            onClick={cart.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[28px] bg-paper shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-[28px]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && cart.close()}
          >
            <div
              className="touch-none pt-2.5 sm:hidden"
              onPointerDown={(e) => drag.start(e)}
            >
              <div className="mx-auto h-1.5 w-11 rounded-full bg-line" />
            </div>
            <header
              className="flex touch-none items-center justify-between px-5 pb-3 pt-3 sm:touch-auto sm:pt-6"
              onPointerDown={(e) => drag.start(e)}
            >
              <h2 className="font-display text-2xl font-bold tracking-tight">Tu pedido</h2>
              <button
                type="button"
                onClick={cart.close}
                className="grid size-10 place-items-center rounded-full bg-card text-ink"
                aria-label="Cerrar"
              >
                <CloseIcon />
              </button>
            </header>

            {cart.items.length === 0 ? (
              <div className="px-5 pb-10 pt-6 text-center">
                <p className="font-display text-lg font-semibold">Todavía no agregas nada</p>
                <p className="mt-1 text-muted">Toca “Agregar al pedido” en cualquier producto.</p>
                <button
                  type="button"
                  onClick={cart.close}
                  className="mt-6 rounded-full bg-ink px-6 py-3 font-semibold text-white"
                >
                  Ver productos
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
                  <AnimatePresence initial={false}>
                    {cart.items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        exit={{ opacity: 0, x: -40 }}
                        className="flex gap-3 rounded-2xl bg-card p-2.5"
                      >
                        <Link
                          href={`/p/${item.slug}`}
                          onClick={cart.close}
                          className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-berry-soft"
                        >
                          {item.image && (
                            <Image src={imageUrl(item.image)} alt="" fill sizes="80px" className="object-cover" />
                          )}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="line-clamp-2 font-medium leading-snug">{item.name}</p>
                          <p className="mt-0.5 font-display font-bold text-berry">{formatMXN(item.price)}</p>
                          <div className="mt-auto flex items-center justify-between pt-1">
                            {item.maxQty > 1 ? (
                              <div className="flex items-center gap-1 rounded-full bg-paper p-0.5">
                                <button
                                  type="button"
                                  aria-label="Quitar una"
                                  onClick={() => cart.setQty(item.id, item.qty - 1)}
                                  className="grid size-8 place-items-center rounded-full disabled:opacity-30"
                                  disabled={item.qty <= 1}
                                >
                                  <MinusIcon width={16} />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                                <button
                                  type="button"
                                  aria-label="Agregar una"
                                  onClick={() => cart.setQty(item.id, item.qty + 1)}
                                  className="grid size-8 place-items-center rounded-full disabled:opacity-30"
                                  disabled={item.qty >= item.maxQty}
                                >
                                  <PlusIcon width={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted">Pieza única</span>
                            )}
                            <button
                              type="button"
                              onClick={() => cart.remove(item.id)}
                              className="grid size-9 place-items-center rounded-full text-muted"
                              aria-label={`Quitar ${item.name}`}
                            >
                              <TrashIcon width={18} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="border-t border-line bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-muted">Total</span>
                    <span className="font-display text-2xl font-bold tabular-nums">{formatMXN(cart.total)}</span>
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-muted">
                    <PinIcon width={16} height={16} className="mt-0.5 shrink-0" />
                    Entrega en punto medio en {STORE.deliveryZone} El pago es en efectivo o por transferencia.
                  </p>
                  <button
                    type="button"
                    onClick={sendOrder}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-leaf py-4 text-lg font-semibold text-white transition-colors active:bg-leaf-deep"
                  >
                    <WhatsAppIcon />
                    Enviar pedido por WhatsApp
                  </button>
                </footer>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
