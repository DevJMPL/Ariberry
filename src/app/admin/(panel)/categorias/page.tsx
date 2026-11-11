import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories } from "@/lib/admin-data";

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoryManager categories={categories} />;
}
