import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCategoryImages } from '../api/categoryImages.js'

const CategoryImagesContext = createContext({
  images: {},
  loading: true,
  refresh: () => {},
  setImage: () => {},
  removeImage: () => {},
})

export function CategoryImagesProvider({ children }) {
  const [images, setImages] = useState({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    return fetchCategoryImages().then((bySlug) => {
      setImages(bySlug)
      setLoading(false)
      return bySlug
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchCategoryImages().then((bySlug) => {
      if (!cancelled) {
        setImages(bySlug)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Local mutators so the admin screens can update the UI instantly after
  // an upload/update/delete instead of waiting on a full refetch.
  const setImage = useCallback((slug, row) => {
    setImages((prev) => ({ ...prev, [slug]: row }))
  }, [])

  const removeImage = useCallback((slug) => {
    setImages((prev) => {
      const next = { ...prev }
      delete next[slug]
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ images, loading, refresh, setImage, removeImage }),
    [images, loading, refresh, setImage, removeImage]
  )

  return <CategoryImagesContext.Provider value={value}>{children}</CategoryImagesContext.Provider>
}

// Returns { image_url, alt_text, name } for a category slug, or null if
// the backend has no image on file for it (yet).
export function useCategoryImage(slug) {
  const { images } = useContext(CategoryImagesContext)
  return images[slug] ?? null
}

export function useCategoryImagesLoading() {
  return useContext(CategoryImagesContext).loading
}

// Full context access for the admin screens (all images, refresh, mutators).
export function useCategoryImagesAdmin() {
  return useContext(CategoryImagesContext)
}
