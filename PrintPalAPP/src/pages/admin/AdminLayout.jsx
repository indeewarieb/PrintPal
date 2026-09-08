import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { ImagePlus, ImageUp, Trash2, LogOut, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import './AdminLayout.css'

const TABS = [
  { to: '/admin/items/add', label: 'Add item', icon: ImagePlus },
  { to: '/admin/items/update', label: 'Update item', icon: ImageUp },
  { to: '/admin/items/delete', label: 'Delete item', icon: Trash2 },
]

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="container admin-layout">
        <div className="admin-layout__denied">
          <ShieldAlert size={32} strokeWidth={1.5} />
          <h1>Admins only</h1>
          <p>Your account doesn&rsquo;t have admin access. Ask an existing admin to upgrade you.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container admin-layout">
      <div className="admin-layout__head">
        <h1>Admin &middot; Items</h1>
        <button type="button" className="admin-layout__logout" onClick={signOut}>
          <LogOut size={15} strokeWidth={2} />
          Sign out
        </button>
      </div>

      <div className="admin-layout__tabs">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `admin-layout__tab ${isActive ? 'is-active' : ''}`}
          >
            <tab.icon size={16} strokeWidth={1.75} />
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="admin-layout__panel">
        <Outlet />
      </div>
    </div>
  )
}
