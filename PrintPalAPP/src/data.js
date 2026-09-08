export const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Single source of truth for every category on the site. Edit this list
// to add, remove, or rename categories — everything below (the sidebar,
// the Shop mega menu, the search dropdown, and the admin "Add item"
// category picker) is derived from it.
export const CATEGORY_NAMES = [
  'Business Cards',
  'Letterheads',
  'Brochures',
  'Customized Note Books',
  'Printed Envelopes',
  'Paper Bags',
  'Booklets',
  'Bookmark',
  'Labels',
  'Menus',
  'Gift Boxes',
  'Dockets',
  'Certificates',
  'Voucher Books',
  'Ticket Books',
  'Wedding Cards',
  'Company Profiles',
  'Birthday Cards',
  'Greeting Cards',
  'Pullup Stands',
  'X Stand',
  'Banners',
  'A Stands',
  'L Stands',
  'Hoardings',
  'Backdrops for Events',
  'Vehicle Branding',
  'Stalls',
  'Office & Showroom Branding',
  'PVC Company ID Cards and Events ID',
  'Printed Lanyard',
  'Coasters',
  'Key Tags',
  'Mug Print',
  'T-Shirt Print',
  'Bottle Print',
  'Box Frame',
  'Photo Glass Frame',
  'Name Badges',
  'Pin on Badges',
]

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Top nav links. "Shop" is rendered with the mega menu (see shopMenu below).
// "Fast Print" and "Large Print" are branded shortcuts to specific
// categories rather than literal category names.
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop', hasDropdown: true },
  { label: 'Fast Print', href: `/product-category/${slugify('Business Cards')}` },
  { label: 'Services', href: `/product-category/${slugify('Services')}` },
  { label: 'Large Print', href: `/product-category/${slugify('Banners')}` },
  { label: 'Raw Materials', href: `/product-category/${slugify('Raw Materials')}` },
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact Us', href: '/contact-us' },
]

// The 4-column "Shop" mega menu — the full category list split evenly.
export const shopMenu = chunk(CATEGORY_NAMES, Math.ceil(CATEGORY_NAMES.length / 4))

// Left-hand "Categories" sidebar shown on every category page.
export const allCategories = CATEGORY_NAMES.map((name) => ({ name, count: 0 }))

// The header's "All Categories" search dropdown — same list.
export const searchCategories = CATEGORY_NAMES.map((name) => ({ name, count: 0 }))

// Compact "Product categories" panel on the home page hero.
export const productCategories = [
  'Business Cards',
  'Brochures',
  'Customized Note Books',
  'Gift Boxes',
  'Banners',
  'Vehicle Branding',
  'Key Tags',
  'Mug Print',
]

// "Browse categories" panel next to Popular Products on the home page.
export const browseCategories = [
  'Letterheads',
  'Printed Envelopes',
  'Paper Bags',
  'Wedding Cards',
  'Greeting Cards',
  'Pullup Stands',
  'X Stand',
  'Coasters',
  'T-Shirt Print',
  'Name Badges',
]

export const features = [
  {
    icon: 'gift',
    title: 'Free concept and designing',
    body: 'We always ready to give you the best gift idea',
  },
  {
    icon: 'store',
    title: 'Visit and see previous work',
    body: 'You can visit our showroom anytime',
  },
  {
    icon: 'headset',
    title: 'Online support 24/7',
    body: 'We help you to select the best corporate gift',
  },
]

// Popular products shown on the home page.
export const products = [
  { id: 1, name: 'Spoon Mug Printing', categories: ['Mugs and Cups'], price: 920, tone: 'coral', icon: 'coffee' },
  { id: 2, name: 'Fabric Labels', categories: ['Tags and Labels'], price: 19, tone: 'teal', icon: 'tag' },
  { id: 3, name: 'Thermos Flasks', categories: ['Bottles and Flask'], price: 2430, tone: 'blue', icon: 'flask' },
  { id: 4, name: 'Wooden Wall Clocks', categories: ['ECO Friendly Gifts'], price: 1270, tone: 'gold', icon: 'clock' },
  { id: 5, name: 'Plates', categories: ['Mugs and Cups'], price: 1250, tone: 'coral', icon: 'plate' },
  { id: 6, name: 'Kraft Memo Cubes', categories: ['ECO Friendly Gifts'], price: 1360, tone: 'green', icon: 'cube' },
  { id: 7, name: 'Metal Card Holders', categories: ['Business Stationery'], price: 840, tone: 'blue', icon: 'card' },
  { id: 8, name: 'Kraft Notebooks', categories: ['Notebook and Diary'], price: 590, tone: 'gold', icon: 'notebook' },
]

