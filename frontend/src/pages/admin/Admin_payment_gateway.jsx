import React, { useState, useEffect } from "react";
import "./styles/admin_payment_gateway.css";
import Admin_nav from "./Admin_nav";
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

const Admin_payment_gateway = () => {
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
  const description = paymentData?.description || "Admin payment";

  useEffect(() => {
    if (!paymentData && !location.state) {
      toast.info("Navigate here from Finance or a booking to process a payment.");
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
      setTimeout(() => navigate("/admin-finance"), 2500);
    } catch (err) {
      setCurrentStep(1);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => navigate("/admin-finance");

  if (!paymentData && !location.state) {
    return (
      <div className="a-pg-body">
        <Admin_nav />
        <div className="a-pg-main-content">
          <div className="a-pg-error">
            <h2>No payment data</h2>
            <p>Go to Financial & payments or a booking that requires payment, then open Payment Gateway.</p>
            <button onClick={handleBack} className="a-pg-btn-back">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Finance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="a-pg-body">
      <Admin_nav />
      <ToastContainer />
      <div className="a-pg-main-content">
        <div className="a-pg-header">
          <button onClick={handleBack} className="a-pg-btn-back">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Finance
          </button>
          <h1 className="a-pg-title">Admin Payment Gateway</h1>
        </div>
        <div className="a-pg-container">
          <div className="a-pg-progress">
            <div className={`a-pg-step ${currentStep >= 1 ? "active" : ""}`}>
              <div className="a-pg-step-number">1</div>
              <div className="a-pg-step-label">Payment Details</div>
            </div>
            <div className={`a-pg-step ${currentStep >= 2 ? "active" : ""}`}>
              <div className="a-pg-step-number">2</div>
              <div className="a-pg-step-label">Processing</div>
            </div>
            <div className={`a-pg-step ${currentStep >= 3 ? "active" : ""}`}>
              <div className="a-pg-step-number">3</div>
              <div className="a-pg-step-label">Complete</div>
            </div>
          </div>
          <div className="a-pg-content">
            <div className="a-pg-booking-summary">
              <h3>Payment Summary</h3>
              <div className="a-pg-booking-details">
                <div className="a-pg-booking-item">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  <span>{description}</span>
                </div>
              </div>
              <div className="a-pg-total">
                <span>Amount:</span>
                <span className="a-pg-amount">LKR {Number(amount).toLocaleString()}</span>
              </div>
            </div>
            {currentStep === 1 && (
              <div className="a-pg-payment-form">
                <h3>Card Details</h3>
                <div className="a-pg-form-group">
                  <label>Card Number</label>
                  <div className="a-pg-input-wrapper">
                    <FontAwesomeIcon icon={faCreditCard} className="a-pg-input-icon" />
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
                  {errors.cardNumber && <span className="a-pg-error-text">{errors.cardNumber}</span>}
                </div>
                <div className="a-pg-form-row">
                  <div className="a-pg-form-group">
                    <label>Expiry (MM/YY)</label>
                    <div className="a-pg-input-wrapper">
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
                    {errors.expiryDate && <span className="a-pg-error-text">{errors.expiryDate}</span>}
                  </div>
                  <div className="a-pg-form-group">
                    <label>CVV</label>
                    <div className="a-pg-input-wrapper">
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
                    {errors.cvv && <span className="a-pg-error-text">{errors.cvv}</span>}
                  </div>
                </div>
                <div className="a-pg-form-group">
                  <label>Cardholder Name</label>
                  <div className="a-pg-input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="a-pg-input-icon" />
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
                    <span className="a-pg-error-text">{errors.cardholderName}</span>
                  )}
                </div>
                <div className="a-pg-form-group">
                  <label>Email</label>
                  <div className="a-pg-input-wrapper">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@lankaarena.com"
                      className={errors.email ? "error" : ""}
                    />
                  </div>
                  {errors.email && <span className="a-pg-error-text">{errors.email}</span>}
                </div>
                <div className="a-pg-form-group">
                  <label>Phone</label>
                  <div className="a-pg-input-wrapper">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+94 11 234 5678"
                      className={errors.phone ? "error" : ""}
                    />
                  </div>
                  {errors.phone && <span className="a-pg-error-text">{errors.phone}</span>}
                </div>
                <div className="a-pg-security">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Your payment information is secure and encrypted.</span>
                </div>
                <button
                  onClick={handlePayment}
                  className="a-pg-btn-pay"
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faLock} /> Pay LKR {Number(amount).toLocaleString()}
                </button>
              </div>
            )}
            {currentStep === 2 && (
              <div className="a-pg-processing">
                <div className="a-pg-spinner" />
                <h3>Processing payment…</h3>
                <p>Do not close this page.</p>
              </div>
            )}
            {currentStep === 3 && (
              <div className="a-pg-success">
                <FontAwesomeIcon icon={faCheckCircle} className="a-pg-success-icon" />
                <h3>Payment successful</h3>
                <p>Amount: LKR {Number(amount).toLocaleString()}. Redirecting to Finance…</p>
                <div className="a-pg-success-details">
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

export default Admin_payment_gateway;
