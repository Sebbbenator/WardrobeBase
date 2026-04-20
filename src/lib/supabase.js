import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Visible in the browser console on misconfiguration.
  console.error(
    'Supabase env vars missing. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(url ?? '', anon ?? '');

// Fixed id for the single user_photo row (no auth, single-user app).
export const USER_PHOTO_ID = '00000000-0000-0000-0000-000000000001';

export const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];