// Extra catalog entries so most category pages have believable, on-brand
// products even though we don't have the real product photography.
export const catalogExtras = [
  { id: 101, name: 'Gold Rim Mug Printing', categories: ['Mugs and Cups'], price: 980, tone: 'gold', icon: 'coffee' },
  { id: 102, name: 'Backdrops', categories: ['Event Promotions', 'Flags and Banners'], price: 6666, tone: 'blue', icon: 'flag' },
  { id: 103, name: 'Tie Pins', categories: ['Lapels and Name Badges'], price: 1040, tone: 'gold', icon: 'pin' },
  { id: 104, name: 'Glass Bottles with Pouch', categories: ['Bottles and Flask'], price: 1165, priceMax: 1980, tone: 'teal', icon: 'flask' },
  { id: 105, name: 'ATM Card Pouches', categories: ['Business Stationery', 'PVC ID and Lanyards'], price: 36, tone: 'gray', icon: 'card' },
  { id: 106, name: 'Hardcover Notebooks', categories: ['Business Stationery', 'Notebook and Diary'], price: 980, tone: 'gold', icon: 'notebook' },
  { id: 107, name: 'Bill Folders', categories: ['Business Stationery', 'Files and Folders'], price: 1890, tone: 'gray', icon: 'card' },
  { id: 108, name: 'Booklet Printing', categories: ['Business Stationery', 'Services'], price: 1450, tone: 'coral', icon: 'notebook' },
  { id: 109, name: 'Lanyards', categories: ['PVC ID and Lanyards'], price: 210, tone: 'blue', icon: 'tag' },
  { id: 110, name: 'Trophy Awards', categories: ['Awards'], price: 3200, tone: 'gold', icon: 'clock' },
  { id: 111, name: 'Umbrella Printing', categories: ['Promotional Umbrella'], price: 2150, tone: 'blue', icon: 'flag' },
  { id: 112, name: 'Kids Colouring Sets', categories: ['Gifts for Kids'], price: 480, tone: 'green', icon: 'cube' },
  { id: 113, name: 'Enamel Pin Badges', categories: ['Pin Badges'], price: 260, tone: 'coral', icon: 'pin' },
  { id: 114, name: 'Kraft Packaging Boxes', categories: ['Packaging'], price: 320, tone: 'gray', icon: 'cube' },
  { id: 115, name: 'Cotton Tote Bags', categories: ['Bags and Pouches'], price: 610, tone: 'green', icon: 'cube' },
  { id: 116, name: 'Branded Polo Shirts', categories: ['Clothing'], price: 1750, tone: 'blue', icon: 'card' },
  { id: 117, name: 'USB Flash Drives', categories: ['Electronic Gifts'], price: 890, tone: 'blue', icon: 'clock' },
  { id: 118, name: 'Coaster Sets', categories: ['Coasters'], price: 540, tone: 'teal', icon: 'plate' },
  { id: 119, name: 'Table Flags', categories: ['Flags and Banners'], price: 720, tone: 'gray', icon: 'flag' },
  { id: 120, name: 'Corporate Gift Hampers', categories: ['Corporate Branding', 'Giveaways'], price: 2900, tone: 'coral', icon: 'cube' },
]

export const productCatalog = [...products, ...catalogExtras]

export function getProductsForCategory(categoryName) {
  const matches = productCatalog.filter((p) => p.categories.includes(categoryName))
  if (matches.length > 0) return matches
  // Fall back to a small believable set so every category page has content.
  return productCatalog.slice(0, 4).map((p, i) => ({
    ...p,
    id: `${categoryName}-fallback-${i}`,
    categories: [categoryName],
  }))
}

export function findProductBySlug(slug) {
  return productCatalog.find((p) => slugify(p.name) === slug)
}

// The sidebar/shop-page counts should always match what getProductsForCategory
// actually renders for that category (including its fallback filler), so we
// derive the displayed count from the same function rather than a hand-typed number.
export function getCategoryCount(categoryName) {
  return getProductsForCategory(categoryName).length
}

// Flattened, deduplicated list of every category name (parents + children)
// the admin screens let you pick from.
export const allCategoryNames = Array.from(
  new Set(
    allCategories.flatMap((cat) => [cat.name, ...(cat.children?.map((c) => c.name) ?? [])])
  )
).sort((a, b) => a.localeCompare(b))

export function getRelatedProducts(product, count = 5) {
  const sameCategory = productCatalog.filter(
    (p) => p.id !== product.id && p.categories.some((c) => product.categories.includes(c))
  )
  const filler = productCatalog.filter(
    (p) => p.id !== product.id && !sameCategory.includes(p)
  )
  return [...sameCategory, ...filler].slice(0, count)
}

export function generateProductDetails(product) {
  const catLabel = product.categories.join(' and ').toLowerCase()
  return {
    tagline: `Customized ${product.name} with branding.`,
    bullets: [
      'MOQ \u2013 5 PCS. But prices depend on the order quantity',
      'Standard production duration \u2013 3-4 weeks (fast prints can be arranged for special rates)',
      'Printing method \u2013 screen print, embroidery, or direct digital print',
      'Packing \u2013 bulk packing, white box',
      'Price shown is for the standard order quantity \u2013 contact us for other pricing options',
    ],
    description: `PrintyPal Ceylon offers customized ${product.name.toLowerCase()} with branding in Colombo, Sri Lanka. We manufacture ${catLabel} to your branding requirement for corporate gifting. ${product.name} make a useful addition to any welcome pack, event, or giveaway. You're welcome to suggest your own design, size, or colour.`,
  }
}

// Placeholder bank details — replace with your real account information.
export const BANK_DETAILS = {
  accountName: 'PrintyPal Ceylon (Pvt) Ltd',
  accountNumber: '117514022723',
  bank: 'Commercial Bank of Ceylon PLC',
  branch: 'Kurunegala Branch',
}

export const testimonials = [
  {
    name: 'Nikitha Fernandas',
    role: 'Director - Live Entertainments',
    quote:
      'I am so grateful that I have discovered this business. Their prices are reasonable and the service is excellent.',
  },
  {
    name: 'Ruwan Perera',
    role: 'Marketing Manager - Ceylon Traders',
    quote:
      'From concept to delivery, the whole process was smooth. Our branded gifts arrived exactly as promised.',
  },
  {
    name: 'Aisha Mohamed',
    role: 'HR Lead - Horizon Group',
    quote:
      'Great turnaround time and the team was flexible with our last minute changes for the annual event.',
  },
]
