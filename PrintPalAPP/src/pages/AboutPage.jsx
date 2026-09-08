import { Link } from 'react-router-dom'
import { Quote } from 'lucide-react'
import { testimonials } from '../data.js'
import './AboutPage.css'

export default function AboutPage() {
  return (
    <div className="about-page container">
      <p className="about-page__crumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <strong>About Us</strong>
      </p>

      <div className="about-page__grid">
        <div className="about-page__col">
          <h2>Our History</h2>
          <div className="about-page__body">
            <p>
              PrintyPal Ceylon started out over a decade ago as a small product-printing
              workshop, working behind the scenes for advertising agencies, production houses,
              and promotion companies across Sri Lanka. Along the way we specialized in
              promotional printing across UV, pad, eco-solvent, and screen printing.
            </p>
            <p>
              Eventually we began designing and manufacturing our own range of corporate gifts,
              bringing that same experience directly to businesses and individual customers. We
              take pride in unmatched quality and on-time production, no matter the size of the
              order.
            </p>
            <p>Get in touch for your next corporate gifting or printing requirement.</p>
            <p>We're always happy to work with you and make it a success, every time.</p>
          </div>
        </div>

        <div className="about-page__col">
          <h2>Client Reviews</h2>
          <div className="about-page__reviews">
            {testimonials.map((t) => (
              <div className="about-page__review" key={t.name}>
                <div className="about-page__review-head">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
                <div className="about-page__review-quote">
                  <Quote size={18} strokeWidth={1.5} />
                  <p>{t.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
