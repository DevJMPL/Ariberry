import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";

// Lecturas PÚBLICAS del catálogo. Se guardan en caché para que la página
// cargue al instante; el panel borra esta caché cada vez que guardas cambios.

export type Category = { id: string; name: string };

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string | null;
  categoryName: string | null;
  images: string[];
};

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  category_id: string | null;
  categories: { name: string } | null;
  product_images: { path: string; position: number }[];
};

// Ojo: aquí NUNCA se pide el costo. Esa tabla ni siquiera es legible para el público.
const SELECT =
  "id, slug, name, description, price, stock, category_id, categories(name), product_images(path, position)";

function toProduct(r: Row): CatalogProduct {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    stock: r.stock,
    categoryId: r.category_id,
    categoryName: r.categories?.name ?? null,
    images: [...r.product_images].sort((a, b) => a.position - b.position).map((i) => i.path),
  };
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  const { data, error } = await createPublicClient()
    .from("products")
    .select(SELECT)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  // Primero lo disponible, al final lo agotado.
  return data.map(toProduct).sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
}

export async function getProduct(slug: string): Promise<CatalogProduct | null> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  const { data, error } = await createPublicClient()
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle<Row>();
  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  return data ? toProduct(data) : null;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, name")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);
  return data;
}
