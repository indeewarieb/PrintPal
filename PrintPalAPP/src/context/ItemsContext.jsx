import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchItems } from '../api/items.js'

const ItemsContext = createContext(null)

// Normalize a backend row into the same shape used throughout the site
// for static catalog products ({ id, name, categories, price, ... }),
// so ProductCard/ProductMedia/ProductGallery/CategoryPage etc. don't need
// to know or care whether a product came from data.js or the API.
function normalize(row) {
  return {
    id: `item-${row.id}`,
    slug: row.slug,
    name: row.name,
    categories: [row.category],
    price: Number(row.price),
    priceMax: row.price_max != null ? Number(row.price_max) : undefined,
    image_url: row.image_url,
    hover_image_url: row.hover_image_url,
    alt_text: row.alt_text,
    description: row.description,
    tone: 'blue',
    // Backend items carry real photos, so there's no icon fallback —
    // ProductMedia/ProductGallery check for image_url first.
    icon: 'cube',
    isBackendItem: true,
  }
}

export function ItemsProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    return fetchItems().then((rows) => {
      const normalized = rows.map(normalize)
      setItems(normalized)
      setLoading(false)
      return normalized
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchItems().then((rows) => {
      if (!cancelled) {
        setItems(rows.map(normalize))
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Local mutators so admin actions update the UI immediately instead of
  // waiting on a full refetch.
  const upsertItem = useCallback((row) => {
    const normalized = normalize(row)
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === normalized.slug)
      return exists ? prev.map((i) => (i.slug === normalized.slug ? normalized : i)) : [...prev, normalized]
    })
  }, [])

  const removeItem = useCallback((slug) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug))
  }, [])

  const getItemsForCategory = useCallback(
    (categoryName) => items.filter((i) => i.categories.includes(categoryName)),
    [items]
  )

  const value = useMemo(
    () => ({ items, loading, refresh, upsertItem, removeItem, getItemsForCategory }),
    [items, loading, refresh, upsertItem, removeItem, getItemsForCategory]
  )

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
}

export function useItems() {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItems must be used within an ItemsProvider')
  return ctx
}
