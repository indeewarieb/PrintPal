import { Link } from 'react-router-dom'
import { ArrowRight, ImageOff } from 'lucide-react'
import { allCategories, slugify } from '../data.js'
import { useCategoryImage } from '../context/CategoryImagesContext.jsx'
import { useItems } from '../context/ItemsContext.jsx'
import { getCategoryItemCount } from '../utils/products.js'
import './ShopPage.css'

function ShopCategoryCard({ cat }) {
  const slug = slugify(cat.name)
  const image = useCategoryImage(slug)
  const { items } = useItems()

  return (
    <Link to={`/product-category/${slug}`} className="shop-page__card">
      <div className="shop-page__thumb">
        {image ? (
          <>
            <img
              className="shop-page__thumb-layer shop-page__thumb-layer--base"
              src={image.image_url}
              alt={image.alt_text || cat.name}
              loading="lazy"
            />
            {image.hover_image_url && (
              <img
                className="shop-page__thumb-layer shop-page__thumb-layer--hover"
                src={image.hover_image_url}
                alt=""
                loading="lazy"
              />
            )}
          </>
        ) : (
          <ImageOff size={20} strokeWidth={1.5} />
        )}
      </div>
      <div className="shop-page__card-body">
        <div>
          <h2>{cat.name}</h2>
          <span>{getCategoryItemCount(cat.name, items)} products</span>
        </div>
        <ArrowRight size={18} strokeWidth={2} />
      </div>
    </Link>
  )
}

export default function ShopPage() {
  return (
    <div className="shop-page container">
      <p className="shop-page__crumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <strong>SHOP</strong>
      </p>

      <h1>All categories</h1>
      <p className="shop-page__lead">
        Browse everything we print and produce for corporate gifting, from bottles and bags to
        awards and business stationery.
      </p>

      <div className="shop-page__grid">
        {allCategories.map((cat) => (
          <ShopCategoryCard cat={cat} key={cat.name} />
        ))}
      </div>
    </div>
  )
}
