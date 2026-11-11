import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

// Todo el panel depende de tu sesión, así que se carga dentro de <Suspense>.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-full flex-1 bg-[#f3f1f4]">
      <Suspense
        fallback={
          <div className="grid min-h-[60dvh] place-items-center text-muted" role="status">
            Cargando…
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
