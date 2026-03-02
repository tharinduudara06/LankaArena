import React, { useState, useEffect } from 'react';
import './styles/editUser.css';

export default function EditUser({ user, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        role: '',
        SP_type: '',
        status: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                SP_type: user.SP_type,
                status: user.status
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Edit User</h2>

                <label>Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />

                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />

                <label>Mobile:</label>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} />

                <label>Role:</label>
                <input type="text" name="role" value={formData.role} onChange={handleChange} />

                <label>User Type:</label>
                
                <select name="SP_type" id="" value={formData.SP_type} onChange={handleChange}>
                    <option value="coach">Coach</option>
                    <option value="venue_owner">Venue Owner</option>
                    <option value="referee">Referee</option>
                </select>

                <label>Status:</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="banned">Banned</option>
                </select>

                <div className="popup-buttons">
                    <button className="save-btn" onClick={handleSubmit}>Save</button>
                    <button className="close-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
