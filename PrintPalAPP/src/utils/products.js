import { productCatalog, slugify } from '../data.js'

// Category browsing (the /product-category pages, and their counts) now
// only ever shows items an admin actually added — no static sample data,
// no generic filler. An empty category just shows an empty state.
export function getCategoryItems(categoryName, backendItems) {
  return backendItems.filter((i) => i.categories.includes(categoryName))
}

export function getCategoryItemCount(categoryName, backendItems) {
  return getCategoryItems(categoryName, backendItems).length
}

// Product lookup still checks the static catalog too, so links from the
// home page's curated "Popular products" section (which isn't a category
// listing) keep working even though category pages no longer show it.
export function findMergedProductBySlug(slug, backendItems) {
  const backendMatch = backendItems.find((i) => slugify(i.name) === slug)
  if (backendMatch) return backendMatch
  return productCatalog.find((p) => slugify(p.name) === slug)
}

// Prev/next siblings on a product detail page — backend items in the same
// category, same as what the category grid shows. If the product being
// viewed is itself a static catalog product (reached via the home page),
// it's included too so navigation doesn't drop the page you're on.
export function getCategorySiblings(product, backendItems) {
  const base = getCategoryItems(product.categories[0], backendItems)
  return base.some((p) => p.id === product.id) ? base : [product, ...base]
}

// Related products — other admin-added items, same category first, no
// static filler.
export function getRelatedItems(product, backendItems, count = 5) {
  const pool = backendItems.filter((i) => i.id !== product.id)
  const sameCategory = pool.filter((i) =>
    i.categories.some((c) => product.categories.includes(c))
  )
  const filler = pool.filter((i) => !sameCategory.includes(i))
  return [...sameCategory, ...filler].slice(0, count)
}
