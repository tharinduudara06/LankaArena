import React, { useState, useEffect } from "react";
import "./styles/coach_payment_gateway.css";
import Coach_sideBar from "./Coach_sideBar";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCreditCard, 
  faLock, 
  faShieldAlt, 
  faCheckCircle,
  faArrowLeft,
  faUser,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faMoneyBillWave
} from "@fortawesome/free-solid-svg-icons";

const Coach_payment_gateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from navigation state
  const bookingData = location.state?.bookingData;
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phone: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData) {
      toast.error("No booking data found. Please try again.");
      navigate('/coach-bookings');
    }
  }, [bookingData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    // Expiry date validation
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Please enter a valid month (01-12)';
      } else if (parseInt(year) < currentYear || 
                 (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Call the payment API for coach
      const response = await axios.get(
        `http://localhost:8080/api/coach/player-downolad-receipt/${bookingData._id}`,
        { 
          responseType: "blob",
          withCredentials: true 
        }
      );

      if (response.status === 200) {
        // Download the PDF receipt
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `receipt_${bookingData._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        setCurrentStep(3);
        toast.success("Payment successful! Receipt downloaded.");
        
        // Redirect to bookings page after 3 seconds
        setTimeout(() => {
          navigate('/coach-bookings');
        }, 3000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setCurrentStep(1);
      
      if (error.response?.status === 401) {
        toast.error("Please log in to continue with payment");
      } else if (error.response?.status === 404) {
        toast.error("Booking not found. Please try again.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/coach-bookings');
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!bookingData) {
    return (
      <div className="c-pg-body">
        <Coach_sideBar />
        <div className="c-pg-main-content">
          <div className="c-pg-error">
            <h2>No booking data found</h2>
            <p>Please try again from the bookings page.</p>
            <button onClick={handleBack} className="c-pg-btn-back">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="c-pg-body">
      <Coach_sideBar />
      <ToastContainer />
      
      <div className="c-pg-main-content">
        <div className="c-pg-header">
          <button onClick={handleBack} className="c-pg-btn-back">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Bookings
          </button>
          <h1 className="c-pg-title">Payment Gateway</h1>
        </div>

        <div className="c-pg-container">
          {/* Progress Steps */}
          <div className="c-pg-progress">
            <div className={`c-pg-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="c-pg-step-number">1</div>
              <div className="c-pg-step-label">Payment Details</div>
            </div>
            <div className={`c-pg-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="c-pg-step-number">2</div>
              <div className="c-pg-step-label">Processing</div>
            </div>
            <div className={`c-pg-step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="c-pg-step-number">3</div>
              <div className="c-pg-step-label">Complete</div>
            </div>
          </div>

          <div className="c-pg-content">
            {/* Booking Summary */}
            <div className="c-pg-booking-summary">
              <h3>Booking Summary</h3>
              <div className="c-pg-booking-details">
                <div className="c-pg-booking-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>{bookingData.venue?.name || 'Ground Name'}</span>
                </div>
                <div className="c-pg-booking-item">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(bookingData.date)}</span>
                </div>
                <div className="c-pg-booking-item">
                  <FontAwesomeIcon icon={faClock} />
                  <span>
                    {formatTime(bookingData.startTime)} - {formatTime(bookingData.endTime)}
                  </span>
                </div>
                <div className="c-pg-booking-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Status: {bookingData.status}</span>
                </div>
              </div>
              <div className="c-pg-total">
                <span>Total Amount:</span>
                <span className="c-pg-amount">LKR {bookingData.price}</span>
              </div>
            </div>

            {/* Payment Form */}
            {currentStep === 1 && (
              <div className="c-pg-payment-form">
                <h3>Payment Details</h3>
                
                <div className="c-pg-form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <div className="c-pg-input-wrapper">
                    <FontAwesomeIcon icon={faCreditCard} className="c-pg-input-icon" />
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        setFormData(prev => ({ ...prev, cardNumber: formatted }));
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                  </div>
                  {errors.cardNumber && <span className="c-pg-error-text">{errors.cardNumber}</span>}
                </div>

                <div className="c-pg-form-row">
                  <div className="c-pg-form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <div className="c-pg-input-wrapper">
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          setFormData(prev => ({ ...prev, expiryDate: formatted }));
                        }}
                        placeholder="MM/YY"
                        maxLength="5"
                        className={errors.expiryDate ? 'error' : ''}
                      />
                    </div>
                    {errors.expiryDate && <span className="c-pg-error-text">{errors.expiryDate}</span>}
                  </div>

                  <div className="c-pg-form-group">
                    <label htmlFor="cvv">CVV</label>
                    <div className="c-pg-input-wrapper">
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className={errors.cvv ? 'error' : ''}
                      />
                    </div>
                    {errors.cvv && <span className="c-pg-error-text">{errors.cvv}</span>}
                  </div>
                </div>

                <div className="c-pg-form-group">
                  <label htmlFor="cardholderName">Cardholder Name</label>
                  <div className="c-pg-input-wrapper">
                    <FontAwesomeIcon icon={faUser} className="c-pg-input-icon" />
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={errors.cardholderName ? 'error' : ''}
                    />
                  </div>
                  {errors.cardholderName && <span className="c-pg-error-text">{errors.cardholderName}</span>}
                </div>

                <div className="c-pg-form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="c-pg-input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                  </div>
                  {errors.email && <span className="c-pg-error-text">{errors.email}</span>}
                </div>

                <div className="c-pg-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="c-pg-input-wrapper">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+94 77 123 4567"
                      className={errors.phone ? 'error' : ''}
                    />
                  </div>
                  {errors.phone && <span className="c-pg-error-text">{errors.phone}</span>}
                </div>

                <div className="c-pg-security">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <button 
                  onClick={handlePayment} 
                  className="c-pg-btn-pay"
                  disabled={isProcessing}
                >
                  <FontAwesomeIcon icon={faLock} />
                  Pay LKR {bookingData.price}
                </button>
              </div>
            )}

            {/* Processing Step */}
            {currentStep === 2 && (
              <div className="c-pg-processing">
                <div className="c-pg-spinner"></div>
                <h3>Processing Payment...</h3>
                <p>Please wait while we process your payment. Do not close this page.</p>
              </div>
            )}

            {/* Success Step */}
            {currentStep === 3 && (
              <div className="c-pg-success">
                <FontAwesomeIcon icon={faCheckCircle} className="c-pg-success-icon" />
                <h3>Payment Successful!</h3>
                <p>Your payment has been processed successfully. The receipt has been downloaded.</p>
                <p>You will be redirected to your bookings page shortly.</p>
                <div className="c-pg-success-details">
                  <p><strong>Transaction ID:</strong> TXN{Date.now()}</p>
                  <p><strong>Amount Paid:</strong> LKR {bookingData.price}</p>
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

export default Coach_payment_gateway;
