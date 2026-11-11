import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-md flex-1 place-content-center px-6 py-24 text-center">
      <p className="font-display text-3xl font-bold">Este producto ya no está aquí</p>
      <p className="mt-2 text-muted">Puede que ya se haya vendido o que el enlace esté incompleto.</p>
      <Link href="/" className="mx-auto mt-6 rounded-full bg-ink px-6 py-3 font-semibold text-white">
        Ver productos disponibles
      </Link>
    </main>
  );
}
