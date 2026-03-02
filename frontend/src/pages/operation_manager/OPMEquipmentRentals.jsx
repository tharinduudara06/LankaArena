import React, { useEffect, useState, useCallback } from 'react';
import './styles/opm_equipments_rentals.css';
import OPM_sideBar from './OPM_sideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEdit, 
  faTrash, 
  faCheck, 
  faTimes, 
  faClock, 
  faDollarSign,
  faChartLine,
  faFilter,
  faSearch,
  faDownload,
  faRefresh,
  faPlus,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faClockFour
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OPMEquipmentRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRental, setSelectedRental] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState('all');
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const [rentalPage, setRentalPage] = useState(1);
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0
  });

  const navigate = useNavigate();

  // Real-time data fetching
  const fetchRentals = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/operation-manager/get-rentals', {
        withCredentials: true
      });

      if (res.status === 200) {
        setRentals(res.data.data);
        setFilteredRentals(res.data.data);
        calculateStats(res.data.data);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          navigate('/login');
        } else if (error.response.status === 404) {
          toast.error("Rentals not found!", { autoClose: 1500 });
        } else if (error.response.status === 500) {
          toast.error("Internal server error!", { autoClose: 1500 });
        }
      }
    }
  }, [navigate]);

  const fetchEquipments = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/operation-manager/get-equipments', {
        withCredentials: true
      });

      if (res.status === 200) {
        setEquipments(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching equipments:', error);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (rentalData) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalRevenue = rentalData.reduce((sum, rental) => sum + (rental.fullPrice || 0), 0);
    const weeklyRevenue = rentalData
      .filter(rental => new Date(rental.rentDate) >= oneWeekAgo)
      .reduce((sum, rental) => sum + (rental.fullPrice || 0), 0);
    
    // Fix monthly revenue calculation - filter by current month
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRevenue = rentalData
      .filter(rental => {
        const rentalDate = new Date(rental.rentDate);
        return rentalDate.getMonth() === currentMonth && rentalDate.getFullYear() === currentYear;
      })
      .reduce((sum, rental) => sum + (rental.fullPrice || 0), 0);

    const activeRentals = rentalData.filter(rental => rental.status === 'active').length;
    const completedRentals = rentalData.filter(rental => rental.status === 'completed').length;

    setStats({
      totalRentals: rentalData.length,
      activeRentals,
      completedRentals,
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue
    });
  };

  // Real-time updates
  useEffect(() => {
    fetchRentals();
    fetchEquipments();
    setLoading(false);

    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchRentals().finally(() => setRefreshing(false));
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRentals, fetchEquipments]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = rentals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rental => 
        (rental.equipment?.item?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rental => rental.status === statusFilter);
    }

    // Equipment filter
    if (equipmentFilter !== 'all') {
      filtered = filtered.filter(rental => rental.equipment?.item === equipmentFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(rental => {
        const rentalDate = new Date(rental.rentDate);
        switch (dateFilter) {
          case 'today':
            return rentalDate.toDateString() === now.toDateString();
          case 'week':
            return rentalDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return rentalDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          default:
            return true;
        }
      });
    }

    setFilteredRentals(filtered);
    setRentalPage(1); // Reset to first page when filters change
  }, [rentals, searchTerm, statusFilter, equipmentFilter, dateFilter]);

  // Equipment filtering and pagination
  const filteredEquipments = equipments.filter(equipment => {
    // Category filter
    if (equipmentCategoryFilter !== 'all') {
      // You can add category logic here if you have categories in your equipment model
      return true; // For now, show all
    }
    
    // Search filter
    if (equipmentSearchTerm) {
      return equipment.item?.toLowerCase().includes(equipmentSearchTerm.toLowerCase()) ||
             equipment.serialNo?.toLowerCase().includes(equipmentSearchTerm.toLowerCase());
    }
    
    return true;
  });

  // Reset equipment pagination when filters change
  useEffect(() => {
    setEquipmentPage(1);
  }, [equipmentSearchTerm, equipmentCategoryFilter]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);
  const startIndex = (equipmentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEquipments = filteredEquipments.slice(startIndex, endIndex);

  // Rental pagination
  const rentalItemsPerPage = 10;
  const rentalTotalPages = Math.ceil(filteredRentals.length / rentalItemsPerPage);
  const rentalStartIndex = (rentalPage - 1) * rentalItemsPerPage;
  const rentalEndIndex = rentalStartIndex + rentalItemsPerPage;
  const paginatedRentals = filteredRentals.slice(rentalStartIndex, rentalEndIndex);

  // Update rental status
  const updateRentalStatus = async (rentalId, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/operation-manager/update-rental-status/${rentalId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success(`Rental status updated to ${newStatus}`, { autoClose: 2000 });
        fetchRentals(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to update rental status', { autoClose: 2000 });
      console.error('Error updating rental status:', error);
    }
  };

  // Download PDF report
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Equipment Rentals Report', 14, 22);
    
    // Stats
    doc.setFontSize(12);
    doc.text(`Total Rentals: ${stats.totalRentals}`, 14, 32);
    doc.text(`Active Rentals: ${stats.activeRentals}`, 14, 40);
    doc.text(`Completed Rentals: ${stats.completedRentals}`, 14, 48);
    doc.text(`Total Revenue: Rs. ${stats.totalRevenue.toLocaleString()}`, 14, 56);
    doc.text(`Monthly Revenue: Rs. ${stats.monthlyRevenue.toLocaleString()}`, 14, 64);
    
    // Table
    const tableColumn = [
      "Equipment",
      "Customer",
      "Quantity",
      "Price",
      "Date",
      "Start Time",
      "End Time",
      "Status"
    ];
    
    const tableRows = filteredRentals.map(rental => {
      const rentDateLocal = new Date(rental.rentDate).toLocaleDateString();
      const startTimeLocal = new Date(rental.startTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      const endTimeLocal = new Date(rental.endTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      
      return [
        rental.equipment?.item || "N/A",
        rental.user?.name || rental.user?.username || "Unknown",
        rental.quantity,
        `Rs. ${rental.fullPrice}`,
        rentDateLocal,
        startTimeLocal,
        endTimeLocal,
        rental.status
      ];
    });
    
    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [86, 214, 204] }
    });
    
    doc.save('equipment_rentals_report.pdf');
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'opm-er-badge-success';
      case 'completed':
        return 'opm-er-badge-primary';
      case 'cancelled':
        return 'opm-er-badge-danger';
      case 'upcoming':
        return 'opm-er-badge-warning';
      default:
        return 'opm-er-badge-primary';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return faCheckCircle;
      case 'completed':
        return faCheck;
      case 'cancelled':
        return faTimesCircle;
      case 'upcoming':
        return faClockFour;
      default:
        return faClock;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="opm-er-container">
        <OPM_sideBar />
        <div className="opm-er-main-content">
          <div className="opm-er-loading">
            <div className="opm-er-spinner"></div>
            <p>Loading equipment rentals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="opm-er-container">
      <OPM_sideBar />
      
      {/* Main Content */}
      <div className="opm-er-main-content">
        {/* Header */}
        <div className="opm-er-content-header">
          <div>
            <h1>Equipment Rentals</h1>
            <p>Manage and track all equipment rentals across venues</p>
          </div>
          <div className="opm-er-header-actions">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchRentals().finally(() => setRefreshing(false));
              }}
              className="opm-er-btn opm-er-btn-secondary"
              disabled={refreshing}
            >
              <FontAwesomeIcon icon={faRefresh} className={refreshing ? 'fa-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={downloadPDF}
              className="opm-er-btn opm-er-btn-primary"
            >
              <FontAwesomeIcon icon={faDownload} />
              Export Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="opm-er-filters">
          <div className="opm-er-filter-group">
            <div className="opm-er-filter-item">
              <label htmlFor="search">
                <FontAwesomeIcon icon={faSearch} />
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search equipment or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="opm-er-filter-item">
              <label htmlFor="status">
                <FontAwesomeIcon icon={faFilter} />
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="opm-er-filter-item">
              <label htmlFor="equipment">Equipment</label>
              <select
                id="equipment"
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
              >
                <option value="all">All Equipment</option>
                {equipments.map((equipment) => (
                  <option key={equipment._id} value={equipment.item}>
                    {equipment.item}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="opm-er-filter-item">
              <label htmlFor="date">Date Range</label>
              <select
                id="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="opm-er-stats-cards">
          <div className="opm-er-stat-card">
            <div className="opm-er-stat-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div className="opm-er-stat-content">
              <div className="opm-er-label">Total Rentals</div>
              <div className="opm-er-value">{stats.totalRentals}</div>
            </div>
          </div>
          
          <div className="opm-er-stat-card">
            <div className="opm-er-stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="opm-er-stat-content">
              <div className="opm-er-label">Active Rentals</div>
              <div className="opm-er-value">{stats.activeRentals}</div>
            </div>
          </div>
          
          <div className="opm-er-stat-card">
            <div className="opm-er-stat-icon">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <div className="opm-er-stat-content">
              <div className="opm-er-label">Total Revenue</div>
              <div className="opm-er-value">{formatCurrency(stats.totalRevenue)}</div>
            </div>
          </div>
          
          <div className="opm-er-stat-card">
            <div className="opm-er-stat-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="opm-er-stat-content">
              <div className="opm-er-label">Monthly Revenue</div>
              <div className="opm-er-value">{formatCurrency(stats.monthlyRevenue)}</div>
            </div>
          </div>
        </div>

        {/* Rentals Table */}
        <div className="opm-er-card">
          <div className="opm-er-card-header">
            <h2>Equipment Rentals</h2>
            <div className="opm-er-card-actions">
              <span className="opm-er-results-count">
                Showing {rentalStartIndex + 1}-{Math.min(rentalEndIndex, filteredRentals.length)} of {filteredRentals.length} rentals
              </span>
            </div>
          </div>
          
          <div className="opm-er-card-table">
            <table className="opm-er-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRentals.length > 0 ? (
                  paginatedRentals.map((rental) => (
                    <tr key={rental._id}>
                      <td className="opm-er-td">
                        <div className="opm-er-equipment-info">
                          <div className="opm-er-equipment-icon">
                            {rental.equipment?.image ? (
                              <img 
                                src={`http://localhost:3000/uploads/${rental.equipment.image}`} 
                                alt={rental.equipment.item}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <i className="fas fa-baseball-ball" style={{ display: rental.equipment?.image ? 'none' : 'flex' }}></i>
                          </div>
                          <div>
                            <div className="opm-er-equipment-name">
                              {rental.equipment?.item || "N/A"}
                            </div>
                            <div className="opm-er-equipment-serial">
                              {rental.equipment?.serialNo || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="opm-er-td">
                        <div className="opm-er-customer-info">
                          <div className="opm-er-customer-name">
                            {rental.user?.name || rental.user?.username || "Unknown User"}
                          </div>
                          <div className="opm-er-customer-email">
                            {rental.user?.email || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="opm-er-td">
                        <span className="opm-er-quantity">{rental.quantity}</span>
                      </td>
                      <td className="opm-er-td">
                        <span className="opm-er-price">{formatCurrency(rental.fullPrice)}</span>
                      </td>
                      <td className="opm-er-td">
                        <span className="opm-er-date">{formatDate(rental.rentDate)}</span>
                      </td>
                      <td className="opm-er-td">
                        <div className="opm-er-time-slot">
                          <div className="opm-er-time-start">
                            {formatTime(rental.startTime)}
                          </div>
                          <div className="opm-er-time-separator">-</div>
                          <div className="opm-er-time-end">
                            {formatTime(rental.endTime)}
                          </div>
                        </div>
                      </td>
                      <td className="opm-er-td">
                        <span className={`opm-er-badge ${getStatusBadgeClass(rental.status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(rental.status)} />
                          {rental.status}
                        </span>
                      </td>
                      <td className="opm-er-td">
                        <div className="opm-er-action-buttons">
                          <button
                            className="opm-er-action-btn opm-er-btn-view"
                            onClick={() => {
                              setSelectedRental(rental);
                              setShowModal(true);
                            }}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          
                          {rental.status === 'active' && (
                            <button
                              className="opm-er-action-btn opm-er-btn-complete"
                              onClick={() => updateRentalStatus(rental._id, 'completed')}
                              title="Mark as Completed"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="opm-er-no-data">
                      <div className="opm-er-empty-state">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <p>No rentals found matching your criteria</p>
                        <button
                          className="opm-er-btn opm-er-btn-primary"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setEquipmentFilter('all');
                            setDateFilter('all');
                          }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Rental Pagination */}
          {rentalTotalPages > 1 && (
            <div className="opm-er-rental-pagination">
              <div className="opm-er-pagination-info">
                Showing {rentalStartIndex + 1}-{Math.min(rentalEndIndex, filteredRentals.length)} of {filteredRentals.length} rentals
              </div>
              <div className="opm-er-pagination-controls">
                <button
                  className="opm-er-pagination-btn"
                  onClick={() => setRentalPage(prev => Math.max(prev - 1, 1))}
                  disabled={rentalPage === 1}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Previous
                </button>
                
                <div className="opm-er-pagination-numbers">
                  {Array.from({ length: Math.min(rentalTotalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (rentalTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (rentalPage <= 3) {
                      pageNum = i + 1;
                    } else if (rentalPage >= rentalTotalPages - 2) {
                      pageNum = rentalTotalPages - 4 + i;
                    } else {
                      pageNum = rentalPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`opm-er-pagination-btn ${rentalPage === pageNum ? 'active' : ''}`}
                        onClick={() => setRentalPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  className="opm-er-pagination-btn"
                  onClick={() => setRentalPage(prev => Math.min(prev + 1, rentalTotalPages))}
                  disabled={rentalPage === rentalTotalPages}
                >
                  Next
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Equipment Availability */}
        <div className="opm-er-card">
          <div className="opm-er-card-header">
            <h2>Equipment Availability</h2>
            <div className="opm-er-actions">
              <div className="opm-er-equipment-filters">
                <div className="opm-er-equipment-search">
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={equipmentSearchTerm}
                    onChange={(e) => setEquipmentSearchTerm(e.target.value)}
                  />
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <select
                  value={equipmentCategoryFilter}
                  onChange={(e) => setEquipmentCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                  <option value="tennis">Tennis</option>
                  <option value="basketball">Basketball</option>
                  <option value="badminton">Badminton</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="opm-er-equipment-grid">
            {paginatedEquipments.map((equipment) => {
              const availableQuantity = equipment.quantity || 0;
              const isLowStock = availableQuantity <= 5;
              const isOutOfStock = availableQuantity === 0;
              
              return (
                <div key={equipment._id} className="opm-er-equipment-card">
                  <div className="opm-er-equipment-image">
                    {equipment.image ? (
                      <img 
                        src={`http://localhost:3000/uploads/${equipment.image}`} 
                        alt={equipment.item}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="opm-er-equipment-icon" style={{ display: equipment.image ? 'none' : 'flex' }}>
                      <i className="fas fa-baseball-ball"></i>
                    </div>
                  </div>
                  
                  <div className="opm-er-equipment-details">
                    <h3>{equipment.item}</h3>
                    <p><strong>Serial:</strong> {equipment.serialNo}</p>
                    <p><strong>Available:</strong> {availableQuantity}</p>
                    <p><strong>Daily Rate:</strong> {formatCurrency(equipment.price)}</p>
                  </div>
                  
                  <div className="opm-er-equipment-status">
                    <span className={`opm-er-badge ${
                      isOutOfStock ? 'opm-er-badge-danger' : 
                      isLowStock ? 'opm-er-badge-warning' : 
                      'opm-er-badge-success'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : 
                       isLowStock ? 'Low Stock' : 
                       'In Stock'}
                    </span>
                    <button className="opm-er-btn opm-er-btn-secondary">
                      <FontAwesomeIcon icon={faEye} />
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Equipment Pagination */}
          {totalPages > 1 && (
            <div className="opm-er-equipment-pagination">
              <div className="opm-er-pagination-info">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredEquipments.length)} of {filteredEquipments.length} equipments
              </div>
              <div className="opm-er-pagination-controls">
                <button
                  className="opm-er-pagination-btn"
                  onClick={() => setEquipmentPage(prev => Math.max(prev - 1, 1))}
                  disabled={equipmentPage === 1}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Previous
                </button>
                
                <div className="opm-er-pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`opm-er-pagination-btn ${equipmentPage === page ? 'active' : ''}`}
                      onClick={() => setEquipmentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  className="opm-er-pagination-btn"
                  onClick={() => setEquipmentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={equipmentPage === totalPages}
                >
                  Next
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rental Details Modal */}
      {showModal && selectedRental && (
        <div className="opm-er-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="opm-er-modal" onClick={(e) => e.stopPropagation()}>
            <div className="opm-er-modal-header">
              <h3>Rental Details</h3>
              <button 
                className="opm-er-modal-close"
                onClick={() => setShowModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="opm-er-modal-content">
              <div className="opm-er-modal-section">
                <h4>Equipment Information</h4>
                <p><strong>Item:</strong> {selectedRental.equipment?.item || "N/A"}</p>
                <p><strong>Serial Number:</strong> {selectedRental.equipment?.serialNo || "N/A"}</p>
                <p><strong>Quantity:</strong> {selectedRental.quantity}</p>
                <p><strong>Price per Unit:</strong> {formatCurrency(selectedRental.equipment?.price || 0)}</p>
                <p><strong>Total Price:</strong> {formatCurrency(selectedRental.fullPrice)}</p>
              </div>
              
              <div className="opm-er-modal-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedRental.user?.name || selectedRental.user?.username || "Unknown"}</p>
                <p><strong>Email:</strong> {selectedRental.user?.email || "N/A"}</p>
              </div>
              
              <div className="opm-er-modal-section">
                <h4>Rental Schedule</h4>
                <p><strong>Date:</strong> {formatDate(selectedRental.rentDate)}</p>
                <p><strong>Start Time:</strong> {formatTime(selectedRental.startTime)}</p>
                <p><strong>End Time:</strong> {formatTime(selectedRental.endTime)}</p>
                <p><strong>Status:</strong> 
                  <span className={`opm-er-badge ${getStatusBadgeClass(selectedRental.status)}`}>
                    {selectedRental.status}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="opm-er-modal-footer">
              <button 
                className="opm-er-btn opm-er-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default OPMEquipmentRentals;