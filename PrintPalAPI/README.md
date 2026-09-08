# PrintyPal Ceylon API

A small Node.js/Express API, backed by Supabase (Postgres), for two
things: **category header photos** (`category_images` — the
representative image on `/shop` cards and the category banner) and
**products** (`items` — actual catalog items that show up in a specific
category's product grid, added/edited/removed from the storefront's
"Admin Operations" menu).

## 1. Create the Supabase tables

1. Create a project at [supabase.com](https://supabase.com) (or use an
   existing one).
2. Open the SQL editor and run `sql/schema.sql`, then `sql/auth.sql`,
   then `sql/items.sql`, from this folder, in that order.
   - `schema.sql` creates the `category_images` table and a public
     Storage bucket (`category-images`) for category header photos.
   - `auth.sql` creates a `profiles` table (one row per signed-up user,
     with a `role` of `customer` or `admin`) and a trigger that creates
     a `customer` profile automatically whenever someone registers.
   - `items.sql` creates the `items` table (real products — name,
     category, price, price range, and two photos) and a separate
     public Storage bucket (`item-images`).
   - All three enable Row Level Security. The API talks to Supabase with
     the service_role key, which bypasses RLS entirely, so no policies
     are required for the API itself to work — RLS is just there to
     stop the public anon key from reading/writing things it shouldn't.
3. In **Authentication → Providers**, email/password sign-in is on by
   default. For local testing, you may want to turn off "Confirm email"
   under **Authentication → Settings** so new accounts can log in
   immediately without clicking an email link.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in:

- `SUPABASE_URL` — Project Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → `service_role`
  secret key. **Keep this on the server only** — never send it to the
  frontend or commit it.
- `FRONTEND_ORIGIN` — the origin(s) allowed to call this API (comma
  separated for multiple). Defaults to `http://localhost:5173`, which
  matches the Vite dev server.

## 3. Install and run

```bash
npm install
npm run dev      # auto-restarts on file changes (Node's --watch)
# or
npm start
```

The API listens on `http://localhost:4000` by default.

## 4. Seed a row per category (optional but recommended)

```bash
npm run seed
```

This inserts one row per category from `src/data/categories.js` with
`image_url` left blank, so every category already exists in the table —
you just need to add an image URL to the ones you want to show a photo
for. Existing rows are left untouched if you re-run it.

## 5. Create your first admin

There's no self-service way to become an admin. Register an account
through the frontend's `/register` page, then in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Sign out and back in on the frontend afterwards — the "Admin Operations"
menu only appears once the frontend has re-fetched a profile with
`role = 'admin'`.

If that `UPDATE` affects 0 rows, the trigger that creates a profile on
signup didn't run for that user (see Troubleshooting below) — insert the
row yourself instead:

```sql
insert into public.profiles (id, email, role)
select id, email, 'admin' from auth.users where email = 'you@example.com';
```

## Troubleshooting: "Database error saving new user"

This is Supabase's generic wrapper for "the `on_auth_user_created`
trigger threw an error while creating the signup." Causes we've seen:

- **`sql/auth.sql` was only partially run**, or run before `sql/schema.sql`
  existed the `profiles` table with the wrong columns. Re-run the whole
  `sql/auth.sql` file — every statement in it is safe to run again
  (it patches up columns/constraints rather than erroring if they
  already exist).
- **RLS blocked the insert** because the function lost its
  `security definer` (e.g. from an older version of this file). The
  current version explicitly sets `security definer` and
  `search_path = public`, and wraps the insert in an exception handler
  so a failure here logs a warning instead of blocking signup entirely.

After re-running `sql/auth.sql`, try registering again. If you want to
see the *actual* underlying error (rather than just "it's fixed now"),
check **Database → Logs → Postgres Logs** in the Supabase dashboard right
after a signup attempt — the trigger's `raise warning` line will show the
real `sqlerrm`.

## Troubleshooting: "Your session has expired. Please sign in again."

This message comes from `requireAdmin` in `src/middleware/requireAdmin.js`
whenever Supabase won't vouch for the token the frontend sent — but that
can mean three quite different things, and only one of them is actually
about your session:

1. **The API isn't configured at all.** If `SUPABASE_URL` /
   `SUPABASE_SERVICE_ROLE_KEY` are missing from `visions-api/.env`, every
   admin request now fails immediately with a clear
   `"The API is not connected to Supabase yet..."` **500** error instead
   of this message — so if you're seeing this exact wording, the API *is*
   at least configured with something.
2. **The frontend and backend point at two different Supabase
   projects.** This is the most common real cause. A token issued by
   `VITE_SUPABASE_URL` on the frontend can only be verified by an API
   whose `SUPABASE_URL` is the *same* project — if they don't match,
   every token gets rejected, forever, no matter how recently you signed
   in. Double-check `visions-app/.env`'s `VITE_SUPABASE_URL` and
   `visions-api/.env`'s `SUPABASE_URL` are the exact same project URL.
