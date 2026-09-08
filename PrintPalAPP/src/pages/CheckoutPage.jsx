import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BANK_DETAILS } from '../data.js'
import { useCart } from '../context/CartContext.jsx'
import './CheckoutPage.css'

const COUNTRIES = [
  'Sri Lanka',
  'India',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Australia',
  'Singapore',
  'Other',
]

const CARD_TYPES = ['Visa', 'Mastercard', 'American Express']

const SERVICE_FEE_RATE = 0.034 // Card payments only — bank transfer has no service fee.
const PROMO_CODE = 'PRINTYPAL10'
const PROMO_DISCOUNT_RATE = 0.1

const emptyContact = {
  email: '',
  mobile: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Sri Lanka',
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [contact, setContact] = useState(emptyContact)
  const [payment, setPayment] = useState('card')
  const [cardType, setCardType] = useState('Visa')
  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoMessage, setPromoMessage] = useState('')

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const updateField = (field) => (e) =>
    setContact((prev) => ({ ...prev, [field]: e.target.value }))

  const discount = promoApplied ? Math.round(subtotal * PROMO_DISCOUNT_RATE) : 0
  const serviceFee = payment === 'card' ? Math.round((subtotal - discount) * SERVICE_FEE_RATE) : 0
  const total = subtotal - discount + serviceFee

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true)
      setPromoMessage('Promo code applied \u2013 10% off.')
    } else {
      setPromoApplied(false)
      setPromoMessage('That code is not valid.')
    }
  }

  const buildOrderLines = () => items.map((item) => ({
    description: `${item.name} \u00d7 ${item.qty}`,
    amount: item.price * item.qty,
  }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const purchaseId = `P${Math.floor(100000000 + Math.random() * 900000000)}`
    const orderLines = buildOrderLines()
    const name = `${contact.firstName} ${contact.lastName}`.trim()

    if (payment === 'bank') {
      clearCart()
      navigate('/bank-transfer-confirmation', {
        state: { purchaseId, name, orderLines, subtotal, total: subtotal },
      })
      return
    }

    clearCart()
    navigate('/order-confirmation', {
      state: { orderNumber: purchaseId, name, total },
    })
  }

  return (
    <div className="container checkout-page">
      <p className="checkout-page__crumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <strong>Checkout</strong>
      </p>
      <h1>Checkout</h1>

      <form className="checkout-page__layout" onSubmit={handleSubmit}>
        <div className="checkout-page__billing">
          <h2>Your contact information</h2>

          <div className="checkout-page__grid-2">
            <label>
              Email address <span>*</span>
              <input required type="email" value={contact.email} onChange={updateField('email')} />
            </label>
            <label>
              Mobile number <span>*</span>
              <input required type="tel" value={contact.mobile} onChange={updateField('mobile')} />
            </label>
          </div>

          <h2 className="checkout-page__section-gap">Billing address</h2>

          <div className="checkout-page__grid-2">
            <label>
              First name <span>*</span>
              <input required value={contact.firstName} onChange={updateField('firstName')} />
            </label>
            <label>
              Last name <span>*</span>
              <input required value={contact.lastName} onChange={updateField('lastName')} />
            </label>
          </div>

          <label>
            Address <span>*</span>
            <input required value={contact.address} onChange={updateField('address')} />
          </label>

          <div className="checkout-page__grid-2">
            <label>
              City <span>*</span>
              <input required value={contact.city} onChange={updateField('city')} />
            </label>
            <label>
              Postal code <span>*</span>
              <input required value={contact.postalCode} onChange={updateField('postalCode')} />
            </label>
          </div>

          <label>
            Country <span>*</span>
            <select required value={contact.country} onChange={updateField('country')}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="checkout-page__summary">
          <div className="checkout-page__order-table">
            <div className="checkout-page__order-row checkout-page__order-row--head">
              <span>Description</span>
              <span>Amount (LKR)</span>
            </div>
            {items.map((item) => (
              <div className="checkout-page__order-row" key={item.id}>
                <span>
                  {item.name} <strong>&times; {item.qty}</strong>
                </span>
                <span>LKR {(item.price * item.qty).toLocaleString()}.00</span>
              </div>
            ))}
            {promoApplied && (
              <div className="checkout-page__order-row">
                <span>Promo discount</span>
                <span>&minus; LKR {discount.toLocaleString()}.00</span>
              </div>
            )}
            {serviceFee > 0 && (
              <div className="checkout-page__order-row">
                <span>Service fee</span>
                <span>LKR {serviceFee.toLocaleString()}.00</span>
              </div>
            )}
            <div className="checkout-page__order-row checkout-page__order-row--total">
              <span>Total</span>
              <strong>LKR {total.toLocaleString()}.00</strong>
            </div>
          </div>

          <div className="checkout-page__promo">
            <input
              type="text"
              placeholder="PROMO CODE"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
            />
            <button type="button" onClick={applyPromo}>
              Apply
            </button>
          </div>
          {promoMessage && (
            <p className={`checkout-page__promo-msg ${promoApplied ? 'is-success' : 'is-error'}`}>
              {promoMessage}
            </p>
          )}

          <div className="checkout-page__payment">
            <p className="checkout-page__payment-title">Your preferred payment method is</p>
            <label>
              <input
                type="radio"
                name="payment"
                checked={payment === 'card'}
                onChange={() => setPayment('card')}
              />
              Credit / Debit Card Payment
            </label>
            <label>
              <input
                type="radio"
                name="payment"
                checked={payment === 'bank'}
                onChange={() => setPayment('bank')}
              />
              Direct Bank Transfer (No Service Fee)
            </label>

            {payment === 'card' && (
              <label className="checkout-page__card-select">
                Card type
                <select value={cardType} onChange={(e) => setCardType(e.target.value)}>
                  {CARD_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {payment === 'bank' && (
              <div className="checkout-page__bank-details">
                <div>
                  <span>Account name</span>
                  <strong>{BANK_DETAILS.accountName}</strong>
                </div>
                <div>
                  <span>Account number</span>
                  <strong>{BANK_DETAILS.accountNumber}</strong>
                </div>
                <div>
                  <span>Bank name</span>
                  <strong>{BANK_DETAILS.bank}</strong>
                </div>
                <div>
                  <span>Branch name</span>
                  <strong>{BANK_DETAILS.branch}</strong>
                </div>
              </div>
            )}
          </div>

          <p className="checkout-page__privacy">
            By continuing you are agreeing to our <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a>.
          </p>

          <div className="checkout-page__actions">
            <Link to="/cart" className="checkout-page__previous">
              <ChevronLeft size={16} strokeWidth={2.25} />
              Previous
            </Link>
            <button type="submit" className="checkout-page__submit">
              Pay
              <ChevronRight size={16} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
