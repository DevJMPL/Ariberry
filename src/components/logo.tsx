import Image from "next/image";
import Link from "next/link";

// Logotipo oficial (archivo vectorial en public/brand/logo.svg).
// Proporción del archivo: 1560 × 410.
export function Logo({ height = 36, href = "/" }: { height?: number; href?: string }) {
  return (
    <Link href={href} className="inline-flex shrink-0" aria-label="Ariberry, ir al inicio">
      <Image
        src="/brand/logo.svg"
        alt="Ariberry"
        width={Math.round((height * 1560) / 410)}
        height={height}
        unoptimized
        preload
      />
    </Link>
  );
}
