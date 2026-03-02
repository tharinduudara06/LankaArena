import React, { useEffect, useState } from 'react'
import './styles/gm_edit_venue.css'

export default function GM_EditVenue({ ground, onClose, onSave }) { // FIXED PROPS DESTRUCTURING

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        photo: null
    });

    useEffect(() => {
        if(ground) {
            setFormData({
                name: ground.name || '',
                price: ground.price || '',
                photo: null
            });
        }
    }, [ground]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'photo') {
            setFormData({
                ...formData,
                photo: files[0] // Store the file object
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create FormData for file upload
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('price', formData.price);
        
        if (formData.photo) {
            submitData.append('photo', formData.photo);
        }

        onSave(submitData);
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <div className="gm-edit-venue-container">
            <div className='gm-edit-venue-overlay' onClick={handleCancel}></div>
            <div className='gm-edit-venue-main'>
                <div className="gm-edit-venue-header">
                    <h2 className="gm-edit-venue-title">Edit Ground Details</h2>
                    <p className="gm-edit-venue-subtitle">Update your ground information</p>
                </div>
                
                <form encType='multipart/form-data' onSubmit={handleSubmit} className="gm-edit-venue-form">
                    <div className="gm-edit-venue-form-group">
                        <label className="gm-edit-venue-label">Ground Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="gm-edit-venue-input"
                            placeholder="Enter ground name"
                            required 
                        />
                    </div>

                    <div className="gm-edit-venue-form-group">
                        <label className="gm-edit-venue-label">Ground Price (LKR/Hour)</label>
                        <input 
                            type="number" 
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="gm-edit-venue-input"
                            placeholder="Enter price per hour"
                            min="0"
                            step="0.01"
                            required 
                        />
                    </div>

                    <div className="gm-edit-venue-form-group">
                        <label className="gm-edit-venue-label">Ground Image (Optional)</label>
                        <div className="gm-edit-venue-file-upload">
                            <input 
                                type="file" 
                                name="photo"
                                accept="image/*"
                                onChange={handleChange}
                                className="gm-edit-venue-file-input"
                                id="venue-photo"
                            />
                            <label htmlFor="venue-photo" className="gm-edit-venue-file-label">
                                <span className="gm-edit-venue-file-icon">📷</span>
                                <span className="gm-edit-venue-file-text">
                                    {formData.photo ? formData.photo.name : 'Choose new image'}
                                </span>
                            </label>
                        </div>
                        
                        {ground.photo && ground.photo.filename && (
                            <div className="gm-edit-venue-current-image">
                                <p className="gm-edit-venue-current-text">Current Image</p>
                                <div className="gm-edit-venue-image-preview">
                                    <img 
                                        src={`/uploads/${ground.photo.filename}`} 
                                        alt="Current ground" 
                                        className="gm-edit-venue-preview-img"
                                    />
                                    <span className="gm-edit-venue-filename">{ground.photo.filename}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="gm-edit-venue-form-buttons">
                        <button type="submit" className="gm-edit-venue-update-btn">
                            <span className="gm-edit-venue-btn-icon">✓</span>
                            Update Ground
                        </button>
                        <button type="button" onClick={handleCancel} className="gm-edit-venue-cancel-btn">
                            <span className="gm-edit-venue-btn-icon">✕</span>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}