3. **Your session token actually did expire or is invalid** — the
   ordinary case this message is meant for.

To tell these apart, check the terminal running `npm run dev` for
`visions-api` right after the failed request — it now logs the real
reason (e.g. `invalid JWT`, `JWSError`, or `no user returned`) via
`console.error('[auth] Supabase rejected the token:', ...)`. A message
like `invalid JWT` or `JWSError` almost always means case 2 (mismatched
projects) rather than a genuinely expired session.

If the API can't reach Supabase at all (wrong URL, no network), you'll
get a **502** with `"Could not reach Supabase to verify your session..."`
instead of this message.

## Troubleshooting: "Could not find the 'x' column of 'category_images' in the schema cache"

This means the `category_images` table in your Supabase project is
missing a column the code expects — almost always `hover_image_url` or
`hover_storage_path`, added when the two-photos-per-category feature
was introduced. Work through these in order — each one fixes a
different reason the previous step might not have been enough:

**1. Confirm what's actually in your database.** Run this in the
Supabase SQL editor:

```sql
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'category_images'
order by column_name;
```

If `hover_image_url` / `hover_storage_path` aren't in the results, the
column genuinely doesn't exist yet — go to step 2. If they *are* there,
skip to step 3 (this is a caching problem, not a missing-column one).

**2. Re-run the whole `sql/schema.sql` file**, pasted in full, in the
SQL editor. Watch the output pane for a red error on any statement — the
editor stops at the first failing statement, so if something early in
the file errors, the `ALTER TABLE ... ADD COLUMN` lines further down
never run. Re-check with the query from step 1 afterwards.

**3. Force PostgREST to reload its schema cache.** `sql/schema.sql` ends
with this, but it's safe to run on its own too:

```sql
notify pgrst, 'reload schema';
```

Wait ~10–30 seconds, then try again — the reload isn't always instant.

**4. Still stuck? Restart the project.** This is the guaranteed fix: in
the Supabase dashboard, go to **Project Settings → General → Restart
project**. That restarts PostgREST itself, so it rebuilds its schema
cache from scratch on reconnect — there's no scenario where this doesn't
pick up the current table structure. It causes a few seconds of API
downtime, which is fine for local development.

**5. Double check you're looking at the right project.** If you have
more than one Supabase project (e.g. a personal test one and a work
one), make sure the SQL editor tab you're running these in is for the
*same* project as `SUPABASE_URL` in `visions-api/.env` — running the
migration against the wrong project will look identical to it silently
not having worked.

## Troubleshooting: "Upload failed: Bucket not found"

The Storage bucket a photo upload needs doesn't exist yet in your
Supabase project:

- Adding/updating an **item**'s photos needs the `item-images` bucket,
  created by `sql/items.sql`.
- Adding/updating a **category**'s header photo needs the
  `category-images` bucket, created by `sql/schema.sql`.

