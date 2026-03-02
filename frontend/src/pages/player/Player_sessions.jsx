import React, { useState, useEffect } from 'react';
import './styles/Player_sessions.css';
import PlayerSidebar from './PlayerSidebar .jsx';
import Header from './Header.jsx';
import axios from 'axios';

const Player_sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('=== Starting to fetch user sessions ===');
      
      // Step 1: Get current user info
      console.log('Step 1: Getting user profile...');
      const userResponse = await axios.get('http://localhost:8080/api/user/profile', {
        withCredentials: true
      });
      
      console.log('✅ User response:', userResponse.data);
      
      if (!userResponse.data.success) {
        setError('❌ User authentication failed. Please log in again.');
        return;
      }
      
      setUserInfo(userResponse.data.user);
      const userId = userResponse.data.user._id;
      console.log('✅ User ID:', userId);
      
      // Step 2: Check if user is a player
      console.log('Step 2: Checking if user is a player...');
      try {
        const playerResponse = await axios.get(`http://localhost:8080/api/player/by-user/${userId}`, {
          withCredentials: true
        });
        
        console.log('Player API response:', playerResponse.data);
        
        if (!playerResponse.data.success) {
          setError('❌ You are not registered as a player in any team.');
          return;
        }
        
        const player = playerResponse.data.player;
        console.log('✅ Player found:', player);
        
        // Step 3: Get team details
        console.log('Step 3: Getting team details...');
        try {
          const teamResponse = await axios.get(`http://localhost:8080/api/player/team/${player.team}`, {
            withCredentials: true
          });
          
          console.log('Team API response:', teamResponse.data);
          
          if (!teamResponse.data.success) {
            setError('❌ Team information not found.');
            return;
          }
          
          const team = teamResponse.data.team;
          console.log('✅ Team found:', team);
          
          // Extract coach ID - it might be an object or string
          const coachId = team.coach._id || team.coach;
          console.log('Team coach ID:', coachId);
          
          // Step 4: Get sessions by coach
          console.log('Step 4: Getting sessions by coach...');
          try {
            const sessionsResponse = await axios.get(`http://localhost:8080/api/player/sessions/by-coach/${coachId}`, {
              withCredentials: true
            });
            
            console.log('Sessions API response:', sessionsResponse.data);
            
            if (sessionsResponse.data.success) {
              const sessions = sessionsResponse.data.schedules;
              console.log('✅ Sessions found:', sessions.length, 'sessions');
              console.log('Sample session data:', sessions[0]);
              setSessions(sessions);
              
              if (sessions.length === 0) {
                setError('📅 No training sessions scheduled by your coach yet.');
              }
            } else {
              setError('❌ No training sessions found for your team.');
            }
          } catch (sessionsErr) {
            console.error('❌ Error fetching sessions:', sessionsErr);
            setError(`❌ Failed to load sessions: ${sessionsErr.response?.data?.message || sessionsErr.message}`);
          }
        } catch (teamErr) {
          console.error('❌ Error fetching team:', teamErr);
          setError(`❌ Failed to load team: ${teamErr.response?.data?.message || teamErr.message}`);
        }
      } catch (playerErr) {
        console.error('❌ Error fetching player:', playerErr);
        setError(`❌ Failed to load player info: ${playerErr.response?.data?.message || playerErr.message}`);
      }
    } catch (err) {
      console.error('❌ General error:', err);
      setError(`❌ Failed to load training sessions: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time not specified';
    const time = new Date(timeString);
    if (isNaN(time.getTime())) return 'Invalid time';
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    
    if (sessionDate < now) {
      return '#6c757d'; // Past - gray
    } else if (sessionStart <= now && now <= sessionEnd) {
      return '#28a745'; // Current - green
    } else {
      return '#007bff'; // Upcoming - blue
    }
  };

  const getStatusText = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    
    if (sessionDate < now) {
      return 'Completed';
    } else if (sessionStart <= now && now <= sessionEnd) {
      return 'In Progress';
    } else {
      return 'Upcoming';
    }
  };

  if (loading) {
    return (
      <div className="p-ps-container">
        <PlayerSidebar />
        <div className="p-ps-main-content">
          <div className="p-ps-loading">
            <div className="p-ps-spinner"></div>
            <p>Loading training sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-ps-container">
      <PlayerSidebar />
      <div className="p-ps-main-content">
        
        
        <div className="p-ps-content">
          <div className="p-ps-header">
            <h1 className="p-ps-title">Training Sessions</h1>
            <p className="p-ps-subtitle">View your team's training sessions scheduled by your coach</p>
          </div>

          {error ? (
            <div className="p-ps-error">
              <div className="p-ps-error-icon">⚠️</div>
              <h3>No Training Sessions Available</h3>
              <p>{error}</p>
              <button 
                className="p-ps-refresh-btn"
                onClick={fetchUserSessions}
              >
                Refresh
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-ps-empty">
              <div className="p-ps-empty-icon">📅</div>
              <h3>No Sessions Scheduled</h3>
              <p>Your coach hasn't scheduled any training sessions yet.</p>
              <button 
                className="p-ps-refresh-btn"
                onClick={fetchUserSessions}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="p-ps-sessions-grid">
              {sessions.map((session) => (
                <div key={session._id} className="p-ps-session-card">
                  <div className="p-ps-session-header">
                    <h3 className="p-ps-session-title">{session.title || 'Untitled Session'}</h3>
                    <span 
                      className="p-ps-session-status"
                      style={{ backgroundColor: getStatusColor(session) }}
                    >
                      {getStatusText(session)}
                    </span>
                  </div>
                  
                  <div className="p-ps-session-details">
                    <div className="p-ps-session-info">
                      <div className="p-ps-info-item">
                        <span className="p-ps-info-label">📅 Date:</span>
                        <span className="p-ps-info-value">{formatDate(session.date)}</span>
                      </div>
                      
                      <div className="p-ps-info-item">
                        <span className="p-ps-info-label">🕐 Time:</span>
                        <span className="p-ps-info-value">
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </span>
                      </div>
                      
                      {session.venueid && (
                        <div className="p-ps-info-item">
                          <span className="p-ps-info-label">📍 Venue:</span>
                          <span className="p-ps-info-value">
                            {typeof session.venueid === 'object' 
                              ? `${session.venueid.name} - ${session.venueid.location.address},${session.venueid.location.city}`
                              : `Venue ID: ${session.venueid}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {session.notes && typeof session.notes === 'string' && (
                      <div className="p-ps-session-notes">
                        <h4>Notes:</h4>
                        <p>{session.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player_sessions;
