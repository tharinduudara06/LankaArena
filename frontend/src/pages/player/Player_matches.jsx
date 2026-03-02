import React, { useState, useEffect } from 'react';
import './styles/player_matches.css';
import PlayerSidebar from './PlayerSidebar .jsx';
import Header from './Header.jsx';
import axios from 'axios';

const Player_matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);

  useEffect(() => {
    fetchPlayerMatches();
  }, []);

  const fetchPlayerMatches = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('=== Starting to fetch player matches ===');
      
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
      
      // Step 2: Get player info
      console.log('Step 2: Getting player info...');
      try {
        const playerResponse = await axios.get(`http://localhost:8080/api/player/by-user/${userId}`, {
          withCredentials: true
        });
        
        console.log('Player API response:', playerResponse.data);
        
        if (!playerResponse.data.success) {
          setError('❌ You are not registered as a player in any team.');
          return;
        }
        
        setPlayerInfo(playerResponse.data.player);
        const teamId = playerResponse.data.player.team;
        console.log('✅ Team ID:', teamId);
        
        // Step 3: Fetch matches for this team
        console.log('Step 3: Fetching matches for team...');
        const matchesResponse = await axios.get(`http://localhost:8080/api/player/get-team-matches/${teamId}`, {
          withCredentials: true
        });
        
        console.log('✅ Matches response:', matchesResponse.data);
        
        if (matchesResponse.data.success) {
          setMatches(matchesResponse.data.matches || []);
        } else {
          setError('❌ Failed to fetch matches: ' + matchesResponse.data.message);
        }
        
      } catch (playerError) {
        console.error('❌ Error fetching player info:', playerError);
        if (playerError.response?.status === 404) {
          setError('❌ You are not registered as a player in any team.');
        } else {
          setError('❌ Error fetching player information. Please try again.');
        }
      }
      
    } catch (error) {
      console.error('❌ Error in fetchPlayerMatches:', error);
      setError('❌ An error occurred while fetching matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    // If timeString is already in HH:MM format, return as is
    if (timeString.includes(':')) {
      return timeString;
    }
    // If it's a Date object, format it
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // amber
      case 'accepted':
        return '#10b981'; // emerald
      case 'rejected':
        return '#ef4444'; // red
      case 'completed':
        return '#3b82f6'; // blue
      case 'cancelled':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div>
        <PlayerSidebar />
        <div className="p-mm-player-matches-container">
          
          <div className="p-mm-player-matches-content">
            <div className="p-mm-loading-container">
              <div className="p-mm-loading-spinner"></div>
              <p>Loading your matches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PlayerSidebar />
      <div className="p-mm-player-matches-container">
        
        <div className="p-mm-player-matches-content">
          <div className="p-mm-player-matches-header">
            <h1>My Matches</h1>
            <p>View all matches scheduled by your coach</p>
          </div>

          {error && (
            <div className="p-mm-error-message">
              <div className="p-mm-error-icon">⚠️</div>
              <p>{error}</p>
              <button onClick={fetchPlayerMatches} className="p-mm-retry-button">
                Try Again
              </button>
            </div>
          )}

          {!error && matches.length === 0 && (
            <div className="p-mm-no-matches">
              <div className="p-mm-no-matches-icon">🏆</div>
              <h3>No Matches Scheduled</h3>
              <p>Your coach hasn't scheduled any matches yet. Check back later!</p>
            </div>
          )}

          {!error && matches.length > 0 && (
            <div className="p-mm-matches-grid">
              {matches.map((match) => (
                <div key={match._id} className="p-mm-match-card">
                  <div className="p-mm-match-header">
                    <div className="p-mm-match-teams">
                      <div className="p-mm-team-info">
                        <div className="p-mm-team-logo">
                          {match.myteam?.name?.charAt(0) || 'T'}
                        </div>
                        <div className="p-mm-team-details">
                          <h3>{match.myteam?.name || 'Unknown Team'}</h3>
                          <p>{match.myteam?.sport || 'Unknown Sport'}</p>
                        </div>
                      </div>
                      
                      <div className="p-mm-vs-divider">
                        <span>VS</span>
                      </div>
                      
                      <div className="p-mm-team-info">
                        <div className="p-mm-team-logo">
                          {match.opponent?.name?.charAt(0) || 'O'}
                        </div>
                        <div className="p-mm-team-details">
                          <h3>{match.opponent?.name || 'Unknown Team'}</h3>
                          <p>{match.opponent?.sport || 'Unknown Sport'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-mm-match-status">
                      <span 
                        className="p-mm-status-badge"
                        style={{ backgroundColor: getStatusColor(match.status) }}
                      >
                        {getStatusText(match.status)}
                      </span>
                    </div>
                  </div>

                  <div className="p-mm-match-details">
                    <div className="p-mm-detail-item">
                      <div className="p-mm-detail-icon">📅</div>
                      <div className="p-mm-detail-content">
                        <span className="p-mm-detail-label">Date</span>
                        <span className="p-mm-detail-value">{formatDate(match.matchDate)}</span>
                      </div>
                    </div>
                    
                    <div className="p-mm-detail-item">
                      <div className="p-mm-detail-icon">⏰</div>
                      <div className="p-mm-detail-content">
                        <span className="p-mm-detail-label">Time</span>
                        <span className="p-mm-detail-value">
                          {formatTime(match.startTime)} - {formatTime(match.endTime)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-mm-detail-item">
                      <div className="p-mm-detail-icon">📍</div>
                      <div className="p-mm-detail-content">
                        <span className="p-mm-detail-label">Venue</span>
                        <span className="p-mm-detail-value">
                          {match.ground?.name || 'Unknown Venue'}
                        </span>
                      </div>
                    </div>
                    
                    {match.ground?.location && (
                      <div className="p-mm-detail-item">
                        <div className="p-mm-detail-icon">🏟️</div>
                        <div className="p-mm-detail-content">
                          <span className="p-mm-detail-label">Location</span>
                          <span className="p-mm-detail-value">
                            {match.ground.location.address || 'Unknown Address'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {match.notes && (
                    <div className="p-mm-match-notes">
                      <div className="p-mm-notes-header">
                        <span className="p-mm-notes-icon">📝</span>
                        <span className="p-mm-notes-label">Notes</span>
                      </div>
                      <p className="p-mm-notes-content">{match.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player_matches;
