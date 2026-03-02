import React, { useState, useEffect } from "react";
import "./styles/myRentals.css";
import PlayerSidebar from "./PlayerSidebar ";
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('http://localhost:8080/api/player/get-my-rentals', {
        withCredentials: true
      });

      if (response.status === 200) {
        setRentals(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching rentals:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          navigate('/log');
        } else if (err.response.status === 404) {
          setRentals([]); // No rentals found, show empty state
        } else if (err.response.status === 500) {
          toast.error('Internal server error!', { autoClose: 1500 });
        } else {
          setError(err.response.data.message || 'Failed to fetch rentals');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'p-mr-player-status-active';
      case 'upcoming':
        return 'p-mr-player-status-upcoming';
      case 'completed':
        return 'p-mr-player-status-completed';
      case 'cancelled':
        return 'p-mr-player-status-cancelled';
      default:
        return 'p-mr-player-status-upcoming';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Upcoming';
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInHours = (end - start) / (1000 * 60 * 60);
    return Math.round(diffInHours);
  };

  const handleCancelRental = async (rentalId) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/player/cancel-rental/${rentalId}`, {}, {
        withCredentials: true
      });

      if (response.status === 200) {
        toast.success('Rental cancelled successfully!', { autoClose: 1500 });
        // Refresh the rentals list
        fetchRentals();
      }
    } catch (err) {
      console.error('Error cancelling rental:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          navigate('/log');
        } else if (err.response.status === 400) {
          toast.error(err.response.data.message, { autoClose: 2000 });
        } else if (err.response.status === 404) {
          toast.error('Rental not found!', { autoClose: 1500 });
        } else if (err.response.status === 500) {
          toast.error('Internal server error!', { autoClose: 1500 });
        } else {
          toast.error('Failed to cancel rental!', { autoClose: 1500 });
        }
      } else {
        toast.error('Network error. Please check your connection.', { autoClose: 1500 });
      }
    }
  };

  if (loading) {
    return (
      <div className="p-mr-player-container">
        <PlayerSidebar/>
        <div className="p-mr-player-main-content">
          <div className="p-mr-player-page-header">
            <h1 className="p-mr-player-page-title">My Equipment Rentals</h1>
            <Link to='/player-equipment-rental' className="p-mr-new-rental-btn">+ New rental</Link>
          </div>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div>Loading rentals...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-mr-player-container">
        <PlayerSidebar/>
        <div className="p-mr-player-main-content">
          <div className="p-mr-player-page-header">
            <h1 className="p-mr-player-page-title">My Equipment Rentals</h1>
            <Link to='/player-equipment-rental' className="p-mr-new-rental-btn">+ New rental</Link>
          </div>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ color: 'red' }}>Error: {error}</div>
            <button onClick={fetchRentals} style={{ marginTop: '10px', padding: '10px 20px' }}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-mr-player-container">
      {/* Sidebar */}
     <PlayerSidebar/>
     <ToastContainer />

      {/* Main Content */}
      <div className="p-mr-player-main-content">
        <div className="p-mr-player-page-header">
          <h1 className="p-mr-player-page-title">My Equipment Rentals</h1>
          <Link to='/player-equipment-rental' className="p-mr-new-rental-btn">+ New rental</Link>
        </div>

        {/* Rentals Grid */}
        <div className="p-mr-player-rentals-grid">
          {rentals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', gridColumn: '1 / -1' }}>
              <h3>No rentals found</h3>
              <p>You haven't rented any equipment yet.</p>
              <Link to='/player-equipment-rental' className="p-mr-new-rental-btn" style={{ marginTop: '20px' }}>
                + Rent Equipment
              </Link>
            </div>
          ) : (
            rentals.map((rental) => (
              <div key={rental._id} className="p-mr-player-rental-card">
                <div className="p-mr-player-rental-image">
                  <img
                    src={`/uploads/${rental.equipment?.image}`}
                    alt={rental.equipment?.item || "Equipment"}
                  />
                  <div className={`p-mr-player-rental-status ${getStatusClass(rental.status)}`}>
                    {getStatusText(rental.status)}
                  </div>
                </div>
                <div className="p-mr-player-rental-content">
                  <div className="p-mr-player-rental-header">
                    <div>
                      <h3 className="p-mr-player-rental-title">
                        {rental.equipment?.item || "Unknown Equipment"}
                      </h3>
                      <div className="p-mr-player-rental-price">
                        LKR {rental.equipment?.price || 0} / hour
                      </div>
                    </div>
                  </div>
                  <div className="p-mr-player-rental-details">
                    <div className="p-mr-player-rental-detail">
                      <i className="fas fa-cube"></i>
                      <span>Quantity: {rental.quantity}</span>
                    </div>
                    <div className="p-mr-player-rental-detail">
                      <i className="fas fa-calendar-day"></i>
                      <span>Rent Date: {formatDate(rental.rentDate)}</span>
                    </div>
                    <div className="p-mr-player-rental-detail">
                      <i className="fas fa-clock"></i>
                      <span>
                        Time: {formatTime(rental.startTime)} - {formatTime(rental.endTime)} 
                        ({calculateDuration(rental.startTime, rental.endTime)} hours)
                      </span>
                    </div>
                    <div className="p-mr-player-rental-detail">
                      <i className="fas fa-dollar-sign"></i>
                      <span>Total: LKR {rental.fullPrice}</span>
                    </div>
                  </div>
                  <div className="p-mr-player-rental-actions">
                    {rental.status === 'completed' ? (
                      <button className="p-mr-player-action-btn p-mr-player-extend-btn" style={{ flex: 1 }}>
                        <i className="fas fa-redo"></i> Rent Again
                      </button>
                    ) : rental.status === 'cancelled' ? (
                      <button className="p-mr-player-action-btn p-mr-player-extend-btn" style={{ flex: 1 }}>
                        <i className="fas fa-redo"></i> Rent Again
                      </button>
                    ) : rental.status === 'active' ? (
                      <button className="p-mr-player-action-btn p-mr-player-extend-btn" style={{ flex: 1 }}>
                        <i className="fas fa-eye"></i> View Details
                      </button>
                    ) : (
                      <>
                        
                        <button 
                          className="p-mr-player-action-btn p-mr-player-cancel-btn"
                          onClick={() => handleCancelRental(rental._id)}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      </>
                    )}
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

export default MyRentals;
