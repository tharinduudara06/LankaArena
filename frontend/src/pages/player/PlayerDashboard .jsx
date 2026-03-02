import React, { useState, useEffect } from 'react';
import './styles/PlayerDashboard.css';
import PlayerSidebar from './PlayerSidebar ';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSearch, faBell, faCalendar, faBasketballBall, faUsers, faStopwatch, faPlus, faCalendarTimes, faTrophy} from '@fortawesome/free-solid-svg-icons'

const PlayerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/player/dashboard-data', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-dash-container">
        <PlayerSidebar/>
        <div className="p-dash-dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-dash-container">
        <PlayerSidebar/>
        <div className="p-dash-dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div>Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-dash-container">
        <PlayerSidebar/>
        <div className="p-dash-dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div>No data available</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-dash-container">
    
    <PlayerSidebar/>

      {/* Dashboard Content */}
      <div className="p-dash-dashboard-content">
        <div className="p-dash-dashboard-header">
          <div className="p-dash-welcome-section">
            <h1>Welcome back, {dashboardData.user.name || 'Player'}!</h1>
            <p>Here's what's happening with your sports activities today.</p>
          </div>
          <div className="p-dash-search-notification">
            <div className="p-dash-search-bar">
              <FontAwesomeIcon icon={faSearch} style={{color: "#5a7d89"}}/>
              <input type="text" placeholder="Search..." />
            </div>
            <div className="p-dash-notification-icon">
              <FontAwesomeIcon icon={faBell}/>
              <div className="p-dash-notification-badge">3</div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-dash-stats-container">
          <div className="p-dash-stat-card">
            <div className="p-dash-stat-header">
              <div className="p-dash-stat-title">PENDING BOOKINGS</div>
              <div className="p-dash-stat-icon" style={{backgroundColor: "#56d6cc"}}>
                <FontAwesomeIcon icon={faCalendar}/>
              </div>
            </div>
            <div className="p-dash-stat-value">{dashboardData.stats.pendingBookings}</div>
            
          </div>
          
          <div className="p-dash-stat-card">
            <div className="p-dash-stat-header">
              <div className="p-dash-stat-title">UPCOMING RENTALS</div>
              <div className="p-dash-stat-icon" style={{backgroundColor: "#ffa502"}}>
                <FontAwesomeIcon icon={faBasketballBall}/>
              </div>
            </div>
            <div className="p-dash-stat-value">{dashboardData.stats.upcomingRentals}</div>
            
          </div>
          
          <div className="p-dash-stat-card">
            <div className="p-dash-stat-header">
              <div className="p-dash-stat-title">TEAM MATCHES</div>
              <div className="p-dash-stat-icon" style={{backgroundColor: "#2ed573"}}>
                <FontAwesomeIcon icon={faUsers}/>
              </div>
            </div>
            <div className="p-dash-stat-value">{dashboardData.stats.teamMatches}</div>
            
          </div>
          
          <div className="p-dash-stat-card">
            <div className="p-dash-stat-header">
              <div className="p-dash-stat-title">COACH SESSIONS</div>
              <div className="p-dash-stat-icon" style={{backgroundColor: "#ff4757"}}>
                <FontAwesomeIcon icon={faStopwatch}/>
              </div>
            </div>
            <div className="p-dash-stat-value">{dashboardData.stats.coachSessions}</div>
            
          </div>
        </div>

        {/* Main Content */}
        <div className="p-dash-main-content">
          {/* Left Column */}
          <div className="p-dash-left-column">
            {/* Upcoming Bookings */}
            <div className="p-dash-card">
              <div className="p-dash-card-header">
                <div className="p-dash-card-title">Upcoming Bookings</div>
                <a href="#" className="p-dash-view-all">View All</a>
              </div>
              
              {dashboardData.upcomingBookings && dashboardData.upcomingBookings.length > 0 ? (
                dashboardData.upcomingBookings.map((booking, index) => (
                  <div key={booking.id || index} className="p-dash-booking-item">
                    <div className="p-dash-booking-details">
                      <div className="p-dash-booking-title">{booking.title}</div>
                      <div className="p-dash-booking-info">{booking.location}</div>
                    </div>
                    <div className="p-dash-booking-time">{booking.date}, {booking.time}</div>
                  </div>
                ))
              ) : (
                <div className="p-dash-booking-item">
                  <div className="p-dash-booking-details">
                    <div className="p-dash-booking-title">No upcoming bookings</div>
                    <div className="p-dash-booking-info">Book a ground to see your upcoming sessions here</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recent Activity */}
            <div className="p-dash-card" style={{marginTop: "25px"}}>
              <div className="p-dash-card-header">
                <div className="p-dash-card-title">Recent Activity</div>
                <a href="#" className="p-dash-view-all">View All</a>
              </div>
              
              {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="p-dash-activity-item">
                    <div className="p-dash-activity-details">
                      <div className="p-dash-activity-title">{activity.title}</div>
                      <div className="p-dash-activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-dash-activity-item">
                  <div className="p-dash-activity-details">
                    <div className="p-dash-activity-title">No recent activity</div>
                    <div className="p-dash-activity-time">Your activities will appear here</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="p-dash-right-column">
            {/* Quick Actions */}
            <div className="p-dash-card">
              <div className="p-dash-card-header">
                <div className="p-dash-card-title">Quick Actions</div>
              </div>
              
              <div className="p-dash-action-grid">
                <div className="p-dash-action-item">
                  <div className="p-dash-action-icon" style={{backgroundColor: "#56d6cc"}}>
                    <FontAwesomeIcon icon={faPlus}/>
                  </div>
                  <div className="p-dash-action-title">New Booking</div>
                </div>
                
                <div className="p-dash-action-item">
                  <div className="p-dash-action-icon" style={{backgroundColor: "#2ed573"}}>
                    <FontAwesomeIcon icon={faBasketballBall}/>
                  </div>
                  <div className="p-dash-action-title">Rent Equipment</div>
                </div>
                
                <div className="p-dash-action-item">
                  <div className="p-dash-action-icon" style={{backgroundColor: "#ff4757"}}>
                    <FontAwesomeIcon icon={faCalendarTimes}/>
                  </div>
                  <div className="p-dash-action-title">Cancel Booking</div>
                </div>
              </div>
            </div>
            
            {/* Upcoming Matches */}
            <div className="p-dash-card" style={{marginTop: "25px"}}>
              <div className="p-dash-card-header">
                <div className="p-dash-card-title">Upcoming Matches</div>
                <a href="#" className="p-dash-view-all">View All</a>
              </div>
              
              {dashboardData.upcomingMatches && dashboardData.upcomingMatches.length > 0 ? (
                dashboardData.upcomingMatches.map((match, index) => (
                  <div key={match.id || index} className="p-dash-booking-item">
                    <div className="p-dash-booking-icon" style={{backgroundColor: "#56d6cc"}}>
                      <FontAwesomeIcon icon={faTrophy}/>
                    </div>
                    <div className="p-dash-booking-details">
                      <div className="p-dash-booking-title">{match.title}</div>
                      <div className="p-dash-booking-info">{match.sport} - {match.ground}</div>
                    </div>
                    <div className="p-dash-booking-time">{match.date}</div>
                  </div>
                ))
              ) : (
                <div className="p-dash-booking-item">
                  <div className="p-dash-booking-icon" style={{backgroundColor: "#56d6cc"}}>
                    <FontAwesomeIcon icon={faTrophy}/>
                  </div>
                  <div className="p-dash-booking-details">
                    <div className="p-dash-booking-title">No upcoming matches</div>
                    <div className="p-dash-booking-info">Join a team to see your matches here</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;