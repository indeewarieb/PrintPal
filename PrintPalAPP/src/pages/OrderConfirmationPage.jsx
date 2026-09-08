import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import './OrderConfirmationPage.css'

export default function OrderConfirmationPage() {
  const { state } = useLocation()

  return (
    <div className="container order-confirmation">
      <CheckCircle2 size={56} strokeWidth={1.25} className="order-confirmation__icon" />
      <h1>Thank you{state?.name ? `, ${state.name}` : ''}!</h1>
      <p>
        {state?.bankTransfer
          ? "We've received your payment slip and will confirm your order once the funds clear in our account."
          : 'Your order has been received and is being processed.'}
      </p>

      {state?.orderNumber && (
        <div className="order-confirmation__details">
          <div>
            <span>Order number</span>
            <strong>{state.orderNumber}</strong>
          </div>
          {typeof state.total === 'number' && (
            <div>
              <span>Total</span>
              <strong>Rs {state.total.toLocaleString()}.00</strong>
            </div>
          )}
        </div>
      )}

      <Link to="/shop" className="order-confirmation__cta">
        Continue shopping
      </Link>
    </div>
  )
}
