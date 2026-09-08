import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, LayoutGrid, List, Search, X } from 'lucide-react'
import { allCategories, slugify } from '../data.js'
import { useCategoryImage } from '../context/CategoryImagesContext.jsx'
import { useItems } from '../context/ItemsContext.jsx'
import { getCategoryItems, getCategoryItemCount } from '../utils/products.js'
import ProductCard from '../components/ProductCard.jsx'
import Lightbox from '../components/Lightbox.jsx'
import '../components/ProductsSection.css'
import './CategoryPage.css'

const SORT_OPTIONS = [
  { value: 'default', label: 'Default sorting' },
  { value: 'popularity', label: 'Sort by popularity' },
  { value: 'latest', label: 'Sort by latest' },
  { value: 'price-asc', label: 'Sort by price: low to high' },
  { value: 'price-desc', label: 'Sort by price: high to low' },
]

const SHOW_OPTIONS = [28, 48, 76]

function sortProducts(list, sortBy) {
  const copy = [...list]
  switch (sortBy) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'latest':
      return copy.sort((a, b) => String(b.id).localeCompare(String(a.id)))
    case 'popularity':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return copy
  }
}

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get('search') ?? ''
  const [view, setView] = useState('grid')
  const [openParent, setOpenParent] = useState(null)
  const [sortBy, setSortBy] = useState('default')
  const [show, setShow] = useState(28)
  const [quickView, setQuickView] = useState(null)
  const { items } = useItems()

  const category = useMemo(() => {
    for (const cat of allCategories) {
      if (slugify(cat.name) === slug) return cat
      const child = cat.children?.find((c) => slugify(c.name) === slug)
      if (child) return child
    }
    // Category came from a nav link that isn't in the sidebar list (e.g. Services).
    const label = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return { name: label, count: null }
  }, [slug])

  const categoryItems = useMemo(() => getCategoryItems(category.name, items), [category.name, items])

  const productList = useMemo(() => {
    const filtered = searchTerm
      ? categoryItems.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : categoryItems
    return sortProducts(filtered, sortBy).slice(0, show)
  }, [categoryItems, searchTerm, sortBy, show])

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next, { replace: true })
  }

  const bannerImage = useCategoryImage(slug)

  return (
    <div className="category-page container">
      <p className="category-page__crumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <strong>{category.name.toUpperCase()}</strong>
      </p>

      <div className="category-page__layout">
        <aside className="category-page__sidebar">
          <h2>Categories</h2>
          <ul>
            {allCategories.map((cat) => {
              const isActive = cat.name === category.name
              const hasChildren = Boolean(cat.children?.length)
              const isOpen = openParent === cat.name
              return (
                <li key={cat.name}>
                  <div className={`category-page__row ${isActive ? 'is-active' : ''}`}>
                    <Link to={`/product-category/${slugify(cat.name)}`}>
                      {cat.name} <span>({getCategoryItemCount(cat.name, items)})</span>
                    </Link>
                    {hasChildren && (
                      <button
                        aria-label={`Toggle ${cat.name} subcategories`}
                        onClick={() => setOpenParent(isOpen ? null : cat.name)}
                      >
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    )}
                  </div>
                  {hasChildren && isOpen && (
                    <ul className="category-page__children">
                      {cat.children.map((child) => (
                        <li key={child.name}>
                          <Link
                            to={`/product-category/${slugify(child.name)}`}
                            className={child.name === category.name ? 'is-active' : ''}
                          >
                            {child.name} <span>({getCategoryItemCount(child.name, items)})</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="category-page__main">
          {bannerImage && (
            <div className="category-page__banner">
              <img src={bannerImage.image_url} alt={bannerImage.alt_text || category.name} />
              <span>{category.name}</span>
            </div>
          )}
          <p className="category-page__intro">
            PrintyPal Ceylon manufactures a wide range of {category.name.toLowerCase()} for corporate
            gifting in Sri Lanka. Every item can be branded with your logo to bring your business
            to the highest position.
          </p>

          {searchTerm && (
            <div className="category-page__search-notice">
              <Search size={14} strokeWidth={2} />
              <span>
                Showing results for <strong>&ldquo;{searchTerm}&rdquo;</strong> in {category.name}
              </span>
              <button type="button" onClick={clearSearch} aria-label="Clear search">
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          )}

          <div className="category-page__toolbar">
            <label>
              Sort by:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="category-page__toolbar-right">
              <label>
                Show:
                <select value={show} onChange={(e) => setShow(Number(e.target.value))}>
                  {SHOW_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="category-page__view-toggle">
                <button
                  className={view === 'grid' ? 'is-active' : ''}
                  aria-label="Grid view"
                  onClick={() => setView('grid')}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={view === 'list' ? 'is-active' : ''}
                  aria-label="List view"
                  onClick={() => setView('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={`category-page__grid ${view === 'list' ? 'is-list' : ''}`}>
            {productList.map((p) => (
              <ProductCard product={p} key={p.id} onQuickView={setQuickView} />
            ))}
          </div>

          {productList.length === 0 && (
            <div className="category-page__empty">
              <p>
                {searchTerm
                  ? `No items match "${searchTerm}" in ${category.name}.`
                  : 'No items in this category yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Lightbox product={quickView} onClose={() => setQuickView(null)} />
    </div>
  )
}
