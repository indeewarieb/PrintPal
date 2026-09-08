import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Check } from 'lucide-react'
import { slugify } from '../data.js'
import { useCart } from '../context/CartContext.jsx'
import ProductIcon from './ProductIcon.jsx'
import './Lightbox.css'

export default function Lightbox({ product, onClose, showActions = true }) {
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [product, onClose])

  if (!product) return null

  const handleAdd = () => {
    addToCart(product, qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div className="lightbox" onClick={onClose}>
      <div
        className={`lightbox__panel tone-${product.tone}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} zoomed image`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lightbox__close" aria-label="Close" onClick={onClose}>
          <X size={20} strokeWidth={2} />
        </button>

        <div className="lightbox__image">
          {product.image_url ? (
            <img
              src={product.hover_image_url || product.image_url}
              alt={product.alt_text || product.name}
            />
          ) : (
            <ProductIcon name={product.icon} alt size={96} strokeWidth={1} />
          )}
        </div>

        <div className="lightbox__info">
          <p className="lightbox__category">{product.categories.join(', ')}</p>
          <h3>{product.name}</h3>
          <p className="lightbox__price">
            Rs {product.price.toLocaleString()}.00
            {product.priceMax ? ` \u2013 Rs ${product.priceMax.toLocaleString()}.00` : ''}
          </p>

          {showActions && (
            <>
              <div className="lightbox__row">
                <div className="lightbox__stepper">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus size={14} />
                  </button>
                  <span>{qty}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <button type="button" className={`lightbox__add ${added ? 'is-added' : ''}`} onClick={handleAdd}>
                  {added ? (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      Added
                    </>
                  ) : (
                    'Add to cart'
                  )}
                </button>
              </div>

              <Link to={`/product/${slugify(product.name)}`} className="lightbox__link" onClick={onClose}>
                View full details
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
