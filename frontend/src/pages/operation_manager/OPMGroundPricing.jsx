import React, { useState, useEffect } from 'react';
import './styles/opm_ground_pricing.css';
import OPM_sideBar from './OPM_sideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSave, faClose, faEdit, faSpinner, faCheck, faTimes, faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';

const OPMGroundPricing = () => {
  const [activeTab, setActiveTab] = useState('grounds');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Data states
  const [venues, setVenues] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  
  // Search states
  const [venueSearch, setVenueSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  
  // Edit states
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editData, setEditData] = useState({});

  // Fetch venues data
  const fetchVenues = async () => {
    try {
      setLoading(true);
      console.log('Fetching venues from:', 'http://localhost:8080/api/operation-manager/get-venues');
      
      const response = await fetch('http://localhost:8080/api/operation-manager/get-venues', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch venues: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      setVenues(data.data || []);
      setFilteredVenues(data.data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError(`Failed to load venues data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch equipment data
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      console.log('Fetching equipment from:', 'http://localhost:8080/api/operation-manager/get-equipments');
      
      const response = await fetch('http://localhost:8080/api/operation-manager/get-equipments', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch equipment: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      setEquipment(data.data || []);
      setFilteredEquipment(data.data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setError(`Failed to load equipment data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'grounds') {
      fetchVenues();
    } else {
      fetchEquipment();
    }
  }, [activeTab]);

  // Filter venues based on search
  useEffect(() => {
    const filtered = venues.filter(venue =>
      venue.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
      venue.location.city.toLowerCase().includes(venueSearch.toLowerCase())
    );
    setFilteredVenues(filtered);
  }, [venues, venueSearch]);

  // Filter equipment based on search
  useEffect(() => {
    const filtered = equipment.filter(item =>
      item.item.toLowerCase().includes(equipmentSearch.toLowerCase())
    );
    setFilteredEquipment(filtered);
  }, [equipment, equipmentSearch]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  // Handle venue price update
  const handleVenuePriceUpdate = async (venueId, field, value) => {
    try {
      setSaving(prev => ({ ...prev, [venueId]: true }));
      
      const response = await fetch(`http://localhost:8080/api/operation-manager/update-venue-pricing/${venueId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update venue pricing');
      }

      // Update local state
      setVenues(prev => prev.map(venue => 
        venue._id === venueId ? { ...venue, [field]: value } : venue
      ));
      
      setSuccess('Venue pricing updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating venue pricing:', error);
      setError('Failed to update venue pricing');
    } finally {
      setSaving(prev => ({ ...prev, [venueId]: false }));
    }
  };

  // Handle equipment price update
  const handleEquipmentPriceUpdate = async (equipmentId, field, value) => {
    try {
      setSaving(prev => ({ ...prev, [equipmentId]: true }));
      
      const response = await fetch(`http://localhost:8080/api/operation-manager/update-equipment/${equipmentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update equipment pricing');
      }

      // Update local state
      setEquipment(prev => prev.map(item => 
        item._id === equipmentId ? { ...item, [field]: value } : item
      ));
      
      setSuccess('Equipment pricing updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating equipment pricing:', error);
      setError('Failed to update equipment pricing');
    } finally {
      setSaving(prev => ({ ...prev, [equipmentId]: false }));
    }
  };

  // Handle edit mode
  const handleEdit = (type, id, data) => {
    if (type === 'venue') {
      setEditingVenue(id);
      setEditData({ ...data });
    } else {
      setEditingEquipment(id);
      setEditData({ ...data });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingVenue(null);
    setEditingEquipment(null);
    setEditData({});
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (editingVenue) {
      await handleVenuePriceUpdate(editingVenue, 'price', editData.price);
      setEditingVenue(null);
    } else if (editingEquipment) {
      await handleEquipmentPriceUpdate(editingEquipment, 'price', editData.price);
      setEditingEquipment(null);
    }
    setEditData({});
  };

  return (
    <div className="opm-pr-container">
      <OPM_sideBar />

      <div className="opm-pr-main-content">
        <div className="opm-pr-content-header">
          <div>
            <h1>Pricing Management</h1>
            <p>Manage pricing for grounds and equipment in real-time</p>
          </div>
          <div className="opm-pr-header-actions">
            <button 
              className="opm-pr-btn opm-pr-btn-secondary"
              onClick={() => activeTab === 'grounds' ? fetchVenues() : fetchEquipment()}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSpinner} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="opm-pr-alert opm-pr-alert-success">
            <FontAwesomeIcon icon={faCheck} />
            {success}
          </div>
        )}
        {error && (
          <div className="opm-pr-alert opm-pr-alert-error">
            <FontAwesomeIcon icon={faTimes} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="opm-pr-tabs">
          <div 
            className={`opm-pr-tab ${activeTab === 'grounds' ? 'active' : ''}`} 
            onClick={() => handleTabChange('grounds')}
          >
            <FontAwesomeIcon icon={faFilter} />
            Grounds Pricing
          </div>
          <div 
            className={`opm-pr-tab ${activeTab === 'equipment' ? 'active' : ''}`} 
            onClick={() => handleTabChange('equipment')}
          >
            <FontAwesomeIcon icon={faFilter} />
            Equipment Pricing
          </div>
        </div>

        {/* Grounds Pricing Card */}
        {activeTab === 'grounds' && (
          <div className="opm-pr-card" id="groundsCard">
            <div className="opm-pr-card-header">
              <h2>
                <FontAwesomeIcon icon={faFilter} />
                Grounds Pricing
              </h2>
              <div className="opm-pr-search-bar">
                <input 
                  type="text" 
                  placeholder="Search grounds by name or city..." 
                  value={venueSearch}
                  onChange={(e) => setVenueSearch(e.target.value)}
                />
                <button>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="opm-pr-loading">
                <FontAwesomeIcon icon={faSpinner} className="spinning" />
                Loading venues...
              </div>
            ) : (
              <div className="opm-pr-table-container">
                <table className="opm-pr-table">
                  <thead>
                    <tr>
                      <th className="opm-pr-th">Ground Name</th>
                      <th className="opm-pr-th">Location</th>
                      <th className="opm-pr-th">Current Rate (Rs.)</th>
                      <th className="opm-pr-th">Status</th>
                      <th className="opm-pr-th">Manager</th>
                      <th className="opm-pr-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="opm-pr-tbody">
                    {filteredVenues.map(venue => (
                      <tr key={venue._id}>
                        <td className="opm-pr-td">
                          <div className="opm-pr-venue-info">
                            <strong>{venue.name}</strong>
                            {venue.facilities && venue.facilities.length > 0 && (
                              <div className="opm-pr-facilities">
                                {venue.facilities.slice(0, 2).map((facility, index) => (
                                  <span key={index} className="opm-pr-facility-tag">
                                    {facility}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="opm-pr-td">
                          <div className="opm-pr-location">
                            <div>{venue.location.city}</div>
                            <small>{venue.location.address}</small>
                          </div>
                        </td>
                        <td className="opm-pr-td">
                          {editingVenue === venue._id ? (
                            <input 
                              type="number" 
                              className="opm-pr-price-input" 
                              value={editData.price || venue.price}
                              onChange={(e) => setEditData({...editData, price: parseInt(e.target.value)})}
                            />
                          ) : (
                            <span className="opm-pr-price">Rs. {venue.price?.toLocaleString() || 0}</span>
                          )}
                        </td>
                        <td className="opm-pr-td">
                          <span className={`opm-pr-badge ${venue.status === 'active' ? 'opm-pr-badge-active' : 'opm-pr-badge-inactive'}`}>
                            {venue.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="opm-pr-td">
                          <div className="opm-pr-manager">
                            <div>{venue.ground_manager?.name || 'N/A'}</div>
                            <small>{venue.ground_manager?.email || ''}</small>
                          </div>
                        </td>
                        <td className="opm-pr-td">
                          {editingVenue === venue._id ? (
                            <div className="opm-pr-edit-actions">
                              <button 
                                className="opm-pr-action-btn opm-pr-save-btn" 
                                onClick={handleSaveEdit}
                                disabled={saving[venue._id]}
                              >
                                {saving[venue._id] ? (
                                  <FontAwesomeIcon icon={faSpinner} className="spinning" />
                                ) : (
                                  <FontAwesomeIcon icon={faSave} />
                                )}
                              </button>
                              <button 
                                className="opm-pr-action-btn opm-pr-cancel-btn"
                                onClick={handleCancelEdit}
                              >
                                <FontAwesomeIcon icon={faClose} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="opm-pr-action-btn opm-pr-edit-btn"
                              onClick={() => handleEdit('venue', venue._id, { price: venue.price })}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredVenues.length === 0 && !loading && (
                  <div className="opm-pr-empty">
                    <FontAwesomeIcon icon={faFilter} />
                    <p>No venues found matching your search criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Equipment Pricing Card */}
        {activeTab === 'equipment' && (
          <div className="opm-pr-card" id="equipmentCard">
            <div className="opm-pr-card-header">
              <h2>
                <FontAwesomeIcon icon={faFilter} />
                Equipment Pricing
              </h2>
              <div className="opm-pr-search-bar">
                <input 
                  type="text" 
                  placeholder="Search equipment..." 
                  value={equipmentSearch}
                  onChange={(e) => setEquipmentSearch(e.target.value)}
                />
                <button>
                  <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="opm-pr-loading">
                <FontAwesomeIcon icon={faSpinner} className="spinning" />
                Loading equipment...
              </div>
            ) : (
              <div className="opm-pr-table-container">
                <table className="opm-pr-table">
                  <thead>
                    <tr>
                      <th className="opm-pr-th">Equipment Name</th>
                      <th className="opm-pr-th">Serial No.</th>
                      <th className="opm-pr-th">Rental Rate (Rs./hr)</th>
                      <th className="opm-pr-th">Quantity</th>
                      <th className="opm-pr-th">Status</th>
                      <th className="opm-pr-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="opm-pr-tbody">
                    {filteredEquipment.map(item => (
                      <tr key={item._id}>
                        <td className="opm-pr-td">
                          <div className="opm-pr-equipment-info">
                            <strong>{item.item}</strong>
                            <div className="opm-pr-equipment-image">
                              {item.image ? (
                                <img 
                                  src={`/uploads/${item.image}`} 
                                  alt={item.item}
                                  onError={(e) => {
                                    console.log('Image failed to load:', `/uploads/${item.image}`);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  background: '#f0f0f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#999',
                                  fontSize: '12px'
                                }}>
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="opm-pr-td">
                          <span className="opm-pr-serial">{item.serialNo || 'N/A'}</span>
                        </td>
                        <td className="opm-pr-td">
                          {editingEquipment === item._id ? (
                            <input 
                              type="number" 
                              className="opm-pr-price-input" 
                              value={editData.price !== undefined ? editData.price : (item.price || 0)}
                              onChange={(e) => setEditData({...editData, price: parseInt(e.target.value) || 0})}
                            />
                          ) : (
                            <span className="opm-pr-price">Rs. {(item.price || 0).toLocaleString()}</span>
                          )}
                        </td>
                        <td className="opm-pr-td">
                          <span className="opm-pr-quantity">{item.quantity || 0}</span>
                        </td>
                        <td className="opm-pr-td">
                          <span className={`opm-pr-badge ${item.status === 'available' ? 'opm-pr-badge-active' : 'opm-pr-badge-inactive'}`}>
                            {item.status === 'available' ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="opm-pr-td">
                          {editingEquipment === item._id ? (
                            <div className="opm-pr-edit-actions">
                              <button 
                                className="opm-pr-action-btn opm-pr-save-btn" 
                                onClick={handleSaveEdit}
                                disabled={saving[item._id]}
                              >
                                {saving[item._id] ? (
                                  <FontAwesomeIcon icon={faSpinner} className="spinning" />
                                ) : (
                                  <FontAwesomeIcon icon={faSave} />
                                )}
                              </button>
                              <button 
                                className="opm-pr-action-btn opm-pr-cancel-btn"
                                onClick={handleCancelEdit}
                              >
                                <FontAwesomeIcon icon={faClose} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="opm-pr-action-btn opm-pr-edit-btn"
                              onClick={() => handleEdit('equipment', item._id, { 
                                price: item.price || 0
                              })}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEquipment.length === 0 && !loading && (
                  <div className="opm-pr-empty">
                    <FontAwesomeIcon icon={faFilter} />
                    <p>No equipment found matching your search criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OPMGroundPricing;