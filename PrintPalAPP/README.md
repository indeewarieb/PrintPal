# Visions Today — React site (React Router)

A React + Vite recreation of the Visions Today corporate-gifts site:

- **Home** — top announcement bar, header with search, nav, hero banner
  with product categories, feature strip, popular products grid with a
  browse-categories sidebar, and a testimonial card.
- **Shop mega menu** — hover/click "Shop" in the nav to see the 4-column
  category dropdown; every item links to a real category page.
- **Category pages** (`/product-category/:slug`) — breadcrumb, a
  "Categories" sidebar with product counts (Business Stationery expands
  to show its "Files and Folders" subcategory), a working "Sort by"
  dropdown (default / popularity / latest / price low↔high) and "Show"
  dropdown (28 / 48 / 76), a grid/list view toggle, and a product grid.
- **Product detail pages** (`/product/:slug`) — breadcrumb through to the
  product, an image gallery (hover to zoom, click for a full-screen
  lightbox, thumbnail strip to switch shots), prev/next arrows to browse
  the same category, price, a quantity stepper + Add to cart, a
  bullet-point spec list, share icons, a description tab, and a
  related-products grid.
- **Cart** (`/cart`) — quantity steppers, remove-item, a coupon field
  (visual only), and a totals box that leads to checkout.
- **Checkout** (`/checkout`) — contact info + billing address on the left;
  an order summary on the right with a description/amount table, a promo
  code field (try code `VISIONS10` for 10% off), and a payment method
  choice between Credit/Debit Card (adds a service fee + card type
  picker) and Direct Bank Transfer (no service fee, shows bank details
  inline). "Pay" routes card payments straight to the confirmation page;
  bank transfer goes to a dedicated confirmation page first.
- **Bank transfer confirmation** (`/bank-transfer-confirmation`) — shows
  the purchase ID as the payment reference, bank details, an order
  summary, and a drag-and-drop payment-slip upload (PDF/JPG/PNG, 5 MB
  max) before finishing on the order confirmation page.
- **Shop landing page** (`/shop`) — a directory of every category.
- **Login / Register** (`/login`, `/register`) — Supabase Auth
  (email/password). New accounts are regular customers; only accounts
  promoted to `admin` in Supabase see the header's "Admin Operations"
  menu (Add/Update/Delete category photo), backed by `visions-api`.

Every product image across the site is clickable (it opens the product
page) and shows a second "angle" with a zoom-in effect on hover. Every
product card also has an "Add to cart" button and an eye icon for a quick
view without leaving the page. The cart persists in the browser's
localStorage and its item count shows live in the header.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

Copy `.env.example` to `.env` first if you want login/register or the
category-photo admin screens to work — see the top-level README (one
folder up) for the full Supabase + `visions-api` setup.

## Troubleshooting

**"Failed to fetch" on login/register** — this is the raw browser error
for a request that never reached Supabase at all. Almost always means:

- `visions-app/.env` doesn't exist yet, or `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` are still the placeholder values from
  `.env.example` — the login page shows a yellow banner when this is the
  case.
- You added/edited `.env` while `npm run dev` was already running — Vite
  only reads `.env` on startup, so restart the dev server.
- `VITE_SUPABASE_URL` is misspelled, or the Supabase project is paused.

**Admin actions fail the same way** — same idea, but for `VITE_API_URL`
and `visions-api`: make sure that server is actually running
(`npm run dev` in `visions-api/`) and reachable at the URL you set.

## Build for production

```bash
npm run build
npm run preview
```

## Structure

- `src/App.jsx` — sets up the routes (`/`, `/shop`, `/product-category/:slug`)
  and renders the shared TopBar/Header/Footer around them
- `src/pages/` — `HomePage`, `ShopPage`, `CategoryPage`, `ProductDetailPage`,
  `CartPage`, `CheckoutPage`, `BankTransferConfirmationPage`,
  `OrderConfirmationPage`, `LoginPage`, `RegisterPage`, `AboutPage`,
  `ContactPage`, `pages/admin/*`
- `src/components/` — TopBar, Header (incl. the Shop mega menu, cart
  badge, and account/admin menu), Hero, Features, ProductsSection,
  ProductCard (image + add to cart + quick view), ProductMedia
  (clickable/zoom card image), ProductGallery (PDP image + thumbnails +
  lightbox), Lightbox (also doubles as the quick-view modal),
  SupabaseConfigNotice, Testimonials, Footer, ProductIcon
- `src/context/CartContext.jsx` — cart state (add/remove/set quantity),
  persisted to localStorage under a per-user key
  (`printypal-ceylon-cart:<user id>`, or `:guest` when signed out) so a
  signed-out visitor never sees a previous login's cart on a shared
  browser, and switching accounts doesn't leak one user's cart into
  another's
- `src/context/AuthContext.jsx` — Supabase Auth session + role
- `src/context/CategoryImagesContext.jsx` — category header photo data
  fetched from `visions-api` (`/api/categories`)
- `src/context/ItemsContext.jsx` — backend-added products fetched from
  `visions-api` (`/api/items`), normalized into the same shape as the
  static catalog
- `src/utils/products.js` — category listings (`/product-category/...`
  and `/shop` counts) show **only** admin-added items from
  `visions-api` (`/api/items`) — no static catalog data. Product detail
  pages can still resolve a static catalog product by slug if something
  old links to one directly, but its prev/next and "related products"
  only pull from other admin-added items in the same category.
- `src/lib/supabaseClient.js` — the frontend's Supabase client (public
  anon key only — never put the service_role key here)
- `src/data.js` — `CATEGORY_NAMES` is the single source of truth for
  every category on the site (currently the 40-category print-shop
  taxonomy: Business Cards, Letterheads, Banners, etc.) — edit that one
  array to add, remove, or rename categories; the nav's mega menu, the
  category sidebar, the header search dropdown, and the admin "Add item"
  category picker all derive from it automatically. `productCatalog`
  here is no longer shown anywhere on the storefront (both category
  pages and the home page's "Popular products" now pull from
  `/api/items` only) — it's kept only as a fallback for resolving old
  direct links to a static product's slug.
- `src/index.css` — design tokens (colors, fonts) and global resets

A category with no admin-added items yet shows an empty state ("No
items in this category yet.") rather than falling back to sample data —
add one via the storefront's Admin Operations → Add item to see it
appear in that category's grid immediately. The home page's "Popular
products" section works the same way: it lists every admin-added item
(not filtered by category) and shows its own empty state until at least
one exists.

`ContactPage`'s form isn't wired to a real backend yet — submitting it
just shows a confirmation message in the UI. Hook it up to an email
service or a new `visions-api` endpoint when you're ready to actually
receive messages.
