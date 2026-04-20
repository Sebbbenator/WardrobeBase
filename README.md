# WardrobeBase

A single-user digital wardrobe and AI outfit planner. Upload photos of your clothes, track what you've worn recently, and use Replicate's IDM-VTON model to try outfits onto a photo of yourself.

- **Frontend:** React 18 + Vite + Tailwind CSS + react-dropzone
- **Backend:** Supabase (Postgres + Storage)
- **AI try-on:** [cuuupid/idm-vton](https://replicate.com/cuuupid/idm-vton) via the Replicate API

No authentication — this is a personal, single-user app.

---

## 1. Install

```bash
cd MyWardrobeBase
npm install
```

## 2. Create a Supabase project

In [supabase.com](https://supabase.com) create a new project, then from the project dashboard:

### 2a. Database tables

Open the **SQL editor** and run:

```sql
create table clothing_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Tops','Bottoms','Shoes','Outerwear','Accessories')),
  image_url text not null,
  last_worn date,
  created_at timestamptz not null default now()
);

create table outfits (
  id uuid primary key default gen_random_uuid(),
  result_image_url text not null,
  item_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table user_photo (
  id uuid primary key,
  image_url text not null
);
```

Since there's no auth, the simplest option is to **disable Row Level Security** on these three tables (Auth → Policies, or in the SQL editor):

```sql
alter table clothing_items disable row level security;
alter table outfits        disable row level security;
alter table user_photo     disable row level security;
```

> This app is intended to run locally for a single person. Do NOT deploy it as-is to a public host without adding auth + RLS policies — the anon key shipped to the browser would grant anyone full access.

### 2b. Storage buckets

Go to **Storage** and create two buckets, both **Public**:

- `clothing`
- `outfits`

The `outfits` bucket also stores your single user photo at `user/photo.jpg`.

### 2c. Credentials

Copy `.env.example` to `.env` and fill in the values from **Project Settings → API**:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon/public key>
```

Restart `npm run dev` after editing `.env`.

## 3. Replicate API key

1. Create an API token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) (starts with `r8_`).
2. Run the app, go to **Settings**, and paste the key. It's stored only in your browser's `localStorage`.
3. Make sure your Replicate account has billing set up — IDM-VTON runs on a paid GPU (usually cents per generation).

## 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## 5. Use it on your phone

The app is mobile-first and installable as a PWA (adds to your home screen, opens full-screen without the browser chrome).

1. On your **computer**, start the dev server with `npm run dev -- --host`. Vite will print a `Network:` URL like `http://192.168.x.x:5173`.
2. Put your phone on the **same Wi-Fi** network and open that URL in **Safari (iOS)** or **Chrome (Android)**.
3. **Install to home screen:**
   - **iPhone / Safari:** tap the Share button → **Add to Home Screen** → Add.
   - **Android / Chrome:** tap the ⋮ menu → **Install app** (or **Add to Home screen**).
4. Open the icon from your home screen — it runs full-screen with safe-area support and bottom navigation.

> The Replicate dev proxy lives in Vite, so the phone must point at your laptop's dev server. For a true "anywhere" deploy you'd need to host the app behind your own proxy (e.g. a Vercel serverless function) — that's out of scope for this single-user setup.

---

## How it works

- **Wardrobe**: upload a photo per clothing item, pick a category, set a "last worn" date. Inline controls let you mark items as worn today or delete them.
- **Outfit Builder**: upload a full-body photo of yourself once (stored at `outfits/user/photo.jpg`). Then pick one top + bottoms (and optionally shoes) and click **Try On**. The app calls Replicate's `cuuupid/idm-vton` **twice** — once for the top (`upper_body`), then again with that result as the human image and the bottoms (`lower_body`). The final image is copied into your `outfits` bucket so it doesn't expire.
- **Save outfit**: stores a row in `outfits` with the permanent image URL and the list of item ids you picked (shoes included even though they aren't composited).
- **My Outfits**: grid of saved looks. Delete removes both the DB row and the storage file.
- **Not Worn Recently**: items with `last_worn` older than 30 days or never set.

### Replicate and CORS

Replicate's API doesn't allow direct browser requests. `vite.config.js` sets up a **dev proxy**:

```
/api/replicate/* → https://api.replicate.com/*
```

The browser calls `/api/replicate/v1/predictions` with your API key in the `Authorization` header, and Vite forwards it. This works in `npm run dev` but **not** in a plain static production build — to deploy you'd need to replicate this proxy (e.g. a Vercel serverless function or a tiny Express server).

### IDM-VTON limitations

- One garment per call. The app chains two calls (top, then bottom).
- No shoes/accessories support. Shoes you pick are remembered in the saved outfit but don't show up in the generated image.
- Works best with a clear, front-facing full-body photo on a simple background.
- The pinned model version is in `src/lib/replicate.js`. Bump `IDM_VTON_VERSION` to update.

---

## Project structure

```
MyWardrobeBase/
├── index.html                   # PWA meta + fonts
├── package.json
├── vite.config.js               # Dev proxy to api.replicate.com
├── tailwind.config.js           # Cream/ink/sage tokens + Instrument Serif
├── postcss.config.js
├── .env.example
├── public/
│   ├── manifest.webmanifest     # PWA manifest (home-screen install)
│   ├── icon.svg
│   └── icon-maskable.svg
└── src/
    ├── main.jsx                 # Router
    ├── App.jsx                  # Mobile-width layout + <Outlet/> + bottom nav
    ├── index.css                # Tailwind + shared component classes + safe-area
    ├── lib/
    │   ├── supabase.js
    │   ├── storage.js
    │   └── replicate.js
    ├── components/
    │   ├── BottomNav.jsx        # Pill bottom navigation
    │   ├── TopBar.jsx           # Sticky serif header with settings icon
    │   ├── Icon.jsx             # Inline SVG icon set
    │   ├── UploadDropzone.jsx
    │   ├── AddItemSheet.jsx     # Bottom-sheet for adding a piece
    │   ├── ClothingCard.jsx
    │   ├── OutfitCard.jsx
    │   ├── CategorySelect.jsx
    │   ├── LoadingSpinner.jsx
    │   └── ErrorBanner.jsx
    └── pages/
        ├── Wardrobe.jsx
        ├── OutfitBuilder.jsx
        ├── MyOutfits.jsx
        ├── NotWornRecently.jsx
        └── Settings.jsx
```

## Design

Editorial, boutique feel — warm cream (`#F5F1EB`) background, charcoal ink for primary actions, sage and terracotta accents, [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) for display headings and [Inter](https://fonts.google.com/specimen/Inter) for UI. Image-first cards with big rounded corners, floating bottom nav, bottom-sheet forms. Safe-area insets are respected so the nav sits above the iPhone home indicator.
