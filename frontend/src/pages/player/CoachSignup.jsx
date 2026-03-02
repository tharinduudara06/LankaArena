import React, { useState } from 'react'
import Header from './Header'
import './styles/coach-signup.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function CoachSignup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: ''
    });
    const [files, setFiles] = useState([]);
    const [fileNames, setFileNames] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Enhanced validation functions
    const validateName = (name) => {
        if (!name.trim()) return 'Name is required';
        if (name.length < 7) return 'Name must be at least 7 characters long';
        if (!/^[a-zA-Z\s]{7,50}$/.test(name)) return 'Name must be 7-50 letters and spaces only';
        return '';
    };

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) return 'Must be a valid Gmail address (@gmail.com)';
        return '';
    };

    const validateMobile = (mobile) => {
        if (!mobile) return 'Mobile number is required';
        if (!/^[0-9]{10}$/.test(mobile)) return 'Mobile number must be exactly 10 digits';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(password)) return 'Must contain a lowercase letter';
        if (!/(?=.*[A-Z])/.test(password)) return 'Must contain an uppercase letter';
        if (!/(?=.*\d)/.test(password)) return 'Must contain a number';
        if (!/(?=.*[@$!%*?&])/.test(password)) return 'Must contain a special character (@$!%*?&)';
        return '';
    };

    const validateFiles = (files) => {
        if (files.length === 0) return 'At least one certification file is required';
        if (files.length > 5) return 'Maximum 5 files allowed';
        
        for (let file of files) {
            if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB';
            if (!['.pdf', '.png', '.jpg', '.jpeg'].includes(file.name.toLowerCase().slice(-4))) {
                return 'Only PDF, PNG, JPG, JPEG files are allowed';
            }
        }
        return '';
    };

    const validateForm = () => {
        const newErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            mobile: validateMobile(formData.mobile),
            password: validatePassword(formData.password),
            files: validateFiles(files)
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    // Real-time validation on input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate field in real-time
        let error = '';
        switch (name) {
            case 'name':
                error = validateName(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'mobile':
                error = validateMobile(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const fileError = validateFiles(selectedFiles);
        
        setErrors(prev => ({
            ...prev,
            files: fileError
        }));

        if (!fileError) {
            setFiles(selectedFiles);
            setFileNames(selectedFiles.map(file => file.name));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors before submitting', {
                position: 'bottom-center',
                autoClose: 3000
            });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('mobile', formData.mobile);
            data.append('password', formData.password);
            
            files.forEach(file => {
                data.append('certifications', file);
            });

            const response = await axios.post('http://localhost:8080/coach-reg', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                toast.success('Registration successful! Please check your email for verification.', {
                    position: 'bottom-center',
                    autoClose: 5000
                });
                
                // Reset form
                setFormData({ name: '', email: '', mobile: '', password: '' });
                setFiles([]);
                setFileNames([]);
                setErrors({});
                document.getElementById('certification').value = '';
            }

        } catch (error) {
            console.error('Registration error:', error);
            if (error.response?.status === 400) {
                toast.error('Account already exists. Please login.', {
                    position: 'bottom-center',
                    autoClose: 5000
                });
            } else {
                toast.error(error.response?.data?.message || 'Network error. Please try again.', {
                    position: 'bottom-center',
                    autoClose: 5000
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    // Check if form is valid for button state
    const isFormValid = formData.name && formData.email && formData.mobile && 
                      formData.password && files.length > 0 && 
                      Object.values(errors).every(error => error === '');

    return (
        <div>
            
            <Header/>
            <div className="coach-signup-container">
                <ToastContainer />
                <div className="coach-signup-main">
                    
                    
                    <form encType='multipart/form-data' onSubmit={handleSubmit}>
                        <div className="cform-item">
                            <label htmlFor="name">Enter your Name *</label><br />
                            <input 
                                type="text" 
                                name='name' 
                                placeholder='Enter your full name (min. 7 characters)' 
                                value={formData.name}
                                onChange={handleInputChange}
                                className={errors.name ? 'error' : ''}
                                required
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="cform-item">
                            <label htmlFor="email">Enter your Email *</label><br />
                            <input 
                                type="email" 
                                name='email' 
                                placeholder='Enter your Gmail address' 
                                value={formData.email}
                                onChange={handleInputChange}
                                className={errors.email ? 'error' : ''}
                                required
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="cform-item">
                            <label htmlFor="mobile">Enter your Mobile *</label><br />
                            <input 
                                type="text" 
                                name='mobile' 
                                placeholder='Enter 10-digit mobile number' 
                                value={formData.mobile}
                                onChange={handleInputChange}
                                className={errors.mobile ? 'error' : ''}
                                maxLength="10"
                                required
                            />
                            {errors.mobile && <span className="error-message">{errors.mobile}</span>}
                        </div>

                        <div className="cform-item">
                            <label htmlFor="password">Create a Password *</label><br />
                            <input 
                                type="password" 
                                name='password' 
                                placeholder='Create a strong password' 
                                value={formData.password}
                                onChange={handleInputChange}
                                className={errors.password ? 'error' : ''}
                                required
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="cform-item">
                            <label htmlFor="certification">Upload your certifications *</label><br />
                            <label className={`file-input-area ${errors.files ? 'error' : ''} ${fileNames.length > 0 ? 'has-files' : ''}`} htmlFor="certification">
                                <FontAwesomeIcon icon={faCloudArrowUp} size='2xl' />
                                <p>{fileNames.length > 0 ? `${fileNames.length} file(s) selected: ${fileNames.join(", ")}` : "Click to Upload Certifications (PDF, PNG, JPG, JPEG - Max 5 files)"}</p>
                            </label>
                            <input 
                                className='file-input' 
                                type="file" 
                                id='certification' 
                                accept='.pdf,.png,.jpg,.jpeg' 
                                name='certification' 
                                multiple 
                                onChange={handleFileChange}
                            />
                            {errors.files && <span className="error-message">{errors.files}</span>}
                        </div>

                        <div className="cform-item">
                            <button 
                                type='submit' 
                                className={!isFormValid || isSubmitting ? 'disabled' : ''}
                                disabled={!isFormValid || isSubmitting}
                            >
                                {isSubmitting ? 'Registering...' : 'Register as Coach'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}