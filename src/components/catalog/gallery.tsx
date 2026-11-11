"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { imageUrl } from "@/lib/format";

/** Galería que se desliza con el dedo (usa el scroll nativo: rápido y ligero). */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-square rounded-[28px] bg-berry-soft" />;
  }

  function goTo(i: number) {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="md:sticky md:top-20 md:self-start">
      <div className="relative -mx-4 sm:mx-0">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:rounded-[28px]"
          aria-roledescription="galería"
        >
          {images.map((path, i) => (
            <div key={path} className="relative aspect-square w-full shrink-0 snap-center bg-white">
              <Image
                src={imageUrl(path)}
                alt={images.length > 1 ? `${name}, foto ${i + 1} de ${images.length}` : name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                // "contain" muestra la foto completa (sin recortar textos ni bordes).
                className="object-contain"
                preload={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full bg-ink/70 shadow transition-all duration-300 ${
                  i === index ? "w-5 opacity-100" : "w-1.5 opacity-60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((path, i) => (
            <button
              key={path}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={`relative size-16 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition ${
                i === index ? "ring-berry" : "ring-transparent opacity-70"
              }`}
            >
              <Image src={imageUrl(path)} alt="" fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
