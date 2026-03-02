// AdminDashboard.jsx
import React, { useState } from 'react';
import './styles/admin_dashboard.css';
import Admin_nav from './Admin_nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers,faDollar,faCalendar,faExclamationCircle,faBell,faChartLine } from '@fortawesome/free-solid-svg-icons'

const AdminDashboard = () => {
  const [activeLink, setActiveLink] = useState('dashboard');
  
  const handleLinkClick = (link) => {
    setActiveLink(link);
  };
  
  const handleLogout = () => {
    alert('Logging out...');
  };
  
  // Sample data for transactions
  const transactions = [
    { id: '#TRX-7842', user: 'James Wilson', date: 'Oct 15, 2023', amount: '$120.00', status: 'Completed' },
    { id: '#TRX-7841', user: 'City Sports Center', date: 'Oct 15, 2023', amount: '$85.50', status: 'Completed' },
    { id: '#TRX-7840', user: 'Sophia Martinez', date: 'Oct 14, 2023', amount: '$210.00', status: 'Pending' },
    { id: '#TRX-7839', user: 'Elite Fitness Gym', date: 'Oct 14, 2023', amount: '$155.75', status: 'Completed' },
    { id: '#TRX-7838', user: 'David Brown', date: 'Oct 13, 2023', amount: '$65.00', status: 'Completed' }
  ];
  
  // Stats data
  const stats = [
    { title: 'TOTAL USERS', value: '2,548', change: '12.5%', positive: true, icon: faUsers },
    { title: 'TOTAL REVENUE', value: 'LKR 120,000', change: '8.3%', positive: true, icon: faDollar },
    { title: 'ACTIVE BOOKINGS', value: '184', change: '5.7%', positive: true, icon: faCalendar },
    { title: 'PENDING ISSUES', value: '23', change: '3.2%', positive: false, icon: faExclamationCircle }
  ];
  
  // Sidebar links
  const sidebarLinks = [
    { id: 'dashboard', icon: 'tachometer-alt', text: 'Dashboard' },
    { id: 'users', icon: 'users', text: 'User Management' },
    { id: 'financial', icon: 'money-bill-wave', text: 'Financial & Payments' },
    { id: 'content', icon: 'clipboard-list', text: 'Content Moderation' },
    { id: 'venue', icon: 'volleyball-ball', text: 'Venue & Service Oversight' },
    { id: 'security', icon: 'shield-alt', text: 'System Security' },
    { id: 'notifications', icon: 'bell', text: 'Notifications' },
    { id: 'settings', icon: 'cog', text: 'Settings' }
  ];

  return (
    <div className="admin-dash-container">

        <Admin_nav/>

      <div className="admin-dash-main-content">
        <div className="admin-dash-dashboard-header">
          <h1 className="admin-dash-page-title">Dashboard Overview</h1>
          <div className="admin-dash-header-actions">
            <div className="admin-dash-search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search..." />
            </div>
            <a href="#" className="admin-dash-notification-btn">
              <FontAwesomeIcon icon={faBell}/>
              <span className="admin-dash-notification-badge">3</span>
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-dash-stats-cards">
          {stats.map((stat, index) => (
            <div key={index} className="admin-dash-stat-card">
              <div className="admin-dash-stat-header">
                <div className="admin-dash-stat-title">{stat.title}</div>
                <div className="admin-dash-stat-icon">
                  <i className={`fas fa-${stat.icon}`}></i>
                  <FontAwesomeIcon icon={stat.icon}/>
                </div>
              </div>
              <div className="admin-dash-stat-value">{stat.value}</div>
              
            </div>
          ))}
        </div>

        {/* Revenue and Activity Section */}
        <div className="admin-dash-dashboard-section">
          <div className="admin-dash-section-header">
            <h2 className="admin-dash-section-title">Revenue Analytics</h2>
            <a href="#" className="admin-dash-view-all">Generate Report</a>
          </div>
          <div className="admin-dash-chart-container">
            <div className="admin-dash-chart-placeholder">
              <FontAwesomeIcon size='xl' icon={faChartLine}/>
              <p>Revenue chart would be displayed here</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="admin-dash-dashboard-section">
          <div className="admin-dash-section-header">
            <h2 className="admin-dash-section-title">Recent Transactions</h2>
            <a href="#" className="admin-dash-view-all">View All</a>
          </div>
          <div className="admin-dash-card">
            <table className="admin-dash-data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.id}</td>
                    <td>{transaction.user}</td>
                    <td>{transaction.date}</td>
                    <td>{transaction.amount}</td>
                    <td>
                      <span className={`admin-dash-status admin-dash-status-${transaction.status.toLowerCase() === 'completed' ? 'active' : 'pending'}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;