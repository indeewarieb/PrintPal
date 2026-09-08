import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useItems } from '../../context/ItemsContext.jsx'
import { deleteItem } from '../../api/items.js'
import './AdminForms.css'

export default function AdminDeleteItemPage() {
  const { items, removeItem } = useItems()
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))

  const [slug, setSlug] = useState(sorted[0]?.slug ?? '')
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const current = items.find((i) => i.slug === slug)

  const handleItemChange = (newSlug) => {
    setSlug(newSlug)
    setConfirming(false)
    setStatus('idle')
    setError('')
  }

  const handleDelete = async () => {
    if (!current) return
    setStatus('saving')
    setError('')
    try {
      await deleteItem({ slug })
      removeItem(slug)
      setStatus('done')
      setConfirming(false)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  if (sorted.length === 0) {
    return <p className="admin-form__empty">No items to delete yet.</p>
  }

  return (
    <div className="admin-form">
      <h2>Delete item</h2>
      <p className="admin-form__hint">
        Removes the item entirely — its photos, and its listing in the category's product grid.
        This can't be undone.
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
              <img src={current.image_url} alt={current.alt_text || current.name} />
            </div>
          </div>
          <div>
            <p className="admin-form__photo-label">Hover / click photo</p>
            <div className="admin-form__preview">
              <img
                src={current.hover_image_url || current.image_url}
                alt={current.alt_text || `${current.name} (hover)`}
              />
            </div>
          </div>
        </div>
      )}

      {current && (
        <p className="admin-form__meta">
          {current.categories.join(', ')} &middot; Rs {current.price?.toLocaleString()}.00
          {current.priceMax ? ` \u2013 Rs ${current.priceMax.toLocaleString()}.00` : ''}
        </p>
      )}

      {error && <p className="admin-form__error">{error}</p>}
      {status === 'done' && <p className="admin-form__success">Item deleted.</p>}

      {!confirming ? (
        <button type="button" className="admin-form__danger" onClick={() => setConfirming(true)}>
          <Trash2 size={16} strokeWidth={2} />
          Delete item
        </button>
      ) : (
        <div className="admin-form__confirm">
          <p>
            <AlertTriangle size={15} strokeWidth={2} />
            Delete &ldquo;{current?.name}&rdquo;? This can&rsquo;t be undone.
          </p>
          <div className="admin-form__confirm-actions">
            <button type="button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="admin-form__danger"
              onClick={handleDelete}
              disabled={status === 'saving'}
            >
              {status === 'saving' ? 'Deleting\u2026' : 'Confirm delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
