import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import ProductIcon from './ProductIcon.jsx'
import Lightbox from './Lightbox.jsx'
import './ProductGallery.css'

// For products with real uploaded photos, the gallery is just the two
// shots (default + hover). For the icon-based static catalog, we fake up
// four "shots" from the same two icon variants so the thumbnail strip
// still has something to switch between.
function buildShots(product) {
  if (product.image_url) {
    return [
      { photo: product.image_url, rotate: 0 },
      { photo: product.hover_image_url || product.image_url, rotate: 0 },
    ]
  }
  return [
    { icon: product.icon, alt: false, rotate: 0 },
    { icon: product.icon, alt: true, rotate: 0 },
    { icon: product.icon, alt: false, rotate: 8 },
    { icon: product.icon, alt: true, rotate: -8 },
  ]
}

export default function ProductGallery({ product }) {
  const shots = buildShots(product)
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const current = shots[active]

  return (
    <div className={`gallery tone-${product.tone}`}>
      <button
        type="button"
        className="gallery__main"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Zoom in on ${product.name}`}
      >
        <span className="gallery__badge">Hot</span>
        {current.photo ? (
          <img className="gallery__photo" src={current.photo} alt={product.alt_text || product.name} />
        ) : (
          <span className="gallery__icon" style={{ transform: `rotate(${current.rotate}deg)` }}>
            <ProductIcon name={current.icon} alt={current.alt} size={110} strokeWidth={1} />
          </span>
        )}
        <span className="gallery__hint">
          <ZoomIn size={14} strokeWidth={2.25} />
          Click to zoom
        </span>
      </button>

      <div className="gallery__thumbs">
        {shots.map((shot, i) => (
          <button
            key={i}
            type="button"
            className={`gallery__thumb ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of ${product.name}`}
          >
            {shot.photo ? (
              <img src={shot.photo} alt="" />
            ) : (
              <span style={{ transform: `rotate(${shot.rotate}deg)` }}>
                <ProductIcon name={shot.icon} alt={shot.alt} size={26} strokeWidth={1.25} />
              </span>
            )}
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <Lightbox product={product} onClose={() => setLightboxOpen(false)} showActions={false} />
      )}
    </div>
  )
}
