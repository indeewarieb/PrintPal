import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Mail,
  Link2,
  Minus,
  Plus,
  Check,
  ShoppingBag,
} from 'lucide-react'
import {
  generateProductDetails,
  slugify,
} from '../data.js'
import { useCart } from '../context/CartContext.jsx'
import { useItems } from '../context/ItemsContext.jsx'
import {
  findMergedProductBySlug,
  getCategorySiblings,
  getRelatedItems,
} from '../utils/products.js'
import ProductGallery from '../components/ProductGallery.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Lightbox from '../components/Lightbox.jsx'
import '../components/ProductsSection.css'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { items } = useItems()
  const product = findMergedProductBySlug(slug, items)

  const siblings = useMemo(
    () => (product ? getCategorySiblings(product, items) : []),
    [product, items]
  )
  const related = useMemo(
    () => (product ? getRelatedItems(product, items, 5) : []),
    [product, items]
  )

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [quickView, setQuickView] = useState(null)

  if (!product) {
    return (
      <div className="container product-detail__missing">
        <h1>Product not found</h1>
        <p>
          We couldn't find that product. <Link to="/shop">Browse the shop</Link> instead.
        </p>
      </div>
    )
  }

  const details = generateProductDetails(product)
  const hasCustomDescription = Boolean(product.description && product.description.trim())
  const category = product.categories[0]
  const index = siblings.findIndex((p) => p.id === product.id)
  const prev = siblings[(index - 1 + siblings.length) % siblings.length]
  const next = siblings[(index + 1) % siblings.length]

  const goTo = (p) => navigate(`/product/${slugify(p.name)}`)

  const handleAdd = () => {
    addToCart(product, qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="product-detail container">
      <p className="product-detail__crumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/product-category/${slugify(category)}`}>{category.toUpperCase()}</Link>
        <span>/</span>
        <strong>{product.name.toUpperCase()}</strong>
      </p>

      <div className="product-detail__layout">
        <div>
          <ProductGallery product={product} />
        </div>

        <div className="product-detail__info">
          <div className="product-detail__headrow">
            <div>
              <h1>{product.name}</h1>
              <p className="product-detail__price">
                Rs {product.price.toLocaleString()}.00
                {product.priceMax ? ` \u2013 Rs ${product.priceMax.toLocaleString()}.00` : ''}
              </p>
            </div>
            <div className="product-detail__nav">
              <button
                type="button"
                aria-label={`Previous product: ${prev?.name ?? ''}`}
                onClick={() => prev && goTo(prev)}
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label={`Next product: ${next?.name ?? ''}`}
                onClick={() => next && goTo(next)}
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {hasCustomDescription ? (
            <div className="product-detail__custom-description">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>
          ) : (
            <p className="product-detail__tagline">{details.tagline}</p>
          )}

          <div className="product-detail__buybox">
            <div className="lightbox__stepper product-detail__stepper">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                <Plus size={14} />
              </button>
            </div>
            <button type="button" className={`product-detail__add ${added ? 'is-added' : ''}`} onClick={handleAdd}>
              {added ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  Added to cart
                </>
              ) : (
                <>
                  <ShoppingBag size={16} strokeWidth={2} />
                  Add to cart
                </>
              )}
            </button>
          </div>

          {!hasCustomDescription && (
            <ul className="product-detail__bullets">
              {details.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}

          <div className="product-detail__share">
            <a href="#" aria-label="Share on Facebook" onClick={(e) => e.preventDefault()}>
              <Facebook size={16} strokeWidth={2} />
            </a>
            <a href="#" aria-label="Share on X" onClick={(e) => e.preventDefault()}>
              <Twitter size={16} strokeWidth={2} />
            </a>
            <a href="#" aria-label="Pin on Pinterest" onClick={(e) => e.preventDefault()}>
              <Link2 size={16} strokeWidth={2} />
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(product.name)}`} aria-label="Share by email">
              <Mail size={16} strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>

      {!hasCustomDescription && (
        <>
          <div className="product-detail__tabs">
            <span className="product-detail__tab is-active">Description</span>
          </div>
          <p className="product-detail__description">{details.description}</p>
        </>
      )}

      {related.length > 0 && (
        <div className="product-detail__related">
          <h2>Related products</h2>
          <div className="products__grid">
            {related.map((p) => (
              <ProductCard product={p} key={p.id} onQuickView={setQuickView} />
            ))}
          </div>
        </div>
      )}

      <Lightbox product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
