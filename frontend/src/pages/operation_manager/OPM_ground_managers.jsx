import React, { useEffect, useState } from "react";
import "./styles/opm_groundManagers.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEdit,
  faEye,
  faTrash,
  faFilter,
  faDownload,
  faRefresh,
  faCheck,
  faTimes,
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCalendarAlt,
  faChartLine,
  faUsers,
  faBuilding,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faBan,
  faEllipsisV,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import OPM_sideBar from "./OPM_sideBar";
import axios from "axios";

export default function OPM_ground_managers() {
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingManagerId, setEditingManagerId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [addManagerLoading, setAddManagerLoading] = useState(false);
  const [addManagerError, setAddManagerError] = useState('');

  // Fetch managers data
  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:8080/api/operation-manager/get-all-managers");
      console.log("API Response:", res.data);
      console.log("Setting managers:", res.data.managers);
      setManagers(res.data.managers || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setError("Failed to fetch managers data. Please check if the backend server is running.");
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort managers
  const filteredAndSortedManagers = managers
    .filter((manager) => {
      const matchesSearch = 
        manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manager.mobile?.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || manager.status === statusFilter || (statusFilter === "active" && manager.status === "approved");
      const matchesVenue = venueFilter === "all" || manager.venue === venueFilter;
      
      console.log(`Manager ${manager.name}: search=${matchesSearch}, status=${matchesStatus}, venue=${matchesVenue}`);
      
      return matchesSearch && matchesStatus && matchesVenue;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique venues for filter
  const uniqueVenues = [...new Set(managers.map(manager => manager.venue).filter(Boolean))];

  // Status statistics
  const statusStats = {
    total: managers.length,
    active: managers.filter(m => m.status === 'active' || m.status === 'approved').length,
    pending: managers.filter(m => m.status === 'pending').length,
    banned: managers.filter(m => m.status === 'banned').length,
  };

  // Debug logging
  console.log("Current managers state:", managers);
  console.log("Filtered managers:", filteredAndSortedManagers);
  console.log("Status stats:", statusStats);


  const handleEdit = (manager) => {
    setEditingManagerId(manager._id);
    setEditedStatus(manager.status);
  };

  const handleCancel = () => {
    setEditingManagerId(null);
    setEditedStatus("");
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/operation-manager/update-manager-status/${id}`, {
        status: editedStatus,
      });

      setManagers((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, status: editedStatus } : m
        )
      );
      setEditingManagerId(null);
    } catch (error) {
      console.error("Error updating manager status:", error);
      setError("Failed to update manager status");
    }
  };

  const handleViewDetails = (manager) => {
    setSelectedManager(manager);
    setShowDetailsModal(true);
  };

  const handleAddManager = () => {
    setShowAddModal(true);
    setNewManager({
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: ''
    });
    setAddManagerError('');
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewManager({
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: ''
    });
    setAddManagerError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewManager(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!newManager.name.trim()) {
      setAddManagerError('Name is required');
      return false;
    }
    if (!newManager.email.trim()) {
      setAddManagerError('Email is required');
      return false;
    }
    if (!newManager.mobile.trim()) {
      setAddManagerError('Mobile number is required');
      return false;
    }
    if (!newManager.password) {
      setAddManagerError('Password is required');
      return false;
    }
    if (newManager.password !== newManager.confirmPassword) {
      setAddManagerError('Passwords do not match');
      return false;
    }
    if (newManager.password.length < 6) {
      setAddManagerError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmitAddManager = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setAddManagerLoading(true);
    setAddManagerError('');

    try {
      const response = await axios.post('http://localhost:8080/api/operation-manager/add-manager', {
        name: newManager.name.trim(),
        email: newManager.email.trim(),
        mobile: newManager.mobile.trim(),
        password: newManager.password,
        role: 'service_provider',
        SP_type: 'venue_owner',
        status: 'pending'
      });

      if (response.status === 200 || response.status === 201) {
        // Refresh the managers list
        await fetchManagers();
        handleCloseAddModal();
        alert('Ground manager added successfully!');
      }
    } catch (error) {
      console.error('Error adding manager:', error);
      setAddManagerError(error.response?.data?.message || 'Failed to add manager. Please try again.');
    } finally {
      setAddManagerLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon active" />;
      case 'pending':
        return <FontAwesomeIcon icon={faClock} className="status-icon pending" />;
      case 'banned':
        return <FontAwesomeIcon icon={faBan} className="status-icon banned" />;
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon" />;
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FontAwesomeIcon icon={faSort} />;
    return sortOrder === "asc" ? 
      <FontAwesomeIcon icon={faSortUp} /> : 
      <FontAwesomeIcon icon={faSortDown} />;
  };

  if (loading) {
    return (
      <div className="opm-gm-container">
        <OPM_sideBar />
        <div className="opm-gm-main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading ground managers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="opm-gm-container">
      <OPM_sideBar />

      {/* Main Content */}
      <div className="opm-gm-main-content">
        {/* Header */}
        <div className="opm-gm-content-header">
          <div className="header-text">
            <h1>Ground Managers</h1>
            <p>Manage and oversee all ground managers across venues</p>
          </div>
          <div className="opm-gm-header-actions">
            <button 
              className="opm-gm-btn opm-gm-btn-secondary"
              onClick={fetchManagers}
              title="Refresh Data"
            >
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </button>
            <button 
              className="opm-gm-btn opm-gm-btn-primary"
              onClick={handleAddManager}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Manager
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="opm-gm-controls">
          <div className="opm-gm-search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Search managers, venues, or contact info..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="opm-gm-filters">
            <div className="filter-group">
              <FontAwesomeIcon icon={faFilter} />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            
            <div className="filter-group">
              <FontAwesomeIcon icon={faBuilding} />
              <select 
                value={venueFilter} 
                onChange={(e) => setVenueFilter(e.target.value)}
              >
                <option value="all">All Venues</option>
                {uniqueVenues.map(venue => (
                  <option key={venue} value={venue}>{venue}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="opm-gm-stats-cards">
          <div className="opm-gm-stat-card total">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusStats.total}</div>
              <div className="stat-label">Total Managers</div>
            </div>
          </div>
          
          <div className="opm-gm-stat-card active">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusStats.active}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          
          <div className="opm-gm-stat-card pending">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusStats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="opm-gm-stat-card banned">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faBan} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusStats.banned}</div>
              <div className="stat-label">Banned</div>
            </div>
          </div>
        </div>

        {/* Managers Table */}
        <div className="opm-gm-card">
          <div className="opm-gm-card-header">
            <h2>Ground Managers Directory</h2>
            <div className="opm-gm-actions">
              <button className="opm-gm-btn opm-gm-btn-secondary">
                <FontAwesomeIcon icon={faDownload} />
                Export
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {error}
            </div>
          )}

          <div className="opm-gm-table-container">
            <table className="opm-gm-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    <div className="th-content">
                      Manager Info
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('venue')} className="sortable">
                    <div className="th-content">
                      Venue
                      {getSortIcon('venue')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('mobile')} className="sortable">
                    <div className="th-content">
                      Contact
                      {getSortIcon('mobile')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    <div className="th-content">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  console.log("Rendering table with filteredAndSortedManagers:", filteredAndSortedManagers);
                  console.log("Length:", filteredAndSortedManagers.length);
                  return filteredAndSortedManagers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        <div className="no-data-content">
                          <FontAwesomeIcon icon={faUsers} />
                          <p>No managers found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedManagers.map((manager) => (
                    <tr key={manager._id} className="manager-row">
                      <td>
                        <div className="opm-gm-manager-info">
                          <div className="manager-avatar">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                          <div className="opm-gm-manager-details">
                            <div className="opm-gm-manager-name">{manager.name || 'N/A'}</div>
                            <div className="opm-gm-manager-email">
                              <FontAwesomeIcon icon={faEnvelope} />
                              {manager.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="venue-info">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{manager.venue || 'Not Assigned'}</span>
                        </div>
                      </td>

                      <td>
                        <div className="contact-info">
                          <FontAwesomeIcon icon={faPhone} />
                          <span>{manager.mobile || 'N/A'}</span>
                        </div>
                      </td>

                      <td>
                        {editingManagerId === manager._id ? (
                          <select
                            value={editedStatus}
                            onChange={(e) => setEditedStatus(e.target.value)}
                            className="status-select"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="banned">Banned</option>
                          </select>
                        ) : (
                          <div className={`opm-gm-status opm-gm-status-${manager.status}`}>
                            {getStatusIcon(manager.status)}
                            <span>{manager.status || 'Unknown'}</span>
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">
                          {editingManagerId === manager._id ? (
                            <>
                              <button
                                className="action-btn save-btn"
                                onClick={() => handleSave(manager._id)}
                                title="Save Changes"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button
                                className="action-btn cancel-btn"
                                onClick={handleCancel}
                                title="Cancel"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEdit(manager)}
                                title="Edit Status"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button 
                                className="action-btn view-btn"
                                onClick={() => handleViewDetails(manager)}
                                title="View Details"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button className="action-btn more-btn" title="More Options">
                                <FontAwesomeIcon icon={faEllipsisV} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    ))
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manager Details Modal */}
      {showDetailsModal && selectedManager && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manager Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="manager-details">
                <div className="detail-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="label">Name:</span>
                  <span className="value">{selectedManager.name}</span>
                </div>
                <div className="detail-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span className="label">Email:</span>
                  <span className="value">{selectedManager.email}</span>
                </div>
                <div className="detail-item">
                  <FontAwesomeIcon icon={faPhone} />
                  <span className="label">Mobile:</span>
                  <span className="value">{selectedManager.mobile}</span>
                </div>
                <div className="detail-item">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span className="label">Venue:</span>
                  <span className="value">{selectedManager.venue}</span>
                </div>
                <div className="detail-item">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span className="label">Status:</span>
                  <span className={`value status-${selectedManager.status}`}>
                    {selectedManager.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseAddModal}>
          <div className="modal-content add-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Ground Manager</h3>
              <button 
                className="modal-close"
                onClick={handleCloseAddModal}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitAddManager} className="add-manager-form">
                {addManagerError && (
                  <div className="error-message">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {addManagerError}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newManager.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newManager.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={newManager.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newManager.password}
                    onChange={handleInputChange}
                    placeholder="Enter password (min 6 characters)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={newManager.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="opm-gm-btn opm-gm-btn-secondary"
                    onClick={handleCloseAddModal}
                    disabled={addManagerLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="opm-gm-btn opm-gm-btn-primary"
                    disabled={addManagerLoading}
                  >
                    {addManagerLoading ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} />
                        Add Manager
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
