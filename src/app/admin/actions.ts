"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { BUCKET } from "@/lib/config";
import { slugify } from "@/lib/format";
import { createSupabaseServer } from "@/lib/supabase/server";

// Todas estas funciones corren en el servidor y primero confirman que eres admin.
// Además, las reglas RLS de Supabase rechazarían cualquier cambio de alguien más.

type Result = { ok: true; id?: string } | { ok: false; error: string };

export type ProductInput = {
  id?: string;
  name: string;
  description: string;
  categoryId: string | null;
  cost: number;
  price: number;
  stock: number;
  isVisible: boolean;
  images: string[];
};

const isMoney = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n < 10_000_000;

export async function saveProduct(input: ProductInput): Promise<Result> {
  const { supabase } = await requireAdmin();

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Escribe el nombre del producto." };
  if (name.length > 120) return { ok: false, error: "El nombre es muy largo (máximo 120 letras)." };
  if (!isMoney(input.price)) return { ok: false, error: "Revisa el precio de venta." };
  if (!isMoney(input.cost)) return { ok: false, error: "Revisa el precio de compra." };
  if (!Number.isInteger(input.stock) || input.stock < 0)
    return { ok: false, error: "Las piezas en stock deben ser un número entero (0 o más)." };
  if (!Array.isArray(input.images) || input.images.length > 10)
    return { ok: false, error: "Puedes subir hasta 10 fotos por producto." };
  if (input.images.some((p) => typeof p !== "string" || !/^products\/[\w-]+\.jpg$/.test(p)))
    return { ok: false, error: "Hay una foto inválida. Vuelve a subirla." };

  const fields = {
    name,
    description: (input.description ?? "").trim().slice(0, 2000),
    category_id: input.categoryId || null,
    price: Math.round(input.price * 100) / 100,
    stock: input.stock,
    is_visible: Boolean(input.isVisible),
  };

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("products").update(fields).eq("id", id);
    if (error) return { ok: false, error: `No se pudo guardar: ${error.message}` };
  } else {
    // El enlace del producto: nombre + 4 caracteres al azar (para que nunca se repita).
    const slug = `${slugify(name) || "producto"}-${crypto.randomUUID().slice(0, 4)}`;
    const { data, error } = await supabase.from("products").insert({ ...fields, slug }).select("id").single();
    if (error) return { ok: false, error: `No se pudo crear: ${error.message}` };
    id = data.id as string;
  }

  const { error: costError } = await supabase
    .from("product_costs")
    .upsert({ product_id: id, cost: Math.round(input.cost * 100) / 100 });
  if (costError) return { ok: false, error: `No se pudo guardar el precio de compra: ${costError.message}` };

  // Fotos: reemplazamos la lista y borramos del almacenamiento las que quitaste.
  const { data: oldImages } = await supabase.from("product_images").select("path").eq("product_id", id);
  await supabase.from("product_images").delete().eq("product_id", id);
  if (input.images.length) {
    const { error: imgError } = await supabase
      .from("product_images")
      .insert(input.images.map((path, position) => ({ product_id: id, path, position })));
    if (imgError) return { ok: false, error: `No se pudieron guardar las fotos: ${imgError.message}` };
  }
  const removed = (oldImages ?? []).map((i) => i.path as string).filter((p) => !input.images.includes(p));
  if (removed.length) await supabase.storage.from(BUCKET).remove(removed);

  updateTag("catalog");
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data: images } = await supabase.from("product_images").select("path").eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: `No se pudo eliminar: ${error.message}` };
  const paths = (images ?? []).map((i) => i.path as string);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  updateTag("catalog");
  return { ok: true };
}

export async function setVisibility(id: string, isVisible: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ is_visible: isVisible }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("catalog");
  return { ok: true };
}

export async function createCategory(name: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const clean = name.trim();
  if (!clean) return { ok: false, error: "Escribe un nombre." };
  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase
    .from("categories")
    .insert({ name: clean.slice(0, 60), sort_order: (last?.sort_order ?? 0) + 1 });
  if (error) return { ok: false, error: error.code === "23505" ? "Esa categoría ya existe." : error.message };
  updateTag("catalog");
  return { ok: true };
}

export async function renameCategory(id: string, name: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const clean = name.trim();
  if (!clean) return { ok: false, error: "Escribe un nombre." };
  const { error } = await supabase.from("categories").update({ name: clean.slice(0, 60) }).eq("id", id);
  if (error) return { ok: false, error: error.code === "23505" ? "Esa categoría ya existe." : error.message };
  updateTag("catalog");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  // Los productos de esta categoría se quedan "sin categoría" (no se borran).
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  updateTag("catalog");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
