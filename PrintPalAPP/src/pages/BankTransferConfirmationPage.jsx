import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, UploadCloud, FileCheck2 } from 'lucide-react'
import { BANK_DETAILS } from '../data.js'
import './BankTransferConfirmationPage.css'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_MB = 5

export default function BankTransferConfirmationPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!state?.purchaseId) {
    return <Navigate to="/" replace />
  }

  const { purchaseId, orderLines = [], total = 0 } = state

  const handleFile = (selected) => {
    if (!selected) return
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Only PDF, JPG, JPEG, and PNG files are accepted.')
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Maximum file size allowed is ${MAX_SIZE_MB} MB.`)
      return
    }
    setError('')
    setFile(selected)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    window.setTimeout(() => {
      navigate('/order-confirmation', {
        state: { orderNumber: purchaseId, total, bankTransfer: true },
      })
    }, 900)
  }

  return (
    <div className="container bank-confirm">
      <div className="bank-confirm__head">
        <h1>Buy Voucher</h1>
        <Link to="/" className="bank-confirm__home">
          Back to Home
        </Link>
      </div>

      <div className="bank-confirm__banner">
        <AlertCircle size={22} strokeWidth={1.75} />
        Thank you! Your order has been received
      </div>

      <p className="bank-confirm__lead">
        Make your payment directly into our bank account.
        <br />
        Please use your purchase ID (<strong>{purchaseId}</strong>) as the payment reference.
      </p>
      <p className="bank-confirm__warning">
        Your order will not be processed until the funds have cleared in our account.
      </p>

      <div className="bank-confirm__grid">
        <div>
          <h2>Bank Details</h2>
          <div className="bank-confirm__details">
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
        </div>

        <div>
          <h2>Order Details</h2>
          <div className="bank-confirm__order">
            <div className="bank-confirm__order-row bank-confirm__order-row--head">
              <span>Description</span>
              <span>Amount (LKR)</span>
            </div>
            {orderLines.map((line) => (
              <div className="bank-confirm__order-row" key={line.description}>
                <span>{line.description}</span>
                <span>LKR {line.amount.toLocaleString()}.00</span>
              </div>
            ))}
            <div className="bank-confirm__order-row bank-confirm__order-row--total">
              <span>Total</span>
              <strong>LKR {total.toLocaleString()}.00</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <p className="bank-confirm__upload-note">
              Please email your payment slip to{' '}
              <a href="mailto:info@printypalceylon.com">info@printypalceylon.com</a> or upload it below.
              <br />
              Maximum file size allowed is {MAX_SIZE_MB} MB.
              <br />
              Only *.pdf, *.jpg, *.jpeg and *.png files are accepted.
            </p>

            <div
              className={`bank-confirm__dropzone ${dragOver ? 'is-dragover' : ''} ${file ? 'has-file' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <FileCheck2 size={22} strokeWidth={1.5} />
                  <span>{file.name}</span>
                </>
              ) : (
                <>
                  <UploadCloud size={22} strokeWidth={1.5} />
                  <span>Drag 'n' drop file here, or click to select file</span>
                </>
              )}
            </div>
            {error && <p className="bank-confirm__error">{error}</p>}

            <button type="submit" className="bank-confirm__submit" disabled={submitted}>
              {submitted ? 'Submitting\u2026' : 'Submit'}
              {!submitted && <span aria-hidden>&rarr;</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
