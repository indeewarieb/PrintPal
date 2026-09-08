import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Facebook, Search, MapPin, Phone, Mail, Clock } from 'lucide-react'
import './Footer.css'

const CUSTOMER_SERVICE_LINKS = [
  { label: 'Help & FAQs' },
  { label: 'Order Tracking' },
  { label: 'Shipping & Delivery' },
  { label: 'Orders History' },
  { label: 'Advanced Search', to: '/shop' },
  { label: 'My Account', to: '/login' },
  { label: 'Careers' },
  { label: 'About Us' },
  { label: 'Corporate Sales' },
  { label: 'Privacy' },
]

export default function Footer() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : '/shop')
  }

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <h3 className="footer__heading">About Us</h3>
          <Link to="/" className="footer__logo">
            <span className="footer__logo-mark">P</span>
            <span className="footer__logo-text">
              PRINTYPAL
              <span>CEYLON</span>
            </span>
          </Link>
          <p className="footer__tagline">Corporate Gifts &amp; Print Supplier</p>
          <p className="footer__about">
            PrintyPal Ceylon is a customized corporate gifts and print supplier in Sri Lanka. We
            offer a wide range of uncommon promotional gifts, printing, and branding solutions.
          </p>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">Contact Info</h3>
          <ul className="footer__contact">
            <li>
              <MapPin size={16} strokeWidth={1.75} />
              <div>
                <strong>Address:</strong>
                <span>No. 45, Kandy Road, Kurunegala, Sri Lanka.</span>
              </div>
            </li>
            <li>
              <Phone size={16} strokeWidth={1.75} />
              <div>
                <strong>Phone:</strong>
                <span>
                  <a href="tel:+94762967997">+9476 296 7997</a>
                </span>
              </div>
            </li>
            <li>
              <Mail size={16} strokeWidth={1.75} />
              <div>
                <strong>Email:</strong>
                <span>
                  <a href="mailto:info@printypalceylon.com">info@printypalceylon.com</a>
                </span>
              </div>
            </li>
            <li>
              <Clock size={16} strokeWidth={1.75} />
              <div>
                <strong>Working days/hours:</strong>
                <span>Mon - Sat / 9:00 AM - 5:00 PM</span>
              </div>
            </li>
          </ul>

          <h3 className="footer__heading footer__heading--gap">Follow Us On FB</h3>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="footer__fb"
          >
            Visit our fan page
            <span className="footer__fb-icon">
              <Facebook size={15} strokeWidth={2} />
            </span>
          </a>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">Customer Service</h3>
          <ul className="footer__links">
            {CUSTOMER_SERVICE_LINKS.map((link) =>
              link.to ? (
                <li key={link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ) : (
                <li key={link.label}>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="footer__col">
          <form className="footer__search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} strokeWidth={2} />
            </button>
          </form>

          <h3 className="footer__heading footer__heading--gap">We Accept</h3>
          <div className="footer__payments">
            <span className="footer__payment-badge">VISA</span>
            <span className="footer__payment-badge">Mastercard</span>
          </div>
          <p className="footer__payment-note">
            We accept all major credit / debit cards at our main show room for non-discounted
            payments.
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} PrintyPal Ceylon. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
