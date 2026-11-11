import { CartButton } from "@/components/cart/cart-button";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PinIcon, WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { STORE } from "@/lib/config";
import { whatsappLink } from "@/lib/whatsapp";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <CartProvider>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <CartButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">{children}</main>

      <footer className="mt-16 border-t border-line bg-card text-muted">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2">
          <div>
            <Logo height={40} />
            <p className="mt-2">{STORE.tagline}.</p>
          </div>
          <div className="space-y-3">
            <p className="flex items-start gap-2">
              <PinIcon className="mt-0.5 shrink-0 text-plum" width={18} height={18} />
              {STORE.deliveryNote}
            </p>
            <a
              href={whatsappLink(`Hola ${STORE.name}, tengo una pregunta.`)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 font-semibold text-leaf underline-offset-4 hover:underline"
            >
              <WhatsAppIcon width={18} height={18} />
              WhatsApp {STORE.whatsappDisplay}
            </a>
          </div>
        </div>
      </footer>
      <CartDrawer />
    </CartProvider>
  );
}
