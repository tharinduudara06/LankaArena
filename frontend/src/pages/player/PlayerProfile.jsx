import React, { useEffect,useState } from 'react';
import './styles/player_profile.css';
import PlayerSidebar from './PlayerSidebar ';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRunning,faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {ToastContainer, toast} from 'react-toastify';


const PlayerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/player/get-profile',
                    {withCredentials:true}
                )

                if(res.status === 200)
                {
                    console.log('Profile data:', res.data);
                    setProfile(res.data);
                    setFormData(res.data.data || {});
                }

            } catch (error) {
                console.error('Error fetching profile:', error);
                
                if(error.response)
                {
                    console.error('Error response:', error.response);
                    if(error.response.status === 400)
                    {
                        navigate('/log');
                    }
                    if(error.response.status === 500)
                    {
                        console.error("Server error:", error.response.data);
                    }
                }
            }
        }

        fetchProfile();
    },[]);

    const handleEditClick = (section) => {
        setEditingSection(section);
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
        // setFormData(profile.data || {});
        // setPhotoFile(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            // Create preview URL for the image
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    profileImagePreview: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePersonalDetails = async () => {
        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile
            };

            const res = await axios.put('http://localhost:8080/api/player/update-profile/personal', 
                updateData,
                { withCredentials: true }
            );

            if (res.status === 200) {
                setProfile(prev => ({
                    ...prev,
                    data: { ...prev.data, ...updateData }
                }));
                setEditingSection(null);
                toast.success('Personal details updated successfully!',{autoClose:1500});
            }
        } catch (error) {
            if(error.response)
            {
                if(error.response.status === 400)
                {
                    toast.error(error.response.data.message,{autoClose:1500});
                }

                else if(error.response.status === 500)
                {
                    toast.error("Server error. Please try again later.",{autoClose:1500});
                }
                else if(error.response.status === 409)
                {
                    toast.error(error.response.data.message,{autoClose:1500});
                }
            }
        }
    };

const handleSavePlayerDetails = async () => {

    if (!validatePlayerDetails()) {
        toast.error('Please fix validation errors before saving', {autoClose:1500});
        return;
    }

        try {
            const updateData = {
                age: formData.age,
                height: formData.height,
                weight: formData.weight
            };

            const res = await axios.put('http://localhost:8080/api/player/update-profile/player',
                updateData,
                { withCredentials: true }
            );

            if (res.status === 200) {
                setProfile(prev => ({
                    ...prev,
                    data: { ...prev.data, ...updateData }
                }));
                setEditingSection(null);
                toast.success('Player details updated successfully!',{autoClose:1500});
            }
        } catch (error) {
            if(error.response)
            {
                if(error.response.status === 400)
                {
                    toast.error(error.response.data.message,{autoClose:1500});
                }
                else if(error.response.status === 404)
                {
                    toast.error(error.response.data.message,{autoClose:1500});
                }
                else if(error.response.status === 500)
                {
                    toast.error("Server error. Please try again later.",{autoClose:1500});
                }
            }
        }
    };

    const handleSavePhoto = async () => {
        if (!photoFile) return;

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('profileImage', photoFile);

            const res = await axios.put('http://localhost:8080/api/player/update-profile/photo',
                formDataToSend,
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (res.status === 200) {
                setProfile(prev => ({
                    ...prev,
                    data: { ...prev.data, profileImage: res.data.profileImage }
                }));
                setEditingSection(null);
                setPhotoFile(null);
                toast.success('Profile photo updated successfully!',{autoClose:1500});
            }
        } catch (error) {
            if(error.response)
            {
                if(error.response.status === 400)
                {
                    toast.error(error.response.data.message,{autoClose:1500});
                }

                else if(error.response.status === 404)
                {
                    toast.error(error.response.data.message,{autoClose:1500});
                }

                else if(error.response.status === 500)
                {
                    toast.error("Server error. Please try again later.",{autoClose:1500});
            }
        }
    };
}

    if(profile === null)
    {
        return <div className="pl-p-loading">Loading...</div>;
    }

    const hasPlayerProfile = profile.hasPlayerProfile;
    const profileData = profile.data;

    const validateAge = (age) => {
    const ageNum = parseInt(age);
    return ageNum >= 16 && ageNum <= 50;
};

