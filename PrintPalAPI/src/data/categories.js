// Mirrors the category names used across the frontend (src/data.js) so the
// `category_images` table has a starting row for every category the site
// can navigate to. Keep this in sync if you add/rename categories on the
// frontend — or just add new rows straight in Supabase, the API doesn't
// require a row to exist here for a slug to be created later.

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const CATEGORY_NAMES = [
  'Awards',
  'Bags and Pouches',
  'Bottles and Flask',
  'Business Stationery',
  'Files and Folders',
  'Clothing',
  'Coasters',
  'Corporate Branding',
  'ECO Friendly Gifts',
  'Wooden Gift',
  'Electronic Gifts',
  'Event Promotions',
  'Gifts for Kids',
  'Giveaways',
  'Key Tag Printing',
  'Lapels and Name Badges',
  'Mugs and Cups',
  'Travel Mugs',
  'Notebook and Diary',
  'Packaging',
  'Pens and Pencils',
  'Pin Badges',
  'Promotional Umbrella',
  'PVC ID and Lanyards',
  'Tags and Labels',
  'Paper Bags',
  'Non Woven Bags',
  'Name Signs',
  'Flags and Banners',
]
