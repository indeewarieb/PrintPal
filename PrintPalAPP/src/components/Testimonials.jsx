import { useState } from 'react'
import { Quote } from 'lucide-react'
import { testimonials } from '../data.js'
import './Testimonials.css'

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const t = testimonials[active]

  return (
    <section className="testimonials container">
      <div className="testimonials__card">
        <Quote size={26} strokeWidth={1.5} className="testimonials__mark" />
        <p className="testimonials__quote">{t.quote}</p>
        <h3>{t.name}</h3>
        <p className="testimonials__role">{t.role}</p>

        <div className="testimonials__dots">
          {testimonials.map((item, i) => (
            <button
              key={item.name}
              className={`testimonials__dot ${i === active ? 'is-active' : ''}`}
              aria-label={`Show testimonial from ${item.name}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
