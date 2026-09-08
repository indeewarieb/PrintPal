import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Send, Clock, CheckCircle2 } from 'lucide-react'
import './ContactPage.css'

const OFFICE_ADDRESS = 'No. 45, Kandy Road, Kurunegala, Sri Lanka'
const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&output=embed`

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sent

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // No backend endpoint for the contact form yet — this just confirms
    // receipt in the UI. Wire this up to a real inbox/API when ready.
    setStatus('sent')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="contact-page">
      <div className="container">
        <p className="contact-page__crumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <strong>Contact Us</strong>
        </p>

        <h1 className="contact-page__map-heading">Google Map</h1>
      </div>

      <div className="contact-page__map">
        <iframe
          title="PrintyPal Ceylon location"
          src={MAP_SRC}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="container">
        <div className="contact-page__grid">
          <div>
            <h2>Contact Us</h2>

            {status === 'sent' && (
              <p className="contact-page__success">
                <CheckCircle2 size={16} strokeWidth={2} />
                Thanks! Your message has been sent — we'll get back to you soon.
              </p>
            )}

            <form className="contact-page__form" onSubmit={handleSubmit}>
              <div className="contact-page__row">
                <label>
                  Your name <span>*</span>
                  <input required value={form.name} onChange={updateField('name')} />
                </label>
                <label>
                  Your email address <span>*</span>
                  <input required type="email" value={form.email} onChange={updateField('email')} />
                </label>
              </div>

              <label>
                Subject
                <input value={form.subject} onChange={updateField('subject')} />
              </label>

              <label>
                Your message
                <textarea rows={7} value={form.message} onChange={updateField('message')} />
              </label>

              <button type="submit">Send Message</button>
            </form>
          </div>

          <div className="contact-page__info">
            <h2>Get in Touch</h2>
            <p className="contact-page__lead">
              Contact us for any kind of corporate gifting requirement. We're always happy to
              help you get an idea or product done — no need to be a business. Even for just
              guidance and support, please get in touch.
            </p>

            <h3>The Office</h3>
            <ul className="contact-page__details">
              <li>
                <span className="contact-page__icon">
                  <MapPin size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>Address:</strong> {OFFICE_ADDRESS}
                </div>
              </li>
              <li>
                <span className="contact-page__icon">
                  <Phone size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>Phone:</strong> <a href="tel:+94762967997">+9476 296 7997</a>
                </div>
              </li>
              <li>
                <span className="contact-page__icon">
                  <Send size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:info@printypalceylon.com">info@printypalceylon.com</a>
                </div>
              </li>
            </ul>

            <h3>Business Hours</h3>
            <ul className="contact-page__hours">
              <li>
                <Clock size={15} strokeWidth={1.75} />
                Monday - Friday &nbsp; 9am to 5pm
              </li>
              <li>
                <Clock size={15} strokeWidth={1.75} />
                Saturday &nbsp; 9am to 2pm
              </li>
              <li>
                <Clock size={15} strokeWidth={1.75} />
                Sunday &nbsp; Closed
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
