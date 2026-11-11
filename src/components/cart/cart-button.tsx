"use client";

import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useEffect } from "react";
import { BagIcon } from "../icons";
import { useCart } from "./cart-context";

export function CartButton() {
  const { count, open, bump } = useCart();
  const [scope, animate] = useAnimate<HTMLButtonElement>();

  // Pequeño "salto" del botón cada vez que agregas algo al pedido.
  useEffect(() => {
    if (bump > 0 && scope.current) animate(scope.current, { scale: [1, 1.18, 1] }, { duration: 0.35 });
  }, [bump, animate, scope]);

  return (
    <button
      ref={scope}
      type="button"
      onClick={open}
      className="relative grid size-11 place-items-center rounded-full bg-ink text-white"
      aria-label={count ? `Ver pedido, ${count} productos` : "Ver pedido"}
    >
      <BagIcon />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-sun px-1 text-xs font-bold text-ink ring-2 ring-paper"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
