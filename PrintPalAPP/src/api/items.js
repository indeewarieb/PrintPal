import { API_BASE, parseJsonOrThrow, withFriendlyNetworkError, getFreshAccessToken } from './shared.js'

// Fails soft, same reasoning as fetchCategoryImages: if the backend
// isn't reachable yet, the site still works off the static catalog.
export async function fetchItems() {
  try {
    const res = await fetch(`${API_BASE}/api/items`)
    if (!res.ok) throw new Error(`Request failed with ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('[items] falling back to the static catalog only:', err.message)
    return []
  }
}

// Admin write operations — throw on failure so the admin screens can
// show what went wrong.

export async function uploadItem({
  slug,
  name,
  category,
  price,
  priceMax,
  altText,
  description,
  file,
  hoverFile,
}) {
  return withFriendlyNetworkError(async () => {
    const token = await getFreshAccessToken()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('category', category)
    formData.append('price', String(price))
    if (priceMax !== undefined && priceMax !== null && priceMax !== '') {
      formData.append('price_max', String(priceMax))
    }
    if (altText) formData.append('alt_text', altText)
    if (description !== undefined) formData.append('description', description)
    if (file) formData.append('image', file)
    if (hoverFile) formData.append('hover_image', hoverFile)

    const res = await fetch(`${API_BASE}/api/items/${slug}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    return parseJsonOrThrow(res)
  })
}

export async function updateItemDetails({ slug, name, category, price, priceMax, altText, description }) {
  return withFriendlyNetworkError(async () => {
    const token = await getFreshAccessToken()
    const body = {}
    if (name !== undefined) body.name = name
    if (category !== undefined) body.category = category
    if (price !== undefined) body.price = price
    if (priceMax !== undefined) body.price_max = priceMax === '' ? null : priceMax
    if (altText !== undefined) body.alt_text = altText
    if (description !== undefined) body.description = description

    const res = await fetch(`${API_BASE}/api/items/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    return parseJsonOrThrow(res)
  })
}

export async function deleteItem({ slug }) {
  return withFriendlyNetworkError(async () => {
    const token = await getFreshAccessToken()
    const res = await fetch(`${API_BASE}/api/items/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 204) return true
    return parseJsonOrThrow(res)
  })
}