Run the relevant file in full in the Supabase SQL editor — the bucket
creation is near the bottom of each (an `insert into storage.buckets`
statement with `on conflict (id) do nothing`, so it's safe to run again).
Afterwards, check **Storage** in the Supabase dashboard sidebar and
confirm the bucket is actually listed. If you have multiple Supabase
projects, also double-check the SQL editor tab is for the same project
as `SUPABASE_URL` in `visions-api/.env` (see point 5 above).

## API reference

Reads are public. Writes (`POST`, `PUT`, `DELETE`) require an
`Authorization: Bearer <supabase-access-token>` header for a signed-in
user whose `profiles.role` is `admin` — requests without it get `401`
(not signed in) or `403` (signed in, not an admin). The frontend handles
attaching this automatically once you're logged in as an admin.

| Method | Path                          | Auth  | Description                                          |
| ------ | ----------------------------- | ----- | ----------------------------------------------------- |
| GET    | `/api/health`                  | —     | Health check                                           |
| GET    | `/api/categories`              | —     | List every category's image details                    |
| GET    | `/api/categories/:slug`        | —     | Get one category's image details                       |
| POST   | `/api/categories`              | admin | Create/replace a row from URLs (`name` required)       |
| POST   | `/api/categories/:slug/upload` | admin | Upload the default and/or hover photo (multipart)       |
| PUT    | `/api/categories/:slug`        | admin | Update `name` / `image_url` / `hover_image_url` / `alt_text` |
| DELETE | `/api/categories/:slug`        | admin | Remove a category's photos (and their files in Storage) |

Each category has **two** photos: `image_url` (shown normally) and
`hover_image_url` (shown on hover/click — this is what powers the
zoom/swap effect on the storefront). The upload endpoint accepts either
or both multipart fields — `image` for the default photo, `hover_image`
for the hover one — and only replaces whichever field(s) you send,
leaving the other untouched.

Example — upload both photos for "Mugs and Cups" (get `ACCESS_TOKEN` from
`supabase.auth.getSession()` in the browser console while logged in as
an admin, or from the frontend's network tab):

```bash
curl -X POST http://localhost:4000/api/categories/mugs-and-cups/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "name=Mugs and Cups" \
  -F "alt_text=Branded mugs" \
  -F "image=@./mug-photo.jpg" \
  -F "hover_image=@./mug-photo-hover.jpg"
```

Or upload just one of them later (e.g. replace only the hover photo):

```bash
curl -X POST http://localhost:4000/api/categories/mugs-and-cups/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "name=Mugs and Cups" \
  -F "hover_image=@./new-hover-photo.jpg"
```

Example — set images by URL instead of uploading files:

```bash
curl -X PUT http://localhost:4000/api/categories/mugs-and-cups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"image_url":"https://example.com/mugs.jpg","hover_image_url":"https://example.com/mugs-hover.jpg","alt_text":"Branded mugs"}'
```

Row shape returned by the API:

```json
{
  "id": "5b1f...",
  "slug": "mugs-and-cups",
  "name": "Mugs and Cups",
  "image_url": "https://.../category-images/mugs-and-cups/base-172....jpg",
  "storage_path": "mugs-and-cups/base-172....jpg",
  "hover_image_url": "https://.../category-images/mugs-and-cups/hover-172....jpg",
  "hover_storage_path": "mugs-and-cups/hover-172....jpg",
  "alt_text": "Branded mugs",
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z"
}
```

### Items (products)

| Method | Path                     | Auth  | Description                                              |
| ------ | ------------------------ | ----- | ---------------------------------------------------------- |
| GET    | `/api/items`               | —     | List every item, or `?category=Name` to filter to one category |
| GET    | `/api/items/:slug`         | —     | Get one item                                               |
| POST   | `/api/items/:slug/upload`  | admin | Create an item (needs both photos) or update one (either/both optional), multipart |
| PUT    | `/api/items/:slug`         | admin | Update `name` / `category` / `price` / `price_max` / `alt_text` / `description` without touching photos |
| DELETE | `/api/items/:slug`         | admin | Remove an item (and its files in Storage)                  |

An item belongs to exactly one `category` (must match a category name
used on the frontend — see `allCategoryNames` in `visions-app/src/data.js`
for the full list) and needs both a default and hover photo when first
created; updates can touch just one photo, just the details, or both.

Example — add a new item:

```bash
curl -X POST http://localhost:4000/api/items/ceramic-travel-mug/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "name=Ceramic Travel Mug" \
  -F "category=Mugs and Cups" \
  -F "price=1450" \
  -F "image=@./mug.jpg" \
  -F "hover_image=@./mug-hover.jpg"
```

Row shape returned by the API:

```json
{
  "id": "9e2c...",
  "slug": "ceramic-travel-mug",
  "name": "Ceramic Travel Mug",
  "category": "Mugs and Cups",
  "price": 1450,
  "price_max": null,
  "image_url": "https://.../item-images/ceramic-travel-mug/base-172....jpg",
  "storage_path": "ceramic-travel-mug/base-172....jpg",
  "hover_image_url": "https://.../item-images/ceramic-travel-mug/hover-172....jpg",
  "hover_storage_path": "ceramic-travel-mug/hover-172....jpg",
  "alt_text": null,
  "description": null,
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-01-01T00:00:00.000Z"
}
```

## Notes

- `sql/schema.sql` also creates a public Storage bucket named
  `category-images` that uploaded files land in. The API always talks to
  Storage with the service_role key, so no extra Storage policies are
  needed for uploads/deletes to work.
- Uploading a new file for a category that already has one replaces it
  and removes the old file from Storage; deleting a category's image
  removes both the database row and the Storage file.
- Uploads are capped at 5MB and must be an image MIME type.
- Slugs are generated the same way the frontend generates them
  (lowercase, non-alphanumeric runs collapsed to a single `-`), so a
  category's slug here always matches its URL on the frontend.
- `ADMIN_API_KEY` no longer exists — admin access is now real Supabase
  Auth (email/password) plus a `role` column, checked server-side on
  every write. See "Create your first admin" above.
- `category_images` and `items` are deliberately separate: the former
  controls a category's own representative photo (shown on `/shop` cards
  and the category page banner), the latter is the actual product
  catalog. The storefront's "Admin Operations" menu (Add/Update/Delete
  item) manages `items`; there's currently no dedicated admin screen for
  `category_images`, though the API for it still exists if you want to
  build one or set photos directly via the endpoints above.
