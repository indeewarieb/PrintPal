import { Link } from 'react-router-dom'
import { Gift, Layers, ChevronRight } from 'lucide-react'
import { productCategories, slugify } from '../data.js'
import { useCategoryImage } from '../context/CategoryImagesContext.jsx'
import './Hero.css'

function CategoryLink({ cat }) {
  const slug = slugify(cat)
  const image = useCategoryImage(slug)

  return (
    <li>
      <Link to={`/product-category/${slug}`}>
        {image && <img src={image.image_url} alt="" className="hero__cat-thumb" />}
        {cat}
      </Link>
    </li>
  )
}

export default function Hero() {
  return (
    <section className="hero container">
      <div className="hero__banner">
        <div className="hero__copy">
          <p className="hero__kicker">Widest range of customized</p>
          <h1>
            Corporate
            <br />
            Gifts
          </h1>
          <p className="hero__discount">10% off</p>
          <div className="hero__cta">
            <div className="hero__price">
              <span>Starting at</span>
              <strong>Rs 10</strong>
            </div>
            <button type="button">
              Select now
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__box">
            <Gift size={64} strokeWidth={1.25} />
          </div>
        </div>
      </div>

      <aside className="hero__categories">
        <h2>
          <Layers size={16} strokeWidth={2.25} />
          Product categories
        </h2>
        <ul>
          {productCategories.map((cat) => (
            <CategoryLink cat={cat} key={cat} />
          ))}
        </ul>
        <Link to="/shop" className="hero__view-all">
          View all categories
        </Link>
      </aside>
    </section>
  )
}
