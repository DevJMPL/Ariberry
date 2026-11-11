# Ariberry

Catálogo en línea con pedidos por WhatsApp. Next.js 16 + Supabase + Vercel.

## Correr en tu computadora

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:3000
```

- Tienda: `http://localhost:3000`
- Panel: `http://localhost:3000/admin`

## Archivos importantes

| Archivo | Para qué |
|---|---|
| `.env.local` | Claves de Supabase (no se sube a GitHub) |
| `src/lib/config.ts` | Nombre, WhatsApp, zona de entrega, umbral de "Últimas piezas" |
| `supabase/01_catalogo.sql` | Tablas y reglas de seguridad (se corre en Supabase → SQL Editor) |
| `supabase/02_hacerme_admin.sql` | Darte permiso de administrador |

## Variables de entorno (también en Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (en Vercel: la dirección final, p. ej. `https://ariberry.vercel.app`)
