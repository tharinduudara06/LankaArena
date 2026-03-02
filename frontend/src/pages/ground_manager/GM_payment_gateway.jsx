import React, { useState, useEffect } from "react";
import "./styles/GM_payment_gateway.css";
import Ground_manager_sideBar from "./Ground_manager_sideBar";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faLock,
  faShieldAlt,
  faCheckCircle,
  faArrowLeft,
  faUser,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";

const GM_payment_gateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state?.paymentData || location.state?.bookingData;

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const amount = paymentData?.price ?? paymentData?.amount ?? 0;
  const description = paymentData?.description || paymentData?.venue?.name || "Venue booking payment";

  useEffect(() => {
    if (!paymentData && !location.state) {
      toast.info("Navigate here from Bookings or Payments to process a payment.");
    }
  }, [paymentData, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const match = v.match(/\d{4,16}/g)?.[0] || "";
    return match.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "");
    return v.length >= 2 ? v.substring(0, 2) + "/" + v.substring(2, 4) : v;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 16)
      newErrors.cardNumber = "Enter a valid 16-digit card number";
    if (!formData.expiryDate || formData.expiryDate.length < 5)
      newErrors.expiryDate = "Enter expiry (MM/YY)";
    if (!formData.cvv || formData.cvv.length < 3) newErrors.cvv = "Enter valid CVV";
    if (!formData.cardholderName?.trim()) newErrors.cardholderName = "Enter cardholder name";
    if (!formData.email?.trim()) newErrors.email = "Enter email";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter valid email";
    if (!formData.phone?.trim()) newErrors.phone = "Enter phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before proceeding");
      return;
    }
    setIsProcessing(true);
    setCurrentStep(2);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setCurrentStep(3);
      toast.success("Payment processed successfully.");
      setTimeout(() => navigate("/ground-manager-payments"), 2500);
    } catch (err) {
      setCurrentStep(1);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => navigate("/ground-manager-payments");

  if (!paymentData && !location.state) {
    return (
      <div className="g-pg-body">
        <Ground_manager_sideBar />
        <div className="g-pg-main-content">
          <div className="g-pg-error">
            <h2>No payment data</h2>
            <p>Go to Bookings or Payments, then open Payment Gateway for a transaction.</p>
            <button onClick={handleBack} className="g-pg-btn-back">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="g-pg-body">
      <Ground_manager_sideBar />
      <ToastContainer />
      <div className="g-pg-main-content">
        <div className="g-pg-header">
          <button onClick={handleBack} className="g-pg-btn-back">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Payments
          </button>
          <h1 className="g-pg-title">Payment Gateway</h1>
        </div>
        <div className="g-pg-container">
          <div className="g-pg-progress">
            <div className={`g-pg-step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="g-pg-step-number">1</div>
              <div className="g-pg-step-label">Payment Details</div>
            </div>
            <div className={`g-pg-step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="g-pg-step-number">2</div>
              <div className="g-pg-step-label">Processing</div>
            </div>
            <div className={`g-pg-step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="g-pg-step-number">3</div>
              <div className="g-pg-step-label">Complete</div>
            </div>
          </div>
          <div className="g-pg-content">
            <div className="g-pg-booking-summary">
              <h3>Payment Summary</h3>
              <div className="g-pg-booking-details">
                <div className="g-pg-booking-item">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  <span>{description}</span>
                </div>
              </div>
              <div className="g-pg-total">
                <span>Amount:</span>
                <span className="g-pg-amount">LKR {Number(amount).toLocaleString()}</span>
              </div>
            </div>
            {currentStep === 1 && (
              <div className="g-pg-payment-form">
                <h3>Card Details</h3>
                <div className="g-pg-form-group">
                  <label>Card Number</label>
                  <div className="g-pg-input-wrapper">
                    <FontAwesomeIcon icon={faCreditCard} className="g-pg-input-icon" />
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))
                      }
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className={errors.cardNumber ? "error" : ""}
                    />
                  </div>
                  {errors.cardNumber && <span className="g-pg-error-text">{errors.cardNumber}</span>}
                </div>
                <div className="g-pg-form-row">
                  <div className="g-pg-form-group">
                    <label>Expiry (MM/YY)</label>
                    <div className="g-pg-input-wrapper">
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, expiryDate: formatExpiryDate(e.target.value) }))
                        }
                        placeholder="MM/YY"
                        maxLength="5"
                        className={errors.expiryDate ? "error" : ""}
                      />
                    </div>
                    {errors.expiryDate && <span className="g-pg-error-text">{errors.expiryDate}</span>}
                  </div>
                  <div className="g-pg-form-group">
                    <label>CVV</label>
                    <div className="g-pg-input-wrapper">
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className={errors.cvv ? "error" : ""}
                      />
                    </div>
                    {errors.cvv && <span className="g-pg-error-text">{errors.cvv}</span>}
                  </div>
                </div>
                <div className="g-pg-form-group">
                  <label>Cardholder Name</label>
                  <div className="g-pg-input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="g-pg-input-icon" />
                    <input
                      type="text"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={errors.cardholderName ? "error" : ""}
                    />
                  </div>
                  {errors.cardholderName && (
                    <span className="g-pg-error-text">{errors.cardholderName}</span>
                  )}
                </div>
                <div className="g-pg-form-group">
                  <label>Email</label>
                  <div className="g-pg-input-wrapper">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="gm@lankaarena.com"
                      className={errors.email ? "error" : ""}
                    />
                  </div>
                  {errors.email && <span className="g-pg-error-text">{errors.email}</span>}
                </div>
                <div className="g-pg-form-group">
                  <label>Phone</label>
                  <div className="g-pg-input-wrapper">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+94 11 234 5678"
                      className={errors.phone ? "error" : ""}
                    />
                  </div>
                  {errors.phone && <span className="g-pg-error-text">{errors.phone}</span>}
                </div>
                <div className="g-pg-security">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Your payment information is secure and encrypted.</span>
                </div>
                <button
                  onClick={handlePayment}
                  className="g-pg-btn-pay"
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faLock} /> Pay LKR {Number(amount).toLocaleString()}
                </button>
              </div>
            )}
            {currentStep === 2 && (
              <div className="g-pg-processing">
                <div className="g-pg-spinner" />
                <h3>Processing payment…</h3>
                <p>Do not close this page.</p>
              </div>
            )}
            {currentStep === 3 && (
              <div className="g-pg-success">
                <FontAwesomeIcon icon={faCheckCircle} className="g-pg-success-icon" />
                <h3>Payment successful</h3>
                <p>Amount: LKR {Number(amount).toLocaleString()}. Redirecting to Payments…</p>
                <div className="g-pg-success-details">
                  <p><strong>Transaction ID:</strong> TXN{Date.now()}</p>
                  <p><strong>Status:</strong> Completed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GM_payment_gateway;
