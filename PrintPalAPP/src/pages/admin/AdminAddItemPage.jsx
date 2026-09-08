import { useState } from 'react'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
import { allCategoryNames, slugify } from '../../data.js'
import { useItems } from '../../context/ItemsContext.jsx'
import { uploadItem } from '../../api/items.js'
import './AdminForms.css'

export default function AdminAddItemPage() {
  const { upsertItem } = useItems()

  const [name, setName] = useState('')
  const [category, setCategory] = useState(allCategoryNames[0])
  const [price, setPrice] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [description, setDescription] = useState('')
  const [altText, setAltText] = useState('')
  const [file, setFile] = useState(null)
  const [hoverFile, setHoverFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | saving | done
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Give the item a name.')
      return
    }
    if (!price || Number.isNaN(Number(price))) {
      setError('Enter a valid price.')
      return
    }
    if (!file || !hoverFile) {
      setError('Choose both the default photo and the hover photo.')
      return
    }
    setStatus('saving')
    setError('')
    try {
      const slug = slugify(name)
      const row = await uploadItem({
        slug,
        name,
        category,
        price,
        priceMax: priceMax || undefined,
        altText,
        description,
        file,
        hoverFile,
      })
      upsertItem(row)
      setStatus('done')
      setName('')
      setPrice('')
      setPriceMax('')
      setDescription('')
      setAltText('')
      setFile(null)
      setHoverFile(null)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>Add item</h2>
      <p className="admin-form__hint">
        Creates a new product and adds it to the chosen category's product list. Each item needs
        two photos: the default one shown normally, and the one shown on hover/click.
      </p>

      <label>
        Item name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ceramic Travel Mug"
          required
        />
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
            placeholder="e.g. 1250"
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
        Alt text (optional)
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Short description of the image"
        />
      </label>

      <div className="admin-form__photo-grid">
        <label className="admin-form__file">
          Default photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label className="admin-form__file">
          Hover / click photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setHoverFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {(file || hoverFile) && (
        <p className="admin-form__filename">
          {file ? file.name : 'No default photo chosen'} &middot;{' '}
          {hoverFile ? hoverFile.name : 'No hover photo chosen'}
        </p>
      )}

      {error && <p className="admin-form__error">{error}</p>}
      {status === 'done' && (
        <p className="admin-form__success">
          <CheckCircle2 size={15} strokeWidth={2} />
          Item added to the category.
        </p>
      )}

      <button type="submit" disabled={status === 'saving'}>
        <UploadCloud size={16} strokeWidth={2} />
        {status === 'saving' ? 'Adding\u2026' : 'Add item'}
      </button>
    </form>
  )
}
