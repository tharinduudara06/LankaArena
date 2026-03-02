import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Coach_sideBar from './Coach_sideBar'
import './styles/coach_profile.css'
import profile from '../../images/profile.png'
import settings from '../../images/settings.png'
import trophy from '../../images/trophy.png'
import managers from '../../images/managers.png'
import jersey from '../../images/jersey.png'
import calendar from '../../images/calendar.png'
import worker01 from '../../images/worker01.jpg'

export default function Coach_profile() {
  const [coachData, setCoachData] = useState({
    name: '',
    email: '',
    mobile: '',
    profileImage: '',
    certifications: [],
    status: '',
    SP_type: ''
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [teamData, setTeamData] = useState({
    name: '',
    sport: '',
    players: [],
    uniformImage: [],
    won: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  
  const navigate = useNavigate();

  // Helper function to extract filename from path
  const extractFilename = (path) => {
    if (!path) return path;
    if (path.includes('\\')) {
      // Windows path
      return path.split('\\').pop();
    } else if (path.includes('/')) {
      // Unix path
      return path.split('/').pop();
    }
    return path;
  };

  useEffect(() => {
    fetchCoachData();
    fetchTeamData();
  }, []);

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const fetchCoachData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/coach/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          // Handle profile image - extract filename if it's a full path
          const coachData = { ...data.data };
          if (coachData.profileImage) {
            coachData.profileImage = extractFilename(coachData.profileImage);
          }
          
          setCoachData(coachData);
          setEditForm({
            name: coachData.name || '',
            email: coachData.email || '',
            mobile: coachData.mobile || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching coach data:', error);
    }
    setLoading(false);
  };

  const fetchTeamData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/coach/team-data', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          setTeamData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: coachData.name || '',
      email: coachData.email || '',
      mobile: coachData.mobile || ''
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/coach/update-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.data) {
          // Handle profile image - extract filename if it's a full path
          const updatedCoachData = { ...data.data };
          if (updatedCoachData.profileImage) {
            updatedCoachData.profileImage = extractFilename(updatedCoachData.profileImage);
          }
          
          setCoachData(updatedCoachData);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setImageUploading(true);

      console.log('File selected:', file.name);
      console.log('Preview URL created:', previewUrl);

      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await fetch('http://localhost:8080/api/coach/upload-profile-image', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        console.log('Upload response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Upload response data:', data);
          console.log('Full response:', JSON.stringify(data, null, 2));
          
          if (data && data.data && data.data.profileImage) {
            console.log('Raw profile image path from server:', data.data.profileImage);
            
            // Extract just the filename from the path
            const filename = extractFilename(data.data.profileImage);
            console.log('Extracted filename:', filename);
            
            setCoachData(prev => ({
              ...prev,
              profileImage: filename
            }));
            // Clear preview since we now have the server image
            setPreviewImage(null);
          } else {
            console.log('No profile image in response, keeping preview');
            // Keep preview if no server image returned
          }
        } else {
          console.error('Upload failed with status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          // Keep preview on upload failure
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // Keep preview on error
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleCertificationUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('certifications', file);
      });

      try {
        const response = await fetch('http://localhost:8080/api/coach/upload-certifications', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.data) {
            setCoachData(prev => ({
              ...prev,
              certifications: data.data.certifications
            }));
          }
        }
      } catch (error) {
        console.error('Error uploading certifications:', error);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Coach_sideBar />
        <div className="c-p-coach-profile-container">
          <div className="c-p-profile-loading">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Coach_sideBar />
      <div className="c-p-coach-profile-container">
        <div className="c-p-profile-header">
          <div className="c-p-profile-header-content">
            <h1>Coach Profile</h1>
            <p>Manage your personal information and team details</p>
          </div>
        </div>

        <div className="c-p-profile-content">
          {/* Personal Information Section */}
          <div className="c-p-profile-section">
            <div className="c-p-section-header">
              <img src={profile} alt="" />
              <h2>Personal Information</h2>
              <button 
                className="c-p-edit-btn" 
                onClick={isEditing ? handleCancel : handleEdit}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="c-p-profile-info-card">
              <div className="c-p-profile-image-section">
                <div className="c-p-profile-image-container">
                  <img 
                    key={coachData.profileImage || 'default'}
                    src={previewImage || (coachData.profileImage ? `/uploads/${coachData.profileImage}` : worker01)} 
                    alt="Profile" 
                    className="c-p-profile-image"
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.src = worker01;
                    }}
                    onLoad={() => {
                      const currentSrc = previewImage || (coachData.profileImage ? `/uploads/${coachData.profileImage}` : worker01);
                      console.log('Image loaded successfully:', currentSrc);
                      console.log('Image src attribute:', document.querySelector('.c-p-profile-image').src);
                    }}
                  />
                  <div className="c-p-image-overlay">
                    {imageUploading ? (
                      <div className="c-p-upload-loading">
                        <div className="c-p-spinner"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <label htmlFor="profile-image-upload" className="c-p-upload-btn">
                        <img src={settings} alt="" />
                      </label>
                    )}
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <div className="c-p-profile-basic-info">
                  <h3>{coachData.name || 'Coach Name'}</h3>
                  <p className="c-p-coach-type">{coachData.SP_type || 'Coach'}</p>
                  <p className="c-p-status">{coachData.status || 'Active'}</p>
                  
                 
                </div>
              </div>

              <div className="c-p-profile-details">
                <div className="c-p-detail-row">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="c-p-edit-input"
                    />
                  ) : (
                    <span>{coachData.name || 'Not provided'}</span>
                  )}
                </div>

                <div className="c-p-detail-row">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="c-p-edit-input"
                    />
                  ) : (
                    <span>{coachData.email || 'Not provided'}</span>
                  )}
                </div>

                <div className="c-p-detail-row">
                  <label>Mobile Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mobile"
                      value={editForm.mobile}
                      onChange={handleInputChange}
                      className="c-p-edit-input"
                    />
                  ) : (
                    <span>{coachData.mobile || 'Not provided'}</span>
                  )}
                </div>

                {isEditing && (
                  <div className="c-p-save-cancel-buttons">
                    <button className="c-p-save-btn" onClick={handleSave}>
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Information Section */}
          <div className="c-p-profile-section">
            <div className="c-p-section-header">
              <img src={managers} alt="" />
              <h2>Team Information</h2>
            </div>

            <div className="c-p-team-info-card">
              <div className="c-p-team-basic-info">
                <h3>{teamData.name || 'No Team Assigned'}</h3>
                <p className="c-p-team-sport">{teamData.sport || 'Sport'}</p>
              </div>

              <div className="c-p-team-stats">
                <div className="c-p-stat-item">
                  <img src={managers} alt="" />
                  <div>
                    <p>Team Members</p>
                    <span>{teamData.players ? teamData.players.length : 0}</span>
                  </div>
                </div>

                <div className="c-p-stat-item">
                  <img src={trophy} alt="" />
                  <div>
                    <p>Matches Won</p>
                    <span>{teamData.won || 0}</span>
                  </div>
                </div>

                <div className="c-p-stat-item">
                  <img src={jersey} alt="" />
                  <div>
                    <p>Uniforms</p>
                    <span>{teamData.uniformImage ? teamData.uniformImage.length : 0}</span>
                  </div>
                </div>
              </div>

              {teamData.players && teamData.players.length > 0 && (
                <div className="c-p-team-players">
                  <h4>Team Players</h4>
                  <div className="c-p-players-list">
                    {teamData.players.map((player, index) => (
                      <div key={index} className="c-p-player-item">
                        <div className="c-p-player-avatar">
                          <img 
                            src={player.profileImage ? `/uploads/${extractFilename(player.profileImage)}` : worker01} 
                            alt={player.name || `Player ${index + 1}`}
                            onError={(e) => {
                              console.log('Player image failed to load:', e.target.src);
                              e.target.src = worker01;
                            }}
                          />
                        </div>
                        <div className="c-p-player-info">
                          <p>{player.name || `Player ${index + 1}`}</p>
                          <span>{player.email || 'No email'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

         

          {/* Quick Actions */}
          <div className="c-p-profile-section">
            <div className="c-p-section-header">
              <img src={calendar} alt="" />
              <h2>Quick Actions</h2>
            </div>

            <div className="c-p-quick-actions-card">
              <button 
                className="c-p-action-btn"
                onClick={() => navigate('/team-management')}
              >
                <img src={managers} alt="" />
                Manage Team
              </button>

              <button 
                className="c-p-action-btn"
                onClick={() => navigate('/coach-schedule-sessions')}
              >
                <img src={calendar} alt="" />
                Schedule Sessions
              </button>

              <button 
                className="c-p-action-btn"
                onClick={() => navigate('/manage-matches')}
              >
                <img src={trophy} alt="" />
                Manage Matches
              </button>

              <button 
                className="c-p-action-btn"
                onClick={() => navigate('/uniform-order')}
              >
                <img src={jersey} alt="" />
                Order Uniforms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
