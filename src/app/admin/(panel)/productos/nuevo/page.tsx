import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin-data";

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return <ProductForm categories={categories} />;
}
