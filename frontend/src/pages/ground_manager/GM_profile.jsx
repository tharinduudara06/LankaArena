import React, { useState, useEffect } from 'react';
import Ground_manager_sideBar from './Ground_manager_sideBar';
import './styles/GM_profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faEdit, 
  faSave, 
  faTimes,
  faBuilding,
  faChartLine,
  faMoneyBillWave,
  faTools,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

export default function GM_profile() {
  const [profileData, setProfileData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    mobile: 'Loading...',
    status: 'Loading...',
    profileImage: '',
    certifications: [],
    createdAt: '',
    totalGrounds: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalMaintenance: 0,
    rating: 4.5
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // For testing, let's set some default data first
    setProfileData(prev => ({
      ...prev,
      name: 'John Doe',
      email: 'john.doe@example.com',
      mobile: '+94 77 123 4567',
      status: 'Active',
      totalGrounds: 3,
      totalBookings: 25,
      totalRevenue: 150000,
      totalMaintenance: 8
    }));
    
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      console.log('Fetching profile data...');
      const response = await axios.get('http://localhost:8080/api/ground-manager/profile', {
        withCredentials: true
      });
      
      console.log('Profile response:', response.data);
      
      if (response.status === 200) {
        const data = response.data.data || response.data;
        console.log('Profile data set:', data);
        setProfileData(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        navigate('/log');
      } else {
        toast.error('Failed to load profile data');
        // Set some default data for testing
        setProfileData(prev => ({
          ...prev,
          name: 'Ground Manager',
          email: 'manager@example.com',
          mobile: 'Not provided',
          status: 'Active',
          totalGrounds: 0,
          totalBookings: 0,
          totalRevenue: 0,
          totalMaintenance: 0
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('mobile', profileData.mobile);
      
      if (document.getElementById('profileImage').files[0]) {
        formData.append('profileImage', document.getElementById('profileImage').files[0]);
      }

      const response = await axios.put('http://localhost:8080/api/ground-manager/profile', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Refresh profile data
        fetchProfileData();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        navigate('/log');
      } else {
        toast.error('Failed to update profile');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfileData(); // Reset to original data
  };

  if (loading) {
    return (
      <div className="gm-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="gm-profile-container">
      <Ground_manager_sideBar />
      <ToastContainer />
      
      <div className="gm-profile-content">
        <div className="gm-profile-header">
          <h1>My Profile</h1>
          <p>Manage your ground manager profile information</p>
        </div>

        <div className="gm-profile-main">
          {/* Profile Card */}
          <div className="gm-profile-card">
            <div className="gm-profile-image-section">
              <div className="gm-profile-image-container">
                {profileData.profileImage ? (
                  <img 
                    src={profileData.profileImage.startsWith('http') 
                      ? profileData.profileImage 
                      : `/uploads/${profileData.profileImage}`} 
                    alt="Profile" 
                    className="gm-profile-image"
                  />
                ) : (
                  <div className="gm-profile-image-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
                {isEditing && (
                  <label htmlFor="profileImage" className="gm-profile-image-edit">
                    <FontAwesomeIcon icon={faEdit} />
                  </label>
                )}
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="gm-profile-basic-info">
                <h2>{profileData.name || 'Ground Manager'}</h2>
                <p className="gm-profile-role">Ground Manager</p>
                <div className="gm-profile-rating">
                  <FontAwesomeIcon icon={faStar} />
                  <span>{profileData.rating || '4.5'}</span>
                </div>
              </div>
            </div>

            <div className="gm-profile-actions">
              {!isEditing ? (
                <button 
                  className="gm-profile-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Profile
                </button>
              ) : (
                <div className="gm-profile-edit-actions">
                  <button 
                    className="gm-profile-save-btn"
                    onClick={handleSave}
                  >
                    <FontAwesomeIcon icon={faSave} />
                    Save
                  </button>
                  <button 
                    className="gm-profile-cancel-btn"
                    onClick={handleCancel}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="gm-profile-details">
            <div className="gm-profile-section">
              <h3>Personal Information</h3>
              <div className="gm-profile-form">
                <div className="gm-profile-field">
                  <label>
                    <FontAwesomeIcon icon={faUser} />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p>{profileData.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="gm-profile-field">
                  <label>
                    <FontAwesomeIcon icon={faEnvelope} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p>{profileData.email || 'Not provided'}</p>
                  )}
                </div>

                <div className="gm-profile-field">
                  <label>
                    <FontAwesomeIcon icon={faPhone} />
                    Mobile Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mobile"
                      value={profileData.mobile}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                    />
                  ) : (
                    <p>{profileData.mobile || 'Not provided'}</p>
                  )}
                </div>


                <div className="gm-profile-field">
                  <label>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Join Date
                  </label>
                  <p>{profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Not available'}</p>
                </div>

                <div className="gm-profile-field">
                  <label>
                    <FontAwesomeIcon icon={faUser} />
                    Status
                  </label>
                  <p className={`gm-status ${profileData.status?.toLowerCase()}`}>
                    {profileData.status || 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="gm-profile-stats">
              <h3>Your Statistics</h3>
              <div className="gm-stats-grid">
                <div className="gm-stat-card">
                  <div className="gm-stat-icon">
                    <FontAwesomeIcon icon={faBuilding} />
                  </div>
                  <div className="gm-stat-content">
                    <h4>{profileData.totalGrounds}</h4>
                    <p>Total Grounds</p>
                  </div>
                </div>

                <div className="gm-stat-card">
                  <div className="gm-stat-icon">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  <div className="gm-stat-content">
                    <h4>{profileData.totalBookings}</h4>
                    <p>Total Bookings</p>
                  </div>
                </div>

                <div className="gm-stat-card">
                  <div className="gm-stat-icon">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                  </div>
                  <div className="gm-stat-content">
                    <h4>LKR {profileData.totalRevenue?.toLocaleString() || '0'}</h4>
                    <p>Total Revenue</p>
                  </div>
                </div>

                <div className="gm-stat-card">
                  <div className="gm-stat-icon">
                    <FontAwesomeIcon icon={faTools} />
                  </div>
                  <div className="gm-stat-content">
                    <h4>{profileData.totalMaintenance}</h4>
                    <p>Maintenance Tasks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
