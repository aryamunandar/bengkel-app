Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run the SQL from `supabase/schema.sql`.
3. Copy `.env.example` to `.env` and fill in:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Start the app:

```bash
npx expo start
```

Notes

- Auth now uses Supabase Auth with email/password.
- Orders are stored in the `public.orders` table.
- Local AsyncStorage orders are migrated to Supabase automatically after login.
- The unique indexes in `supabase/schema.sql` protect booking slots at the database level.
