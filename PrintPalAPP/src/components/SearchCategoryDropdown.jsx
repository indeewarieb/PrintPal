import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { searchCategories } from '../data.js'
import './SearchCategoryDropdown.css'

export default function SearchCategoryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const select = (name) => {
    onChange(name)
    setOpen(false)
  }

  return (
    <div className="search-category" ref={rootRef}>
      <button
        type="button"
        className="search__category"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{value}</span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>

      {open && (
        <ul className="search-category__list" role="listbox">
          <li>
            <button
              type="button"
              className={`search-category__option ${value === 'All Categories' ? 'is-selected' : ''}`}
              onClick={() => select('All Categories')}
            >
              All Categories
            </button>
          </li>
          {searchCategories.map((cat) => (
            <li key={cat.name} className="search-category__group">
              <button
                type="button"
                className={`search-category__option ${value === cat.name ? 'is-selected' : ''}`}
                onClick={() => select(cat.name)}
              >
                {cat.name}
              </button>
              {cat.children?.map((child) => (
                <button
                  key={child.name}
                  type="button"
                  className={`search-category__option search-category__option--child ${
                    value === child.name ? 'is-selected' : ''
                  }`}
                  onClick={() => select(child.name)}
                >
                  {child.name}
                </button>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
