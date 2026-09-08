import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Check } from 'lucide-react'
import { slugify } from '../data.js'
import { useCart } from '../context/CartContext.jsx'
import ProductMedia from './ProductMedia.jsx'
import './ProductCard.css'

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product, 1)
    setAdded(true)
    window.clearTimeout(handleAdd._t)
    handleAdd._t = window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className={`product-card tone-${product.tone}`}>
      <ProductMedia product={product} />
      <p className="product-card__category">{product.categories.join(', ')}</p>
      <Link to={`/product/${slugify(product.name)}`} className="product-card__name">
        {product.name}
      </Link>
      <p className="product-card__price">
        Rs {product.price.toLocaleString()}.00
        {product.priceMax ? ` \u2013 Rs ${product.priceMax.toLocaleString()}.00` : ''}
      </p>

      <div className="product-card__actions">
        <button type="button" className={`product-card__add ${added ? 'is-added' : ''}`} onClick={handleAdd}>
          {added ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              Added
            </>
          ) : (
            'Add to cart'
          )}
        </button>
        {onQuickView && (
          <button
            type="button"
            className="product-card__quick"
            aria-label={`Quick view ${product.name}`}
            onClick={() => onQuickView(product)}
          >
            <Eye size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </article>
  )
}
