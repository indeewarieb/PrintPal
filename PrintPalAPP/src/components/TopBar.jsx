import { Facebook } from 'lucide-react'
import './TopBar.css'

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <p>
          Only currently available products displaying — prices given for mostly moving
          quantities — if your quantity is different, please contact us
        </p>
        <a href="#" aria-label="Visit our Facebook page" className="topbar__social">
          <Facebook size={16} strokeWidth={1.75} />
        </a>
      </div>
    </div>
  )
}
