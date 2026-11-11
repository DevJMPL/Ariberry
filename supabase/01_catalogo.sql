-- =====================================================================
-- ARIBERRY · FASE 1 · Catálogo
-- Cómo usarlo: Supabase → SQL Editor → New query → pega TODO este archivo → Run.
-- Se puede volver a correr sin romper nada (usa "if not exists" / "or replace").
-- =====================================================================

-- ---------- Administradores ----------
-- Solo los usuarios que estén en esta tabla pueden editar el catálogo.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- Sin políticas: nadie puede leer ni escribir esta tabla desde la página.

-- ¿El usuario que hace la petición es administrador?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Categorías ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 60),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

drop policy if exists "categorias: todos leen" on public.categories;
create policy "categorias: todos leen" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "categorias: admin escribe" on public.categories;
create policy "categorias: admin escribe" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Productos (datos PÚBLICOS) ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  category_id uuid references public.categories (id) on delete set null,
  price numeric(10, 2) not null check (price >= 0),
  stock int not null default 1 check (stock >= 0),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
alter table public.products enable row level security;

-- El público solo ve productos visibles; el admin ve todos.
drop policy if exists "productos: leer visibles" on public.products;
create policy "productos: leer visibles" on public.products
  for select to anon, authenticated using (is_visible or public.is_admin());

drop policy if exists "productos: admin escribe" on public.products;
create policy "productos: admin escribe" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- Costos (datos PRIVADOS) ----------
-- El precio de compra vive en su propia tabla porque la seguridad de Supabase
-- funciona por filas completas: así el público nunca puede pedirlo.
create table if not exists public.product_costs (
  product_id uuid primary key references public.products (id) on delete cascade,
  cost numeric(10, 2) not null default 0 check (cost >= 0)
);
alter table public.product_costs enable row level security;

drop policy if exists "costos: solo admin" on public.product_costs;
create policy "costos: solo admin" on public.product_costs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Fotos ----------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null,
  position int not null default 0
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);
alter table public.product_images enable row level security;

drop policy if exists "fotos: leer de productos visibles" on public.product_images;
create policy "fotos: leer de productos visibles" on public.product_images
  for select to anon, authenticated using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_visible or public.is_admin())
    )
  );

drop policy if exists "fotos: admin escribe" on public.product_images;
create policy "fotos: admin escribe" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Almacenamiento de fotos ----------
-- Carpeta pública "product-images": cualquiera puede VER las fotos (para el catálogo),
-- pero solo el admin puede subir, cambiar o borrar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fotos storage: admin sube" on storage.objects;
create policy "fotos storage: admin sube" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "fotos storage: admin actualiza" on storage.objects;
create policy "fotos storage: admin actualiza" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "fotos storage: admin borra" on storage.objects;
create policy "fotos storage: admin borra" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------- Permisos base de la API ----------
-- (Las reglas RLS de arriba siguen decidiendo QUÉ filas ve cada quien.)
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_images to anon;
grant select, insert, update, delete
  on public.categories, public.products, public.product_images, public.product_costs
  to authenticated;
revoke all on public.product_costs from anon;
revoke all on public.admins from anon, authenticated;

-- ---------- Categorías iniciales (puedes cambiarlas desde el panel) ----------
insert into public.categories (name, sort_order) values
  ('Cocina', 1),
  ('Decoración', 2),
  ('Organización', 3),
  ('Baño', 4),
  ('Recámara', 5),
  ('Variedades', 99)
on conflict (name) do nothing;
