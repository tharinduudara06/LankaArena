import React, { useState, useEffect } from 'react';
import './styles/GMMaintenance.css';
import Ground_manager_sideBar from './Ground_manager_sideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTools, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faClock, 
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faSearch,
  faFilter,
  faDollarSign,
  faUser,
  faCalendarCheck,
  faWrench
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const GM_maintenance = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [showModal, setShowModal] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [grounds, setGrounds] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedGround, setSelectedGround] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    venueId: '',
    title: '',
    description: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    priority: 'medium',
    estimatedCost: '',
    assignedTo: '',
    notes: ''
  });

  // Fetch grounds on component mount
  useEffect(() => {
    fetchGrounds();
    fetchMaintenanceSchedules();
    fetchMaintenanceStats();
  }, []);

  // Add some test data for debugging
  const addTestData = async () => {
    if (grounds.length === 0) return;
    
    const testMaintenance = {
      venueId: grounds[0]._id,
      title: 'Test Maintenance',
      description: 'This is a test maintenance entry',
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      priority: 'medium',
      estimatedCost: 1000,
      assignedTo: 'Test Person',
      notes: 'Test notes'
    };

    try {
      await axios.post('http://localhost:8080/api/ground-manager/maintenance/create', testMaintenance, {
        withCredentials: true
      });
      fetchMaintenanceSchedules();
      fetchMaintenanceStats();
      alert('Test data added!');
    } catch (error) {
      console.error('Error adding test data:', error);
    }
  };

  // Fetch maintenance schedules when filters change
  useEffect(() => {
    fetchMaintenanceSchedules();
  }, [selectedGround, selectedStatus, dateRange]);

  const fetchGrounds = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ground-manager/gm-get-grounds', {
        withCredentials: true
      });
      setGrounds(response.data.data || []);
    } catch (error) {
      console.error('Error fetching grounds:', error);
    }
  };

  const fetchMaintenanceSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedGround) params.append('venueId', selectedGround);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(`http://localhost:8080/api/ground-manager/maintenance/schedules?${params}`, {
        withCredentials: true
      });
      setMaintenanceSchedules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ground-manager/maintenance/stats', {
        withCredentials: true
      });
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
      // Set default stats if error occurs
      setStats({
        totalMaintenance: 0,
        statusBreakdown: [],
        totalEstimatedCost: 0,
        totalActualCost: 0
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/ground-manager/maintenance/create', formData, {
        withCredentials: true
      });
      
      if (response.status === 201) {
        setShowModal(false);
        resetForm();
        fetchMaintenanceSchedules();
        fetchMaintenanceStats();
        alert('Maintenance scheduled successfully!');
      }
    } catch (error) {
      console.error('Error creating maintenance:', error);
      alert('Error creating maintenance schedule');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      // Find the maintenance item to get estimated cost
      const maintenance = maintenanceSchedules.find(m => m._id === id);
      const updateData = { status };
      
      // If completing maintenance and no actual cost set, use estimated cost
      if (status === 'completed' && maintenance && maintenance.estimatedCost > 0 && !maintenance.actualCost) {
        updateData.actualCost = maintenance.estimatedCost;
      }
      
      const response = await axios.put(`http://localhost:8080/api/ground-manager/maintenance/update-status/${id}`, updateData, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        fetchMaintenanceSchedules();
        fetchMaintenanceStats();
        alert('Status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance schedule?')) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/ground-manager/maintenance/delete/${id}`, {
          withCredentials: true
        });
        
        if (response.status === 200) {
          fetchMaintenanceSchedules();
          fetchMaintenanceStats();
          alert('Maintenance schedule deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting maintenance:', error);
        alert('Error deleting maintenance schedule');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      venueId: '',
      title: '',
      description: '',
      scheduledDate: '',
      startTime: '',
      endTime: '',
      priority: 'medium',
      estimatedCost: '',
      assignedTo: '',
      notes: ''
    });
    setEditingMaintenance(null);
  };

  const openModal = () => {
    setShowModal(true);
    resetForm();
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in_progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'urgent': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getStatusCount = (status) => {
    if (!stats.statusBreakdown || !Array.isArray(stats.statusBreakdown)) {
      return 0;
    }
    const statusItem = stats.statusBreakdown.find(s => s._id === status);
    return statusItem ? statusItem.count : 0;
  };

  const getTotalCost = () => {
    // Use actual cost if available, otherwise use estimated cost
    const actualCost = stats.totalActualCost || 0;
    const estimatedCost = stats.totalEstimatedCost || 0;
    
    // If we have actual costs, use them; otherwise use estimated costs
    return actualCost > 0 ? actualCost : estimatedCost;
  };

  const filteredSchedules = maintenanceSchedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.venue.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className='gmm-body'>
      <Ground_manager_sideBar />
      
      <div className="gmm-content">
        {/* Header */}
        <div className="gmm-header">
          <h1>Maintenance Management</h1>
          <p>Schedule and manage maintenance for your grounds</p>
          
        </div>

        {/* Tabs */}
        <div className="gmm-tabs">
          <button 
            className={`gmm-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            Schedule Maintenance
          </button>
          <button 
            className={`gmm-tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <FontAwesomeIcon icon={faEye} />
            View Schedules
          </button>
        </div>

        {/* Stats Cards */}
        <div className="gmm-stats">
          <div className="gmm-stat-card">
            <div className="gmm-stat-icon total">
              <FontAwesomeIcon icon={faWrench} />
            </div>
            <div className="gmm-stat-content">
              <h3>{stats.totalMaintenance || 0}</h3>
              <p>Total Maintenance</p>
            </div>
          </div>
          
          <div className="gmm-stat-card">
            <div className="gmm-stat-icon pending">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="gmm-stat-content">
              <h3>{getStatusCount('pending')}</h3>
              <p>Pending</p>
            </div>
          </div>
          
          <div className="gmm-stat-card">
            <div className="gmm-stat-icon completed">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="gmm-stat-content">
              <h3>{getStatusCount('completed')}</h3>
              <p>Completed</p>
            </div>
          </div>
          
          <div className="gmm-stat-card">
            <div className="gmm-stat-icon cost">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <div className="gmm-stat-content">
              <h3>Rs. {getTotalCost().toLocaleString()}</h3>
              <p>Total Cost</p>
            </div>
          </div>
        </div>

        {/* Schedule Maintenance Tab */}
        {activeTab === 'schedule' && (
          <div className="gmm-schedule-section">
            <div className="gmm-section-header">
              <h2>Schedule New Maintenance</h2>
              <button className="gmm-primary-btn" onClick={openModal}>
                <FontAwesomeIcon icon={faPlus} />
                Schedule Maintenance
              </button>
            </div>

            <div className="gmm-quick-actions">
              <div className="gmm-action-card">
                <FontAwesomeIcon icon={faTools} />
                <h3>Equipment Maintenance</h3>
                <p>Schedule regular equipment checks and repairs</p>
              </div>
              <div className="gmm-action-card">
                <FontAwesomeIcon icon={faCalendarCheck} />
                <h3>Field Maintenance</h3>
                <p>Plan field preparation and restoration work</p>
              </div>
              <div className="gmm-action-card">
                <FontAwesomeIcon icon={faWrench} />
                <h3>Facility Repairs</h3>
                <p>Schedule building and facility maintenance</p>
              </div>
            </div>
          </div>
        )}

        {/* View Schedules Tab */}
        {activeTab === 'view' && (
          <div className="gmm-view-section">
            <div className="gmm-section-header">
              <h2>Maintenance Schedules</h2>
              <div className="gmm-filters">
                <div className="gmm-filter-group">
                  <label>Ground:</label>
                  <select 
                    value={selectedGround} 
                    onChange={(e) => setSelectedGround(e.target.value)}
                    className="gmm-select"
                  >
                    <option value="">All Grounds</option>
                    {grounds.map(ground => (
                      <option key={ground._id} value={ground._id}>
                        {ground.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="gmm-filter-group">
                  <label>Status:</label>
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="gmm-select"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="gmm-filter-group">
                  <label>Search:</label>
                  <input
                    type="text"
                    placeholder="Search maintenance..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="gmm-search-input"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="gmm-loading">Loading maintenance schedules...</div>
            ) : filteredSchedules.length === 0 ? (
              <div className="gmm-no-data">
                <FontAwesomeIcon icon={faTools} />
                <h3>No maintenance schedules found</h3>
                <p>No maintenance schedules match your current filters.</p>
              </div>
            ) : (
              <div className="gmm-schedules-grid">
                {filteredSchedules.map(schedule => (
                  <div key={schedule._id} className="gmm-schedule-card">
                    <div className="gmm-schedule-header">
                      <div className="gmm-schedule-status">
                        <span 
                          className="gmm-status-badge"
                          style={{ backgroundColor: getStatusColor(schedule.status) }}
                        >
                          {schedule.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span 
                          className="gmm-priority-badge"
                          style={{ backgroundColor: getPriorityColor(schedule.priority) }}
                        >
                          {schedule.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="gmm-schedule-actions">
                        <button 
                          className="gmm-action-btn edit"
                          onClick={() => setEditingMaintenance(schedule)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className="gmm-action-btn delete"
                          onClick={() => handleDelete(schedule._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    <div className="gmm-schedule-content">
                      <h3>{schedule.title}</h3>
                      <p className="gmm-schedule-description">{schedule.description}</p>
                      
                      <div className="gmm-schedule-details">
                        <div className="gmm-detail-row">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{schedule.venue.name}</span>
                        </div>
                        <div className="gmm-detail-row">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          <span>{new Date(schedule.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="gmm-detail-row">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                        {schedule.assignedTo && (
                          <div className="gmm-detail-row">
                            <FontAwesomeIcon icon={faUser} />
                            <span>{schedule.assignedTo}</span>
                          </div>
                        )}
                        {schedule.estimatedCost > 0 && (
                          <div className="gmm-detail-row">
                            <FontAwesomeIcon icon={faDollarSign} />
                            <span>
                              {schedule.actualCost > 0 
                                ? `Rs. ${schedule.actualCost.toLocaleString()} (Actual)`
                                : `Rs. ${schedule.estimatedCost.toLocaleString()} (Est.)`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="gmm-schedule-footer">
                        <div className="gmm-status-actions">
                          {schedule.status === 'pending' && (
                            <button 
                              className="gmm-status-btn in-progress"
                              onClick={() => handleUpdateStatus(schedule._id, 'in_progress')}
                            >
                              Start
                            </button>
                          )}
                          {schedule.status === 'in_progress' && (
                            <button 
                              className="gmm-status-btn completed"
                              onClick={() => handleUpdateStatus(schedule._id, 'completed')}
                            >
                              Complete
                            </button>
                          )}
                          {(schedule.status === 'pending' || schedule.status === 'in_progress') && (
                            <button 
                              className="gmm-status-btn cancelled"
                              onClick={() => handleUpdateStatus(schedule._id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="gmm-modal-overlay" onClick={closeModal}>
            <div className="gmm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="gmm-modal-header">
                <h2>Schedule Maintenance</h2>
                <button className="gmm-close-btn" onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="gmm-form">
                <div className="gmm-form-row">
                  <div className="gmm-form-group">
                    <label>Ground *</label>
                    <select
                      value={formData.venueId}
                      onChange={(e) => setFormData({...formData, venueId: e.target.value})}
                      required
                      className="gmm-form-input"
                    >
                      <option value="">Select Ground</option>
                      {grounds.map(ground => (
                        <option key={ground._id} value={ground._id}>
                          {ground.name} - {ground.location.city}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="gmm-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      className="gmm-form-input"
                      placeholder="Maintenance title"
                    />
                  </div>
                </div>

                <div className="gmm-form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="gmm-form-textarea"
                    placeholder="Describe the maintenance work to be done"
                    rows="3"
                  />
                </div>

                <div className="gmm-form-row">
                  <div className="gmm-form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      required
                      className="gmm-form-input"
                    />
                  </div>
                  
                  <div className="gmm-form-group">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      required
                      className="gmm-form-input"
                    />
                  </div>
                  
                  <div className="gmm-form-group">
                    <label>End Time *</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      required
                      className="gmm-form-input"
                    />
                  </div>
                </div>

                <div className="gmm-form-row">
                  <div className="gmm-form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="gmm-form-input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div className="gmm-form-group">
                    <label>Estimated Cost (Rs.)</label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                      className="gmm-form-input"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="gmm-form-group">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="gmm-form-textarea"
                    placeholder="Additional notes or instructions"
                    rows="2"
                  />
                </div>

                <div className="gmm-form-actions">
                  <button type="button" onClick={closeModal} className="gmm-secondary-btn">
                    Cancel
                  </button>
                  <button type="submit" className="gmm-primary-btn">
                    Schedule Maintenance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GM_maintenance;
