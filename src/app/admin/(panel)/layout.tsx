import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/brand/logo-icono.svg" alt="" width={30} height={30} unoptimized />
            <span className="font-display text-lg font-semibold">Panel</span>
          </Link>
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Link href="/" target="_blank" className="rounded-full px-3 py-2 text-muted hover:bg-paper">
              Ver tienda
            </Link>
            <form action={signOut}>
              <button className="rounded-full px-3 py-2 text-muted hover:bg-paper">Salir</button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-5">{children}</main>
    </>
  );
}
