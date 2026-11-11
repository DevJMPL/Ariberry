"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    params.get("error") === "no-admin" ? "Esta cuenta no tiene permiso de administrador." : "",
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message.includes("Invalid login") ? "Correo o contraseña incorrectos." : error.message,
      );
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <Image src="/brand/logo.svg" alt="Ariberry" width={198} height={52} unoptimized preload />
      <h1 className="mt-3 text-lg text-muted">Entra a tu panel</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold">Correo</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-12 w-full rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-berry"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-12 w-full rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-berry"
          />
        </label>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-ink font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
