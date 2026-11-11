import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories, getAdminProduct } from "@/lib/admin-data";

export default async function EditProductPage({ params }: PageProps<"/admin/productos/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, categories] = await Promise.all([getAdminProduct(id), getAdminCategories()]);
  if (!product) notFound();
  return <ProductForm key={product.id} product={product} categories={categories} />;
}
