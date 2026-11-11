"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-4xl gap-1 px-4 pb-2">
      {links.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" || path.startsWith("/admin/productos") : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              active ? "bg-ink text-white" : "text-muted hover:bg-paper"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
