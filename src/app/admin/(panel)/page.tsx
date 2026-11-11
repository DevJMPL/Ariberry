import { AdminProductList } from "@/components/admin/product-list";
import { getAdminProducts } from "@/lib/admin-data";

export default async function AdminHome() {
  const products = await getAdminProducts();
  return <AdminProductList products={products} />;
}
