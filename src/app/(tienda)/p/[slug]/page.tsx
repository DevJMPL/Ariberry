import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Gallery } from "@/components/catalog/gallery";
import { ProductActions } from "@/components/catalog/product-actions";
import { StockBadge } from "@/components/catalog/stock-badge";
import { BackIcon, PinIcon } from "@/components/icons";
import { getCatalog, getProduct } from "@/lib/catalog";
import { STORE } from "@/lib/config";
import { formatMXN, imageUrl, stockText } from "@/lib/format";

// Prepara de antemano las páginas de los productos más recientes; las demás se
// generan en la primera visita y quedan guardadas.
export async function generateStaticParams() {
  const products = await getCatalog();
  const slugs = products.slice(0, 40).map((p) => ({ slug: p.slug }));
  // Next.js pide al menos un valor; si aún no hay productos usamos uno de relleno.
  return slugs.length ? slugs : [{ slug: "proximamente" }];
}

// Esto es lo que ven Facebook y WhatsApp al compartir el enlace.
export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };

  const price = formatMXN(product.price);
  const title = `${product.name} por ${price}`;
  const description =
    (product.stock > 0 ? `${stockText(product.stock)}. ` : "Agotado. ") +
    (product.description.replace(/\s+/g, " ").trim().slice(0, 140) ||
      `Entrega en punto medio en ${STORE.deliveryZone}`);
  const images = product.images[0] ? [{ url: imageUrl(product.images[0]), alt: product.name }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/p/${product.slug}` },
    openGraph: { type: "website", title, description, url: `/p/${product.slug}`, images },
    twitter: { card: "summary_large_image", title, description, images: images?.map((i) => i.url) },
  };
}

export default function ProductPage(props: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails params={props.params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: Pick<PageProps<"/p/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const soldOut = product.stock <= 0;

  return (
    <div className="pb-28 md:pb-0">
      <Link
        href="/"
        className="-ml-2 mb-2 mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-semibold text-muted"
      >
        <BackIcon width={18} />
        Todos los productos
      </Link>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <Gallery images={product.images} name={product.name} />

        <div className="md:pt-4">
          {product.categoryName && <p className="text-sm font-semibold text-berry">{product.categoryName}</p>}
          <h1 className="mt-1 font-display text-[clamp(1.8rem,7vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.025em]">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="price-tag -rotate-2 text-2xl" data-soldout={soldOut}>
              {formatMXN(product.price)}
            </span>
            <StockBadge stock={product.stock} />
            {product.stock > 1 && (
              <span className="text-sm font-semibold text-muted">{stockText(product.stock)}</span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 max-w-[60ch] whitespace-pre-line text-[1.05rem] leading-relaxed">{product.description}</p>
          )}

          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted">
            <PinIcon width={18} height={18} className="mt-0.5 shrink-0 text-berry" />
            <p>
              {STORE.deliveryNote} Pago en efectivo o por transferencia.
            </p>
          </div>

          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mt-12 grid animate-pulse gap-6 md:grid-cols-2">
      <div className="aspect-square rounded-[28px] bg-berry-soft" />
      <div className="space-y-4 md:pt-4">
        <div className="h-9 w-3/4 rounded-lg bg-line" />
        <div className="h-8 w-28 rounded-lg bg-line" />
        <div className="h-24 rounded-lg bg-line" />
      </div>
    </div>
  );
}
