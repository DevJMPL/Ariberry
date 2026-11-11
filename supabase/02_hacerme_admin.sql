-- =====================================================================
-- ARIBERRY · Darte permiso de administrador
-- 1. Primero crea tu usuario en Supabase → Authentication → Users → Add user
--    (marca "Auto Confirm User").
-- 2. Cambia el correo de abajo por el que usaste y corre este archivo en el SQL Editor.
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users where email = 'TU_CORREO@ejemplo.com'
on conflict (user_id) do nothing;

-- Revisión: debe aparecer tu correo.
select u.email from public.admins a join auth.users u on u.id = a.user_id;
