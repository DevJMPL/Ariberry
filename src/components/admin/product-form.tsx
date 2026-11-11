"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import type { AdminProduct } from "@/lib/admin-data";
import { compressImage } from "@/lib/compress-image";
import { BUCKET } from "@/lib/config";
import { formatMXN, imageUrl, profit } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { BackIcon, CloseIcon, PlusIcon } from "../icons";

type Props = {
  product?: AdminProduct;
  categories: { id: string; name: string }[];
};

const MAX_PHOTOS = 10;
const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-white px-3.5 text-base outline-none focus:border-berry";

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, startSaving] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [cost, setCost] = useState(product ? String(product.cost) : "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "1");
  const [isVisible, setIsVisible] = useState(product?.isVisible ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  const costN = Number(cost) || 0;
  const priceN = Number(price) || 0;
  const { amount, percent } = profit(costN, priceN);

  async function onPickFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_PHOTOS - images.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) setError(`Solo caben ${MAX_PHOTOS} fotos por producto.`);
    setUploading((n) => n + list.length);

    await Promise.all(
      list.map(async (file) => {
        try {
          const blob = await compressImage(file);
          const path = `products/${crypto.randomUUID()}.jpg`;
          const { error } = await supabaseBrowser()
            .storage.from(BUCKET)
            .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
          if (error) throw error;
          setImages((prev) => [...prev, path]);
        } catch (e) {
          setError(`No se pudo subir "${file.name}": ${(e as Error).message}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    if (fileInput.current) fileInput.current.value = "";
  }

  function move(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startSaving(async () => {
      const result = await saveProduct({
        id: product?.id,
        name,
        description,
        categoryId: categoryId || null,
        cost: costN,
        price: priceN,
        stock: Number.parseInt(stock, 10) || 0,
        isVisible,
        images,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  function onDelete() {
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.name}"? Esto no se puede deshacer.`)) return;
    startSaving(async () => {
      const result = await deleteProduct(product.id);
      if (!result.ok) return setError(result.error);
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin" aria-label="Volver" className="grid size-10 place-items-center rounded-full bg-white">
          <BackIcon width={20} />
        </Link>
        <h1 className="font-display text-2xl font-bold">{product ? "Editar producto" : "Nuevo producto"}</h1>
      </div>

      {/* Fotos */}
      <section className="rounded-2xl bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Fotos</h2>
          <span className="text-xs text-muted">La primera es la portada</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((path, i) => (
            <div key={path} className="relative aspect-square overflow-hidden rounded-xl bg-berry-soft">
              <Image src={imageUrl(path)} alt={`Foto ${i + 1}`} fill sizes="160px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[0.65rem] font-bold text-white">
                  Portada
                </span>
              )}
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((p) => p !== path))}
                aria-label={`Quitar foto ${i + 1}`}
                className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/90 text-ink"
              >
                <CloseIcon width={14} />
              </button>
              {images.length > 1 && (
                <div className="absolute inset-x-1 bottom-1 flex justify-between">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover a la izquierda"
                    className="grid size-7 place-items-center rounded-full bg-white/90 text-sm font-bold disabled:invisible"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="Mover a la derecha"
                    className="grid size-7 place-items-center rounded-full bg-white/90 text-sm font-bold disabled:invisible"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={`up-${i}`} className="grid aspect-square animate-pulse place-items-center rounded-xl bg-berry-soft text-xs font-semibold text-berry-deep">
              Subiendo…
            </div>
          ))}
          {images.length + uploading < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-line text-muted"
            >
              <span className="flex flex-col items-center gap-1 text-xs font-semibold">
                <PlusIcon />
                Agregar
              </span>
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => onPickFiles(e.target.files)}
        />
      </section>

      {/* Datos */}
      <section className="space-y-4 rounded-2xl bg-white p-4">
        <label className="block">
          <span className="text-sm font-semibold">Nombre</span>
          <input
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Juego de 4 tazas de cerámica"
            className={`${inputCls} h-12`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Descripción</span>
          <textarea
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Medidas, material, color, estado…"
            className={`${inputCls} py-3`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Categoría</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${inputCls} h-12`}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Precios */}
      <section className="rounded-2xl bg-white p-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-semibold">Precio de compra</span>
            <span className="block text-xs text-muted">Solo tú lo ves</span>
            <MoneyInput value={cost} onChange={setCost} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Precio de venta</span>
            <span className="block text-xs text-muted">Lo ve el cliente</span>
            <MoneyInput value={price} onChange={setPrice} required />
          </label>
        </div>
        <div
          className={`mt-3 flex items-center justify-between rounded-xl px-4 py-3 ${
            amount >= 0 ? "bg-green-50 text-leaf-deep" : "bg-red-50 text-danger"
          }`}
          aria-live="polite"
        >
          <span className="text-sm font-semibold">Ganancia por pieza</span>
          <span className="font-display text-lg font-bold tabular-nums">
            {formatMXN(amount)}
            {percent !== null && <span className="ml-1.5 text-sm">({Math.round(percent)}%)</span>}
          </span>
        </div>
      </section>

      {/* Stock y visibilidad */}
      <section className="flex flex-wrap items-end gap-4 rounded-2xl bg-white p-4">
        <label className="block w-32">
          <span className="text-sm font-semibold">Piezas en stock</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={`${inputCls} h-12`}
          />
        </label>
        <label className="flex h-12 flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl bg-paper px-4">
          <span>
            <span className="block text-sm font-semibold">Visible en la tienda</span>
            <span className="block text-xs text-muted">{isVisible ? "Los clientes lo ven" : "Oculto para los clientes"}</span>
          </span>
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="size-5 accent-[var(--leaf)]"
          />
        </label>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl gap-2">
          {product && (
            <button
              type="button"
              onClick={onDelete}
              disabled={saving}
              className="h-12 rounded-full px-5 font-semibold text-danger disabled:opacity-50"
            >
              Eliminar
            </button>
          )}
          <button
            type="submit"
            disabled={saving || uploading > 0}
            className="h-12 flex-1 rounded-full bg-berry font-semibold text-white disabled:opacity-60"
          >
            {uploading > 0 ? "Esperando fotos…" : saving ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </form>
  );
}

function MoneyInput({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 mt-0.5 -translate-y-1/2 text-muted">$</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`${inputCls} h-12 pl-7 tabular-nums`}
      />
    </div>
  );
}
