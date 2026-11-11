import type { Metadata, Viewport } from "next";
import { Figtree, Outfit } from "next/font/google";
import { STORE, siteUrl } from "@/lib/config";
import "./globals.css";

// Outfit es la misma familia de letra del logotipo.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${STORE.name} · ${STORE.tagline}`,
    template: `%s · ${STORE.name}`,
  },
  description: `${STORE.tagline}. Pide por WhatsApp y te lo entregamos en punto medio en ${STORE.deliveryZone}`,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: STORE.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#5c2d80",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${outfit.variable} ${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
