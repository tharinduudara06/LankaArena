import React, { useState } from 'react'
import Header from './Header'
import './styles/register.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify'

export default function Register() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [status, setStatus] = useState('active');
  
  // Error states for each field
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });

  const navigate = useNavigate();

  // Real-time validation functions
  const validateName = (value) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z ]+$/.test(value)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) return 'Please enter a valid Gmail address';
    return '';
  };

  const validateMobile = (value) => {
    if (!value) return 'Mobile number is required';
    if (!/^[0-9]{10}$/.test(value)) return 'Mobile number must be exactly 10 digits';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain a lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain an uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain a number';
    if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain a special character (@$!%*?&)';
    return '';
  };

  // Handle input changes with real-time validation
  const handleInputChange = (field, value) => {
    // Update the state
    switch (field) {
      case 'name':
        setName(value);
        setErrors(prev => ({...prev, name: validateName(value)}));
        break;
      case 'email':
        setEmail(value);
        setErrors(prev => ({...prev, email: validateEmail(value)}));
        break;
      case 'mobile':
        setMobile(value);
        setErrors(prev => ({...prev, mobile: validateMobile(value)}));
        break;
      case 'password':
        setPassword(value);
        setErrors(prev => ({...prev, password: validatePassword(value)}));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    // Validate all fields on submit
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      mobile: validateMobile(mobile),
      password: validatePassword(password)
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      toast.error('Please fix the validation errors before submitting', {
        position: 'bottom-center',
        autoClose: 3000
      });
      return;
    }

    try {
      console.log(role);
      
      const res = await axios.post('http://localhost:8080/reg', {name, email, mobile, password, role, status},
        {
          withCredentials: true,
        }
      );

      if(res.status === 200)
      {
        navigate('/otp-verify');
      }

    } catch (error) {
      if(error.response)
      {
        if(error.response.status === 400 || error.response.status === 401)
        {
          toast.error(error.response.data.message, {
            position: 'bottom-center',
            autoClose: 3000
          });
        }
        else if(error.response.status === 500)
        {
          toast.error('Something went Wrong! try again later', {
            position: 'bottom-center',
            autoClose: 1500
          });
        }
      }
    }
  }

  // Check if form is valid
  const isFormValid = name && email && mobile && password && 
    Object.values(errors).every(error => error === '');

  return (
    <div>
      <Header/>
      <div className='reg-container'>
        <ToastContainer/>
        <div className="reg-main">
        <form onSubmit={handleSubmit}>
            <div className="reg_form-item">
                <label htmlFor="name">Enter Your Name *</label><br />
                <input 
                  type="text" 
                  id="name"
                  name='name' 
                  placeholder='Enter your Name' 
                  value={name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="reg_form-item">
              <label htmlFor="email">Enter Your Email *</label><br />
                <input 
                  type="email" 
                  id="email"
                  name='email' 
                  placeholder='Enter your Email' 
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="reg_form-item">
              <label htmlFor="mobile">Enter Your Mobile *</label><br />
                <input 
                  type="tel" 
                  id="mobile"
                  pattern='[0-9]{10}' 
                  title='Enter 10 digit mobile number' 
                  name='mobile' 
                  placeholder='Enter your Mobile' 
                  value={mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className={errors.mobile ? 'error' : ''}
                  required
                />
                {errors.mobile && <span className="error-message">{errors.mobile}</span>}
            </div>

            <div className="reg_form-item">
              <label htmlFor="password">Create a Password *</label><br />
                <input 
                  type="password" 
                  id="password"
                  name='password' 
                  placeholder='Create your Password' 
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'error' : ''}
                  required
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <input type="hidden" name='role' value={role} onChange={(e) => setRole(e.target.value)}/>
            <input type="hidden" name='status' value={status} onChange={(e) => setStatus(e.target.value)}/>

            <div className="reg_form-item">
                <button 
                  type='submit' 
                  className={!isFormValid ? 'disabled' : ''}
                  disabled={!isFormValid}
                >
                  Register
                </button>
            </div>
        </form>
        </div>
      </div>
    </div>
  )
}