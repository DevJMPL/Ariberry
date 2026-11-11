"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useMemo, useState } from "react";
import type { CatalogProduct, Category } from "@/lib/catalog";
import { CloseIcon, SearchIcon } from "../icons";
import { ProductCard } from "./product-card";

const normalize = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function CatalogBrowser({
  products,
  categories,
}: {
  products: CatalogProduct[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  // Solo mostramos categorías que tienen productos.
  const usedCategories = useMemo(
    () => categories.filter((c) => products.some((p) => p.categoryId === c.id)),
    [categories, products],
  );

  const visible = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    return products.filter((p) => {
      if (category && p.categoryId !== category) return false;
      if (!q) return true;
      return normalize(`${p.name} ${p.description} ${p.categoryName ?? ""}`).includes(q);
    });
  }, [products, category, deferredQuery]);

  return (
    <section aria-label="Productos">
      <div className="sticky top-16 z-30 -mx-4 bg-paper/90 px-4 pb-3 pt-2 backdrop-blur-md">
        <label className="relative block">
          <span className="sr-only">Buscar productos</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" width={20} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar: taza, organizador, cojín…"
            enterKeyHint="search"
            className="h-12 w-full rounded-full border border-line bg-card pl-11 pr-11 text-base outline-none transition-shadow placeholder:text-muted/70 focus:border-berry focus:shadow-[0_0_0_3px_var(--berry-soft)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Borrar búsqueda"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted"
            >
              <CloseIcon width={18} />
            </button>
          )}
        </label>

        {usedCategories.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="toolbar" aria-label="Categorías">
            {[{ id: null, name: "Todo" }, ...usedCategories].map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id ?? "todo"}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={active}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? "text-white" : "bg-card text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="chip"
                      className="absolute inset-0 rounded-full bg-berry"
                      transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    />
                  )}
                  <span className="relative">{c.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-display text-xl font-semibold">
            {products.length === 0 ? "Muy pronto subiremos productos" : "No encontramos eso"}
          </p>
          <p className="mt-1 text-muted">
            {products.length === 0
              ? "Escríbenos por WhatsApp para saber qué tenemos."
              : "Prueba con otra palabra o elige otra categoría."}
          </p>
        </div>
      ) : (
        <motion.ul layout className="mt-2 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard product={p} eager={i < 4} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
