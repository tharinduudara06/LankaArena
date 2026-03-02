import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faFileExport, 
  faSearch, 
  faEdit, 
  faTrash,
  faEye,
  faFilter,
  faSort,
  faDownload,
  faRefresh,
  faBox,
  faDollarSign,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './styles/opm_equipment_inventory.css';
import OPM_sideBar from './OPM_sideBar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const OPMEquipmentInventory = () => {
  const [equipments, setEquipments] = useState([]);
  const [filteredEquipments, setFilteredEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("item");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ quantity: "", price: "", status: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipments();
  }, []);

  useEffect(() => {
    filterAndSortEquipments();
  }, [equipments, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      console.log("Making API request to get equipments...");
      console.log("Request URL:", 'http://localhost:8080/api/operation-manager/get-equipments');
      console.log("With credentials:", true);
      console.log("Document cookies:", document.cookie);
      console.log("Current URL:", window.location.href);
      
      const res = await axios.get('http://localhost:8080/api/operation-manager/get-equipments', {
        withCredentials: true
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);
      console.log("Full response:", res);
      
      if (res.status === 200) {
        console.log("API Response:", res.data);
        console.log("Equipment data from API:", res.data.data);
        console.log("Equipment array length:", res.data.data?.length);
        console.log("Equipment data type:", typeof res.data.data);
        console.log("Is array:", Array.isArray(res.data.data));
        
        const equipmentData = res.data.data || [];
        console.log("Setting equipments to:", equipmentData);
        console.log("Equipment data length after setting:", equipmentData.length);
        
        setEquipments(equipmentData);
        setIsAuthenticated(true);
        
        // Force a re-render by logging the state
        setTimeout(() => {
          console.log("Equipments state after setting:", equipments);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching equipments:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      if (error.response) {
        if (error.response.status === 401) {
          navigate('/log');
        } else if (error.response.status === 500) {
          toast.error("Something went wrong!", {
            position: 'top-center',
            autoClose: 1500
          });
        } else {
          // Don't show error toast for 404 - just log it
          console.log("API returned error status:", error.response.status);
          console.log("API error message:", error.response.data?.message);
        }
      } else {
        console.error("Network error:", error);
        toast.error("Network error. Please check your connection.", {
          position: 'top-center',
          autoClose: 1500
        });
      }
      // Set empty array on any error
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEquipments = () => {
    console.log("Filtering equipments. Total equipments:", equipments.length);
    console.log("Equipments array:", equipments);
    console.log("Search term:", searchTerm);
    console.log("Status filter:", statusFilter);
    
    let filtered = equipments.filter((eq) => {
      const matchesSearch = searchTerm.trim() === "" || 
        eq.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || eq.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    console.log("Filtered equipments:", filtered.length);
    console.log("Filtered array:", filtered);

    // Sort equipments
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "price" || sortBy === "quantity") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEquipments(filtered);
  };

  const handleEdit = (equipment) => {
    setEditingId(equipment._id);
    setEditValues({ 
      quantity: equipment.quantity, 
      price: equipment.price, 
      status: equipment.status 
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ quantity: "", price: "", status: "" });
  };

  const handleSave = async (id) => {
    try {
      const res = await axios.put(`http://localhost:8080/api/operation-manager/update-equipment/${id}`, editValues, {
        withCredentials: true,
      });

      setEquipments((prev) =>
        prev.map((eq) =>
          eq._id === id ? { ...eq, ...editValues } : eq
        )
      );

      if (res.status === 200) {
        toast.success("Equipment updated successfully!", {
          position: "top-center",
          autoClose: 1500,
        });
      }

      setEditingId(null);
    } catch (err) {
      console.log(err);
      toast.error("Update failed!", {
        position: "top-center",
        autoClose: 1500,
      });
    }
  };

  const handleDelete = async (deleteId) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) {
      return;
    }

    try {
      const res = await axios.delete(`http://localhost:8080/api/operation-manager/delete-equipment/${deleteId}`, {
        withCredentials: true
      });

      if (res.status === 200) {
        setEquipments(prev => prev.filter(e => e._id !== deleteId));
        toast.success("Equipment deleted successfully!", {
          position: 'top-center',
          autoClose: 1500
        });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          navigate('/log');
        } else if (error.response.status === 404) {
          toast.error("Equipment not found!", {
            position: 'top-center',
            autoClose: 1500
          });
        } else if (error.response.status === 500) {
          toast.error("Something went wrong!", {
            position: 'top-center',
            autoClose: 1500
          });
        }
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <FontAwesomeIcon icon={faCheckCircle} className="status-icon available" />;
      case 'unavailable':
        return <FontAwesomeIcon icon={faTimesCircle} className="status-icon unavailable" />;
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon warning" />;
    }
  };

  const getStatusCount = (status) => {
    return equipments.filter(eq => eq.status === status).length;
  };

  const totalValue = equipments.reduce((sum, eq) => sum + (eq.price * eq.quantity), 0);

  if (loading) {
    return (
      <div className="opm-ei-container">
        <OPM_sideBar />
        <div className="opm-ei-main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading equipment inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="opm-ei-container">
        <OPM_sideBar />
        <div className="opm-ei-main-content">
          <div className="opm-ei-auth-error">
            <div className="opm-ei-error-content">
              <FontAwesomeIcon icon={faExclamationTriangle} className="opm-ei-error-icon" />
              <h2>Authentication Required</h2>
              <p>You need to log in as an Operation Manager to access the Equipment Inventory.</p>
              <div className="opm-ei-error-actions">
                <button 
                  className="opm-ei-btn opm-ei-btn-primary"
                  onClick={() => navigate('/log')}
                >
                  <FontAwesomeIcon icon={faRefresh} /> Go to Login
                </button>
                <button 
                  className="opm-ei-btn opm-ei-btn-outline"
                  onClick={() => window.location.reload()}
                >
                  <FontAwesomeIcon icon={faRefresh} /> Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="opm-ei-container">
      <ToastContainer />
      <OPM_sideBar />

      {/* Main Content */}
      <div className="opm-ei-main-content">
        {/* Header Section */}
        <div className="opm-ei-content-header">
          <div className='opm-ei-header-text'>
            <h1>Equipment Inventory</h1>
            <p>Manage and monitor all sports equipment and inventory</p>
          </div>
          <div className="opm-ei-header-actions">
            
            <Link to='/opm-add-new-equipment' className="opm-ei-btn opm-ei-btn-primary">
              <FontAwesomeIcon icon={faPlus} /> Add New Equipment
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="opm-ei-stats-cards">
          <div className="opm-ei-stat-card">
            <div className="opm-ei-stat-icon">
              <FontAwesomeIcon icon={faBox} />
            </div>
            <div className="opm-ei-stat-content">
              <div className="opm-ei-value">{equipments.length}</div>
              <div className="opm-ei-label">Total Items</div>
            </div>
          </div>
          
          <div className="opm-ei-stat-card">
            <div className="opm-ei-stat-icon available">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="opm-ei-stat-content">
              <div className="opm-ei-value">{getStatusCount('available')}</div>
              <div className="opm-ei-label">Available</div>
            </div>
          </div>
          
          <div className="opm-ei-stat-card">
            <div className="opm-ei-stat-icon unavailable">
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
            <div className="opm-ei-stat-content">
              <div className="opm-ei-value">{getStatusCount('unavailable')}</div>
              <div className="opm-ei-label">Unavailable</div>
            </div>
          </div>
          
         
        </div>

        {/* Filters and Search */}
        <div className="opm-ei-filters-section">
          <div className="opm-ei-filters">
            <div className="opm-ei-search-container">
              <div className="opm-ei-search-bar">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search equipment by name or serial number..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="opm-ei-filter-controls">
              <div className="opm-ei-filter-group">
                <label>Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="opm-ei-filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              
              <div className="opm-ei-filter-group">
                <label>Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="opm-ei-filter-select"
                >
                  <option value="item">Item Name</option>
                  <option value="price">Price</option>
                  <option value="quantity">Quantity</option>
                  <option value="status">Status</option>
                </select>
              </div>
              
              <button 
                className="opm-ei-sort-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <FontAwesomeIcon icon={faSort} />
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>
              
              <button 
                className="opm-ei-refresh-btn"
                onClick={fetchEquipments}
              >
                <FontAwesomeIcon icon={faRefresh} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Equipment Table */}
        <div className="opm-ei-card">
          <div className="opm-ei-card-header">
            <h2>Equipment Inventory</h2>
            <div className="opm-ei-results-count">
              Showing {filteredEquipments.length} of {equipments.length} items
            </div>
          </div>
          
          <div className="opm-ei-table-container">
            <table className="opm-ei-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Item Details</th>
                  <th>Serial Number</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {console.log("Rendering table. Filtered equipments:", filteredEquipments.length)}
                {console.log("Filtered equipments data:", filteredEquipments)}
                {filteredEquipments.length > 0 ? (
                  filteredEquipments.map((equipment) => (
                    <tr key={equipment._id} className="opm-ei-table-row">
                      <td className="opm-ei-image-cell">
                        <div className="opm-ei-equipment-image">
                          <img 
                            src={`/uploads/${equipment.image}`} 
                            alt={equipment.item}
                            onError={(e) => {
                              e.target.src = '/images/equipment.png';
                            }}
                          />
                        </div>
                      </td>
                      
                      <td className="opm-ei-item-cell">
                        <div className="opm-ei-item-details">
                          <h4>{equipment.item}</h4>
                          <p>Added: {new Date(equipment.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      
                      <td className="opm-ei-serial-cell">
                        <span className="opm-ei-serial-number">{equipment.serialNo}</span>
                      </td>

                      <td className="opm-ei-price-cell">
                        {editingId === equipment._id ? (
                          <div className="opm-ei-edit-input">
                            <span className="currency-symbol">$</span>
                            <input
                              type="number"
                              value={editValues.price}
                              onChange={(e) =>
                                setEditValues({ ...editValues, price: e.target.value })
                              }
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        ) : (
                          <span className="opm-ei-price">LKR {equipment.price}</span>
                        )}
                      </td>

                      <td className="opm-ei-quantity-cell">
                        {editingId === equipment._id ? (
                          <input
                            type="number"
                            value={editValues.quantity}
                            onChange={(e) =>
                              setEditValues({ ...editValues, quantity: e.target.value })
                            }
                            min="0"
                            className="opm-ei-edit-input"
                          />
                        ) : (
                          <span className="opm-ei-quantity">{equipment.quantity}</span>
                        )}
                      </td>

                      <td className="opm-ei-status-cell">
                        {editingId === equipment._id ? (
                          <select
                            value={editValues.status}
                            onChange={(e) =>
                              setEditValues({ ...editValues, status: e.target.value })
                            }
                            className="opm-ei-status-select"
                          >
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        ) : (
                          <div className={`opm-ei-status opm-ei-status-${equipment.status}`}>
                            {getStatusIcon(equipment.status)}
                            <span>{equipment.status}</span>
                          </div>
                        )}
                      </td>

                      <td className="opm-ei-actions-cell">
                        {editingId === equipment._id ? (
                          <div className="opm-ei-edit-actions">
                            <button 
                              onClick={() => handleSave(equipment._id)}
                              className="opm-ei-action-btn opm-ei-save-btn"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                              Save
                            </button>
                            <button 
                              onClick={handleCancel}
                              className="opm-ei-action-btn opm-ei-cancel-btn"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="opm-ei-action-buttons">
                            <button 
                              onClick={() => handleEdit(equipment)}
                              className="opm-ei-action-btn opm-ei-edit-btn"
                              title="Edit Equipment"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button 
                              onClick={() => handleDelete(equipment._id)}
                              className="opm-ei-action-btn opm-ei-delete-btn"
                              title="Delete Equipment"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="opm-ei-empty-row">
                    <td colSpan="7" className="opm-ei-empty-cell">
                      <div className="opm-ei-empty-state">
                        <FontAwesomeIcon icon={faBox} className="empty-icon" />
                        <h3>No Equipment Found</h3>
                        <p>No equipment matches your current filters. Try adjusting your search criteria.</p>
                        <Link to='/opm-add-new-equipment' className="opm-ei-btn opm-ei-btn-primary">
                          <FontAwesomeIcon icon={faPlus} /> Add First Equipment
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OPMEquipmentInventory;
