import { stockStatus } from "@/lib/format";

const styles = {
  agotado: "bg-ink text-white",
  ultimas: "bg-sun text-ink",
  unica: "bg-white text-berry-deep",
} as const;

const labels = { agotado: "Agotado", ultimas: "Últimas piezas", unica: "Pieza única" } as const;

export function StockBadge({ stock, className = "" }: { stock: number; className?: string }) {
  const s = stockStatus(stock);
  if (s === "disponible") return null;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${styles[s]} ${className}`}
    >
      {labels[s]}
    </span>
  );
}
