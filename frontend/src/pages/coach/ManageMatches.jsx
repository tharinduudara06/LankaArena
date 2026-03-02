import React, { useState, useEffect } from 'react';
import './styles/ManageMatches.css';
import { Link } from 'react-router-dom';
import Coach_sideBar from './Coach_sideBar';

export default function ManageMatches() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [opponent, setOpponent] = useState('');
  const [opponentTeamId, setOpponentTeamId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for form data
  const [formData, setFormData] = useState({
    matchDate: '',
    startTime: '',
    endTime: '',
    ground: '',
    notes: ''
  });

  // State for selected time slot
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // State for API data
  const [teams, setTeams] = useState([]);
  const [bookedGrounds, setBookedGrounds] = useState([]);
  const [suggestedOpponents, setSuggestedOpponents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  // Base URL for API calls
  const API_BASE_URL = 'http://localhost:8080/api/coach';

  // Fetch coach's teams
  const fetchTeams = async () => {
    try {
      console.log('Fetching teams...');
      const response = await fetch(`${API_BASE_URL}/get-team`, {
        credentials: 'include'
      });
      console.log('Teams response status:', response.status);
      const data = await response.json();
      console.log('Teams response:', data);
      if (response.ok) {
        console.log('Teams response data:', data);
        setTeams(data.data || []);
        console.log('Teams set:', data.data);
        if (!data.data || data.data.length === 0) {
          setError('No teams found. Please create a team first.');
        }
      } else {
        console.log('Teams fetch failed:', data);
        setError(data.message || 'Failed to fetch teams');
      }
    } catch (err) {
      setError('Error fetching teams: ' + err.message);
      console.error('Error fetching teams:', err);
    }
  };

  // Fetch coach's booked grounds
  const fetchBookedGrounds = async () => {
    try {
      console.log('Fetching booked grounds...');
      const response = await fetch(`${API_BASE_URL}/get-booked-grounds`, {
        credentials: 'include'
      });
      console.log('Booked grounds response status:', response.status);
      const data = await response.json();
      console.log('Booked grounds response:', data);
      if (response.ok) {
        console.log('Booked grounds response data:', data);
        setBookedGrounds(data.data || []);
        console.log('Booked grounds set:', data.data);
        
        // Extract unique dates from booked grounds
        if (data.data && data.data.length > 0) {
          const dates = data.data
            .map(booking => {
              // Convert date to YYYY-MM-DD format for date input
              const date = new Date(booking.date);
              return date.toISOString().split('T')[0];
            })
            .filter((date, index, self) => self.indexOf(date) === index) // Remove duplicates
            .sort(); // Sort dates
          setAvailableDates(dates);
          console.log('Available dates set:', dates);
        } else {
          setAvailableDates([]);
          setError('No booked grounds found. Please book a ground first.');
        }
      } else {
        console.log('Booked grounds fetch failed:', data);
        setError(data.message || 'Failed to fetch booked grounds');
      }
    } catch (err) {
      setError('Error fetching booked grounds: ' + err.message);
      console.error('Error fetching booked grounds:', err);
    }
  };

  // Fetch suggested opponents based on selected team
  const fetchSuggestedOpponents = async (teamId) => {
    if (!teamId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/get-suggested-opponents/${teamId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setSuggestedOpponents(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch suggested opponents');
      }
    } catch (err) {
      setError('Error fetching suggested opponents');
      console.error('Error fetching suggested opponents:', err);
    }
  };

  // Search teams by name
  const searchTeams = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/search-teams?searchTerm=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.data || []);
      } else {
        setError(data.message || 'Failed to search teams');
      }
    } catch (err) {
      setError('Error searching teams');
      console.error('Error searching teams:', err);
    }
  };

  // Fetch coach's matches
  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-matches`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Matches data received:', data.data);
        setMatches(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch matches');
      }
    } catch (err) {
      setError('Error fetching matches');
      console.error('Error fetching matches:', err);
    }
  };

  // Fetch match requests for coach's teams
  const fetchMatchRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-match-requests`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Match requests data received:', data.data);
        setMatchRequests(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch match requests');
      }
    } catch (err) {
      setError('Error fetching match requests');
      console.error('Error fetching match requests:', err);
    }
  };


  // Accept a match request
  const acceptMatchRequest = async (matchId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/accept-match-request/${matchId}`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Match request accepted successfully!');
        // Refresh match requests and matches
        fetchMatchRequests();
        fetchMatches();
      } else {
        setError(data.message || 'Failed to accept match request');
      }
    } catch (err) {
      setError('Error accepting match request');
      console.error('Error accepting match request:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reject a match request
  const rejectMatchRequest = async (matchId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reject-match-request/${matchId}`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Match request rejected successfully!');
        // Refresh match requests
        fetchMatchRequests();
      } else {
        setError(data.message || 'Failed to reject match request');
      }
    } catch (err) {
      setError('Error rejecting match request');
      console.error('Error rejecting match request:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancel a match
  const cancelMatch = async (matchId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cancel-match/${matchId}`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Match cancelled successfully!');
        // Refresh matches and match requests
        fetchMatches();
        fetchMatchRequests();
      } else {
        setError(data.message || 'Failed to cancel match');
      }
    } catch (err) {
      setError('Error cancelling match');
      console.error('Error cancelling match:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/user/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Auth check:', data);
      if (!response.ok || !data.success) {
        setError('Please log in to access this page');
        return false;
      }
      if (data.user.role !== 'service_provider' || data.user.SP_type !== 'coach') {
        setError('Access denied. This page is only for coaches.');
        return false;
      }
      return true;
    } catch (err) {
      setError('Authentication error: ' + err.message);
      return false;
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log('Component mounted, checking auth...');
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        console.log('User authenticated, fetching data...');
        fetchTeams();
        fetchBookedGrounds();
        fetchMatches();
        fetchMatchRequests();
      }
    };
    loadData();
  }, []);

  // Handle team selection
  const handleTeamSelect = (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);
    setShowSuggestions(!!teamId);
    if (teamId) {
      fetchSuggestedOpponents(teamId);
    } else {
      setSuggestedOpponents([]);
    }
  };

  // Handle opponent search
  const handleOpponentSearch = (e) => {
    const value = e.target.value;
    setOpponent(value);
    setSearchTerm(value);
    if (value.trim()) {
      searchTeams(value);
    } else {
      setSearchResults([]);
    }
  };

  // Select opponent from suggestions
  const selectOpponent = (team) => {
    setOpponent(team.name);
    setOpponentTeamId(team._id);
    setShowSuggestions(false);
    setSearchResults([]);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If date changes, clear ground and time selections
    if (name === 'matchDate') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ground: '', // Clear ground selection when date changes
        startTime: '', // Clear time selections
        endTime: ''
      }));
      setSelectedTimeSlot(''); // Clear time slot selection
    } 
    // If ground changes, clear time selections
    else if (name === 'ground') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        startTime: '', // Clear time selections when ground changes
        endTime: ''
      }));
      setSelectedTimeSlot(''); // Clear time slot selection
    } 
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle time slot selection
  const handleTimeSlotChange = (e) => {
    const value = e.target.value;
    setSelectedTimeSlot(value);
    
    if (value) {
      const [startTime, endTime] = value.split('|');
      setFormData(prev => ({
        ...prev,
        startTime,
        endTime
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        startTime: '',
        endTime: ''
      }));
    }
  };

  // Validate if selected date is available
  const isDateAvailable = (selectedDate) => {
    return availableDates.includes(selectedDate);
  };

  // Get grounds available for selected date
  const getGroundsForDate = (selectedDate) => {
    if (!selectedDate) return [];
    
    return bookedGrounds.filter(booking => {
      const bookingDate = new Date(booking.date).toISOString().split('T')[0];
      return bookingDate === selectedDate;
    });
  };

  // Get time slots for selected ground and date
  const getTimeSlotsForGround = (selectedDate, selectedGroundId) => {
    if (!selectedDate || !selectedGroundId) return [];
    
    return bookedGrounds.filter(booking => {
      const bookingDate = new Date(booking.date).toISOString().split('T')[0];
      return bookingDate === selectedDate && booking.venue._id === selectedGroundId;
    });
  };

  // Get formatted time slot pairs for display
  const getTimeSlotPairs = (selectedDate, selectedGroundId) => {
    const timeSlots = getTimeSlotsForGround(selectedDate, selectedGroundId);
    
    return timeSlots.map(booking => {
      const startTime = new Date(booking.startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const endTime = new Date(booking.endTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      return {
        id: booking._id,
        startTime,
        endTime,
        displayText: `${startTime} - ${endTime}`,
        value: `${startTime}|${endTime}` // Combined value for form submission
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate selected date
    if (!isDateAvailable(formData.matchDate)) {
      setError('Please select a valid date from your booked grounds.');
      setLoading(false);
      return;
    }

    // Validate selected ground is available for the selected date
    const availableGrounds = getGroundsForDate(formData.matchDate);
    const isGroundValid = availableGrounds.some(booking => booking.venue._id === formData.ground);
    
    if (!isGroundValid) {
      setError('Please select a ground that is booked for the selected date.');
      setLoading(false);
      return;
    }

    // Validate selected time slot is valid
    if (!selectedTimeSlot) {
      setError('Please select a time slot for your match.');
      setLoading(false);
      return;
    }

    // Validate that the selected time slot exists in the bookings
    const timeSlotPairs = getTimeSlotPairs(formData.matchDate, formData.ground);
    const isTimeSlotValid = timeSlotPairs.some(timeSlot => timeSlot.value === selectedTimeSlot);
    
    if (!isTimeSlotValid) {
      setError('Please select a valid time slot from your ground booking.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/create-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          myTeam: selectedTeam,
          opponentTeam: opponentTeamId,
          matchDate: formData.matchDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          ground: formData.ground,
          notes: formData.notes
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Match scheduled successfully!');
        // Reset form
        setSelectedTeam('');
        setOpponent('');
        setOpponentTeamId('');
        setFormData({
          matchDate: '',
          startTime: '',
          endTime: '',
          ground: '',
          notes: ''
        });
        setSelectedTimeSlot('');
        setShowSuggestions(false);
        setSearchResults([]);
        // Refresh matches
        fetchMatches();
      } else {
        setError(data.message || 'Failed to schedule match');
      }
    } catch (err) {
      setError('Error scheduling match');
      console.error('Error scheduling match:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Coach_sideBar/>

      <div className='c-mm-manage-matches-container'>
        <div className="c-mm-manage-matches-header">
          <div className="c-mm-manage-matches-head-text">
            <p>Manage Matches</p>
          </div>
        </div>

        
        <div className="c-mm-tabs">
          <div 
            className={`c-mm-tab ${activeTab === 'schedule' ? 'c-mm-active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule a Match
          </div>
          <div 
            className={`c-mm-tab ${activeTab === 'upcoming' ? 'c-mm-active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            My Matches
          </div>
          <div 
            className={`c-mm-tab ${activeTab === 'requests' ? 'c-mm-active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Match Requests
          </div>
        </div>

        {/* Schedule Match Tab */}
        {activeTab === 'schedule' && (
          <div className="c-mm-manage-matches-content-section">
            <div className="c-mm-content-section-header">
              <p>Schedule a New Match</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="c-mm-form-row">
                <div className="c-mm-form-group">
                  <label className="c-mm-form-label">Select Your Team *</label>
                  <select 
                    className="c-mm-form-control" 
                    value={selectedTeam} 
                    onChange={handleTeamSelect}
                    required
                  >
                    <option value="">-- Select Team --</option>
                    {teams.length === 0 ? (
                      <option value="" disabled>No teams found. Please create a team first.</option>
                    ) : (
                      teams.map(team => (
                        <option key={team._id} value={team._id}>
                          {team.name} ({team.sport})
                        </option>
                      ))
                    )}
                  </select>
                  {teams.length === 0 && (
                    <small style={{ color: '#ef4444', marginTop: '5px', display: 'block' }}>
                      You need to create a team first. Go to Team Management to add a team.
                    </small>
                  )}
                </div>
              </div>

              <div className="c-mm-form-row">
                <div className="c-mm-form-group">
                  <label className="c-mm-form-label">Match Date *</label>
                  <select 
                    className="c-mm-form-control" 
                    name="matchDate"
                    value={formData.matchDate}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Select Date (From your booked grounds) --</option>
                    {availableDates.length === 0 ? (
                      <option value="" disabled>No available dates found. Please book a ground first.</option>
                    ) : (
                      availableDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))
                    )}
                  </select>
                  {availableDates.length === 0 && (
                    <small style={{ color: '#ef4444', marginTop: '5px', display: 'block' }}>
                      You need to book a ground first. Go to Ground Booking to book a ground.
                    </small>
                  )}
                </div>

                <div className="c-mm-form-group">
                  <label className="c-mm-form-label">Time Slot *</label>
                  <select 
                    className="c-mm-form-control" 
                    value={selectedTimeSlot}
                    onChange={handleTimeSlotChange}
                    required
                    disabled={!formData.ground}
                  >
                    <option value="">
                      {!formData.ground 
                        ? "-- Select Ground First --" 
                        : "-- Select Time Slot --"
                      }
                    </option>
                    {!formData.ground ? (
                      <option value="" disabled>Please select a ground first to see available time slots</option>
                    ) : getTimeSlotPairs(formData.matchDate, formData.ground).length === 0 ? (
                      <option value="" disabled>No time slots available for this ground</option>
                    ) : (
                      getTimeSlotPairs(formData.matchDate, formData.ground).map((timeSlot) => (
                        <option key={timeSlot.id} value={timeSlot.value}>
                          {timeSlot.displayText}
                        </option>
                      ))
                    )}
                  </select>
                  {!formData.ground && (
                    <small style={{ color: '#6b7280', marginTop: '5px', display: 'block' }}>
                      Please select a ground first to see available time slots.
                    </small>
                  )}
                  {formData.ground && getTimeSlotPairs(formData.matchDate, formData.ground).length === 0 && (
                    <small style={{ color: '#ef4444', marginTop: '5px', display: 'block' }}>
                      No time slots available for this ground on the selected date.
                    </small>
                  )}
                </div>
              </div>

              <div className="c-mm-form-row">
                <div className="c-mm-form-group">
                  <label className="c-mm-form-label">Preferred Ground *</label>
                  <select 
                    className="c-mm-form-control" 
                    name="ground"
                    value={formData.ground}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.matchDate}
                  >
                    <option value="">
                      {!formData.matchDate 
                        ? "-- Select Date First --" 
                        : "-- Select Ground for Selected Date --"
                      }
                    </option>
                    {!formData.matchDate ? (
                      <option value="" disabled>Please select a date first to see available grounds</option>
                    ) : getGroundsForDate(formData.matchDate).length === 0 ? (
                      <option value="" disabled>No grounds booked for this date</option>
                    ) : (
                      // Show grounds only for the selected date
                      getGroundsForDate(formData.matchDate)
                        .filter((booking, index, self) => 
                          index === self.findIndex(b => b.venue._id === booking.venue._id)
                        )
                        .map(booking => (
                          <option key={booking.venue._id} value={booking.venue._id}>
                            {booking.venue.name} - {booking.venue.location.address}
                          </option>
                        ))
                    )}
                  </select>
                  {!formData.matchDate && (
                    <small style={{ color: '#6b7280', marginTop: '5px', display: 'block' }}>
                      Please select a date first to see available grounds for that date.
                    </small>
                  )}
                  {formData.matchDate && getGroundsForDate(formData.matchDate).length === 0 && (
                    <small style={{ color: '#ef4444', marginTop: '5px', display: 'block' }}>
                      No grounds booked for the selected date. Please book a ground for this date first.
                    </small>
                  )}
                </div>
              </div>

              {/* Show suggestions when team is selected */}
              {showSuggestions && suggestedOpponents.length > 0 && (
                <div className="c-mm-suggestions-container">
                  <div className="c-mm-suggestion-title">Suggested Opponents (Based on Age Group)</div>
                  {suggestedOpponents.map(opponent => (
                    <div key={opponent._id} className="c-mm-suggestion-item">
                      <div className="c-mm-team-info">
                        <div className="c-mm-team-logo">{opponent.name.charAt(0)}</div>
                        <div>
                          <div className="c-mm-team-name">{opponent.name}</div>
                          <div className="c-mm-team-stats">
                            Average Age: {opponent.averageAge} | Sport: {opponent.sport} | Coach: {opponent.coachName}
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="c-mm-select-btn"
                        onClick={() => selectOpponent(opponent)}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Show search results when typing */}
              {searchResults.length > 0 && (
                <div className="c-mm-suggestions-container">
                  <div className="c-mm-suggestion-title">Search Results</div>
                  {searchResults.map(team => (
                    <div key={team._id} className="c-mm-suggestion-item">
                      <div className="c-mm-team-info">
                        <div className="c-mm-team-logo">{team.name.charAt(0)}</div>
                        <div>
                          <div className="c-mm-team-name">{team.name}</div>
                          <div className="c-mm-team-stats">
                            Sport: {team.sport} | Coach: {team.coachName}
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="c-mm-select-btn"
                        onClick={() => selectOpponent(team)}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="c-mm-form-group">
                <label className="c-mm-form-label">Opponent Team *</label>
                <input 
                  type="text" 
                  className="c-mm-form-control" 
                  value={opponent}
                  onChange={handleOpponentSearch}
                  placeholder="Select from suggestions or type to search" 
                  required 
                />
              </div>

              <div className="c-mm-form-group">
                <label className="c-mm-form-label">Additional Notes</label>
                <textarea 
                  className="c-mm-form-control" 
                  rows="3" 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or notes..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="c-mm-btn c-mm-btn-primary"
                disabled={loading}
              >
                {loading ? 'Scheduling...' : 'Schedule Match'}
              </button>
            </form>
          </div>
        )}

        {/* My Matches Tab */}
        {activeTab === 'upcoming' && (
          <div className="c-mm-manage-matches-content-section">
            <div className="c-mm-content-section-header">
              <p>My Matches</p>
            </div>
            
            {matches.length === 0 ? (
              <div className="c-mm-no-matches">
                <p>No matches scheduled yet.</p>
              </div>
            ) : (
              matches.map(match => (
                <div key={match._id} className="c-mm-match-request">
                  <div className="c-mm-request-info">
                    <div className="c-mm-request-title">
                      {match.myteam.name} vs {match.opponent.name}
                    </div>
                    <div className="c-mm-request-details">
                      Sport: {match.myteam.sport} | Date: {new Date(match.matchDate).toLocaleDateString()} | 
                      Time: {match.startTime} - {match.endTime} | 
                      Venue: {match.ground.name}
                      {match.myteam.coach && (
                        <span> | Requested by: {match.myteam.coach.name}</span>
                      )}
                      {console.log('Match myteam coach:', match.myteam.coach)}
                    </div>
                    {match.notes && (
                      <div className="c-mm-match-notes">
                        Notes: {match.notes}
                      </div>
                    )}
                    <div className="c-mm-match-status">
                      Status: <span className={`c-mm-status-${match.status}`}>{match.status}</span>
                    </div>
                  </div>
                  <div className="c-mm-request-actions">
                    {match.status !== 'cancelled' && match.status !== 'completed' && (
                      <button 
                        className="c-mm-btn c-mm-btn-danger"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this match?')) {
                            cancelMatch(match._id);
                          }
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Cancelling...' : 'Cancel Match'}
                      </button>
                    )}
                    {match.status === 'cancelled' && (
                      <span style={{ color: '#ef4444', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>
                        ✗ Cancelled
                      </span>
                    )}
                    {match.status === 'completed' && (
                      <span style={{ color: '#3b82f6', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Match Requests Tab */}
        {activeTab === 'requests' && (
          <div className="c-mm-manage-matches-content-section">
            <div className="c-mm-content-section-header">
              <p>Match Requests</p>
            </div>
            
            {matchRequests.length === 0 ? (
              <div className="c-mm-no-matches">
                <p>No match requests at the moment.</p>
              </div>
            ) : (
              matchRequests.map(request => (
                <div key={request._id} className="c-mm-match-request">
                  <div className="c-mm-request-info">
                    <div className="c-mm-request-title">
                      {request.myteam.name} vs {request.opponent.name}
                    </div>
                    <div className="c-mm-request-details">
                      <div className="c-mm-request-detail-item">
                        <strong>Sport:</strong> {request.myteam.sport}
                      </div>
                      <div className="c-mm-request-detail-item">
                        <strong>Date:</strong> {new Date(request.matchDate).toLocaleDateString()}
                      </div>
                      <div className="c-mm-request-detail-item">
                        <strong>Time:</strong> {request.startTime} - {request.endTime}
                      </div>
                      <div className="c-mm-request-detail-item">
                        <strong>Venue:</strong> {request.ground.name} - {request.ground.location.address},{request.ground.location.city}
                      </div>
                      <div className="c-mm-request-detail-item">
                        <strong>Requested by:</strong> {request.myteam.coach ? request.myteam.coach.name : 'Unknown'} ({request.myteam.coach ? request.myteam.coach.email : 'N/A'})
                        {console.log('Request myteam coach:', request.myteam.coach)}
                      </div>
                    </div>
                    {request.notes && (
                      <div className="c-mm-match-notes">
                        <strong>Notes:</strong> {request.notes}
                      </div>
                    )}
                    <div className="c-mm-match-status">
                      Status: <span className={`c-mm-status-${request.status}`}>{request.status}</span>
                    </div>
                  </div>
                  <div className="c-mm-request-actions">
                    <button 
                      className="c-mm-btn c-mm-btn-success"
                      onClick={() => acceptMatchRequest(request._id)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Accept'}
                    </button>
                    <button 
                      className="c-mm-btn c-mm-btn-danger"
                      onClick={() => rejectMatchRequest(request._id)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}