# Johan Garage App

Aplikasi mobile bengkel berbasis Expo + React Native untuk user dan admin.

Project ini mendukung:
- login dan register dengan Supabase Auth
- booking servis dengan keluhan kendaraan
- tracking order dan status servis
- history service untuk user
- panel admin untuk update antrian, status, diagnosa, perbaikan, part yang diganti, dan biaya servis

## Bahasa Yang Dipakai

Project ini memakai beberapa bahasa/format:

- `TypeScript`:
  dipakai untuk hampir semua logic aplikasi React Native, screen, komponen, context auth, dan helper storage.
- `TSX`:
  dipakai untuk UI screen dan komponen React Native.
- `SQL`:
  dipakai untuk schema Supabase, policy RLS, role admin, dan setup database.
- `JSON`:
  dipakai untuk konfigurasi project seperti [app.json](/c:/Users/aryamundr/bengkel-app/app.json) dan [package.json](/c:/Users/aryamundr/bengkel-app/package.json).
- `JavaScript`:
  masih ada sedikit untuk script/utilitas lama seperti file script project dan config tertentu.

## Stack

- `Expo`
- `React Native`
- `Expo Router`
- `TypeScript`
- `Supabase Auth`
- `Supabase PostgreSQL`
- `AsyncStorage`

## Fitur Utama

### User

- Login dan register email/password
- Booking servis besar dan servis bulanan
- Input keluhan kendaraan saat booking
- Lihat status order
- Lihat history service
- Lihat kerusakan, tindakan perbaikan, part yang diganti, biaya, dan total invoice

### Admin

- Menu admin hanya muncul untuk akun dengan role `admin`
- Lihat semua order
- Cari order berdasarkan nama, telepon, motor, keluhan, atau diagnosa
- Filter order berdasarkan status
- Update nomor antrian
- Update status order
- Isi diagnosa kerusakan
- Isi tindakan perbaikan
- Isi part yang diganti
- Isi catatan admin
- Isi biaya servis dan biaya part
- Bagikan ringkasan servis
- Bagikan invoice

## Routing Screen

### Auth

- [app/(auth)/login.tsx](/c:/Users/aryamundr/bengkel-app/app/(auth)/login.tsx)
- [app/(auth)/register.tsx](/c:/Users/aryamundr/bengkel-app/app/(auth)/register.tsx)

### User / Drawer

- [app/(tabs)/index.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/index.tsx)
- [app/(tabs)/products.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/products.tsx)
- [app/(tabs)/artikel.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/artikel.tsx)
- [app/(tabs)/booking.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/booking.tsx)
- [app/(tabs)/track.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/track.tsx)
- [app/(tabs)/history.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/history.tsx)
- [app/(tabs)/about.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/about.tsx)
- [app/(tabs)/admin.tsx](/c:/Users/aryamundr/bengkel-app/app/(tabs)/admin.tsx)

## Struktur Folder Penting

```text
app/
  (auth)/              layar login/register
  (tabs)/              layar utama user/admin
  components/          komponen UI reusable
  context/             auth context
  utils/               helper supabase, storage, invoice/ringkasan
assets/images/         logo, icon, splash
constants/             tema warna Johan Garage
supabase/              schema SQL dan script admin
```

## File Penting

- [app/context/AuthProvider.tsx](/c:/Users/aryamundr/bengkel-app/app/context/AuthProvider.tsx)
  mengelola session, login, register, logout, dan role admin/user.
- [app/utils/supabase.ts](/c:/Users/aryamundr/bengkel-app/app/utils/supabase.ts)
  koneksi Supabase client.
- [app/utils/storage.ts](/c:/Users/aryamundr/bengkel-app/app/utils/storage.ts)
  helper utama baca/simpan/update order.
- [app/utils/order-summary.ts](/c:/Users/aryamundr/bengkel-app/app/utils/order-summary.ts)
  formatter invoice, total biaya, dan ringkasan servis.
- [supabase/schema.sql](/c:/Users/aryamundr/bengkel-app/supabase/schema.sql)
  schema database, profiles, orders, policy, dan trigger.
- [supabase/make-admin.sql](/c:/Users/aryamundr/bengkel-app/supabase/make-admin.sql)
  script promosi akun jadi admin.

## Setup Local

1. Install dependency:

```bash
npm install
```

2. Isi `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Jalankan app:

```bash
npm run start:clear
```

## Setup Supabase

1. Buat project di Supabase.
2. Buka SQL Editor.
3. Jalankan isi file [supabase/schema.sql](/c:/Users/aryamundr/bengkel-app/supabase/schema.sql).
4. Aktifkan login email/password di Authentication.
5. Isi `.env` dengan URL dan anon key Supabase.

## Cara Menjadikan User Admin

1. Register dulu akun admin dari aplikasi.
2. Buka [supabase/make-admin.sql](/c:/Users/aryamundr/bengkel-app/supabase/make-admin.sql).
3. Ganti email placeholder dengan email akun admin.
4. Jalankan SQL itu di Supabase.
5. Logout lalu login lagi di aplikasi.

## Model Data Order

Field penting pada order:

- `name`
- `phone`
- `bike`
- `service`
- `serviceType`
- `date`
- `slot`
- `status`
- `complaint`
- `queueNumber`
- `diagnosis`
- `repairAction`
- `replacedParts`
- `adminNotes`
- `serviceCost`
- `partsCost`
- `completedAt`

## Status Order

Status yang dipakai project:

- `Received`
- `In Progress`
- `Ready`
- `Completed`

## Perintah Berguna

```bash
npm run start
npm run start:clear
npm run android
npm run android:clear
npm run web
npx tsc --noEmit
npx expo export --platform android --output-dir .expo-export-test
```

## Catatan Penting

- Bila schema berubah, jalankan ulang [supabase/schema.sql](/c:/Users/aryamundr/bengkel-app/supabase/schema.sql).
- Jika role admin baru tidak langsung muncul, logout lalu login lagi.
- Jika perubahan UI tidak terlihat, jalankan `npm run start:clear`.
- Splash, logo, dan branding utama memakai asset di `assets/images/logo.png`.
- Checklist kesiapan rilis ada di [PRODUCTION-CHECKLIST.md](/c:/Users/aryamundr/bengkel-app/PRODUCTION-CHECKLIST.md).

## Status Project Saat Ini

Sudah tersedia:

- auth user dan admin
- booking dengan keluhan
- history service
- panel admin
- invoice summary share
- UI tema hitam-emas Johan Garage

Potensi pengembangan berikutnya:

- export PDF invoice
- upload foto before/after servis
- dashboard statistik admin
- notifikasi status order
