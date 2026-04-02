-- Jalankan setelah akun admin selesai register di aplikasi.
-- Ganti email di bawah ini dengan email akun yang kamu pakai untuk admin.

insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where lower(email) = lower('aryamunandar28@gmail.com')
on conflict (id) do update
set email = excluded.email,
    role = 'admin'
returning id, email, role;

select id, email, role
from public.profiles
where lower(email) = lower('aryamunandar28@gmail.com');
