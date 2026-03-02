import React, { useState, useEffect } from 'react';
import Header from './Header';
import './styles/home.css';
import cricket from '../../images/cricket.jpg';
import basketball from '../../images/basketball.jpg';
import soccer from '../../images/soccer.jpg';
import tennis from '../../images/tennis.jpg';
import volleyball from '../../images/volleyball.jpg';
import equipment from '../../images/equipment.png';
import users from '../../images/users.png';
import uniform from '../../images/uniform.png';
import match from '../../images/match.png';
import performance from '../../images/performance.png';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faArrowRight, faStar, faPlayCircle, faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

export default function Home() {
  const images = [cricket, basketball, soccer, tennis, volleyball];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const features = [
    {
      icon: <FontAwesomeIcon icon={faLocationDot} size='xl' />,
      title: "Venue Booking",
      description: "Find and book sports facilities near you with real-time availability and instant confirmation.",
      color: "#4f46e5"
    },
    {
      icon: <img src={equipment} alt="Equipment" />,
      title: "Equipment Rental",
      description: "Rent high-quality sports gear for your games and training sessions at affordable prices.",
      color: "#10b981"
    },
    {
      icon: <img src={users} alt="Users" />,
      title: "Find Coaches",
      description: "Connect with certified coaches and trainers to improve your skills and performance.",
      color: "#f59e0b"
    },
    {
      icon: <img src={uniform} alt="Uniform" />,
      title: "Custom Uniforms",
      description: "Design and order custom team uniforms with your logos and colors for a professional look.",
      color: "#ef4444"
    },
    {
      icon: <img src={match} alt="Match" />,
      title: "Matchmaking",
      description: "Find opponents of similar skill levels for friendly matches or competitive games.",
      color: "#8b5cf6"
    },
    {
      icon: <img src={performance} alt="Performance" />,
      title: "Performance Tracking",
      description: "Monitor your progress with detailed analytics and statistics for your sports activities.",
      color: "#06b6d4"
    }
  ];

  const testimonials = [
    {
      name: "janaka samarasinghe",
      role: "Basketball Coach",
      content: "LankaArena has transformed how I manage my training sessions. The venue booking is seamless!",
      rating: 5
    },
    {
      name: "Hemantha bandara",
      role: "Tennis Player",
      content: "Found the perfect coach through this platform. My game has improved dramatically in just 3 months.",
      rating: 4
    },
    {
      name: "inuka sathsara",
      role: "Sports Team Manager",
      content: "The equipment rental service saved our tournament when we had last-minute gear issues.",
      rating: 5
    }
  ];

  return (
    <div className="home-light-theme">
      <Header />
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="slider-container">
            <div className="slider">
              <div
                className="slider-inner"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {images.map((img, idx) => (
                  <div key={idx} className="slide">
                    <img src={img} alt={`slide-${idx}`} />
                    <div className="slide-overlay"></div>
                  </div>
                ))}
              </div>
              
              {/* Navigation dots */}
              <div className="dots">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={currentIndex === idx ? "dot active" : "dot"}
                    onClick={() => setCurrentIndex(idx)}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-content">
            <h1 className="hero-title">
              Revolutionizing Sports Culture in <span className="highlight">Sri Lanka</span>
            </h1>
            <p className="hero-subtitle">
              LankaArena is the all-in-one platform for athletes, coaches, and venues. 
              Book facilities, rent equipment, find coaches, and organize matches seamlessly.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
                Get Started <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <button className="btn-secondary">
                <FontAwesomeIcon icon={faPlayCircle} /> Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <h2>Why Choose LankaArena?</h2>
              <p>Our platform offers everything you need to manage your sports activities in one place</p>
            </div>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div 
                    className="feature-icon"
                    style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <button className="feature-link">
                    Learn more <FontAwesomeIcon icon={faArrowRight} size="xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="container">
            <div className="section-header">
              <h2>What Our Users Say</h2>
              <p>Join thousands of satisfied athletes and coaches who trust LankaArena</p>
            </div>
            
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon 
                        key={i} 
                        icon={faStar} 
                        className={i < testimonial.rating ? "star filled" : "star"} 
                      />
                    ))}
                  </div>
                  <p className="testimonial-content">"{testimonial.content}"</p>
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-bg-pattern" aria-hidden="true" />
          <div className="container cta-container">
            <div className="cta-content">
              <p className="cta-label">Join thousands of athletes &amp; coaches</p>
              <h2 className="cta-title">Ready to Elevate Your Sports Experience?</h2>
              <p className="cta-description">
                Join LankaArena today and discover a world of sports opportunities—book venues, rent equipment, find coaches, and grow your game.
              </p>
              <div className="cta-buttons">
                <Link to="/reg" className="btn-primary btn-cta large">
                  Get Started Free <FontAwesomeIcon icon={faArrowRight} />
                </Link>
                <Link to="/log" className="btn-cta-outline large">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-inner">
              <div className="footer-brand">
                <h3 className="footer-logo">LankaArena</h3>
                <p className="footer-tagline">Revolutionizing sports culture in Sri Lanka. One platform for venues, coaches, and athletes.</p>
                <div className="footer-social">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Twitter">
                    <FontAwesomeIcon icon={faTwitter} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                    <FontAwesomeIcon icon={faLinkedinIn} />
                  </a>
                </div>
              </div>
              <div className="footer-links">
                <div className="footer-col">
                  <h4>Platform</h4>
                  <Link to="/reg">Register</Link>
                  <Link to="/log">Sign In</Link>
                  <a href="#features">Features</a>
                  <a href="#testimonials">Testimonials</a>
                </div>
                <div className="footer-col">
                  <h4>Resources</h4>
                  <a href="#help">Help Center</a>
                  <a href="#faq">FAQ</a>
                  <a href="#blog">Blog</a>
                  <a href="#contact">Contact</a>
                </div>
                <div className="footer-col footer-col-contact">
                  <h4>Contact</h4>
                  <a href="mailto:hello@lankaarena.com"><FontAwesomeIcon icon={faEnvelope} /> hello@lankaarena.com</a>
                  <a href="tel:+94112345678"><FontAwesomeIcon icon={faPhone} /> +94 11 234 5678</a>
                  <span><FontAwesomeIcon icon={faMapMarkerAlt} /> Colombo, Sri Lanka</span>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} LankaArena. All rights reserved. Revolutionizing sports in Sri Lanka.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}