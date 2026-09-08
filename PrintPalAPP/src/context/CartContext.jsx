import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
const STORAGE_PREFIX = 'printypal-ceylon-cart'

// Guests and each signed-in user get their own cart, keyed by user id
// (or 'guest' when signed out). Without this, everyone on the same
// browser shared a single localStorage key, so a signed-out visitor
// would see whatever was left in the cart from the last person who was
// logged in on that device.
function storageKeyFor(userId) {
  return `${STORAGE_PREFIX}:${userId ?? 'guest'}`
}

function loadCart(storageKey) {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.items
    case 'ADD': {
      const { product, qty } = action
      const existing = state.find((i) => i.id === product.id)
      if (existing) {
        return state.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...state, { ...product, qty }]
    }
    case 'REMOVE':
      return state.filter((i) => i.id !== action.id)
    case 'SET_QTY':
      return state.map((i) => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i))
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const storageKey = storageKeyFor(user?.id)

  const [items, dispatch] = useReducer(reducer, storageKey, loadCart)

  // Whenever who's signed in changes (login, logout, switching accounts
  // on the same browser), swap to that person's own cart instead of
  // continuing to show whoever's was loaded before.
  useEffect(() => {
    dispatch({ type: 'LOAD', items: loadCart(storageKey) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items))
    } catch {
      // Storage may be unavailable (private browsing, etc.) — fail silently.
    }
  }, [items, storageKey])

  const addToCart = (product, qty = 1) => dispatch({ type: 'ADD', product, qty })
  const removeFromCart = (id) => dispatch({ type: 'REMOVE', id })
  const setQty = (id, qty) => dispatch({ type: 'SET_QTY', id, qty })
  const clearCart = () => dispatch({ type: 'CLEAR' })

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, setQty, clearCart, count, subtotal }),
    [items, count, subtotal]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
