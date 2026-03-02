import React, { useState, useEffect } from 'react';
import './styles/player_notifications.css';
import PlayerSidebar from './PlayerSidebar .jsx';
import axios from 'axios';

const Player_notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch notifications from backend using session
  const fetchNotifications = async (page = 1, filterType = 'all') => {
    try {
      setLoading(true);
      console.log('Fetching notifications...');
      
      let queryParams = `?page=${page}&limit=20`;
      if (filterType === 'unread') queryParams += '&isRead=false';
      if (filterType === 'read') queryParams += '&isRead=true';
      
      const url = `http://localhost:8080/api/notifications/current-user/notifications${queryParams}`;
      console.log('API URL:', url);
      
      const response = await axios.get(url, { withCredentials: true });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
        setPagination(response.data.data.pagination);
        setError(null);
        console.log('Notifications loaded:', response.data.data.notifications.length);
      } else {
        setError('Failed to fetch notifications');
        console.log('API returned success: false');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      if (err.response?.status === 401) {
        setError('Please log in to view notifications');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to fetch notifications. Please try again.');
      }
      
    
      
      setUnreadCount(3);
    } finally {
      setLoading(false);
    }
  };

  // Test API connection
  const testAPI = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/notifications/test', { withCredentials: true });
      console.log('API Test Response:', response.data);
      
      if (response.data.session === 'No user session') {
        console.warn('No user session found - user may not be logged in');
        setError('Please log in to view notifications');
        return false;
      }
      return true;
    } catch (err) {
      console.error('API Test Failed:', err);
      return false;
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    const loadData = async () => {
      const isLoggedIn = await testAPI(); // Test API first
      if (isLoggedIn) {
        fetchNotifications(1, filter);
      }
    };
    loadData();
  }, [filter]);

  const markAsRead = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setNotifications(notifications.map(notification => 
          notification._id === id ? { ...notification, isRead: true } : notification
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Fallback to local state update
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, isRead: true } : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/notifications/current-user/mark-all-read`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Fallback to local state update
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return '✓';
      case 'booking_rejected':
        return '✗';
      case 'booking_cancelled':
        return '❌';
      case 'booking_reminder':
        return '⏰';
      case 'match_scheduled':
      case 'match_invitation':
        return '⚽';
      case 'match_cancelled':
        return '🚫';
      case 'match_reminder':
        return '⏰';
      case 'match_result':
        return '🏆';
      case 'training_scheduled':
      case 'training_reminder':
      case 'session_reminder':
        return '🏃';
      case 'training_cancelled':
        return '❌';
      case 'equipment_rental_confirmed':
      case 'equipment_rental_rejected':
      case 'equipment_return_reminder':
      case 'equipment_available':
        return '⚽';
      case 'payment_received':
      case 'payment_failed':
      case 'payment_reminder':
      case 'refund_processed':
        return '💰';
      case 'account_approved':
      case 'account_reactivated':
        return '✅';
      case 'account_suspended':
        return '⚠️';
      case 'maintenance_scheduled':
        return '🔧';
      case 'venue_approved':
        return '✅';
      case 'venue_rejected':
        return '❌';
      case 'team_invitation':
        return '👥';
      case 'team_removed':
        return '👥';
      case 'welcome':
        return '👋';
      case 'system_update':
        return '🔄';
      case 'announcement':
        return '📢';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff4757';
      case 'medium':
        return '#ffa502';
      case 'low':
        return '#2ed573';
      default:
        return '#6c5ce7';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  // Loading component
  if (loading) {
    return (
      <div className="notifications-container">
        <PlayerSidebar />
        <div className="notifications-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="notifications-container">
        <PlayerSidebar />
        <div className="notifications-main">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Notifications</h3>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => fetchNotifications(1, filter)}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <PlayerSidebar />
      
      <div className="notifications-main">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <div className="notifications-actions">
            <span className="unread-count">{unreadCount} unread</span>
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </button>
          </div>
        </div>

        <div className="notifications-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">📭</div>
              <h3>No notifications found</h3>
              <p>You're all caught up! Check back later for new updates.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  <span style={{ color: getPriorityColor(notification.priority) }}>
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <div className="notification-meta">
                      <span className="notification-time">{notification.timeAgo || notification.time}</span>
                      {!notification.isRead && <div className="unread-indicator"></div>}
                    </div>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  <div className="notification-footer">
                    <span className={`priority-badge priority-${notification.priority}`}>
                      {notification.priority.toUpperCase()}
                    </span>
                    <span className="notification-type">
                      {notification.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Player_notifications;
