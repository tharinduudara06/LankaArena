// AdminVenueOversight.jsx
import React, { useState, useEffect } from 'react';
import './styles/admin_venue_oversight.css';
import Admin_nav from './Admin_nav';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faDownload, faPlus, faEye, faChartPie, faSpinner} from "@fortawesome/free-solid-svg-icons"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminVenueOversight = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch venues data
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('http://localhost:8080/api/admin/get-venue-bookings', {
          withCredentials: true
        });
        
        if (response.status === 200 && response.data?.data) {
          setVenues(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          setVenues([]);
        }
      } catch (err) {
        console.error('Error fetching venues:', err);
        if (err.response?.status === 400 || err.response?.status === 401) {
          navigate('/log');
        } else {
          setError('Failed to fetch venues data. Please try again.');
        }
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [navigate]);

  const safeVenues = Array.isArray(venues) ? venues : [];
  
  // Calculate stats
  const totalVenues = safeVenues.length;
  const activeVenues = safeVenues.filter(v => v.status === 'active').length;
  const maintenanceVenues = safeVenues.filter(v => 
    v.status === 'under_maintenance' || v.status === 'maintenance'
  ).length;
  const totalBookings = safeVenues.reduce((total, venue) => {
    const bookings = parseInt(venue.bookings) || 0;
    return total + bookings;
  }, 0);

  const getStatusClass = (status) => {
    if (status === 'active') return 'admin-vo-status-active';
    if (status === 'under_maintenance' || status === 'maintenance') return 'admin-vo-status-pending';
    return 'admin-vo-status-inactive';
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    if (status === 'under_maintenance') return 'Under Maintenance';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="admin-venue-oversight">
      <Admin_nav/>

      {/* Main Content */}
      <div className="admin-vo-main-content">
        {/* Page Header */}
        <div className="admin-vo-page-header">
          <h1 className="admin-vo-page-title">Venue & Service Oversight</h1>
          <div className="admin-vo-header-actions">
            <button className="admin-vo-btn admin-vo-btn-secondary">
                <FontAwesomeIcon icon={faDownload}/> Export Report
            </button>
            <button className="admin-vo-btn admin-vo-btn-primary">
              <FontAwesomeIcon icon={faPlus}/> Add New Venue
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-vo-stats-cards">
          <div className="admin-vo-stat-card">
            <div className="admin-vo-stat-value">{totalVenues}</div>
            <div className="admin-vo-stat-label">Total Venues</div>
          </div>
          <div className="admin-vo-stat-card">
            <div className="admin-vo-stat-value">{activeVenues}</div>
            <div className="admin-vo-stat-label">Active Venues</div>
          </div>
          <div className="admin-vo-stat-card">
            <div className="admin-vo-stat-value">{maintenanceVenues}</div>
            <div className="admin-vo-stat-label">Under Maintenance</div>
          </div>
          <div className="admin-vo-stat-card">
            <div className="admin-vo-stat-value">{totalBookings}</div>
            <div className="admin-vo-stat-label">Total Bookings</div>
          </div>
        </div>

        {/* Venues List */}
        <div className="admin-vo-content-section">
          <div className="admin-vo-section-header">
            <h2 className="admin-vo-section-title">Venue Management</h2>
          </div>
          
          {loading ? (
            <div className="admin-vo-loading">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>Loading venues...</p>
            </div>
          ) : error ? (
            <div className="admin-vo-error">
              <p>{error}</p>
            </div>
          ) : safeVenues.length === 0 ? (
            <div className="admin-vo-empty">
              <p>No venues found.</p>
            </div>
          ) : (
            <div className="admin-vo-data-table">
              <table>
                <thead>
                  <tr>
                    <th>Venue Name</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Bookings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeVenues.map((venue) => (
                    <tr key={venue._id || venue.name}>
                      <td>{venue.name || '—'}</td>
                      <td>{venue.location || '—'}</td>
                      <td>
                        <span className={`admin-vo-status ${getStatusClass(venue.status)}`}>
                          {formatStatus(venue.status)}
                        </span>
                      </td>
                      <td>{venue.bookings || '0'}</td>
                      <td>
                        <button 
                          className="admin-vo-action-btn"
                          title="View Details"
                          onClick={() => console.log('View venue:', venue._id)}
                        >
                          <FontAwesomeIcon icon={faEye}/>
                        </button>
                        <button 
                          className="admin-vo-action-btn"
                          title="View Analytics"
                          onClick={() => console.log('View analytics:', venue._id)}
                        >
                          <FontAwesomeIcon icon={faChartPie}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVenueOversight;