import "server-only";
import { requireAdmin } from "./auth";

// Lecturas PRIVADAS del panel (incluyen el precio de compra). Nunca se guardan en caché.

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  price: number;
  cost: number;
  stock: number;
  isVisible: boolean;
  images: string[];
};

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category_id: string | null;
  price: number | string;
  stock: number;
  is_visible: boolean;
  categories: { name: string } | null;
  product_costs: { cost: number | string } | { cost: number | string }[] | null;
  product_images: { path: string; position: number }[];
};

const SELECT =
  "id, slug, name, description, category_id, price, stock, is_visible, categories(name), product_costs(cost), product_images(path, position)";

function toAdmin(r: Row): AdminProduct {
  const costRow = Array.isArray(r.product_costs) ? r.product_costs[0] : r.product_costs;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    categoryId: r.category_id,
    categoryName: r.categories?.name ?? null,
    price: Number(r.price),
    cost: Number(costRow?.cost ?? 0),
    stock: r.stock,
    isVisible: r.is_visible,
    images: [...r.product_images].sort((a, b) => a.position - b.position).map((i) => i.path),
  };
}

export async function getAdminProducts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  if (error) throw new Error(error.message);
  return data.map(toAdmin);
}

export async function getAdminProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select(SELECT).eq("id", id).maybeSingle<Row>();
  if (error) throw new Error(error.message);
  return data ? toAdmin(data) : null;
}

export async function getAdminCategories() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, products(count)")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return data.map((c) => ({
    id: c.id as string,
    name: c.name as string,
    productCount: (c.products as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}