const validateHeight = (height) => {
    const heightNum = parseFloat(height);
    return heightNum >= 140 && heightNum <= 220;
};

const validateWeight = (weight) => {
    const weightNum = parseFloat(weight);
    return weightNum >= 40 && weightNum <= 120;
};

const validatePlayerDetails = () => {
    if (!formData.age || !formData.height || !formData.weight) {
        return false;
    }
    return validateAge(formData.age) && 
           validateHeight(formData.height) && 
           validateWeight(formData.weight);
};

const handleAccountDeletion = async () => {

    if (!window.confirm("Are you sure you want to delete your account?")) {
        return;
    }

    try {
        
        const res = await axios.delete('http://localhost:8080/api/player/delete-account',
            { withCredentials: true }
        );

        if(res.status === 200)
        {
            toast.success('Account deleted successfully!',{autoClose:1500});
            setTimeout(() => {
                navigate('/log');
            }, 1590);
        }

    } catch (error) {
        if(error.response)
        {
            if(error.response.status === 400)
            {
                navigate('/log');
            }
            else if(error.response.status === 500)
            {
                toast.error("Server error. Please try again later.",{autoClose:1500});
            }
            else if(error.response.status === 404)
            {
                toast.error(error.response.data.message,{autoClose:1500});
            }
        }
    }

}

    return (
        <div className="pl-p-body">
        
        <PlayerSidebar/>

        <ToastContainer/>

            {/* Main Content */}
            <div className="pl-p-main-content">
                <div className="pl-p-profile-header">
                    <h1 className="pl-p-profile-title">Player Profile</h1>
                    <button
                    onClick={handleAccountDeletion}
                    >
                        <FontAwesomeIcon icon={faTrash}/> delete account
                    </button>
                </div>
                
                <div className="pl-p-profile-container">
                    
                    <div className="pl-p-profile-card">
                        <div className="pl-p-card-header">
                            <div className="pl-p-card-icon">
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                            <h2 className="pl-p-card-title">Personal Details</h2>
                        </div>
                        
                        <div className="pl-p-profile-picture-section">
                            <img src={formData.profileImagePreview || 
                                (profileData.profileImage ? `/uploads/${profileData.profileImage}` : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80")}  
                                className="pl-p-profile-picture" 
                            />
                            {editingSection === 'photo' ? (
                                <div className="pl-p-photo-edit-controls">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handlePhotoChange}
                                        className="pl-p-file-input"
                                    />
                                    <button 
                                        type="button" 
                                        className="pl-p-save-btn"
                                        onClick={handleSavePhoto}
                                        disabled={!photoFile}
                                    >
                                        Save Photo
                                    </button>
                                    <button 
                                        type="button" 
                                        className="pl-p-cancel-btn"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="pl-p-change-photo-btn"
                                    onClick={() => handleEditClick('photo')}
                                >
                                    Change Photo
                                </button>
                            )}
                        </div>
                        
                        <form>
                            <div className="pl-p-form-group">
                                <label className="pl-p-form-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="pl-p-form-input" 
                                    name="name"
                                    value={formData.name || ''} 
                                    readOnly={editingSection !== 'personal'}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className="pl-p-form-group">
                                <label className="pl-p-form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="pl-p-form-input" 
                                    name="email"
                                    value={formData.email || ''} 
                                    readOnly={editingSection !== 'personal'}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            <div className="pl-p-form-group">
                                <label className="pl-p-form-label">Mobile Number</label>
                                <input 
                                    type="tel" 
                                    className="pl-p-form-input" 
                                    name="mobile"
                                    value={formData.mobile || ''} 
                                    readOnly={editingSection !== 'personal'}
                                    onChange={handleInputChange}
                                />
                            </div>
                            
                            {editingSection === 'personal' ? (
                                <div className="pl-p-edit-controls">
                                    <button 
                                        type="button" 
                                        className="pl-p-save-btn"
                                        onClick={handleSavePersonalDetails}
                                    >
                                        Save Personal Details
                                    </button>
                                    <button 
                                        type="button" 
                                        className="pl-p-cancel-btn"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button" 
                                    className="pl-p-save-btn"
                                    onClick={() => handleEditClick('personal')}
                                >
                                    Edit Personal Details
                                </button>
                            )}
                        </form>
                    </div>
                    
                    {/* Player Details Section */}
                    <div className="pl-p-profile-card">
                        
                        <div className="pl-p-card-header">
                            <div className="pl-p-card-icon">
                                <FontAwesomeIcon icon={faRunning} />
                            </div>
                            <h2 className="pl-p-card-title">Player Details</h2>
                        </div>

                        {hasPlayerProfile ? (
                            <form>
                                <div className="pl-p-form-row">
                                    <div className="pl-p-form-group">
                                        <label className="pl-p-form-label">Age</label>
                                        <input 
                                            type="number" 
                                            className="pl-p-form-input" 
                                            name="age"
                                            value={formData.age || ''} 
                                            readOnly={editingSection !== 'player'}
                                            onChange={handleInputChange}
                                            min="16"
                                            max="50"
                                            step="1"
                                        />
                                        {editingSection === 'player' && (
                                            <div className="pl-p-validation-message">
                                                Age must be between 16 and 50 years
                                            </div>
                                            )}
                                    </div>
                                    
                                    <div className="pl-p-form-group">
                                        <label className="pl-p-form-label">Team Name</label>
                                        <input 
                                            type="text" 
                                            className="pl-p-form-input" 
                                            value={profileData.teamName} 
                                            readOnly 
                                        />
                                    </div>
                                </div>
                                
                                <div className="pl-p-form-row">
                                    <div className="pl-p-form-group">
                                        <label className="pl-p-form-label">Height (cm)</label>
                                        <input 
                                            type="number" 
                                            className="pl-p-form-input" 
                                            name="height"
                                            value={formData.height || ''} 
                                            readOnly={editingSection !== 'player'}
                                            onChange={handleInputChange}
                                            min="140"
                                            max="220"
                                            step="0.1"
                                        />
                                        {editingSection === 'player' && (
                                            <div className="pl-p-validation-message">
                                                Height must be between 140cm and 220cm
                                            </div>
                                            )}
                                    </div>
                                    
                                    <div className="pl-p-form-group">
                                        <label className="pl-p-form-label">Weight (kg)</label>
                                        <input 
                                            type="number" 
                                            className="pl-p-form-input" 
                                            name="weight"
                                            value={formData.weight || ''} 
                                            readOnly={editingSection !== 'player'}
                                            onChange={handleInputChange}
                                            min="40"
                                            max="120"
                                            step="0.1"
                                        />

                                        {editingSection === 'player' && (
                                                <div className="pl-p-validation-message">
                                                    Weight must be between 40kg and 120kg
                                                </div>
                                            )}
                                        
                                    </div>
                                </div>
                                
                                <div className="pl-p-form-group">
                                    <label className="pl-p-form-label">Position</label>
                                    <input 
                                        type="text" 
                                        className="pl-p-form-input" 
                                        value={profileData.position} 
                                        readOnly 
                                    />
                                </div>
                                
                                {editingSection === 'player' ? (
                                    <div className="pl-p-edit-controls">
                                        <button 
                                            type="button" 
                                            className="pl-p-save-btn"
                                            onClick={handleSavePlayerDetails}
                                            disabled={!validatePlayerDetails()}
                                        >
                                            Save Player Details
                                        </button>
                                        <button 
                                            type="button" 
                                            className="pl-p-cancel-btn"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                        {!validatePlayerDetails() && (
                                        <div className="pl-p-error-message">
                                            Please fix validation errors before saving
                                        </div>
                                    )}
                                    </div>
                                ) : (
                                    <button 
                                        type="button" 
                                        className="pl-p-save-btn"
                                        onClick={() => handleEditClick('player')}
                                    >
                                        Edit Player Details
                                    </button>
                                )}
                            </form>
                        ) : (
                            <div className="pl-p-profile-incomplete">
                                <div className="pl-p-incomplete-message">
                                <i className="fas fa-exclamation-triangle"></i>
                                <h3>You are still not in a team</h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default PlayerProfile;