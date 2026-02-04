# Tour Booking System

Bilingual (TH/EN) tour booking UI with Firebase Firestore for bookings and Supabase Storage for tour images. Includes a simple `/admin` view for the team to review bookings.

## Features
- Booking form with date/time, party size, duration, tour type, location, add-ons
- Live price summary with breakdown
- Firestore persistence to `bookings` collection
- Supabase public bucket images (`tour-images`)
- Admin page with simple password gate, search, and date filter

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` (see `.env.example`).

3. Run dev server:
```bash
npm run dev
```

Open `http://localhost:3000` for the booking page and `http://localhost:3000/admin` for the admin view.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- Firebase client SDK:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`

- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- Admin:
  - `NEXT_PUBLIC_ADMIN_PASSWORD`

## Notes

- Firestore rules should allow create/read for demo usage.
- Supabase Storage bucket should be public and named `tour-images`.
- Image paths are defined in `lib/catalog.ts` and can be edited.
- The admin password gate is client‑side only (demo-grade).
