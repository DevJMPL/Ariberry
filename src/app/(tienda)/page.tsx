import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { PinIcon } from "@/components/icons";
import { getCatalog, getCategories } from "@/lib/catalog";
import { STORE } from "@/lib/config";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);
  const available = products.filter((p) => p.stock > 0).length;

  return (
    <>
      <section className="pb-5 pt-7 sm:pt-12">
        <h1 className="max-w-[14ch] font-display text-[clamp(2.4rem,10.5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
          Cosas bonitas para tu casa
        </h1>
        <p className="mt-4 max-w-[46ch] text-[1.05rem] leading-relaxed text-muted">
          Piezas que ya tenemos aquí, listas para entregarte. Aparta la tuya por WhatsApp: muchas son únicas.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-berry-soft px-3 py-1.5 text-berry-deep">
            <PinIcon width={16} height={16} />
            Punto medio en {STORE.deliveryZone}
          </span>
          {available > 0 && (
            <span className="rounded-full bg-card px-3 py-1.5 text-ink">{available} productos disponibles</span>
          )}
        </div>
      </section>

      <CatalogBrowser products={products} categories={categories} />
    </>
  );
}
