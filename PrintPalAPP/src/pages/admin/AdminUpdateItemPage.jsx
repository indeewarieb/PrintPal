import { useEffect, useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { allCategoryNames } from '../../data.js'
import { useItems } from '../../context/ItemsContext.jsx'
import { uploadItem, updateItemDetails } from '../../api/items.js'
import './AdminForms.css'

function useObjectUrl(file) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!file) {
      setUrl(null)
      return undefined
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return url
}

export default function AdminUpdateItemPage() {
  const { items, upsertItem } = useItems()
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))

  const [slug, setSlug] = useState(sorted[0]?.slug ?? '')
  const current = items.find((i) => i.slug === slug)

  const [name, setName] = useState(current?.name ?? '')
  const [category, setCategory] = useState(current?.categories?.[0] ?? allCategoryNames[0])
  const [price, setPrice] = useState(current?.price ?? '')
  const [priceMax, setPriceMax] = useState(current?.priceMax ?? '')
  const [description, setDescription] = useState(current?.description ?? '')
  const [altText, setAltText] = useState(current?.alt_text ?? '')
  const [file, setFile] = useState(null)
  const [hoverFile, setHoverFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const filePreview = useObjectUrl(file)
  const hoverPreview = useObjectUrl(hoverFile)

  const handleItemChange = (newSlug) => {
    const item = items.find((i) => i.slug === newSlug)
    setSlug(newSlug)
    setName(item?.name ?? '')
    setCategory(item?.categories?.[0] ?? allCategoryNames[0])
    setPrice(item?.price ?? '')
    setPriceMax(item?.priceMax ?? '')
    setDescription(item?.description ?? '')
    setAltText(item?.alt_text ?? '')
    setFile(null)
    setHoverFile(null)
    setStatus('idle')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!current) return
    setStatus('saving')
    setError('')
    try {
      const row =
        file || hoverFile
          ? await uploadItem({ slug, name, category, price, priceMax, altText, description, file, hoverFile })
          : await updateItemDetails({ slug, name, category, price, priceMax, altText, description })
      upsertItem(row)
      setStatus('done')
      setFile(null)
      setHoverFile(null)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  if (sorted.length === 0) {
    return <p className="admin-form__empty">No items yet — add one first.</p>
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>Update item</h2>
      <p className="admin-form__hint">
        Edit an existing item's details, move it to a different category, and/or replace either
        photo — leave a file input empty to keep what's already there.
      </p>

      <label>
        Item
        <select value={slug} onChange={(e) => handleItemChange(e.target.value)}>
          {sorted.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      {current && (
        <div className="admin-form__photo-grid">
          <div>
            <p className="admin-form__photo-label">Default photo</p>
            <div className="admin-form__preview">
              <img src={filePreview ?? current.image_url} alt={altText || current.name} />
            </div>
          </div>
          <div>
            <p className="admin-form__photo-label">Hover / click photo</p>
            <div className="admin-form__preview">
              <img
                src={hoverPreview ?? current.hover_image_url ?? current.image_url}
                alt={altText || `${current.name} (hover)`}
              />
            </div>
          </div>
        </div>
      )}

      <label>
        Item name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {allCategoryNames.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-form__photo-grid">
        <label>
          Price (Rs)
          <input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        <label>
          Price up to (optional)
          <input
            type="number"
            min="0"
            step="1"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="For a price range"
          />
        </label>
      </div>

      <label>
        Description
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the item — materials, customization options, sizing, etc. Shown on the product page."
        />
      </label>

      <label>
        Alt text
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Short description of the image"
        />
      </label>

      <div className="admin-form__photo-grid">
        <label className="admin-form__file">
          Replace default photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="admin-form__file">
          Replace hover photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setHoverFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {error && <p className="admin-form__error">{error}</p>}
      {status === 'done' && (
        <p className="admin-form__success">
          <CheckCircle2 size={15} strokeWidth={2} />
          Changes saved.
        </p>
      )}

      <button type="submit" disabled={status === 'saving'}>
        <Save size={16} strokeWidth={2} />
        {status === 'saving' ? 'Saving\u2026' : 'Update item'}
      </button>
    </form>
  )
}
