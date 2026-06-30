import { useState } from "react";
import "./App.css";

const PAYMENT_AMOUNT = 50; // Fixed at Rs. 50

export default function App() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Payment modal states
  const [showModal, setShowModal] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholder: "",
  });

  const handleAddClick = (e) => {
    e.preventDefault();

    setResult(null);
    setError(null);

    if (a === "" || b === "") {
      setError("Please enter both numbers.");
      return;
    }

    const numA = Number(a);
    const numB = Number(b);
    if (isNaN(numA) || isNaN(numB)) {
      setError("Please enter valid numbers.");
      return;
    }

    setPaymentError(null);
    setShowModal(true);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
    if (paymentError) setPaymentError(null);
  };

  const handlePaymentSubmit = async () => {
    const { cardNumber, expiry, cvv, cardholder } = paymentData;

    // Only check that every field has something in it — no format/correctness checks.
    if (
      !cardNumber.trim() ||
      !expiry.trim() ||
      !cvv.trim() ||
      !cardholder.trim()
    ) {
      setPaymentError("Please fill in all card details to continue.");
      return;
    }

    setPaymentError(null);
    setPaying(true);

    // Simulate a brief payment processing step for better UX feedback.
    await new Promise((resolve) => setTimeout(resolve, 700));

    setPaying(false);
    setShowModal(false);
    setError(null);
    setLoading(true);

    const numA = Number(a);
    const numB = Number(b);

    try {
      const response = await fetch(
        "https://calculator-backend.aadarsh-senapati2005.workers.dev/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ a: numA, b: numB }),
        },
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.sum);

      setPaymentData({
        cardNumber: "",
        expiry: "",
        cvv: "",
        cardholder: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (paying) return;
    setShowModal(false);
    setPaymentError(null);
    setPaymentData({
      cardNumber: "",
      expiry: "",
      cvv: "",
      cardholder: "",
    });
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    return formatted.slice(0, 19);
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentData((prev) => ({ ...prev, cardNumber: formatted }));
    if (paymentError) setPaymentError(null);
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleExpiryChange = (e) => {
    setPaymentData((prev) => ({
      ...prev,
      expiry: formatExpiry(e.target.value),
    }));
    if (paymentError) setPaymentError(null);
  };

  const handleCvvChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPaymentData((prev) => ({ ...prev, cvv: digits }));
    if (paymentError) setPaymentError(null);
  };

  return (
    <>
      <div className="particles"></div>

      <div className="card">
        <header className="card-header">
          <span className="brand-mark" aria-hidden="true" />
          <h1 data-text="Calculator">Calculator</h1>
        </header>

        <form onSubmit={handleAddClick} className="calculator-form">
          <div className="input-group">
            <label htmlFor="num1" className="sr-only">
              First number
            </label>
            <input
              id="num1"
              type="number"
              placeholder="Enter number 1"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="num2" className="sr-only">
              Second number
            </label>
            <input
              id="num2"
              type="number"
              placeholder="Enter number 2"
              value={b}
              onChange={(e) => setB(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Calculating…" : "Add · Rs. 50"}
          </button>
        </form>

        <div className="result-area">
          {error && (
            <div className="result-message error">
              <svg
                className="icon icon-warning"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 4 2 20h20L12 4z" />
                <line x1="12" y1="10" x2="12" y2="14" />
                <circle
                  cx="12"
                  cy="17"
                  r="0.6"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {result !== null && !error && (
            <div className="result-message success big-result">
              <span className="result-label">Result</span>
              <span className="result-value">{result}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <svg
                className="icon icon-card"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="6" y1="15" x2="10" y2="15" />
              </svg>
              <div className="modal-heading">
                <h2>Confirm payment</h2>
                <p className="modal-amount">Rs. {PAYMENT_AMOUNT.toFixed(2)}</p>
              </div>
              <button
                className="modal-close"
                onClick={handleModalClose}
                disabled={paying}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                Enter your card details to complete this Rs. 1 payment and see
                your result.
              </p>

              <div className="payment-form">
                <div className="payment-field full">
                  <label htmlFor="cardNumber">Card number</label>
                  <input
                    id="cardNumber"
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength="19"
                    autoComplete="cc-number"
                    inputMode="numeric"
                    disabled={paying}
                  />
                </div>

                <div className="payment-row">
                  <div className="payment-field half">
                    <label htmlFor="expiry">Expiry</label>
                    <input
                      id="expiry"
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={paymentData.expiry}
                      onChange={handleExpiryChange}
                      maxLength="5"
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      disabled={paying}
                    />
                  </div>
                  <div className="payment-field half">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      id="cvv"
                      type="password"
                      name="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={handleCvvChange}
                      maxLength="4"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      disabled={paying}
                    />
                  </div>
                </div>

                <div className="payment-field full">
                  <label htmlFor="cardholder">Cardholder name</label>
                  <input
                    id="cardholder"
                    type="text"
                    name="cardholder"
                    placeholder="John Doe"
                    value={paymentData.cardholder}
                    onChange={handlePaymentChange}
                    autoComplete="cc-name"
                    disabled={paying}
                  />
                </div>
              </div>

              {paymentError && (
                <div className="payment-error">
                  <svg
                    className="icon icon-warning"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 4 2 20h20L12 4z" />
                    <line x1="12" y1="10" x2="12" y2="14" />
                    <circle
                      cx="12"
                      cy="17"
                      r="0.6"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                  <span>{paymentError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-btn cancel"
                onClick={handleModalClose}
                disabled={paying}
              >
                Cancel
              </button>
              <button
                className="modal-btn pay"
                onClick={handlePaymentSubmit}
                disabled={paying}
              >
                {paying ? "Processing…" : `Pay Rs. ${PAYMENT_AMOUNT}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
