import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Phone,
  User,
  Heart,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Settings,
  ImagePlus,
  ImageUp,
  Trash2,
} from 'lucide-react'
import { navLinks, shopMenu, slugify } from '../data.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import SearchCategoryDropdown from './SearchCategoryDropdown.jsx'
import AccountMenu from './AccountMenu.jsx'
import './Header.css'

const ADMIN_MENU_ITEMS = [
  { to: '/admin/items/add', label: 'Add item', icon: ImagePlus },
  { to: '/admin/items/delete', label: 'Delete item', icon: Trash2 },
  { to: '/admin/items/update', label: 'Update item', icon: ImageUp },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [query, setQuery] = useState('')
  const { count } = useCart()
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const target =
      categoryFilter === 'All Categories'
        ? '/shop'
        : `/product-category/${slugify(categoryFilter)}`
    const trimmed = query.trim()
    navigate(trimmed ? `${target}?search=${encodeURIComponent(trimmed)}` : target)
    setMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="container header__top">
        <Link to="/" className="logo">
          <span className="logo__mark">P</span>
          <span className="logo__text">
            PRINTYPAL
            <span className="logo__sub">ceylon</span>
          </span>
        </Link>

        <form className="search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SearchCategoryDropdown value={categoryFilter} onChange={setCategoryFilter} />
          <button className="search__submit" type="submit" aria-label="Search">
            <Search size={18} strokeWidth={2} />
          </button>
        </form>

        <div className="header__actions">
          <a className="header__phone" href="tel:+94762967997">
            <span className="header__phone-icon">
              <Phone size={18} strokeWidth={2} />
            </span>
            <span>
              <small>Call us now</small>
              <strong>+9476 296 7997</strong>
            </span>
          </a>
          {user ? (
            <AccountMenu user={user} onSignOut={signOut} />
          ) : (
            <Link to="/login" className="header__icon" aria-label="Login">
              <User size={20} strokeWidth={1.75} />
            </Link>
          )}
          <button className="header__icon" aria-label="Wishlist">
            <Heart size={20} strokeWidth={1.75} />
          </button>
          <Link to="/cart" className="header__icon header__icon--cart" aria-label="View cart">
            <ShoppingBag size={20} strokeWidth={1.75} />
            {count > 0 && <span className="header__cart-badge">{count}</span>}
          </Link>
          <button
            className="header__icon header__icon--menu"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
        <div className="container nav__inner">
          <ul className="nav__links">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <li
                  key={link.label}
                  className="nav__item--dropdown"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <button
                    type="button"
                    className="nav__trigger"
                    aria-expanded={shopOpen}
                    onClick={() => setShopOpen((v) => !v)}
                  >
                    {link.label}
                    <ChevronDown size={13} strokeWidth={2.25} />
                  </button>

                  {shopOpen && (
                    <div className="mega-menu">
                      {shopMenu.map((column, colIndex) => (
                        <ul className="mega-menu__column" key={colIndex}>
                          {column.map((item, itemIndex) => (
                            <li key={`${colIndex}-${itemIndex}`}>
                              <Link
                                to={`/product-category/${slugify(item)}`}
                                onClick={() => {
                                  setShopOpen(false)
                                  setMenuOpen(false)
                                }}
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.label}>
                  <Link to={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              )
            )}

            {isAdmin && (
              <li
                className="nav__item--dropdown"
                onMouseEnter={() => setAdminOpen(true)}
                onMouseLeave={() => setAdminOpen(false)}
              >
                <button
                  type="button"
                  className="nav__trigger nav__trigger--admin"
                  aria-expanded={adminOpen}
                  onClick={() => setAdminOpen((v) => !v)}
                >
                  <Settings size={14} strokeWidth={2} />
                  Admin Operations
                  <ChevronDown size={13} strokeWidth={2.25} />
                </button>

                {adminOpen && (
                  <div className="admin-menu">
                    {ADMIN_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="admin-menu__item"
                        onClick={() => {
                          setAdminOpen(false)
                          setMenuOpen(false)
                        }}
                      >
                        <item.icon size={16} strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}
