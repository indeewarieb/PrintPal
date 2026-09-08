import { Link } from 'react-router-dom'
import { Heart, ZoomIn } from 'lucide-react'
import { slugify } from '../data.js'
import ProductIcon from './ProductIcon.jsx'
import './ProductMedia.css'

export default function ProductMedia({ product }) {
  return (
    <Link
      to={`/product/${slugify(product.name)}`}
      className="product-media"
      aria-label={`View ${product.name}`}
    >
      <span className="product-media__badge">Hot</span>
      <span
        role="button"
        tabIndex={0}
        className="product-media__wishlist"
        aria-label={`Add ${product.name} to wishlist`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Heart size={15} strokeWidth={2} />
      </span>

      <span className="product-media__layer product-media__layer--base">
        {product.image_url ? (
          <img src={product.image_url} alt={product.alt_text || product.name} />
        ) : (
          <ProductIcon name={product.icon} size={40} strokeWidth={1.25} />
        )}
      </span>
      <span className="product-media__layer product-media__layer--hover">
        {product.image_url ? (
          <img src={product.hover_image_url || product.image_url} alt="" />
        ) : (
          <ProductIcon name={product.icon} alt size={40} strokeWidth={1.25} />
        )}
      </span>

      <span className="product-media__hint">
        <ZoomIn size={13} strokeWidth={2.25} />
        View product
      </span>
    </Link>
  )
}
