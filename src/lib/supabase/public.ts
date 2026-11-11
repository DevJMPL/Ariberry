import { createClient } from "@supabase/supabase-js";

/**
 * Cliente "anónimo": lee solo lo que las reglas RLS permiten al público.
 * No usa cookies, por eso se puede usar dentro de funciones con "use cache".
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
