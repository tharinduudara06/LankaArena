import React, { useState } from 'react'
import Admin_nav from './Admin_nav'
import './styles/addUser.css'
import axios from 'axios'
import {ToastContainer, toast} from 'react-toastify'

export default function AddUser() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [SP_type, setSP_type] = useState('');
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState({});

    // Validation functions
    const validateName = (name) => {
        if (!name.trim()) return 'Name is required';
        if (name.length < 2) return 'Name must be at least 2 characters long';
        if (name.length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
        return '';
    };

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const validateMobile = (mobile) => {
        if (!mobile) return 'Mobile number is required';
        if (mobile.length !== 10) return 'Mobile number must be 10 digits';
        if (!/^\d+$/.test(mobile)) return 'Mobile number can only contain digits';
        return '';
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters long';
        if (password.length > 20) return 'Password must be less than 20 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return '';
    };

    const validateRole = (role) => {
        if (!role) return 'User type is required';
        return '';
    };

    const validateSPType = (SP_type, role) => {
        if (role === 'service_provider' && !SP_type) {
            return 'Service provider type is required';
        }
        return '';
    };

    const validateStatus = (status) => {
        if (!status) return 'Status is required';
        return '';
    };

    const validateForm = () => {
        const newErrors = {
            name: validateName(name),
            email: validateEmail(email),
            mobile: validateMobile(mobile),
            password: validatePassword(password),
            role: validateRole(role),
            SP_type: validateSPType(SP_type, role),
            status: validateStatus(status)
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleInputChange = (setter, field, value) => {
        setter(value);
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            toast.error('Please fix the validation errors', {
                position: 'top-center',
                autoClose: 1500
            });
            return;
        }

        try {
            const res = await axios.post('http://localhost:8080/admin-add-users', {
                name: name.trim(),
                email: email.trim(),
                mobile,
                password,
                role,
                SP_type,
                status
            });

            if (res.status === 200) {
                toast.success(res.data.msg, {
                    position: 'top-center',
                    autoClose: 1500
                });
                
                // Reset form after successful submission
                setName('');
                setEmail('');
                setMobile('');
                setPassword('');
                setRole('');
                setSP_type('');
                setStatus('');
                setErrors({});
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 400 || error.response.status === 401) {
                    toast.error('Account Already Exists!', {
                        position: 'top-center',
                        autoClose: 1500
                    });
                } else if (error.response.status === 500) {
                    toast.error('Something Went Wrong!', {
                        position: 'top-center',
                        autoClose: 1500
                    });
                }
            }
        }
    };

    const toggleConditionalFields = () => {
        const role = document.getElementById('role').value;
        const spTypeField = document.getElementById('spTypeField');
        
        spTypeField.style.display = 'none';
        document.getElementById('sp_type').required = false;
        
        if (role === 'service_provider') {
            spTypeField.style.display = 'block';
            document.getElementById('sp_type').required = true;
        }
    };

    return (
        <div>
            <Admin_nav />

            <div className='add-user-container'>

                <ToastContainer/>

                <div className='pageHeader'>
                    <div>Add New User</div>
                </div>

                <div className='addUser-main'>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group name">
                            <label>Full Name *</label><br />
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={name}
                                onChange={(e) => handleInputChange(setName, 'name', e.target.value)} 
                                required 
                                placeholder="Enter full name" 
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="form-group email">
                            <label>Email *</label><br />
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={email}
                                onChange={(e) => handleInputChange(setEmail, 'email', e.target.value)} 
                                required 
                                placeholder="Enter email address" 
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        <div className="form-group mobile">
                            <label>Mobile *</label><br />
                            <input 
                                type="number" 
                                id="mobile" 
                                name="mobile" 
                                value={mobile}
                                onChange={(e) => handleInputChange(setMobile, 'mobile', e.target.value)} 
                                required 
                                placeholder="Enter mobile number" 
                                className={errors.mobile ? 'error' : ''}
                            />
                            {errors.mobile && <span className="error-message">{errors.mobile}</span>}
                        </div>

                        <div className="form-group password">
                            <label>Password *</label><br />
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={password}
                                onChange={(e) => handleInputChange(setPassword, 'password', e.target.value)} 
                                required 
                                placeholder="Create a password" 
                                className={errors.password ? 'error' : ''}
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group role">
                            <label>User Type *</label><br />
                            <select 
                                id="role" 
                                name="role" 
                                required 
                                value={role} 
                                onChange={(e) => {
                                    setRole(e.target.value); 
                                    handleInputChange(setRole, 'role', e.target.value);
                                    toggleConditionalFields();
                                }}
                                className={errors.role ? 'error' : ''}
                            >
                                <option value="" disabled>Select a role</option>
                                <option value="player">Player</option>
                                <option value="service_provider">Service Provider</option>
                                <option value="operation_manager">Operation Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && <span className="error-message">{errors.role}</span>}
                        </div>

                        <div id="spTypeField" className="conditional-field service">
                            <div className="form-group">
                                <label>Service Provider Type *</label><br />
                                <select 
                                    id="sp_type" 
                                    name="sp_type" 
                                    value={SP_type} 
                                    onChange={(e) => handleInputChange(setSP_type, 'SP_type', e.target.value)}
                                    className={errors.SP_type ? 'error' : ''}
                                >
                                    <option value="" disabled>Select type</option>
                                    <option value="coach">Coach</option>
                                    <option value="referee">Referee</option>
                                    <option value="venue_owner">Venue Owner</option>
                                </select>
                                {errors.SP_type && <span className="error-message">{errors.SP_type}</span>}
                            </div>
                        </div>

                        <div className="form-group status">
                            <label>Status *</label><br />
                            <select 
                                id="status" 
                                name="status" 
                                value={status} 
                                onChange={(e) => handleInputChange(setStatus, 'status', e.target.value)} 
                                required
                                className={errors.status ? 'error' : ''}
                            >
                                <option value="" disabled>Select Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="banned">Banned</option>
                            </select>
                            {errors.status && <span className="error-message">{errors.status}</span>}
                        </div>

                        <div className="form-group ubtn">
                            <button type="submit">Add User</button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}