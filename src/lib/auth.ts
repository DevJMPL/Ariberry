import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServer } from "./supabase/server";

/**
 * Verifica que quien entra sea administrador. Si no, lo manda al login.
 * Devuelve un cliente de Supabase con su sesión (las reglas RLS lo reconocen como admin).
 */
export async function requireAdmin() {
  // La sesión se revisa en cada visita (nunca se pre-genera): Supabase compara
  // la hora actual con la caducidad de tu sesión.
  await connection();
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=no-admin");

  return { supabase, email: (data.claims.email as string | undefined) ?? "" };
}
