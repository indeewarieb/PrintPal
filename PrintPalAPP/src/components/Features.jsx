import { Gift, Store, Headset } from 'lucide-react'
import { features } from '../data.js'
import './Features.css'

const icons = { gift: Gift, store: Store, headset: Headset }

export default function Features() {
  return (
    <section className="features">
      <div className="container features__grid">
        {features.map((f) => {
          const Icon = icons[f.icon]
          return (
            <div className="feature" key={f.title}>
              <span className="feature__icon">
                <Icon size={24} strokeWidth={1.5} />
              </span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
