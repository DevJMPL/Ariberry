"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { setVisibility } from "@/app/admin/actions";
import type { AdminProduct } from "@/lib/admin-data";
import { formatMXN, imageUrl, profit } from "@/lib/format";
import { PlusIcon, SearchIcon } from "../icons";

const filters = [
  { id: "todos", label: "Todos" },
  { id: "visibles", label: "Visibles" },
  { id: "ocultos", label: "Ocultos" },
  { id: "agotados", label: "Agotados" },
] as const;
type Filter = (typeof filters)[number]["id"];

export function AdminProductList({ products }: { products: AdminProduct[] }) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "visibles" && !p.isVisible) return false;
      if (filter === "ocultos" && p.isVisible) return false;
      if (filter === "agotados" && p.stock > 0) return false;
      return !q || p.name.toLowerCase().includes(q);
    });
  }, [products, filter, query]);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted">
            {products.length} en total, {products.filter((p) => p.isVisible && p.stock > 0).length} a la venta
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="hidden items-center gap-1.5 rounded-full bg-berry px-5 py-2.5 font-semibold text-white sm:inline-flex"
        >
          <PlusIcon width={18} /> Nuevo producto
        </Link>
      </div>

      <label className="relative mt-4 block">
        <span className="sr-only">Buscar</span>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" width={18} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre"
          className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-base outline-none focus:border-berry"
        />
      </label>

      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              filter === f.id ? "bg-berry-soft text-berry-deep" : "bg-white text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-8 text-center">
          <p className="font-semibold">
            {products.length === 0 ? "Aún no tienes productos" : "Ningún producto coincide"}
          </p>
          {products.length === 0 && (
            <Link href="/admin/productos/nuevo" className="mt-4 inline-block rounded-full bg-berry px-5 py-2.5 font-semibold text-white">
              Agregar el primero
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {shown.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </ul>
      )}

      <Link
        href="/admin/productos/nuevo"
        aria-label="Nuevo producto"
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 grid size-14 place-items-center rounded-full bg-berry text-white shadow-lg sm:hidden"
      >
        <PlusIcon width={26} />
      </Link>
    </div>
  );
}

function ProductRow({ product: p }: { product: AdminProduct }) {
  const [visible, setVisible] = useState(p.isVisible);
  const [pending, start] = useTransition();
  const { amount, percent } = profit(p.cost, p.price);

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white p-2.5">
      <Link href={`/admin/productos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-berry-soft">
          {p.images[0] && <Image src={imageUrl(p.images[0])} alt="" fill sizes="64px" className="object-cover" />}
        </div>
        <div className="min-w-0">
          <p className={`truncate font-semibold ${visible ? "" : "text-muted"}`}>{p.name}</p>
          <p className="text-sm">
            <span className="font-semibold">{formatMXN(p.price)}</span>
            <span className={amount >= 0 ? "text-leaf" : "text-danger"}>
              {" "}
              (gana {formatMXN(amount)}
              {percent !== null && `, ${Math.round(percent)}%`})
            </span>
          </p>
          <p className={`text-xs font-semibold ${p.stock === 0 ? "text-danger" : "text-muted"}`}>
            {p.stock === 0 ? "Agotado" : `${p.stock} en stock`}
            {p.categoryName && ` en ${p.categoryName}`}
          </p>
        </div>
      </Link>
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        aria-label={visible ? "Visible en la tienda. Toca para ocultar" : "Oculto. Toca para mostrar"}
        disabled={pending}
        onClick={() => {
          const next = !visible;
          setVisible(next);
          start(async () => {
            const r = await setVisibility(p.id, next);
            if (!r.ok) {
              setVisible(!next);
              alert(r.error);
            }
          });
        }}
        className="flex shrink-0 flex-col items-center gap-1 px-1 text-[0.7rem] font-semibold text-muted"
      >
        <span className={`relative h-6 w-11 rounded-full transition-colors ${visible ? "bg-leaf" : "bg-line"}`}>
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${visible ? "left-[22px]" : "left-0.5"}`}
          />
        </span>
        {visible ? "Visible" : "Oculto"}
      </button>
    </li>
  );
}
