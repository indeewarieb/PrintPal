import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, X, ShoppingBag } from 'lucide-react'
import { slugify } from '../data.js'
import { useCart } from '../context/CartContext.jsx'
import ProductIcon from '../components/ProductIcon.jsx'
import './CartPage.css'

export default function CartPage() {
  const { items, removeFromCart, setQty, subtotal } = useCart()
  const [coupon, setCoupon] = useState('')
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container cart-page">
        <h1>Cart</h1>
        <div className="cart-page__empty">
          <ShoppingBag size={40} strokeWidth={1.25} />
          <p>Your cart is empty.</p>
          <Link to="/shop">Continue shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container cart-page">
      <h1>Cart</h1>

      <div className="cart-page__table">
        <div className="cart-page__row cart-page__row--head">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
        </div>

        {items.map((item) => (
          <div className="cart-page__row" key={item.id}>
            <button
              className="cart-page__remove"
              aria-label={`Remove ${item.name} from cart`}
              onClick={() => removeFromCart(item.id)}
            >
              <X size={15} strokeWidth={2.25} />
            </button>

            <div className="cart-page__product">
              <span className={`cart-page__thumb tone-${item.tone}`}>
                <ProductIcon name={item.icon} size={22} strokeWidth={1.5} />
              </span>
              <Link to={`/product/${slugify(item.name)}`}>{item.name}</Link>
            </div>

            <span className="cart-page__price">Rs {item.price.toLocaleString()}.00</span>

            <div className="cart-page__stepper">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() => setQty(item.id, item.qty - 1)}
              >
                <Minus size={13} />
              </button>
              <span>{item.qty}</span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() => setQty(item.id, item.qty + 1)}
              >
                <Plus size={13} />
              </button>
            </div>

            <span className="cart-page__subtotal">Rs {(item.price * item.qty).toLocaleString()}.00</span>
          </div>
        ))}

        <div className="cart-page__coupon">
          <input
            type="text"
            placeholder="Coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button type="button">Apply coupon</button>
        </div>
      </div>

      <div className="cart-page__totals">
        <h2>Cart total</h2>
        <div className="cart-page__totals-row">
          <span>Subtotal</span>
          <strong>Rs {subtotal.toLocaleString()}.00</strong>
        </div>
        <div className="cart-page__totals-row">
          <span>Total</span>
          <strong>Rs {subtotal.toLocaleString()}.00</strong>
        </div>
        <button type="button" className="cart-page__checkout" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  )
}
