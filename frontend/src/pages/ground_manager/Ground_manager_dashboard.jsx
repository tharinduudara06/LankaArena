import React, { useState, useEffect } from 'react';
import './styles/ground_manager_dashboard.css';
import Ground_manager_sideBar from './Ground_manager_sideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faMoneyBillWave, faClock, faChartPie, faBuilding, faTools, faExclamationTriangle, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

const Ground_manager_dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      todayBookings: 0,
      weeklyRevenue: 0,
      venueUtilization: 0,
      totalVenues: 0
    },
    recentBookings: [],
    maintenanceStatus: [],
    recentActivity: [],
    monthlyRevenue: [],
    loading: true,
    error: null
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all required data in parallel
      const [
        profileResponse,
        bookingsResponse,
        maintenanceResponse,
        paymentStatsResponse,
        recentTransactionsResponse,
        monthlyRevenueResponse
      ] = await Promise.all([
        axios.get('http://localhost:8080/api/ground-manager/profile', { withCredentials: true }),
        axios.get('http://localhost:8080/api/ground-manager/get-venue-owner-bookings', { withCredentials: true }),
        axios.get('http://localhost:8080/api/ground-manager/maintenance/schedules', { withCredentials: true }),
        axios.get('http://localhost:8080/api/ground-manager/payments/stats', { withCredentials: true }),
        axios.get('http://localhost:8080/api/ground-manager/payments/transactions?limit=5', { withCredentials: true }),
        axios.get('http://localhost:8080/api/ground-manager/payments/monthly-revenue', { withCredentials: true })
      ]);

      const profile = profileResponse.data.data;
      const bookings = bookingsResponse.data.data || [];
      const maintenance = maintenanceResponse.data.data || [];
      const paymentStats = paymentStatsResponse.data.data;
      const recentTransactions = recentTransactionsResponse.data.data || [];
      const monthlyRevenue = monthlyRevenueResponse.data.data;

      // Calculate today's bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDetails.date);
        return bookingDate >= today && bookingDate < tomorrow;
      });

      // Calculate venue utilization (simplified)
      const totalBookings = bookings.length;
      const totalVenues = profile.totalGrounds || 0;
      const utilization = totalVenues > 0 ? Math.min((totalBookings / (totalVenues * 30)) * 100, 100) : 0;

      // Format recent bookings
      const recentBookings = bookings.slice(0, 5).map(booking => ({
        id: booking._id,
        teamName: booking.customer.name,
        date: new Date(booking.bookingDetails.date).toLocaleDateString(),
        time: `${new Date(booking.bookingDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.bookingDetails.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        sport: booking.venue.name,
        status: booking.bookingDetails.status,
        paymentStatus: booking.bookingDetails.paymentStatus
      }));

      // Format maintenance status
      const maintenanceStatus = maintenance.slice(0, 4).map(item => ({
        id: item._id,
        area: item.title,
        lastInspection: new Date(item.scheduledDate).toLocaleDateString(),
        status: item.status,
        priority: item.priority
      }));

      // Format recent activity
      const recentActivity = recentTransactions.slice(0, 4).map(transaction => ({
        id: transaction._id,
        message: `Payment ${transaction.status.toLowerCase()} from ${transaction.customer}`,
        time: new Date(transaction.createdAt).toLocaleString(),
        amount: transaction.amount
      }));

      setDashboardData({
        stats: {
          todayBookings: todayBookings.length,
          weeklyRevenue: paymentStats.totalRevenue || 0,
          venueUtilization: Math.round(utilization),
          totalVenues: totalVenues
        },
        recentBookings,
        maintenanceStatus,
        recentActivity,
        monthlyRevenue: monthlyRevenue.revenues || [],
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Failed to load dashboard data'
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return 'gm-status-confirmed';
      case 'pending':
      case 'not-paid':
      case 'notpaid':
        return 'gm-status-pending';
      case 'cancelled':
      case 'failed':
        return 'gm-status-cancelled';
      default:
        return 'gm-status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'paid':
        return 'Paid';
      case 'not-paid':
      case 'notpaid':
        return 'Payment Pending';
      case 'failed':
        return 'Failed';
      default:
        return status || 'Unknown';
    }
  };

  // Calendar generation
  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      calendar.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // You can add additional logic here to filter data by selected date
  };

  const calendar = generateCalendar();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  if (dashboardData.loading) {
    return (
      <div className="gm-dashboard-container">
        <Ground_manager_sideBar />
        <div className="gm-main-content">
          <div className="gm-loading">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="gm-dashboard-container">
        <Ground_manager_sideBar />
        <div className="gm-main-content">
          <div className="gm-error">
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
            <p>{dashboardData.error}</p>
            <button onClick={fetchDashboardData} className="gm-btn gm-btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gm-dashboard-container">
      <Ground_manager_sideBar />

      {/* Main Content */}
      <div className="gm-main-content">
        <div className="gm-header">
          <h1>Ground Manager Dashboard</h1>
          <div className="gm-header-actions">
            <button className="gm-btn gm-btn-outline" onClick={fetchDashboardData}>
              <FontAwesomeIcon icon={faSpinner} />
              Refresh Data
            </button>
            <button className="gm-btn gm-btn-primary">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="gm-stats-cards">
          <div className="gm-stat-card">
            <div className="gm-stat-card-header">
              <div>
                <div className="gm-value">{dashboardData.stats.todayBookings}</div>
                <div className="gm-label">Today's Bookings</div>
              </div>
             
            </div>
          </div>
          
          <div className="gm-stat-card">
            <div className="gm-stat-card-header">
              <div>
                <div className="gm-value">{formatCurrency(dashboardData.stats.weeklyRevenue)}</div>
                <div className="gm-label">Total Revenue</div>
              </div>
             
            </div>
          </div>
          
          <div className="gm-stat-card">
            <div className="gm-stat-card-header">
              <div>
                <div className="gm-value">{dashboardData.stats.venueUtilization}%</div>
                <div className="gm-label">Venue Utilization</div>
              </div>
              
            </div>
          </div>

          <div className="gm-stat-card">
            <div className="gm-stat-card-header">
              <div>
                <div className="gm-value">{dashboardData.stats.totalVenues}</div>
                <div className="gm-label">Total Venues</div>
              </div>
             
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="gm-dashboard-section">
          {/* Bookings Table */}
          <div className="gm-card">
            <div className="gm-card-header">
              <h2>Recent Bookings</h2>
              <a href="/ground-manager-bookings">View All</a>
            </div>
            {dashboardData.recentBookings.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Team/Group</th>
                    <th>Date & Time</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.teamName}</td>
                      <td>
                        <div>{booking.date}</div>
                        <div className="gm-time-text">{booking.time}</div>
                      </td>
                      <td>{booking.sport}</td>
                      <td>
                        <span className={`gm-status ${getStatusClass(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td>
                        <span className={`gm-status ${getStatusClass(booking.paymentStatus)}`}>
                          {getStatusText(booking.paymentStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="gm-empty-state">
                <FontAwesomeIcon icon={faCalendarDays} size="3x" />
                <p>No recent bookings found</p>
              </div>
            )}
          </div>

          {/* Upcoming Events Calendar */}
          <div className="gm-card">
            <div className="gm-card-header">
              <h2>Calendar View</h2>
              <div className="gm-calendar-controls">
                <button 
                  className="gm-btn gm-btn-outline"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                >
                  ←
                </button>
                <span className="gm-month-year">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </span>
                <button 
                  className="gm-btn gm-btn-outline"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                >
                  →
                </button>
              </div>
            </div>
            <div className="gm-calendar">
              <div className="gm-calendar-weekday">Sun</div>
              <div className="gm-calendar-weekday">Mon</div>
              <div className="gm-calendar-weekday">Tue</div>
              <div className="gm-calendar-weekday">Wed</div>
              <div className="gm-calendar-weekday">Thu</div>
              <div className="gm-calendar-weekday">Fri</div>
              <div className="gm-calendar-weekday">Sat</div>
              
              {calendar.map((date, index) => {
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const hasBookings = dashboardData.recentBookings.some(booking => 
                  new Date(booking.date).toDateString() === date.toDateString()
                );
                
                return (
                  <div 
                    key={index}
                    className={`gm-calendar-day ${!isCurrentMonth ? 'gm-other-month' : ''} ${isToday ? 'gm-today' : ''} ${hasBookings ? 'gm-booking' : ''}`}
                    onClick={() => handleDateSelect(date)}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="gm-dashboard-section">
          {/* Maintenance Status */}
          <div className="gm-card">
            <div className="gm-card-header">
              <h2>Maintenance Status</h2>
              <a href="/ground-manager-maintenance">View All</a>
            </div>
            {dashboardData.maintenanceStatus.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Last Inspection</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.maintenanceStatus.map((item) => (
                    <tr key={item.id}>
                      <td>{item.area}</td>
                      <td>{item.lastInspection}</td>
                      <td>
                        <span className={`gm-status ${getStatusClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td>
                        <span className={`gm-priority gm-priority-${item.priority}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <button className="gm-btn gm-btn-outline gm-btn-small">
                          <FontAwesomeIcon icon={faTools} />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="gm-empty-state">
                <FontAwesomeIcon icon={faTools} size="3x" />
                <p>No maintenance records found</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="gm-card">
            <div className="gm-card-header">
              <h2>Recent Activity</h2>
              <a href="/ground-manager-payments">View All</a>
            </div>
            {dashboardData.recentActivity.length > 0 ? (
              <ul className="gm-activity-list">
                {dashboardData.recentActivity.map((activity) => (
                  <li key={activity.id} className="gm-activity-item">
                    <div className="gm-activity-icon">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                    </div>
                    <div className="gm-activity-content">
                      <p>{activity.message}</p>
                      <div className="gm-activity-time">{activity.time}</div>
                      {activity.amount && (
                        <div className="gm-activity-amount">{formatCurrency(activity.amount)}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="gm-empty-state">
                <FontAwesomeIcon icon={faClock} size="3x" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ground_manager_dashboard;