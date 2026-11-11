"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategory, deleteCategory, renameCategory } from "@/app/admin/actions";
import { TrashIcon } from "../icons";

type Cat = { id: string; name: string; productCount: number };

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError("");
    start(async () => {
      const r = await fn();
      if (!r.ok) return setError(r.error ?? "Algo salió mal.");
      after?.();
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Categorías</h1>
      <p className="text-sm text-muted">Los clientes solo ven las categorías que tienen productos.</p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => createCategory(newName), () => setNewName(""));
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría"
          maxLength={60}
          className="h-12 flex-1 rounded-xl border border-line bg-white px-3.5 text-base outline-none focus:border-berry"
        />
        <button disabled={pending || !newName.trim()} className="h-12 rounded-full bg-berry px-5 font-semibold text-white disabled:opacity-50">
          Agregar
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-3">
            <input
              defaultValue={c.name}
              maxLength={60}
              aria-label={`Nombre de la categoría ${c.name}`}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== c.name) run(() => renameCategory(c.id, v));
              }}
              className="h-10 min-w-0 flex-1 rounded-lg px-2 text-base outline-none focus:bg-paper"
            />
            <span className="shrink-0 text-xs font-semibold text-muted">
              {c.productCount} {c.productCount === 1 ? "producto" : "productos"}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const msg = c.productCount
                  ? `¿Eliminar "${c.name}"? Sus ${c.productCount} productos quedarán sin categoría.`
                  : `¿Eliminar "${c.name}"?`;
                if (confirm(msg)) run(() => deleteCategory(c.id));
              }}
              aria-label={`Eliminar ${c.name}`}
              className="grid size-10 place-items-center rounded-full text-muted"
            >
              <TrashIcon width={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
