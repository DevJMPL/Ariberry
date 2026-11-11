"use client";

import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { formatMXN, imageUrl } from "@/lib/format";
import { useCart } from "../cart/cart-context";
import { CheckIcon, PlusIcon } from "../icons";
import { StockBadge } from "./stock-badge";

export function ProductCard({ product, eager }: { product: CatalogProduct; eager?: boolean }) {
  const cart = useCart();
  const soldOut = product.stock <= 0;
  const inCart = cart.has(product.id);
  const cover = product.images[0];

  return (
    <article className="group @container relative">
      <Link href={`/p/${product.slug}`} className="block" prefetch>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-berry-soft">
          {cover ? (
            <Image
              src={imageUrl(cover)}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${soldOut ? "grayscale-[60%] opacity-70" : ""}`}
              preload={eager}
              loading={eager ? "eager" : "lazy"}
            />
          ) : (
            <div className="grid h-full place-items-center font-display text-4xl font-bold text-berry/30">A</div>
          )}
          <StockBadge stock={product.stock} className="absolute left-2.5 top-2.5" />
        </div>
        <div className="-mt-4 pl-1.5">
          <span className="price-tag -rotate-3 text-lg shadow-md" data-soldout={soldOut}>
            {formatMXN(product.price)}
          </span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 px-1 text-[0.95rem] font-medium leading-snug">{product.name}</h3>
      </Link>

      {!soldOut && (
        <button
          type="button"
          onClick={() =>
            cart.add({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: cover ?? null,
              maxQty: product.stock,
            })
          }
          disabled={inCart && product.stock === 1}
          aria-label={inCart ? `${product.name} ya está en tu pedido` : `Agregar ${product.name} al pedido`}
          // 125cqw = alto de la foto (4:5), así el botón queda en su esquina inferior.
          className={`absolute right-2.5 top-[calc(125cqw-3.1rem)] grid size-10 place-items-center rounded-full shadow-md transition-colors ${
            inCart ? "bg-leaf text-white" : "bg-white text-ink active:bg-berry-soft"
          }`}
        >
          {inCart ? <CheckIcon width={18} /> : <PlusIcon width={18} />}
        </button>
      )}
    </article>
  );
}
