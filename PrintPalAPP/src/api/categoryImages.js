import { API_BASE, parseJsonOrThrow, withFriendlyNetworkError, getFreshAccessToken } from './shared.js'

// Every read call here fails soft: if the backend isn't running (or
// Supabase isn't configured yet), the site should still work with the
// existing icon placeholders rather than breaking the page.

export async function fetchCategoryImages() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`)
    if (!res.ok) throw new Error(`Request failed with ${res.status}`)
    const rows = await res.json()
    const bySlug = {}
    for (const row of rows) {
      if (row.image_url) bySlug[row.slug] = row
    }
    return bySlug
  } catch (err) {
    console.warn('[category images] falling back to placeholders:', err.message)
    return {}
  }
}

// The functions below are the admin write operations. Unlike the read
// above, these intentionally throw on failure — the admin screens need
// to know when something went wrong so they can show it.

export async function uploadCategoryImage({ slug, name, altText, file, hoverFile }) {
  return withFriendlyNetworkError(async () => {
    const token = await getFreshAccessToken()
    const formData = new FormData()
    formData.append('name', name)
    if (altText) formData.append('alt_text', altText)
    if (file) formData.append('image', file)
    if (hoverFile) formData.append('hover_image', hoverFile)

    const res = await fetch(`${API_BASE}/api/categories/${slug}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    return parseJsonOrThrow(res)
  })
}

export async function updateCategoryImageDetails({ slug, altText }) {
  return withFriendlyNetworkError(async () => {
    const token = await getFreshAccessToken()
    const res = await fetch(`${API_BASE}/api/categories/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ alt_text: altText }),
    })
    return parseJsonOrThrow(res)
  })
}

export async function deleteCategoryImage({ slug }) {
  return withFriendlyNetworkError(async () => {
    const token = await getFreshAccessToken()
    const res = await fetch(`${API_BASE}/api/categories/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 204) return true
    return parseJsonOrThrow(res)
  })
}
