# Production Checklist

Checklist ini khusus untuk project `Johan Garage App`.

Status saat ini:
- cocok untuk `MVP / pilot production`
- belum sepenuhnya `production matang` sampai semua poin prioritas di bawah dibereskan

## 1. Wajib Sebelum Rilis

- [ ] Jalankan ulang [schema.sql](/c:/Users/aryamundr/bengkel-app/supabase/schema.sql) di Supabase agar kolom terbaru seperti `service_cost` dan `parts_cost` tersedia.
- [ ] Pastikan file `.env` production berisi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` yang benar.
- [ ] Pastikan akun admin dibuat dan dipromosikan lewat [make-admin.sql](/c:/Users/aryamundr/bengkel-app/supabase/make-admin.sql).
- [ ] Uji login user biasa.
- [ ] Uji login admin.
- [ ] Uji booking sampai data masuk ke Supabase.
- [ ] Uji update status dari admin.
- [ ] Uji history service muncul di akun user setelah admin mengisi diagnosa/perbaikan/part.
- [ ] Uji invoice summary dan service summary bisa dibagikan dari menu admin.

## 2. Validasi Data

- [ ] Pastikan input nomor telepon tidak kosong dan formatnya konsisten.
- [ ] Pastikan field biaya hanya menerima angka.
- [ ] Pastikan field `queueNumber` tidak duplikat untuk skenario operasional bengkelmu jika itu memang wajib unik.
- [ ] Pastikan user tidak bisa melihat order user lain.
- [ ] Pastikan user biasa tidak bisa membuka menu `Admin`.
- [ ] Pastikan hanya admin yang bisa update order mana pun.

## 3. Keamanan

- [ ] Jangan pernah pakai `service_role key` di app mobile.
- [ ] Pastikan hanya `anon key` yang dipakai di [.env](/c:/Users/aryamundr/bengkel-app/.env).
- [ ] Pastikan RLS aktif di tabel `profiles` dan `orders`.
- [ ] Simpan hanya data yang benar-benar perlu di client.
- [ ] Jangan commit `.env` ke git.

## 4. UI dan Branding

- [ ] Pastikan logo di semua halaman sudah pas setelah reload cache.
- [ ] Ganti adaptive icon Android di [app.json](/c:/Users/aryamundr/bengkel-app/app.json) jika ingin icon launcher sama dengan branding Johan Garage.
- [ ] Cek splash screen di build release, bukan hanya di mode dev.
- [ ] Cek tampilan login, booking, history, admin, dan drawer di layar kecil Android.
- [ ] Cek teks yang terlalu panjang agar tidak overflow.

## 5. Testing Manual Minimum

### User

- [ ] Register akun baru
- [ ] Login
- [ ] Booking `Service Besar`
- [ ] Booking `Service Bulanan`
- [ ] Input keluhan
- [ ] Lihat track order
- [ ] Lihat history service
- [ ] Logout

### Admin

- [ ] Login admin
- [ ] Cari order lewat search
- [ ] Filter order berdasarkan status
- [ ] Update nomor antrian
- [ ] Update status ke `Received`
- [ ] Update status ke `In Progress`
- [ ] Update status ke `Ready`
- [ ] Update status ke `Completed`
- [ ] Isi diagnosa
- [ ] Isi tindakan perbaikan
- [ ] Isi part yang diganti
- [ ] Isi biaya servis
- [ ] Isi biaya part
- [ ] Share ringkasan servis
- [ ] Share invoice

## 6. Build dan Release

- [ ] Jalankan:

```bash
npx tsc --noEmit
```

- [ ] Jalankan:

```bash
npx expo export --platform android --output-dir .expo-export-test
```

- [ ] Siapkan build release Android, bukan hanya Expo dev server.
- [ ] Install APK/AAB release ke device nyata.
- [ ] Uji semua flow utama di build release.

## 7. Prioritas Hardening

Poin ini belum wajib untuk demo internal kecil, tapi sangat disarankan untuk production yang lebih serius:

- [ ] Tambahkan crash reporting / monitoring
- [ ] Tambahkan logging error yang lebih rapi
- [ ] Tambahkan backup strategy database
- [ ] Tambahkan audit log perubahan admin
- [ ] Tambahkan notifikasi perubahan status order
- [ ] Tambahkan export PDF invoice
- [ ] Tambahkan upload foto before/after servis
- [ ] Tambahkan dashboard statistik admin

## 8. Kondisi Saat Ini

Sudah ada:
- auth user/admin
- role admin
- booking dengan keluhan
- history service
- tracking order
- panel admin
- biaya servis dan biaya part
- share ringkasan servis
- share invoice text

Masih perlu perhatian:
- adaptive icon Android masih belum sepenuhnya branding final
- invoice masih berupa share text, belum PDF
- belum ada monitoring/crash reporting
- belum ada notifikasi status
- belum ada upload foto servis

## 9. Rekomendasi Rilis

Kalau targetmu:

- `dipakai internal bengkel / operasional awal`:
  project ini sudah cukup dekat, setelah checklist wajib dan testing manual selesai
- `rilis production publik yang lebih serius`:
  selesaikan juga bagian hardening, monitoring, dan build release final
