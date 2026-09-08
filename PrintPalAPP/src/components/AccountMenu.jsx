import { useEffect, useRef, useState } from 'react'
import { User, LogOut } from 'lucide-react'
import './AccountMenu.css'

export default function AccountMenu({ user, onSignOut }) {
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

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-menu__pill"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <User size={15} strokeWidth={2} />
        {user.email.split('@')[0]}
      </button>

      {open && (
        <div className="account-menu__list" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
          >
            <LogOut size={15} strokeWidth={2} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
