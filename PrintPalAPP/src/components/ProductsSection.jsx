import { useState } from 'react'
import { Link } from 'react-router-dom'
import { browseCategories, slugify } from '../data.js'
import { useItems } from '../context/ItemsContext.jsx'
import ProductCard from './ProductCard.jsx'
import Lightbox from './Lightbox.jsx'
import './ProductsSection.css'

export default function ProductsSection() {
  const [quickView, setQuickView] = useState(null)
  const { items, loading } = useItems()

  return (
    <section className="products container">
      <aside className="products__sidebar">
        <h2>Browse categories</h2>
        <ul>
          {browseCategories.map((cat) => (
            <li key={cat}>
              <Link to={`/product-category/${slugify(cat)}`}>{cat}</Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="products__main">
        <div className="products__heading">
          <span className="eyebrow">Popular products</span>
        </div>

        {items.length > 0 ? (
          <div className="products__grid">
            {items.map((p) => (
              <ProductCard product={p} key={p.id} onQuickView={setQuickView} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="products__empty">
              <p>No products added yet.</p>
            </div>
          )
        )}
      </div>

      <Lightbox product={quickView} onClose={() => setQuickView(null)} />
    </section>
  )
}
